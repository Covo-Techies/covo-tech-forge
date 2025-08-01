import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";
import { 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw 
} from "lucide-react";

interface PaymentStats {
  totalTransactions: number;
  totalRevenue: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  stripe_session_id?: string;
}

export default function Payments() {
  const { toast } = useToast();
  const [stats, setStats] = useState<PaymentStats>({
    totalTransactions: 0,
    totalRevenue: 0,
    successfulPayments: 0,
    pendingPayments: 0,
    failedPayments: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPaymentData = async () => {
    setLoading(true);
    try {
      // Fetch all orders for payment statistics
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (orders) {
        const totalTransactions = orders.length;
        const totalRevenue = orders
          .filter(order => order.status === 'completed')
          .reduce((sum, order) => sum + Number(order.total_amount), 0);
        const successfulPayments = orders.filter(order => order.status === 'completed').length;
        const pendingPayments = orders.filter(order => order.status === 'pending').length;
        const failedPayments = orders.filter(order => order.status === 'failed').length;

        setStats({
          totalTransactions,
          totalRevenue,
          successfulPayments,
          pendingPayments,
          failedPayments
        });

        // Set recent transactions (last 10)
        setRecentTransactions(orders.slice(0, 10));
      }
    } catch (error: any) {
      console.error('Error fetching payment data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payment data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
          <p className="text-muted-foreground">
            Monitor Paystack transactions and payment analytics
          </p>
        </div>
        <Button onClick={fetchPaymentData} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Payment Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">All payment attempts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">From completed payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Payments</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successfulPayments}</div>
            <p className="text-xs text-muted-foreground">Completed transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">Awaiting completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Paystack Configuration */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Paystack Configuration
            </CardTitle>
            <CardDescription>Your Paystack payment gateway settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Status</span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Payment Methods</span>
                <span className="text-sm text-muted-foreground">Cards, Bank Transfer, M-Pesa</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Currency</span>
                <span className="text-sm text-muted-foreground">KES</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Payment Success Rate
            </CardTitle>
            <CardDescription>Payment conversion analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Success Rate</span>
                <span className="text-2xl font-bold text-green-600">
                  {stats.totalTransactions > 0 
                    ? Math.round((stats.successfulPayments / stats.totalTransactions) * 100)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ 
                    width: `${stats.totalTransactions > 0 
                      ? (stats.successfulPayments / stats.totalTransactions) * 100
                      : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest payment activities</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading transactions...</div>
          ) : recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(transaction.status)}
                    <div>
                      <p className="font-medium">Order #{transaction.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()} at{' '}
                        {new Date(transaction.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(Number(transaction.total_amount))}</p>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}