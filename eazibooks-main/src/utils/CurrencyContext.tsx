import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DEFAULT_CURRENCY } from './currency';
import { supabase } from './supabase/client';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<string>(DEFAULT_CURRENCY);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrency();
  }, []);

  const loadCurrency = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single();

        if (profile?.company_id) {
          const { data: company } = await supabase
            .from('companies')
            .select('currency')
            .eq('id', profile.company_id)
            .single();

          if (company?.currency) {
            setCurrencyState(company.currency);
          }
        }
      }
    } catch (error) {
      console.error('Error loading currency:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
