'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SortOption } from '@/types/product';
import { ArrowUpDown } from 'lucide-react';

interface ProductSortProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'bestseller', label: 'Bestsellers' },
  { value: 'newest', label: 'Newest first' },
  { value: 'price-low', label: 'Price: Low to high' },
  { value: 'price-high', label: 'Price: High to low' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'discount', label: 'Biggest discount' }
];

const ProductSort = ({ value, onChange }: ProductSortProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground hidden sm:inline font-medium">Sort</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[170px] h-9 text-xs border-border/60 bg-card">
          <ArrowUpDown className="h-3 w-3 text-muted-foreground mr-1.5" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-xs">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProductSort;
