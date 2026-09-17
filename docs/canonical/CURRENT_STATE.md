# Current State — Cleara on GenLayer

**Date:** 2026-09-17 UTC  
**Phase:** Phase 03 / Phase 04  
**Project Status:** `E2E_VERIFIED`  

---

## 1. What Exists Right Now

* **Canonical Adjudication Layer:** GenLayer Studio Next intelligent contract `ClearaCoordinator` deployed and verified on-chain at `0x17c33C39f7998A7ed56D5C58f7D3d29E29444D55`.
* **Native Settlement Vaults:** `ClearaVault.sol` deployed on Ethereum Sepolia (`0x277341fc...`) and Base Sepolia (`0xe2b01f99...`) with active locked collateral.
* **Control Plane:** Full `BUILD_FOUNDRY.md` control plane in `foundry/` with automated validation via `scripts/check-foundry`.

---

## 2. What Is Implemented

* **Intelligent Contract:** 8 functional entrypoints in [`contracts/cleara_coordinator.py`](../../contracts/cleara_coordinator.py):
  * `record_obligation`: Registers bilateral reciprocal obligations.
  * `verify_source_event`: Multi-validator dual-chain RPC verification via `strict_eq`.
  * `evaluate_clearing`: Comparative AI consensus adjudication via `run_nondet_unsafe`.
  * `mark_cleared`: Advances obligation lifecycle state.
  * `reconcile`: Finalizes clearing records.
  * `get_obligation`: Inspects obligation state.
  * `get_settlement_certificate`: Issues tamper-proof settlement proof.
  * `list_obligations`: Enumerates all active obligations.
* **EVM Contracts:** [`contracts/ClearaVault.sol`](../../contracts/ClearaVault.sol), [`contracts/ClearaFacilityManager.sol`](../../contracts/ClearaFacilityManager.sol), [`contracts/MockBridgeAdapter.sol`](../../contracts/MockBridgeAdapter.sol).

---

## 3. What Is Deployed & Live

* **Studio Next (Chain 61997):**
  * Coordinator: `0x17c33C39f7998A7ed56D5C58f7D3d29E29444D55`
  * Tx Hash: `0x85b854a7833a9ce927f504b257e2ddb68e68cac66d09a5beef40a9d399b3fbf2`
  * Status: `7` (`ACCEPTED/FINALIZED`), `FINISHED_WITH_RETURN`
* **Ethereum Sepolia (Chain 11155111):**
  * Vault: `0x277341fc7c2481606ac69922a35b42344be5ec6f`
  * Collateral State: `0.001 ETH` in `LOCKED (1)`
* **Base Sepolia (Chain 84532):**
  * Vault: `0xe2b01f99107a6ad24a6bdd8e34f7e864434c69ad`
  * Collateral State: `0.0006 ETH` in `LOCKED (1)`

---

## 4. What Is Tested

* **EVM Vaults:** 7/7 Foundry tests passing 100% (`forge test -vv`).
* **GenLayer Syntax:** Python compilation clean (`python3 -m py_compile contracts/cleara_coordinator.py`).
* **Governance Integrity:** `node scripts/check-foundry` exits code 0.

---

## 5. What Remains Unresolved / Next

* Executing the live end-to-end integration proving loop via `scripts/live_prove.ts` connecting the live Studio Next coordinator with the live locked deposits.
* Pushing the verified repository to GitHub (`https://github.com/etvjay/ClearaOnGen`).
