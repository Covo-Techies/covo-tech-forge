import { CheckCircle2, Circle, Package, Truck, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderTimelineProps {
  status: string;
  createdAt: string;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  trackingNumber?: string | null;
}

interface TimelineStep {
  key: string;
  label: string;
  icon: React.ElementType;
  date?: string;
  completed: boolean;
  current: boolean;
}

export default function OrderTimeline({
  status,
  createdAt,
  shippedAt,
  deliveredAt,
  trackingNumber
}: OrderTimelineProps) {
  const getSteps = (): TimelineStep[] => {
    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(status === 'completed' ? 'delivered' : status);

    return [
      {
        key: 'pending',
        label: 'Order Placed',
        icon: Package,
        date: createdAt,
        completed: currentIndex >= 0,
        current: currentIndex === 0
      },
      {
        key: 'processing',
        label: 'Processing',
        icon: Circle,
        completed: currentIndex >= 1,
        current: currentIndex === 1
      },
      {
        key: 'shipped',
        label: 'Shipped',
        icon: Truck,
        date: shippedAt || undefined,
        completed: currentIndex >= 2,
        current: currentIndex === 2
      },
      {
        key: 'delivered',
        label: 'Delivered',
        icon: Home,
        date: deliveredAt || undefined,
        completed: currentIndex >= 3 || status === 'completed',
        current: currentIndex === 3 || status === 'completed'
      }
    ];
  };

  const steps = getSteps();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (status === 'cancelled') {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
        <p className="text-destructive font-medium">Order Cancelled</p>
        <p className="text-sm text-muted-foreground">
          This order was cancelled on {formatDate(createdAt)}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeline */}
      <div className="relative">
        {/* Progress line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
        
        {steps.map((step, index) => {
          const Icon = step.completed ? CheckCircle2 : step.icon;
          
          return (
            <div key={step.key} className="relative flex items-start gap-4 pb-6 last:pb-0">
              {/* Icon */}
              <div
                className={cn(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background",
                  step.completed
                    ? "border-primary bg-primary text-primary-foreground"
                    : step.current
                    ? "border-primary"
                    : "border-muted"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4",
                  step.completed ? "text-primary-foreground" : "text-muted-foreground"
                )} />
              </div>
              
              {/* Content */}
              <div className="flex-1 pt-1">
                <p className={cn(
                  "font-medium",
                  step.completed || step.current ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.label}
                </p>
                {step.date && (
                  <p className="text-sm text-muted-foreground">
                    {formatDate(step.date)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tracking Number */}
      {trackingNumber && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium">Tracking Number</p>
          <p className="text-lg font-mono text-primary">{trackingNumber}</p>
        </div>
      )}
    </div>
  );
}
