import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase/client';

export type SubscriptionPlan = 'free' | 'starter' | 'professional' | 'premium';

interface SubscriptionLimits {
  invoices: number;
  bills: number;
}

interface SubscriptionFeatures {
  hasCompanyBranding: boolean;
  hasAIScanner: boolean;
  hasAIChatbot: boolean;
  hasAccounting: boolean;
  hasInventory: boolean;
  hasTaxCompliance: boolean;
  hasPayroll: boolean;
  hasAdvancedReports: boolean;
  hasPrioritySupport: boolean;
}

interface SubscriptionContextType {
  plan: SubscriptionPlan;
  setPlan: (plan: SubscriptionPlan) => void;
  isPremium: boolean;
  isStarter: boolean;
  isProfessional: boolean;
  usage: SubscriptionLimits;
  limits: SubscriptionLimits;
  features: SubscriptionFeatures;
  canCreateInvoice: boolean;
  canCreateBill: boolean;
  incrementInvoiceUsage: () => void;
  incrementBillUsage: () => void;
  resetUsage: () => void;
}

const FREE_LIMITS: SubscriptionLimits = {
  invoices: 5,
  bills: 5
};

const STARTER_LIMITS: SubscriptionLimits = {
  invoices: 50,
  bills: 50
};

const PROFESSIONAL_LIMITS: SubscriptionLimits = {
  invoices: Infinity,
  bills: Infinity
};

const PREMIUM_LIMITS: SubscriptionLimits = {
  invoices: Infinity,
  bills: Infinity
};

const FREE_FEATURES: SubscriptionFeatures = {
  hasCompanyBranding: false,
  hasAIScanner: false,
  hasAIChatbot: false,
  hasAccounting: false,
  hasInventory: false,
  hasTaxCompliance: false,
  hasPayroll: false,
  hasAdvancedReports: false,
  hasPrioritySupport: false
};

const STARTER_FEATURES: SubscriptionFeatures = {
  hasCompanyBranding: true,
  hasAIScanner: false,
  hasAIChatbot: false,
  hasAccounting: true,
  hasInventory: false,
  hasTaxCompliance: false,
  hasPayroll: false,
  hasAdvancedReports: false,
  hasPrioritySupport: false
};

const PROFESSIONAL_FEATURES: SubscriptionFeatures = {
  hasCompanyBranding: true,
  hasAIScanner: false,
  hasAIChatbot: false,
  hasAccounting: true,
  hasInventory: true,
  hasTaxCompliance: true,
  hasPayroll: false,
  hasAdvancedReports: true,
  hasPrioritySupport: false
};

const PREMIUM_FEATURES: SubscriptionFeatures = {
  hasCompanyBranding: true,
  hasAIScanner: true,
  hasAIChatbot: true,
  hasAccounting: true,
  hasInventory: true,
  hasTaxCompliance: true,
  hasPayroll: true,
  hasAdvancedReports: true,
  hasPrioritySupport: true
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [plan, setPlanState] = useState<SubscriptionPlan>('free');
  const [usage, setUsage] = useState<SubscriptionLimits>({
    invoices: 0,
    bills: 0
  });

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        try {
          // Get user's company
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.warn('Profile not found, using free plan:', profileError);
            return;
          }

          if (profile?.company_id) {
            // Load subscription data
            const { data: subscription, error: subscriptionError } = await supabase
              .from('subscriptions')
              .select('*')
              .eq('company_id', profile.company_id)
              .eq('status', 'active')
              .single();

            if (subscriptionError) {
              // No subscription found - user will use free plan by default
              // This is normal for new users
              if (subscriptionError.code !== 'PGRST116') {
                console.warn('Error loading subscription:', subscriptionError);
              }
              return;
            }

            if (subscription) {
              setPlanState(subscription.plan_type as SubscriptionPlan);
              setUsage({
                invoices: subscription.invoices_used || 0,
                bills: subscription.bills_used || 0
              });
            }
          }
        } catch (dbError) {
          console.warn('Database error loading subscription, using free plan:', dbError);
          // Continue with default free plan
        }
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
      // Continue with default free plan
    }
  };

  const setPlan = async (newPlan: SubscriptionPlan) => {
    setPlanState(newPlan);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single();

        if (profile?.company_id) {
          await supabase
            .from('subscriptions')
            .update({ plan_type: newPlan })
            .eq('company_id', profile.company_id);
        }
      }
    } catch (error) {
      console.error('Error updating subscription plan:', error);
    }
  };

  const updateUsage = async (newUsage: SubscriptionLimits) => {
    setUsage(newUsage);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single();

        if (profile?.company_id) {
          await supabase
            .from('subscriptions')
            .update({ 
              invoices_used: newUsage.invoices,
              bills_used: newUsage.bills 
            })
            .eq('company_id', profile.company_id);
        }
      }
    } catch (error) {
      console.error('Error updating usage:', error);
    }
  };

  const incrementInvoiceUsage = () => {
    const newUsage = { ...usage, invoices: usage.invoices + 1 };
    updateUsage(newUsage);
  };

  const incrementBillUsage = () => {
    const newUsage = { ...usage, bills: usage.bills + 1 };
    updateUsage(newUsage);
  };

  const resetUsage = () => {
    const newUsage = { invoices: 0, bills: 0 };
    updateUsage(newUsage);
  };

  const isPremium = plan === 'premium';
  const isStarter = plan === 'starter' || plan === 'professional' || plan === 'premium';
  const isProfessional = plan === 'professional' || plan === 'premium';
  
  const limits = 
    plan === 'premium' ? PREMIUM_LIMITS :
    plan === 'professional' ? PROFESSIONAL_LIMITS :
    plan === 'starter' ? STARTER_LIMITS :
    FREE_LIMITS;
  
  const features = 
    plan === 'premium' ? PREMIUM_FEATURES :
    plan === 'professional' ? PROFESSIONAL_FEATURES :
    plan === 'starter' ? STARTER_FEATURES :
    FREE_FEATURES;

  const canCreateInvoice = limits.invoices === Infinity || usage.invoices < limits.invoices;
  const canCreateBill = limits.bills === Infinity || usage.bills < limits.bills;

  return (
    <SubscriptionContext.Provider
      value={{
        plan,
        setPlan,
        isPremium,
        isStarter,
        isProfessional,
        usage,
        limits,
        features,
        canCreateInvoice,
        canCreateBill,
        incrementInvoiceUsage,
        incrementBillUsage,
        resetUsage
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}