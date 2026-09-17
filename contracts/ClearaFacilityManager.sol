// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ClearaFacilityManager — registry for Capital Providers (LPs)
/// @notice Minimal for demo — tracks LP whitelisting and per-obligation credit lines.
///         Vault does not depend on it for core flow; it is the coordination view.
contract ClearaFacilityManager {
    address public owner;
    mapping(address => bool) public isLP;
    mapping(address => uint256) public lpCollateral; // optional accounting
    mapping(bytes32 => address) public lpForObligation;

    event LPRegistered(address indexed lp);
    event LPRevoked(address indexed lp);
    event LPCollateralAdded(address indexed lp, uint256 amount);
    event FacilityAssigned(bytes32 indexed obligationId, address indexed lp);

    modifier onlyOwner() {
        require(msg.sender == owner, "FACILITY: not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerLP(address lp) external onlyOwner {
        require(lp != address(0), "FACILITY: zero lp");
        isLP[lp] = true;
        emit LPRegistered(lp);
    }

    function revokeLP(address lp) external onlyOwner {
        isLP[lp] = false;
        emit LPRevoked(lp);
    }

    function addCollateral() external payable {
        require(isLP[msg.sender] || msg.sender == owner, "FACILITY: not lp");
        lpCollateral[msg.sender] += msg.value;
        emit LPCollateralAdded(msg.sender, msg.value);
    }

    event LPCollateralWithdrawn(address indexed lp, uint256 amount);

    function withdrawCollateral(uint256 amount) external {
        require(lpCollateral[msg.sender] >= amount, "FACILITY: insufficient collateral");
        lpCollateral[msg.sender] -= amount;
        (bool ok,) = msg.sender.call{value: amount}("");
        require(ok, "FACILITY: withdraw failed");
        emit LPCollateralWithdrawn(msg.sender, amount);
    }

    function assignFacility(bytes32 obligationId, address lp) external onlyOwner {
        require(isLP[lp], "FACILITY: not lp");
        lpForObligation[obligationId] = lp;
        emit FacilityAssigned(obligationId, lp);
    }

    function getLP(bytes32 obligationId) external view returns (address) {
        return lpForObligation[obligationId];
    }

    receive() external payable {}
}
