import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Headphones
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';

export default function Header() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const categories = [
    { name: 'Laptops', icon: Laptop, href: '/shop?category=laptops' },
    { name: 'Phones', icon: Smartphone, href: '/shop?category=phones' },
    { name: 'Accessories', icon: Headphones, href: '/shop?category=accessories' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-fade-in">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex h-10 items-center justify-between text-sm">
            <p>Free shipping on orders over $299</p>
            <p>Call us: (555) 123-4567</p>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">C</span>
            </div>
            <span className="font-bold text-xl">COVO Technologies</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-sm font-medium hover:text-primary transition-colors">
                Shop
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link to="/products" className="flex items-center space-x-2">
                    <span>All Products</span>
                  </Link>
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
            <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search for products..."
                className="pl-10 pr-4 w-full"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Desktop search toggle */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>

            {/* Wishlist */}
            {user && (
              <Button variant="ghost" size="icon" asChild>
                <Link to="/wishlist">
                  <Heart className="h-5 w-5" />
                </Link>
              </Button>
            )}

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs"
                  >
                    {getTotalItems()}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders">Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            )}

            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="search"
                      placeholder="Search products..."
                      className="pl-10"
                    />
                  </div>
                  
                  <nav className="flex flex-col space-y-4">
                    <Link 
                      to="/" 
                      className="text-lg font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Home
                    </Link>
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
                    <Link 
                      to="/about" 
                      className="text-lg font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      About
                    </Link>
                    <Link 
                      to="/contact" 
                      className="text-lg font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Contact
                    </Link>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}