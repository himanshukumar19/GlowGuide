'use client';

import { useState, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { api } from "@/api/client";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import type { Ingredient } from "@/lib/schemas";

const emptyForm: Omit<Ingredient, "id" | "createdAt" | "updatedAt"> = {
  name: "",
  description: "",
  benefits: [],
  sideEffects: [],
  suitableSkinTypes: [],
  category: "",
  safetyRating: undefined,
};

const AdminIngredients = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const data = await api.get<Ingredient[]>("/api/admin/ingredients");
      setIngredients(data);
    } catch {
      toast({ title: "Failed to load ingredients", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (ingredient: Ingredient) => {
    setEditingId(ingredient.id);
    setForm({
      name: ingredient.name,
      description: ingredient.description,
      benefits: ingredient.benefits,
      sideEffects: ingredient.sideEffects,
      suitableSkinTypes: ingredient.suitableSkinTypes,
      category: ingredient.category,
      safetyRating: ingredient.safetyRating,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.category.trim()) {
      toast({ title: "Validation Error", description: "Name and category are required.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const data = await api.put<{ success: boolean; ingredient: Ingredient }>(
          `/api/admin/ingredients/${editingId}`,
          form
        );
        setIngredients((prev) =>
          prev.map((i) => (i.id === editingId ? data.ingredient : i))
        );
        toast({ title: "Ingredient Updated", description: `${form.name} has been updated.` });
      } else {
        const data = await api.post<{ success: boolean; ingredient: Ingredient }>(
          "/api/admin/ingredients",
          form
        );
        setIngredients((prev) => [...prev, data.ingredient]);
        toast({ title: "Ingredient Added", description: `${form.name} has been added.` });
      }
      setDialogOpen(false);
    } catch {
      toast({ title: "Save Failed", description: "Could not save ingredient.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    setDeleting(id);
    try {
      await api.del(`/api/admin/ingredients/${id}`);
      setIngredients((prev) => prev.filter((i) => i.id !== id));
      toast({ title: "Ingredient Deleted", description: `${name} has been removed.` });
    } catch {
      toast({ title: "Delete Failed", description: "Could not delete ingredient.", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  const setFormField = (field: keyof typeof emptyForm, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <AdminLayout title="Ingredients">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

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
                <TableHead>Safety Rating</TableHead>
                <TableHead>Suitable Skin Types</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No ingredients yet. Click "Add Ingredient" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                ingredients.map((ing) => (
                  <TableRow key={ing.id}>
                    <TableCell className="font-medium">{ing.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{ing.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {ing.safetyRating ? (
                        <Badge
                          variant="outline"
                          className={
                            ing.safetyRating === "safe"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : ing.safetyRating === "moderate"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }
                        >
                          {ing.safetyRating}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
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
                          disabled={deleting === ing.id}
                        >
                          {deleting === ing.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
              <Label htmlFor="safetyRating">Safety Rating</Label>
              <Select
                value={form.safetyRating || ""}
                onValueChange={(val) =>
                  setFormField("safetyRating", val || undefined)
                }
              >
                <SelectTrigger id="safetyRating">
                  <SelectValue placeholder="Select safety rating (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  <SelectItem value="safe">Safe</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="caution">Caution</SelectItem>
                </SelectContent>
              </Select>
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
                  setFormField("benefits", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))
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
                  setFormField("sideEffects", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))
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
                    e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
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
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              {editingId ? "Update" : "Add"} Ingredient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminIngredients;
