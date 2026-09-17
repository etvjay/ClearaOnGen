# Cleara on GenLayer

> **Proof-Native Multichain Financial Coordination & Settlement**  
> *\"Clear first. Move only what remains.\"*

[![Foundry Verification](https://img.shields.io/badge/Foundry-100%25%20Verified-brightgreen)](#canonical-verification)
[![GenLayer Studio Next](https://img.shields.io/badge/GenLayer-Chain%2061997-blue)](https://studio-next.genlayer.com)
[![Ethereum Sepolia](https://img.shields.io/badge/Ethereum-Sepolia-purple)](https://sepolia.etherscan.io)
[![Base Sepolia](https://img.shields.io/badge/Base-Sepolia-blue)](https://sepolia.basescan.org)
[![BUILD_FOUNDRY](https://img.shields.io/badge/Standard-BUILD__FOUNDRY%20v1.0-orange)](BUILD_FOUNDRY.md)

---

## 1. Overview

Cleara separates the **adjudication of financial relationships** from the **physical movement of collateral**.

Instead of routing gross multichain volume across risky third-party bridges, Cleara uses **GenLayer's Optimistic Democracy** as an on-chain interpretation engine to adjudicate bilateral obligations, verify cross-chain source receipts via `strict_eq`, compute net balances on-chain, and release funds natively via EVM execution vaults.

```text
EVM Source Deposits (Sepolia + Base Sepolia)
                 ↓
GenLayer multi-validator receipt verification (strict_eq)
                 ↓
GenLayer comparative AI adjudication (run_nondet_unsafe)
                 ↓
Tamper-Proof Settlement Certificate
                 ↓
Native Vault Unlock & Local Refunds (ClearaVault.sol)
```

---

## 2. Deployed Infrastructure

All contracts are live on testnet and verified with receipts:

| Layer / Role | Network | Contract Address | Deployment Evidence | Status |
|---|---|---|---|---|
| **Cleara Coordinator** | **GenLayer Studio Next** (`61997`) | [`0x17c33C39f7998A7ed56D5C58f7D3d29E29444D55`](foundry/evidence/deployed.json) | Tx: `0x85b854a7...` (Status 7 / FINISHED_WITH_RETURN) | **LIVE** |
| **Execution Vault** | **Ethereum Sepolia** (`11155111`) | [`0x277341fc7c2481606ac69922a35b42344be5ec6f`](foundry/evidence/endpoints.json) | Tx: `0x47a53304...` (Block `0xb2cd79`, 5191 bytes) | **LIVE** |
| **Execution Vault** | **Base Sepolia** (`84532`) | [`0xe2b01f99107a6ad24a6bdd8e34f7e864434c69ad`](foundry/evidence/endpoints.json) | Tx: `0xf7f1fcad...` (Block `0x2cbb524`, 5191 bytes) | **LIVE** |

---

## 3. The Three Settlement Modes

1. **Mode 1 — Bilateral Reciprocal Netting:**
   * Two parties owe reciprocal obligations on different chains.
   * GenLayer nets reciprocal amounts on-chain ($Gross \rightarrow Net$).
   * Only the net residual moves; cleared portions are refunded to depositors on their native chain. Zero gross liquidity crosses bridges.
2. **Mode 2 — Facility / LP Fronting & Collateral Claim:**
   * A capital provider (LP) fronts instant liquidity locally on the destination rail for an urgent obligation.
   * LP subsequently claims the locked collateral using the finalized GenLayer settlement certificate.
3. **Mode 3 — Residual Bridge Routing:**
   * Where residual non-reciprocal volume must settle, the vault interfaces with canonical native bridges (e.g. OP Standard Bridge).

---

## 4. Equivalence Principle Design

Cleara enforces strict separation between deterministic facts and semantic financial judgment:

```
Can validators reproduce the exact same normalized output?
├── YES → strict_eq
│         Direct blockchain RPC calls (eth_getTransactionReceipt & eth_getTransactionByHash)
│         Normalized JSON fields (from, to, blockNumber, value_atto) must match byte-for-byte.
│
└── NO  → run_nondet_unsafe (Custom Validator)
          Semantic financial adjudication of contractual terms via AI prompt.
          Validators independently fetch evidence, re-execute the prompt,
          and assert matching normalized decisions and hard reciprocity invariants.
```

---

## 5. Canonical Verification

The repository enforces the **BUILD_FOUNDRY.md v1.0** standard. To run the full automated verification suite:

```bash
# Clone the repository
git clone https://github.com/etvjay/ClearaOnGen.git
cd ClearaOnGen

# Run the canonical verification suite
./scripts/verify
```

### Verification Pipeline:
1. **EVM Vault Test Suite (`forge test -vv`):** 7/7 passing unit tests covering all 3 settlement modes, balance locking, and access control.
2. **GenLayer Coordinator Syntax (`python3 -m py_compile`):** Validates the Python intelligent contract.
3. **Control Plane Integrity (`node scripts/check-foundry`):** Validates that all claims in `foundry/claims.jsonl` are backed by genuine evidence files and that `foundry/gaps.jsonl` has no unresolved critical gaps.

---

## 6. Repository Layout

```text
.
├── BUILD_FOUNDRY.md          # Canonical engineering governance standard
├── PRD.md                    # Complete Product Requirements Document
├── ARCHITECTURE.md           # System topology and lifecycle diagrams
├── AGENTS.md                 # Agent and contributor instructions
├── DEMO.md                   # Live demonstration walkthrough
│
├── contracts/
│   ├── cleara_coordinator.py # GenLayer Intelligent Contract (Studio Next 61997)
│   ├── ClearaVault.sol       # Native settlement vault (Sepolia & Base Sepolia)
│   ├── ClearaFacilityManager.sol # LP credit & facility registry
│   ├── MockBridgeAdapter.sol # Bridge routing adapter for residual settlement
│   └── interfaces/           # Solidity interfaces
│
├── foundry/                  # Control plane under BUILD_FOUNDRY.md
│   ├── state.json            # Machine-readable project state
│   ├── claims.jsonl          # Evidence-backed claim ledger
│   ├── gaps.jsonl            # Gap closure ledger
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
    └── live_prove.ts         # Multichain proving harness
```

---

## 7. License

Distributed under the MIT License. See `LICENSE` for details.
