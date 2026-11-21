import { CompanyWalletRecord, OfficialWalletSymbol, WalletLoadRequest } from '../types';

export const OFFICIAL_COMPANY_WALLETS: CompanyWalletRecord[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin (BTC)',
    network: 'Bitcoin Native SegWit',
    address: 'bc1qu8fn2zzqfrreaet336f4qxfs33gfpq84hwyutt',
    enabled: true,
  },
  {
    symbol: 'ETH',
    name: 'Ethereum (ETH)',
    network: 'Ethereum Mainnet (ERC-20)',
    address: '0x020Cc9a00a49E5536718e10ac5CD905A08c77C9D',
    enabled: true,
  },
  {
    symbol: 'USDT',
    name: 'Tether USD (USDT)',
    network: 'ERC-20 / BEP-20',
    address: '0x020Cc9a00a49E5536718e10ac5CD905A08c77C9D',
    enabled: true,
  },
  {
    symbol: 'PYUSD',
    name: 'PayPal USD (PYUSD)',
    network: 'PayPal USD Wallet (ERC-20)',
    address: '0x020Cc9a00a49E5536718e10ac5CD905A08c77C9D',
    enabled: true,
  },
  {
    symbol: 'BNB',
    name: 'BNB (BNB)',
    network: 'BNB Smart Chain (BEP-20)',
    address: '0x020Cc9a00a49E5536718e10ac5CD905A08c77C9D',
    enabled: true,
  },
  {
    symbol: 'SOL',
    name: 'Solana (SOL)',
    network: 'Solana Mainnet (SPL)',
    address: 'CD1aoAcuU7wmBm9XF2PnyXoL8sox4tDfUTAfojVPTVFi',
    enabled: true,
  },
  {
    symbol: 'DOGE',
    name: 'Dogecoin (DOGE)',
    network: 'Dogecoin Mainnet',
    address: 'DJxApCuYwo3TYEfmMU61K4fBZDGBmh3Sap',
    enabled: true,
  },
  {
    symbol: 'LTC',
    name: 'Litecoin (LTC)',
    network: 'Litecoin Mainnet',
    address: 'LSwsCVqFLDHZ6JB2YM1RfF3ef1bAjoDTCp',
    enabled: true,
  },
  {
    symbol: 'BCH',
    name: 'Bitcoin Cash (BCH)',
    network: 'Bitcoin Cash (CashAddr)',
    address: 'qrs3ncqmu4ayx8k70d3dflukevyw98f46qd30fcv54',
    enabled: true,
  },
];

export function mergeCompanyWallets(saved?: CompanyWalletRecord[]): CompanyWalletRecord[] {
  if (!Array.isArray(saved) || saved.length === 0) {
    return OFFICIAL_COMPANY_WALLETS.map((w) => ({ ...w }));
  }

  const savedBySymbol = new Map<OfficialWalletSymbol, CompanyWalletRecord>();
  saved.forEach((item) => {
    if (item && item.symbol) {
      savedBySymbol.set(item.symbol, item);
    }
  });

  return OFFICIAL_COMPANY_WALLETS.map((def) => {
    const existing = savedBySymbol.get(def.symbol);
    if (!existing) return { ...def };
    return {
      symbol: def.symbol,
      name: existing.name || def.name,
      network: existing.network || def.network,
      address: typeof existing.address === 'string' && existing.address.trim() ? existing.address.trim() : def.address,
      enabled: typeof existing.enabled === 'boolean' ? existing.enabled : def.enabled,
    };
  });
}

export function formatCompanyWalletsSummary(wallets: CompanyWalletRecord[]): string {
  const active = wallets.filter((w) => w.enabled && w.address.trim().length > 0);
  if (active.length === 0) return '';
  return active
    .map((w) => `${w.name} [${w.network}]: ${w.address}`)
    .join('\n');
}

export function computeMemberWalletStats(
  memberEmail: string | null | undefined,
  walletLoadRequests: WalletLoadRequest[],
  memberWalletBalances: Record<string, number>
) {
  const normalizedEmail = (memberEmail || '').trim().toLowerCase();
  if (!normalizedEmail) {
    return {
      approvedBalanceUsd: 0,
      pendingBalanceUsd: 0,
      heldBalanceUsd: 0,
      memberRequests: [] as WalletLoadRequest[],
    };
  }

  const memberRequests = walletLoadRequests.filter(
    (req) => req.memberEmail.trim().toLowerCase() === normalizedEmail
  );

  const pendingBalanceUsd = memberRequests
    .filter((req) => req.status === 'pending_approval')
    .reduce((sum, req) => sum + req.amountUsd, 0);

  const heldBalanceUsd = memberRequests
    .filter((req) => req.status === 'held')
    .reduce((sum, req) => sum + req.amountUsd, 0);

  const rawApproved = memberWalletBalances[normalizedEmail] ?? 0;

  return {
    approvedBalanceUsd: Math.max(0, Math.round(rawApproved * 100) / 100),
    pendingBalanceUsd: Math.round(pendingBalanceUsd * 100) / 100,
    heldBalanceUsd: Math.round(heldBalanceUsd * 100) / 100,
    memberRequests,
  };
}
