import { useState } from 'react';
import { Search, MessageCircle, Phone, Mail, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const faqData = [
    {
      category: "Orders & Shipping",
      questions: [
        {
          question: "How can I track my order?",
          answer: "You can track your order by logging into your account and viewing the order details. You'll also receive tracking information via email once your order ships."
        },
        {
          question: "What are your shipping options?",
          answer: "We offer standard shipping (3-5 business days) and express shipping (1-2 business days). Free shipping is available on orders over KSH 5,000."
        },
        {
          question: "Can I change my shipping address?",
          answer: "You can change your shipping address within 1 hour of placing your order. After that, please contact our support team immediately."
        }
      ]
    },
    {
      category: "Returns & Refunds",
      questions: [
        {
          question: "What is your return policy?",
          answer: "We accept returns within 30 days of purchase. Items must be in original condition with all packaging. Electronics must be unopened unless defective."
        },
        {
          question: "How do I initiate a return?",
          answer: "Log into your account, go to your orders, and select 'Return Item'. Follow the instructions to print a return label and send the item back."
        },
        {
          question: "When will I receive my refund?",
          answer: "Refunds are processed within 3-5 business days after we receive your returned item. The amount will be credited to your original payment method."
        }
      ]
    },
    {
      category: "Payment & Pricing",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept M-Pesa, credit/debit cards (Visa, Mastercard), and bank transfers. All transactions are secure and encrypted."
        },
        {
          question: "Do you offer installment payments?",
          answer: "Yes, we offer installment plans for purchases over KSH 10,000. You can choose from 3, 6, or 12-month payment plans."
        },
        {
          question: "Why was my payment declined?",
          answer: "Payment declines can happen due to insufficient funds, expired cards, or security restrictions. Please contact your bank or try a different payment method."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          question: "My product isn't working properly",
          answer: "First, try restarting the device and checking all connections. If the issue persists, contact our technical support team with your order number and product details."
        },
        {
          question: "Do you provide warranty?",
          answer: "All our products come with manufacturer warranty. Electronic items typically have 1-2 years warranty. Check your product page for specific warranty information."
        },
        {
          question: "Can you help me set up my device?",
          answer: "Yes! We offer free setup assistance for all tech products. Schedule a call with our support team or visit our store for hands-on help."
        }
      ]
    }
  ];

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us for immediate assistance",
      contact: "+254 700 123 456",
      hours: "Mon-Fri 8AM-6PM"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message",
      contact: "support@covo.tech",
      hours: "24/7 Response"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team",
      contact: "Start Chat",
      hours: "Mon-Fri 8AM-8PM"
    }
  ];

  const filteredFAQs = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-lg text-muted-foreground mb-8">
            How can we help you today?
          </p>
          
          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {contactMethods.map((method, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <method.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">{method.title}</CardTitle>
                <p className="text-muted-foreground">{method.description}</p>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="w-full mb-2">
                  {method.contact}
                </Button>
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {method.hours}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          
          {searchQuery && (
            <div className="mb-4">
              <Badge variant="secondary">
                {filteredFAQs.reduce((total, category) => total + category.questions.length, 0)} results found
              </Badge>
            </div>
          )}

          <div className="space-y-6">
            {filteredFAQs.map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardHeader>
                  <CardTitle className="text-xl text-primary">
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`item-${categoryIndex}-${faqIndex}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {searchQuery && filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find any articles matching your search.
              </p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            </div>
          )}
        </div>

        {/* Still Need Help */}
        <div className="text-center mt-16 p-8 bg-muted/50 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Still need help?</h3>
          <p className="text-muted-foreground mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button>Contact Support</Button>
            <Button variant="outline">Schedule a Call</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;