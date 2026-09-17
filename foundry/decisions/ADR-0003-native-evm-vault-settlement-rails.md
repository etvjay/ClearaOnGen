# ADR-0003: Native EVM Vaults as Settlement Rails

## Context
"Clear first. Move only what remains."
Asset movement across cross-chain bridges introduces substantial attack surface, slippage, and liquidity fragmentation.

## Decision
Keep assets locked natively on Ethereum Sepolia and Base Sepolia in `ClearaVault.sol`.
1. Obligations are locked locally on each chain.
2. GenLayer clears the reciprocal gross obligations on-chain.
3. Only the residual net difference is moved or settled locally.
4. Refunds for cleared portions are returned immediately to depositors on their native chain.

## Consequences
* Minimizes bridge exposure to only the residual unnetted balance.
* Preserves sovereign custody and native-rail execution guarantees.
