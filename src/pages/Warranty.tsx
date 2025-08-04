import { useState } from 'react';
import { Shield, Search, CheckCircle, AlertTriangle, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Warranty = () => {
  const [searchSerial, setSearchSerial] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);

  const warrantyPlans = [
    {
      name: "Standard Warranty",
      duration: "1 Year",
      price: "Free",
      coverage: ["Manufacturing defects", "Hardware failures", "Software support"],
      exclusions: ["Physical damage", "Water damage", "Wear and tear"]
    },
    {
      name: "Extended Warranty",
      duration: "2 Years",
      price: "KSH 2,999",
      coverage: ["All Standard coverage", "Accidental damage (2 incidents)", "Priority support", "Free repairs"],
      exclusions: ["Intentional damage", "Theft", "Loss"]
    },
    {
      name: "Premium Care",
      duration: "3 Years",
      price: "KSH 4,999",
      coverage: ["All Extended coverage", "Unlimited incidents", "On-site support", "Annual maintenance"],
      exclusions: ["Theft", "Loss"]
    }
  ];

  const mockWarrantyData = {
    serialNumber: "SN123456789",
    productName: "MacBook Pro 16-inch",
    purchaseDate: "2024-01-15",
    warrantyExpiry: "2025-01-15",
    status: "Active",
    remainingDays: 95,
    claimsUsed: 0,
    claimsAllowed: 2
  };

  const handleSearch = () => {
    if (searchSerial.trim()) {
      // Simulate API call
      setTimeout(() => {
        setSearchResult(mockWarrantyData);
      }, 1000);
    }
  };

  const warrantyProgress = searchResult ? 
    ((365 - searchResult.remainingDays) / 365) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Warranty Center</h1>
          <p className="text-muted-foreground">
            Protect your investment with comprehensive warranty coverage
          </p>
        </div>

        <Tabs defaultValue="check" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="check">Check Warranty</TabsTrigger>
            <TabsTrigger value="plans">Warranty Plans</TabsTrigger>
            <TabsTrigger value="claims">File Claim</TabsTrigger>
          </TabsList>

          {/* Check Warranty Tab */}
          <TabsContent value="check" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Check Your Warranty Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="serial">Serial Number or Order ID</Label>
                    <Input
                      id="serial"
                      placeholder="Enter serial number (e.g., SN123456789)"
                      value={searchSerial}
                      onChange={(e) => setSearchSerial(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSearch} className="mt-6">
                    Check Status
                  </Button>
                </div>

                {searchResult && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{searchResult.productName}</span>
                        <Badge variant={searchResult.status === 'Active' ? 'default' : 'secondary'}>
                          {searchResult.status}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-muted-foreground">Serial Number</Label>
                          <p className="font-mono">{searchResult.serialNumber}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Purchase Date</Label>
                          <p>{new Date(searchResult.purchaseDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Warranty Expires</Label>
                          <p>{new Date(searchResult.warrantyExpiry).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Days Remaining</Label>
                          <p className="flex items-center gap-2">
                            {searchResult.remainingDays} days
                            {searchResult.remainingDays < 30 && (
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            )}
                          </p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm text-muted-foreground">Warranty Progress</Label>
                        <Progress value={warrantyProgress} className="mt-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {warrantyProgress.toFixed(0)}% of warranty period used
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-4 w-4 text-green-600" />
                            <span className="font-semibold">Claims Available</span>
                          </div>
                          <p>{searchResult.claimsAllowed - searchResult.claimsUsed} of {searchResult.claimsAllowed} remaining</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold">Next Service</span>
                          </div>
                          <p>Annual check-up due</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button>Extend Warranty</Button>
                        <Button variant="outline">Download Certificate</Button>
                        <Button variant="outline">File Claim</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Warranty Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {warrantyPlans.map((plan, index) => (
                <Card key={index} className={`${index === 1 ? 'ring-2 ring-primary' : ''} relative`}>
                  {index === 1 && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold text-primary">{plan.price}</div>
                    <p className="text-muted-foreground">{plan.duration} Coverage</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-green-600 mb-2">What's Covered</h4>
                      <ul className="space-y-1">
                        {plan.coverage.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2">Exclusions</h4>
                      <ul className="space-y-1">
                        {plan.exclusions.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="h-3 w-3 text-red-600" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button className="w-full" variant={index === 1 ? "default" : "outline"}>
                      {plan.price === "Free" ? "Included" : "Purchase Plan"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Warranty Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feature</TableHead>
                      <TableHead>Standard</TableHead>
                      <TableHead>Extended</TableHead>
                      <TableHead>Premium Care</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Duration</TableCell>
                      <TableCell>1 Year</TableCell>
                      <TableCell>2 Years</TableCell>
                      <TableCell>3 Years</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Hardware Support</TableCell>
                      <TableCell><CheckCircle className="h-4 w-4 text-green-600" /></TableCell>
                      <TableCell><CheckCircle className="h-4 w-4 text-green-600" /></TableCell>
                      <TableCell><CheckCircle className="h-4 w-4 text-green-600" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Accidental Damage</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>2 incidents</TableCell>
                      <TableCell>Unlimited</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>On-site Support</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell><CheckCircle className="h-4 w-4 text-green-600" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Priority Support</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell><CheckCircle className="h-4 w-4 text-green-600" /></TableCell>
                      <TableCell><CheckCircle className="h-4 w-4 text-green-600" /></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* File Claim Tab */}
          <TabsContent value="claims" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  File a Warranty Claim
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="claimSerial">Serial Number *</Label>
                    <Input id="claimSerial" placeholder="Enter device serial number" />
                  </div>
                  <div>
                    <Label htmlFor="claimEmail">Email Address *</Label>
                    <Input id="claimEmail" type="email" placeholder="Your email address" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="issueType">Issue Type *</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Select issue type</option>
                    <option>Hardware malfunction</option>
                    <option>Software problem</option>
                    <option>Accidental damage</option>
                    <option>Performance issues</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="description">Problem Description *</Label>
                  <textarea 
                    id="description"
                    className="w-full p-2 border rounded-md"
                    rows={4}
                    placeholder="Please describe the issue in detail..."
                  />
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Required Documents</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Proof of purchase (receipt/invoice)</li>
                    <li>• Photos of the damaged item (if applicable)</li>
                    <li>• Warranty certificate</li>
                  </ul>
                </div>

                <Button className="w-full">Submit Warranty Claim</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Warranty;