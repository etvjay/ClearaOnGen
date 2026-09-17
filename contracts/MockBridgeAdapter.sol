// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IBridgeAdapter.sol";

/// @title MockBridgeAdapter — test adapter for Mode 3 routing
/// @notice Emits event and holds funds; relayer can later verify destination receipt offchain.
contract MockBridgeAdapter is IBridgeAdapter {
    event Dispatched(bytes32 indexed obligationId, uint256 amount, address recipient, bytes32 targetChain);

    function dispatch(bytes32 obligationId, uint256 amount, address recipient, bytes32 targetChain) external payable override {
        require(msg.value == amount, "MOCK: value mismatch");
        emit Dispatched(obligationId, amount, recipient, targetChain);
    }

    function estimateFee(bytes32) external pure override returns (uint256) {
        return 0;
    }

    function withdraw(address payable to) external {
        (bool ok,) = to.call{value: address(this).balance}("");
        require(ok, "MOCK: withdraw failed");
    }

    receive() external payable {}
}
