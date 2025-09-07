import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Premium animated components with dark mode support
const AnimatedBorder = ({ children }: { children: React.ReactNode }) => (
  <div className="relative p-0.5 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-x">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
      {children}
    </div>
  </div>
);

// Types for Coogi email intelligence
interface EmailStats {
  success: boolean;
  domain: string;
  total_emails_received: number;
  emails_last_24h: number;
  supported_addresses: string[];
  s3_bucket: string;
  ses_sending_stats: any;
  timestamp: string;
}

interface ProcessingResult {
  success: boolean;
  domain: string;
  emails_found: number;
  emails_processed: number;
  auto_tagged: number;
  smart_replies_generated: number;
  auto_replies_sent: number;
  processing_time_ms: number;
  timestamp: string;
}

interface Analytics {
  total_emails_processed: number;
  daily_average: number;
  peak_hour: string;
  auto_tag_accuracy: number;
  auto_reply_rate: number;
  sentiment_breakdown: {
    positive: number;
    neutral: number;
    negative: number;
    frustrated: number;
  };
  department_routing: {
    sales: number;
    support: number;
    technical: number;
    general: number;
  };
  response_times: {
    auto_reply_avg_seconds: number;
    gpt_processing_avg_ms: number;
  };
}

// Premium animation components
const PulsingDot = ({ color = "bg-blue-500" }: { color?: string }) => (
  <div className="relative">
    <div className={`w-3 h-3 ${color} rounded-full animate-pulse`}>
      <div className={`absolute inset-0 ${color} rounded-full animate-ping opacity-75`}></div>
    </div>
  </div>
);

const FloatingCard = ({ children, delay = "0s" }: { children: React.ReactNode; delay?: string }) => (
  <div 
    className="animate-float"
    style={{ 
      animationDelay: delay,
      animation: `float 6s ease-in-out infinite ${delay}` 
    }}
  >
    {children}
  </div>
);

