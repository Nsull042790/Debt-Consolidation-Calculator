/**
 * Financial Calculations for Debt Consolidation Calculator
 * All calculations follow standard mortgage industry formulas
 */

/**
 * Calculate monthly mortgage payment using standard amortization formula
 * @param {number} principal - Loan principal amount
 * @param {number} annualRate - Annual interest rate as decimal (e.g., 0.065 for 6.5%)
 * @param {number} termMonths - Loan term in months
 * @returns {number} Monthly payment amount
 */
export function calculateMonthlyPayment(principal, annualRate, termMonths) {
  if (principal <= 0 || termMonths <= 0) return 0;
  if (annualRate === 0) return principal / termMonths;

  const monthlyRate = annualRate / 12;
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
                  (Math.pow(1 + monthlyRate, termMonths) - 1);

  return isFinite(payment) ? payment : 0;
}

/**
 * Calculate total interest paid over the life of a loan
 * @param {number} principal - Loan principal
 * @param {number} annualRate - Annual interest rate as decimal
 * @param {number} termMonths - Loan term in months
 * @returns {number} Total interest paid
 */
export function calculateTotalInterest(principal, annualRate, termMonths) {
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termMonths);
  const totalPaid = monthlyPayment * termMonths;
  return Math.max(0, totalPaid - principal);
}

/**
 * Calculate total interest for a debt paid with minimum payments
 * @param {number} balance - Current balance
 * @param {number} annualRate - Annual interest rate as decimal
 * @param {number} monthlyPayment - Minimum monthly payment
 * @returns {{ totalInterest: number, monthsToPayoff: number }}
 */
export function calculateDebtPayoff(balance, annualRate, monthlyPayment) {
  if (balance <= 0 || monthlyPayment <= 0) {
    return { totalInterest: 0, monthsToPayoff: 0 };
  }

  const monthlyRate = annualRate / 12;
  let remainingBalance = balance;
  let totalInterest = 0;
  let months = 0;
  const maxMonths = 600; // 50 years max to prevent infinite loops

  // Check if payment is enough to cover interest
  const monthlyInterest = remainingBalance * monthlyRate;
  if (monthlyPayment <= monthlyInterest && monthlyRate > 0) {
    // Payment doesn't cover interest - will never pay off
    return { totalInterest: Infinity, monthsToPayoff: Infinity };
  }

  while (remainingBalance > 0.01 && months < maxMonths) {
    const interestCharge = remainingBalance * monthlyRate;
    totalInterest += interestCharge;
    remainingBalance = remainingBalance + interestCharge - monthlyPayment;
    months++;

    if (remainingBalance < 0) {
      remainingBalance = 0;
    }
  }

  return { totalInterest, monthsToPayoff: months };
}

/**
 * Calculate weighted average interest rate for multiple debts
 * @param {Array<{balance: number, rate: number}>} debts - Array of debt objects
 * @returns {number} Weighted average rate as decimal
 */
export function calculateWeightedAverageRate(debts) {
  const totalBalance = debts.reduce((sum, d) => sum + (d.balance || 0), 0);
  if (totalBalance === 0) return 0;

  const weightedSum = debts.reduce((sum, d) => sum + (d.balance || 0) * (d.rate || 0), 0);
  return weightedSum / totalBalance;
}

/**
 * Calculate Loan-to-Value ratio
 * @param {number} loanAmount - Total loan amount
 * @param {number} homeValue - Home value
 * @returns {number} LTV as a percentage (e.g., 80 for 80%)
 */
export function calculateLTV(loanAmount, homeValue) {
  if (homeValue <= 0) return 0;
  return (loanAmount / homeValue) * 100;
}

/**
 * Calculate Combined Loan-to-Value ratio (for HELOC scenarios)
 * @param {number} firstMortgageBalance - First mortgage balance
 * @param {number} secondLoanAmount - HELOC or second mortgage amount
 * @param {number} homeValue - Home value
 * @returns {number} CLTV as a percentage
 */
export function calculateCLTV(firstMortgageBalance, secondLoanAmount, homeValue) {
  if (homeValue <= 0) return 0;
  return ((firstMortgageBalance + secondLoanAmount) / homeValue) * 100;
}

/**
 * Calculate front-end DTI (housing costs / gross income)
 * @param {number} housingPayment - Monthly housing payment (PITI)
 * @param {number} grossMonthlyIncome - Gross monthly income
 * @returns {number} Front-end DTI as percentage
 */
export function calculateFrontEndDTI(housingPayment, grossMonthlyIncome) {
  if (grossMonthlyIncome <= 0) return 0;
  return (housingPayment / grossMonthlyIncome) * 100;
}

