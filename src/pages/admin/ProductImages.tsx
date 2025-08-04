import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, Edit, Image, Eye, ArrowUp, ArrowDown, Upload, Link, Download, ImageIcon } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  specifications: any;
}

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string | null;
  storage_path: string | null;
  alt_text: string;
  view_angle: string;
  display_order: number;
  is_primary: boolean;
  file_size: number | null;
  content_type: string | null;
}

export default function ProductImages() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showSpecsDialog, setShowSpecsDialog] = useState(false);
  const [editingSpecs, setEditingSpecs] = useState<any>({});
  const [downloadingUrl, setDownloadingUrl] = useState<string>('');
  
  const [imageForm, setImageForm] = useState({
    image_url: '',
    alt_text: '',
    view_angle: 'front',
    is_primary: false
  });

  const viewAngles = [
    'front', 'back', 'side', 'top', 'bottom', 'detail', 'in-use', 'packaging', 'unboxed', 'lifestyle'
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchProductImages();
      fetchProductSpecs();
    }
  }, [selectedProduct]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, specifications')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProductImages = async () => {
    if (!selectedProduct) return;

    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', selectedProduct)
        .order('display_order');

      if (error) throw error;
      setProductImages(data || []);
    } catch (error) {
      console.error('Error fetching product images:', error);
      toast({
        title: "Error",
        description: "Failed to fetch product images",
        variant: "destructive"
      });
    }
  };

  const fetchProductSpecs = async () => {
    if (!selectedProduct) return;

    const product = products.find(p => p.id === selectedProduct);
    if (product) {
      setEditingSpecs(product.specifications || {});
    }
  };

  const getImageUrl = (image: ProductImage): string => {
    if (image.storage_path) {
      return supabase.storage.from('product-images').getPublicUrl(image.storage_path).data.publicUrl;
    }
    return image.image_url || '';
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${selectedProduct}/${fileName}`;

    console.log('Uploading file:', { fileName, filePath, fileSize: file.size });

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    console.log('File uploaded successfully to:', filePath);
    return filePath;
  };

  const downloadAndStoreImage = async (url: string): Promise<{ path: string; size: number; type: string }> => {
    setDownloadingUrl(url);
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to download image');

      const blob = await response.blob();
      const fileExt = url.split('.').pop()?.split('?')[0] || 'jpg';
      const fileName = `downloaded_${Date.now()}.${fileExt}`;
      const filePath = `${selectedProduct}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      return {
        path: filePath,
        size: blob.size,
        type: blob.type
      };
    } finally {
      setDownloadingUrl('');
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedProduct) {
      console.log('Upload validation failed:', { filesCount: files?.length, selectedProduct });
      return;
    }

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to upload images",
        variant: "destructive"
      });
      return;
    }

    console.log('Starting upload process for', files.length, 'files');
    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Error",
            description: `${file.name} is not a valid image file`,
            variant: "destructive"
          });
          continue;
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "Error",
            description: `${file.name} is too large. Maximum size is 10MB`,
            variant: "destructive"
          });
          continue;
        }

        const storagePath = await uploadFile(file);
        
        const maxOrder = productImages.length > 0 
          ? Math.max(...productImages.map(img => img.display_order))
          : -1;

        const { error } = await supabase
          .from('product_images')
          .insert({
            product_id: selectedProduct,
            image_url: null,
            storage_path: storagePath,
            alt_text: file.name.split('.')[0],
            view_angle: 'front',
            display_order: maxOrder + 1 + i,
            is_primary: false,
            file_size: file.size,
            content_type: file.type
          });

        if (error) throw error;

        setUploadProgress(((i + 1) / files.length) * 100);
      }

      toast({
        title: "Success",
        description: `${files.length} image(s) uploaded successfully`
      });

      fetchProductImages();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleAddImageUrl = async () => {
    if (!selectedProduct || !imageForm.image_url.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const maxOrder = productImages.length > 0 
        ? Math.max(...productImages.map(img => img.display_order))
        : -1;

      const { error } = await supabase
        .from('product_images')
        .insert({
          product_id: selectedProduct,
          image_url: imageForm.image_url,
          alt_text: imageForm.alt_text || '',
          view_angle: imageForm.view_angle,
          display_order: maxOrder + 1,
          is_primary: imageForm.is_primary
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Image added successfully"
      });

      setShowImageDialog(false);
      setImageForm({
        image_url: '',
        alt_text: '',
        view_angle: 'front',
        is_primary: false
      });
      
      fetchProductImages();
    } catch (error) {
      console.error('Error adding image:', error);
      toast({
        title: "Error",
        description: "Failed to add image",
        variant: "destructive"
      });
    }
  };

  const handleDownloadAndStore = async (imageId: string, url: string) => {
    try {
      const { path, size, type } = await downloadAndStoreImage(url);

      const { error } = await supabase
        .from('product_images')
        .update({
          storage_path: path,
          file_size: size,
          content_type: type
        })
        .eq('id', imageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Image downloaded and stored successfully"
      });

      fetchProductImages();
    } catch (error) {
      console.error('Error downloading and storing image:', error);
      toast({
        title: "Error",
        description: "Failed to download and store image",
        variant: "destructive"
      });
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const image = productImages.find(img => img.id === imageId);
      
      // Delete from storage if it's a stored file
      if (image?.storage_path) {
        await supabase.storage
          .from('product-images')
          .remove([image.storage_path]);
      }

      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Image deleted successfully"
      });

      fetchProductImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive"
      });
    }
  };

  const handleUpdateImageOrder = async (imageId: string, direction: 'up' | 'down') => {
    const currentImage = productImages.find(img => img.id === imageId);
    if (!currentImage) return;

    const newOrder = direction === 'up' 
      ? currentImage.display_order - 1 
      : currentImage.display_order + 1;

    if (newOrder < 0 || newOrder >= productImages.length) return;

    try {
      const swapImage = productImages.find(img => img.display_order === newOrder);
      if (!swapImage) return;

      const { error } = await supabase
        .from('product_images')
        .update({ display_order: newOrder })
        .eq('id', imageId);

      if (error) throw error;

      const { error: error2 } = await supabase
        .from('product_images')
        .update({ display_order: currentImage.display_order })
        .eq('id', swapImage.id);

      if (error2) throw error2;

      fetchProductImages();
    } catch (error) {
      console.error('Error updating image order:', error);
      toast({
        title: "Error",
        description: "Failed to update image order",
        variant: "destructive"
      });
    }
  };

  const handleUpdateSpecs = async () => {
    if (!selectedProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({ specifications: editingSpecs })
        .eq('id', selectedProduct);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Specifications updated successfully"
      });

      setShowSpecsDialog(false);
      fetchProducts();
    } catch (error) {
      console.error('Error updating specifications:', error);
      toast({
        title: "Error",
        description: "Failed to update specifications",
        variant: "destructive"
      });
    }
  };

  const addSpecField = () => {
    const newKey = `spec_${Date.now()}`;
    setEditingSpecs(prev => ({
      ...prev,
      [newKey]: ''
    }));
  };

  const removeSpecField = (key: string) => {
    setEditingSpecs(prev => {
      const newSpecs = { ...prev };
      delete newSpecs[key];
      return newSpecs;
    });
  };

  const updateSpecField = (oldKey: string, newKey: string, value: string) => {
    setEditingSpecs(prev => {
      const newSpecs = { ...prev };
      if (oldKey !== newKey) {
        delete newSpecs[oldKey];
      }
      newSpecs[newKey] = value;
      return newSpecs;
    });
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Product Images & Specifications</h1>
      </div>

      {/* Product Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Product</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="w-full md:w-96">
              <SelectValue placeholder="Choose a product to manage" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedProduct && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Images */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Product Images
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                  <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add URL
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Image from URL</DialogTitle>
                      </DialogHeader>
                      <Tabs defaultValue="url" className="w-full">
                        <TabsList className="grid w-full grid-cols-1">
                          <TabsTrigger value="url" className="flex items-center gap-2">
                            <Link className="h-4 w-4" />
                            From URL
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="url" className="space-y-4">
                          <div>
                            <Label htmlFor="image-url">Image URL *</Label>
                            <Input
                              id="image-url"
                              value={imageForm.image_url}
                              onChange={(e) => setImageForm(prev => ({ ...prev, image_url: e.target.value }))}
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="alt-text">Alt Text</Label>
                            <Input
                              id="alt-text"
                              value={imageForm.alt_text}
                              onChange={(e) => setImageForm(prev => ({ ...prev, alt_text: e.target.value }))}
                              placeholder="Descriptive text for accessibility"
                            />
                          </div>
                          
                          <div>
                            <Label>View Angle</Label>
                            <Select value={imageForm.view_angle} onValueChange={(value) => 
                              setImageForm(prev => ({ ...prev, view_angle: value }))
                            }>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {viewAngles.map((angle) => (
                                  <SelectItem key={angle} value={angle}>
                                    {angle.charAt(0).toUpperCase() + angle.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="is-primary"
                              checked={imageForm.is_primary}
                              onChange={(e) => setImageForm(prev => ({ ...prev, is_primary: e.target.checked }))}
                            />
                            <Label htmlFor="is-primary">Set as primary image</Label>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button onClick={handleAddImageUrl} className="flex-1">
                              Add Image
                            </Button>
                            <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                              Cancel
                            </Button>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />

              {/* Upload Progress */}
              {uploading && (
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading images...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}

              {/* Drag and Drop Area */}
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 mb-4 text-center hover:border-muted-foreground/50 transition-colors"
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileUpload(e.dataTransfer.files);
                }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drop images here or click to select files
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports JPEG, PNG, WebP, AVIF (max 10MB each)
                </p>
              </div>

              <div className="space-y-4">
                {productImages.length > 0 ? productImages.map((image, index) => (
                  <div key={image.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <img
                      src={getImageUrl(image)}
                      alt={image.alt_text}
                      className="w-20 h-20 object-cover rounded border"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">{image.view_angle}</Badge>
                        {image.is_primary && <Badge variant="secondary">Primary</Badge>}
                        {image.storage_path && <Badge variant="default">Stored</Badge>}
                        {image.image_url && !image.storage_path && <Badge variant="outline">URL</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {image.alt_text || 'No alt text'}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Order: {image.display_order}</span>
                        {image.file_size && <span>Size: {formatFileSize(image.file_size)}</span>}
                        {image.content_type && <span>Type: {image.content_type}</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {image.image_url && !image.storage_path && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadAndStore(image.id, image.image_url!)}
                          disabled={downloadingUrl === image.image_url}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateImageOrder(image.id, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateImageOrder(image.id, 'down')}
                        disabled={index === productImages.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(getImageUrl(image), '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteImage(image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No images added yet</p>
                    <p className="text-sm">Upload files or add images from URLs</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Specifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Product Specifications</CardTitle>
                <Dialog open={showSpecsDialog} onOpenChange={setShowSpecsDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Specs
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Product Specifications</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {Object.entries(editingSpecs).map(([key, value]) => (
                        <div key={key} className="flex gap-2">
                          <Input
                            placeholder="Specification name"
                            value={key}
                            onChange={(e) => updateSpecField(key, e.target.value, String(value))}
                            className="flex-1"
                          />
                          <Input
                            placeholder="Value"
                            value={String(value)}
                            onChange={(e) => updateSpecField(key, key, e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSpecField(key)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      
                      <Button variant="outline" onClick={addSpecField} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Specification
                      </Button>
                      
                      <div className="flex gap-2">
                        <Button onClick={handleUpdateSpecs} className="flex-1">
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setShowSpecsDialog(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {editingSpecs && Object.keys(editingSpecs).length > 0 ? 
                  Object.entries(editingSpecs).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b">
                      <span className="font-medium">{key}:</span>
                      <span className="text-muted-foreground">{String(value)}</span>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No specifications added yet</p>
                      <p className="text-sm">Add specifications to provide detailed product information</p>
                    </div>
                  )
                }
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}