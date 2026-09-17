// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IBridgeAdapter.sol";

interface IClearaVault {
    enum ObligationState { NONE, LOCKED, ROUTED, SETTLED, REFUNDED }

    struct DepositRecord {
        address depositor;
        address intendedRecipient;
        uint256 amount;
        ObligationState state;
        bytes32 targetChain;
    }

    event Deposited(bytes32 indexed obligationId, address indexed depositor, address indexed intendedRecipient, uint256 amount, bytes32 targetChain);
    event Settled(bytes32 indexed obligationId, address recipient, uint256 netAmount, uint256 refundAmount, bytes32 genlayerTxHash);
    event Routed(bytes32 indexed obligationId, address bridgeAdapter, uint256 amount, bytes32 targetChain);
    event Refunded(bytes32 indexed obligationId, address depositor, uint256 refundAmount);
    event FulfilledByLP(bytes32 indexed obligationId, address indexed lp, address recipient, uint256 amount);

    function deposit(bytes32 obligationId, address intendedRecipient, bytes32 targetChain) external payable;
    function unlockWithCertificate(bytes32 obligationId, address payable recipient, uint256 netAmount, uint256 refundAmount, bytes32 genlayerTxHash) external;
    function fulfillForCounterparty(bytes32 obligationId, address payable recipient) external payable;
    function claimLPCollateral(bytes32 obligationId, address payable lpRecipient, bytes32 genlayerTxHash) external;
    function routeResidual(bytes32 obligationId, address bridgeAdapter) external;
    function getDeposit(bytes32 obligationId) external view returns (DepositRecord memory);
}
