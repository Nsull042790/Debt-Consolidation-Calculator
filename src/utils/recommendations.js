/**
 * AI Recommendations Engine for Debt Consolidation Calculator
 * Generates smart, contextual advice based on calculation results
 */

import { formatCurrency, formatPercent, formatBreakEven, formatRateAsPercent } from './formatters';

/**
 * Priority levels for recommendations
 */
export const PRIORITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info'
};

/**
 * Recommendation categories
 */
export const CATEGORY = {
  DTI: 'dti',
  LTV: 'ltv',
  BREAK_EVEN: 'break_even',
  INTEREST: 'interest',
  CASH_FLOW: 'cash_flow',
  TERM: 'term',
  ALTERNATIVE: 'alternative',
  OPPORTUNITY: 'opportunity'
};

/**
 * Generate recommendations for cash-out refinance scenario
 * @param {object} results - Calculation results from calculateCashOutRefinance
 * @param {object} inputs - Original input values
 * @returns {Array<object>} Array of recommendation objects
 */
export function generateCashOutRecommendations(results, inputs) {
  const recommendations = [];

  // DTI-based recommendations
  recommendations.push(...generateDTIRecommendations(results, inputs, 'cashout'));

  // LTV-based recommendations
  recommendations.push(...generateLTVRecommendations(results, inputs));

  // Break-even analysis
  recommendations.push(...generateBreakEvenRecommendations(results, inputs));

  // Interest rate arbitrage
  recommendations.push(...generateInterestArbitrageRecommendations(results, inputs));

  // Cash flow impact
  recommendations.push(...generateCashFlowRecommendations(results, inputs, 'cashout'));

  // Term recommendations
  recommendations.push(...generateTermRecommendations(results, inputs));

  // Alternative suggestions
  recommendations.push(...generateAlternativeRecommendations(results, inputs, 'cashout'));

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}

/**
 * Generate recommendations for HELOC scenario
 * @param {object} results - Calculation results from calculateHELOC
 * @param {object} inputs - Original input values
 * @returns {Array<object>} Array of recommendation objects
 */
export function generateHELOCRecommendations(results, inputs) {
  const recommendations = [];

  // DTI-based recommendations
  recommendations.push(...generateDTIRecommendations(results, inputs, 'heloc'));

  // CLTV-based recommendations
  recommendations.push(...generateCLTVRecommendations(results, inputs));

  // Cash flow impact
  recommendations.push(...generateCashFlowRecommendations(results, inputs, 'heloc'));

  // Interest rate considerations for HELOC
  recommendations.push(...generateHELOCRateRecommendations(results, inputs));

  // HELOC-specific recommendations
  recommendations.push(...generateHELOCSpecificRecommendations(results, inputs));

  // Alternative suggestions
  recommendations.push(...generateAlternativeRecommendations(results, inputs, 'heloc'));

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}

/**
 * Generate DTI-related recommendations
 */
