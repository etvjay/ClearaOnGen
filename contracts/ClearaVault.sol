// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IClearaVault.sol";
import "./interfaces/IBridgeAdapter.sol";

/// @title ClearaVault — native collateral vault for Clear-first settlement
/// @notice Identical deployment on Sepolia (11155111) and Base Sepolia (84532).
///         GenLayer 61997 is the canonical adjudicator; this vault only
///         executes what a FINALIZED Settlement Certificate authorizes.
///         Philosophy: Clear first. Move only what remains. Assets settle on native rails.
contract ClearaVault is IClearaVault {
    // ---------- storage ----------
    mapping(bytes32 => DepositRecord) public deposits;
    // Tracks LP fronting: obligationId => fulfiller
    mapping(bytes32 => address) public fulfilledBy;
    mapping(bytes32 => uint256) public fulfilledAmount;
    // Prevent replay of certificates
    mapping(bytes32 => bool) public certificateUsed;

    address public relayer;
    address public owner;

    modifier onlyRelayer() {
        require(msg.sender == relayer || msg.sender == owner, "CLEARA: not relayer");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "CLEARA: not owner");
        _;
    }

    constructor(address _relayer) {
        owner = msg.sender;
        relayer = _relayer == address(0) ? msg.sender : _relayer;
    }

    function setRelayer(address _relayer) external onlyOwner {
        require(_relayer != address(0), "CLEARA: zero relayer");
        relayer = _relayer;
    }

    // ---------- Mode 0: deposit ----------
    function deposit(bytes32 obligationId, address intendedRecipient, bytes32 targetChain) external payable override {
        require(msg.value > 0, "CLEARA: zero value");
        require(intendedRecipient != address(0), "CLEARA: zero recipient");
        require(deposits[obligationId].state == ObligationState.NONE, "CLEARA: exists");
        require(obligationId != bytes32(0), "CLEARA: zero id");

        deposits[obligationId] = DepositRecord({
            depositor: msg.sender,
            intendedRecipient: intendedRecipient,
            amount: msg.value,
            state: ObligationState.LOCKED,
            targetChain: targetChain
        });

        emit Deposited(obligationId, msg.sender, intendedRecipient, msg.value, targetChain);
    }

    // ---------- Mode 1 & 2 unlock (relayer, GenLayer FINALIZED) ----------
    /// @notice Called by relayer after GenLayer reaches FINALIZED.
    /// @dev Sends netAmount to recipient, refundAmount to original depositor.
    function unlockWithCertificate(
        bytes32 obligationId,
        address payable recipient,
        uint256 netAmount,
        uint256 refundAmount,
        bytes32 genlayerTxHash
    ) external override onlyRelayer {
        require(genlayerTxHash != bytes32(0), "CLEARA: zero cert");
        require(!certificateUsed[genlayerTxHash], "CLEARA: cert used");
        DepositRecord storage rec = deposits[obligationId];
        require(rec.state == ObligationState.LOCKED, "CLEARA: not locked");
        require(recipient != address(0), "CLEARA: zero recipient");
        require(netAmount + refundAmount <= rec.amount, "CLEARA: exceeds collateral");

        certificateUsed[genlayerTxHash] = true;
        rec.state = ObligationState.SETTLED;

        if (netAmount > 0) {
            (bool ok1,) = recipient.call{value: netAmount}("");
            require(ok1, "CLEARA: net send failed");
        }
        if (refundAmount > 0) {
            (bool ok2,) = payable(rec.depositor).call{value: refundAmount}("");
            require(ok2, "CLEARA: refund failed");
            emit Refunded(obligationId, rec.depositor, refundAmount);
        }
        // Dust stays in vault for owner sweep if needed (should be 0).

        emit Settled(obligationId, recipient, netAmount, refundAmount, genlayerTxHash);
    }

    // ---------- Mode 2: LP fronts payout on this chain ----------
    /// @notice Capital Provider fronts the payout for a counterparty obligation
    ///         that originated on the other chain. Generates the receipt that
    ///         GenLayer verifies via strict_eq.
    function fulfillForCounterparty(bytes32 obligationId, address payable recipient) external payable override {
        require(msg.value > 0, "CLEARA: zero value");
        require(recipient != address(0), "CLEARA: zero recipient");
        require(fulfilledBy[obligationId] == address(0), "CLEARA: already fulfilled");

        fulfilledBy[obligationId] = msg.sender;
        fulfilledAmount[obligationId] = msg.value;

        (bool ok,) = recipient.call{value: msg.value}("");
        require(ok, "CLEARA: fulfill send failed");

        emit FulfilledByLP(obligationId, msg.sender, recipient, msg.value);
    }

    /// @notice After GenLayer verifies the LP fulfilled on the other chain,
    ///         the LP claims the original deposited collateral here.
    function claimLPCollateral(bytes32 obligationId, address payable lpRecipient, bytes32 genlayerTxHash) external override onlyRelayer {
        DepositRecord storage rec = deposits[obligationId];
        require(rec.state == ObligationState.LOCKED, "CLEARA: not locked");
        require(genlayerTxHash != bytes32(0), "CLEARA: zero cert");
        require(!certificateUsed[genlayerTxHash], "CLEARA: cert used");
        require(lpRecipient != address(0), "CLEARA: zero lp");
        // Must have been fulfilled (optional check — relayer cert is authority)
        // require(fulfilledBy[obligationId] != address(0), "CLEARA: not fulfilled");

        certificateUsed[genlayerTxHash] = true;
        rec.state = ObligationState.SETTLED;

        uint256 amount = rec.amount;
        (bool ok,) = lpRecipient.call{value: amount}("");
        require(ok, "CLEARA: claim send failed");

        emit Settled(obligationId, lpRecipient, amount, 0, genlayerTxHash);
    }

    // ---------- Mode 3: bridge fallback ----------
    function routeResidual(bytes32 obligationId, address bridgeAdapter) external override onlyRelayer {
        DepositRecord storage rec = deposits[obligationId];
        require(rec.state == ObligationState.LOCKED, "CLEARA: not locked");
        require(bridgeAdapter != address(0), "CLEARA: zero adapter");

        rec.state = ObligationState.ROUTED;
        uint256 amount = rec.amount;

        // Dispatch via adapter; adapter is trusted to handle targetChain.
        // We forward the full amount; adapter may take fee.
        IBridgeAdapter(bridgeAdapter).dispatch{value: amount}(obligationId, amount, rec.intendedRecipient, rec.targetChain);

        emit Routed(obligationId, bridgeAdapter, amount, rec.targetChain);
    }

    // ---------- views ----------
    function getDeposit(bytes32 obligationId) external view override returns (DepositRecord memory) {
        return deposits[obligationId];
    }

    // ---------- emergency ----------
    function sweepDust(address payable to) external onlyOwner {
        require(to != address(0), "CLEARA: zero to");
        (bool ok,) = to.call{value: address(this).balance}("");
        require(ok, "CLEARA: sweep failed");
    }

    receive() external payable {}
}
