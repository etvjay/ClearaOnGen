# { "Depends": "py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng" }

import json
import genlayer as gl


class ClearaCoordinator(gl.contract.Contract):
    obligations: gl.storage.TreeMap[str, str]
    count: gl.u256

    def __init__(self):
        self.count = gl.u256(0)

    @gl.public.write
    def record_obligation(
        self,
        party_b: str,
        amount_atto: str,
        currency: str,
        evidence_url: str,
        chain_a: str,
        chain_b: str,
        terms: str,
    ) -> str:
        oid = f"obl-{int(self.count) + 1}"
        self.obligations[oid] = json.dumps({
            "id": oid,
            "party_a": str(gl.message.sender_address),
            "party_b": party_b,
            "amount_atto": amount_atto,
            "currency": currency,
            "evidence_url": evidence_url,
            "chain_a": chain_a,
            "chain_b": chain_b,
            "terms": terms,
            "status": "PENDING",
            "sepolia_proof_tx": "",
            "base_proof_tx": "",
            "net_atto_amount": "0",
            "net_direction": "",
            "cleared_at_block": "",
            "adjudication_mode": "",
            "adjudication_reason_codes": "",
            "adjudication_summary": "",
        }, sort_keys=True)
        self.count = gl.u256(int(self.count) + 1)
        return oid

    def _fetch_receipt(self, rpc_url: str, tx_hash: str) -> dict:
        def fetch() -> str:
            receipt_payload = json.dumps(
                {"jsonrpc": "2.0", "id": 1, "method": "eth_getTransactionReceipt", "params": [tx_hash]}
            )
            receipt_res = gl.nondet.web.post(
                rpc_url,
                body=receipt_payload.encode(),
                headers={"Content-Type": "application/json"},
            )
            if receipt_res.status >= 500:
                raise gl.vm.UserError("[TRANSIENT] RPC unavailable")
            if receipt_res.status >= 400:
                raise gl.vm.UserError("[EXTERNAL] RPC error")
            receipt_data = json.loads(receipt_res.body.decode())
            if "error" in receipt_data:
                raise gl.vm.UserError("[EXTERNAL] RPC returned error")
            receipt = receipt_data.get("result")
            if not receipt:
                raise gl.vm.UserError("[EXPECTED] Transaction not found")
            if receipt.get("status") != "0x1":
                raise gl.vm.UserError("[EXPECTED] Transaction failed on source chain")

            tx_payload = json.dumps(
                {"jsonrpc": "2.0", "id": 1, "method": "eth_getTransactionByHash", "params": [tx_hash]}
            )
            tx_res = gl.nondet.web.post(
                rpc_url,
                body=tx_payload.encode(),
                headers={"Content-Type": "application/json"},
            )
            if tx_res.status >= 500:
                raise gl.vm.UserError("[TRANSIENT] RPC unavailable")
            if tx_res.status >= 400:
                raise gl.vm.UserError("[EXTERNAL] RPC error")
            tx_data = json.loads(tx_res.body.decode())
            if "error" in tx_data or not tx_data.get("result"):
                raise gl.vm.UserError("[EXPECTED] Transaction not found")
            tx = tx_data["result"]

            return json.dumps(
                {
                    "tx_hash": tx_hash.lower(),
                    "from": str(receipt.get("from", "")).lower(),
                    "to": str(receipt.get("to", "")).lower(),
                    "block_number": str(receipt.get("blockNumber", "")),
                    "value_atto": str(int(tx.get("value", "0x0"), 16)),
                },
                sort_keys=True,
            )

        return json.loads(gl.eq_principle.strict_eq(fetch))

    @gl.public.write
    def verify_source_event(
        self,
        obligation_id: str,
        chain: str,
        rpc_url: str,
        tx_hash: str,
        expected_from: str,
        expected_to: str,
        expected_value_atto: str,
    ) -> None:
        obl = json.loads(self.obligations[obligation_id])
        proven = self._fetch_receipt(rpc_url, tx_hash)
        if proven["from"] != expected_from.lower():
            raise gl.vm.UserError("[EXPECTED] from mismatch")
        if expected_to and proven["to"] != expected_to.lower():
            raise gl.vm.UserError("[EXPECTED] to mismatch")
        if proven["value_atto"] != str(int(expected_value_atto)):
            raise gl.vm.UserError("[EXPECTED] value mismatch")
        if chain == "SEPOLIA":
            obl["sepolia_proof_tx"] = tx_hash.lower()
        elif chain == "BASE_SEPOLIA":
            obl["base_proof_tx"] = tx_hash.lower()
        else:
            raise gl.vm.UserError("[EXPECTED] unknown chain")
        if obl["sepolia_proof_tx"] and obl["base_proof_tx"]:
            obl["status"] = "VERIFIED"
        self.obligations[obligation_id] = json.dumps(obl, sort_keys=True)

    def _adjudicate_pair(self, a: dict, b: dict) -> dict:
        prompt = f"""
You are the financial-relationship adjudicator for Cleara.
Cleara does not decide whether a payment merely occurred. It decides whether
 two obligations are semantically compatible for a permitted settlement mode.

Obligation A (A owes B):
  party_a: {a["party_a"]}
  party_b: {a["party_b"]}
  amount_atto: {a["amount_atto"]}
  currency: {a["currency"]}
  source_chain: {a["chain_a"]}
  destination_chain: {a["chain_b"]}
  terms: {a["terms"]}
  evidence_url: {a["evidence_url"]}

Obligation B (B owes A):
  party_a: {b["party_a"]}
  party_b: {b["party_b"]}
  amount_atto: {b["amount_atto"]}
  currency: {b["currency"]}
  source_chain: {b["chain_a"]}
  destination_chain: {b["chain_b"]}
  terms: {b["terms"]}
  evidence_url: {b["evidence_url"]}

Evidence A:
{{evidence_a}}
Evidence B:
{{evidence_b}}

Apply these criteria:
1. The obligations must describe a reciprocal relationship, allowing ordinary
   commercial wording differences but not contradictory parties.
2. Currency and settlement asset must be compatible.
3. Chain routes must be valid for native-rail execution.
4. Terms must describe enforceable, compatible obligations, including delivery,
   timing, and conditions. Do not infer missing material terms.
5. Evidence must support the relationship; self-attestation alone is insufficient.
6. Select exactly one mode: BILATERAL_NETTING, FACILITY_LP, or BRIDGE_ROUTING.
   Choose BILATERAL_NETTING only when both obligations are reciprocal and
   compatible. Choose FACILITY_LP only when an LP intent is explicit. Otherwise
   choose BRIDGE_ROUTING only when a residual route is authorized.

Respond only JSON:
{{
  "eligible": bool,
  "mode": "BILATERAL_NETTING" | "FACILITY_LP" | "BRIDGE_ROUTING" | "REJECT",
  "relationship_match": bool,
  "asset_match": bool,
  "chain_route_valid": bool,
  "terms_compatible": bool,
  "evidence_sufficient": bool,
  "creditor": "PARTY_A" | "PARTY_B" | "NONE",
  "reason_codes": [string],
  "summary": string
}}
"""

        def normalize(result: dict) -> dict:
            allowed_modes = ("BILATERAL_NETTING", "FACILITY_LP", "BRIDGE_ROUTING", "REJECT")
            allowed_creditors = ("PARTY_A", "PARTY_B", "NONE")
            mode = str(result.get("mode", "REJECT"))
            creditor = str(result.get("creditor", "NONE"))
            return {
                "eligible": bool(result.get("eligible", False)),
                "mode": mode if mode in allowed_modes else "REJECT",
                "relationship_match": bool(result.get("relationship_match", False)),
                "asset_match": bool(result.get("asset_match", False)),
                "chain_route_valid": bool(result.get("chain_route_valid", False)),
                "terms_compatible": bool(result.get("terms_compatible", False)),
                "evidence_sufficient": bool(result.get("evidence_sufficient", False)),
                "creditor": creditor if creditor in allowed_creditors else "NONE",
                "reason_codes": sorted([str(x) for x in result.get("reason_codes", [])]),
                "summary": str(result.get("summary", ""))[:280],
            }

        def make_prompt(evidence_a: str, evidence_b: str) -> str:
            return prompt.replace("{evidence_a}", evidence_a).replace("{evidence_b}", evidence_b)

        def leader() -> str:
            if a["evidence_url"]:
                evidence_a = gl.nondet.web.render(a["evidence_url"], mode="text")[:6000]
            else:
                evidence_a = "ON_CHAIN_DEPOSIT_VERIFIED"
            if b["evidence_url"]:
                evidence_b = gl.nondet.web.render(b["evidence_url"], mode="text")[:6000]
            else:
                evidence_b = "ON_CHAIN_DEPOSIT_VERIFIED"
            result = gl.nondet.exec_prompt(make_prompt(evidence_a, evidence_b), response_format="json")
            return json.dumps(normalize(result), sort_keys=True)

        def validator(leader_result) -> bool:
            if not isinstance(leader_result, gl.vm.Return):
                return False
            raw = leader_result.calldata
            if isinstance(raw, dict):
                proposed = normalize(raw)
            elif isinstance(raw, bytes):
                try:
                    proposed = normalize(json.loads(raw.decode()))
                except Exception:
                    return False
            elif isinstance(raw, str):
                try:
                    proposed = normalize(json.loads(raw))
                except Exception:
                    return False
            else:
                return False

            if a["evidence_url"]:
                independent_a = gl.nondet.web.render(a["evidence_url"], mode="text")[:6000]
            else:
                independent_a = "ON_CHAIN_DEPOSIT_VERIFIED"
            if b["evidence_url"]:
                independent_b = gl.nondet.web.render(b["evidence_url"], mode="text")[:6000]
            else:
                independent_b = "ON_CHAIN_DEPOSIT_VERIFIED"
            independent_result = normalize(
                gl.nondet.exec_prompt(
                    make_prompt(independent_a, independent_b), response_format="json"
                )
            )

            # Hard invariants remain deterministic and cannot be overridden by AI.
            reciprocal = a["party_a"].lower() == b["party_b"].lower() and a["party_b"].lower() == b["party_a"].lower()
            if proposed["mode"] == "BILATERAL_NETTING" and not reciprocal:
                return False
            if proposed["eligible"] and proposed["mode"] == "REJECT":
                return False
            if not proposed["eligible"] and proposed["mode"] != "REJECT":
                return False
            return (
                proposed["mode"] == independent_result["mode"]
                and proposed["eligible"] == independent_result["eligible"]
            )

        return json.loads(gl.vm.run_nondet(leader, validator))

    @gl.public.write
    def evaluate_clearing(self, obligation_a_id: str, obligation_b_id: str) -> None:
        a = json.loads(self.obligations[obligation_a_id])
        b = json.loads(self.obligations[obligation_b_id])
        if a["status"] != "VERIFIED" or b["status"] != "VERIFIED":
            raise gl.vm.UserError("[EXPECTED] both obligations must be VERIFIED")
        decision = self._adjudicate_pair(a, b)
        if not decision["eligible"]:
            raise gl.vm.UserError("[EXPECTED] semantic adjudication rejected clearing")

        amount_a = int(a["amount_atto"])
        amount_b = int(b["amount_atto"])
        net = abs(amount_a - amount_b)
        if amount_a > amount_b:
            direction = "A_OWES_B"
        elif amount_b > amount_a:
            direction = "B_OWES_A"
        else:
            direction = "EQUAL_OFFSET"

        a["status"] = "CLEARING"
        a["net_atto_amount"] = str(net)
        a["net_direction"] = direction
        a["adjudication_mode"] = decision["mode"]
        a["adjudication_reason_codes"] = json.dumps(decision["reason_codes"], sort_keys=True)
        a["adjudication_summary"] = decision["summary"]
        b["status"] = "CLEARING"
        b["net_atto_amount"] = str(net)
        b["net_direction"] = direction
        b["adjudication_mode"] = decision["mode"]
        b["adjudication_reason_codes"] = json.dumps(decision["reason_codes"], sort_keys=True)
        b["adjudication_summary"] = decision["summary"]
        self.obligations[obligation_a_id] = json.dumps(a, sort_keys=True)
        self.obligations[obligation_b_id] = json.dumps(b, sort_keys=True)

    @gl.public.write
    def mark_cleared(self, obligation_id: str) -> None:
        obl = json.loads(self.obligations[obligation_id])
        if obl["status"] != "CLEARING":
            raise gl.vm.UserError("[EXPECTED] must be CLEARING")
        obl["status"] = "CLEARED"
        obl["cleared_at_block"] = str(gl.block.number)
        self.obligations[obligation_id] = json.dumps(obl, sort_keys=True)

    @gl.public.write
    def reconcile(self, obligation_id: str) -> None:
        obl = json.loads(self.obligations[obligation_id])
        if obl["status"] != "CLEARED":
            raise gl.vm.UserError("[EXPECTED] must be CLEARED")
        obl["status"] = "RECONCILED"
        self.obligations[obligation_id] = json.dumps(obl, sort_keys=True)

    @gl.public.view
    def get_obligation(self, obligation_id: str) -> dict:
        obl = json.loads(self.obligations[obligation_id])
        return {
            "id": obl["id"],
            "party_a": obl["party_a"],
            "party_b": obl["party_b"],
            "amount_atto": obl["amount_atto"],
            "currency": obl["currency"],
            "status": obl["status"],
            "net_atto_amount": obl["net_atto_amount"],
            "net_direction": obl["net_direction"],
            "adjudication_mode": obl["adjudication_mode"],
            "adjudication_reason_codes": obl["adjudication_reason_codes"],
            "adjudication_summary": obl["adjudication_summary"],
        }

    @gl.public.view
    def get_settlement_certificate(self, obligation_id: str) -> dict:
        obl = json.loads(self.obligations[obligation_id])
        return {
            "obligation_id": obl["id"],
            "status": obl["status"],
            "net_atto_amount": obl["net_atto_amount"],
            "net_direction": obl["net_direction"],
            "party_a": obl["party_a"],
            "party_b": obl["party_b"],
            "currency": obl["currency"],
            "adjudication": {
                "mode": obl["adjudication_mode"],
                "reason_codes": obl["adjudication_reason_codes"],
                "summary": obl["adjudication_summary"],
            },
            "source_proofs": {
                "sepolia_tx": obl["sepolia_proof_tx"],
                "base_tx": obl["base_proof_tx"],
            },
            "cleared_at_block": obl["cleared_at_block"],
        }

    @gl.public.view
    def list_obligations(self) -> list:
        return [f"obl-{i + 1}" for i in range(int(self.count))]