function generateDTIRecommendations(results, inputs, type) {
  const recommendations = [];
  const afterDTI = type === 'heloc'
    ? results.after.backEndDTIRepay
    : results.after.backEndDTI;
  const beforeDTI = results.before.backEndDTI;

  // Critical: DTI exceeds 50%
  if (afterDTI > 50) {
    recommendations.push({
      id: 'dti-exceeds-50',
      priority: PRIORITY.CRITICAL,
      category: CATEGORY.DTI,
      title: 'DTI Exceeds Guidelines',
      message: `The resulting DTI of ${formatPercent(afterDTI)} exceeds Fannie/Freddie's 50% maximum. This loan may not qualify under standard guidelines.`,
      suggestion: 'Consider reducing the loan amount, excluding some debts from consolidation, or exploring alternative programs.',
      icon: 'alert-triangle'
    });

    // Find debts that could be excluded
    if (inputs.debtsToConsolidate?.length > 1) {
      const smallestDebt = [...inputs.debtsToConsolidate]
        .filter(d => d.balance > 0)
        .sort((a, b) => a.monthlyPayment - b.monthlyPayment)[0];

      if (smallestDebt) {
        recommendations.push({
          id: 'dti-exclude-suggestion',
          priority: PRIORITY.HIGH,
          category: CATEGORY.ALTERNATIVE,
          title: 'Consider Excluding Smallest Debt',
          message: `Excluding the ${smallestDebt.name || 'smallest debt'} (${formatCurrency(smallestDebt.monthlyPayment)}/mo) from consolidation could improve DTI by approximately ${formatPercent(smallestDebt.monthlyPayment / inputs.grossMonthlyIncome * 100)}.`,
          suggestion: `Keep this ${formatCurrency(smallestDebt.balance)} balance separate and focus on paying it off directly.`,
          icon: 'lightbulb'
        });
      }
    }
  }
  // Warning: DTI 43-50%
  else if (afterDTI >= 43) {
    recommendations.push({
      id: 'dti-caution',
      priority: PRIORITY.HIGH,
      category: CATEGORY.DTI,
      title: 'DTI in Caution Range',
      message: `A DTI of ${formatPercent(afterDTI)} may require manual underwriting or compensating factors like excellent credit or significant reserves.`,
      suggestion: 'Document strong compensating factors such as high credit score (740+), significant cash reserves, or stable employment history.',
      icon: 'alert-circle'
    });
  }
  // Good news: DTI improved
  else if (afterDTI < beforeDTI && beforeDTI > 36) {
    recommendations.push({
      id: 'dti-improved',
      priority: PRIORITY.INFO,
      category: CATEGORY.DTI,
      title: 'DTI Improved',
      message: `Consolidation improves DTI from ${formatPercent(beforeDTI)} to ${formatPercent(afterDTI)}, moving into a more favorable range for future financing.`,
      suggestion: 'This improved DTI could help qualify for additional financing needs in the future.',
      icon: 'trending-down'
    });
  }

  return recommendations;
}

/**
 * Generate LTV-related recommendations
 */
function generateLTVRecommendations(results, inputs) {
  const recommendations = [];
  const newLTV = results.after.ltv;

  if (newLTV > 95) {
    recommendations.push({
      id: 'ltv-exceeds-95',
      priority: PRIORITY.CRITICAL,
      category: CATEGORY.LTV,
      title: 'LTV Exceeds Typical Limits',
      message: `The new LTV of ${formatPercent(newLTV)} exceeds most lenders' maximum of 95%. This loan may not be feasible.`,
      suggestion: 'Reduce the cash-out amount or exclude some debts to bring LTV below 95%.',
      icon: 'x-circle'
    });
  } else if (newLTV > 90) {
    recommendations.push({
      id: 'ltv-high-risk',
      priority: PRIORITY.HIGH,
      category: CATEGORY.LTV,
      title: 'High LTV Risk',
      message: `An LTV of ${formatPercent(newLTV)} is considered high risk and will require PMI. Rates may be higher and approval more difficult.`,
      suggestion: 'If possible, reduce the loan amount to get below 90% LTV for better terms.',
      icon: 'alert-triangle'
    });
  } else if (newLTV > 80) {
    recommendations.push({
      id: 'ltv-pmi-required',
      priority: PRIORITY.MEDIUM,
      category: CATEGORY.LTV,
      title: 'PMI Will Be Required',
      message: `With an LTV of ${formatPercent(newLTV)}, private mortgage insurance (PMI) will be required, typically adding 0.3-1.5% annually.`,
      suggestion: 'Factor PMI costs into the payment comparison. The break-even calculation doesn\'t include PMI.',
      icon: 'info'
    });

    // Calculate how much to reduce to avoid PMI
    const amountToReduceForPMI = results.after.loanAmount - (inputs.homeValue * 0.80);
    if (amountToReduceForPMI > 0 && amountToReduceForPMI < inputs.additionalCashOut) {
      recommendations.push({
        id: 'ltv-avoid-pmi',
        priority: PRIORITY.MEDIUM,
        category: CATEGORY.LTV,
        title: 'Option to Avoid PMI',
        message: `Reducing the cash-out by ${formatCurrency(amountToReduceForPMI)} would bring LTV to 80% and eliminate PMI requirement.`,
        icon: 'lightbulb'
      });
    }
  } else {
    recommendations.push({
      id: 'ltv-good',
      priority: PRIORITY.INFO,
      category: CATEGORY.LTV,
      title: 'Favorable LTV',
      message: `The new LTV of ${formatPercent(newLTV)} is in a favorable range with no PMI required.`,
      icon: 'check-circle'
    });
  }

  return recommendations;
}

/**
 * Generate CLTV-related recommendations for HELOC
 */
