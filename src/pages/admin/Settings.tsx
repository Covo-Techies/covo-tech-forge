import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Store, DollarSign, Truck, Mail, Globe, Loader2 } from "lucide-react";

type StoreSettings = {
  storeName: string;
  storeDescription: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  maintenanceMode: boolean;
};
type CurrencySettings = { currency: string; taxRate: number; enableTax: boolean; taxIncluded: boolean };
type ShippingSettings = {
  freeShippingThreshold: number;
  defaultShippingCost: number;
  expeditedShippingCost: number;
  internationalShipping: boolean;
};
type EmailSettings = {
  orderConfirmation: boolean;
  orderUpdates: boolean;
  promotionalEmails: boolean;
  fromEmail: string;
  fromName: string;
};
type LocalizationSettings = { language: string; timezone: string; dateFormat: string };

const DEFAULTS = {
  store: {
    storeName: "Covo Tech",
    storeDescription: "Quality tech products for everyday needs",
    storeAddress: "Nairobi, Kenya",
    storePhone: "+254 795 997546",
    storeEmail: "info@covotech.com",
    maintenanceMode: false,
  } as StoreSettings,
  currency: { currency: "KSH", taxRate: 16, enableTax: false, taxIncluded: true } as CurrencySettings,
  shipping: {
    freeShippingThreshold: 5000,
    defaultShippingCost: 300,
    expeditedShippingCost: 800,
    internationalShipping: false,
  } as ShippingSettings,
  email: {
    orderConfirmation: true,
    orderUpdates: true,
    promotionalEmails: false,
    fromEmail: "noreply@covotech.com",
    fromName: "Covo Tech",
  } as EmailSettings,
  localization: { language: "en", timezone: "Africa/Nairobi", dateFormat: "DD/MM/YYYY" } as LocalizationSettings,
};

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULTS.store);
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>(DEFAULTS.currency);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>(DEFAULTS.shipping);
  const [emailSettings, setEmailSettings] = useState<EmailSettings>(DEFAULTS.email);
  const [localizationSettings, setLocalizationSettings] = useState<LocalizationSettings>(DEFAULTS.localization);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("key, value")
        .in("key", ["store", "currency", "shipping", "email", "localization"]);
      if (error) {
        toast({ title: "Error", description: "Failed to load settings", variant: "destructive" });
      } else if (data) {
        for (const row of data) {
          const v = row.value as any;
          if (row.key === "store") setStoreSettings({ ...DEFAULTS.store, ...v });
          if (row.key === "currency") setCurrencySettings({ ...DEFAULTS.currency, ...v });
          if (row.key === "shipping") setShippingSettings({ ...DEFAULTS.shipping, ...v });
          if (row.key === "email") setEmailSettings({ ...DEFAULTS.email, ...v });
          if (row.key === "localization") setLocalizationSettings({ ...DEFAULTS.localization, ...v });
        }
      }
      setLoading(false);
    };
    load();
  }, [toast]);

  const save = async (key: string, value: Record<string, unknown>, label: string) => {
    setSavingKey(key);
    const { error } = await supabase
      .from("app_settings")
      .upsert([{ key, value: value as any, updated_by: user?.id ?? null, updated_at: new Date().toISOString() }]);
    setSavingKey(null);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: `${label} updated successfully` });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="fade-in-up">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Configure your store settings and preferences.</p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="store" className="flex items-center gap-2"><Store className="h-4 w-4" />Store</TabsTrigger>
          <TabsTrigger value="currency" className="flex items-center gap-2"><DollarSign className="h-4 w-4" />Currency</TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center gap-2"><Truck className="h-4 w-4" />Shipping</TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2"><Mail className="h-4 w-4" />Email</TabsTrigger>
          <TabsTrigger value="localization" className="flex items-center gap-2"><Globe className="h-4 w-4" />Localization</TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" />Store Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input id="storeName" value={storeSettings.storeName} onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="storeEmail">Store Email</Label>
                  <Input id="storeEmail" type="email" value={storeSettings.storeEmail} onChange={(e) => setStoreSettings({ ...storeSettings, storeEmail: e.target.value })} />
                </div>
              </div>
              <div>
                <Label htmlFor="storeDescription">Store Description</Label>
                <Textarea id="storeDescription" rows={3} value={storeSettings.storeDescription} onChange={(e) => setStoreSettings({ ...storeSettings, storeDescription: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="storeAddress">Store Address</Label>
                <Textarea id="storeAddress" rows={2} value={storeSettings.storeAddress} onChange={(e) => setStoreSettings({ ...storeSettings, storeAddress: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="storePhone">Store Phone</Label>
                <Input id="storePhone" value={storeSettings.storePhone} onChange={(e) => setStoreSettings({ ...storeSettings, storePhone: e.target.value })} />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="maintenanceMode" checked={storeSettings.maintenanceMode} onCheckedChange={(checked) => setStoreSettings({ ...storeSettings, maintenanceMode: checked })} />
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              </div>
              <Button onClick={() => save("store", storeSettings, "Store settings")} disabled={savingKey === "store"}>
                {savingKey === "store" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Store Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="currency">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" />Currency & Tax Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currencySettings.currency} onValueChange={(value) => setCurrencySettings({ ...currencySettings, currency: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KSH">KSH - Kenyan Shilling</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input id="taxRate" type="number" step="0.1" value={currencySettings.taxRate} onChange={(e) => setCurrencySettings({ ...currencySettings, taxRate: Number(e.target.value) })} />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="enableTax" checked={currencySettings.enableTax} onCheckedChange={(checked) => setCurrencySettings({ ...currencySettings, enableTax: checked })} />
                <Label htmlFor="enableTax">Enable Tax Calculation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="taxIncluded" checked={currencySettings.taxIncluded} onCheckedChange={(checked) => setCurrencySettings({ ...currencySettings, taxIncluded: checked })} />
                <Label htmlFor="taxIncluded">Tax Included in Prices</Label>
              </div>
              <Button onClick={() => save("currency", currencySettings, "Currency settings")} disabled={savingKey === "currency"}>
                {savingKey === "currency" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Currency Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" />Shipping Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="freeShippingThreshold">Free Shipping Threshold (KSH)</Label>
                  <Input id="freeShippingThreshold" type="number" step="1" value={shippingSettings.freeShippingThreshold} onChange={(e) => setShippingSettings({ ...shippingSettings, freeShippingThreshold: Number(e.target.value) })} />
                </div>
                <div>
                  <Label htmlFor="defaultShippingCost">Default Shipping Cost (KSH)</Label>
                  <Input id="defaultShippingCost" type="number" step="1" value={shippingSettings.defaultShippingCost} onChange={(e) => setShippingSettings({ ...shippingSettings, defaultShippingCost: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <Label htmlFor="expeditedShippingCost">Expedited Shipping Cost (KSH)</Label>
                <Input id="expeditedShippingCost" type="number" step="1" value={shippingSettings.expeditedShippingCost} onChange={(e) => setShippingSettings({ ...shippingSettings, expeditedShippingCost: Number(e.target.value) })} />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="internationalShipping" checked={shippingSettings.internationalShipping} onCheckedChange={(checked) => setShippingSettings({ ...shippingSettings, internationalShipping: checked })} />
                <Label htmlFor="internationalShipping">Enable International Shipping</Label>
              </div>
              <Button onClick={() => save("shipping", shippingSettings, "Shipping settings")} disabled={savingKey === "shipping"}>
                {savingKey === "shipping" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Shipping Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" />Email Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input id="fromEmail" type="email" value={emailSettings.fromEmail} onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="fromName">From Name</Label>
                  <Input id="fromName" value={emailSettings.fromName} onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })} />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch id="orderConfirmation" checked={emailSettings.orderConfirmation} onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, orderConfirmation: checked })} />
                  <Label htmlFor="orderConfirmation">Order Confirmation Emails</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="orderUpdates" checked={emailSettings.orderUpdates} onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, orderUpdates: checked })} />
                  <Label htmlFor="orderUpdates">Order Status Update Emails</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="promotionalEmails" checked={emailSettings.promotionalEmails} onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, promotionalEmails: checked })} />
                  <Label htmlFor="promotionalEmails">Promotional Emails</Label>
                </div>
              </div>
              <Button onClick={() => save("email", emailSettings, "Email settings")} disabled={savingKey === "email"}>
                {savingKey === "email" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Email Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="localization">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" />Localization Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={localizationSettings.language} onValueChange={(value) => setLocalizationSettings({ ...localizationSettings, language: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="sw">Swahili</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={localizationSettings.timezone} onValueChange={(value) => setLocalizationSettings({ ...localizationSettings, timezone: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Nairobi">Africa/Nairobi (EAT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select value={localizationSettings.dateFormat} onValueChange={(value) => setLocalizationSettings({ ...localizationSettings, dateFormat: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => save("localization", localizationSettings, "Localization settings")} disabled={savingKey === "localization"}>
                {savingKey === "localization" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Localization Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
