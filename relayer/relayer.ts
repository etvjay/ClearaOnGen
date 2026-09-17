import { createPublicClient, http, parseAbi } from "viem";
import { sepolia, baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { createClient } from "genlayer-js";
import { studioDevnet } from "genlayer-js/chains";
import dotenv from "dotenv";
dotenv.config();

const GENLAYER_RPC = process.env.GENLAYER_RPC || "https://studio-next.genlayer.com/api";
const GENLAYER_CONTRACT = process.env.GENLAYER_CONTRACT as `0x${string}`;

const vaultAbi = parseAbi([
  "function unlockWithCertificate(bytes32 obligationId, address recipient, uint256 netAmount, uint256 refundAmount, bytes32 genlayerTxHash)",
  "function claimLPCollateral(bytes32 obligationId, address lpRecipient, bytes32 genlayerTxHash)",
  "function routeResidual(bytes32 obligationId, address bridgeAdapter)",
  "function getDeposit(bytes32) view returns (address depositor, address intendedRecipient, uint256 amount, uint8 state, bytes32 targetChain)",
]);

const studioNext = { ...studioDevnet, id: 61997, name: "GenLayer Studio Next", rpcUrls: { default: { http: [GENLAYER_RPC] } } } as any;

async function pollAndUnlock() {
  if (!GENLAYER_CONTRACT) throw new Error("GENLAYER_CONTRACT missing");
  console.log("Relayer watching", GENLAYER_CONTRACT, GENLAYER_RPC);
  // Example: watch a fixed set of obligationIds — in prod would index events
  const obligationIds: `0x${string}`[] = (process.env.OBLIGATION_IDS?.split(",") as any) || [];
  if (obligationIds.length === 0) console.log("Set OBLIGATION_IDS=0x...,0x... to poll specific certs");

  const genClient: any = createClient({ chain: studioNext });
  // viem EVM clients (update deployments.json addresses after deploy)
  // This is a polling template — unlock is called after GenLayer FINALIZED cert appears.

  for (const oid of obligationIds) {
    try {
      // GenLayer view: get_settlement_certificate
      const cert: any = await genClient.call({ address: GENLAYER_CONTRACT, functionName: "get_settlement_certificate", args: [oid] });
      console.log("cert", oid, cert);
      if (cert.status === "FINALIZED" || cert.status === "CLEARED") {
        console.log(` -> would call unlockWithCertificate on ${cert.chain} vault`);
      }
    } catch (e) {
      console.error("poll", oid, e);
    }
  }
}

pollAndUnlock().catch(console.error);
