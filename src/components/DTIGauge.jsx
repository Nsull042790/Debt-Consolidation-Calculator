import { getDTIStatus } from '../utils/calculations';
import { formatPercent } from '../utils/formatters';

/**
 * Visual gauge for DTI (Debt-to-Income) ratio
 * Shows color-coded status based on Fannie/Freddie guidelines
 */
export default function DTIGauge({ label, value, beforeValue, type = 'back' }) {
  const status = getDTIStatus(value, type);

  // Color mapping
  const colorMap = {
    success: {
      bar: 'bg-success',
      text: 'text-success',
      bg: 'bg-success-light'
    },
    warning: {
      bar: 'bg-warning',
      text: 'text-warning',
      bg: 'bg-warning-light'
    },
    caution: {
      bar: 'bg-caution',
      text: 'text-caution',
      bg: 'bg-caution-light'
    },
    danger: {
      bar: 'bg-danger',
      text: 'text-danger',
      bg: 'bg-danger-light'
    }
  };

  const colors = colorMap[status.color] || colorMap.success;

  // Calculate position on the gauge (0-100 scale maps to 0-60% DTI for display)
  const maxDisplayDTI = 60;
  const position = Math.min((value / maxDisplayDTI) * 100, 100);
  const beforePosition = beforeValue ? Math.min((beforeValue / maxDisplayDTI) * 100, 100) : null;

  // Threshold markers for back-end DTI
  const thresholds = type === 'back'
    ? [
        { value: 36, label: '36%', color: 'bg-success' },
        { value: 43, label: '43%', color: 'bg-warning' },
        { value: 50, label: '50%', color: 'bg-danger' }
      ]
    : [
        { value: 28, label: '28%', color: 'bg-success' },
        { value: 31, label: '31%', color: 'bg-warning' }
      ];

  return (
    <div className="space-y-2">
      {/* Label and Value */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="flex items-center space-x-2">
          {beforeValue !== undefined && beforeValue !== value && (
            <span className="text-xs text-gray-400 line-through">
              {formatPercent(beforeValue)}
            </span>
          )}
          <span className={`text-lg font-bold ${colors.text}`}>
            {formatPercent(value)}
          </span>
        </div>
      </div>

      {/* Gauge Bar */}
      <div className="relative">
        {/* Background track with gradient zones */}
        <div className="h-3 rounded-full bg-gray-100 overflow-hidden relative">
          {/* Zone coloring */}
          {type === 'back' ? (
            <>
              <div className="absolute inset-y-0 left-0 bg-success/30" style={{ width: '60%' }} />
              <div className="absolute inset-y-0 bg-warning/30" style={{ left: '60%', width: '11.67%' }} />
              <div className="absolute inset-y-0 bg-caution/30" style={{ left: '71.67%', width: '11.67%' }} />
              <div className="absolute inset-y-0 right-0 bg-danger/30" style={{ left: '83.33%' }} />
            </>
          ) : (
            <>
              <div className="absolute inset-y-0 left-0 bg-success/30" style={{ width: '46.67%' }} />
              <div className="absolute inset-y-0 bg-warning/30" style={{ left: '46.67%', width: '5%' }} />
              <div className="absolute inset-y-0 right-0 bg-danger/30" style={{ left: '51.67%' }} />
            </>
          )}

          {/* Progress bar */}
          <div
            className={`absolute inset-y-0 left-0 ${colors.bar} rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${position}%` }}
          />

          {/* Before marker */}
          {beforePosition !== null && beforePosition !== position && (
            <div
              className="absolute top-1/2 -translate-y-1/2 w-1 h-4 bg-gray-400 rounded-full opacity-50 transition-all duration-500"
              style={{ left: `calc(${beforePosition}% - 2px)` }}
              title={`Before: ${formatPercent(beforeValue)}`}
            />
          )}
        </div>

        {/* Threshold markers */}
        <div className="relative h-4 mt-1">
          {thresholds.map((threshold) => {
            const pos = (threshold.value / maxDisplayDTI) * 100;
            return (
              <div
                key={threshold.value}
                className="absolute transform -translate-x-1/2"
                style={{ left: `${pos}%` }}
              >
                <div className={`w-0.5 h-2 ${threshold.color} mx-auto`} />
                <span className="text-[10px] text-gray-400">{threshold.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status badge */}
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
        <StatusIcon status={status.status} className="w-3 h-3 mr-1" />
        {status.message}
      </div>
    </div>
  );
}

/**
 * Status icon based on DTI status
 */
function StatusIcon({ status, className }) {
  if (status === 'ideal' || status === 'acceptable') {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  }

  if (status === 'caution' || status === 'warning') {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
  }

  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
