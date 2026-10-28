import { useState } from 'react';
import { cn } from '../../components/ui/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '../../components/ui/sidebar';
import {
  LayoutDashboard,
  WalletCards,
  Calculator,
  Package,
  FileText,
  Users,
  Settings,
  Zap,
  Receipt,
  Moon,
  Sun,
  Scan,
  LogOut,
  Truck,
  List,
  BarChart,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../utils/AuthContext';
import { toast } from 'sonner@2.0.3';
import { useSubscription } from '../../utils/SubscriptionContext';

interface LayoutProps {
  children: React.ReactNode;
  activeModule: string;
  onModuleChange: (module: string) => void;
}

const menuItems = [
  { id: 'ledger', title: 'Ledger capture', icon: WalletCards },
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'quick-invoice',
    title: 'Quick Invoice',
    icon: Zap,
  },
  {
    id: 'quick-billing',
    title: 'Quick Billing',
    icon: Receipt,
  },
  {
    id: 'customers',
    title: 'Customers',
    icon: Users,
  },
  {
    id: 'products',
    title: 'Products',
    icon: ShoppingCart,
  },
  {
    id: 'suppliers',
    title: 'Suppliers',
    icon: Truck,
  },
  {
    id: 'transactions',
    title: 'Transactions',
    icon: List,
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: BarChart,
  },
  {
    id: 'ocr-scanner',
    title: 'AI OCR Scanner',
    icon: Scan,
    badge: 'Premium',
    isPremium: true,
  },
  {
    id: 'accounting',
    title: 'Accounting',
    icon: Calculator,
    badge: 'Pro',
    isPremium: true,
  },
  {
    id: 'inventory',
    title: 'Inventory',
    icon: Package,
    badge: 'Pro',
    isPremium: true,
  },
  {
    id: 'tax',
    title: 'Tax Compliance',
    icon: FileText,
    badge: 'Pro',
    isPremium: true,
  },
  {
    id: 'payroll',
    title: 'Payroll',
    icon: Users,
    badge: 'Premium',
    isPremium: true,
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: Settings,
  },
];

export function Layout({ children, activeModule, onModuleChange }: LayoutProps) {
  const [isDark, setIsDark] = useState(false);
  const { logout, user } = useAuth();
  const { isPremium } = useSubscription();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar variant="inset">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Calculator className="h-4 w-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">LIEGE</span>
                <span className="truncate text-xs">Ledger intelligence</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        onClick={() => onModuleChange(item.id)}
                        className={cn(
                          activeModule === item.id && 'bg-sidebar-accent text-sidebar-accent-foreground'
                        )}
                      >
                        <a href="#" className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          {item.badge && !isPremium && (
                            <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                              {item.badge}
                            </span>
                          )}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="p-4 space-y-3">
              {user && (
                <div className="px-3 py-2 rounded-lg bg-muted text-sm">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="w-full gap-2"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
              <div className="text-center text-xs text-muted-foreground">
                <p className="font-medium">LIEGE</p>
                <p className="text-[10px]">by LifeisEazi Group Enterprises</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4">
              <SidebarTrigger />
              <div className="flex-1" />
            </div>
          </header>
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
