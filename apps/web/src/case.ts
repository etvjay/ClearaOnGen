export type Role = "counterparty" | "facility_lp" | "operator";
export type CaseState =
  | "LOCKED"
  | "FINALIZED"
  | "PROVEN"
  | "CANONICAL"
  | "ROUTED"
  | "SETTLED"
  | "RECONCILED"
  | "PENDING_SOURCE"
  | "PENDING_PROOF"
  | "MISMATCH"
  | "STALE"
  | "REORG_DETECTED"
  | "ACTIVE"
  | "REJECTED";

export type EvidenceKind = "testnet" | "composite_fixture";

export interface EvidenceRef {
  label: string;
  kind: EvidenceKind;
  status: CaseState;
  source: string;
  detail: string;
  tx?: string;
  block?: number;
  contract?: string;
  evidenceId?: string;
}

export interface CaseStage {
  id: string;
  label: string;
  state: CaseState;
  domain: "source" | "coordination" | "settlement" | "read-model";
  amount?: string;
  detail: string;
  evidence: EvidenceRef[];
}

export interface Capability {
  name: string;
  domain: string;
  status: "CANONICAL" | "EXECUTION" | "READABLE" | "UNSUPPORTED" | "LOCAL";
  detail: string;
}

export interface InvestigationItem {
  id: string;
  title: string;
  state: Extract<CaseState, "PENDING_SOURCE" | "PENDING_PROOF" | "MISMATCH" | "STALE" | "REORG_DETECTED">;
  reason: string;
  authority: string;
  blocked: string;
  recoveryRole: string;
  nextAction: string;
}

export interface SettlementReceipt {
  sourceChainId: 11155111;
  destinationChainId: 84532;
  genlayerTxHash: string;
  sepoliaUnlockTxHash: string;
  baseFulfillTxHash: string;
  token: string;
  partyA: string;
  partyB: string;
  grossAmountWei: string;
  netAmountWei: string;
  refundAmountWei: string;
  aiReasonCodes: string[];
  reconciled: true;
}

export interface CaseGraph {
  id: string;
  label: string;
  environment: "testnet";
  disclaimer: string;
  settlementReceipt: Readonly<SettlementReceipt>;
  stages: CaseStage[];
  investigations: InvestigationItem[];
  capabilities: Capability[];
}

