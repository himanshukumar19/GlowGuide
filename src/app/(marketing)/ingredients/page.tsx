'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  FlaskConical,
  Leaf,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import type { Ingredient } from "@/lib/schemas";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const safetyCopy = {
  safe: { label: "Generally well tolerated", tone: "text-primary bg-primary/10" },
  moderate: { label: "Introduce gradually", tone: "text-amber-800 bg-amber-100" },
  caution: { label: "Use with care", tone: "text-red-800 bg-red-100" },
} as const;

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [letter, setLetter] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/ingredients")
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load ingredients");
        return response.json();
      })
      .then((data: Ingredient[]) => setIngredients(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(ingredients.map((ingredient) => ingredient.category))).sort(),
    [ingredients],
  );

  const filteredIngredients = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return ingredients
      .filter((ingredient) => {
        const matchesQuery =
          !normalizedQuery ||
          [ingredient.name, ingredient.category, ingredient.description]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);
        const matchesCategory = !category || ingredient.category === category;
        const matchesLetter = !letter || ingredient.name.toUpperCase().startsWith(letter);
        return matchesQuery && matchesCategory && matchesLetter;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [category, ingredients, letter, query]);

  const activeLetters = useMemo(
    () => new Set(ingredients.map((ingredient) => ingredient.name.charAt(0).toUpperCase())),
    [ingredients],
  );

  const clearFilters = () => {
    setQuery("");
    setCategory(null);
    setLetter(null);
  };

  return (
    <div className="min-h-screen bg-[#f7f9f8] text-foreground">
      <section className="relative overflow-hidden border-b border-border bg-[#e8efeb]">
        <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full border-[34px] border-primary/10" aria-hidden="true" />
        <div className="absolute bottom-[-5rem] left-[42%] h-48 w-48 rounded-full bg-[#d4e3db]" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-14 pt-16 sm:px-8 md:grid-cols-[1.15fr_0.85fr] md:items-end md:pb-20 md:pt-24 lg:px-12">
          <div>
            <div className="mb-7 flex items-center gap-3 text-sm font-semibold text-primary">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <FlaskConical className="h-4 w-4" />
              </span>
              GlowGuide / Ingredient index
            </div>
            <h1 className="max-w-3xl font-heading text-5xl font-bold leading-[0.98] tracking-[-0.045em] md:text-7xl">
              Read the label<br />
              <span className="text-primary">with confidence.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-foreground/70 md:text-lg">
              A practical guide to the actives, hydrators, and barrier helpers behind your routine. Search by name, browse by role, and learn what belongs on your shelf.
            </p>
          </div>
          <div className="md:justify-self-end md:max-w-sm">
            <div className="border-t border-primary/30 pt-4">
              <div className="flex items-start gap-4">
                <Leaf className="mt-1 h-5 w-5 shrink-0 text-secondary" />
                <p className="text-sm leading-6 text-foreground/70">
                  Every entry is written for real routines: what it helps with, who it suits, and what to watch for when you add it.
                </p>
              </div>
              <div className="mt-8 flex items-end gap-3">
                <span className="font-heading text-5xl font-bold text-primary">{ingredients.length || "—"}</span>
                <span className="pb-1 text-sm text-muted-foreground">ingredients<br />in the index</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 md:py-14 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[13rem_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Browse by letter</p>
            <div className="flex flex-wrap gap-1.5 lg:max-w-[11rem]">
              <button
                type="button"
                onClick={() => setLetter(null)}
                className={`flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-xs font-bold transition-colors ${letter === null ? "bg-primary text-primary-foreground" : "bg-white text-foreground hover:bg-primary/10"}`}
              >
                All
              </button>
              {alphabet.map((item) => {
                const available = activeLetters.has(item);
                return (
                  <button
                    key={item}
                    type="button"
                    disabled={!available}
                    onClick={() => setLetter(item)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${letter === item ? "bg-primary text-primary-foreground" : available ? "bg-white text-foreground hover:bg-primary/10" : "cursor-not-allowed text-muted-foreground/30"}`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
            <div className="mt-10 hidden border-t border-border pt-5 lg:block">
              <p className="text-xs leading-5 text-muted-foreground">Start with one active. Add new ingredients slowly so you know what your skin actually likes.</p>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-8 border-b border-border pb-6">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search ingredients, roles, or concerns"
                  aria-label="Search ingredients"
                  className="w-full rounded-2xl border border-border bg-white py-4 pl-12 pr-12 text-base outline-none transition-shadow placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
                {query && (
                  <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                <span className="mr-1 shrink-0 text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</span>
                <button type="button" onClick={() => setCategory(null)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${category === null ? "bg-secondary text-white" : "bg-white text-muted-foreground hover:text-foreground"}`}>All roles</button>
                {categories.map((item) => (
                  <button key={item} type="button" onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${category === item ? "bg-secondary text-white" : "bg-white text-muted-foreground hover:text-foreground"}`}>
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">{filteredIngredients.length}</span> {filteredIngredients.length === 1 ? "ingredient" : "ingredients"}</p>
              {(query || category || letter) && <button type="button" onClick={clearFilters} className="text-xs font-bold text-primary underline underline-offset-4">Clear filters</button>}
            </div>

            {loading ? (
              <div className="space-y-3" aria-label="Loading ingredients">
                {[1, 2, 3, 4].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-white" />)}
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-red-700" />
                <h2 className="mt-3 font-heading text-xl font-bold">The index is taking a pause</h2>
                <p className="mt-1 text-sm text-red-900/70">We couldn&apos;t load the ingredient entries. Refresh the page to try again.</p>
              </div>
            ) : filteredIngredients.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
                <Sparkles className="mx-auto h-8 w-8 text-secondary" />
                <h2 className="mt-4 font-heading text-2xl font-bold">Nothing matches that search</h2>
                <p className="mt-2 text-sm text-muted-foreground">Try a different ingredient, role, or letter.</p>
                <button type="button" onClick={clearFilters} className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">Show all ingredients</button>
              </div>
            ) : (
              <div className="divide-y divide-border border-y border-border">
                {filteredIngredients.map((ingredient, index) => {
                  const expanded = expandedId === ingredient.id;
                  const safety = ingredient.safetyRating ? safetyCopy[ingredient.safetyRating] : null;
                  return (
                    <article key={ingredient.id} className="group">
                      <button
                        type="button"
                        aria-expanded={expanded}
                        onClick={() => setExpandedId(expanded ? null : ingredient.id)}
                        className="flex w-full items-center gap-4 py-5 text-left transition-colors hover:bg-white/70 md:gap-6 md:py-6"
                      >
                        <span className="w-8 shrink-0 font-heading text-xl font-bold text-primary/40">{String(index + 1).padStart(2, "0")}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-heading text-xl font-bold tracking-tight md:text-2xl">{ingredient.name}</span>
                          <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.12em] text-secondary">{ingredient.category}</span>
                        </span>
                        {safety && <span className={`hidden shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider sm:block ${safety.tone}`}>{safety.label}</span>}
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${expanded ? "bg-primary text-white" : "bg-white text-primary group-hover:bg-primary/10"}`}>
                          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
                        </span>
                      </button>
                      {expanded && (
                        <div className="grid gap-8 bg-white px-5 pb-7 pt-2 md:grid-cols-[1.3fr_1fr_1fr] md:px-14">
                          <div>
                            <p className="text-sm leading-6 text-foreground/75">{ingredient.description}</p>
                            {safety && <p className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold sm:hidden ${safety.tone}`}><ShieldCheck className="h-3.5 w-3.5" />{safety.label}</p>}
                          </div>
                          <div>
                            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground"><Check className="h-4 w-4 text-primary" /> What it helps with</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">{ingredient.benefits.map((benefit) => <li key={benefit} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{benefit}</li>)}</ul>
                          </div>
                          <div>
                            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground"><ShieldCheck className="h-4 w-4 text-secondary" /> Good to know</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">{ingredient.sideEffects.map((effect) => <li key={effect} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />{effect}</li>)}</ul>
                            <div className="mt-5 flex flex-wrap gap-1.5">{ingredient.suitableSkinTypes.map((type) => <span key={type} className="rounded-full bg-[#e8efeb] px-2.5 py-1 text-[10px] font-semibold text-primary">{type}</span>)}</div>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}

            <section className="mt-16 flex flex-col justify-between gap-6 rounded-3xl bg-primary px-6 py-8 text-white md:flex-row md:items-center md:px-10">
              <div>
                <h2 className="font-heading text-2xl font-bold md:text-3xl">Not sure where to start?</h2>
                <p className="mt-2 max-w-lg text-sm leading-6 text-white/75">Your Skin Analysis connects your skin&apos;s concerns to a routine that makes sense for you.</p>
              </div>
              <Link href="/analysis" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-primary transition-transform hover:-translate-y-0.5">
                Find my match <ArrowRight className="h-4 w-4" />
              </Link>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
