import { forwardRef } from 'react';
import {
  formatCurrency,
  formatPercent,
  formatRateAsPercent,
  formatBreakEven,
  formatDate
} from '../utils/formatters';
import { getDTIStatus, getLTVStatus } from '../utils/calculations';

/**
 * Printable Report Component
 * Generates a clean, professional PDF report for clients
 */
const PrintReport = forwardRef(function PrintReport({
  results,
  inputs,
  type = 'cashout',
  clientName = '',
  loanOfficerName = '',
  recommendations = []
}, ref) {
  const isHELOC = type === 'heloc';
  const monthlySavings = isHELOC ? results.savings.monthlyDraw : results.savings.monthly;
  const afterPayment = isHELOC
    ? results.after.drawPeriod.monthlyPayment
    : results.after.monthlyPayment;

  const dtiStatus = getDTIStatus(
    isHELOC ? results.after.backEndDTIRepay : results.after.backEndDTI,
    'back'
  );
  const ltvStatus = getLTVStatus(isHELOC ? results.after.cltv : results.after.ltv);

  // Filter recommendations for print (only important ones)
  const printRecommendations = recommendations.filter(r =>
    ['critical', 'high', 'medium'].includes(r.priority)
  ).slice(0, 5);

  return (
    <div ref={ref} className="bg-white min-h-screen p-8 print:p-0">
      {/* Header with Logo */}
      <div className="flex items-center justify-between border-b-2 border-navy pb-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-light-blue to-pink rounded-lg flex items-center justify-center">
            <span className="text-navy font-bold text-xl">L</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy">Luminate Bank</h1>
            <p className="text-sm text-gray-500">
              {isHELOC ? 'HELOC' : 'Cash-Out Refinance'} Analysis
            </p>
          </div>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>Generated: {formatDate()}</p>
          <p>NMLS#1281698</p>
        </div>
      </div>

      {/* Client/Officer Info */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Prepared For</p>
          <p className="font-semibold text-navy text-lg">
            {clientName || '________________________________'}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Loan Officer</p>
          <p className="font-semibold text-navy text-lg">
            {loanOfficerName || '________________________________'}
          </p>
        </div>
      </div>

      {/* Key Results Summary */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-200 pb-2">
          Summary
        </h2>

        <div className="grid grid-cols-3 gap-4">
          {/* Monthly Savings */}
          <div className={`rounded-lg p-4 text-center ${
            monthlySavings > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
          }`}>
            <p className="text-xs text-gray-500 uppercase mb-1">Monthly Savings</p>
            <p className={`text-3xl font-bold ${
              monthlySavings > 0 ? 'text-green-600' : 'text-gray-600'
            }`}>
              {monthlySavings > 0 ? '+' : ''}{formatCurrency(monthlySavings)}
            </p>
            <p className="text-xs text-gray-500 mt-1">per month</p>
          </div>

          {/* Break-Even */}
          {results.savings.breakEvenMonths && isFinite(results.savings.breakEvenMonths) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500 uppercase mb-1">Break-Even Period</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatBreakEven(results.savings.breakEvenMonths)}
              </p>
              <p className="text-xs text-gray-500 mt-1">to recoup closing costs</p>
            </div>
          )}

          {/* Debts Consolidated */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 uppercase mb-1">Debts Consolidated</p>
            <p className="text-3xl font-bold text-purple-600">
              {results.debts.count}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatCurrency(results.debts.totalBalance, false)} total
            </p>
          </div>
        </div>
      </div>

      {/* Before vs After Comparison */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-200 pb-2">
          Payment Comparison
        </h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-500 font-medium">Metric</th>
              <th className="text-right py-2 text-gray-500 font-medium">Before</th>
              <th className="text-right py-2 text-gray-500 font-medium">After</th>
              <th className="text-right py-2 text-gray-500 font-medium">Change</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 font-medium">Total Monthly Payment</td>
              <td className="py-3 text-right text-gray-600">
                {formatCurrency(results.before.monthlyPayment)}
              </td>
              <td className="py-3 text-right font-semibold text-navy">
                {formatCurrency(afterPayment)}
              </td>
              <td className={`py-3 text-right font-semibold ${
                monthlySavings > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {monthlySavings > 0 ? '-' : '+'}{formatCurrency(Math.abs(monthlySavings))}
              </td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 font-medium">Weighted Avg. Interest Rate</td>
              <td className="py-3 text-right text-gray-600">
                {formatRateAsPercent(results.before.weightedRate)}
              </td>
              <td className="py-3 text-right font-semibold text-navy">
                {formatRateAsPercent(results.after.weightedRate)}
              </td>
              <td className={`py-3 text-right font-semibold ${
                results.after.weightedRate < results.before.weightedRate ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatRateAsPercent(Math.abs(results.after.weightedRate - results.before.weightedRate))}
              </td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 font-medium">Back-End DTI</td>
              <td className="py-3 text-right text-gray-600">
                {formatPercent(results.before.backEndDTI)}
              </td>
              <td className="py-3 text-right font-semibold text-navy">
                {formatPercent(isHELOC ? results.after.backEndDTIRepay : results.after.backEndDTI)}
              </td>
              <td className="py-3 text-right">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  dtiStatus.color === 'success' ? 'bg-green-100 text-green-700' :
                  dtiStatus.color === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                  dtiStatus.color === 'caution' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {dtiStatus.message}
                </span>
              </td>
            </tr>
            <tr>
              <td className="py-3 font-medium">{isHELOC ? 'CLTV' : 'LTV'}</td>
              <td className="py-3 text-right text-gray-600">
                {formatPercent(results.before.ltv)}
              </td>
              <td className="py-3 text-right font-semibold text-navy">
                {formatPercent(isHELOC ? results.after.cltv : results.after.ltv)}
              </td>
              <td className="py-3 text-right">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  ltvStatus.color === 'success' ? 'bg-green-100 text-green-700' :
                  ltvStatus.color === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                  ltvStatus.color === 'caution' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {ltvStatus.message}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Debts Being Consolidated */}
      {inputs?.debtsToConsolidate && inputs.debtsToConsolidate.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-200 pb-2">
            Debts Being Consolidated
          </h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-500 font-medium">Description</th>
                <th className="text-right py-2 text-gray-500 font-medium">Balance</th>
                <th className="text-right py-2 text-gray-500 font-medium">Rate</th>
                <th className="text-right py-2 text-gray-500 font-medium">Payment</th>
              </tr>
            </thead>
            <tbody>
              {inputs.debtsToConsolidate.filter(d => d.balance > 0).map((debt, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-2">{debt.name || 'Debt ' + (index + 1)}</td>
                  <td className="py-2 text-right">{formatCurrency(debt.balance)}</td>
                  <td className="py-2 text-right">{formatRateAsPercent(debt.rate)}</td>
                  <td className="py-2 text-right">{formatCurrency(debt.monthlyPayment)}</td>
                </tr>
              ))}
              <tr className="font-semibold bg-gray-50">
                <td className="py-2">Total</td>
                <td className="py-2 text-right">{formatCurrency(results.debts.totalBalance)}</td>
                <td className="py-2 text-right">-</td>
                <td className="py-2 text-right">{formatCurrency(results.debts.totalPayments)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* New Loan Details */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-200 pb-2">
          {isHELOC ? 'HELOC Details' : 'New Loan Details'}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase mb-1">
              {isHELOC ? 'HELOC Amount' : 'New Loan Amount'}
            </p>
            <p className="text-xl font-bold text-navy">
              {formatCurrency(isHELOC ? results.after.helocAmount : results.after.loanAmount, false)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase mb-1">Interest Rate</p>
            <p className="text-xl font-bold text-navy">
              {formatRateAsPercent(results.after.weightedRate)}
            </p>
          </div>
          {!isHELOC && inputs?.newLoan && (
            <>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase mb-1">Loan Term</p>
                <p className="text-xl font-bold text-navy">
                  {inputs.newLoan.termMonths / 12} years
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase mb-1">Closing Costs</p>
                <p className="text-xl font-bold text-navy">
                  {formatCurrency(inputs.newLoan.closingCosts)}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* AI Recommendations */}
      {printRecommendations.length > 0 && (
        <div className="mb-8 print-break-before">
          <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-200 pb-2">
            Key Considerations
          </h2>

          <div className="space-y-3">
            {printRecommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  rec.priority === 'critical' ? 'border-red-300 bg-red-50' :
                  rec.priority === 'high' ? 'border-orange-300 bg-orange-50' :
                  'border-gray-200 bg-gray-50'
                }`}
              >
                <p className="font-semibold text-navy text-sm">{rec.title}</p>
                <p className="text-gray-600 text-sm mt-1">{rec.message}</p>
                {rec.suggestion && (
                  <p className="text-gray-500 text-xs mt-2 italic">{rec.suggestion}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer / Disclaimer */}
      <div className="mt-12 pt-4 border-t-2 border-gray-200">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-light-blue to-pink rounded-lg flex items-center justify-center">
              <span className="text-navy font-bold">L</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 leading-relaxed">
            <p className="font-semibold text-gray-700 mb-1">Disclaimer</p>
            <p>
              This calculator provides estimates for informational purposes only. Actual loan terms,
              rates, and payments may vary based on credit profile, property value, and other factors.
              All figures are estimates and do not represent a loan commitment or guarantee.
              Consult with your Luminate Bank loan officer for personalized guidance.
            </p>
            <p className="mt-2 font-medium">
              Luminate Bank | NMLS#1281698
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PrintReport;
