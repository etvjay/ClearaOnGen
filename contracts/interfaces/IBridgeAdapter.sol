// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IBridgeAdapter {
    function dispatch(bytes32 obligationId, uint256 amount, address recipient, bytes32 targetChain) external payable;
    function estimateFee(bytes32 targetChain) external view returns (uint256);
}
