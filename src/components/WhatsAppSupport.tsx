import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WhatsAppSupportProps {
  className?: string;
}

export default function WhatsAppSupport({ className }: WhatsAppSupportProps) {
  const phoneNumber = "254795997546"; // Remove + and spaces for WhatsApp URL
  const defaultMessage = "Hello! I need assistance with my order. Can you help me?";
  
  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(defaultMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className={cn("fixed bottom-6 right-6 z-50 animate-fade-in", className)}>
      {/* Help text */}
      <div className="flex items-center justify-end mb-2 group">
        <div className="bg-card text-card-foreground px-3 py-2 rounded-lg shadow-lg text-sm mr-2 opacity-90 hover:opacity-100 transition-opacity duration-200">
          Need help?
        </div>
        <Button
          onClick={handleWhatsAppClick}
          size="lg"
          className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 animate-pulse"
          aria-label="Chat with us on WhatsApp"
        >
          <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
        </Button>
      </div>
    </div>
  );
}