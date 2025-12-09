import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * Share Modal Component
 * Generates shareable links and provides sharing options
 */
export default function ShareModal({ isOpen, onClose, results, inputs, type }) {
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [clientName, setClientName] = useState('');
  const [expiryDays, setExpiryDays] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate a unique share URL
  useEffect(() => {
    if (isOpen && !shareUrl) {
      generateShareUrl();
    }
  }, [isOpen]);

  const generateShareUrl = () => {
    setIsGenerating(true);

    // In a real application, this would call an API to save the data
    // and return a unique URL. For this demo, we'll create a local URL
    // with encoded data.
    const shareId = uuidv4().slice(0, 8);
    const baseUrl = window.location.origin;

    // Create a simplified data object for sharing
    const shareData = {
      id: shareId,
      type,
      timestamp: Date.now(),
      client: clientName,
      summary: {
        monthlySavings: type === 'heloc' ? results.savings.monthlyDraw : results.savings.monthly,
        newPayment: type === 'heloc'
          ? results.after.drawPeriod.monthlyPayment
          : results.after.monthlyPayment,
        debtsConsolidated: results.debts.count,
        totalDebtPaidOff: results.debts.totalBalance
      }
    };

    // Encode data for URL (in production, this would be stored server-side)
    const encodedData = btoa(JSON.stringify(shareData));
    const url = `${baseUrl}/share/${shareId}?data=${encodedData}`;

    setTimeout(() => {
      setShareUrl(url);
      setIsGenerating(false);
    }, 500);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent('Your Debt Consolidation Analysis from Luminate Bank');
    const body = encodeURIComponent(
      `Hi${clientName ? ' ' + clientName : ''},\n\n` +
      `I've prepared a debt consolidation analysis for you. ` +
      `Click the link below to view your personalized results:\n\n` +
      `${shareUrl}\n\n` +
      `This link will expire in ${expiryDays} days.\n\n` +
      `If you have any questions, please don't hesitate to reach out.\n\n` +
      `Best regards,\n` +
      `Your Luminate Bank Loan Officer`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple to-pink rounded-xl flex items-center justify-center mx-auto mb-3">
              <ShareIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-navy">Share Analysis</h2>
            <p className="text-sm text-gray-500 mt-1">
              Send a read-only link to your client
            </p>
          </div>

          {/* Client Name Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Name (optional)
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Enter client's name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue"
            />
          </div>

          {/* Expiry Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link Expiration
            </label>
            <select
              value={expiryDays}
              onChange={(e) => setExpiryDays(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue"
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
            </select>
          </div>

          {/* Share URL */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Share Link
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                {isGenerating ? (
                  <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-400 text-sm">
                    Generating link...
                  </div>
                ) : (
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg
                             text-sm text-gray-600 truncate"
                  />
                )}
              </div>
              <button
                onClick={handleCopy}
                disabled={isGenerating || !shareUrl}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all
                  ${copied
                    ? 'bg-success text-white'
                    : 'bg-navy text-white hover:bg-navy-light'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {copied ? (
                  <span className="flex items-center">
                    <CheckIcon className="w-4 h-4 mr-1" />
                    Copied!
                  </span>
                ) : (
                  'Copy'
                )}
              </button>
            </div>
          </div>

          {/* Quick Share Options */}
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
              Quick Share
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleEmailShare}
                className="flex items-center justify-center space-x-2 px-4 py-3
                         bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <EmailIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Email</span>
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Debt Consolidation Analysis',
                      text: 'Check out your personalized analysis from Luminate Bank',
                      url: shareUrl
                    });
                  }
                }}
                className="flex items-center justify-center space-x-2 px-4 py-3
                         bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <DeviceIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Share</span>
              </button>
            </div>
          </div>

          {/* Summary Preview */}
          <div className="mt-6 p-4 bg-gradient-to-br from-purple/5 to-pink/5 rounded-xl border border-purple/20">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              What client will see
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Monthly Savings</p>
                <p className="font-semibold text-navy">
                  ${Math.round(type === 'heloc' ? results.savings.monthlyDraw : results.savings.monthly).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Debts Paid Off</p>
                <p className="font-semibold text-navy">
                  {results.debts.count} debts
                </p>
              </div>
            </div>
          </div>

          {/* Note */}
          <p className="mt-4 text-xs text-gray-400 text-center">
            Client will see a read-only version of this analysis.
            They cannot modify any values.
          </p>
        </div>
      </div>
    </div>
  );
}

// Icon Components
function XIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ShareIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}

function CheckIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function EmailIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function DeviceIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}
