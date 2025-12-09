/**
 * Tab Navigation component for switching between Cash-Out Refi and HELOC
 */
export default function TabNavigation({ activeTab, onTabChange }) {
  const tabs = [
    {
      id: 'cashout',
      label: 'Cash-Out Refinance',
      description: 'Replace your mortgage with a new, larger loan',
      icon: HomeIcon
    },
    {
      id: 'heloc',
      label: 'HELOC / Home Equity',
      description: 'Keep your mortgage, add a second loan',
      icon: CreditCardIcon
    }
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-4" role="tablist">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                role="tab"
                aria-selected={isActive}
                className={`
                  flex-1 sm:flex-none group relative py-4 px-3 sm:px-6
                  text-sm font-medium transition-all duration-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-light-blue focus-visible:ring-offset-2
                  ${isActive
                    ? 'text-navy'
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                <div className="flex items-center justify-center sm:justify-start">
                  <Icon
                    className={`w-5 h-5 sm:mr-2 transition-colors duration-200
                      ${isActive ? 'text-light-blue-dark' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                  />
                  <span className="hidden sm:inline font-semibold">{tab.label}</span>
                  <span className="sm:hidden text-xs font-semibold">
                    {tab.id === 'cashout' ? 'Cash-Out' : 'HELOC'}
                  </span>
                </div>

                {/* Mobile description tooltip */}
                <div className="hidden sm:block text-xs text-gray-400 mt-0.5">
                  {tab.description}
                </div>

                {/* Active indicator */}
                <div
                  className={`
                    absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-light-blue via-pink to-purple'
                      : 'bg-transparent group-hover:bg-gray-200'
                    }
                  `}
                />
              </button>
            );
          })}
        </nav>
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

function CreditCardIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}
