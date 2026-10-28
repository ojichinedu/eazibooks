export interface Currency {
  code: string;
  symbol: string;
  name: string;
  position: 'before' | 'after';
}

export const CURRENCIES: Record<string, Currency> = {
  NGN: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
    position: 'before'
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    position: 'before'
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    position: 'before'
  },
  GHS: {
    code: 'GHS',
    symbol: '₵',
    name: 'Ghanaian Cedi',
    position: 'before'
  }
};

export const DEFAULT_CURRENCY = 'NGN';

export function formatCurrency(amount: number, currencyCode: string = DEFAULT_CURRENCY): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  if (currency.position === 'before') {
    return `${currency.symbol}${formattedAmount}`;
  } else {
    return `${formattedAmount}${currency.symbol}`;
  }
}

export function getCurrencySymbol(currencyCode: string = DEFAULT_CURRENCY): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];
  return currency.symbol;
}

export function getCurrencyName(currencyCode: string = DEFAULT_CURRENCY): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];
  return currency.name;
}
