# Cleara on GenLayer

> **Proof-Native Multichain Financial Coordination & Bilateral Settlement**  
> *"Clear first. Move only what remains."*

[![Foundry Verification](https://img.shields.io/badge/Foundry-100%25%20Verified-brightgreen)](#canonical-verification)
[![GenLayer Studio Next](https://img.shields.io/badge/GenLayer-Chain%2061997-blue)](https://studio-next.genlayer.com)
[![Ethereum Sepolia](https://img.shields.io/badge/Ethereum-Sepolia%2011155111-purple)](https://sepolia.etherscan.io)
[![Base Sepolia](https://img.shields.io/badge/Base-Sepolia%2084532-blue)](https://sepolia.basescan.org)
[![BUILD_FOUNDRY](https://img.shields.io/badge/Standard-BUILD__FOUNDRY%20v1.0-orange)](BUILD_FOUNDRY.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 1. Overview

**Cleara** separates the **adjudication of financial relationships** from the **physical movement of collateral**.

In traditional multichain finance, institutions and users move gross capital across third-party bridges, exposing liquidity to bridge exploits ($3B+ lost historically), high latency, and cross-chain execution risks. Furthermore, standard deterministic EVM smart contracts cannot evaluate natural-language commercial terms (reciprocal netting agreements, milestone terms, performance offsets), forcing participants back into centralized clearinghouses.

Cleara solves this by leveraging **GenLayer's Optimistic Democracy** as an on-chain semantic interpretation and coordination engine:
* **GenLayer Studio Next (`61997`)** serves as the canonical coordination and AI adjudication layer.
* **Ethereum Sepolia (`11155111`)** and **Base Sepolia (`84532`)** host sovereign native execution vaults (`ClearaVault.sol`).

Cross-chain source deposits are verified byte-for-byte by consensus validators via `strict_eq`. Reciprocal obligations are evaluated on-chain via multi-validator AI consensus. Cleara nets reciprocal obligations ($Gross \rightarrow Net$) and issues a tamper-proof Settlement Certificate. Sovereign native vaults release only the net residual and refund cleared collateral locally. **Zero gross liquidity crosses a bridge.**

```text
EVM Source Deposits (Sepolia + Base Sepolia)
                 ↓
GenLayer multi-validator receipt verification (strict_eq)
                 ↓
GenLayer comparative AI adjudication (run_nondet)
                 ↓
Tamper-Proof Settlement Certificate
                 ↓
Native Vault Unlock & Local Refunds (ClearaVault.sol)
```

---

## 2. Verified Deployed Infrastructure

All contracts are live on testnet and backed by immutable blockchain receipts:

| Layer / Role | Network | Contract Address | Deployment Evidence | Status |
|---|---|---|---|---|
| **Cleara Coordinator** | **GenLayer Studio Next** (`61997`) | [`0x17c33C39f7998A7ed56D5C58f7D3d29E29444D55`](foundry/evidence/deployed.json) | Tx: [`0x85b854a7...`](foundry/evidence/deployed.json)<br/>Receipt Status: `7` (`ACCEPTED/FINALIZED`), `FINISHED_WITH_RETURN`<br/>Runner: `py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng` | **LIVE** |
| **Execution Vault** | **Ethereum Sepolia** (`11155111`) | [`0x277341fc7c2481606ac69922a35b42344be5ec6f`](foundry/evidence/endpoints.json) | Tx: `0x47a53304...`<br/>Block `0xb2cd79`, 5,191 bytes runtime bytecode | **LIVE** |
| **Execution Vault** | **Base Sepolia** (`84532`) | [`0xe2b01f99107a6ad24a6bdd8e34f7e864434c69ad`](foundry/evidence/endpoints.json) | Tx: `0xf7f1fcad...`<br/>Block `0x2cbb524`, 5,191 bytes runtime bytecode | **LIVE** |

---

## 3. The Three Settlement Modes

Cleara supports three distinct settlement execution paths:

### Mode 1 — Bilateral Reciprocal Netting ($Gross \rightarrow Net$)
* **Scenario:** Alice owes Bob 0.001 ETH on Sepolia; Bob owes Alice 0.0006 ETH on Base Sepolia.
* **Execution:**
  1. Both parties lock collateral in their local `ClearaVault`.
  2. GenLayer proves both source events via `strict_eq` RPC verification.
  3. GenLayer evaluates terms and reciprocal relationship via AI consensus.
  4. GenLayer calculates net residual: $0.001 - 0.0006 = 0.0004\text{ ETH}$.
  5. Sepolia Vault unlocks 0.0004 ETH to Bob and refunds 0.0006 ETH to Alice locally.
* **Result:** Zero gross liquidity crosses bridges; 60% of capital cleared locally.

### Mode 2 — Facility / LP Fronting & Collateral Claim
* **Scenario:** An urgent obligation requires instant payout on the destination rail before cross-chain reconciliation.
* **Execution:**
  1. Alice locks collateral in `ClearaVault` on Chain A.
  2. A Liquidity Provider (LP) registered in `ClearaFacilityManager` fronts immediate funds locally on Chain B.
  3. GenLayer verifies fulfillment and issues a Settlement Certificate.
  4. LP claims the locked collateral on Chain A using the certificate.
* **Result:** Instant zero-latency cross-chain settlement backed by on-chain credit facilities.

### Mode 3 — Residual Bridge Routing
* **Scenario:** An unnetted residual obligation must be physically moved between chains.
* **Execution:**
  1. Vault interfaces with canonical native bridge infrastructure (e.g. OP Standard Bridge).
  2. Funds route securely without third-party wrapped asset risks.
* **Result:** Pluggable bridge adapter fallback for net residuals only.

---

## 4. Equivalence Principle Design

Cleara enforces strict separation between deterministic facts and semantic financial judgment:

```
Can validators reproduce the exact same normalized output?
├── YES → strict_eq
│         Direct blockchain RPC calls (eth_getTransactionReceipt & eth_getTransactionByHash)
│         Normalized JSON fields (from, to, blockNumber, value_atto) must match byte-for-byte.
│
└── NO  → run_nondet (Custom Validator)
          Semantic financial adjudication of contractual terms via AI prompt.
          Validators independently fetch evidence, re-execute the prompt,
          and assert matching normalized decisions and hard reciprocity invariants.
```

1. **Deterministic Facts (`strict_eq`):** Multi-validator receipt verification ensures deposit transactions, block numbers, sender addresses, and value transferred are identical across all committee validators.
2. **Semantic Financial Judgment (`run_nondet`):** Optimistic Democracy evaluates relationship compatibility, asset matching, and validity of chain routes. Hard invariants (`reciprocal = a.party_a == b.party_b and a.party_b == b.party_a`) remain deterministic and cannot be overridden by AI.

---

## 5. Canonical Verification

The repository enforces the **BUILD_FOUNDRY.md v1.0** standard. To run the automated verification suite:

```bash
# Clone the repository
git clone https://github.com/etvjay/ClearaOnGen.git
cd ClearaOnGen

# Run the canonical verification suite
./scripts/verify
```

### Verification Pipeline:
1. **EVM Vault Test Suite (`forge test -vv`):** 7/7 passing unit tests covering all 3 settlement modes, balance locking, facility registry, and relayer access control.
2. **GenLayer Coordinator Syntax (`python3 -m py_compile`):** Validates the Python intelligent contract.
3. **Control Plane Integrity (`node scripts/check-foundry`):** Validates that all claims in `foundry/claims.jsonl` are backed by genuine evidence files and that `foundry/gaps.jsonl` has zero unresolved critical gaps.

---

## 6. Live Multichain Proving Evidence

The entire multichain lifecycle has been executed on live testnets and recorded in [`foundry/evidence/live-lifecycle.log`](foundry/evidence/live-lifecycle.log):

* **GenLayer Obligation 1 (`obl-1`):** Tx `0xe80ec8ca...` (status 5, `FINISHED_WITH_RETURN`)
* **GenLayer Obligation 2 (`obl-2`):** Tx `0x22d76a53...` (status 5, `FINISHED_WITH_RETURN`)
* **Multi-Validator `strict_eq` Verification:**
  * Sepolia deposit verified: Tx `0xd8005517...` (status 5, `FINISHED_WITH_RETURN`)
  * Base Sepolia deposit verified: Tx `0x924c1daad...` (status 5, `FINISHED_WITH_RETURN`)
  * Obligations marked `VERIFIED` by consensus.
* **Native EVM Vault Unlock:**
  * **Sepolia Unlock Tx:** [`0xee575bb6e1d5ebadc4aa4670e973b80ab9d39257a5e93d4fdbd22cabce5ceeae`](https://sepolia.etherscan.io/tx/0xee575bb6e1d5ebadc4aa4670e973b80ab9d39257a5e93d4fdbd22cabce5ceeae)
  * **Sepolia Block:** `11723739`
  * **Receipt Status:** `success`
  * **Final Sepolia Vault Deposit State:** `3` (`SETTLED`)

---

## 7. Repository Layout

```text
.
├── BUILD_FOUNDRY.md          # Canonical engineering governance standard
├── SUBMISSION.md             # Complete Hackathon Submission Package
├── PRD.md                    # Product Requirements Document
├── ARCHITECTURE.md           # Topology and sequence diagrams
├── AGENTS.md                 # Contributor and agent instructions
├── DEMO.md                   # Live demonstration walkthrough
│
├── contracts/
│   ├── cleara_coordinator.py # GenLayer Intelligent Contract (Studio Next 61997)
│   ├── ClearaVault.sol       # Sovereign native settlement vault (Sepolia & Base Sepolia)
│   ├── ClearaFacilityManager.sol # LP credit & facility registry
│   ├── MockBridgeAdapter.sol # Pluggable bridge routing adapter for residual settlement
│   └── interfaces/           # Solidity interfaces
│
├── foundry/                  # Control plane under BUILD_FOUNDRY.md
│   ├── state.json            # Machine-readable project state (E2E_VERIFIED)
│   ├── claims.jsonl          # Evidence-backed claim ledger (7 claims admitted)
│   ├── gaps.jsonl            # Gap closure ledger (0 open critical gaps)
│   ├── assumptions.md        # Technical assumptions ledger
│   ├── contradictions.md     # Resolved contradictions ledger
│   ├── phases/               # Phase specifications (00 through 04)
│   ├── decisions/            # Architecture Decision Records (ADRs)
│   └── evidence/             # Verified receipts, logs, and endpoints
│
├── test/
│   └── ClearaVault.t.sol     # 7/7 passing Foundry test suite
│
└── scripts/
    ├── check-foundry         # Control plane integrity validator
    ├── verify                # Unified verification runner
    ├── deploy_studio_next.mjs# Studio Next contract deployer
    └── live_prove.mjs        # Multichain live proving harness
```

---

## 8. License

Distributed under the MIT License. See `LICENSE` for details.
