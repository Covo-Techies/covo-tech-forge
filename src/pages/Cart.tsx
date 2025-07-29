import Cart from '@/components/Cart';
import Header from '@/components/layout/Header';

export default function CartPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Cart />
      </div>
    </div>
  );
}