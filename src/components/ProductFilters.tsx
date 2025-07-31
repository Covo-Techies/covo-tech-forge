import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, X, Search, Filter } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface ProductFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedBrands: string[];
  onBrandsChange: (brands: string[]) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  selectedSpecs: Record<string, string[]>;
  onSpecsChange: (specs: Record<string, string[]>) => void;
  availableBrands: string[];
  availableSpecs: Record<string, string[]>;
  maxPrice: number;
  minPrice: number;
}

export default function ProductFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedBrands,
  onBrandsChange,
  priceRange,
  onPriceRangeChange,
  selectedSpecs,
  onSpecsChange,
  availableBrands,
  availableSpecs,
  maxPrice,
  minPrice
}: ProductFiltersProps) {
  const [openSections, setOpenSections] = useState({
    brands: true,
    price: true,
    specs: false
  });

  const categories = ['all', 'Laptops', 'Phones', 'Tablets', 'Audio', 'Wearables', 'Accessories'];

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];
    onBrandsChange(newBrands);
  };

  const handleSpecToggle = (specType: string, value: string) => {
    const currentValues = selectedSpecs[specType] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onSpecsChange({
      ...selectedSpecs,
      [specType]: newValues
    });
  };

  const clearAllFilters = () => {
    onSearchChange('');
    onCategoryChange('all');
    onBrandsChange([]);
    onPriceRangeChange([minPrice, maxPrice]);
    onSpecsChange({});
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedCategory !== 'all') count++;
    count += selectedBrands.length;
    if (priceRange[0] !== minPrice || priceRange[1] !== maxPrice) count++;
    count += Object.values(selectedSpecs).flat().length;
    return count;
  };

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Filters */}
      {getActiveFiltersCount() > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Active Filters ({getActiveFiltersCount()})</h3>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  Search: {searchTerm}
                  <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => onSearchChange('')} />
                </Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Category: {selectedCategory}
                  <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => onCategoryChange('all')} />
                </Badge>
              )}
              {selectedBrands.map(brand => (
                <Badge key={brand} variant="secondary" className="text-xs">
                  {brand}
                  <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleBrandToggle(brand)} />
                </Badge>
              ))}
              {(priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
                <Badge variant="secondary" className="text-xs">
                  Price: {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
                  <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => onPriceRangeChange([minPrice, maxPrice])} />
                </Badge>
              )}
              {Object.entries(selectedSpecs).map(([specType, values]) =>
                values.map(value => (
                  <Badge key={`${specType}-${value}`} variant="secondary" className="text-xs">
                    {specType}: {value}
                    <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleSpecToggle(specType, value)} />
                  </Badge>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Category</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <RadioGroup value={selectedCategory} onValueChange={onCategoryChange}>
            {categories.map(category => (
              <div key={category} className="flex items-center space-x-2">
                <RadioGroupItem value={category} id={category} />
                <Label htmlFor={category} className="text-sm">
                  {category === 'all' ? 'All Categories' : category}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Brand Filter */}
      {availableBrands.length > 0 && (
        <Card>
          <Collapsible open={openSections.brands} onOpenChange={() => toggleSection('brands')}>
            <CollapsibleTrigger asChild>
              <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Brand</CardTitle>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openSections.brands ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {availableBrands.map(brand => (
                    <div key={brand} className="flex items-center space-x-2">
                      <Checkbox
                        id={brand}
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={() => handleBrandToggle(brand)}
                      />
                      <Label htmlFor={brand} className="text-sm">
                        {brand}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Price Range Filter */}
      <Card>
        <Collapsible open={openSections.price} onOpenChange={() => toggleSection('price')}>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Price Range</CardTitle>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSections.price ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => onPriceRangeChange(value as [number, number])}
                    max={maxPrice}
                    min={minPrice}
                    step={1000}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{formatCurrency(priceRange[0])}</span>
                  <span>{formatCurrency(priceRange[1])}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Min Price</Label>
                    <Input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => onPriceRangeChange([Number(e.target.value), priceRange[1]])}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Max Price</Label>
                    <Input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value)])}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Specifications Filter */}
      {Object.keys(availableSpecs).length > 0 && (
        <Card>
          <Collapsible open={openSections.specs} onOpenChange={() => toggleSection('specs')}>
            <CollapsibleTrigger asChild>
              <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Specifications</CardTitle>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openSections.specs ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {Object.entries(availableSpecs).map(([specType, values], index) => (
                    <div key={specType}>
                      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {specType}
                      </Label>
                      <div className="space-y-2 mt-2">
                        {values.map(value => (
                          <div key={value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${specType}-${value}`}
                              checked={(selectedSpecs[specType] || []).includes(value)}
                              onCheckedChange={() => handleSpecToggle(specType, value)}
                            />
                            <Label htmlFor={`${specType}-${value}`} className="text-sm">
                              {value}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {index < Object.keys(availableSpecs).length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}
    </div>
  );
}