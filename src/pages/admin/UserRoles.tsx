import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Users, UserCheck, Loader2, Search } from "lucide-react";

type AppRole = "admin" | "staff" | "finance" | "customer";

interface UserRow {
  role_id: string | null;
  user_id: string;
  role: AppRole;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}

export default function UserRoles() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [{ data: profiles, error: pErr }, { data: roles, error: rErr }] = await Promise.all([
        supabase.from("profiles").select("user_id, first_name, last_name, phone"),
        supabase.from("user_roles").select("id, user_id, role"),
      ]);
      if (pErr) throw pErr;
      if (rErr) throw rErr;

      const rolesByUser = new Map<string, { id: string; role: AppRole }>();
      (roles ?? []).forEach((r: any) => rolesByUser.set(r.user_id, { id: r.id, role: r.role }));

      const merged: UserRow[] = (profiles ?? []).map((p: any) => {
        const r = rolesByUser.get(p.user_id);
        return {
          role_id: r?.id ?? null,
          user_id: p.user_id,
          role: (r?.role as AppRole) ?? "customer",
          first_name: p.first_name,
          last_name: p.last_name,
          phone: p.phone,
        };
      });
      merged.sort((a, b) => {
        const order: Record<AppRole, number> = { admin: 0, staff: 1, finance: 2, customer: 3 };
        return order[a.role] - order[b.role];
      });
      setUsers(merged);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error", description: e.message ?? "Failed to fetch users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const setRole = async (target: UserRow, newRole: AppRole) => {
    // Self-demotion guard
    if (target.user_id === user?.id && target.role === "admin" && newRole !== "admin") {
      toast({
        title: "Action blocked",
        description: "You can't change your own admin role. Ask another admin to do it.",
        variant: "destructive",
      });
      return;
    }
    // Last-admin guard
    const adminCount = users.filter((u) => u.role === "admin").length;
    if (target.role === "admin" && newRole !== "admin" && adminCount <= 1) {
      toast({
        title: "Action blocked",
        description: "At least one admin must remain. Promote another user first.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (newRole === "customer") {
        // Customer is the default — remove the explicit role row if any
        if (target.role_id) {
          const { error } = await supabase.from("user_roles").delete().eq("id", target.role_id);
          if (error) throw error;
        }
      } else if (target.role_id) {
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("id", target.role_id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert([{ user_id: target.user_id, role: newRole }]);
        if (error) throw error;
      }
      toast({ title: "Success", description: "Role updated" });
      fetchUsers();
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error", description: e.message ?? "Failed to update role", variant: "destructive" });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive" as const;
      case "staff":
        return "default" as const;
      case "finance":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (u.first_name ?? "").toLowerCase().includes(q) ||
      (u.last_name ?? "").toLowerCase().includes(q) ||
      (u.phone ?? "").toLowerCase().includes(q) ||
      u.user_id.toLowerCase().includes(q)
    );
  });

  const roleStats = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Roles & Permissions</h2>
        <p className="text-muted-foreground">Appoint or revoke roles for any registered user.</p>
      </div>

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
          <CardTitle>Appoint User Roles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Change Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((u) => {
                const isSelf = u.user_id === user?.id;
                return (
                  <TableRow key={u.user_id}>
                    <TableCell>
                      <div className="font-medium">
                        {u.first_name || u.last_name
                          ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim()
                          : "Unnamed user"}
                        {isSelf && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {u.phone ? `${u.phone} · ` : ""}ID: {u.user_id.slice(0, 8)}…
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(u.role)}>{u.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Select value={u.role} onValueChange={(value: AppRole) => setRole(u, value)}>
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
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Badge variant="destructive">Admin</Badge> Full Access
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
                <Badge variant="default">Staff</Badge> Limited Access
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
