# Phase 03 — EVM Settlement Vaults: Sepolia & Base Sepolia

STATUS: PASS  
OWNER: Protocol Engineer  

## Objective
Implement native collateral vaults in Solidity for Ethereum Sepolia (11155111) and Base Sepolia (84532), ensuring deterministic balance locking, netting unlocks, LP fronting, and bridge routing.

## Deliverables
* [`contracts/ClearaVault.sol`](file:///home/ubuntu/ClearaOnGen/contracts/ClearaVault.sol)
* [`contracts/ClearaFacilityManager.sol`](file:///home/ubuntu/ClearaOnGen/contracts/ClearaFacilityManager.sol)
* [`contracts/MockBridgeAdapter.sol`](file:///home/ubuntu/ClearaOnGen/contracts/MockBridgeAdapter.sol)
* [`test/ClearaVault.t.sol`](file:///home/ubuntu/ClearaOnGen/test/ClearaVault.t.sol)

## Verification
* Test Suite: `forge test -vv`
* Results: 14 passed, 0 failed, 0 skipped.
  * `test_ClaimLPCollateral_Mode2`: PASS
  * `test_DepositLocks`: PASS
  * `test_FacilityManager`: PASS
  * `test_FacilityManager_WithdrawCollateral`: PASS
  * `test_FulfillByLP_Mode2`: PASS
  * `test_MockBridgeAdapter_AccessControl`: PASS
  * `test_Mode1_BilateralNetting_EndToEnd`: PASS
  * `test_Mode2_FacilityLPFronting_EndToEnd`: PASS
  * `test_Mode3_ResidualBridgeRouting_EndToEnd`: PASS
  * `test_Revert_OnlyRelayer`: PASS
  * `test_RouteResidual_Mode3`: PASS
  * `test_SweepDust_ProtectsLockedCollateral`: PASS
  * `test_UnlockWithCertificate_Mode1_Netting`: PASS
  * `test_Vault_TransferOwnership`: PASS

## Deployed Addresses
* Ethereum Sepolia Vault: `0x277341fc7c2481606ac69922a35b42344be5ec6f`
* Base Sepolia Vault: `0xe2b01f99107a6ad24a6bdd8e34f7e864434c69ad`

## Exit Gate
* [x] Solc 0.8.20 compilation clean with 0 warnings.
* [x] 100% Forge test suite pass rate.
* [x] Verified deployed bytecode and locked deposits on both chains.
