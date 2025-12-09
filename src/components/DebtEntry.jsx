import { useState, useCallback } from 'react';
import { formatCurrency, formatPercent } from '../utils/formatters';

/**
 * Debt type presets with common values
 */
const DEBT_PRESETS = [
  { type: 'credit_card', name: 'Credit Card', defaultRate: 22.99, icon: '💳' },
  { type: 'auto_loan', name: 'Auto Loan', defaultRate: 7.5, icon: '🚗' },
  { type: 'personal_loan', name: 'Personal Loan', defaultRate: 12.0, icon: '📝' },
  { type: 'student_loan', name: 'Student Loan', defaultRate: 6.5, icon: '🎓' },
  { type: 'medical_debt', name: 'Medical Debt', defaultRate: 0, icon: '🏥' },
  { type: 'other', name: 'Other Debt', defaultRate: 10.0, icon: '📋' }
];

/**
 * Individual debt input row
 */
function DebtRow({ debt, index, onChange, onRemove, isOnly }) {
  const handleChange = (field, value) => {
    onChange(index, { ...debt, [field]: value });
  };

  const preset = DEBT_PRESETS.find(p => p.type === debt.type) || DEBT_PRESETS[5];

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xl">{preset.icon}</span>
          <select
            value={debt.type || 'other'}
            onChange={(e) => {
              const newPreset = DEBT_PRESETS.find(p => p.type === e.target.value);
              handleChange('type', e.target.value);
              if (newPreset && !debt.name) {
                handleChange('name', newPreset.name);
              }
              if (newPreset && !debt.rate) {
                handleChange('rate', newPreset.defaultRate / 100);
              }
            }}
            className="text-sm font-medium bg-white border border-gray-300 rounded-md px-2 py-1
                       focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue"
          >
            {DEBT_PRESETS.map(p => (
              <option key={p.type} value={p.type}>{p.name}</option>
            ))}
          </select>
        </div>

        {!isOnly && (
          <button
            onClick={() => onRemove(index)}
            className="text-gray-400 hover:text-danger transition-colors p-1"
            title="Remove debt"
          >
            <XIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Name/Description */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Description
          </label>
          <input
            type="text"
            value={debt.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Chase Visa"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue"
          />
        </div>

        {/* Balance */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Balance
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              value={debt.balance || ''}
              onChange={(e) => handleChange('balance', parseFloat(e.target.value) || 0)}
              placeholder="0"
              min="0"
              step="100"
              className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue"
            />
          </div>
        </div>

        {/* Interest Rate */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            APR
          </label>
          <div className="relative">
            <input
              type="number"
              value={debt.rate ? (debt.rate * 100).toFixed(2) : ''}
              onChange={(e) => handleChange('rate', (parseFloat(e.target.value) || 0) / 100)}
              placeholder="0.00"
              min="0"
              max="100"
              step="0.25"
              className="w-full pl-3 pr-7 py-2 text-sm border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
          </div>
        </div>

        {/* Monthly Payment */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Min. Payment
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              value={debt.monthlyPayment || ''}
              onChange={(e) => handleChange('monthlyPayment', parseFloat(e.target.value) || 0)}
              placeholder="0"
              min="0"
              step="10"
              className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Collapsible debt entry section
 */
export default function DebtEntry({ debts, onChange, maxDebts = 15 }) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate totals
  const totalBalance = debts.reduce((sum, d) => sum + (parseFloat(d.balance) || 0), 0);
  const totalPayment = debts.reduce((sum, d) => sum + (parseFloat(d.monthlyPayment) || 0), 0);
  const debtCount = debts.filter(d => d.balance > 0).length;

  const handleDebtChange = useCallback((index, updatedDebt) => {
    const newDebts = [...debts];
    newDebts[index] = updatedDebt;
    onChange(newDebts);
  }, [debts, onChange]);

  const handleRemoveDebt = useCallback((index) => {
    if (debts.length <= 1) return;
    const newDebts = debts.filter((_, i) => i !== index);
    onChange(newDebts);
  }, [debts, onChange]);

  const handleAddDebt = useCallback(() => {
    if (debts.length >= maxDebts) return;
    onChange([
      ...debts,
      { id: Date.now(), type: 'credit_card', name: '', balance: 0, rate: 0.2299, monthlyPayment: 0 }
    ]);
  }, [debts, maxDebts, onChange]);

  const handleQuickAdd = useCallback((preset) => {
    if (debts.length >= maxDebts) return;
    onChange([
      ...debts,
      {
        id: Date.now(),
        type: preset.type,
        name: preset.name,
        balance: 0,
        rate: preset.defaultRate / 100,
        monthlyPayment: 0
      }
    ]);
  }, [debts, maxDebts, onChange]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white
                   hover:from-gray-100 hover:to-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-pink/10 flex items-center justify-center">
            <CreditCardIcon className="w-5 h-5 text-pink" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-navy">Debts to Consolidate</h3>
            <p className="text-sm text-gray-500">
              {debtCount > 0
                ? `${debtCount} debt${debtCount !== 1 ? 's' : ''} totaling ${formatCurrency(totalBalance, false)}`
                : 'Add debts you want to consolidate'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {totalPayment > 0 && (
            <div className="hidden sm:block text-right">
              <p className="text-xs text-gray-500">Monthly Payments</p>
              <p className="font-semibold text-navy">{formatCurrency(totalPayment)}</p>
            </div>
          )}
          <ChevronIcon
            className={`w-5 h-5 text-gray-400 transition-transform duration-200
              ${isExpanded ? 'rotate-180' : ''}
            `}
          />
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          {/* Quick Add Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-xs text-gray-500 self-center mr-1">Quick add:</span>
            {DEBT_PRESETS.slice(0, 4).map(preset => (
              <button
                key={preset.type}
                onClick={() => handleQuickAdd(preset)}
                disabled={debts.length >= maxDebts}
                className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full
                           bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="mr-1">{preset.icon}</span>
                {preset.name}
              </button>
            ))}
          </div>

          {/* Debt List */}
          <div className="space-y-3">
            {debts.map((debt, index) => (
              <DebtRow
                key={debt.id || index}
                debt={debt}
                index={index}
                onChange={handleDebtChange}
                onRemove={handleRemoveDebt}
                isOnly={debts.length === 1}
              />
            ))}
          </div>

          {/* Add Button */}
          {debts.length < maxDebts && (
            <button
              onClick={handleAddDebt}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg
                         text-gray-500 hover:border-light-blue hover:text-light-blue-dark
                         transition-colors flex items-center justify-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span className="font-medium">Add Another Debt</span>
            </button>
          )}

          {debts.length >= maxDebts && (
            <p className="text-center text-sm text-gray-500">
              Maximum of {maxDebts} debts reached
            </p>
          )}

          {/* Summary Row */}
          {debtCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Total Debt Balance</p>
                <p className="text-xl font-bold text-navy">{formatCurrency(totalBalance, false)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Monthly Payments</p>
                <p className="text-xl font-bold text-pink">{formatCurrency(totalPayment)}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Icon Components
function CreditCardIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function ChevronIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function PlusIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function XIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
