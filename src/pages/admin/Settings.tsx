import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Settings2, Store, DollarSign, Truck, Mail, Globe } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();

  const [storeSettings, setStoreSettings] = useState({
    storeName: 'My E-commerce Store',
    storeDescription: 'Quality products for your everyday needs',
    storeAddress: '123 Commerce St, Business City, BC 12345',
    storePhone: '+1 (555) 123-4567',
    storeEmail: 'info@mystore.com',
    maintenanceMode: false
  });

  const [currencySettings, setCurrencySettings] = useState({
    currency: 'USD',
    taxRate: 8.5,
    enableTax: true,
    taxIncluded: false
  });

  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: 50,
    defaultShippingCost: 5.99,
    expeditedShippingCost: 12.99,
    internationalShipping: false
  });

  const [emailSettings, setEmailSettings] = useState({
    orderConfirmation: true,
    orderUpdates: true,
    promotionalEmails: true,
    fromEmail: 'noreply@mystore.com',
    fromName: 'My Store'
  });

  const [localizationSettings, setLocalizationSettings] = useState({
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY'
  });

  const handleSaveStoreSettings = () => {
    toast({ title: "Success", description: "Store settings saved successfully" });
  };

  const handleSaveCurrencySettings = () => {
    toast({ title: "Success", description: "Currency settings saved successfully" });
  };

  const handleSaveShippingSettings = () => {
    toast({ title: "Success", description: "Shipping settings saved successfully" });
  };

  const handleSaveEmailSettings = () => {
    toast({ title: "Success", description: "Email settings saved successfully" });
  };

  const handleSaveLocalizationSettings = () => {
    toast({ title: "Success", description: "Localization settings saved successfully" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Configure your store settings and preferences.</p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="store" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Store
          </TabsTrigger>
          <TabsTrigger value="currency" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Currency
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Shipping
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="localization" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Localization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Store Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={storeSettings.storeName}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="storeEmail">Store Email</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    value={storeSettings.storeEmail}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeEmail: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="storeDescription">Store Description</Label>
                <Textarea
                  id="storeDescription"
                  value={storeSettings.storeDescription}
                  onChange={(e) => setStoreSettings({ ...storeSettings, storeDescription: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="storeAddress">Store Address</Label>
                <Textarea
                  id="storeAddress"
                  value={storeSettings.storeAddress}
                  onChange={(e) => setStoreSettings({ ...storeSettings, storeAddress: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="storePhone">Store Phone</Label>
                <Input
                  id="storePhone"
                  value={storeSettings.storePhone}
                  onChange={(e) => setStoreSettings({ ...storeSettings, storePhone: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenanceMode"
                  checked={storeSettings.maintenanceMode}
                  onCheckedChange={(checked) => setStoreSettings({ ...storeSettings, maintenanceMode: checked })}
                />
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              </div>
              <Button onClick={handleSaveStoreSettings}>Save Store Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="currency">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Currency & Tax Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currencySettings.currency} onValueChange={(value) => setCurrencySettings({ ...currencySettings, currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.1"
                    value={currencySettings.taxRate}
                    onChange={(e) => setCurrencySettings({ ...currencySettings, taxRate: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableTax"
                  checked={currencySettings.enableTax}
                  onCheckedChange={(checked) => setCurrencySettings({ ...currencySettings, enableTax: checked })}
                />
                <Label htmlFor="enableTax">Enable Tax Calculation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="taxIncluded"
                  checked={currencySettings.taxIncluded}
                  onCheckedChange={(checked) => setCurrencySettings({ ...currencySettings, taxIncluded: checked })}
                />
                <Label htmlFor="taxIncluded">Tax Included in Prices</Label>
              </div>
              <Button onClick={handleSaveCurrencySettings}>Save Currency Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="freeShippingThreshold">Free Shipping Threshold ($)</Label>
                  <Input
                    id="freeShippingThreshold"
                    type="number"
                    step="0.01"
                    value={shippingSettings.freeShippingThreshold}
                    onChange={(e) => setShippingSettings({ ...shippingSettings, freeShippingThreshold: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="defaultShippingCost">Default Shipping Cost ($)</Label>
                  <Input
                    id="defaultShippingCost"
                    type="number"
                    step="0.01"
                    value={shippingSettings.defaultShippingCost}
                    onChange={(e) => setShippingSettings({ ...shippingSettings, defaultShippingCost: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="expeditedShippingCost">Expedited Shipping Cost ($)</Label>
                <Input
                  id="expeditedShippingCost"
                  type="number"
                  step="0.01"
                  value={shippingSettings.expeditedShippingCost}
                  onChange={(e) => setShippingSettings({ ...shippingSettings, expeditedShippingCost: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="internationalShipping"
                  checked={shippingSettings.internationalShipping}
                  onCheckedChange={(checked) => setShippingSettings({ ...shippingSettings, internationalShipping: checked })}
                />
                <Label htmlFor="internationalShipping">Enable International Shipping</Label>
              </div>
              <Button onClick={handleSaveShippingSettings}>Save Shipping Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="orderConfirmation"
                    checked={emailSettings.orderConfirmation}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, orderConfirmation: checked })}
                  />
                  <Label htmlFor="orderConfirmation">Order Confirmation Emails</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="orderUpdates"
                    checked={emailSettings.orderUpdates}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, orderUpdates: checked })}
                  />
                  <Label htmlFor="orderUpdates">Order Status Update Emails</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="promotionalEmails"
                    checked={emailSettings.promotionalEmails}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, promotionalEmails: checked })}
                  />
                  <Label htmlFor="promotionalEmails">Promotional Emails</Label>
                </div>
              </div>
              <Button onClick={handleSaveEmailSettings}>Save Email Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="localization">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Localization Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={localizationSettings.language} onValueChange={(value) => setLocalizationSettings({ ...localizationSettings, language: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={localizationSettings.timezone} onValueChange={(value) => setLocalizationSettings({ ...localizationSettings, timezone: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time</SelectItem>
                      <SelectItem value="PST">Pacific Time</SelectItem>
                      <SelectItem value="CST">Central Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select value={localizationSettings.dateFormat} onValueChange={(value) => setLocalizationSettings({ ...localizationSettings, dateFormat: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveLocalizationSettings}>Save Localization Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}