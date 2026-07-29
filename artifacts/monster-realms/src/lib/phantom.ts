// ─── Phantom Wallet Utility ───────────────────────────────────────────────────
// Uses window.phantom injected by the Phantom browser extension.
// No wallet adapter needed — direct Phantom API.

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

export const SOLANA_NETWORK = 'mainnet-beta'; // overridden at runtime by shop status
export const DEFAULT_RPC    = 'https://api.mainnet-beta.solana.com';

export function getPhantom() {
  const p = (window as any).phantom?.solana;
  return p?.isPhantom ? p : null;
}

export function isPhantomInstalled(): boolean {
  return !!getPhantom();
}

export async function connectPhantom(): Promise<string> {
  const phantom = getPhantom();
  if (!phantom) throw new Error('Phantom wallet not installed');
  const resp = await phantom.connect();
  return (resp.publicKey as PublicKey).toString();
}

export async function disconnectPhantom(): Promise<void> {
  const phantom = getPhantom();
  if (phantom) await phantom.disconnect();
}

export function getConnectedWallet(): string | null {
  const phantom = getPhantom();
  if (!phantom?.isConnected) return null;
  return phantom.publicKey?.toString() ?? null;
}

// ─── Build & send a SOL transfer transaction ──────────────────────────────────

export async function sendSolPayment(
  toAddress: string,
  solAmount: number,
  rpcUrl?: string,
): Promise<string> {
  const phantom = getPhantom();
  if (!phantom) throw new Error('Phantom not installed');
  if (!phantom.isConnected || !phantom.publicKey) throw new Error('Wallet not connected');

  const connection = new Connection(rpcUrl ?? DEFAULT_RPC, 'confirmed');
  const fromPubkey = new PublicKey(phantom.publicKey.toString());
  const toPubkey   = new PublicKey(toAddress);
  const lamports   = Math.round(solAmount * LAMPORTS_PER_SOL);

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

  const tx = new Transaction({
    recentBlockhash: blockhash,
    feePayer: fromPubkey,
  }).add(
    SystemProgram.transfer({ fromPubkey, toPubkey, lamports }),
  );

  // signAndSendTransaction returns { signature }
  const result = await phantom.signAndSendTransaction(tx);
  const signature: string = result.signature ?? result;

  // Wait for confirmation
  await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');
  return signature;
}