const GradientText = ({ children, gradient = "from-blue-600 to-purple-600" }: { children: React.ReactNode; gradient?: string }) => (
  <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent font-bold`}>
    {children}
  </span>
);

const ProcessingSpinner = () => (
  <div className="flex items-center space-x-2">
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
  </div>
);

const MetricCard = ({ 
  title, 
  value, 
  description, 
  color = "blue",
  animate = true 
}: { 
  title: string; 
  value: string | number; 
  description: string; 
  color?: string;
  animate?: boolean;
}) => {
  const colorMap = {
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
    purple: "from-purple-500 to-violet-500",
    orange: "from-orange-500 to-amber-500",
    red: "from-red-500 to-rose-500",
    gray: "from-gray-500 to-slate-500"
  };

  return (
    <div className={`relative overflow-hidden ${animate ? 'hover:scale-105 transition-transform duration-300' : ''}`}>
      <div className="absolute inset-0 bg-gradient-to-br opacity-10 animate-pulse" 
           style={{ background: `linear-gradient(135deg, ${colorMap[color as keyof typeof colorMap] || colorMap.blue})` }}>
      </div>
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h3>
          <PulsingDot color={`bg-${color}-500`} />
        </div>
        <div className={`text-2xl font-bold bg-gradient-to-r ${colorMap[color as keyof typeof colorMap] || colorMap.blue} bg-clip-text text-transparent`}>
          {value}
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{description}</p>
      </div>
    </div>
  );
};

const CoogiEmailIntelligence: React.FC = () => {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [processing, setProcessing] = useState(false);
  const [lastProcessing, setLastProcessing] = useState<ProcessingResult | null>(null);
  const [isSetup, setIsSetup] = useState(false);

  // Get API base URL from environment
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8001';

  // Fetch email statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/coogi-email/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch email stats:', error);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/coogi-email/analytics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  // Setup Coogi email system
  const setupEmailSystem = async () => {
    try {
      setProcessing(true);
      const response = await fetch(`${API_BASE}/api/coogi-email/setup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setIsSetup(true);
        await fetchStats();
        console.log('Setup completed:', result);
      }
    } catch (error) {
      console.error('Setup failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Process emails
  const processEmails = async (hours: number = 24) => {
    try {
      setProcessing(true);
      const response = await fetch(`${API_BASE}/api/coogi-email/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hours: hours,
          auto_reply: true
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setLastProcessing(result);
        await fetchStats();
        await fetchAnalytics();
      }
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Premium Header with Gradient Background - Dark/Light Mode */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-800 dark:via-purple-800 dark:to-slate-800 p-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-white dark:bg-slate-100 rounded-sm transform rotate-12 animate-pulse"></div>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-bounce"></div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white dark:text-slate-100">
                  <GradientText gradient="from-blue-400 to-purple-400">
                    Coogi Email Intelligence
                  </GradientText>
                </h1>
                <p className="text-blue-200 dark:text-blue-300 mt-2 text-lg">
                  Enterprise-grade GPT-powered email automation for @coogi.com
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            {!isSetup && (
              <Button 
                onClick={setupEmailSystem}
                disabled={processing}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white dark:text-slate-100 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {processing ? <ProcessingSpinner /> : <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-white/20 dark:bg-slate-200/20 rounded animate-spin"></div>
                  <span>Initialize System</span>
                </div>}
              </Button>
            )}
            <Button 
              onClick={() => processEmails(24)}
              disabled={processing}
              className="bg-white/10 hover:bg-white/20 dark:bg-slate-700/30 dark:hover:bg-slate-600/40 text-white dark:text-slate-100 border border-white/20 dark:border-slate-600/40 hover:border-white/40 dark:hover:border-slate-500/60 px-6 py-3 rounded-xl backdrop-blur-sm transition-all duration-300"
            >
              {processing ? <ProcessingSpinner /> : <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 dark:border-slate-300/30 border-t-white dark:border-t-slate-100 rounded-full animate-spin"></div>
                <span>Process Last 24h</span>
              </div>}
            </Button>
          </div>
        </div>
      </div>

      {/* Premium Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FloatingCard delay="0s">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-blue-950/20">
            <CardContent className="p-6">
              <MetricCard
                title="Total Emails"
                value={stats ? stats.total_emails_received.toLocaleString() : '---'}
                description="All time @coogi.com emails"
                color="blue"
              />
            </CardContent>
          </Card>
        </FloatingCard>

        <FloatingCard delay="0.5s">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-green-50 dark:from-slate-800 dark:to-green-950/20">
            <CardContent className="p-6">
              <MetricCard
                title="Last 24 Hours"
                value={stats ? stats.emails_last_24h.toLocaleString() : '---'}
                description="Recent email volume"
                color="green"
              />
            </CardContent>
          </Card>
        </FloatingCard>

        <FloatingCard delay="1s">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-purple-950/20">
            <CardContent className="p-6">
              <MetricCard
                title="Auto-Tag Accuracy"
                value={analytics ? `${analytics.auto_tag_accuracy}%` : '---'}
                description="GPT classification accuracy"
                color="purple"
              />
            </CardContent>
          </Card>
        </FloatingCard>

        <FloatingCard delay="1.5s">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-orange-50 dark:from-slate-800 dark:to-orange-950/20">
            <CardContent className="p-6">
              <MetricCard
                title="Auto-Reply Rate"
                value={analytics ? `${analytics.auto_reply_rate}%` : '---'}
                description="Automated responses sent"
                color="orange"
              />
            </CardContent>
          </Card>
        </FloatingCard>
      </div>

      {/* Latest Processing Results with Premium Animation */}
      {lastProcessing && (
        <AnimatedBorder>
          <Card className="border-0 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-white dark:bg-slate-100 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <GradientText gradient="from-green-600 to-emerald-600">
                    Latest Processing Results
                  </GradientText>
                </div>
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Processed {new Date(lastProcessing.timestamp).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center group hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                    {lastProcessing.emails_processed}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Emails Processed
                  </div>
                  <div className="w-full h-1 bg-blue-200 dark:bg-blue-900/50 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                <div className="text-center group hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                    {lastProcessing.auto_tagged}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    Auto-Tagged
                  </div>
                  <div className="w-full h-1 bg-green-200 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                <div className="text-center group hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-2">
                    {lastProcessing.smart_replies_generated}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Smart Replies
                  </div>
                  <div className="w-full h-1 bg-purple-200 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                <div className="text-center group hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                    {lastProcessing.auto_replies_sent}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    Auto-Sent
                  </div>
                  <div className="w-full h-1 bg-orange-200 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Badge className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 border-0 px-4 py-2 rounded-full">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Processing Time: {lastProcessing.processing_time_ms}ms</span>
                  </div>
                </Badge>
              </div>
            </CardContent>
          </Card>
        </AnimatedBorder>
      )}

      {/* Analytics Tabs */}
      <Tabs defaultValue="sentiment" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
          <TabsTrigger value="departments">Department Routing</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="emails">Email Addresses</TabsTrigger>
        </TabsList>

        <TabsContent value="sentiment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Sentiment Breakdown</CardTitle>
              <CardDescription>
                GPT-4o-mini sentiment analysis of incoming emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {analytics.sentiment_breakdown.positive}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Positive</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {analytics.sentiment_breakdown.neutral}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Neutral</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {analytics.sentiment_breakdown.negative}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Negative</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {analytics.sentiment_breakdown.frustrated}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Frustrated</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Department Routing</CardTitle>
              <CardDescription>
                How emails are automatically categorized and routed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {analytics.department_routing.sales}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Sales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {analytics.department_routing.support}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Support</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {analytics.department_routing.technical}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Technical</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                      {analytics.department_routing.general}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">General</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>
                GPT-4o-mini processing speed and efficiency metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {analytics.daily_average.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Daily Average</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {analytics.response_times.gpt_processing_avg_ms}ms
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">GPT Processing</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {analytics.response_times.auto_reply_avg_seconds}s
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Auto-Reply Speed</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>@coogi.com Email Addresses</CardTitle>
              <CardDescription>
                Monitored email addresses with auto-tagging and smart replies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">support@coogi.com</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Customer support & technical help</div>
                    </div>
                    <Badge className="bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300">High Priority</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">sales@coogi.com</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Sales inquiries & demos</div>
                    </div>
                    <Badge className="bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300">High Priority</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">demo@coogi.com</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Product demo requests</div>
                    </div>
                    <Badge className="bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300">High Priority</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">contact@coogi.com</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">General business inquiries</div>
                    </div>
                    <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">Normal</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">hello@coogi.com</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Friendly first contact</div>
                    </div>
                    <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">Normal</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">partnership@coogi.com</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Business partnerships</div>
                    </div>
                    <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">Normal</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Premium System Status */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800 dark:to-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <GradientText gradient="from-indigo-600 to-purple-600">
              System Configuration
            </GradientText>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Domain: @coogi.com verified", color: "green" },
              { label: "Model: GPT-4o-mini", color: "blue" },
              { label: "Capacity: 50,000+ daily emails", color: "purple" },
              { label: "SES + S3 Integration", color: "orange" },
              { label: "Auto-tagging enabled", color: "green" },
              { label: "Smart replies enabled", color: "blue" }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-white/50 dark:bg-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-600/40 transition-all duration-300 hover:scale-105">
                <div className={`w-6 h-6 bg-gradient-to-r from-${item.color}-400 to-${item.color}-600 rounded-full flex items-center justify-center`}>
                  <div className="w-3 h-3 bg-white dark:bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoogiEmailIntelligence;
