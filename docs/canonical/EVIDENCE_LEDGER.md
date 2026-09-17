# Evidence Ledger — Cleara on GenLayer

Every public claim in the repository is mapped here to canonical, reproducible on-chain or local evidence.

---

## Claim Evidence Mapping

| Claim ID | Claim Summary | Required State | Actual State | Canonical Evidence |
|---|---|---|---|---|
| **CLM-001** | GenLayer Coordinator Deployed on Studio Next | `LIVE` | `LIVE` | [`foundry/evidence/deployed.json`](../../foundry/evidence/deployed.json) |
| **CLM-002** | Ethereum Sepolia Vault Deployed & Locked | `LIVE` | `LIVE` | [`foundry/evidence/endpoints.json`](../../foundry/evidence/endpoints.json) |
| **CLM-003** | Base Sepolia Vault Deployed & Locked | `LIVE` | `LIVE` | [`foundry/evidence/endpoints.json`](../../foundry/evidence/endpoints.json) |
| **CLM-004** | EVM Vaults Test Suite Passes 100% | `TESTED` | `TESTED` | [`foundry/evidence/forge-test.log`](../../foundry/evidence/forge-test.log) |
| **CLM-005** | Equivalence Principle Architecture Enforced | `IMPLEMENTED` | `IMPLEMENTED` | [`contracts/cleara_coordinator.py`](../../contracts/cleara_coordinator.py) |
| **CLM-006** | 8 Functional Coordinator Entrypoints | `LIVE` | `LIVE` | [`foundry/evidence/deployed.json`](../../foundry/evidence/deployed.json) |

---

## On-Chain Transaction Manifests

* **GenLayer Studio Next:**
  * Contract: `0x17c33C39f7998A7ed56D5C58f7D3d29E29444D55`
  * Deploy Tx: `0x85b854a7833a9ce927f504b257e2ddb68e68cac66d09a5beef40a9d399b3fbf2`
  * Consensus Status: `7` (`ACCEPTED/FINALIZED`)
  * Execution: `FINISHED_WITH_RETURN`
* **Ethereum Sepolia:**
  * Vault: `0x277341fc7c2481606ac69922a35b42344be5ec6f`
  * Deploy Tx: `0x47a53304df36a76f3920d7a587f8d11d2b4525481b9be49d76e1a84c3112f8c5`
  * Deposit Tx: `0x933da158c33d710ce151a318c3736ca33814dc2fbfc9d812fc02f75c093fe278`
* **Base Sepolia:**
  * Vault: `0xe2b01f99107a6ad24a6bdd8e34f7e864434c69ad`
  * Deploy Tx: `0xf7f1fcad2858142c8b9e56b4eba17acc75e5bed541c953ec544a29c8d315fec7`
  * Deposit Tx: `0xbdd8b9bbd63c4b0d0a3f586469d5a87ae084606b1b9cef67d67a079a09560dea`
