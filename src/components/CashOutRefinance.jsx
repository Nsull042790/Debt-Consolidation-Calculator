import { useState, useMemo, useCallback } from 'react';
import DebtEntry from './DebtEntry';
import ResultsSummary from './ResultsSummary';
import DTIGauge from './DTIGauge';
import LTVIndicator from './LTVIndicator';
import AIRecommendations from './AIRecommendations';
import { calculateCashOutRefinance } from '../utils/calculations';
import { generateCashOutRecommendations } from '../utils/recommendations';
import { formatCurrency, formatPercent } from '../utils/formatters';

/**
 * Input field component with label and optional prefix/suffix
 */
function InputField({ label, value, onChange, prefix, suffix, type = 'number', placeholder, helpText, min, max, step, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={`
            w-full py-2.5 border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue
            transition-colors
            ${prefix ? 'pl-7' : 'pl-3'}
            ${suffix ? 'pr-12' : 'pr-3'}
          `}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {helpText && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
}

/**
 * Section card component
 */
function Section({ title, icon: Icon, children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className="w-10 h-10 rounded-lg bg-navy/5 flex items-center justify-center">
              <Icon className="w-5 h-5 text-navy" />
            </div>
          )}
          <h3 className="font-semibold text-navy">{title}</h3>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

/**
 * Cash-Out Refinance Calculator Tab
 */
export default function CashOutRefinance({ onResultsChange }) {
  // Current Mortgage State
  const [currentMortgage, setCurrentMortgage] = useState({
    balance: 250000,
    rate: 0.0625,
    remainingTermMonths: 300,
    payment: 0 // Will be calculated or entered
  });

  // Home Value
  const [homeValue, setHomeValue] = useState(400000);

  // Debts to Consolidate
  const [debts, setDebts] = useState([
    { id: 1, type: 'credit_card', name: 'Credit Card 1', balance: 8500, rate: 0.2199, monthlyPayment: 255 },
    { id: 2, type: 'auto_loan', name: 'Auto Loan', balance: 15000, rate: 0.0699, monthlyPayment: 350 }
  ]);

  // Additional Cash Out
  const [additionalCashOut, setAdditionalCashOut] = useState(0);

  // New Loan Details
  const [newLoan, setNewLoan] = useState({
    rate: 0.0699,
    termMonths: 360,
    closingCosts: 6000
  });

  // Gross Monthly Income
  const [grossMonthlyIncome, setGrossMonthlyIncome] = useState(8500);

  // Input Mode: 'debts' or 'amount'
  const [inputMode, setInputMode] = useState('debts');
  const [targetLoanAmount, setTargetLoanAmount] = useState(0);

  // Calculate results
  const results = useMemo(() => {
    const inputs = {
      currentMortgage,
      homeValue,
      debtsToConsolidate: inputMode === 'debts' ? debts : [],
      additionalCashOut: inputMode === 'debts'
        ? additionalCashOut
        : targetLoanAmount - currentMortgage.balance - newLoan.closingCosts,
      newLoan,
      grossMonthlyIncome
    };

    const calcResults = calculateCashOutRefinance(inputs);

    // Notify parent of results change
    if (onResultsChange) {
      onResultsChange(calcResults, inputs, 'cashout');
    }

    return calcResults;
  }, [currentMortgage, homeValue, debts, additionalCashOut, newLoan, grossMonthlyIncome, inputMode, targetLoanAmount, onResultsChange]);

  // Generate AI recommendations
  const recommendations = useMemo(() => {
    return generateCashOutRecommendations(results, {
      currentMortgage,
      homeValue,
      debtsToConsolidate: debts,
      additionalCashOut,
      newLoan,
      grossMonthlyIncome
    });
  }, [results, currentMortgage, homeValue, debts, additionalCashOut, newLoan, grossMonthlyIncome]);

  // Update current mortgage field
  const updateCurrentMortgage = useCallback((field, value) => {
    setCurrentMortgage(prev => ({ ...prev, [field]: value }));
  }, []);

  // Update new loan field
  const updateNewLoan = useCallback((field, value) => {
    setNewLoan(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Mortgage Section */}
          <Section title="Current Mortgage" icon={HomeIcon}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <InputField
                label="Current Balance"
                value={currentMortgage.balance || ''}
                onChange={(v) => updateCurrentMortgage('balance', v)}
                prefix="$"
                placeholder="250,000"
                step={1000}
              />
              <InputField
                label="Interest Rate"
                value={currentMortgage.rate ? (currentMortgage.rate * 100).toFixed(3) : ''}
                onChange={(v) => updateCurrentMortgage('rate', v / 100)}
                suffix="%"
                placeholder="6.25"
                step={0.125}
              />
              <InputField
                label="Remaining Term"
                value={currentMortgage.remainingTermMonths || ''}
                onChange={(v) => updateCurrentMortgage('remainingTermMonths', v)}
                suffix="months"
                placeholder="300"
                helpText="Enter months remaining"
              />
              <InputField
                label="Home Value"
                value={homeValue || ''}
                onChange={setHomeValue}
                prefix="$"
                placeholder="400,000"
                step={5000}
              />
            </div>

            {/* Current LTV Display */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Current LTV</span>
                <span className="font-semibold text-navy">
                  {formatPercent(results.before.ltv)}
                </span>
              </div>
            </div>
          </Section>

          {/* Input Mode Toggle */}
          <div className="bg-gradient-to-r from-purple/5 to-pink/5 rounded-xl p-4 border border-purple/20">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-navy">How would you like to calculate?</span>
              <div className="flex rounded-lg bg-white shadow-sm border border-gray-200 p-0.5">
                <button
                  onClick={() => setInputMode('debts')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    inputMode === 'debts'
                      ? 'bg-navy text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Enter Debts
                </button>
                <button
                  onClick={() => setInputMode('amount')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    inputMode === 'amount'
                      ? 'bg-navy text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Enter Amount
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {inputMode === 'debts'
                ? 'Enter individual debts to see exactly what you\'re paying off'
                : 'Enter a target loan amount directly if you already know the total'}
            </p>
          </div>

          {/* Debts or Amount Input */}
          {inputMode === 'debts' ? (
            <>
              <DebtEntry
                debts={debts}
                onChange={setDebts}
                maxDebts={15}
              />

              {/* Additional Cash Out */}
              <Section title="Additional Cash Out" icon={DollarIcon}>
                <div className="max-w-xs">
                  <InputField
                    label="Cash Out Amount"
                    value={additionalCashOut || ''}
                    onChange={setAdditionalCashOut}
                    prefix="$"
                    placeholder="0"
                    step={1000}
                    helpText="Extra cash beyond debt payoff (home improvements, reserves, etc.)"
                  />
                </div>
              </Section>
            </>
          ) : (
            <Section title="Target Loan Amount" icon={CalculatorIcon}>
              <div className="max-w-md">
                <InputField
                  label="New Loan Amount"
                  value={targetLoanAmount || ''}
                  onChange={setTargetLoanAmount}
                  prefix="$"
                  placeholder="300,000"
                  step={5000}
                  helpText="Total amount of your new mortgage (including payoff of current mortgage)"
                />
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Cash available:</span>{' '}
                    {formatCurrency(Math.max(0, targetLoanAmount - currentMortgage.balance - newLoan.closingCosts))}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    New loan - current balance - closing costs
                  </p>
                </div>
              </div>
            </Section>
          )}

          {/* New Loan Details */}
          <Section title="New Loan Details" icon={DocumentIcon}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputField
                label="New Interest Rate"
                value={newLoan.rate ? (newLoan.rate * 100).toFixed(3) : ''}
                onChange={(v) => updateNewLoan('rate', v / 100)}
                suffix="%"
                placeholder="6.99"
                step={0.125}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Term
                </label>
                <select
                  value={newLoan.termMonths}
                  onChange={(e) => updateNewLoan('termMonths', parseInt(e.target.value))}
                  className="w-full py-2.5 px-3 border border-gray-300 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue"
                >
                  <option value={180}>15 years</option>
                  <option value={240}>20 years</option>
                  <option value={300}>25 years</option>
                  <option value={360}>30 years</option>
                </select>
              </div>
              <InputField
                label="Closing Costs"
                value={newLoan.closingCosts || ''}
                onChange={(v) => updateNewLoan('closingCosts', v)}
                prefix="$"
                placeholder="6,000"
                step={500}
                helpText="Rolled into loan balance"
              />
            </div>
          </Section>

          {/* Income for DTI */}
          <Section title="Income Information" icon={UserIcon}>
            <div className="max-w-xs">
              <InputField
                label="Gross Monthly Income"
                value={grossMonthlyIncome || ''}
                onChange={setGrossMonthlyIncome}
                prefix="$"
                placeholder="8,500"
                step={100}
                helpText="Combined household income before taxes"
              />
            </div>
          </Section>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {/* Main Results Summary */}
          <ResultsSummary results={results} type="cashout" />

          {/* DTI Gauges */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-navy mb-4">Debt-to-Income Analysis</h3>
            <div className="space-y-4">
              <DTIGauge
                label="Front-End DTI"
                value={results.after.frontEndDTI}
                beforeValue={results.before.frontEndDTI}
                type="front"
              />
              <DTIGauge
                label="Back-End DTI"
                value={results.after.backEndDTI}
                beforeValue={results.before.backEndDTI}
                type="back"
              />
            </div>
          </div>

          {/* LTV Indicator */}
          <LTVIndicator
            currentLTV={results.before.ltv}
            newLTV={results.after.ltv}
            homeValue={homeValue}
          />
        </div>
      </div>

      {/* AI Recommendations - Full Width */}
      <div className="mt-6">
        <AIRecommendations recommendations={recommendations} />
      </div>
    </div>
  );
}

// Icon Components
function HomeIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function DollarIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CalculatorIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

function DocumentIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function UserIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
