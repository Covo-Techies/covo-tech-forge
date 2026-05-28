import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LiveSearchBar from '@/components/LiveSearchBar';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  Menu,
  Laptop,
  Smartphone,
  Headphones,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { supabase } from '@/integrations/supabase/client';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, signOut } = useAuth();
  const { getTotalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleAdminToggle = (checked: boolean) => {
    if (checked) {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const categories = [
    { name: 'Laptops', icon: Laptop, href: '/products?category=Laptops' },
    { name: 'Phones', icon: Smartphone, href: '/products?category=Phones' },
    { name: 'Accessories', icon: Headphones, href: '/products?category=Accessories' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-fade-in">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex h-10 items-center justify-between text-sm">
            <p>covotechnologies@gmail.com</p>
            <p className="underline">Call us: +254795997546</p>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4">
        {/* Mobile / tablet row (unchanged behavior) */}
        <div className="flex h-16 items-center justify-between md:hidden">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">C</span>
            </div>
            <span className="font-bold text-xl">COVO</span>
          </Link>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link to="/wishlist">
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">
                    {wishlistItems.length}
                  </Badge>
                )}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">
                    {getTotalItems()}
                  </Badge>
                )}
              </Link>
            </Button>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-8">
                  <LiveSearchBar
                    placeholder="Search products..."
                    onMobileClose={() => setMobileMenuOpen(false)}
                  />
                  <nav className="flex flex-col space-y-4">
                    <Link to="/" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                    {categories.map((category) => (
                      <Link
                        key={category.name}
                        to={category.href}
                        className="flex items-center space-x-2 text-lg font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <category.icon className="h-5 w-5" />
                        <span>{category.name}</span>
                      </Link>
                    ))}
                    <Link to="/about" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>About</Link>
                    <Link to="/contact" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
                    {user ? (
                      <>
                        <Link to="/dashboard" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                        <Link to="/orders" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Orders</Link>
                        <Link to="/profile" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                        <button onClick={() => { setMobileMenuOpen(false); handleSignOut(); }} className="text-lg font-medium text-left">Sign out</button>
                      </>
                    ) : (
                      <Link to="/auth" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Desktop layout: two clean rows */}
        <div className="hidden md:block">
          {/* Row 1: Logo | Search | Actions */}
          <div className="flex h-20 items-center gap-6">
            <Link to="/" className="flex items-center space-x-2 shrink-0">
              <div className="h-9 w-9 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">C</span>
              </div>
              <span className="font-bold text-xl whitespace-nowrap">COVO TECH</span>
            </Link>

            <div className="flex-1 max-w-2xl mx-auto">
              <LiveSearchBar />
            </div>

            <div className="flex items-center space-x-1 shrink-0">
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link to="/wishlist" aria-label="Wishlist">
                  <Heart className="h-5 w-5" />
                  {wishlistItems.length > 0 && (
                    <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">
                      {wishlistItems.length}
                    </Badge>
                  )}
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link to="/cart" aria-label="Cart">
                  <ShoppingCart className="h-5 w-5" />
                  {getTotalItems() > 0 && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">
                      {getTotalItems()}
                    </Badge>
                  )}
                </Link>
              </Button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Account">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isAdmin && (
                      <>
                        <div className="flex items-center justify-between px-2 py-1.5">
                          <div className="flex items-center space-x-2">
                            <Settings className="h-4 w-4" />
                            <span className="text-sm">Admin Mode</span>
                          </div>
                          <Switch
                            checked={location.pathname.startsWith('/admin')}
                            onCheckedChange={handleAdminToggle}
                          />
                        </div>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem asChild><Link to="/dashboard">Dashboard</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/orders">Orders</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/profile">Profile</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild className="ml-2">
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Row 2: Primary navigation */}
          <nav className="flex items-center justify-center gap-8 h-12 border-t">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="text-sm font-medium hover:text-primary transition-colors focus:outline-none">
                  Shop
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link to="/products">All Products</Link>
                </DropdownMenuItem>
                {categories.map((category) => (
                  <DropdownMenuItem key={category.name} asChild>
                    <Link to={`/products?category=${category.name}`} className="flex items-center space-x-2">
                      <category.icon className="h-4 w-4" />
                      <span>{category.name}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.href}
                className="text-sm font-medium hover:text-primary transition-colors hidden lg:inline"
              >
                {category.name}
              </Link>
            ))}
            <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">About</Link>
            <Link to="/contact" className="text-sm font-medium hover:text-primary transition-colors">Contact</Link>
          </nav>
        </div>
      </div>

    </header>
  );
}