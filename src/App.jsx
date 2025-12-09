import { useState, useRef, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import ClientInfo from './components/ClientInfo';
import CashOutRefinance from './components/CashOutRefinance';
import HELOC from './components/HELOC';
import Footer from './components/Footer';
import PrintReport from './components/PrintReport';
import ShareModal from './components/ShareModal';
import { generateTextSummary } from './utils/formatters';
import { generateCashOutRecommendations, generateHELOCRecommendations } from './utils/recommendations';

function App() {
  // Active tab state
  const [activeTab, setActiveTab] = useState('cashout');

  // Client info state
  const [clientName, setClientName] = useState('');
  const [loanOfficerName, setLoanOfficerName] = useState('');

  // Results state (shared for print/share)
  const [currentResults, setCurrentResults] = useState(null);
  const [currentInputs, setCurrentInputs] = useState(null);
  const [currentRecommendations, setCurrentRecommendations] = useState([]);

  // Modal states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Print ref
  const printRef = useRef();

  // Handle results change from calculator tabs
  const handleResultsChange = useCallback((results, inputs, type) => {
    setCurrentResults(results);
    setCurrentInputs(inputs);

    // Generate recommendations
    const recs = type === 'heloc'
      ? generateHELOCRecommendations(results, inputs)
      : generateCashOutRecommendations(results, inputs);
    setCurrentRecommendations(recs);
  }, []);

  // Print handler
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Luminate_Bank_Debt_Consolidation_${new Date().toISOString().split('T')[0]}`,
    onBeforePrint: () => {
      return new Promise((resolve) => {
        // Ensure the print component is rendered
        setTimeout(resolve, 100);
      });
    },
    pageStyle: `
      @page {
        size: letter;
        margin: 0.5in;
      }
      @media print {
        html, body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `
  });

  // Copy summary handler
  const handleCopy = useCallback(async () => {
    if (currentResults) {
      const summary = generateTextSummary(currentResults, activeTab);
      try {
        await navigator.clipboard.writeText(summary);
        return true;
      } catch (err) {
        console.error('Failed to copy:', err);
        return false;
      }
    }
    return false;
  }, [currentResults, activeTab]);

  // Share handler
  const handleShare = useCallback(() => {
    setIsShareModalOpen(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header
        onPrint={handlePrint}
        onShare={handleShare}
        onCopy={handleCopy}
      />

      {/* Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Client Info */}
      <ClientInfo
        clientName={clientName}
        loanOfficerName={loanOfficerName}
        onClientNameChange={setClientName}
        onLoanOfficerNameChange={setLoanOfficerName}
      />

      {/* Main Content */}
      <main className="flex-1 pb-8">
        {activeTab === 'cashout' ? (
          <CashOutRefinance onResultsChange={handleResultsChange} />
        ) : (
          <HELOC onResultsChange={handleResultsChange} />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Hidden Print Component */}
      <div className="hidden">
        <PrintReport
          ref={printRef}
          results={currentResults || {
            before: { monthlyPayment: 0, backEndDTI: 0, ltv: 0, weightedRate: 0 },
            after: { monthlyPayment: 0, backEndDTI: 0, ltv: 0, cltv: 0, weightedRate: 0, drawPeriod: { monthlyPayment: 0 }, backEndDTIRepay: 0 },
            savings: { monthly: 0, monthlyDraw: 0, breakEvenMonths: 0 },
            debts: { count: 0, totalBalance: 0, totalPayments: 0 }
          }}
          inputs={currentInputs}
          type={activeTab}
          recommendations={currentRecommendations}
          clientName={clientName}
          loanOfficerName={loanOfficerName}
        />
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        results={currentResults || {
          before: { monthlyPayment: 0 },
          after: { monthlyPayment: 0, drawPeriod: { monthlyPayment: 0 } },
          savings: { monthly: 0, monthlyDraw: 0 },
          debts: { count: 0, totalBalance: 0 }
        }}
        inputs={currentInputs}
        type={activeTab}
      />
    </div>
  );
}

export default App;
