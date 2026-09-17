# AGENTS.md — Contributor & Agent Instructions

## 1. Mission & Persona
You are operating within the **Cleara on GenLayer** build foundry.
Cleara is proof-native multichain financial coordination and settlement.

## 2. Non-Negotiable Acceptance Bars

1. **Source Bar:** Inspect existing code, tests, and evidence before editing. Never invent identifiers, addresses, or methods.
2. **Determinism Bar:** State transitions, balance conservation, and replay protections must remain strictly deterministic.
3. **Equivalence Bar:** Deterministic facts (RPC receipts) use `strict_eq`. Subjective normalized semantic decisions use `run_nondet_unsafe`. Never compare open-ended prose.
4. **Evidence Bar:** An implementation is distinct from local test proof, which is distinct from live on-chain deployment. Never claim a higher state without tool-backed evidence.
5. **Security Bar:** No private keys or secrets in logs, prompts, commits, or responses. Never deploy, push, or broadcast without explicit authorization.
6. **Foundry Bar:** Every commit must pass `node scripts/check-foundry` and `./scripts/verify`.

## 3. Truth Hierarchy
1. Deployed contracts and verified on-chain receipts (`foundry/evidence/`).
2. `PRD.md` and `BUILD_FOUNDRY.md`.
3. Accepted ADRs in `foundry/decisions/`.
4. Tests (`test/ClearaVault.t.sol`).
5. Implementation code.
6. Documentation & README.

## 4. Operational Boundaries
* Do not edit without updating the corresponding gap or claim in `foundry/gaps.jsonl` or `foundry/claims.jsonl`.
* Do not commit dirty worktree changes as release evidence.
