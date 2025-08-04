import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Search, Mail, Phone } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface Customer {
  user_id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  order_count: number;
  total_spent: number;
  has_profile: boolean;
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchQuery]);

  const fetchCustomers = async () => {
    try {
      // First, get all auth users via RPC or by querying through admin
      // Since we can't directly query auth.users, we'll use a different approach
      // Get all profiles first
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get all users who have made orders but might not have profiles
      const { data: ordersUsers, error: ordersError } = await supabase
        .from('orders')
        .select('user_id')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Create a set of all unique user IDs
      const allUserIds = new Set([
        ...(profiles || []).map(p => p.user_id),
        ...(ordersUsers || []).map(o => o.user_id)
      ]);

      // For each user ID, get their data and order statistics
      const customersWithStats = await Promise.all(
        Array.from(allUserIds).map(async (userId) => {
          // Find profile if it exists
          const profile = profiles?.find(p => p.user_id === userId);
          
          // Get order statistics
          const { data: orders } = await supabase
            .from('orders')
            .select('total_amount')
            .eq('user_id', userId);

          const orderCount = orders?.length || 0;
          const totalSpent = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

          console.log('Processing user:', userId, 'Profile:', profile);
          return {
            user_id: userId,
            email: profile?.user_id ? `user-${profile.user_id.slice(0, 8)}@example.com` : undefined,
            first_name: profile?.first_name || null,
            last_name: profile?.last_name || null,
            phone: profile?.phone,
            avatar_url: profile?.avatar_url,
            created_at: profile?.created_at || new Date().toISOString(),
            order_count: orderCount,
            total_spent: totalSpent,
            has_profile: !!profile
          };
        })
      );

      // Sort by creation date
      customersWithStats.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setCustomers(customersWithStats);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch customers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = customers;

    if (searchQuery.trim()) {
      filtered = filtered.filter(customer => {
        const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.toLowerCase();
        return (
          fullName.includes(searchQuery.toLowerCase()) ||
          customer.phone?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    setFilteredCustomers(filtered);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-1/4" />
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Customer Management</h2>
        <p className="text-muted-foreground">Manage customer accounts and view profiles</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers by name or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Buyers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter(c => c.order_count > 0).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                customers.length > 0
                  ? formatCurrency(customers.reduce((sum, c) => sum + c.total_spent, 0) / 
                     (customers.filter(c => c.order_count > 0).length || 1), 'KSH')
                  : formatCurrency(0, 'KSH')
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customers ({filteredCustomers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={customer.avatar_url} />
                        <AvatarFallback>
                          {getInitials(customer.first_name, customer.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {customer.first_name?.trim() || customer.last_name?.trim() 
                            ? `${customer.first_name?.trim() || ''} ${customer.last_name?.trim() || ''}`.trim()
                            : 'Anonymous Customer'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ID: {customer.user_id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {customer.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {customer.order_count} orders
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(customer.total_spent, 'KSH')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={customer.order_count > 0 ? 'default' : 'secondary'}>
                      {customer.order_count > 0 ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(customer.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}