/**
 * Calculate back-end DTI (all debts / gross income)
 * @param {number} totalMonthlyDebt - Total monthly debt payments
 * @param {number} grossMonthlyIncome - Gross monthly income
 * @returns {number} Back-end DTI as percentage
 */
export function calculateBackEndDTI(totalMonthlyDebt, grossMonthlyIncome) {
  if (grossMonthlyIncome <= 0) return 0;
  return (totalMonthlyDebt / grossMonthlyIncome) * 100;
}

/**
 * Get DTI status and color coding
 * @param {number} dti - DTI percentage
 * @param {string} type - 'front' or 'back'
 * @returns {{ status: string, color: string, message: string }}
 */
export function getDTIStatus(dti, type = 'back') {
  if (type === 'front') {
    if (dti <= 28) return { status: 'ideal', color: 'success', message: 'Ideal range' };
    if (dti <= 31) return { status: 'acceptable', color: 'warning', message: 'Acceptable' };
    return { status: 'high', color: 'danger', message: 'Above guidelines' };
  }

  // Back-end DTI
  if (dti < 36) return { status: 'ideal', color: 'success', message: 'Ideal range (<36%)' };
  if (dti < 43) return { status: 'caution', color: 'warning', message: 'Caution (36-43%)' };
  if (dti < 50) return { status: 'warning', color: 'caution', message: 'Warning (43-50%)' };
  return { status: 'fail', color: 'danger', message: 'Exceeds guidelines (>50%)' };
}

/**
 * Get LTV status and warnings
 * @param {number} ltv - LTV percentage
 * @returns {{ status: string, color: string, message: string, pmiRequired: boolean }}
 */
export function getLTVStatus(ltv) {
  if (ltv <= 80) {
    return { status: 'good', color: 'success', message: 'No PMI required', pmiRequired: false };
  }
  if (ltv <= 90) {
    return { status: 'caution', color: 'warning', message: 'PMI may apply', pmiRequired: true };
  }
  if (ltv <= 95) {
    return { status: 'warning', color: 'caution', message: 'High LTV - Higher risk', pmiRequired: true };
  }
  return { status: 'stop', color: 'danger', message: 'Exceeds typical lending limits', pmiRequired: true };
}

/**
 * Calculate break-even months (months to recoup closing costs from savings)
 * @param {number} closingCosts - Total closing costs
 * @param {number} monthlySavings - Monthly payment savings
 * @returns {number} Number of months to break even (Infinity if no savings)
 */
export function calculateBreakEven(closingCosts, monthlySavings) {
  if (monthlySavings <= 0) return Infinity;
  return Math.ceil(closingCosts / monthlySavings);
}

/**
 * Calculate cash-out refinance results
 * @param {object} params - Calculation parameters
 * @returns {object} Comprehensive calculation results
 */
