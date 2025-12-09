import { getLTVStatus } from '../utils/calculations';
import { formatPercent, formatCurrency } from '../utils/formatters';

/**
 * Visual indicator for LTV (Loan-to-Value) ratio
 * Shows status and PMI warnings
 */
export default function LTVIndicator({ currentLTV, newLTV, homeValue, isCLTV = false }) {
  const status = getLTVStatus(newLTV);

  // Color mapping
  const colorMap = {
    success: {
      gradient: 'from-success to-success/70',
      text: 'text-success',
      bg: 'bg-success-light',
      border: 'border-success/30'
    },
    warning: {
      gradient: 'from-warning to-warning/70',
      text: 'text-warning',
      bg: 'bg-warning-light',
      border: 'border-warning/30'
    },
    caution: {
      gradient: 'from-caution to-caution/70',
      text: 'text-caution',
      bg: 'bg-caution-light',
      border: 'border-caution/30'
    },
    danger: {
      gradient: 'from-danger to-danger/70',
      text: 'text-danger',
      bg: 'bg-danger-light',
      border: 'border-danger/30'
    }
  };

  const colors = colorMap[status.color] || colorMap.success;

  // Calculate equity
  const loanAmount = (newLTV / 100) * homeValue;
  const equity = homeValue - loanAmount;

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${colors.border} overflow-hidden`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-navy">
            {isCLTV ? 'Combined LTV' : 'Loan-to-Value'} Analysis
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
            {status.message}
          </span>
        </div>
      </div>

      {/* Visual Gauge */}
      <div className="p-6">
        {/* House visualization */}
        <div className="relative mb-6">
          <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden relative">
            {/* Equity portion (top) */}
            <div
              className="absolute top-0 left-0 right-0 bg-gradient-to-b from-light-blue/30 to-light-blue/10 transition-all duration-500"
              style={{ height: `${Math.max(0, 100 - newLTV)}%` }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {equity > 0 && (
                  <div className="text-center">
                    <p className="text-xs text-light-blue-dark font-medium">Equity</p>
                    <p className="text-lg font-bold text-navy">{formatCurrency(equity, false)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Loan portion (bottom) */}
            <div
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${colors.gradient} transition-all duration-500`}
              style={{ height: `${Math.min(100, newLTV)}%` }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <p className="text-xs font-medium opacity-90">Loan</p>
                  <p className="text-lg font-bold">{formatCurrency(loanAmount, false)}</p>
                </div>
              </div>
            </div>

            {/* 80% LTV line */}
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed border-navy/30"
              style={{ top: '20%' }}
            >
              <span className="absolute -top-3 right-2 text-[10px] text-navy/50 bg-white px-1">
                80% LTV
              </span>
            </div>
          </div>
        </div>

        {/* LTV Values */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <p className="text-xs text-gray-500">Current LTV</p>
            <p className="text-xl font-bold text-gray-400">{formatPercent(currentLTV)}</p>
          </div>
          <ArrowIcon className="w-6 h-6 text-gray-300" />
          <div className="text-center">
            <p className="text-xs text-gray-500">New {isCLTV ? 'CLTV' : 'LTV'}</p>
            <p className={`text-xl font-bold ${colors.text}`}>{formatPercent(newLTV)}</p>
          </div>
        </div>

        {/* Home Value Reference */}
        <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HomeIcon className="w-5 h-5 text-navy" />
            <span className="text-sm text-gray-600">Home Value</span>
          </div>
          <span className="font-semibold text-navy">{formatCurrency(homeValue, false)}</span>
        </div>

        {/* PMI Warning */}
        {status.pmiRequired && (
          <div className="mt-4 p-3 bg-warning-light rounded-lg border border-warning/30">
            <div className="flex items-start space-x-2">
              <WarningIcon className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-warning">PMI Required</p>
                <p className="text-xs text-warning/80 mt-1">
                  Private Mortgage Insurance will be required for LTV above 80%.
                  Typical cost: 0.3% - 1.5% of loan amount annually.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hard Stop Warning */}
        {newLTV > 95 && (
          <div className="mt-4 p-3 bg-danger-light rounded-lg border border-danger/30">
            <div className="flex items-start space-x-2">
              <StopIcon className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-danger">Exceeds Lending Limits</p>
                <p className="text-xs text-danger/80 mt-1">
                  Most conventional lenders will not approve loans with LTV above 95%.
                  Consider reducing the loan amount.
                </p>
              </div>
            </div>
          </div>
        )}
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

function ArrowIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

function WarningIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function StopIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  );
}
