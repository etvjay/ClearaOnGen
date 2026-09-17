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
| **CLM-005** | Equivalence Principle Architecture Enforced | `LIVE` | `LIVE` | [`contracts/cleara_coordinator.py`](../../contracts/cleara_coordinator.py), [`foundry/evidence/live-lifecycle.log`](../../foundry/evidence/live-lifecycle.log) |
| **CLM-006** | 8 Functional Coordinator Entrypoints | `LIVE` | `LIVE` | [`foundry/evidence/deployed.json`](../../foundry/evidence/deployed.json) |
| **CLM-007** | Multichain Live Proving & Mode 1 Unlock | `LIVE` | `LIVE` | [`foundry/evidence/live-lifecycle.log`](../../foundry/evidence/live-lifecycle.log) |

---

## On-Chain Transaction Manifests

* **GenLayer Studio Next:**
  * Contract: `0xF75595614305B537eA8bfD5fF3C53d074192eB2F`
  * Deploy Tx: `0xfb031403168a89a5acf5ce07ad7cbb1a0bd61f7706e283cc95961b5c3973e2ee`
  * Consensus Status: `5` (`ACCEPTED/FINALIZED`), `FINISHED_WITH_RETURN`
  * Obligation 1 Tx: `0x3ceb35c7235e543173d6bcc403761c8657d8602e2e132b2f849694c1cf7adec3`
  * Obligation 2 Tx: `0x2bfdd2a4882c0f54d3820a0ae6bfdaea4c38d9b83c11bc51c472cf94a5a333de`
  * Dual-chain `strict_eq` Verifications: `0xd65370cb...`, `0xfceab825...`, `0x29b59e1d...`, `0xd8972223...`
  * **AI Adjudication Tx (`run_nondet`):** [`0x6b8d351170b8f127df9f0fe89b11aece834780bc4db2b1e879bc209b7d125e6b`](foundry/evidence/live-lifecycle.log) (`FINISHED_WITH_RETURN`, Net: `0.0004 ETH`, Direction: `A_OWES_B`)
* **Ethereum Sepolia:**
  * Vault: `0x277341fc7c2481606ac69922a35b42344be5ec6f`
  * Deploy Tx: `0x47a53304df36a76f3920d7a587f8d11d2b4525481b9be49d76e1a84c3112f8c5`
  * Deposit Tx: `0x810cbd330f707d0a2a0741471a936ad5a403da6d62cf04e51459356633263557` (Block `11723820`)
  * **Unlock Tx (Mode 1 Netting):** [`0xd2d14af06b39f8ab9940c86507032b7f2412af9e96fb018d2aaff6acba59632b`](https://sepolia.etherscan.io/tx/0xd2d14af06b39f8ab9940c86507032b7f2412af9e96fb018d2aaff6acba59632b) (Block `11723829`, Status: `success`, State: `3=SETTLED`)
* **Base Sepolia:**
  * Vault: `0xe2b01f99107a6ad24a6bdd8e34f7e864434c69ad`
  * Deploy Tx: `0xf7f1fcad2858142c8b9e56b4eba17acc75e5bed541c953ec544a29c8d315fec7`
  * Deposit Tx: `0xbdd8b9bbd63c4b0d0a3f586469d5a87ae084606b1b9cef67d67a079a09560dea`
