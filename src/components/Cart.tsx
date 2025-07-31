import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, getTotalPrice, getTotalItems } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto animate-fade-in hover-lift">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground text-center">
            Add some products to your cart to see them here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fade-in hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          Shopping Cart
          <Badge variant="secondary">{getTotalItems()} items</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg hover-lift transition-all duration-300">
            <img
              src={item.product.image_url}
              alt={item.product.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1">
              <h4 className="font-semibold">{item.product.name}</h4>
              <p className="text-sm text-muted-foreground">
                KSH {item.product.price.toFixed(2)} each
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="hover-scale"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-8 text-center">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                disabled={item.quantity >= item.product.stock_quantity}
                className="hover-scale"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                KSH {(item.product.price * item.quantity).toFixed(2)}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFromCart(item.product_id)}
                className="text-destructive hover:text-destructive hover-scale"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        
        <Separator />
        
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Total:</span>
          <span>KSH {getTotalPrice().toFixed(2)}</span>
        </div>
        
        <Button 
          className="w-full hover-scale" 
          size="lg"
          onClick={() => navigate('/checkout')}
        >
          Proceed to Checkout
        </Button>
      </CardContent>
    </Card>
  );
}