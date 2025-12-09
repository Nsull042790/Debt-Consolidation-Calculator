import { useState } from 'react';
import { getPriorityColor, PRIORITY } from '../utils/recommendations';

/**
 * AI Recommendations component
 * Displays smart, contextual advice based on calculation results
 */
export default function AIRecommendations({ recommendations }) {
  const [expandedIds, setExpandedIds] = useState(new Set());

  // Group recommendations by priority
  const criticalRecs = recommendations.filter(r => r.priority === PRIORITY.CRITICAL);
  const highRecs = recommendations.filter(r => r.priority === PRIORITY.HIGH);
  const otherRecs = recommendations.filter(r =>
    r.priority !== PRIORITY.CRITICAL && r.priority !== PRIORITY.HIGH
  );

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-purple/10 via-pink/5 to-light-blue/10 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple to-pink flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-navy">AI Recommendations</h3>
            <p className="text-sm text-gray-500">
              Personalized insights based on your scenario
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Critical Alerts */}
        {criticalRecs.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
              <span className="text-sm font-semibold text-danger uppercase tracking-wide">
                Critical Issues
              </span>
            </div>
            <div className="space-y-3">
              {criticalRecs.map(rec => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  isExpanded={expandedIds.has(rec.id)}
                  onToggle={() => toggleExpanded(rec.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* High Priority */}
        {highRecs.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-caution" />
              <span className="text-sm font-semibold text-caution uppercase tracking-wide">
                Important Considerations
              </span>
            </div>
            <div className="space-y-3">
              {highRecs.map(rec => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  isExpanded={expandedIds.has(rec.id)}
                  onToggle={() => toggleExpanded(rec.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Other Recommendations */}
        {otherRecs.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-light-blue" />
              <span className="text-sm font-semibold text-navy uppercase tracking-wide">
                Additional Insights
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {otherRecs.map(rec => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  isExpanded={expandedIds.has(rec.id)}
                  onToggle={() => toggleExpanded(rec.id)}
                  compact
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Individual recommendation card
 */
function RecommendationCard({ recommendation, isExpanded, onToggle, compact = false }) {
  const { title, message, suggestion, priority, icon } = recommendation;

  const colorClasses = {
    critical: {
      bg: 'bg-danger-light',
      border: 'border-danger/30',
      iconBg: 'bg-danger/10',
      iconColor: 'text-danger',
      titleColor: 'text-danger'
    },
    high: {
      bg: 'bg-caution-light',
      border: 'border-caution/30',
      iconBg: 'bg-caution/10',
      iconColor: 'text-caution',
      titleColor: 'text-caution'
    },
    medium: {
      bg: 'bg-warning-light',
      border: 'border-warning/30',
      iconBg: 'bg-warning/10',
      iconColor: 'text-warning',
      titleColor: 'text-gray-900'
    },
    low: {
      bg: 'bg-light-blue/10',
      border: 'border-light-blue/30',
      iconBg: 'bg-light-blue/20',
      iconColor: 'text-light-blue-dark',
      titleColor: 'text-gray-900'
    },
    info: {
      bg: 'bg-success-light',
      border: 'border-success/30',
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
      titleColor: 'text-gray-900'
    }
  };

  const colors = colorClasses[priority] || colorClasses.info;
  const IconComponent = getIconComponent(icon);

  return (
    <div
      className={`rounded-lg border ${colors.border} ${colors.bg} transition-all duration-200
        ${compact ? 'p-3' : 'p-4'}
        ${suggestion ? 'cursor-pointer hover:shadow-md' : ''}
      `}
      onClick={suggestion ? onToggle : undefined}
    >
      <div className="flex items-start space-x-3">
        <div className={`w-8 h-8 rounded-lg ${colors.iconBg} flex items-center justify-center flex-shrink-0`}>
          <IconComponent className={`w-4 h-4 ${colors.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h4 className={`font-semibold ${colors.titleColor} ${compact ? 'text-sm' : ''}`}>
              {title}
            </h4>
            {suggestion && (
              <ChevronIcon
                className={`w-5 h-5 text-gray-400 flex-shrink-0 ml-2 transition-transform duration-200
                  ${isExpanded ? 'rotate-180' : ''}
                `}
              />
            )}
          </div>
          <p className={`text-gray-600 mt-1 ${compact ? 'text-xs' : 'text-sm'}`}>
            {message}
          </p>

          {/* Expandable suggestion */}
          {suggestion && isExpanded && (
            <div className="mt-3 pt-3 border-t border-gray-200/50">
              <div className="flex items-start space-x-2">
                <LightbulbIcon className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">{suggestion}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Get the icon component based on icon name
 */
function getIconComponent(iconName) {
  const icons = {
    'alert-triangle': AlertTriangleIcon,
    'alert-circle': AlertCircleIcon,
    'x-circle': XCircleIcon,
    'check-circle': CheckCircleIcon,
    'info': InfoIcon,
    'lightbulb': LightbulbIcon,
    'clock': ClockIcon,
    'trending-up': TrendingUpIcon,
    'trending-down': TrendingDownIcon,
    'dollar-sign': DollarSignIcon,
    'zap': ZapIcon,
    'target': TargetIcon
  };

  return icons[iconName] || InfoIcon;
}

// Icon Components
function SparklesIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
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

function AlertTriangleIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function AlertCircleIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function XCircleIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CheckCircleIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

function LightbulbIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function ClockIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function TrendingUpIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

function TrendingDownIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
  );
}

function DollarSignIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ZapIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function TargetIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
