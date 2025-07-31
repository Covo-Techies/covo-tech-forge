export interface CurrencySettings {
  currency: 'USD' | 'KSH';
  symbol: string;
  locale: string;
}

export const CURRENCY_CONFIGS: Record<string, CurrencySettings> = {
  USD: {
    currency: 'USD',
    symbol: '$',
    locale: 'en-US',
  },
  KSH: {
    currency: 'KSH',
    symbol: 'KSH',
    locale: 'en-KE',
  },
};

export function formatCurrency(
  amount: number,
  currencyCode: 'USD' | 'KSH' = 'USD'
): string {
  const config = CURRENCY_CONFIGS[currencyCode];
  
  if (currencyCode === 'KSH') {
    return `KSH ${amount.toFixed(2)}`;
  }
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
  }).format(amount);
}

export function getCurrencySymbol(currencyCode: 'USD' | 'KSH'): string {
  return CURRENCY_CONFIGS[currencyCode]?.symbol || '$';
}