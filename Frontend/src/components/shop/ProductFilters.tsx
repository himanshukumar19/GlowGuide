import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { FilterState, SortOption } from '@/types/product';
import { getAllBrands, categoryLabels } from '@/data/products';
import {
  X,
  SlidersHorizontal,
  Star,
  Tag,
  ChevronDown,
  ChevronUp,
  Package,
  RotateCcw,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface ProductFiltersProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  sortOption: SortOption;
  setSortOption: (sort: SortOption) => void;
  productCount: number;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}

const SKIN_TYPES = [
  { value: 'oily',        label: 'Oily',        emoji: '💧' },
  { value: 'dry',         label: 'Dry',         emoji: '🌿' },
  { value: 'combination', label: 'Combination', emoji: '☯️' },
  { value: 'sensitive',   label: 'Sensitive',   emoji: '🌸' },
  { value: 'normal',      label: 'Normal',      emoji: '✨' },
];

const RATING_OPTIONS = [
  { value: 4, label: '4★ & above' },
  { value: 3, label: '3★ & above' },
  { value: 2, label: '2★ & above' },
];

const DISCOUNT_OPTIONS = [
  { value: 30, label: '30% or more' },
  { value: 20, label: '20% or more' },
  { value: 10, label: '10% or more' },
];

const PRICE_MIN = 0;
const PRICE_MAX = 30000;

const DEFAULT_FILTERS: FilterState = {
  category: [],
  priceRange: [PRICE_MIN, PRICE_MAX],
  skinTypes: [],
  brands: [],
  rating: 0,
  discount: 0,
  inStock: false,
};

const categories = Object.entries(categoryLabels);
const allBrands = getAllBrands();

// ─── Section wrapper with collapse ─────────────────────────────────────────
interface FilterSectionProps {
  title: string;
  badge?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const FilterSection = ({ title, badge, defaultOpen = true, children }: FilterSectionProps) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-3 text-sm font-semibold text-foreground hover:text-primary transition-colors"
      >
        <span className="flex items-center gap-2">
          {title}
          {badge != null && badge > 0 && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
              {badge}
            </span>
          )}
        </span>
        {open
          ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        }
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
};

// ─── Price slider with manual inputs ───────────────────────────────────────
interface PriceRangeProps {
  value: [number, number];
  onChange: (v: [number, number]) => void;
}

