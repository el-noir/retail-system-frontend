import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  BarChart3, 
  Users, 
  Truck, 
  Shield, 
  Zap, 
  ShoppingCart,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Star,
  DollarSign,
  Target,
  Clock,
  Award
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Package,
      title: "Smart Inventory",
      description: "Advanced product management with automated SKU generation and real-time stock tracking",
      highlight: "Auto SKU System"
    },
    {
      icon: ShoppingCart,
      title: "Point of Sale",
      description: "Lightning-fast checkout with integrated payment processing and instant receipt generation",
      highlight: "Instant Checkout"
    },
    {
      icon: BarChart3,
      title: "Analytics Engine",
      description: "Powerful insights with sales trends, profit analysis, and inventory forecasting",
      highlight: "Real-time Data"
    },
    {
      icon: Truck,
      title: "Procurement Hub",
      description: "Streamlined supplier management with automated purchase orders and delivery tracking",
      highlight: "Supply Chain"
    },
    {
      icon: Users,
      title: "Role Management",
      description: "Granular access control with customized dashboards for Admin, Manager, and Cashier roles",
      highlight: "Multi-user"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade security with JWT authentication and comprehensive audit trails",
      highlight: "Secure"
    }
  ];

  const stats = [
    { label: "Inventory Accuracy", value: "99.9%", icon: Target, color: "text-emerald-400" },
    { label: "Process Efficiency", value: "+70%", icon: TrendingUp, color: "text-blue-400" },
    { label: "User Rating", value: "4.9/5", icon: Star, color: "text-yellow-400" },
    { label: "System Uptime", value: "99.8%", icon: Clock, color: "text-green-400" }
  ];

  const testimonials = [
    {
      quote: "Store Master revolutionized our inventory management. The automated SKU system alone saved us hours daily.",
      author: "Sarah Chen",
      role: "Operations Manager",
      company: "Tech Retail Co."
    },
    {
      quote: "The analytics dashboard provides insights we never had before. Our profit margins improved by 25%.",
      author: "Michael Rodriguez",
      role: "Store Owner",
      company: "Fashion Boutique"
    },
    {
      quote: "Seamless integration and the role-based access control makes training new staff incredibly easy.",
      author: "Emma Thompson",
      role: "Regional Manager",
      company: "Electronics Chain"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-slate-950 to-blue-900/20"></div>
        <div className="relative max-w-7xl mx-auto text-center">

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Master Your 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
              Inventory Flow
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-2">
            Complete inventory management solution with intelligent SKU generation, real-time analytics, 
            and role-based workflows. Built for businesses that demand precision and efficiency.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/sign-in" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg bg-emerald-600 hover:bg-emerald-700">
                Start Managing
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg border-slate-700 hover:bg-slate-800">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-slate-800 rounded-xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 ${stat.color}`} />
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-slate-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto px-2">
              Comprehensive features designed to streamline operations and maximize profitability
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="bg-slate-900/80 border-slate-700 hover:border-emerald-500/50 transition-all duration-300 group hover:scale-105 h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-emerald-600/20 rounded-lg group-hover:bg-emerald-600/30 transition-colors">
                        <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
                      </div>
                      <Badge className="bg-emerald-900/50 text-emerald-300 text-xs">
                        {feature.highlight}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg sm:text-xl text-white group-hover:text-emerald-100">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm sm:text-base text-slate-300 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Built for Every Role in Your Organization
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto px-2">
              Tailored interfaces and permissions that empower your entire team
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            <Card className="bg-slate-900/80 border-slate-700 hover:border-emerald-500/50 transition-all duration-300 h-full">
              <CardHeader>
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-600/20 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                    <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-white">Administrators</CardTitle>
                    <p className="text-sm text-emerald-400">Full System Control</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-slate-300">
                  <li className="flex items-center"><Award className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0 text-emerald-400" /> Complete system oversight</li>
                  <li className="flex items-center"><Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0 text-emerald-400" /> User management & permissions</li>
                  <li className="flex items-center"><BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0 text-emerald-400" /> Advanced analytics & reports</li>
                  <li className="flex items-center"><Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0 text-emerald-400" /> System configuration</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-700 hover:border-blue-500/50 transition-all duration-300 h-full">
              <CardHeader>
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                    <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-white">Managers</CardTitle>
                    <p className="text-sm text-blue-400">Strategic Oversight</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-slate-300">
                  <li className="flex items-center"><Package className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0 text-blue-400" /> Inventory monitoring</li>
                  <li className="flex items-center"><TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0 text-blue-400" /> Sales performance tracking</li>
                  <li className="flex items-center"><Truck className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0 text-blue-400" /> Supplier management</li>
                  <li className="flex items-center"><Target className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0 text-blue-400" /> Team oversight & KPIs</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-700 hover:border-purple-500/50 transition-all duration-300 h-full md:col-span-2 xl:col-span-1">
              <CardHeader>
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                    <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-white">Cashiers</CardTitle>
                    <p className="text-sm text-purple-400">Sales Excellence</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-slate-300">
                  <li className="flex items-center"><Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0 text-purple-400" /> Lightning-fast POS</li>
                  <li className="flex items-center"><Package className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0 text-purple-400" /> Quick product search</li>
                  <li className="flex items-center"><DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0 text-purple-400" /> Payment processing</li>
                  <li className="flex items-center"><ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0 text-purple-400" /> Receipt generation</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 md:py-20 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Trusted by Industry Leaders</h2>
            <p className="text-lg sm:text-xl text-slate-300 px-2">See what our customers say about Store Master</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700 h-full">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center mb-3 sm:mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-sm sm:text-base text-slate-300 mb-4 sm:mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="border-t border-slate-700 pt-3 sm:pt-4">
                    <p className="font-semibold text-white text-sm sm:text-base">{testimonial.author}</p>
                    <p className="text-xs sm:text-sm text-emerald-400">{testimonial.role}</p>
                    <p className="text-xs text-slate-400">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-emerald-900/40 to-blue-900/40 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 border border-slate-700">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
              Ready to Master Your Inventory?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-6 sm:mb-8 px-2">
              Join thousands of businesses already transforming their operations with Store Master
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link href="/sign-in" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg bg-emerald-600 hover:bg-emerald-700">
                  Start Managing Your Inventory
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <p className="text-sm text-slate-400"></p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-4 md:mb-0">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Package className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <span className="text-lg sm:text-xl font-bold text-white">Store Master</span>
                <p className="text-xs text-emerald-400">Professional Edition</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm sm:text-base text-slate-400 mb-1 sm:mb-2 px-2">
                Professional inventory management for modern businesses
              </p>
              <div className="text-xs sm:text-sm text-slate-500">
                © 2025 Store Master. Built with Next.js & NestJS.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
