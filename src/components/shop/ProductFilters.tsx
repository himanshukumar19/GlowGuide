import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FilterState, SortOption } from '@/types/product';
import { getAllBrands, categoryLabels } from '@/data/products';
import { X, SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface ProductFiltersProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  sortOption: SortOption;
  setSortOption: (sort: SortOption) => void;
  productCount: number;
}

const skinTypes = ['oily', 'dry', 'combination', 'sensitive', 'normal'];
const categories = Object.entries(categoryLabels);
const brands = getAllBrands();

const ProductFilters = ({ filters, setFilters, sortOption, setSortOption, productCount }: ProductFiltersProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'category' | 'skinTypes' | 'brands', value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  const clearFilters = () => {
    setFilters({
      category: [],
      priceRange: [0, 30000],
      skinTypes: [],
      brands: [],
      rating: 0,
      discount: 0,
      inStock: false
    });
  };

  const hasActiveFilters = 
    filters.category.length > 0 ||
    filters.skinTypes.length > 0 ||
    filters.brands.length > 0 ||
    filters.rating > 0 ||
    filters.discount > 0 ||
    filters.inStock ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 30000;

  const FilterContent = () => (
    <div className="space-y-4">
      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full gap-2">
          <X className="h-4 w-4" />
          Clear All Filters
        </Button>
      )}

      <Accordion type="multiple" defaultValue={['category', 'price', 'skin-type']} className="w-full">
        {/* Category Filter */}
        <AccordionItem value="category">
          <AccordionTrigger className="text-sm font-medium">Category</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories.map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.category.includes(key)}
                    onCheckedChange={() => toggleArrayFilter('category', key)}
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-medium">Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 px-1">
              <Slider
                value={filters.priceRange}
                min={0}
                max={30000}
                step={100}
                onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>₹{filters.priceRange[0].toLocaleString()}</span>
                <span>₹{filters.priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Skin Type */}
        <AccordionItem value="skin-type">
          <AccordionTrigger className="text-sm font-medium">Skin Type</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {skinTypes.map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.skinTypes.includes(type)}
                    onCheckedChange={() => toggleArrayFilter('skinTypes', type)}
                  />
                  <span className="text-sm capitalize">{type}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brand */}
        <AccordionItem value="brand">
          <AccordionTrigger className="text-sm font-medium">Brand</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {brands.map((brand) => (
                <label key={brand} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.brands.includes(brand)}
                    onCheckedChange={() => toggleArrayFilter('brands', brand)}
                  />
                  <span className="text-sm">{brand}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Rating */}
        <AccordionItem value="rating">
          <AccordionTrigger className="text-sm font-medium">Minimum Rating</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {[4, 3, 2].map((rating) => (
                <label key={rating} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.rating === rating}
                    onCheckedChange={(checked) => updateFilter('rating', checked ? rating : 0)}
                  />
                  <span className="text-sm">{rating}+ Stars</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Discount */}
        <AccordionItem value="discount">
          <AccordionTrigger className="text-sm font-medium">Discount</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {[30, 20, 10].map((discount) => (
                <label key={discount} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.discount === discount}
                    onCheckedChange={(checked) => updateFilter('discount', checked ? discount : 0)}
                  />
                  <span className="text-sm">{discount}%+ Off</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* In Stock */}
        <AccordionItem value="stock">
          <AccordionTrigger className="text-sm font-medium">Availability</AccordionTrigger>
          <AccordionContent>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.inStock}
                onCheckedChange={(checked) => updateFilter('inStock', !!checked)}
              />
              <span className="text-sm">In Stock Only</span>
            </label>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-20 bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Filters</h3>
            <span className="text-sm text-muted-foreground">{productCount} products</span>
          </div>
          <FilterContent />
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5">
                  {filters.category.length + filters.skinTypes.length + filters.brands.length}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default ProductFilters;
