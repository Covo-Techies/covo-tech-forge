import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit } from 'lucide-react';

interface Variant {
  id: string;
  size: string | null;
  color: string | null;
  sku: string | null;
  price_adjustment: number;
  stock_quantity: number;
  active: boolean;
}

interface VariantManagementProps {
  productId: string;
  productName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function VariantManagement({ productId, productName, open, onOpenChange }: VariantManagementProps) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Variant | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({
    size: '',
    color: '',
    sku: '',
    price_adjustment: '0',
    stock_quantity: '0',
    active: true,
  });

  useEffect(() => {
    if (open) fetchVariants();
  }, [open, productId]);

  const fetchVariants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setVariants((data || []) as Variant[]);
    } catch (error) {
      console.error('Error fetching variants:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ size: '', color: '', sku: '', price_adjustment: '0', stock_quantity: '0', active: true });
    setEditing(null);
  };

  const handleEdit = (variant: Variant) => {
    setEditing(variant);
    setForm({
      size: variant.size || '',
      color: variant.color || '',
      sku: variant.sku || '',
      price_adjustment: String(variant.price_adjustment),
      stock_quantity: String(variant.stock_quantity),
      active: variant.active,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      product_id: productId,
      size: form.size || null,
      color: form.color || null,
      sku: form.sku || null,
      price_adjustment: parseFloat(form.price_adjustment) || 0,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      active: form.active,
    };

    try {
      if (editing) {
        const { error } = await supabase
          .from('product_variants')
          .update(payload)
          .eq('id', editing.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Variant updated' });
      } else {
        const { error } = await supabase
          .from('product_variants')
          .insert([payload]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Variant created' });
      }
      resetForm();
      fetchVariants();
    } catch (error: any) {
      console.error('Error saving variant:', error);
      toast({ title: 'Error', description: error.message || 'Failed to save variant', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this variant?')) return;
    try {
      const { error } = await supabase.from('product_variants').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Variant removed' });
      fetchVariants();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Variants — {productName}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[calc(85vh-100px)] space-y-6 pr-2">
          {variants.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Size</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price Adj.</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>{v.size || '—'}</TableCell>
                    <TableCell>{v.color || '—'}</TableCell>
                    <TableCell className="font-mono text-xs">{v.sku || '—'}</TableCell>
                    <TableCell>{v.price_adjustment > 0 ? `+${v.price_adjustment}` : v.price_adjustment}</TableCell>
                    <TableCell>
                      <span className={v.stock_quantity < 5 ? 'text-destructive font-medium' : ''}>
                        {v.stock_quantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={v.active ? 'default' : 'secondary'}>
                        {v.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(v)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(v.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {variants.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground text-center py-4">No variants yet. Add one below.</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-4">
            <h4 className="font-medium">{editing ? 'Edit Variant' : 'Add Variant'}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="v-size">Size</Label>
                <Input id="v-size" value={form.size} onChange={(e) => setForm(p => ({ ...p, size: e.target.value }))} placeholder="e.g. M, L, XL" />
              </div>
              <div>
                <Label htmlFor="v-color">Color</Label>
                <Input id="v-color" value={form.color} onChange={(e) => setForm(p => ({ ...p, color: e.target.value }))} placeholder="e.g. Red, Blue" />
              </div>
              <div>
                <Label htmlFor="v-sku">SKU</Label>
                <Input id="v-sku" value={form.sku} onChange={(e) => setForm(p => ({ ...p, sku: e.target.value }))} placeholder="Unique SKU" />
              </div>
              <div>
                <Label htmlFor="v-price">Price Adjustment (KSH)</Label>
                <Input id="v-price" type="number" step="0.01" value={form.price_adjustment} onChange={(e) => setForm(p => ({ ...p, price_adjustment: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="v-stock">Stock Quantity</Label>
                <Input id="v-stock" type="number" value={form.stock_quantity} onChange={(e) => setForm(p => ({ ...p, stock_quantity: e.target.value }))} />
              </div>
              <div className="flex items-end gap-2">
                <Switch id="v-active" checked={form.active} onCheckedChange={(c) => setForm(p => ({ ...p, active: c }))} />
                <Label htmlFor="v-active">Active</Label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                <Plus className="h-4 w-4 mr-1" />
                {editing ? 'Update' : 'Add'} Variant
              </Button>
              {editing && (
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              )}
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
