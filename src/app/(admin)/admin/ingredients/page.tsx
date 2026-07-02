'use client';

import { useState, useReducer } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Ingredient {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  sideEffects: string[];
  suitableSkinTypes: string[];
  category: string;
}

type Action =
  | { type: "ADD"; ingredient: Ingredient }
  | { type: "UPDATE"; ingredient: Ingredient }
  | { type: "DELETE"; id: string };

const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    id: "1",
    name: "Centella Asiatica (Cica)",
    description: "A botanical herb known for its exceptional wound healing and anti-inflammatory properties.",
    benefits: ["Calms redness and inflammation", "Repairs skin barrier", "Stimulates collagen synthesis"],
    sideEffects: ["Extremely rare contact dermatitis"],
    suitableSkinTypes: ["Sensitive", "Dry", "Combination", "Normal"],
    category: "Soothing Agent",
  },
  {
    id: "2",
    name: "Ceramides",
    description: "Lipids that make up over 50% of the skin barrier, essential for moisture retention.",
    benefits: ["Restores skin moisture barrier", "Prevents transepidermal water loss", "Smoothes skin texture"],
    sideEffects: ["None reported"],
    suitableSkinTypes: ["Dry", "Sensitive", "Normal", "Combination", "Oily"],
    category: "Barrier Restorer",
  },
  {
    id: "3",
    name: "Glycolic Acid",
    description: "The smallest alpha hydroxy acid molecule that penetrates deeply to dissolve dead skin cells.",
    benefits: ["Brightens dull skin tone", "Fades hyperpigmentation", "Smooths fine lines"],
    sideEffects: ["Mild stinging", "Increased sun sensitivity", "Redness if overused"],
    suitableSkinTypes: ["Normal", "Dry", "Combination"],
    category: "Chemical Exfoliant (AHA)",
  },
  {
    id: "4",
    name: "Hyaluronic Acid",
    description: "A powerful moisture-binding ingredient capable of holding up to 1000 times its weight in water.",
    benefits: ["Intense surface hydration", "Reduces dehydration lines", "Plumps skin surface"],
    sideEffects: ["Can dry out skin if applied in dry climates without a locking moisturizer"],
    suitableSkinTypes: ["Dry", "Normal", "Combination", "Oily", "Sensitive"],
    category: "Humectant",
  },
  {
    id: "5",
    name: "Niacinamide (Vitamin B3)",
    description: "A water-soluble vitamin that works to refine pores, even skin tone, and strengthen the barrier.",
    benefits: ["Regulates excess sebum", "Reduces hyperpigmentation", "Minimizes visible pores"],
    sideEffects: ["Mild flushing at high concentrations (>10%)"],
    suitableSkinTypes: ["Oily", "Combination", "Normal", "Dry", "Sensitive"],
    category: "Multitasker",
  },
  {
    id: "6",
    name: "Retinol (Vitamin A)",
    description: "A gold-standard active that speeds up skin cell renewal and boosts collagen production.",
    benefits: ["Speeds up cell turnover", "Fades wrinkles", "Clears congested pores"],
    sideEffects: ["Dryness and flaking", "Sun sensitivity", "Redness and irritation"],
    suitableSkinTypes: ["Normal", "Dry", "Combination", "Oily"],
    category: "Anti-Aging Active",
  },
  {
    id: "7",
    name: "Salicylic Acid (BHA)",
    description: "An oil-soluble exfoliant that penetrates deep into pores to dissolve sebum and debris.",
    benefits: ["Clears deep clogged pores", "Exfoliates interior pore walls", "Reduces acne breakouts"],
    sideEffects: ["Mild dryness", "Slight irritation on compromised skin"],
    suitableSkinTypes: ["Oily", "Combination"],
    category: "Acne Treatment",
  },
  {
    id: "8",
    name: "Vitamin C (L-Ascorbic Acid)",
    description: "A potent antioxidant that neutralizes free radicals and brightens skin tone.",
    benefits: ["Neutralizes free radical damage", "Fades sun spots", "Enhances natural radiance"],
    sideEffects: ["Tingling sensation", "Can oxidize easily if exposed to light"],
    suitableSkinTypes: ["Normal", "Dry", "Combination", "Oily"],
    category: "Antioxidant",
  },
];

