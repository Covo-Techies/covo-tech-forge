import { useState } from 'react';
import { Package, ArrowLeft, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const Returns = () => {
  const [step, setStep] = useState(1);
  const [orderNumber, setOrderNumber] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [returnType, setReturnType] = useState('');

  const returnReasons = [
    'Defective/Damaged item',
    'Wrong item received',
    'Item not as described',
    'No longer needed',
    'Arrived too late',
    'Changed mind',
    'Other'
  ];

  const returnProcess = [
    {
      step: 1,
      title: "Initiate Return",
      description: "Submit your return request with order details",
      icon: Package,
      status: step >= 1 ? 'completed' : 'pending'
    },
    {
      step: 2,
      title: "Review & Approval",
      description: "We'll review your request within 24 hours",
      icon: CheckCircle,
      status: step >= 2 ? 'completed' : 'pending'
    },
    {
      step: 3,
      title: "Return Shipping",
      description: "Print return label and ship the item back",
      icon: ArrowLeft,
      status: step >= 3 ? 'completed' : 'pending'
    },
    {
      step: 4,
      title: "Refund Processing",
      description: "Receive your refund within 3-5 business days",
      icon: Calendar,
      status: step >= 4 ? 'completed' : 'pending'
    }
  ];

  const handleSubmitReturn = () => {
    // Simulate submission
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Returns & Exchanges</h1>
          <p className="text-muted-foreground">
            Easy returns within 30 days of purchase
          </p>
        </div>

        {/* Return Process Timeline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Return Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between">
              {returnProcess.map((item, index) => (
                <div key={index} className="flex flex-col items-center text-center flex-1">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-2
                    ${item.status === 'completed' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  {index < returnProcess.length - 1 && (
                    <div className="hidden md:block w-full h-px bg-border mt-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Return Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Start Your Return</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="orderNumber">Order Number *</Label>
                    <Input
                      id="orderNumber"
                      placeholder="Enter your order number (e.g., ORD-123456)"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter the email used for the order"
                    />
                  </div>
                </div>

                <Separator />

                {/* Return Type */}
                <div>
                  <Label className="text-base font-semibold">Return Type *</Label>
                  <RadioGroup value={returnType} onValueChange={setReturnType} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="refund" id="refund" />
                      <Label htmlFor="refund">Refund - Get money back</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="exchange" id="exchange" />
                      <Label htmlFor="exchange">Exchange - Replace with same item</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="credit" id="credit" />
                      <Label htmlFor="credit">Store Credit - Use for future purchases</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Return Reason */}
                <div>
                  <Label htmlFor="reason">Reason for Return *</Label>
                  <Select value={returnReason} onValueChange={setReturnReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {returnReasons.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Additional Details */}
                <div>
                  <Label htmlFor="details">Additional Details</Label>
                  <Textarea
                    id="details"
                    placeholder="Please provide any additional information about your return..."
                    rows={4}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmitReturn}
                  className="w-full"
                  disabled={!orderNumber || !returnReason || !returnType}
                >
                  Submit Return Request
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Return Policy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Return Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">30-day return window</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Items must be unopened</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Original packaging required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Free return shipping</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Track Return Status
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  View Return History
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Contact Support
                </Button>
              </CardContent>
            </Card>

            {/* Processing Times */}
            <Card>
              <CardHeader>
                <CardTitle>Processing Times</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Review Request</span>
                  <Badge variant="secondary">24 hours</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Return Shipping</span>
                  <Badge variant="secondary">3-5 days</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Refund Processing</span>
                  <Badge variant="secondary">3-5 days</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Returns;