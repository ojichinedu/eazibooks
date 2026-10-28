import { useState } from 'react';
import { Layout } from './layout/Layout';
import { FloatingActionButton } from './layout/FloatingActionButton';
import { Settings } from './layout/Settings';
import {
  Dashboard,
  Accounting,
  Inventory,
  TaxCompliance,
  Payroll,
  QuickInvoice,
  QuickBilling,
  AIChat,
  OCRScanner,
  PremiumGate,
  Customers,
  ProductsCatalog,
  Suppliers,
  Transactions,
  Reports,
  LiegeLedger
} from './modules';
import { CurrencyProvider } from '../utils/CurrencyContext';
import { SubscriptionProvider, useSubscription } from '../utils/SubscriptionContext';

export function DashboardApp() {
  const [activeModule, setActiveModule] = useState('ledger');

  const handleQuickInvoice = () => {
    setActiveModule('quick-invoice');
  };

  const handleQuickBilling = () => {
    setActiveModule('quick-billing');
  };

  const handleOCRScanner = () => {
    setActiveModule('ocr-scanner');
  };

  const ModuleRenderer = () => {
    const { isPremium, isStarter, isProfessional, features } = useSubscription();

    const handleUpgradeClick = () => {
      setActiveModule('settings');
    };

    switch (activeModule) {
      case 'ledger':
        return <LiegeLedger />;
      case 'dashboard':
        return (
          <Dashboard 
            onQuickInvoice={handleQuickInvoice}
            onQuickBilling={handleQuickBilling}
            onOCRScanner={handleOCRScanner}
          />
        );
      case 'quick-invoice':
        return <QuickInvoice />;
      case 'quick-billing':
        return <QuickBilling />;
      case 'ocr-scanner':
        return features.hasAIScanner ? (
          <OCRScanner />
        ) : (
          <PremiumGate 
            feature="AI OCR Scanner" 
            requiredPlan="premium"
            onUpgrade={handleUpgradeClick} 
          />
        );
      case 'accounting':
        return features.hasAccounting ? (
          <Accounting />
        ) : (
          <PremiumGate 
            feature="Accounting" 
            requiredPlan="starter"
            onUpgrade={handleUpgradeClick} 
          />
        );
      case 'inventory':
        return features.hasInventory ? (
          <Inventory />
        ) : (
          <PremiumGate 
            feature="Inventory Management" 
            requiredPlan="professional"
            onUpgrade={handleUpgradeClick} 
          />
        );
      case 'tax':
        return features.hasTaxCompliance ? (
          <TaxCompliance />
        ) : (
          <PremiumGate 
            feature="Tax Compliance" 
            requiredPlan="professional"
            onUpgrade={handleUpgradeClick} 
          />
        );
      case 'payroll':
        return features.hasPayroll ? (
          <Payroll />
        ) : (
          <PremiumGate 
            feature="Payroll Processing" 
            requiredPlan="premium"
            onUpgrade={handleUpgradeClick} 
          />
        );
      case 'customers':
        return <Customers />;
      case 'products':
        return <ProductsCatalog />;
      case 'suppliers':
        return <Suppliers />;
      case 'transactions':
        return <Transactions />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <Dashboard 
            onQuickInvoice={handleQuickInvoice}
            onQuickBilling={handleQuickBilling}
            onOCRScanner={handleOCRScanner}
          />
        );
    }
  };

  return (
    <SubscriptionProvider>
      <CurrencyProvider>
        <Layout activeModule={activeModule} onModuleChange={setActiveModule}>
          <ModuleRenderer />
          <FloatingActionButton 
            onQuickInvoice={handleQuickInvoice}
            onQuickBilling={handleQuickBilling}
          />
          <PremiumAwareAIChat />
        </Layout>
      </CurrencyProvider>
    </SubscriptionProvider>
  );
}

function PremiumAwareAIChat() {
  const { features } = useSubscription();
  
  if (!features.hasAIChatbot) {
    return null;
  }
  
  return <AIChat />;
}