function reducer(state: Ingredient[], action: Action): Ingredient[] {
  switch (action.type) {
    case "ADD":
      return [...state, action.ingredient];
    case "UPDATE":
      return state.map((i) => (i.id === action.ingredient.id ? action.ingredient : i));
    case "DELETE":
      return state.filter((i) => i.id !== action.id);
    default:
      return state;
  }
}

const emptyForm: Ingredient = {
  id: "",
  name: "",
  description: "",
  benefits: [],
  sideEffects: [],
  suitableSkinTypes: [],
  category: "",
};

const AdminIngredients = () => {
  const [ingredients, dispatch] = useReducer(reducer, INITIAL_INGREDIENTS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Ingredient>(emptyForm);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, id: String(Date.now()) });
    setDialogOpen(true);
  };

  const openEdit = (ingredient: Ingredient) => {
    setEditingId(ingredient.id);
    setForm({ ...ingredient });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.category.trim()) {
      toast({ title: "Validation Error", description: "Name and category are required.", variant: "destructive" });
      return;
    }
    const benefits = typeof form.benefits === "string"
      ? (form.benefits as unknown as string).split(",").map((s) => s.trim()).filter(Boolean)
      : form.benefits;
    const sideEffects = typeof form.sideEffects === "string"
      ? (form.sideEffects as unknown as string).split(",").map((s) => s.trim()).filter(Boolean)
      : form.sideEffects;
    const suitableSkinTypes = typeof form.suitableSkinTypes === "string"
      ? (form.suitableSkinTypes as unknown as string).split(",").map((s) => s.trim()).filter(Boolean)
      : form.suitableSkinTypes;

    const payload = { ...form, benefits, sideEffects, suitableSkinTypes };

    if (editingId) {
      dispatch({ type: "UPDATE", ingredient: payload });
      toast({ title: "Ingredient Updated", description: `${payload.name} has been updated.` });
    } else {
      dispatch({ type: "ADD", ingredient: payload });
      toast({ title: "Ingredient Added", description: `${payload.name} has been added.` });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    dispatch({ type: "DELETE", id });
    toast({ title: "Ingredient Deleted", description: `${name} has been removed.` });
  };

  const setFormField = (field: keyof Ingredient, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AdminLayout title="Ingredients">
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Ingredients ({ingredients.length})</CardTitle>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Ingredient
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Suitable Skin Types</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.map((ing) => (
                <TableRow key={ing.id}>
                  <TableCell className="font-medium">{ing.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{ing.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {ing.suitableSkinTypes.map((st) => (
                        <Badge key={st} variant="outline" className="text-xs">
                          {st}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(ing)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(ing.id, ing.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Ingredient" : "Add Ingredient"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the ingredient details below."
                : "Fill in the details to add a new ingredient."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setFormField("name", e.target.value)}
                  placeholder="e.g. Hyaluronic Acid"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={form.category}
                  onChange={(e) => setFormField("category", e.target.value)}
                  placeholder="e.g. Humectant"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setFormField("description", e.target.value)}
                placeholder="Brief description of the ingredient..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="benefits">Benefits (comma-separated)</Label>
              <Input
                id="benefits"
                value={form.benefits.join(", ")}
                onChange={(e) =>
                  setFormField("benefits", e.target.value.split(",").map((s) => s.trim()))
                }
                placeholder="Brightens skin, Fades spots, Boosts collagen"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sideEffects">Side Effects (comma-separated)</Label>
              <Input
                id="sideEffects"
                value={form.sideEffects.join(", ")}
                onChange={(e) =>
                  setFormField("sideEffects", e.target.value.split(",").map((s) => s.trim()))
                }
                placeholder="Mild irritation, Sun sensitivity"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skinTypes">Suitable Skin Types (comma-separated)</Label>
              <Input
                id="skinTypes"
                value={form.suitableSkinTypes.join(", ")}
                onChange={(e) =>
                  setFormField(
                    "suitableSkinTypes",
                    e.target.value.split(",").map((s) => s.trim()),
                  )
                }
                placeholder="Oily, Dry, Combination, Normal, Sensitive"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editingId ? "Update" : "Add"} Ingredient</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminIngredients;
