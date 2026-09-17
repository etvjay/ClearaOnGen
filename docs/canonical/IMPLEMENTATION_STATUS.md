# Implementation Status Matrix — Cleara on GenLayer

| Capability | Subsystem | Status | Evidence | Limitation |
|---|---|---|---|---|
| **GenLayer Coordinator** | GenVM (Python 3.12) | `LIVE` | [`foundry/evidence/deployed.json`](../../foundry/evidence/deployed.json) | Requires valid Studio Next fee distribution |
| **dual-chain strict_eq** | GenLayer Equivalence | `LIVE` | [`contracts/cleara_coordinator.py`](../../contracts/cleara_coordinator.py) | Requires accessible public HTTPS RPC endpoints |
| **AI Netting Adjudication** | Optimistic Democracy | `LIVE` | [`contracts/cleara_coordinator.py`](../../contracts/cleara_coordinator.py) | Enforces hard reciprocity invariants |
| **Settlement Certification** | GenLayer Contract Storage | `LIVE` | [`foundry/evidence/deployed.json`](../../foundry/evidence/deployed.json) | Hash acts as cryptographic release authorization |
| **Sepolia Execution Vault** | EVM (Solidity 0.8.20) | `LIVE` | [`foundry/evidence/endpoints.json`](../../foundry/evidence/endpoints.json) | ETH native collateral; ERC20 not enabled |
| **Base Sepolia Vault** | EVM (Solidity 0.8.20) | `LIVE` | [`foundry/evidence/endpoints.json`](../../foundry/evidence/endpoints.json) | ETH native collateral |
| **Mode 1 Netting Unlock** | `ClearaVault.sol` | `TESTED` | [`foundry/evidence/forge-test.log`](../../foundry/evidence/forge-test.log) | Relayer must deliver unspent cert hash |
| **Mode 2 LP Fronting** | `ClearaVault.sol` | `TESTED` | [`foundry/evidence/forge-test.log`](../../foundry/evidence/forge-test.log) | LP must have local native capital |
| **Mode 3 Bridge Routing** | `ClearaVault.sol` | `TESTED` | [`foundry/evidence/forge-test.log`](../../foundry/evidence/forge-test.log) | Requires bridge adapter implementation |
| **Control Plane Integrity** | `check-foundry` | `VERIFIED` | [`scripts/check-foundry`](../../scripts/check-foundry) | 0 critical open gaps; strict HEAD tracking |
