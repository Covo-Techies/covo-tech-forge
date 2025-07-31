import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from '@/hooks/use-toast';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  
  useEffect(() => {
    // Clear the cart after successful payment
    clearCart();
    
    // Show success message
    toast({
      title: "Payment Successful!",
      description: "Your order has been confirmed and is being processed.",
    });
  }, [clearCart]);

  const reference = searchParams.get('reference');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Thank you for your purchase. Your order has been confirmed and will be processed shortly.
              </p>
              {reference && (
                <p className="text-sm text-muted-foreground">
                  Reference: <span className="font-mono">{reference}</span>
                </p>
              )}
              <div className="space-y-2 pt-4">
                <Button 
                  onClick={() => navigate('/dashboard')} 
                  className="w-full"
                >
                  View Orders
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/products')} 
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}