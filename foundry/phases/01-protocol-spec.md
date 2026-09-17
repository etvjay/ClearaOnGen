# Phase 01 — Protocol Specification & Equivalence Principle Design

STATUS: PASS  
OWNER: Lead Protocol Architect  

## Objective
Define formal state transitions, boundary vocabulary, and equivalence-principle assignments for Cleara on GenLayer.

## Boundary Vocabulary (Core Axioms)
* `OBSERVED != PROVEN`: Source-chain RPC observation must be verified independently by multiple validators via strict equality.
* `PROOF != AUTHORITY`: Verification that a transfer occurred does not grant clearing authority.
* `COMPATIBILITY != CLEARING AUTHORITY`: Semantic compatibility between two obligations must be certified by Optimistic Democracy consensus.
* `CLEARING != SETTLEMENT`: Clearing computes the net authorized reciprocal obligation; settlement executes native token transfers on Sepolia/Base Sepolia.
* `ROUTED != SETTLED`: A routing instruction does not establish that native bridge settlement has concluded.
* `WALLET != PARTY`: A signer address is an execution identity, separated from organization identity.

## Equivalence Principle Assignments

| Operation | Principle | Implementation |
|---|---|---|
| Source receipt verification | `strict_eq` | `_fetch_receipt()` calls `eth_getTransactionReceipt` and `eth_getTransactionByHash` across validators; status, from, to, value must match byte-for-byte. |
| Semantic clearing adjudication | `run_nondet_unsafe` | Leader executes prompt over obligation terms; committee validators independently fetch evidence, re-run AI, and assert identical normalized decisions and hard reciprocity invariants. |
| State transitions & arithmetic | Deterministic (No EP) | State gates (`PENDING`, `VERIFIED`, `CLEARING`, `CLEARED`, `RECONCILED`), replay protection, and net subtraction execute as standard deterministic Python logic. |

## Exit Gate
* [x] Equivalence principle strictly defined for each contract method.
* [x] Hard invariants specified (reciprocal parties, net calculations).
