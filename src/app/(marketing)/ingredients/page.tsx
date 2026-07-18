'use client';

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronDown, ChevronUp, Info, Loader2 } from "lucide-react";
import type { Ingredient } from "@/lib/schemas";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const IngredientsGlossary = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/ingredients")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => setIngredients(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const filteredIngredients = useMemo(() => {
    return ingredients.filter((ing) => {
      const matchesSearch =
        ing.name.toLowerCase().includes(search.toLowerCase()) ||
        ing.category.toLowerCase().includes(search.toLowerCase());
      const matchesLetter = selectedLetter
        ? ing.name.startsWith(selectedLetter)
        : true;
      return matchesSearch && matchesLetter;
    });
  }, [ingredients, search, selectedLetter]);

  const clearFilters = () => {
    setSearch("");
    setSelectedLetter(null);
  };

  return (
    <div className="min-h-screen py-16 gradient-hero">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3 text-foreground">
            Ingredients Glossary
          </h1>
          <p className="text-muted-foreground text-base max-w-lg mx-auto">
            Search and explore dermatologist-backed information about active skincare ingredients.
          </p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ingredient name or category (e.g. BHA)..."
            className="pl-12 pr-4 py-6 rounded-gg border-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm shadow-soft bg-card w-full"
          />
        </div>

        <div className="flex flex-wrap gap-1 justify-center mb-10 bg-muted/40 border border-border p-2.5 rounded-gg-sm">
          <button
            onClick={() => setSelectedLetter(null)}
            className={`px-3 py-1.5 rounded-gg-sm text-xs font-semibold uppercase tracking-wider transition-colors ${
              selectedLetter === null
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            All
          </button>
          {ALPHABET.map((letter) => {
            const hasIngredients = ingredients.some((ing) => ing.name.startsWith(letter));
            return (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`w-8 h-8 rounded-gg-sm text-xs font-bold transition-all ${
                  selectedLetter === letter
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : hasIngredients
                    ? "text-foreground hover:bg-muted font-black"
                    : "text-muted-foreground/30 cursor-not-allowed"
                }`}
                disabled={!hasIngredients}
              >
                {letter}
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-muted/20 border border-dashed border-border rounded-gg">
              <Info className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
              <h3 className="font-heading text-lg font-bold text-foreground mb-1">
                Failed to Load Ingredients
              </h3>
              <p className="text-muted-foreground text-sm">
                Please try again later.
              </p>
            </div>
          ) : filteredIngredients.length > 0 ? (
            filteredIngredients.map((ing, index) => {
              const isExpanded = expandedIndex === index;
              return (
                <Card
                  key={ing.id}
                  className="border border-border shadow-soft bg-card rounded-gg hover:shadow-card transition-all overflow-hidden"
                >
                  <div
                    onClick={() => toggleExpand(index)}
                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-muted/10 transition-colors select-none"
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-semibold tracking-wider text-secondary uppercase block">
                        {ing.category}
                      </span>
                      <h3 className="font-heading text-xl font-bold text-foreground">
                        {ing.name}
                      </h3>
                    </div>
                    <div className="text-muted-foreground">
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-border/50 pt-4 bg-muted/5 animate-slide-up">
                      <p className="text-sm text-foreground/80 leading-relaxed mb-5">
                        {ing.description}
                      </p>

                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold tracking-wider text-foreground uppercase flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Key Benefits
                          </h4>
                          <ul className="space-y-1">
                            {ing.benefits.map((b, i) => (
                              <li key={i} className="text-xs text-foreground/95 flex items-start gap-1">
                                <span className="text-primary font-bold">•</span>
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-xs font-bold tracking-wider text-foreground uppercase flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                            Potential Side Effects
                          </h4>
                          <ul className="space-y-1">
                            {ing.sideEffects.map((se, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                                <span className="text-destructive font-bold">•</span>
                                <span>{se}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-xs font-bold tracking-wider text-foreground uppercase flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                            Best Suited For
                          </h4>
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {ing.suitableSkinTypes.map((st) => (
                              <Badge
                                key={st}
                                variant="secondary"
                                className="text-[10px] bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors uppercase py-0.5 px-2.5 rounded-full"
                              >
                                {st}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          ) : (
            <div className="text-center py-16 bg-muted/20 border border-dashed border-border rounded-gg">
              <Info className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
              <h3 className="font-heading text-lg font-bold text-foreground mb-1">
                No Ingredients Found
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                We couldn't find anything matching your search.
              </p>
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-primary hover:underline hover:text-primary-hover uppercase tracking-wider"
              >
                Clear search filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IngredientsGlossary;
