const CURRENCY_SYMBOLS: Record<string, string> = {
  'USD': '$',
  'AED': 'د.إ',
  'SAR': 'ر.س',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'INR': '₹',
  'CAD': 'C$',
  'AUD': 'A$',
  'CHF': 'CHF',
  'CNY': '¥',
  'KRW': '₩',
  'SGD': 'S$',
  'HKD': 'HK$',
  'MXN': '$',
  'BRL': 'R$',
  'ZAR': 'R',
  'RUB': '₽',
  'TRY': '₺',
  'PLN': 'zł',
  'SEK': 'kr',
  'NOK': 'kr',
  'DKK': 'kr'
};

const CURRENCY_NAMES: Record<string, string> = {
  'USD': 'US Dollar',
  'AED': 'UAE Dirham',
  'SAR': 'Saudi Riyal',
  'EUR': 'Euro',
  'GBP': 'British Pound',
  'JPY': 'Japanese Yen',
  'INR': 'Indian Rupee',
  'CAD': 'Canadian Dollar',
  'AUD': 'Australian Dollar',
  'CHF': 'Swiss Franc',
  'CNY': 'Chinese Yuan',
  'KRW': 'South Korean Won',
  'SGD': 'Singapore Dollar',
  'HKD': 'Hong Kong Dollar',
  'MXN': 'Mexican Peso',
  'BRL': 'Brazilian Real',
  'ZAR': 'South African Rand',
  'RUB': 'Russian Ruble',
  'TRY': 'Turkish Lira',
  'PLN': 'Polish Zloty',
  'SEK': 'Swedish Krona',
  'NOK': 'Norwegian Krone',
  'DKK': 'Danish Krone'
};

export function formatCurrency(amount: number, currencyCode: string): string {
  const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
  
  // For some currencies, symbol goes after the amount
  const symbolAfter = ['AED', 'SAR'];
  
  // Format the number with proper decimal places
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  if (symbolAfter.includes(currencyCode)) {
    return `${formattedAmount} ${symbol}`;
  } else {
    return `${symbol}${formattedAmount}`;
  }
}

export function getCurrencySymbol(currencyCode: string): string {
  return CURRENCY_SYMBOLS[currencyCode] || currencyCode;
}

export function getCurrencyName(currencyCode: string): string {
  return CURRENCY_NAMES[currencyCode] || currencyCode;
}

export function formatCompactCurrency(amount: number, currencyCode: string): string {
  const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
  
  if (amount >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}K`;
  } else {
    return formatCurrency(amount, currencyCode);
  }
} 