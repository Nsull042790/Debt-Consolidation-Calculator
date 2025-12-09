/**
 * Client Information section for capturing client and loan officer names
 */
export default function ClientInfo({ clientName, loanOfficerName, onClientNameChange, onLoanOfficerNameChange }) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Client Name */}
          <div className="flex-1">
            <label htmlFor="clientName" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Client Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="clientName"
                value={clientName}
                onChange={(e) => onClientNameChange(e.target.value)}
                placeholder="Enter client's name"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue
                         text-navy font-medium placeholder:text-gray-400 placeholder:font-normal"
              />
            </div>
          </div>

          {/* Loan Officer Name */}
          <div className="flex-1">
            <label htmlFor="loanOfficer" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Loan Officer
            </label>
            <div className="relative">
              <BriefcaseIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="loanOfficer"
                value={loanOfficerName}
                onChange={(e) => onLoanOfficerNameChange(e.target.value)}
                placeholder="Your name"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue
                         text-navy font-medium placeholder:text-gray-400 placeholder:font-normal"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icon Components
function UserIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function BriefcaseIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
