import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, UserCheck } from "lucide-react";

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "staff" | "finance" | "customer";
  profiles: {
    first_name: string;
    last_name: string;
  } | null;
}

export default function UserRoles() {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserRoles();
  }, []);

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role
        `)
        .order('role', { ascending: true });
      
      if (error) throw error;
      
      // Fetch profile data separately
      const userRolesWithProfiles = await Promise.all(
        (data || []).map(async (userRole) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('user_id', userRole.user_id)
            .single();
          
          return {
            ...userRole,
            profiles: profile
          };
        })
      );

      setUserRoles(userRolesWithProfiles);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      toast({ title: "Error", description: "Failed to fetch user roles", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userRoleId: string, newRole: "admin" | "staff" | "finance" | "customer") => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('id', userRoleId);

      if (error) throw error;
      toast({ title: "Success", description: "User role updated successfully" });
      fetchUserRoles();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({ title: "Error", description: "Failed to update user role", variant: "destructive" });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'staff': return 'default';
      case 'finance': return 'secondary';
      case 'customer': return 'outline';
      default: return 'outline';
    }
  };

  const roleStats = userRoles.reduce((acc, userRole) => {
    acc[userRole.role] = (acc[userRole.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Roles & Permissions</h2>
        <p className="text-muted-foreground">Manage user access levels and permissions.</p>
      </div>

      {/* Role Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.admin || 0}</div>
            <p className="text-xs text-muted-foreground">Full system access</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.staff || 0}</div>
            <p className="text-xs text-muted-foreground">Limited admin access</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.finance || 0}</div>
            <p className="text-xs text-muted-foreground">Financial operations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.customer || 0}</div>
            <p className="text-xs text-muted-foreground">Regular users</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Roles Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userRoles.map((userRole) => (
                <TableRow key={userRole.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {userRole.profiles?.first_name} {userRole.profiles?.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ID: {userRole.user_id.slice(0, 8)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(userRole.role)}>
                      {userRole.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={userRole.role} 
                      onValueChange={(value: "admin" | "staff" | "finance" | "customer") => updateUserRole(userRole.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role Permissions Info */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Badge variant="destructive">Admin</Badge>
                Full Access
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• All product management</li>
                <li>• All order management</li>
                <li>• User role management</li>
                <li>• Analytics and reports</li>
                <li>• System settings</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Badge variant="default">Staff</Badge>
                Limited Access
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• View and update orders</li>
                <li>• View customer information</li>
                <li>• Basic analytics</li>
                <li>• No role management</li>
                <li>• No system settings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}