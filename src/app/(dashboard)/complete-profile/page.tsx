'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";

const SKIN_TYPES = ["Oily", "Dry", "Combination", "Normal", "Sensitive"];
const CONCERNS = ["Acne", "Hyperpigmentation", "Aging", "Dryness", "Sensitivity", "Dark Circles", "Uneven Texture"];

const profileSchema = z.object({
  displayName: z.string().min(1, "Full name is required"),
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]*$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  skinType: z.string().optional(),
  concerns: z.array(z.string()).default([]),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const CompleteProfile = () => {
  const { customer, updateCustomer } = useAuth();
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: {
      displayName: customer?.displayName || "",
      phone: customer?.phone || "",
      skinType: customer?.skinProfile?.skinType || "",
      concerns: customer?.skinProfile?.concerns || [],
    },
  });

  useEffect(() => {
    if (customer?.profileCompleted) {
      router.replace("/dashboard");
    }
  }, [customer, router]);

  useEffect(() => {
    if (customer) {
      form.reset({
        displayName: customer.displayName || "",
        phone: customer.phone || "",
        skinType: customer.skinProfile?.skinType || "",
        concerns: customer.skinProfile?.concerns || [],
      });
    }
  }, [customer, form]);

  const toggleConcern = (concern: string, current: string[], onChange: (value: string[]) => void) => {
    onChange(current.includes(concern) ? current.filter((c) => c !== concern) : [...current, concern]);
  };

  const onSubmit = async (values: ProfileFormValues) => {
    await updateCustomer({
      displayName: values.displayName || customer?.displayName || "",
      phone: values.phone || "",
      skinProfile: { skinType: values.skinType || "", concerns: values.concerns },
      profileCompleted: true,
    });
    router.replace("/dashboard");
  };

  const handleSkip = () => {
    router.replace("/dashboard");
  };

  if (!customer) return null;

  return (
    <div className="min-h-[85vh] py-16 flex items-center justify-center gradient-hero">
        <div className="container mx-auto px-4 flex justify-center">
          <Card className="w-full max-w-lg border border-border shadow-card bg-card rounded-gg-lg overflow-hidden animate-scale-in">
            <CardHeader className="text-center pt-8 pb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center shadow-soft">
                <Sparkles className="h-8 w-8 text-primary-foreground animate-float" />
              </div>
              <CardTitle className="font-heading text-3xl font-bold tracking-tight text-foreground">
                Complete Your Profile
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm mt-1">
                Help us personalize your experience
              </CardDescription>
            </CardHeader>

            <CardContent className="px-8 pb-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground text-xs font-semibold uppercase tracking-wider">
                          Full Name *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your name"
                            className="rounded-gg-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground text-xs font-semibold uppercase tracking-wider">
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            className="rounded-gg-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="skinType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground text-xs font-semibold uppercase tracking-wider">
                          Skin Type
                        </FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-3 gap-2">
                            {SKIN_TYPES.map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => field.onChange(type)}
                                className={`p-2.5 rounded-gg-sm text-xs font-medium border transition-all ${
                                  field.value === type
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-muted/40 text-foreground border-border hover:bg-muted"
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="concerns"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground text-xs font-semibold uppercase tracking-wider">
                          Skin Concerns (select all that apply)
                        </FormLabel>
                        <FormControl>
                          <div className="flex flex-wrap gap-2">
                            {CONCERNS.map((concern) => (
                              <button
                                key={concern}
                                type="button"
                                onClick={() => toggleConcern(concern, field.value, field.onChange)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                  field.value.includes(concern)
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-muted/40 text-foreground border-border hover:bg-muted"
                                }`}
                              >
                                {concern}
                              </button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-border py-6 rounded-gg-sm text-foreground font-semibold text-sm"
                      onClick={handleSkip}
                      disabled={form.formState.isSubmitting}
                    >
                      Skip for now
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-primary hover:bg-primary-hover py-6 rounded-gg-sm text-primary-foreground font-semibold text-sm flex items-center justify-center"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                          <>
                          Save & Continue
                          <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
  );
};

export default CompleteProfile;