function generateCLTVRecommendations(results, inputs) {
  const recommendations = [];
  const cltv = results.after.cltv;

  if (cltv > 90) {
    recommendations.push({
      id: 'cltv-exceeds-90',
      priority: PRIORITY.HIGH,
      category: CATEGORY.LTV,
      title: 'High Combined LTV',
      message: `The combined LTV of ${formatPercent(cltv)} (first mortgage + HELOC) is high. Many lenders cap HELOC CLTVs at 85-90%.`,
      suggestion: 'You may need to shop for lenders with higher CLTV tolerances, or reduce the HELOC amount.',
      icon: 'alert-triangle'
    });
  } else if (cltv > 80) {
    recommendations.push({
      id: 'cltv-moderate',
      priority: PRIORITY.MEDIUM,
      category: CATEGORY.LTV,
      title: 'Moderate CLTV',
      message: `A CLTV of ${formatPercent(cltv)} is acceptable for most HELOC lenders but may affect the rate offered.`,
      icon: 'info'
    });
  }

  return recommendations;
}

/**
 * Generate break-even recommendations
 */
function generateBreakEvenRecommendations(results, inputs) {
  const recommendations = [];
  const breakEvenMonths = results.savings.breakEvenMonths;

  if (!isFinite(breakEvenMonths) || breakEvenMonths <= 0) {
    if (results.savings.monthly <= 0) {
      recommendations.push({
        id: 'breakeven-no-savings',
        priority: PRIORITY.HIGH,
        category: CATEGORY.BREAK_EVEN,
        title: 'No Monthly Savings',
        message: 'This consolidation does not produce monthly savings. The primary benefit would be simplifying payments or locking in a fixed rate.',
        suggestion: 'Consider if the intangible benefits (single payment, fixed rate) justify the closing costs.',
        icon: 'alert-circle'
      });
    }
    return recommendations;
  }

  if (breakEvenMonths > 60) {
    recommendations.push({
      id: 'breakeven-long',
      priority: PRIORITY.HIGH,
      category: CATEGORY.BREAK_EVEN,
      title: 'Long Break-Even Period',
      message: `It will take ${formatBreakEven(breakEvenMonths)} to recoup closing costs through monthly savings.`,
      suggestion: 'If you might sell or refinance within 5 years, this consolidation may not be cost-effective.',
      icon: 'clock'
    });
  } else if (breakEvenMonths > 36) {
    recommendations.push({
      id: 'breakeven-moderate',
      priority: PRIORITY.MEDIUM,
      category: CATEGORY.BREAK_EVEN,
      title: 'Moderate Break-Even',
      message: `Break-even occurs in ${formatBreakEven(breakEvenMonths)}. This makes sense if you plan to stay in the home for at least ${Math.ceil(breakEvenMonths / 12)} years.`,
      icon: 'info'
    });
  } else if (breakEvenMonths > 12) {
    recommendations.push({
      id: 'breakeven-reasonable',
      priority: PRIORITY.LOW,
      category: CATEGORY.BREAK_EVEN,
      title: 'Reasonable Break-Even',
      message: `You'll recoup closing costs in ${formatBreakEven(breakEvenMonths)}, after which all savings add to your bottom line.`,
      icon: 'check-circle'
    });
  } else {
    recommendations.push({
      id: 'breakeven-quick',
      priority: PRIORITY.INFO,
      category: CATEGORY.BREAK_EVEN,
      title: 'Quick Break-Even',
      message: `Excellent! Break-even in just ${formatBreakEven(breakEvenMonths)} means you'll quickly start benefiting from the consolidation.`,
      icon: 'zap'
    });
  }

  return recommendations;
}

/**
 * Generate interest rate arbitrage recommendations
 */
