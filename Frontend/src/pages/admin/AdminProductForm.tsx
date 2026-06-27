import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Save,
  ArrowLeft,
  Loader2,
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
import { products, categoryLabels, getProductById } from "@/data/products";
import type { Product } from "@/types/product";

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

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.string().min(1, "Brand is required"),
  category: z.enum(categories),
  price: z.coerce.number().positive("Price must be positive"),
  originalPrice: z.coerce.number().optional(),
  discount: z.coerce.number().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  volume: z.string().optional(),
  inStock: z.boolean(),
  stockCount: z.coerce.number().optional(),
  skinTypes: z.array(z.string()),
  suitableFor: z.array(z.string()),
  concerns: z.string().optional(),
  badges: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const existingProduct = id ? getProductById(id) : undefined;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
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
      inStock: true,
      stockCount: 0,
      skinTypes: [],
      suitableFor: [],
      concerns: "",
      badges: [],
    },
  });

  useEffect(() => {
    if (existingProduct) {
      form.reset({
        name: existingProduct.name,
        brand: existingProduct.brand,
        category: existingProduct.category,
        price: existingProduct.price,
        originalPrice: existingProduct.originalPrice,
        discount: existingProduct.discount,
        description: existingProduct.description,
        shortDescription: existingProduct.shortDescription,
        volume: existingProduct.volume,
        inStock: existingProduct.inStock,
        stockCount: existingProduct.stockCount,
        skinTypes: existingProduct.skinTypes,
        suitableFor: existingProduct.suitableFor,
        concerns: existingProduct.concerns.join(", "),
        badges: (existingProduct.badges ?? []).filter((b) =>
          badgeOptions.includes(b as typeof badgeOptions[number]),
        ),
      });
    }
  }, [existingProduct, form]);

  const onSubmit = (data: FormValues) => {
    const concerns = data.concerns
      ? data.concerns.split(",").map((c) => c.trim()).filter(Boolean)
      : [];

    const productData: Partial<Product> = {
      name: data.name,
      brand: data.brand,
      category: data.category,
      price: data.price,
      originalPrice: data.originalPrice || undefined,
      discount: data.discount || undefined,
      description: data.description || "",
      shortDescription: data.shortDescription || "",
      volume: data.volume || "",
      inStock: data.inStock,
      stockCount: data.stockCount || 0,
      skinTypes: data.skinTypes as Product["skinTypes"],
      suitableFor: data.suitableFor as Product["suitableFor"],
      concerns,
      badges: data.badges as Product["badges"],
    };

    toast({
      title: isEditing ? "Product updated" : "Product created",
      description: isEditing
        ? `"${data.name}" has been updated successfully.`
        : `"${data.name}" has been created successfully.`,
    });

    navigate("/admin/products");
  };

  return (
    <AdminLayout title={isEditing ? "Edit Product" : "Create New Product"}>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <a
            href="/admin/products"
            onClick={(e) => {
              e.preventDefault();
              navigate("/admin/products");
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

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="inStock"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-3 space-y-0 pt-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>In Stock</FormLabel>
                      <FormDescription>
                        Product is available for purchase
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
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
          <div className="flex items-center justify-end gap-4 pb-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/products")}
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
