import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Calculator,
  Sparkles,
  Receipt,
  Package,
  FileText,
  Users,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Shield,
  Clock,
  Zap,
  Rocket,
  Crown,
  Check,
  X,
  TrendingUp,
  Globe,
  Lock,
  Lightbulb,
  Target,
  Star,
  ChevronRight,
  Play,
  Building2,
  Briefcase,
  DollarSign,
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({
  onGetStarted,
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <Calculator className="h-5 w-5" />
                </div>
              </div>
              <div>
                <h1 className="text-lg tracking-tight">
                  EaziBook
                </h1>
                <p className="text-[10px] text-muted-foreground leading-none">
                  by LifeisEazi Group
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={onGetStarted}
                className="hidden sm:inline-flex"
              >
                Sign In
              </Button>
              <Button onClick={onGetStarted} className="group">
                Get Started
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background to-muted/30" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="max-w-5xl mx-auto text-center">
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-1.5 border shadow-sm"
            >
              <Sparkles className="h-3 w-3 mr-1.5 inline" />
              Powered by AI Technology
            </Badge>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-6 tracking-tight">
              <span className="block">Smart Business</span>
              <span className="block">Management for</span>
              <span className="inline-block relative">
                <span className="relative z-10">
                  Nigerian SMEs
                </span>
                <div className="absolute -inset-2 bg-primary/5 -skew-x-12 -z-10" />
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Comprehensive ERP solution with AI-powered
              features, multi-currency support, and seamless tax
              compliance. Get started in 30 minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                onClick={onGetStarted}
                size="lg"
                className="group px-8 shadow-lg"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 group border-2"
              >
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-3 w-3" />
                </div>
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-3 w-3" />
                </div>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-3 w-3" />
                </div>
                <span>24/7 Support available</span>
              </div>
            </div>
          </div>

          {/* Floating Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-20">
            <div className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-1">500+</div>
              <div className="text-xs text-muted-foreground">
                Active Users
              </div>
            </div>
            <div className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-1">99.9%</div>
              <div className="text-xs text-muted-foreground">
                Uptime SLA
              </div>
            </div>
            <div className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-1">50K+</div>
              <div className="text-xs text-muted-foreground">
                Invoices Generated
              </div>
            </div>
            <div className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-1">4.9/5</div>
              <div className="text-xs text-muted-foreground">
                User Rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4">
              Features
            </Badge>
            <h2 className="text-4xl sm:text-5xl md:text-6xl mb-6 tracking-tight">
              Everything You Need,
              <br />
              Nothing You Don't
            </h2>
            <p className="text-lg text-muted-foreground">
              Built specifically for Nigerian businesses with
              features that actually matter for your growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Feature Cards */}
            {[
              {
                icon: Receipt,
                title: "Smart Invoicing",
                description:
                  "Create professional invoices instantly with automated calculations, multi-currency support, and custom branding.",
                highlight: false,
              },
              {
                icon: Sparkles,
                title: "AI-Powered Insights",
                description:
                  "Get intelligent business recommendations and financial insights from our AI consultant chatbot.",
                highlight: true,
              },
              {
                icon: BarChart3,
                title: "Real-Time Analytics",
                description:
                  "Track your business performance with comprehensive dashboards and customizable reports.",
                highlight: false,
              },
              {
                icon: Package,
                title: "Inventory Control",
                description:
                  "Manage stock levels, track orders, and optimize your inventory across multiple warehouses.",
                highlight: false,
              },
              {
                icon: FileText,
                title: "Tax Compliance",
                description:
                  "Stay compliant with automated VAT and GST calculations designed for Nigerian regulations.",
                highlight: false,
              },
              {
                icon: Shield,
                title: "OCR Scanner",
                description:
                  "Scan invoices and receipts with AI-powered OCR for automatic data extraction and categorization.",
                highlight: true,
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className={`group hover:shadow-xl transition-all duration-300 border-2 ${
                  feature.highlight
                    ? "border-primary/20 bg-primary/5"
                    : "hover:border-border"
                }`}
              >
                <CardHeader className="space-y-4">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                      feature.highlight
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted group-hover:bg-primary group-hover:text-primary-foreground"
                    }`}
                  >
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-3 flex items-center gap-2">
                      {feature.title}
                      {feature.highlight && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-2 py-0"
                        >
                          AI
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4">
              Process
            </Badge>
            <h2 className="text-4xl sm:text-5xl md:text-6xl mb-6 tracking-tight">
              Get Started in Minutes
            </h2>
            <p className="text-lg text-muted-foreground">
              Three simple steps to transform your business
              operations
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  number: "01",
                  title: "Create Account",
                  description:
                    "Sign up in under 2 minutes. No credit card needed to get started with our free plan.",
                  icon: Users,
                },
                {
                  number: "02",
                  title: "Set Up Profile",
                  description:
                    "Add your company details and customize your branding. Our setup wizard makes it effortless.",
                  icon: Building2,
                },
                {
                  number: "03",
                  title: "Start Managing",
                  description:
                    "Begin creating invoices, tracking inventory, and growing your business with AI insights.",
                  icon: Rocket,
                },
              ].map((step, index) => (
                <div key={index} className="relative">
                  {/* Connector Line */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-border" />
                  )}

                  <div className="relative bg-card border-2 rounded-2xl p-8 hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto shadow-lg">
                        <step.icon className="h-8 w-8" />
                      </div>
                      <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-muted border-4 border-background flex items-center justify-center">
                        <span className="text-sm">
                          {step.number}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-2xl mb-3 text-center">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-center text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="group px-8"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4">
              Why EaziBook
            </Badge>
            <h2 className="text-4xl sm:text-5xl md:text-6xl mb-6 tracking-tight">
              Built for Nigerian
              <br />
              Business Reality
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Globe,
                title: "Multi-Currency Support",
                description:
                  "Handle transactions in Naira, Dollar, Rand, and Cedi with automatic exchange rate updates.",
              },
              {
                icon: Shield,
                title: "Tax Compliance Ready",
                description:
                  "Built-in VAT and GST calculations that comply with Nigerian tax regulations.",
              },
              {
                icon: Lock,
                title: "Bank-Level Security",
                description:
                  "Your data is encrypted and protected with enterprise-grade security measures.",
              },
              {
                icon: Lightbulb,
                title: "AI-Powered Automation",
                description:
                  "Save hours with automated invoice processing, smart categorization, and insights.",
              },
              {
                icon: Clock,
                title: "24/7 Support",
                description:
                  "Get help whenever you need it with our dedicated customer support team.",
              },
              {
                icon: Target,
                title: "Nigerian-First Design",
                description:
                  "Built specifically for the unique needs of Nigerian SMEs and business culture.",
              },
            ].map((benefit, index) => (
              <div
                key={index}
                className="flex gap-4 p-6 rounded-xl bg-card border hover:shadow-lg transition-all"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4">
              Pricing
            </Badge>
            <h2 className="text-4xl sm:text-5xl md:text-6xl mb-6 tracking-tight">
              Plans That Scale
              <br />
              With Your Growth
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free, upgrade when you're ready. All plans
              include core features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-muted to-muted" />
              <CardHeader className="text-center pb-6 pt-8">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl mb-2">
                  Free
                </CardTitle>
                <div className="mb-2">
                  <span className="text-5xl">₦0</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Perfect for trying out
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span>5 invoices/month</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span>5 bills/month</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span>Basic templates</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span>Multi-currency</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      Company branding
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      AI features
                    </span>
                  </li>
                </ul>
                <Button
                  onClick={onGetStarted}
                  variant="outline"
                  className="w-full"
                >
                  Start Free
                </Button>
              </CardContent>
            </Card>

            {/* Starter Plan */}
            <Card className="border-2 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-primary/50" />
              <CardHeader className="text-center pb-6 pt-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Rocket className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl mb-2">
                  Starter
                </CardTitle>
                <div className="mb-2">
                  <span className="text-5xl">₦5K</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  For small businesses
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span>50 invoices/month</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span>50 bills/month</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span>Company branding</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span>Basic accounting</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span>Basic reports</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      AI features
                    </span>
                  </li>
                </ul>
                <Button
                  onClick={onGetStarted}
                  className="w-full"
                >
                  Choose Starter
                </Button>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="border-2 border-primary hover:shadow-2xl transition-all duration-300 relative overflow-hidden scale-105">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary" />
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-primary-foreground text-xs rounded-full shadow-lg">
                MOST POPULAR
              </div>
              <CardHeader className="text-center pb-6 pt-8">
                <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl mb-2">
                  Professional
                </CardTitle>
                <div className="mb-2">
                  <span className="text-5xl">₦10K</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  For growing businesses
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span>Unlimited invoices</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span>Full accounting suite</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span>Inventory management</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span>Tax compliance tools</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span>Advanced reports</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      AI features
                    </span>
                  </li>
                </ul>
                <Button
                  onClick={onGetStarted}
                  className="w-full"
                >
                  Choose Professional
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-2 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary to-primary" />
              <CardHeader className="text-center pb-6 pt-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl mb-2">
                  Premium
                </CardTitle>
                <div className="mb-2">
                  <span className="text-5xl">₦15K</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  All features + AI
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span>Everything in Pro</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Sparkles className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span className="font-medium">
                      AI OCR Scanner
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Sparkles className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span className="font-medium">
                      AI Consultant Bot
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span>Payroll processing</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span>API access</span>
                  </li>
                </ul>
                <Button
                  onClick={onGetStarted}
                  className="w-full"
                >
                  Choose Premium
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground text-sm">
              All plans include multi-currency support, secure
              cloud storage, and data encryption
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4">
              Testimonials
            </Badge>
            <h2 className="text-4xl sm:text-5xl md:text-6xl mb-6 tracking-tight">
              Trusted by Nigerian
              <br />
              Entrepreneurs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                quote:
                  "EaziBook transformed how we handle invoicing. The AI features save us hours every week.",
                author: "Chidi Okafor",
                role: "CEO, Lagos Trading Co",
                rating: 5,
              },
              {
                quote:
                  "Finally, accounting software that understands Nigerian business needs. The tax compliance is perfect.",
                author: "Amina Hassan",
                role: "Owner, Kano Textiles",
                rating: 5,
              },
              {
                quote:
                  "Best investment for our business. The multi-currency support and reporting are game changers.",
                author: "Tunde Williams",
                role: "MD, Abuja Ventures",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="border-2 hover:shadow-lg transition-all"
              >
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map(
                      (_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-primary text-primary"
                        />
                      ),
                    )}
                  </div>
                  <p className="text-sm mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm">
                        {testimonial.author}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge
              variant="secondary"
              className="mb-6 bg-primary-foreground/20 text-primary-foreground border-0"
            >
              <Rocket className="h-3 w-3 mr-1.5 inline" />
              Ready to get started?
            </Badge>
            <h2 className="text-4xl sm:text-5xl md:text-6xl mb-6 tracking-tight">
              Transform Your Business
              <br />
              Operations Today
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join hundreds of Nigerian SMEs using EaziBook to
              streamline their operations. Start your free trial
              today - no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                onClick={onGetStarted}
                size="lg"
                variant="secondary"
                className="px-10 group shadow-xl"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground/10 px-10"
              >
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-primary-foreground/80">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                <span>Free forever plan available</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                <span>No credit card needed</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                <span>Start in under 5 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20 text-primary-foreground">
                  <Calculator className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg">EaziBook</h3>
                  <p className="text-xs text-primary-foreground/60">
                    by LifeisEazi Group
                  </p>
                </div>
              </div>
              <p className="text-primary-foreground/70 text-sm mb-6 max-w-sm leading-relaxed">
                Smart accounting and business management
                solution designed specifically for Nigerian
                SMEs.
              </p>
              <div className="flex gap-3">
                {["fb", "tw", "in", "ig"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-9 h-9 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
                  >
                    <span className="text-xs uppercase">
                      {social}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="mb-4 text-sm">Product</h4>
              <ul className="space-y-3 text-sm text-primary-foreground/70">
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-foreground transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-foreground transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-foreground transition-colors"
                  >
                    Security
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-foreground transition-colors"
                  >
                    Roadmap
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-foreground transition-colors"
                  >
                    Enterprise
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="mb-4 text-sm">Company</h4>
              <ul className="space-y-3 text-sm text-primary-foreground/70">
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-foreground transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-foreground transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-foreground transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-foreground transition-colors"
                  >
                    Press Kit
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-foreground transition-colors"
                  >
                    Partners
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="mb-4 text-sm">Resources</h4>
              <ul className="space-y-3 text-sm text-primary-foreground/70">
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-foreground transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-foreground transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-foreground transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-foreground transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-foreground transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-primary-foreground/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-primary-foreground/60">
                © 2025 LifeisEazi Group Enterprises. All rights
                reserved.
              </p>
              <div className="flex gap-6 text-sm text-primary-foreground/60">
                <a
                  href="#"
                  className="hover:text-primary-foreground transition-colors"
                >
                  Privacy
                </a>
                <a
                  href="#"
                  className="hover:text-primary-foreground transition-colors"
                >
                  Terms
                </a>
                <a
                  href="#"
                  className="hover:text-primary-foreground transition-colors"
                >
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}