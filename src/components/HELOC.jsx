import { useState, useMemo, useCallback } from 'react';
import DebtEntry from './DebtEntry';
import ResultsSummary from './ResultsSummary';
import DTIGauge from './DTIGauge';
import LTVIndicator from './LTVIndicator';
import AIRecommendations from './AIRecommendations';
import { calculateHELOC } from '../utils/calculations';
import { generateHELOCRecommendations } from '../utils/recommendations';
import { formatCurrency, formatPercent } from '../utils/formatters';

/**
 * Input field component
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
function Section({ title, icon: Icon, children, className = '', accentColor = 'navy' }) {
  const accentClasses = {
    navy: 'bg-navy/5 text-navy',
    purple: 'bg-purple/10 text-purple',
    pink: 'bg-pink/10 text-pink',
    gold: 'bg-gold/10 text-gold'
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accentClasses[accentColor]}`}>
              <Icon className="w-5 h-5" />
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
 * HELOC/Home Equity Calculator Tab
 */
export default function HELOC({ onResultsChange }) {
  // First Mortgage State (stays in place)
  const [firstMortgage, setFirstMortgage] = useState({
    balance: 250000,
    rate: 0.0375, // Typically lower since it's existing
    payment: 1389
  });

  // Home Value
  const [homeValue, setHomeValue] = useState(450000);

  // Debts to Consolidate
  const [debts, setDebts] = useState([
    { id: 1, type: 'credit_card', name: 'Credit Card 1', balance: 12000, rate: 0.2399, monthlyPayment: 360 },
    { id: 2, type: 'credit_card', name: 'Credit Card 2', balance: 8000, rate: 0.1999, monthlyPayment: 240 }
  ]);

  // HELOC Details
  const [helocDetails, setHelocDetails] = useState({
    rate: 0.0875, // HELOC rates typically higher, variable
    drawPeriodMonths: 120, // 10 year draw period
    repaymentTermMonths: 240, // 20 year repayment
    creditLimit: 100000
  });

  // Gross Monthly Income
  const [grossMonthlyIncome, setGrossMonthlyIncome] = useState(9500);

  // Calculate results
  const results = useMemo(() => {
    const inputs = {
      firstMortgage,
      homeValue,
      debtsToConsolidate: debts,
      helocDetails,
      grossMonthlyIncome
    };

    const calcResults = calculateHELOC(inputs);

    // Notify parent of results change
    if (onResultsChange) {
      onResultsChange(calcResults, inputs, 'heloc');
    }

    return calcResults;
  }, [firstMortgage, homeValue, debts, helocDetails, grossMonthlyIncome, onResultsChange]);

  // Generate AI recommendations
  const recommendations = useMemo(() => {
    return generateHELOCRecommendations(results, {
      firstMortgage,
      homeValue,
      debtsToConsolidate: debts,
      helocDetails,
      grossMonthlyIncome
    });
  }, [results, firstMortgage, homeValue, debts, helocDetails, grossMonthlyIncome]);

  // Update first mortgage field
  const updateFirstMortgage = useCallback((field, value) => {
    setFirstMortgage(prev => ({ ...prev, [field]: value }));
  }, []);

  // Update HELOC details field
  const updateHelocDetails = useCallback((field, value) => {
    setHelocDetails(prev => ({ ...prev, [field]: value }));
  }, []);

  // Calculate available equity
  const availableEquity = homeValue - firstMortgage.balance;
  const maxHELOC = availableEquity * 0.85; // Typical 85% CLTV limit

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-purple/10 via-pink/5 to-light-blue/10 rounded-xl p-4 border border-purple/20">
            <div className="flex items-start space-x-3">
              <InfoIcon className="w-5 h-5 text-purple flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-navy">HELOC vs Cash-Out Refinance</p>
                <p className="text-xs text-gray-600 mt-1">
                  A HELOC keeps your existing mortgage intact and adds a second line of credit.
                  This is ideal if you have a low rate on your first mortgage that you want to keep.
                </p>
              </div>
            </div>
          </div>

          {/* First Mortgage Section */}
          <Section title="Existing First Mortgage" icon={HomeIcon}>
            <p className="text-sm text-gray-500 mb-4">
              Your first mortgage remains unchanged with a HELOC. Enter your current details.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputField
                label="Current Balance"
                value={firstMortgage.balance || ''}
                onChange={(v) => updateFirstMortgage('balance', v)}
                prefix="$"
                placeholder="250,000"
                step={1000}
              />
              <InputField
                label="Interest Rate"
                value={firstMortgage.rate ? (firstMortgage.rate * 100).toFixed(3) : ''}
                onChange={(v) => updateFirstMortgage('rate', v / 100)}
                suffix="%"
                placeholder="3.75"
                step={0.125}
              />
              <InputField
                label="Monthly Payment"
                value={firstMortgage.payment || ''}
                onChange={(v) => updateFirstMortgage('payment', v)}
                prefix="$"
                placeholder="1,389"
                step={10}
                helpText="Principal & Interest"
              />
            </div>
          </Section>

          {/* Home Value & Equity */}
          <Section title="Home Value & Available Equity" icon={ChartIcon} accentColor="gold">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Current Home Value"
                value={homeValue || ''}
                onChange={setHomeValue}
                prefix="$"
                placeholder="450,000"
                step={5000}
              />
              <div className="bg-gradient-to-br from-gold/10 to-white rounded-lg p-4 border border-gold/20">
                <p className="text-xs text-gray-500">Available Equity</p>
                <p className="text-2xl font-bold text-navy">{formatCurrency(availableEquity, false)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Max HELOC (~85% CLTV): {formatCurrency(maxHELOC, false)}
                </p>
              </div>
            </div>
          </Section>

          {/* Debts to Consolidate */}
          <DebtEntry
            debts={debts}
            onChange={setDebts}
            maxDebts={15}
          />

          {/* HELOC Details */}
          <Section title="HELOC/HEL Terms" icon={CreditIcon} accentColor="purple">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <InputField
                label="HELOC Rate"
                value={helocDetails.rate ? (helocDetails.rate * 100).toFixed(3) : ''}
                onChange={(v) => updateHelocDetails('rate', v / 100)}
                suffix="%"
                placeholder="8.75"
                step={0.125}
                helpText="Usually variable rate"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Draw Period
                </label>
                <select
                  value={helocDetails.drawPeriodMonths}
                  onChange={(e) => updateHelocDetails('drawPeriodMonths', parseInt(e.target.value))}
                  className="w-full py-2.5 px-3 border border-gray-300 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue"
                >
                  <option value={60}>5 years</option>
                  <option value={120}>10 years</option>
                  <option value={180}>15 years</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">Interest-only payments</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repayment Period
                </label>
                <select
                  value={helocDetails.repaymentTermMonths}
                  onChange={(e) => updateHelocDetails('repaymentTermMonths', parseInt(e.target.value))}
                  className="w-full py-2.5 px-3 border border-gray-300 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue"
                >
                  <option value={120}>10 years</option>
                  <option value={180}>15 years</option>
                  <option value={240}>20 years</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">Amortized payments</p>
              </div>
              <InputField
                label="Credit Limit"
                value={helocDetails.creditLimit || ''}
                onChange={(v) => updateHelocDetails('creditLimit', v)}
                prefix="$"
                placeholder="100,000"
                step={5000}
                helpText="Total line available"
              />
            </div>

            {/* HELOC amount needed */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Amount Needed for Consolidation</p>
                  <p className="text-xs text-gray-500">Total debt balances to pay off</p>
                </div>
                <p className="text-xl font-bold text-purple">
                  {formatCurrency(results.debts.totalBalance, false)}
                </p>
              </div>

              {results.debts.totalBalance > maxHELOC && (
                <div className="mt-3 p-3 bg-danger-light rounded-lg border border-danger/30">
                  <div className="flex items-center space-x-2">
                    <AlertIcon className="w-5 h-5 text-danger" />
                    <p className="text-sm text-danger font-medium">
                      Debt total exceeds available equity
                    </p>
                  </div>
                </div>
              )}

              {results.debts.totalBalance > helocDetails.creditLimit && results.debts.totalBalance <= maxHELOC && (
                <div className="mt-3 p-3 bg-warning-light rounded-lg border border-warning/30">
                  <div className="flex items-center space-x-2">
                    <AlertIcon className="w-5 h-5 text-warning" />
                    <p className="text-sm text-warning font-medium">
                      Credit limit needs to be increased to cover all debts
                    </p>
                  </div>
                </div>
              )}
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
                placeholder="9,500"
                step={100}
                helpText="Combined household income before taxes"
              />
            </div>
          </Section>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {/* Main Results Summary */}
          <ResultsSummary results={results} type="heloc" />

          {/* Payment Comparison */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-navy mb-4">Payment Timeline</h3>

            {/* Draw Period */}
            <div className="p-4 bg-light-blue/10 rounded-lg mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-navy">Draw Period</span>
                <span className="text-xs text-gray-500">
                  {helocDetails.drawPeriodMonths / 12} years
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">Interest-only HELOC payments</p>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-gray-600">Total Payment:</span>
                <span className="text-lg font-bold text-navy">
                  {formatCurrency(results.after.drawPeriod.monthlyPayment)}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                1st Mortgage: {formatCurrency(firstMortgage.payment)} +
                HELOC: {formatCurrency(results.after.drawPeriod.helocPayment)}
              </div>
            </div>

            {/* Repayment Period */}
            <div className="p-4 bg-warning-light rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-warning">Repayment Period</span>
                <span className="text-xs text-gray-500">
                  {helocDetails.repaymentTermMonths / 12} years
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">Full amortized HELOC payments</p>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-gray-600">Total Payment:</span>
                <span className="text-lg font-bold text-warning">
                  {formatCurrency(results.after.repaymentPeriod.monthlyPayment)}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                1st Mortgage: {formatCurrency(firstMortgage.payment)} +
                HELOC: {formatCurrency(results.after.repaymentPeriod.helocPayment)}
              </div>
            </div>
          </div>

          {/* DTI Gauges */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-navy mb-4">Debt-to-Income Analysis</h3>
            <div className="space-y-6">
              <div>
                <p className="text-xs text-gray-500 mb-2">During Draw Period</p>
                <DTIGauge
                  label="Back-End DTI"
                  value={results.after.backEndDTIDraw}
                  beforeValue={results.before.backEndDTI}
                  type="back"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">During Repayment Period</p>
                <DTIGauge
                  label="Back-End DTI"
                  value={results.after.backEndDTIRepay}
                  beforeValue={results.before.backEndDTI}
                  type="back"
                />
              </div>
            </div>
          </div>

          {/* LTV Indicator */}
          <LTVIndicator
            currentLTV={results.before.ltv}
            newLTV={results.after.cltv}
            homeValue={homeValue}
            isCLTV={true}
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

function ChartIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function CreditIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
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

function InfoIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function AlertIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}
