import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  CreditCard,
  Tag,
  Shield,
  MessageSquare,
  Settings,
  Home,
  Star,
  Image,
  MessageCircle,
  ArrowLeft
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const adminMenuItems = [
  { title: "Overview", url: "/admin", icon: Home },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Featured Products", url: "/admin/featured-products", icon: Star },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Customers", url: "/admin/customers", icon: Users },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Payments", url: "/admin/payments", icon: CreditCard },
  { title: "Promotions", url: "/admin/promotions", icon: Tag },
  { title: "User Roles", url: "/admin/roles", icon: Shield },
  { title: "Messages", url: "/admin/messages", icon: MessageSquare },
  { title: "Product Images", url: "/admin/product-images", icon: Image },
  { title: "Reviews", url: "/admin/reviews", icon: MessageCircle },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const currentPath = location.pathname;

  // Check if user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .in('role', ['admin', 'staff']);
          
          if (!error && data && data.length > 0) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error checking admin role:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminRole();
  }, [user]);

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === "/admin";
    }
    return currentPath.startsWith(path);
  };

  const getNavClass = (path: string) => {
    return isActive(path)
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
      : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground";
  };

  const handleAdminToggle = (checked: boolean) => {
    if (!checked) {
      navigate('/');
    }
  };

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-64"} collapsible="icon">
      <SidebarHeader className="p-4">
        {state !== "collapsed" && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Exit Admin</span>
            </div>
            <Switch
              checked={true}
              onCheckedChange={handleAdminToggle}
            />
          </div>
        )}
        {state === "collapsed" && (
          <div className="flex justify-center">
            <Switch
              checked={true}
              onCheckedChange={handleAdminToggle}
            />
          </div>
        )}
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className={getNavClass(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}