export function calculateCashOutRefinance({
  currentMortgage,
  homeValue,
  debtsToConsolidate,
  additionalCashOut,
  newLoan,
  grossMonthlyIncome
}) {
  // Current mortgage details
  const currentMortgagePayment = currentMortgage.payment ||
    calculateMonthlyPayment(currentMortgage.balance, currentMortgage.rate, currentMortgage.remainingTermMonths);

  // Sum of debts to consolidate
  const totalDebtBalance = debtsToConsolidate.reduce((sum, d) => sum + (parseFloat(d.balance) || 0), 0);
  const totalDebtPayments = debtsToConsolidate.reduce((sum, d) => sum + (parseFloat(d.monthlyPayment) || 0), 0);

  // Calculate total interest on current debts if paid with minimums
  let totalDebtInterestCurrent = 0;
  debtsToConsolidate.forEach(debt => {
    const { totalInterest } = calculateDebtPayoff(
      parseFloat(debt.balance) || 0,
      parseFloat(debt.rate) || 0,
      parseFloat(debt.monthlyPayment) || 0
    );
    if (isFinite(totalInterest)) {
      totalDebtInterestCurrent += totalInterest;
    }
  });

  // Current remaining mortgage interest
  const currentMortgageInterest = calculateTotalInterest(
    currentMortgage.balance,
    currentMortgage.rate,
    currentMortgage.remainingTermMonths
  );

  // New loan amount
  const newLoanAmount = (currentMortgage.balance || 0) + totalDebtBalance + (additionalCashOut || 0) + (newLoan.closingCosts || 0);

  // New monthly payment
  const newMonthlyPayment = calculateMonthlyPayment(
    newLoanAmount,
    newLoan.rate,
    newLoan.termMonths
  );

  // New loan total interest
  const newLoanTotalInterest = calculateTotalInterest(
    newLoanAmount,
    newLoan.rate,
    newLoan.termMonths
  );

  // Before totals
  const beforeMonthlyPayment = currentMortgagePayment + totalDebtPayments;
  const beforeTotalInterest = currentMortgageInterest + totalDebtInterestCurrent;

  // After totals (just the new mortgage payment since debts are consolidated)
  const afterMonthlyPayment = newMonthlyPayment;
  const afterTotalInterest = newLoanTotalInterest;

  // Savings
  const monthlySavings = beforeMonthlyPayment - afterMonthlyPayment;
  const totalInterestSavings = beforeTotalInterest - afterTotalInterest;

  // Weighted average rates
  const beforeWeightedRate = calculateWeightedAverageRate([
    { balance: currentMortgage.balance, rate: currentMortgage.rate },
    ...debtsToConsolidate.map(d => ({ balance: parseFloat(d.balance) || 0, rate: parseFloat(d.rate) || 0 }))
  ]);
  const afterWeightedRate = newLoan.rate;

  // LTV calculations
  const currentLTV = calculateLTV(currentMortgage.balance, homeValue);
  const newLTV = calculateLTV(newLoanAmount, homeValue);

  // DTI calculations
  const beforeFrontEndDTI = calculateFrontEndDTI(currentMortgagePayment, grossMonthlyIncome);
  const beforeBackEndDTI = calculateBackEndDTI(beforeMonthlyPayment, grossMonthlyIncome);
  const afterFrontEndDTI = calculateFrontEndDTI(newMonthlyPayment, grossMonthlyIncome);
  const afterBackEndDTI = calculateBackEndDTI(newMonthlyPayment, grossMonthlyIncome);

  // Break-even analysis
  const breakEvenMonths = calculateBreakEven(newLoan.closingCosts || 0, monthlySavings);

  return {
    before: {
      monthlyPayment: beforeMonthlyPayment,
      mortgagePayment: currentMortgagePayment,
      debtPayments: totalDebtPayments,
      totalInterest: beforeTotalInterest,
      weightedRate: beforeWeightedRate,
      ltv: currentLTV,
      frontEndDTI: beforeFrontEndDTI,
      backEndDTI: beforeBackEndDTI
    },
    after: {
      monthlyPayment: afterMonthlyPayment,
      totalInterest: afterTotalInterest,
      weightedRate: afterWeightedRate,
      ltv: newLTV,
      loanAmount: newLoanAmount,
      frontEndDTI: afterFrontEndDTI,
      backEndDTI: afterBackEndDTI
    },
    savings: {
      monthly: monthlySavings,
      totalInterest: totalInterestSavings,
      breakEvenMonths
    },
    analysis: {
      ltvStatus: getLTVStatus(newLTV),
      dtiStatus: getDTIStatus(afterBackEndDTI, 'back'),
      frontEndDTIStatus: getDTIStatus(afterFrontEndDTI, 'front')
    },
    debts: {
      totalBalance: totalDebtBalance,
      totalPayments: totalDebtPayments,
      count: debtsToConsolidate.filter(d => parseFloat(d.balance) > 0).length
    }
  };
}

/**
 * Calculate HELOC/HEL consolidation results
 * @param {object} params - Calculation parameters
 * @returns {object} Comprehensive calculation results
 */
