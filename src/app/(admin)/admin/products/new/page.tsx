'use client';
import { useParams, useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { auth } from "@/lib/firebase";
import {
  Save,
  ArrowLeft,
  Loader2,
  Upload,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { categoryLabels } from "@/lib/constants";

const categories = ["men-women", "korean", "children", "senior", "laser-devices"] as const;

const skinTypeOptions = ["oily", "dry", "combination", "sensitive", "normal"] as const;
const suitableForOptions = ["men", "women", "children", "teens", "adults", "seniors"] as const;
const badgeOptions = [
  "bestseller",
  "new",
  "organic",
  "dermatologist-tested",
  "cruelty-free",
  "vegan",
  "natural",
] as const;

const subcategories = ["cleanser", "serum", "moisturizer", "sunscreen", "toner", "device", "kit", "lip-care", "mask"] as const;

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.string().min(1, "Brand is required"),
  category: z.enum(categories),
  subcategory: z.enum(subcategories).optional(),
  price: z.coerce.number().positive("Price must be positive"),
  originalPrice: z.coerce.number().optional(),
  discount: z.coerce.number().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  volume: z.string().optional(),
  stockCount: z.coerce.number().min(0),
  skinTypes: z.array(z.string()),
  suitableFor: z.array(z.string()),
  concerns: z.string().optional(),
  badges: z.array(z.string()),
  rating: z.coerce.number().min(0).max(5),
  reviewCount: z.coerce.number().int().min(0),
  keyBenefits: z.string().optional(),
  ingredients: z.string().optional(),
  howToUse: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

async function getToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken();
}

export default function AdminProductForm() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = Boolean(id);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [existingImage, setExistingImage] = useState<string>("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      brand: "",
      category: "men-women",
      price: 0,
      originalPrice: undefined,
      discount: undefined,
      description: "",
      shortDescription: "",
      volume: "",
      stockCount: 0,
      skinTypes: [],
      suitableFor: [],
      concerns: "",
      badges: [],
      rating: 0,
      reviewCount: 0,
      keyBenefits: "",
      ingredients: "",
      howToUse: "",
    },
  });

  useEffect(() => {
    if (!isEditing) return;
    async function fetchProduct() {
      try {
        const token = await getToken();
        const res = await fetch(`/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const product = await res.json();
        setExistingImage(product.image || "");
        setImagePreview(product.image || "");
        form.reset({
          name: product.name || "",
          brand: product.brand || "",
          category: product.category || "men-women",
          price: product.price || 0,
          originalPrice: product.originalPrice || undefined,
          discount: product.discount || undefined,
          description: product.description || "",
          shortDescription: product.shortDescription || "",
          volume: product.volume || "",
          stockCount: product.stockCount || 0,
          skinTypes: product.skinTypes || [],
          suitableFor: product.suitableFor || [],
          concerns: (product.concerns || []).join(", "),
          badges: (product.badges || []).filter((b: string) =>
            badgeOptions.includes(b as typeof badgeOptions[number]),
          ),
          rating: product.rating || 0,
          reviewCount: product.reviewCount || 0,
          keyBenefits: (product.keyBenefits || []).join(", "),
          ingredients: (product.ingredients || []).join(", "),
          howToUse: product.howToUse || "",
        });
      } catch {
        toast({ title: "Failed to load product", variant: "destructive" });
      }
    }
    fetchProduct();
  }, [id, isEditing, form, toast]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const token = await getToken();
      const formData = new FormData();

      const productId =
        isEditing && id
          ? (id as string)
          : data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

      formData.append("id", productId);
      formData.append("name", data.name);
      formData.append("brand", data.brand);
      formData.append("category", data.category);
      if (data.subcategory) formData.append("subcategory", data.subcategory);
      formData.append("price", String(data.price));
      if (data.originalPrice) formData.append("originalPrice", String(data.originalPrice));
      if (data.discount) formData.append("discount", String(data.discount));
      if (data.description) formData.append("description", data.description);
      if (data.shortDescription) formData.append("shortDescription", data.shortDescription);
      if (data.volume) formData.append("volume", data.volume);
      formData.append("stockCount", String(data.stockCount));
      formData.append("rating", String(data.rating));
      formData.append("reviewCount", String(data.reviewCount));

      formData.append("skinTypes", JSON.stringify(data.skinTypes));
      formData.append("suitableFor", JSON.stringify(data.suitableFor));
      const concerns = data.concerns ? data.concerns.split(",").map((c) => c.trim()).filter(Boolean) : [];
      formData.append("concerns", JSON.stringify(concerns));
      formData.append("badges", JSON.stringify(data.badges));
      formData.append("keyBenefits", JSON.stringify(data.keyBenefits ? data.keyBenefits.split(",").map((s) => s.trim()).filter(Boolean) : []));
      formData.append("ingredients", JSON.stringify(data.ingredients ? data.ingredients.split(",").map((s) => s.trim()).filter(Boolean) : []));
      formData.append("howToUse", data.howToUse || "");
      if (imageFile) {
        formData.append("imageFile", imageFile);
      } else if (existingImage) {
        formData.append("imageUrl", existingImage);
      }

      const url = isEditing ? `/api/products/${id}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Failed to save");
      }

      toast({
        title: isEditing ? "Product updated" : "Product created",
        description: isEditing
          ? `"${data.name}" has been updated successfully.`
          : `"${data.name}" has been created successfully.`,
      });

      router.push("/admin/products");
    } catch (error: any) {
      toast({ title: error.message || "Failed to save product", variant: "destructive" });
    }
  };

  return (
    <AdminLayout title={isEditing ? "Edit Product" : "Create New Product"}>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <a
            href="/admin/products"
            onClick={(e) => {
              e.preventDefault();
              router.push("/admin/products");
            }}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to products
          </a>
        </Button>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand *</FormLabel>
                    <FormControl>
                      <Input placeholder="Brand name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {categoryLabels[cat]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="volume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 100ml, 50g" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Product Image */}
          <Card>
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                {(imagePreview || existingImage) && (
                  <img
                    src={imagePreview || existingImage}
                    alt="Preview"
                    className="h-32 w-32 rounded-lg object-cover border"
                  />
                )}
                <div>
                  <Label
                    htmlFor="image-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border cursor-pointer hover:bg-muted transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    {imageFile ? "Change Image" : "Upload Image"}
                  </Label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {imageFile
                      ? "Image will be uploaded when you save."
                      : existingImage
                      ? "Current image. Select a new one to replace it."
                      : "Select an image to include with this product."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₹) *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" placeholder="499" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="originalPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Original Price (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" placeholder="699" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="100" placeholder="25" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Ratings */}
          <Card>
            <CardHeader>
              <CardTitle>Rating & Reviews</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating (0-5)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="5" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reviewCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review Count</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Descriptions */}
          <Card>
            <CardHeader>
              <CardTitle>Descriptions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="shortDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief product description"
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Full product description"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Key Benefits, Ingredients, How to Use */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="keyBenefits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Benefits</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Comma-separated benefits, e.g. Hydrates, Brightens, Soothes"
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter benefits separated by commas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ingredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredients</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Comma-separated, e.g. Vitamin C, Hyaluronic Acid, Glycerin"
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter ingredients separated by commas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="howToUse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How to Use</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Usage instructions"
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="stockCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Count</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Skin Types */}
          <Card>
            <CardHeader>
              <CardTitle>Skin Types</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="skinTypes"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                      {skinTypeOptions.map((type) => (
                        <FormField
                          key={type}
                          control={form.control}
                          name="skinTypes"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start gap-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value.includes(type)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...field.value, type]);
                                    } else {
                                      field.onChange(
                                        field.value.filter((v) => v !== type),
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <Label className="text-sm capitalize leading-none pt-0.5">
                                {type}
                              </Label>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Suitable For */}
          <Card>
            <CardHeader>
              <CardTitle>Suitable For</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="suitableFor"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {suitableForOptions.map((option) => (
                        <FormField
                          key={option}
                          control={form.control}
                          name="suitableFor"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start gap-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value.includes(option)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...field.value, option]);
                                    } else {
                                      field.onChange(
                                        field.value.filter((v) => v !== option),
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <Label className="text-sm capitalize leading-none pt-0.5">
                                {option}
                              </Label>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Concerns */}
          <Card>
            <CardHeader>
              <CardTitle>Concerns</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="concerns"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Comma-separated, e.g. Dullness, dark spots, uneven tone"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter concerns separated by commas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="badges"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {badgeOptions.map((badge) => (
                        <FormField
                          key={badge}
                          control={form.control}
                          name="badges"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start gap-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value.includes(badge)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...field.value, badge]);
                                    } else {
                                      field.onChange(
                                        field.value.filter((v) => v !== badge),
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <Label className="text-sm capitalize leading-none pt-0.5">
                                {badge.replace(/-/g, " ")}
                              </Label>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pb-12">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/products")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-1 h-4 w-4" />
              )}
              Save Product
            </Button>
          </div>
        </form>
      </Form>
    </AdminLayout>
  );
}
