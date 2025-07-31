import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Checkout() {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  
  // Debug logging
  console.log('Checkout component - items:', items);
  console.log('Checkout component - user:', user);
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    county: '',
    postalCode: ''
  });

  if (user === undefined) {
  return <div>Loading...</div>; // or use a spinner/loading screen
}

if (user === null) {
  navigate('/auth');
  return null;
}

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (field: string, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'county'];
    return required.every(field => shippingAddress[field].trim() !== '');
  };

  const handleCheckout = async () => {
    if (!validateForm()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Starting checkout with shipping address:', shippingAddress);
      console.log('Cart items:', items);
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { shippingAddress }
      });

      console.log('Payment response:', { data, error });

      if (error) {
        console.error('Payment error:', error);
        throw error;
      }

      if (data?.url) {
        console.log('Redirecting to payment URL:', data.url);
        // Don't clear cart here - it will be cleared after successful payment
        window.location.href = data.url;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Information */}
          <div className="lg:col-span-2 space-y-6">
          <Card className="hover-lift">
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={shippingAddress.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={shippingAddress.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={shippingAddress.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your address"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="county">County *</Label>
                    <Input
                      id="county"
                      value={shippingAddress.county}
                      onChange={(e) => handleInputChange('county', e.target.value)}
                      placeholder="County"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      placeholder="Postal Code"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paystack" id="paystack" />
                    <Label htmlFor="paystack">Paystack (Card, M-Pesa, Bank Transfer)</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items && items.length > 0 ? items.map((item) => (
                  <div key={item.product?.id || item.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium">{item.product?.name || 'Unknown Product'}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity || 0}</p>
                    </div>
                    <p className="font-medium">KSH {((item.product?.price || 0) * (item.quantity || 0)).toFixed(2)}</p>
                  </div>
                )) : (
                  <div>No items in cart</div>
                )}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>KSH {getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>KSH 0.00</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>KSH {getTotalPrice().toFixed(2)}</span>
                </div>
                
                <Button 
                  onClick={handleCheckout} 
                  disabled={loading || !validateForm()}
                  className="w-full hover-scale"
                >
                  {loading ? 'Processing...' : 'Complete Order'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}