function generateInterestArbitrageRecommendations(results, inputs) {
  const recommendations = [];

  // Find high-rate debts
  const highRateDebts = (inputs.debtsToConsolidate || [])
    .filter(d => d.rate > 0.15 && d.balance > 0)
    .sort((a, b) => b.rate - a.rate);

  if (highRateDebts.length > 0) {
    const totalHighRateBalance = highRateDebts.reduce((sum, d) => sum + d.balance, 0);
    const highestRate = highRateDebts[0].rate;

    recommendations.push({
      id: 'interest-arbitrage',
      priority: PRIORITY.INFO,
      category: CATEGORY.INTEREST,
      title: 'Significant Interest Arbitrage',
      message: `You're eliminating ${formatCurrency(totalHighRateBalance)} of high-interest debt (up to ${formatRateAsPercent(highestRate)}) by rolling it into a much lower mortgage rate.`,
      suggestion: 'This interest rate arbitrage is a key benefit of consolidation.',
      icon: 'trending-down'
    });

    // Specific high-rate debt callout
    if (highRateDebts[0].balance >= 5000) {
      recommendations.push({
        id: 'interest-highlight',
        priority: PRIORITY.INFO,
        category: CATEGORY.OPPORTUNITY,
        title: `High-Rate ${highRateDebts[0].name || 'Debt'} Elimination`,
        message: `Eliminating the ${formatCurrency(highRateDebts[0].balance)} ${highRateDebts[0].name || 'debt'} at ${formatRateAsPercent(highRateDebts[0].rate)} is particularly impactful.`,
        icon: 'target'
      });
    }
  }

  // Check if new rate is higher than weighted average
  if (results.after.weightedRate > results.before.weightedRate) {
    recommendations.push({
      id: 'interest-rate-higher',
      priority: PRIORITY.MEDIUM,
      category: CATEGORY.INTEREST,
      title: 'Consider Rate Comparison',
      message: `The new consolidated rate (${formatRateAsPercent(results.after.weightedRate)}) is higher than your current weighted average (${formatRateAsPercent(results.before.weightedRate)}).`,
      suggestion: 'The benefit here is cash flow improvement, not interest savings. Ensure this aligns with your goals.',
      icon: 'alert-circle'
    });
  }

  return recommendations;
}

/**
 * Generate cash flow recommendations
 */
function generateCashFlowRecommendations(results, inputs, type) {
  const recommendations = [];
  const monthlySavings = type === 'heloc'
    ? results.savings.monthlyDraw
    : results.savings.monthly;

  if (monthlySavings > 500) {
    recommendations.push({
      id: 'cashflow-significant',
      priority: PRIORITY.INFO,
      category: CATEGORY.CASH_FLOW,
      title: 'Significant Cash Flow Improvement',
      message: `Freeing up ${formatCurrency(monthlySavings)}/month provides substantial financial flexibility.`,
      suggestion: 'Consider directing some savings to emergency fund or retirement accounts.',
      icon: 'dollar-sign'
    });
  }

  // Impact on qualifying for other loans
  if (results.after.backEndDTI < 36 && results.before.backEndDTI >= 36) {
    recommendations.push({
      id: 'cashflow-qualifying',
      priority: PRIORITY.MEDIUM,
      category: CATEGORY.CASH_FLOW,
      title: 'Improved Borrowing Capacity',
      message: 'Moving below 36% DTI significantly improves ability to qualify for additional financing (auto loans, credit cards, investment property).',
      icon: 'trending-up'
    });
  }

  return recommendations;
}

/**
 * Generate term-related recommendations
 */
function generateTermRecommendations(results, inputs) {
  const recommendations = [];

  // If extending term significantly
  const currentRemainingYears = (inputs.currentMortgage?.remainingTermMonths || 0) / 12;
  const newTermYears = (inputs.newLoan?.termMonths || 0) / 12;

  if (newTermYears > currentRemainingYears + 5) {
    recommendations.push({
      id: 'term-extension',
      priority: PRIORITY.MEDIUM,
      category: CATEGORY.TERM,
      title: 'Significant Term Extension',
      message: `Extending from ~${Math.round(currentRemainingYears)} years remaining to ${newTermYears} years will reduce payments but increase total interest paid.`,
      suggestion: 'Consider a shorter term if you can afford slightly higher payments to save on interest.',
      icon: 'clock'
    });
  }

  // Suggest shorter term if there's room
  if (results.savings.monthly > 200 && newTermYears >= 30) {
    recommendations.push({
      id: 'term-shorter-option',
      priority: PRIORITY.LOW,
      category: CATEGORY.TERM,
      title: 'Consider Shorter Term',
      message: 'With your monthly savings buffer, you might consider a 20 or 25-year term for significant interest savings.',
      suggestion: 'Run the numbers with a shorter term to compare total costs.',
      icon: 'lightbulb'
    });
  }

  return recommendations;
}

/**
 * Generate HELOC-specific rate recommendations
 */