const evidence = {
  sepoliaLock: {
    label: "Sepolia Vault Collateral Lock",
    kind: "testnet" as const,
    status: "LOCKED" as const,
    source: "Ethereum Sepolia (Chain 11155111)",
    contract: "0x277341fc7c2481606ac69922a35b42344be5ec6f",
    tx: "0xa5f9c71c4c8106a7be7c02058bc753ad04639cfc1a5b487c8ea5ecbc247f547c",
    detail: "Alice deposited 0.0010 ETH into sovereign ClearaVault; deposit locked.",
  },
  baseLock: {
    label: "Base Sepolia Vault Collateral Lock",
    kind: "testnet" as const,
    status: "LOCKED" as const,
    source: "Base Sepolia (Chain 84532)",
    contract: "0xe2b01f99107a6ad24a6bdd8e34f7e864434c69ad",
    tx: "0x0909d8b4e7894a45a6c4060ffc3ad4fca452a210515fa016abef9e18b82ff639",
    detail: "Bob deposited 0.0006 ETH into sovereign ClearaVault; deposit locked.",
  },
  obligationRegistration: {
    label: "GenLayer Obligation Ingestion",
    kind: "testnet" as const,
    status: "FINALIZED" as const,
    source: "GenLayer Studio Next (Chain 61997)",
    contract: "0xF75595614305B537eA8bfD5fF3C53d074192eB2F",
    tx: "0x3ceb35c754045f2f592476d05ef41ad998782ee8440523db460c58bb730a91e5",
    detail: "Bilateral obligations obl-1 and obl-2 registered in Python Intelligent Contract.",
  },
  strictEqReceiptVerification: {
    label: "Multi-Validator strict_eq RPC Consensus",
    kind: "testnet" as const,
    status: "PROVEN" as const,
    source: "GenLayer Studio Next (Chain 61997)",
    contract: "0xF75595614305B537eA8bfD5fF3C53d074192eB2F",
    tx: "0xd65370cb8f86f7b19815ad70438cf15d2a9aa77f154db06c9f69792078696ee6",
    detail: "Validators independently queried eth_getTransactionReceipt across RPCs; byte-level consensus confirmed.",
  },
  aiClearingAdjudication: {
    label: "Optimistic Democracy AI Netting",
    kind: "testnet" as const,
    status: "FINALIZED" as const,
    source: "GenLayer Studio Next (Chain 61997)",
    contract: "0xF75595614305B537eA8bfD5fF3C53d074192eB2F",
    tx: "0x6b8d351170b8f127df9f0fe89b11aece834780bc4db2b1e879bc209b7d125e6b",
    detail: "Multi-validator AI evaluated commercial terms; calculated 0.0004 ETH net obligation (direction: A_OWES_B).",
  },
  mode1Settlement: {
    label: "Mode 1 Bilateral Netting Unlock",
    kind: "testnet" as const,
    status: "SETTLED" as const,
    source: "Ethereum Sepolia (Chain 11155111)",
    contract: "0x277341fc7c2481606ac69922a35b42344be5ec6f",
    tx: "0xd2d14af06b39f8ab9940c86507032b7f2412af9e96fb018d2aaff6acba59632b",
    block: 11723829,
    detail: "0.0004 ETH net released to Bob; 0.0006 ETH excess collateral refunded to Alice locally. Zero bridging.",
  },
  mode2Fulfill: {
    label: "Mode 2 LP Fronting Fulfillment",
    kind: "testnet" as const,
    status: "SETTLED" as const,
    source: "Base Sepolia (Chain 84532)",
    contract: "0xe2b01f99107a6ad24a6bdd8e34f7e864434c69ad",
    tx: "0xbab17b4f9fb07d51e687f865f1f5f188a58d81fbe27a27c0385c2489e3ed53a7",
    block: 46940763,
    detail: "Liquidity Provider fulfilled destination obligation immediately via fulfillForCounterparty.",
  },
  mode2Claim: {
    label: "Mode 2 LP Collateral Reimbursement",
    kind: "testnet" as const,
    status: "SETTLED" as const,
    source: "Ethereum Sepolia (Chain 11155111)",
    contract: "0x277341fc7c2481606ac69922a35b42344be5ec6f",
    tx: "0xf4a022185eada59182c3cec1f6ba9a25e216b6cba25dde2784033564b89a3510",
    block: 11723867,
    detail: "LP claimed locked collateral on Sepolia Vault with verified GenLayer fulfillment certificate.",
  },
  mode3Route: {
    label: "Mode 3 Residual Bridge Routing",
    kind: "testnet" as const,
    status: "ROUTED" as const,
    source: "Ethereum Sepolia (Chain 11155111)",
    contract: "0x3f248d90ce36ad0b191ea8a113ec4a4d257a0fd7",
    tx: "0x1461f94d72e2851fc6ee59a74810874a6ef75e6f349897c1db5513df7f36f3c9",
    block: 11723869,
    detail: "Unmatched residual routed to MockBridgeAdapter fallback; state marked ROUTED.",
  },
};

const CANONICAL_SETTLEMENT_RECEIPT: Readonly<SettlementReceipt> = Object.freeze({
  sourceChainId: 11155111,
  destinationChainId: 84532,
  genlayerTxHash: "0x6b8d351170b8f127df9f0fe89b11aece834780bc4db2b1e879bc209b7d125e6b",
  sepoliaUnlockTxHash: "0xd2d14af06b39f8ab9940c86507032b7f2412af9e96fb018d2aaff6acba59632b",
  baseFulfillTxHash: "0xbab17b4f9fb07d51e687f865f1f5f188a58d81fbe27a27c0385c2489e3ed53a7",
  token: "0x0000000000000000000000000000000000000000 (Native ETH)",
  partyA: "0x85B5948Ecc0b20A89267F7C6f35f656C38268642",
  partyB: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  grossAmountWei: "1600000000000000",
  netAmountWei: "400000000000000",
  refundAmountWei: "600000000000000",
  aiReasonCodes: [
    "CROSS_CHAIN_RECIPROCAL_ROUTE_SEPOLIA_BASE_SEPOLIA",
    "NET_EXPOSURE_REMAINS_TO_PARTY_A",
    "ON_CHAIN_DEPOSIT_VERIFIED_BOTH",
    "RECIPROCAL_PARTIES_CONFIRMED",
    "SAME_ASSET_ETH",
    "TERMS_MUTUALLY_COMPATIBLE"
  ],
  reconciled: true,
});

