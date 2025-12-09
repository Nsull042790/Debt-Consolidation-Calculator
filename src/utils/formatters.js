/**
 * Formatting utilities for the Debt Consolidation Calculator
 */

/**
 * Format a number as currency
 * @param {number} value - The value to format
 * @param {boolean} showCents - Whether to show cents (default: true)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, showCents = true) {
  if (value === null || value === undefined || isNaN(value)) return '$0';
  if (!isFinite(value)) return 'N/A';

  const options = {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  };

  return new Intl.NumberFormat('en-US', options).format(value);
}

/**
 * Format a number as a percentage
 * @param {number} value - The value to format (e.g., 6.5 for 6.5%)
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage string
 */
export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  if (!isFinite(value)) return 'N/A';

  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a decimal rate as a percentage (e.g., 0.065 -> 6.50%)
 * @param {number} rate - Rate as decimal
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export function formatRateAsPercent(rate, decimals = 2) {
  if (rate === null || rate === undefined || isNaN(rate)) return '0%';
  return formatPercent(rate * 100, decimals);
}

/**
 * Format a number with commas
 * @param {number} value - The value to format
 * @returns {string} Formatted number string
 */
export function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) return '0';
  if (!isFinite(value)) return 'N/A';

  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

/**
 * Format months as years and months
 * @param {number} months - Number of months
 * @returns {string} Formatted duration string
 */
export function formatMonthsAsYears(months) {
  if (!months || !isFinite(months)) return 'N/A';

  const years = Math.floor(months / 12);
  const remainingMonths = Math.round(months % 12);

  if (years === 0) {
    return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }

  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }

  return `${years} yr${years !== 1 ? 's' : ''}, ${remainingMonths} mo`;
}

/**
 * Format break-even months for display
 * @param {number} months - Number of months
 * @returns {string} Formatted break-even string
 */
export function formatBreakEven(months) {
  if (!months || !isFinite(months)) return 'Never';
  if (months <= 0) return 'Immediate';

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  }

  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }

  return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
}

/**
 * Format date for display
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
export function formatDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

/**
 * Parse a currency string to a number
 * @param {string} value - Currency string (e.g., "$1,234.56")
 * @returns {number} Parsed number
 */
export function parseCurrency(value) {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  // Remove currency symbols, commas, and spaces
  const cleaned = value.toString().replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parse a percentage string to a decimal
 * @param {string} value - Percentage string (e.g., "6.5%" or "6.5")
 * @returns {number} Rate as decimal (e.g., 0.065)
 */
export function parsePercentToDecimal(value) {
  if (typeof value === 'number') {
    // If it's already a small decimal, assume it's already in decimal form
    return value > 1 ? value / 100 : value;
  }
  if (!value) return 0;

  // Remove % symbol and spaces
  const cleaned = value.toString().replace(/[%\s]/g, '');
  const parsed = parseFloat(cleaned);

  if (isNaN(parsed)) return 0;

  // Convert percentage to decimal
  return parsed / 100;
}

/**
 * Parse a percentage string to percentage number (keeps as percentage, not decimal)
 * @param {string} value - Percentage string (e.g., "6.5%" or "6.5")
 * @returns {number} Rate as percentage (e.g., 6.5)
 */
export function parsePercent(value) {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  const cleaned = value.toString().replace(/[%\s]/g, '');
  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Get a human-readable description of savings/cost
 * @param {number} amount - Amount (positive = savings, negative = cost)
 * @returns {{ text: string, type: 'savings' | 'cost' | 'neutral' }}
 */
export function getSavingsDescription(amount) {
  if (amount > 0) {
    return {
      text: `Save ${formatCurrency(amount)}`,
      type: 'savings'
    };
  }
  if (amount < 0) {
    return {
      text: `Additional cost of ${formatCurrency(Math.abs(amount))}`,
      type: 'cost'
    };
  }
  return {
    text: 'No change',
    type: 'neutral'
  };
}

/**
 * Generate text summary for copying/sharing
 * @param {object} results - Calculation results
 * @param {string} type - 'cashout' or 'heloc'
 * @returns {string} Text summary
 */
export function generateTextSummary(results, type = 'cashout') {
  const lines = [
    '=== DEBT CONSOLIDATION ANALYSIS ===',
    `Generated: ${formatDate()}`,
    '',
    '--- BEFORE CONSOLIDATION ---',
    `Monthly Payments: ${formatCurrency(results.before.monthlyPayment)}`,
    `Weighted Avg. Rate: ${formatRateAsPercent(results.before.weightedRate)}`,
    '',
    '--- AFTER CONSOLIDATION ---',
    `Monthly Payment: ${formatCurrency(results.after.monthlyPayment || results.after.drawPeriod?.monthlyPayment)}`,
    `New Rate: ${formatRateAsPercent(results.after.weightedRate)}`,
    '',
    '--- SAVINGS ---',
    `Monthly Savings: ${formatCurrency(results.savings.monthly || results.savings.monthlyDraw)}`,
  ];

  if (results.savings.breakEvenMonths && isFinite(results.savings.breakEvenMonths)) {
    lines.push(`Break-Even: ${formatBreakEven(results.savings.breakEvenMonths)}`);
  }

  if (results.debts.count > 0) {
    lines.push('', `Debts Consolidated: ${results.debts.count}`);
    lines.push(`Total Debt Paid Off: ${formatCurrency(results.debts.totalBalance)}`);
  }

  lines.push('', '---', 'Luminate Bank | NMLS#1281698');

  return lines.join('\n');
}
