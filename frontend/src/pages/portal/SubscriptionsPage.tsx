import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Building2
} from 'lucide-react';
import type { Subscription } from '@/services/mockAuthApi';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const planDetails = {
  starter: {
    name: 'Starter',
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
    description: 'Perfect for small projects and startups',
    features: ['Basic AI Consulting', 'Email Support', 'Monthly Reports', '1 Team Member']
  },
  professional: {
    name: 'Professional',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    description: 'For growing businesses with advanced needs',
    features: ['Priority Support', 'Monthly AI Reports', 'API Access', '5 Team Members', 'Custom Integrations']
  },
  enterprise: {
    name: 'Enterprise',
    icon: Building2,
    color: 'from-amber-500 to-orange-500',
    description: 'Full-scale AI transformation for large organizations',
    features: ['24/7 Dedicated Support', 'Weekly AI Reports', 'Full API Access', 'Unlimited Team Members', 'Custom AI Models', 'On-premise Deployment']
  }
};

export default function SubscriptionsPage() {
  const { getSubscriptions } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSubscriptions = async () => {
      const data = await getSubscriptions();
      setSubscriptions(data);
      setIsLoading(false);
    };
    loadSubscriptions();
  }, [getSubscriptions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'expired':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'cancelled':
        return <XCircle className="h-3 w-3" />;
      case 'expired':
        return <AlertCircle className="h-3 w-3" />;
      case 'pending':
        return <Clock className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const calculateProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const activeSubscription = subscriptions.find(s => s.status === 'active');

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage your subscription plans and billing
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/pricing">
            View Plans
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </motion.div>

      {/* Active Subscription */}
      {activeSubscription && (
        <motion.div variants={itemVariants}>
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>Your active subscription details</CardDescription>
                </div>
                <Badge variant="outline" className={getStatusColor(activeSubscription.status)}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(activeSubscription.status)}
                    Active
                  </span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Plan Info */}
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${planDetails[activeSubscription.plan].color} flex items-center justify-center`}>
                  {(() => {
                    const Icon = planDetails[activeSubscription.plan].icon;
                    return <Icon className="h-8 w-8 text-white" />;
                  })()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold capitalize">{planDetails[activeSubscription.plan].name} Plan</h3>
                  <p className="text-muted-foreground">
                    {planDetails[activeSubscription.plan].description}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-2xl font-bold">
                      ${activeSubscription.price}
                      <span className="text-sm font-normal text-muted-foreground">/{activeSubscription.currency}</span>
                    </span>
                    <span className="text-sm text-muted-foreground">per month</span>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subscription Period</span>
                  <span className="font-medium">{getDaysRemaining(activeSubscription.endDate)} days remaining</span>
                </div>
                <Progress 
                  value={calculateProgress(activeSubscription.startDate, activeSubscription.endDate)} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{new Date(activeSubscription.startDate).toLocaleDateString()}</span>
                  <span>{new Date(activeSubscription.endDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="font-medium mb-3">Plan Features</h4>
                <div className="grid sm:grid-cols-2 gap-2">
                  {activeSubscription.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <Switch 
                    checked={activeSubscription.autoRenew} 
                    id="auto-renew"
                  />
                  <label htmlFor="auto-renew" className="text-sm cursor-pointer">
                    Auto-renew subscription
                  </label>
                </div>
                <div className="flex-1" />
                <Button variant="outline">Upgrade Plan</Button>
                <Button variant="destructive" size="sm">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* All Subscriptions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Subscription History</CardTitle>
            <CardDescription>All your past and current subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptions.length > 0 ? (
              <div className="space-y-4">
                {subscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${planDetails[subscription.plan].color} flex items-center justify-center`}>
                        {(() => {
                          const Icon = planDetails[subscription.plan].icon;
                          return <Icon className="h-5 w-5 text-white" />;
                        })()}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{subscription.plan} Plan</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(subscription.startDate).toLocaleDateString()} - {new Date(subscription.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={getStatusColor(subscription.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(subscription.status)}
                          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                        </span>
                      </Badge>
                      <p className="text-sm font-medium mt-1">
                        ${subscription.price}/{subscription.currency}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No subscriptions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Subscribe to a plan to unlock premium features
                </p>
                <Button asChild>
                  <Link to="/pricing">View Plans</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Available Plans */}
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-bold mb-4">Available Plans</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(planDetails).map(([plan, details]) => (
            <Card 
              key={plan} 
              className={`relative overflow-hidden ${activeSubscription?.plan === plan ? 'border-primary' : ''}`}
            >
              {activeSubscription?.plan === plan && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-bl-lg">
                  Current
                </div>
              )}
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${details.color} flex items-center justify-center mb-3`}>
                  <details.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="capitalize">{details.name}</CardTitle>
                <CardDescription>{details.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {details.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