export function seedCase(): CaseGraph {
  return {
    id: "case:genlayer:all-three-modes:live-evidence",
    label: "Multichain Bilateral Netting & Execution Case",
    environment: "testnet",
    disclaimer: "Live testnet evidence: Stages represent genuine transactions on GenLayer Studio Next (61997), Ethereum Sepolia (11155111), and Base Sepolia (84532).",
    settlementReceipt: CANONICAL_SETTLEMENT_RECEIPT,
    stages: [
      { id: "sepolia-lock", label: "Sepolia Collateral Lock", state: "LOCKED", domain: "source", amount: "0.0010 ETH", detail: "Alice locked 0.0010 ETH collateral in ClearaVault (Sepolia).", evidence: [evidence.sepoliaLock] },
      { id: "base-lock", label: "Base Sepolia Collateral Lock", state: "LOCKED", domain: "source", amount: "0.0006 ETH", detail: "Bob locked 0.0006 ETH collateral in ClearaVault (Base Sepolia).", evidence: [evidence.baseLock] },
      { id: "obligation-reg", label: "Obligation Registration", state: "FINALIZED", domain: "coordination", amount: "0.0016 ETH Gross", detail: "Reciprocal obligations recorded in GenLayer Intelligent Contract.", evidence: [evidence.obligationRegistration] },
      { id: "strict-eq", label: "strict_eq Receipt Consensus", state: "PROVEN", domain: "coordination", detail: "Validators verified eth_getTransactionReceipt byte-for-byte across chains.", evidence: [evidence.strictEqReceiptVerification] },
      { id: "ai-clearing", label: "AI Clearing Adjudication", state: "FINALIZED", domain: "coordination", amount: "0.0004 ETH Net", detail: "Optimistic democracy consensus calculated 0.0004 ETH net debt residual.", evidence: [evidence.aiClearingAdjudication] },
      { id: "mode1-unlock", label: "Mode 1 Bilateral Netting", state: "SETTLED", domain: "settlement", amount: "0.0004 ETH Net / 0.0006 ETH Refund", detail: "Sepolia Vault unlocked net residual and refunded excess collateral locally. Zero bridging.", evidence: [evidence.mode1Settlement] },
      { id: "mode2-fronting", label: "Mode 2 Facility LP Fronting", state: "SETTLED", domain: "settlement", amount: "0.0001 ETH", detail: "Facility LP fronted Base liquidity, reimbursed on Sepolia Vault.", evidence: [evidence.mode2Fulfill, evidence.mode2Claim] },
      { id: "mode3-bridge", label: "Mode 3 Residual Bridge Fallback", state: "ROUTED", domain: "settlement", amount: "0.0001 ETH", detail: "Unnetted residual routed to MockBridgeAdapter for guaranteed solvency.", evidence: [evidence.mode3Route] },
      { id: "reconciliation", label: "Cross-Chain Reconciliation", state: "RECONCILED", domain: "read-model", amount: "0.0016 ETH Reconciled", detail: "Vault deposits, GenLayer certificates, and LP claims reconciled with zero capital discrepancy.", evidence: [evidence.mode1Settlement, evidence.aiClearingAdjudication] },
    ],
    investigations: [
      { id: "pending-rpc", title: "Sepolia source receipt awaiting quorum", state: "PENDING_SOURCE", reason: "Deposit observed; awaiting multi-validator strict_eq committee confirmation.", authority: "Dual-chain RPC consensus", blocked: "AI adjudication is paused until byte-for-byte receipt matches.", recoveryRole: "Operator / relayer", nextAction: "Wait for RPC block finality, then re-trigger verify_source_event." },
      { id: "consensus-rot", title: "GenVM leader rotation active", state: "PENDING_PROOF", reason: "Validator committee evaluating natural-language commercial terms.", authority: "GenVM Optimistic Democracy", blocked: "Settlement Certificate generation pending consensus.", recoveryRole: "Validator committee", nextAction: "Wait for round consensus proposal and receipt finalization." },
      { id: "lp-unclaimed", title: "LP fronting claim pending proof", state: "PENDING_SOURCE", reason: "LP fulfilled obligation on Base Sepolia; claimLPCollateral not yet submitted on Sepolia.", authority: "Sepolia ClearaVault", blocked: "LP reimbursement collateral remains locked.", recoveryRole: "Facility LP", nextAction: "Submit claimLPCollateral on Sepolia Vault with GenLayer receipt." },
      { id: "residual-expiry", title: "Unnetted residual approaching deadline", state: "STALE", reason: "No reciprocal obligation registered within netting window.", authority: "ClearaCoordinator", blocked: "Capital remains encumbered.", recoveryRole: "Relayer / bridge operator", nextAction: "Trigger routeResidual to canonical bridge adapter." },
    ],
    capabilities: [
      { name: "Canonical Coordination", domain: "GenLayer Studio Next (61997)", status: "CANONICAL", detail: "Intelligent Contract 0xF7559561... coordinates debt state & AI consensus." },
      { name: "Sepolia Execution Vault", domain: "Ethereum Sepolia (11155111)", status: "EXECUTION", detail: "ClearaVault 0x277341fc... locks collateral and releases net residuals." },
      { name: "Base Execution Vault", domain: "Base Sepolia (84532)", status: "EXECUTION", detail: "ClearaVault 0xe2b01f99... hosts destination execution and LP fulfillment." },
      { name: "Multi-Validator strict_eq", domain: "Dual-RPC Ingress", status: "CANONICAL", detail: "Committees query eth_getTransactionReceipt byte-for-byte across chains." },
      { name: "LP Credit Facility", domain: "ClearaFacilityManager", status: "EXECUTION", detail: "Decentralized credit facility for instant zero-latency settlement." },
      { name: "Bridge Adapter Fallback", domain: "MockBridgeAdapter (0x3f248d90...)", status: "EXECUTION", detail: "Pluggable bridge adapter fallback for unmatched net residuals." },
    ],
  };
}

