/**
 * Footer component with disclaimer and version info
 */
export default function Footer() {
  return (
    <footer className="bg-navy text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Disclaimer */}
        <div className="mb-4 p-4 bg-navy-light/50 rounded-lg">
          <p className="text-xs text-gray-300 leading-relaxed">
            <span className="font-semibold text-light-blue">Disclaimer: </span>
            This calculator provides estimates for informational purposes only. Actual loan terms,
            rates, and payments may vary based on credit profile, property value, and other factors.
            All figures are estimates and do not represent a loan commitment or guarantee.
            Consult with your Luminate Bank loan officer for personalized guidance.
          </p>
        </div>

        {/* Footer Content */}
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          {/* Logo and NMLS */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-light-blue to-pink rounded-lg flex items-center justify-center">
                <span className="text-navy font-bold text-sm">L</span>
              </div>
              <span className="font-semibold">Luminate Bank</span>
            </div>
            <span className="text-sm text-gray-400">|</span>
            <span className="text-sm text-gray-400">NMLS#1281698</span>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6 text-sm">
            <a href="#" className="text-gray-300 hover:text-light-blue transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-300 hover:text-light-blue transition-colors">
              Terms of Use
            </a>
            <a href="#" className="text-gray-300 hover:text-light-blue transition-colors">
              Contact Us
            </a>
          </div>

          {/* Version */}
          <div className="text-sm text-gray-500">
            v1.0.0
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 pt-4 border-t border-navy-light text-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Luminate Bank. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
