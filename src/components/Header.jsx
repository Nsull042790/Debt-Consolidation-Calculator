import { useState } from 'react';

/**
 * Header component with Luminate Bank branding
 */
export default function Header({ onPrint, onShare, onCopy }) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async () => {
    if (onCopy) {
      await onCopy();
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <header className="bg-navy text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              {/* Luminate Bank Logo Placeholder */}
              <div className="w-10 h-10 bg-gradient-to-br from-light-blue to-pink rounded-lg flex items-center justify-center">
                <span className="text-navy font-bold text-lg">L</span>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-display font-bold tracking-tight">
                  Luminate Bank
                </h1>
                <p className="text-xs text-light-blue -mt-0.5">
                  Debt Consolidation Calculator
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Copy Summary */}
            <button
              onClick={handleCopy}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg
                         bg-navy-light hover:bg-purple/30 transition-colors duration-200
                         border border-purple/30 hover:border-purple/50"
              title="Copy summary to clipboard"
            >
              {copySuccess ? (
                <>
                  <CheckIcon className="w-4 h-4 mr-1.5 text-success" />
                  <span className="hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <CopyIcon className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>

            {/* Share Button */}
            <button
              onClick={onShare}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg
                         bg-navy-light hover:bg-purple/30 transition-colors duration-200
                         border border-purple/30 hover:border-purple/50"
              title="Share analysis"
            >
              <ShareIcon className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Print Button */}
            <button
              onClick={onPrint}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg
                         bg-light-blue text-navy hover:bg-light-blue-dark
                         transition-colors duration-200 font-semibold"
              title="Print report"
            >
              <PrintIcon className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// Icon Components
function CopyIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
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

function PrintIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
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