export function isRole(value: unknown): value is Role {
  return value === "counterparty" || value === "facility_lp" || value === "operator";
}

export function roleSummary(role: Role, graph: CaseGraph): { caseId: string; title: string; question: string; focus: string[] } {
  if (!isRole(role)) throw new Error("unsupported role");
  const summaries: Record<Role, { title: string; question: string; focus: string[] }> = {
    counterparty: { title: "Bilateral Counterparty (Party A / B)", question: "What is my gross vs net debt, and has my excess collateral been refunded locally?", focus: ["sepolia-lock", "base-lock", "ai-clearing", "mode1-unlock"] },
    facility_lp: { title: "Facility Liquidity Provider", question: "Which obligations did I front on Base Sepolia, and have I claimed my reimbursement on Sepolia?", focus: ["mode2-fronting", "reconciliation"] },
    operator: { title: "Protocol Operator / Steward", question: "Are multi-validator strict_eq RPC receipts verified, and did evaluate_clearing finalize with consensus?", focus: ["obligation-reg", "strict-eq", "ai-clearing", "mode3-bridge", "reconciliation"] },
  };
  return { caseId: graph.id, ...summaries[role] };
}

export function settlementBadge(graph: CaseGraph): CaseState {
  const mode1 = graph.stages.find((s) => s.id === "mode1-unlock");
  const reconciliation = graph.stages.find((s) => s.id === "reconciliation");
  if (mode1?.state === "SETTLED" && reconciliation?.state === "RECONCILED") {
    return "SETTLED";
  }
  return "ACTIVE";
}

export function hasPersonalData(value: unknown): boolean {
  const forbiddenKey = /private[_-]?key|secret|password|seed|mnemonic|email|phone|api[_-]?key/i;
  const forbiddenValue = /-----BEGIN [A-Z ]+PRIVATE KEY-----|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
  if (typeof value === "string") return forbiddenValue.test(value);
  if (value === null || typeof value !== "object") return false;
  for (const key of Object.keys(value)) {
    if (forbiddenKey.test(key)) return true;
  }
  return false;
}
