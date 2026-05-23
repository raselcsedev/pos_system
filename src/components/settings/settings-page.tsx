"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { settingsSchema, type SettingsInput } from "@/validations/settings.schema";

const currencyOptions = [
  { label: "US Dollar (USD)", value: "USD" },
  { label: "Euro (EUR)", value: "EUR" },
  { label: "British Pound (GBP)", value: "GBP" },
  { label: "Philippine Peso (PHP)", value: "PHP" },
  { label: "Indian Rupee (INR)", value: "INR" },
];

const languageOptions = [
  { label: "English", value: "en" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
];

const themeOptions = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

const fieldClass =
  "flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300";

export function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      storeName: "",
      storeAddress: "",
      storePhone: "",
      storeEmail: "",
      logo: "",
      currency: "USD",
      currencySymbol: "$",
      taxRate: 0,
      taxName: "VAT",
      language: "en",
      invoicePrefix: "INV",
      invoiceFooter: "",
      lowStockAlert: true,
      theme: "system",
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/settings");
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error ?? "Unable to load settings");
        return;
      }

      reset(json.data);
    } catch {
      toast.error("Unable to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SettingsInput) => {
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.error ?? "Failed to save settings");
        return;
      }

      toast.success("Settings saved successfully");
      reset(json.data);
    } catch {
      toast.error("Failed to save settings");
    }
  };

  const resetForm = () => {
    loadSettings();
  };

  return (
    <DashboardShell title="Settings">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">Store Settings</h1>
          <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Configure your store profile, currency, tax details, and invoice branding in one place.
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent>
              <p className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">Loading settings...</p>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Store Information</CardTitle>
                  <CardDescription>Update your store details and contact information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Store name</Label>
                      <Input {...register("storeName")} />
                      {errors.storeName && (
                        <p className="text-sm text-red-500">{errors.storeName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Store email</Label>
                      <Input type="email" {...register("storeEmail")} />
                      {errors.storeEmail && (
                        <p className="text-sm text-red-500">{errors.storeEmail.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input {...register("storePhone")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Logo URL</Label>
                      <Input {...register("logo")} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Address</Label>
                    <textarea
                      className={`${fieldClass} min-h-24 resize-none`}
                      {...register("storeAddress")}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Settings</CardTitle>
                    <CardDescription>Currency, tax, and locale settings.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <select className={fieldClass} {...register("currency")}> 
                          {currencyOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Symbol</Label>
                        <Input {...register("currencySymbol")} />
                        {errors.currencySymbol && (
                          <p className="text-sm text-red-500">{errors.currencySymbol.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Tax name</Label>
                        <Input {...register("taxName")} />
                        {errors.taxName && (
                          <p className="text-sm text-red-500">{errors.taxName.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Tax rate</Label>
                        <Input type="number" step="0.01" {...register("taxRate", { valueAsNumber: true })} />
                        {errors.taxRate && (
                          <p className="text-sm text-red-500">{errors.taxRate.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Language</Label>
                        <select className={fieldClass} {...register("language")}> 
                          {languageOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Theme</Label>
                        <select className={fieldClass} {...register("theme")}> 
                          {themeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                      <input
                        id="lowStockAlert"
                        type="checkbox"
                        className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                        {...register("lowStockAlert")}
                      />
                      <div className="space-y-1">
                        <Label htmlFor="lowStockAlert">Low stock alerts</Label>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          Enable notifications for low stock products and restock reminders.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Invoice Customization</CardTitle>
                    <CardDescription>Adjust the invoice prefix and footer text shown on receipts.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Invoice prefix</Label>
                      <Input {...register("invoicePrefix")} />
                      {errors.invoicePrefix && (
                        <p className="text-sm text-red-500">{errors.invoicePrefix.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Invoice footer</Label>
                      <textarea
                        className={`${fieldClass} min-h-24 resize-none`}
                        {...register("invoiceFooter")}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting}>
                Reset
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save settings"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardShell>
  );
}