export function calculateHELOC({
  firstMortgage,
  homeValue,
  debtsToConsolidate,
  helocDetails,
  grossMonthlyIncome
}) {
  // First mortgage stays the same
  const firstMortgagePayment = firstMortgage.payment || 0;

  // Sum of debts to consolidate
  const totalDebtBalance = debtsToConsolidate.reduce((sum, d) => sum + (parseFloat(d.balance) || 0), 0);
  const totalDebtPayments = debtsToConsolidate.reduce((sum, d) => sum + (parseFloat(d.monthlyPayment) || 0), 0);

  // Calculate total interest on current debts if paid with minimums
  let totalDebtInterestCurrent = 0;
  debtsToConsolidate.forEach(debt => {
    const { totalInterest } = calculateDebtPayoff(
      parseFloat(debt.balance) || 0,
      parseFloat(debt.rate) || 0,
      parseFloat(debt.monthlyPayment) || 0
    );
    if (isFinite(totalInterest)) {
      totalDebtInterestCurrent += totalInterest;
    }
  });

  // HELOC amount needed
  const helocAmount = totalDebtBalance;

  // HELOC payment calculation
  // During draw period: interest-only payments
  // During repayment period: amortized payments
  const helocMonthlyRate = (helocDetails.rate || 0) / 12;
  const interestOnlyPayment = helocAmount * helocMonthlyRate;

  // Repayment period amortized payment
  const repaymentPayment = calculateMonthlyPayment(
    helocAmount,
    helocDetails.rate,
    helocDetails.repaymentTermMonths
  );

  // Total interest over HELOC life
  const drawPeriodInterest = interestOnlyPayment * helocDetails.drawPeriodMonths;
  const repaymentInterest = calculateTotalInterest(
    helocAmount,
    helocDetails.rate,
    helocDetails.repaymentTermMonths
  );
  const totalHelocInterest = drawPeriodInterest + repaymentInterest;

  // Before totals
  const beforeMonthlyPayment = firstMortgagePayment + totalDebtPayments;
  const beforeTotalInterest = totalDebtInterestCurrent;

  // After totals (during draw period with interest-only HELOC)
  const afterMonthlyPaymentDraw = firstMortgagePayment + interestOnlyPayment;
  // After totals (during repayment period)
  const afterMonthlyPaymentRepay = firstMortgagePayment + repaymentPayment;

  // Savings (using draw period for initial comparison)
  const monthlySavingsDraw = beforeMonthlyPayment - afterMonthlyPaymentDraw;
  const monthlySavingsRepay = beforeMonthlyPayment - afterMonthlyPaymentRepay;
  const totalInterestSavings = beforeTotalInterest - totalHelocInterest;

  // Weighted average rates
  const beforeWeightedRate = calculateWeightedAverageRate([
    { balance: firstMortgage.balance, rate: firstMortgage.rate || 0 },
    ...debtsToConsolidate.map(d => ({ balance: parseFloat(d.balance) || 0, rate: parseFloat(d.rate) || 0 }))
  ]);

  // CLTV calculations
  const currentLTV = calculateLTV(firstMortgage.balance, homeValue);
  const newCLTV = calculateCLTV(firstMortgage.balance, helocAmount, homeValue);

  // DTI calculations
  const beforeBackEndDTI = calculateBackEndDTI(beforeMonthlyPayment, grossMonthlyIncome);
  const afterBackEndDTIDraw = calculateBackEndDTI(afterMonthlyPaymentDraw, grossMonthlyIncome);
  const afterBackEndDTIRepay = calculateBackEndDTI(afterMonthlyPaymentRepay, grossMonthlyIncome);

  return {
    before: {
      monthlyPayment: beforeMonthlyPayment,
      mortgagePayment: firstMortgagePayment,
      debtPayments: totalDebtPayments,
      totalInterest: beforeTotalInterest,
      weightedRate: beforeWeightedRate,
      ltv: currentLTV,
      backEndDTI: beforeBackEndDTI
    },
    after: {
      drawPeriod: {
        monthlyPayment: afterMonthlyPaymentDraw,
        helocPayment: interestOnlyPayment
      },
      repaymentPeriod: {
        monthlyPayment: afterMonthlyPaymentRepay,
        helocPayment: repaymentPayment
      },
      totalInterest: totalHelocInterest,
      weightedRate: helocDetails.rate,
      cltv: newCLTV,
      helocAmount,
      backEndDTIDraw: afterBackEndDTIDraw,
      backEndDTIRepay: afterBackEndDTIRepay
    },
    savings: {
      monthlyDraw: monthlySavingsDraw,
      monthlyRepay: monthlySavingsRepay,
      totalInterest: totalInterestSavings
    },
    analysis: {
      cltvStatus: getLTVStatus(newCLTV),
      dtiStatusDraw: getDTIStatus(afterBackEndDTIDraw, 'back'),
      dtiStatusRepay: getDTIStatus(afterBackEndDTIRepay, 'back'),
      availableEquity: homeValue - firstMortgage.balance,
      helocUtilization: helocDetails.creditLimit > 0 ? (helocAmount / helocDetails.creditLimit) * 100 : 0
    },
    debts: {
      totalBalance: totalDebtBalance,
      totalPayments: totalDebtPayments,
      count: debtsToConsolidate.filter(d => parseFloat(d.balance) > 0).length
    }
  };
}

/**
 * Calculate amortization schedule
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate as decimal
 * @param {number} termMonths - Loan term in months
 * @returns {Array} Amortization schedule
 */
export function calculateAmortizationSchedule(principal, annualRate, termMonths) {
  const schedule = [];
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termMonths);
  const monthlyRate = annualRate / 12;
  let balance = principal;

  for (let month = 1; month <= termMonths && balance > 0; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = Math.min(monthlyPayment - interestPayment, balance);
    balance = balance - principalPayment;

    schedule.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, balance)
    });
  }

  return schedule;
}