function generateHELOCRateRecommendations(results, inputs) {
  const recommendations = [];

  recommendations.push({
    id: 'heloc-variable-rate',
    priority: PRIORITY.MEDIUM,
    category: CATEGORY.INTEREST,
    title: 'Variable Rate Consideration',
    message: 'HELOC rates are typically variable and tied to Prime Rate. Future rate increases will raise your payment.',
    suggestion: 'Budget for potential rate increases of 2-4% above current rates when planning affordability.',
    icon: 'trending-up'
  });

  return recommendations;
}

/**
 * Generate HELOC-specific recommendations
 */
function generateHELOCSpecificRecommendations(results, inputs) {
  const recommendations = [];

  // Draw period vs repayment
  const drawPayment = results.after.drawPeriod.monthlyPayment;
  const repayPayment = results.after.repaymentPeriod.monthlyPayment;

  if (repayPayment > drawPayment * 1.5) {
    recommendations.push({
      id: 'heloc-payment-shock',
      priority: PRIORITY.HIGH,
      category: CATEGORY.CASH_FLOW,
      title: 'Payment Increase After Draw Period',
      message: `Payment will increase from ${formatCurrency(drawPayment)} to ${formatCurrency(repayPayment)} when the draw period ends.`,
      suggestion: 'Plan ahead for this payment increase to avoid financial stress.',
      icon: 'alert-triangle'
    });
  }

  // Utilization recommendation
  if (results.analysis.helocUtilization > 80) {
    recommendations.push({
      id: 'heloc-utilization',
      priority: PRIORITY.LOW,
      category: CATEGORY.ALTERNATIVE,
      title: 'High HELOC Utilization',
      message: `Using ${formatPercent(results.analysis.helocUtilization)} of the credit limit leaves little buffer for emergencies.`,
      suggestion: 'Consider keeping some HELOC availability for unexpected expenses.',
      icon: 'info'
    });
  }

  return recommendations;
}

/**
 * Generate alternative/situational recommendations
 */
function generateAlternativeRecommendations(results, inputs, type) {
  const recommendations = [];

  // If consolidation doesn't make sense
  if (results.savings.monthly < 0 && results.savings.totalInterest < 0) {
    recommendations.push({
      id: 'alt-not-beneficial',
      priority: PRIORITY.HIGH,
      category: CATEGORY.ALTERNATIVE,
      title: 'Consolidation May Not Be Beneficial',
      message: 'This scenario results in both higher monthly payments and higher total interest.',
      suggestion: 'Consider alternative strategies like debt snowball/avalanche, balance transfers, or negotiating with creditors.',
      icon: 'x-circle'
    });
  }

  // Small debts that could be paid off directly
  const smallDebts = (inputs.debtsToConsolidate || [])
    .filter(d => d.balance > 0 && d.balance < 3000);

  if (smallDebts.length > 0 && type === 'cashout') {
    const totalSmall = smallDebts.reduce((sum, d) => sum + d.balance, 0);
    if (totalSmall < inputs.additionalCashOut) {
      recommendations.push({
        id: 'alt-payoff-small',
        priority: PRIORITY.LOW,
        category: CATEGORY.ALTERNATIVE,
        title: 'Consider Separate Payoff Strategy',
        message: `You have ${formatCurrency(totalSmall)} in small debts that could potentially be paid off with savings or bonus money.`,
        suggestion: 'Paying these off directly avoids rolling them into 30 years of mortgage payments.',
        icon: 'lightbulb'
      });
    }
  }

  return recommendations;
}

/**
 * Get the appropriate icon component name for a recommendation
 * @param {string} iconName - Icon identifier
 * @returns {string} Icon component name
 */
export function getRecommendationIcon(iconName) {
  const iconMap = {
    'alert-triangle': 'AlertTriangle',
    'alert-circle': 'AlertCircle',
    'x-circle': 'XCircle',
    'check-circle': 'CheckCircle',
    'info': 'Info',
    'lightbulb': 'Lightbulb',
    'clock': 'Clock',
    'trending-up': 'TrendingUp',
    'trending-down': 'TrendingDown',
    'dollar-sign': 'DollarSign',
    'zap': 'Zap',
    'target': 'Target'
  };

  return iconMap[iconName] || 'Info';
}

/**
 * Get priority color for styling
 * @param {string} priority - Priority level
 * @returns {string} Tailwind color class
 */
export function getPriorityColor(priority) {
  const colors = {
    critical: 'red',
    high: 'orange',
    medium: 'yellow',
    low: 'blue',
    info: 'green'
  };

  return colors[priority] || 'gray';
}
