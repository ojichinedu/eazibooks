import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  FileText,
  Receipt,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Calculator,
  Scan,
  Sparkles,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { AIInsightsCard } from './AIFeatures';
import { useCurrency } from '../utils/CurrencyContext';
import { formatCurrency } from '../utils/currency';
import { useSubscription } from '../utils/SubscriptionContext';
import { toast } from 'sonner@2.0.3';
type DashboardStat = {
  title: string;
  value: string;
  change: string;
  period: string;
  trend: 'up' | 'down';
  icon: typeof DollarSign;
};

type RecentActivity = {
  id: string;
  message: string;
  time: string;
  status: 'success' | 'warning' | 'pending' | 'error';
  created_at: string;
};

type LiveDashboard = {
  revenue: number;
  revenue_change: number | null;
  customers: number;
  products: number;
  pending_invoices: number;
  overdue_invoices: number;
  draft_invoices: number;
  paid_this_month: number;
  pending_payments: number;
  recent_activities: RecentActivity[];
};

interface DashboardProps {
  onQuickInvoice?: () => void;
  onQuickBilling?: () => void;
  onOCRScanner?: () => void;
}

export function Dashboard({ onQuickInvoice, onQuickBilling, onOCRScanner }: DashboardProps) {
  const { currency } = useCurrency();
  const { isPremium, usage, limits } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState<DashboardStat[]>([]);

  const fetchDashboardData = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/ledger/dashboard', {
        credentials: 'same-origin',
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.data) throw new Error(body.message || 'Unable to load live dashboard data.');

      const dashboard = body.data as LiveDashboard;
      const revenueChange = dashboard.revenue_change;
      setStats([
        {
          title: 'Revenue this month',
          value: formatCurrency(dashboard.revenue, currency),
          change: revenueChange === null ? 'No prior-month data' : `${revenueChange >= 0 ? '+' : ''}${revenueChange}%`,
          period: revenueChange === null ? 'recorded from the ledger' : 'versus last month',
          trend: revenueChange === null || revenueChange >= 0 ? 'up' : 'down',
          icon: DollarSign,
        },
        {
          title: 'Customers',
          value: dashboard.customers.toLocaleString(),
          change: 'Live database total',
          period: 'customer contacts',
          trend: 'up',
          icon: Users,
        },
        {
          title: 'Inventory items',
          value: dashboard.products.toLocaleString(),
          change: 'Live database total',
          period: 'product records',
          trend: 'up',
          icon: Package,
        },
        {
          title: 'Pending invoices',
          value: dashboard.pending_invoices.toLocaleString(),
          change: `${dashboard.overdue_invoices} overdue`,
          period: 'from invoice records',
          trend: dashboard.overdue_invoices > 0 ? 'down' : 'up',
          icon: FileText,
        },
      ]);
      setRecentActivities(dashboard.recent_activities || []);
      setQuickStats({
        overdueInvoices: dashboard.overdue_invoices,
        draftInvoices: dashboard.draft_invoices,
        paidThisMonth: dashboard.paid_this_month,
        pendingPayments: dashboard.pending_payments,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load live dashboard data. Please refresh.');
    } finally {
      setRefreshing(false);
    }
  };
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [quickStats, setQuickStats] = useState({
    overdueInvoices: 0,
    draftInvoices: 0,
    paidThisMonth: 0,
    pendingPayments: 0,
  });

  // Initial data load
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await fetchDashboardData();
      setLoading(false);
    };
    initialLoad();
  }, [currency]);

  const quickActions = [
    {
      title: 'Create Invoice',
      description: 'Generate a new invoice quickly',
      icon: FileText,
      action: onQuickInvoice,
      color: 'bg-muted hover:bg-accent border-border',
      iconColor: 'text-foreground',
    },
    {
      title: 'Quick Bill',
      description: 'Create and send bills instantly',
      icon: Receipt,
      action: onQuickBilling,
      color: 'bg-muted hover:bg-accent border-border',
      iconColor: 'text-foreground',
    },
    {
      title: 'AI OCR Scanner',
      description: 'Scan invoices with AI',
      icon: Scan,
      action: onOCRScanner,
      color: 'bg-muted hover:bg-accent border-border',
      iconColor: 'text-foreground',
      badge: 'AI',
    },
    {
      title: 'GST Calculator',
      description: 'Calculate GST on transactions',
      icon: Calculator,
      action: () => console.log('GST Calculator'),
      color: 'bg-muted hover:bg-accent border-border',
      iconColor: 'text-foreground',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1>Dashboard</h1>
            <Badge variant="secondary">
              EaziBook
            </Badge>
          </div>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your business.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={onQuickInvoice} className="gap-2">
            <Zap className="w-4 h-4" />
            Quick Invoice
          </Button>
          <Button onClick={onQuickBilling} variant="outline" className="gap-2">
            <Receipt className="w-4 h-4" />
            Quick Bill
          </Button>
        </div>
      </div>

      {/* Subscription Status for Free Plan */}
      {!isPremium && (
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Free Plan</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    You're using {usage.invoices + usage.bills} of {limits.invoices + limits.bills} monthly transactions
                  </p>
                  <Button size="sm" className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Upgrade to Premium
                  </Button>
                </div>
              </div>
              <Badge variant="secondary">Free</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md text-left ${action.color}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <action.icon className={`w-6 h-6 ${action.iconColor}`} />
                  {action.badge && (
                    <Badge className="text-xs" variant="secondary">
                      {action.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="font-medium mb-1">{action.title}</h3>
                <p className="text-sm opacity-80">{action.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {stat.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                {stat.change} {stat.period}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity and AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    {getStatusIcon(activity.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Overdue Invoices</span>
                <Badge variant="destructive">{quickStats.overdueInvoices}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Draft Invoices</span>
                <Badge variant="secondary">{quickStats.draftInvoices}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Paid This Month</span>
                <Badge variant="outline">{formatCurrency(quickStats.paidThisMonth, currency)}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Pending Payments</span>
                <Badge variant="secondary">{formatCurrency(quickStats.pendingPayments, currency)}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <AIInsightsCard />
    </div>
  );
}