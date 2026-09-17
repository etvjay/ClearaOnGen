# ADR-0001: Optimistic Democracy as Financial Relationship Adjudicator

## Context
Commercial contracts and institutional financial obligations contain natural-language terms (e.g. reciprocal offsets, netting conditions, performance milestones) that cannot be reduced to simple deterministic arithmetic. Existing oracles only provide scalar data feeds; smart contracts cannot interpret subjective contractual language.

## Decision
Use GenLayer's Optimistic Democracy (`gl.vm.run_nondet_unsafe`) where:
1. A leader validator executes the semantic financial evaluation prompt via `gl.nondet.exec_prompt`.
2. Committee validators independently fetch counterparty evidence and re-run the evaluation.
3. Validators enforce hard deterministic invariants (reciprocal party matches, net calculation bounds) and require consensus on normalized decisions.

## Consequences
* Enables trustless on-chain adjudication of commercial netting agreements.
* Built-in appeal escalation (5 -> 7 -> 11 -> 23 validators) prevents subjective capture.
* Output is a cryptographically final Settlement Certificate.
