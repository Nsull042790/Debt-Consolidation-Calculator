import { formatCurrency, formatPercent, formatBreakEven, formatRateAsPercent } from '../utils/formatters';

/**
 * Metric display component
 */
function Metric({ label, value, subValue, trend, size = 'default', highlight = false }) {
  const sizeClasses = {
    small: 'text-lg font-semibold',
    default: 'text-2xl font-bold',
    large: 'text-4xl font-extrabold'
  };

  return (
    <div className={`${highlight ? 'bg-gradient-to-br from-success-light to-white' : ''} rounded-lg p-3`}>
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{label}</p>
      <p className={`${sizeClasses[size]} text-navy leading-tight`}>
        {value}
        {trend && (
          <span className={`ml-2 text-sm font-medium ${trend > 0 ? 'text-danger' : 'text-success'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </p>
      {subValue && (
        <p className="text-sm text-gray-500 mt-0.5">{subValue}</p>
      )}
    </div>
  );
}

/**
 * Comparison row for before/after values
 */
function ComparisonRow({ label, before, after, improvement, format = 'currency' }) {
  const formatValue = (val) => {
    if (format === 'currency') return formatCurrency(val);
    if (format === 'percent') return formatPercent(val);
    if (format === 'rate') return formatRateAsPercent(val);
    return val;
  };

  const diff = after - before;
  const isImprovement = format === 'currency' ? diff < 0 : diff < 0;

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-400 line-through">{formatValue(before)}</span>
        <span className="text-sm font-semibold text-navy">{formatValue(after)}</span>
        {improvement && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            isImprovement ? 'bg-success-light text-success' : 'bg-danger-light text-danger'
          }`}>
            {isImprovement ? '↓' : '↑'} {formatValue(Math.abs(diff))}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Results Summary component showing key metrics from calculations
 */
export default function ResultsSummary({ results, type = 'cashout' }) {
  const isHELOC = type === 'heloc';

  const monthlySavings = isHELOC ? results.savings.monthlyDraw : results.savings.monthly;
  const afterPayment = isHELOC
    ? results.after.drawPeriod.monthlyPayment
    : results.after.monthlyPayment;

  const isPositiveSavings = monthlySavings > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with highlight metric */}
      <div className={`p-6 ${isPositiveSavings ? 'bg-gradient-to-br from-success/10 to-white' : 'bg-gradient-to-br from-warning/10 to-white'}`}>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600 mb-1">
            Monthly {isPositiveSavings ? 'Savings' : 'Change'}
          </p>
          <p className={`text-5xl font-extrabold tracking-tight ${
            isPositiveSavings ? 'text-success' : monthlySavings < 0 ? 'text-danger' : 'text-gray-600'
          }`}>
            {isPositiveSavings ? '+' : ''}{formatCurrency(monthlySavings)}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            per month in your pocket
          </p>
        </div>

        {/* Break-even callout */}
        {results.savings.breakEvenMonths && isFinite(results.savings.breakEvenMonths) && monthlySavings > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-2">
              <ClockIcon className="w-5 h-5 text-navy" />
              <span className="text-sm text-gray-600">Break-even:</span>
              <span className="font-bold text-navy">
                {formatBreakEven(results.savings.breakEvenMonths)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Detailed metrics */}
      <div className="p-6 space-y-4">
        {/* Before vs After Payments */}
        <div>
          <h4 className="text-xs uppercase tracking-wide text-gray-500 mb-3">Monthly Payments</h4>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-xs text-gray-500">Before</p>
              <p className="text-xl font-bold text-gray-400">{formatCurrency(results.before.monthlyPayment)}</p>
            </div>
            <ArrowRightIcon className="w-6 h-6 text-gray-300" />
            <div className="text-center">
              <p className="text-xs text-gray-500">After</p>
              <p className="text-xl font-bold text-navy">{formatCurrency(afterPayment)}</p>
            </div>
          </div>
        </div>

        {/* HELOC-specific: Show repayment period payment */}
        {isHELOC && (
          <div className="p-3 bg-warning-light rounded-lg">
            <p className="text-xs text-warning font-medium">After Draw Period:</p>
            <p className="text-lg font-bold text-warning">
              {formatCurrency(results.after.repaymentPeriod.monthlyPayment)}/mo
            </p>
          </div>
        )}

        {/* Loan Details */}
        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-xs uppercase tracking-wide text-gray-500 mb-3">New Loan Details</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">Loan Amount</p>
              <p className="font-semibold text-navy">
                {formatCurrency(isHELOC ? results.after.helocAmount : results.after.loanAmount, false)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Interest Rate</p>
              <p className="font-semibold text-navy">{formatRateAsPercent(results.after.weightedRate)}</p>
            </div>
          </div>
        </div>

        {/* Rate Comparison */}
        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-xs uppercase tracking-wide text-gray-500 mb-3">Interest Rate Comparison</h4>
          <ComparisonRow
            label="Weighted Avg. Rate"
            before={results.before.weightedRate}
            after={results.after.weightedRate}
            improvement
            format="rate"
          />
        </div>

        {/* Debts Consolidated */}
        {results.debts.count > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs uppercase tracking-wide text-gray-500 mb-3">Debts Consolidated</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 rounded-full bg-pink/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-pink">{results.debts.count}</span>
                </span>
                <span className="text-sm text-gray-600">debts paid off</span>
              </div>
              <span className="font-semibold text-navy">
                {formatCurrency(results.debts.totalBalance, false)}
              </span>
            </div>
          </div>
        )}

        {/* Total Interest Savings */}
        {isFinite(results.savings.totalInterest) && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Interest Savings</p>
                <p className="text-xs text-gray-500">over life of loans</p>
              </div>
              <p className={`text-xl font-bold ${
                results.savings.totalInterest > 0 ? 'text-success' : 'text-danger'
              }`}>
                {results.savings.totalInterest > 0 ? '+' : ''}
                {formatCurrency(results.savings.totalInterest, false)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Icon Components
function ClockIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ArrowRightIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}