const PriceRange = ({ value, onChange }: PriceRangeProps) => {
  // Local string state so the user can type freely without the field jumping
  const [inputMin, setInputMin] = useState(String(value[0]));
  const [inputMax, setInputMax] = useState(String(value[1]));

  const valMin = value[0];
  const valMax = value[1];

  // KEY FIX: re-sync input text whenever parent value changes externally
  // (e.g. "Clear all", preset pill click, slider drag from another instance)
  useEffect(() => {
    setInputMin(String(valMin));
  }, [valMin]);

  useEffect(() => {
    setInputMax(String(valMax));
  }, [valMax]);

  const fmt = (n: number) => `\u20b9${n.toLocaleString('en-IN')}`;

  // Slider drag → update parent immediately; useEffect keeps inputs in sync
  const handleSlider = (v: number[]) =>
    onChange([v[0], v[1]] as [number, number]);

  // Typing in Min box → filter applies on every keystroke
  const handleMinChange = (raw: string) => {
    setInputMin(raw);
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= PRICE_MIN && n < value[1]) {
      onChange([n, value[1]]);
    }
  };

  // Typing in Max box → filter applies on every keystroke
  const handleMaxChange = (raw: string) => {
    setInputMax(raw);
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n <= PRICE_MAX && n > value[0]) {
      onChange([value[0], n]);
    }
  };

  // On blur: snap displayed text back to the true clamped value
  const snapMin = () => setInputMin(String(value[0]));
  const snapMax = () => setInputMax(String(value[1]));

  const inputCls =
    'w-full pl-5 pr-2 py-2 text-sm border border-border rounded-lg bg-background text-foreground ' +
    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors ' +
    '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

  return (
    <div className="space-y-4">

      {/* ── Slider ───────────────────────────────────────────────── */}
      <div className="px-1 pt-2">
        <Slider
          value={value}
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={100}
          minStepsBetweenThumbs={1}
          onValueChange={handleSlider}
          className="cursor-pointer [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:border-2 [&_[role=slider]]:border-primary [&_[role=slider]]:bg-white [&_[role=slider]]:shadow-md [&_[role=slider]]:transition-transform [&_[role=slider]]:hover:scale-110"
        />
        {/* Static min/max labels — no floating, no overlap */}
        <div className="flex justify-between mt-2">
          <span className="text-[11px] font-semibold text-primary">{fmt(value[0])}</span>
          <span className="text-[11px] font-semibold text-primary">{fmt(value[1])}</span>
        </div>
      </div>

      {/* ── Labelled input boxes ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] text-muted-foreground font-medium mb-1 pl-0.5">Min price</p>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground select-none pointer-events-none">{'\u20b9'}</span>
            <input
              type="number"
              inputMode="numeric"
              value={inputMin}
              onChange={e => handleMinChange(e.target.value)}
              onBlur={snapMin}
              className={inputCls}
              placeholder="0"
            />
          </div>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground font-medium mb-1 pl-0.5">Max price</p>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground select-none pointer-events-none">{'\u20b9'}</span>
            <input
              type="number"
              inputMode="numeric"
              value={inputMax}
              onChange={e => handleMaxChange(e.target.value)}
              onBlur={snapMax}
              className={inputCls}
              placeholder="30000"
            />
          </div>
        </div>
      </div>

      {/* ── Quick preset pills ────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5">
        {([
          { label: 'Under \u20b9500',  range: [PRICE_MIN, 500] as [number, number] },
          { label: '\u20b9500\u20131k',   range: [500, 1000] as [number, number] },
          { label: '\u20b91k\u20135k',    range: [1000, 5000] as [number, number] },
          { label: 'Above \u20b95k',  range: [5000, PRICE_MAX] as [number, number] },
        ] as const).map(p => {
          const active = value[0] === p.range[0] && value[1] === p.range[1];
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onChange([...p.range] as [number, number])}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                active
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-primary'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

    </div>
  );
};



// ─── Main Filter Panel content ──────────────────────────────────────────────
const FilterContent = ({
  filters,
  setFilters,
  hasActiveFilters,
  clearFilters,
  activeCount,
}: {
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
  activeCount: number;
}) => {
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    setFilters({ ...filters, [key]: value });

  const toggleArr = (key: 'category' | 'skinTypes' | 'brands', value: string) => {
    const current = filters[key];
    updateFilter(
      key,
      current.includes(value) ? current.filter(v => v !== value) : [...current, value]
    );
  };

  return (
    <div className="space-y-0">
      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5 pb-3 border-b border-border mb-1">
          {filters.category.map(c => (
            <Badge
              key={c}
              variant="secondary"
              className="gap-1 pl-2 pr-1 py-0.5 text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => toggleArr('category', c)}
            >
              {categoryLabels[c as keyof typeof categoryLabels] ?? c}
              <X className="h-2.5 w-2.5" />
            </Badge>
          ))}
          {filters.skinTypes.map(st => (
            <Badge
              key={st}
              variant="secondary"
              className="gap-1 pl-2 pr-1 py-0.5 text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors capitalize"
              onClick={() => toggleArr('skinTypes', st)}
            >
              {st}
              <X className="h-2.5 w-2.5" />
            </Badge>
          ))}
          {filters.brands.map(b => (
            <Badge
              key={b}
              variant="secondary"
              className="gap-1 pl-2 pr-1 py-0.5 text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => toggleArr('brands', b)}
            >
              {b}
              <X className="h-2.5 w-2.5" />
            </Badge>
          ))}
          {filters.rating > 0 && (
            <Badge
              variant="secondary"
              className="gap-1 pl-2 pr-1 py-0.5 text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => updateFilter('rating', 0)}
            >
              {filters.rating}★+
              <X className="h-2.5 w-2.5" />
            </Badge>
          )}
          {filters.discount > 0 && (
            <Badge
              variant="secondary"
              className="gap-1 pl-2 pr-1 py-0.5 text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => updateFilter('discount', 0)}
            >
              {filters.discount}%+ off
              <X className="h-2.5 w-2.5" />
            </Badge>
          )}
          {filters.inStock && (
            <Badge
              variant="secondary"
              className="gap-1 pl-2 pr-1 py-0.5 text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => updateFilter('inStock', false)}
            >
              In Stock
              <X className="h-2.5 w-2.5" />
            </Badge>
          )}
          <button
            type="button"
            onClick={clearFilters}
            className="text-[11px] text-muted-foreground hover:text-destructive transition-colors underline underline-offset-2 ml-0.5"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Category */}
      <FilterSection title="Category" badge={filters.category.length}>
        <div className="grid grid-cols-1 gap-1">
          {categories.map(([key, label]) => {
            const active = filters.category.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleArr('category', key)}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-all text-left ${
                  active
                    ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                    : 'hover:bg-muted text-foreground border border-transparent'
                }`}
              >
                <span>{label}</span>
                {active && (
                  <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <X className="h-2.5 w-2.5 text-primary-foreground" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection
        title="Price Range"
        badge={
          filters.priceRange[0] > PRICE_MIN || filters.priceRange[1] < PRICE_MAX ? 1 : 0
        }
      >
        <PriceRange
          value={filters.priceRange}
          onChange={v => updateFilter('priceRange', v)}
        />
      </FilterSection>

      {/* Skin Type */}
      <FilterSection title="Skin Type" badge={filters.skinTypes.length}>
        <div className="flex flex-wrap gap-2">
          {SKIN_TYPES.map(({ value, label, emoji }) => {
            const active = filters.skinTypes.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleArr('skinTypes', value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  active
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background text-foreground border-border hover:border-primary hover:text-primary'
                }`}
              >
                <span>{emoji}</span>
                {label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Brands */}
      <FilterSection title="Brand" badge={filters.brands.length} defaultOpen={false}>
        <div className="space-y-0.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
          {allBrands.map(brand => {
            const active = filters.brands.includes(brand);
            return (
              <button
                key={brand}
                type="button"
                onClick={() => toggleArr('brands', brand)}
                className={`flex items-center justify-between w-full px-3 py-1.5 rounded-lg text-sm transition-all text-left ${
                  active
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                <span>{brand}</span>
                {active && (
                  <div className="w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <X className="h-2 w-2 text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Minimum Rating" badge={filters.rating > 0 ? 1 : 0}>
        <div className="space-y-1.5">
          {RATING_OPTIONS.map(({ value, label }) => {
            const active = filters.rating === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => updateFilter('rating', active ? 0 : value)}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-all text-left ${
                  active
                    ? 'bg-warning/10 text-warning-foreground font-medium border border-warning/30'
                    : 'hover:bg-muted border border-transparent'
                }`}
              >
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < value ? 'fill-warning text-warning' : 'text-muted-foreground'}`}
                    />
                  ))}
                </div>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Discount */}
      <FilterSection title="Discount" badge={filters.discount > 0 ? 1 : 0}>
        <div className="space-y-1.5">
          {DISCOUNT_OPTIONS.map(({ value, label }) => {
            const active = filters.discount === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => updateFilter('discount', active ? 0 : value)}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-all text-left ${
                  active
                    ? 'bg-secondary/10 text-secondary font-medium border border-secondary/20'
                    : 'hover:bg-muted border border-transparent'
                }`}
              >
                <Tag className={`h-3.5 w-3.5 ${active ? 'text-secondary' : 'text-muted-foreground'}`} />
                {label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability">
        <button
          type="button"
          onClick={() => updateFilter('inStock', !filters.inStock)}
          className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-all text-left border ${
            filters.inStock
              ? 'bg-success/10 text-success font-medium border-success/20'
              : 'hover:bg-muted border-transparent'
          }`}
        >
          <Package className={`h-3.5 w-3.5 ${filters.inStock ? 'text-success' : 'text-muted-foreground'}`} />
          In Stock Only
          {filters.inStock && (
            <span className="ml-auto">
              <X className="h-3 w-3 text-success" />
            </span>
          )}
        </button>
      </FilterSection>
    </div>
  );
};

// ─── Main exported component ────────────────────────────────────────────────
const ProductFilters = ({
  filters,
  setFilters,
  sortOption,
  setSortOption,
  productCount,
  mobileOnly = false,
  desktopOnly = false,
}: ProductFiltersProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  const hasActiveFilters =
    filters.category.length > 0 ||
    filters.skinTypes.length > 0 ||
    filters.brands.length > 0 ||
    filters.rating > 0 ||
    filters.discount > 0 ||
    filters.inStock ||
    filters.priceRange[0] > PRICE_MIN ||
    filters.priceRange[1] < PRICE_MAX;

  const activeCount =
    filters.category.length +
    filters.skinTypes.length +
    filters.brands.length +
    (filters.rating > 0 ? 1 : 0) +
    (filters.discount > 0 ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.priceRange[0] > PRICE_MIN || filters.priceRange[1] < PRICE_MAX ? 1 : 0);

  const sharedProps = { filters, setFilters, hasActiveFilters, clearFilters, activeCount };

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────── */}
      {!mobileOnly && (
        <div className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-20 bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border bg-muted/40">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">Filters</h3>
                {activeCount > 0 && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                    {activeCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{productCount} items</span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    title="Reset all filters"
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter body */}
            <div className="px-4 py-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
              <FilterContent {...sharedProps} />
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile bottom sheet ─────────────────────────────────── */}
      {!desktopOnly && (
        <div className="lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`gap-2 transition-all ${hasActiveFilters ? 'border-primary text-primary bg-primary/5' : ''}`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeCount > 0 && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                    {activeCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(360px,90vw)] p-0 flex flex-col">
              <SheetHeader className="px-5 py-4 border-b border-border bg-muted/40 flex-shrink-0">
                <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  Filters
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    {productCount} products
                  </span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-5 py-2">
                <FilterContent {...sharedProps} />
              </div>
              {/* Mobile footer */}
              <div className="flex gap-2 px-5 py-4 border-t border-border flex-shrink-0 bg-background">
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="gap-1.5 flex-1"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1"
                >
                  Show {productCount} Results
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </>
  );
};

export default ProductFilters;
