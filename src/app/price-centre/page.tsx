"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Save,
  Eye,
  History,
  AlertCircle,
  Plus,
  Minus,
  MoreVertical,
  Undo2,
  Package,
  Layers,
  Sparkles,
  ShoppingBag,
  Clock,
  Loader2,
  Trash2,
} from "lucide-react";
import { apiClient } from "@/client/api/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Modal from "@/components/modal/Modal";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface Category {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  basePrice: string;
  durationMinutes: number | null;
  categoryId: string | null;
  categoryName: string;
  imageUrl: string | null;
  modifiedPrice?: string; // New price in edit state
}

interface Product {
  index: number;
  name: string;
  price: string;
  image: string | null;
  category: string;
  modifiedPrice?: string; // New price in edit state
}

interface Deal {
  id: string;
  name: string;
  price: number;
  duration: string;
  usedCount: number;
  isPackage: boolean;
  modifiedPrice?: string; // New price in edit state
}

interface PriceChangeLog {
  id: string;
  itemName: string;
  itemType: "service" | "product";
  previousPrice: string;
  newPrice: string;
  changeType: "increase" | "decrease" | "manual" | "bulk";
  changedBy: string;
  createdAt: string;
}

export default function PriceCentrePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data States
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  // Backup States (to revert changes)
  const [originalServices, setOriginalServices] = useState<Service[]>([]);
  const [originalProducts, setOriginalProducts] = useState<Product[]>([]);
  const [originalDeals, setOriginalDeals] = useState<Deal[]>([]);

  // Global Price Adjustment State
  const [globalAction, setGlobalAction] = useState<"increase" | "decrease">("increase");
  const [globalValue, setGlobalValue] = useState<string>("10");
  const [globalFilter, setGlobalFilter] = useState<string>("All");

  // Search & Filter States
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState("All");
  const [serviceCategoryTab, setServiceCategoryTab] = useState("All");
  
  const [productSearch, setProductSearch] = useState("");
  const [productBrandFilter, setProductBrandFilter] = useState("All");

  const [dealSearch, setDealSearch] = useState("");
  const [dealTab, setDealTab] = useState("singles"); // singles | packages

  // Pagination States
  const [servicePage, setServicePage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const itemsPerPage = 5;

  // Modals
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<PriceChangeLog[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch all initial data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [categoriesRes, servicesRes, profileRes] = await Promise.all([
        apiClient<{ categories: Category[] }>(`${API_BASE}/organizations/services/categories`),
        apiClient<{ services: any[] }>(`${API_BASE}/organizations/services`),
        apiClient<any>(`${API_BASE}/organizations/profile`),
      ]);

      const fetchedCategories = categoriesRes.categories || [];
      setCategories(fetchedCategories);

      // Mapped services with category names
      const mappedServices: Service[] = (servicesRes.services || []).map((s) => {
        const cat = fetchedCategories.find((c) => c.id === s.categoryId);
        return {
          id: s.id,
          name: s.name,
          basePrice: s.basePrice,
          durationMinutes: s.durationMinutes,
          categoryId: s.categoryId,
          categoryName: cat ? cat.name : "Services",
          imageUrl: s.imageUrl,
        };
      });
      setServices(mappedServices);
      setOriginalServices(JSON.parse(JSON.stringify(mappedServices)));

      // Mapped products with indexes
      const mappedProducts: Product[] = (profileRes.products || []).map((p: any, idx: number) => ({
        index: idx,
        name: p.name,
        price: p.price || "0",
        image: p.image || null,
        category: p.category || "Skincare",
      }));
      setProducts(mappedProducts);
      setOriginalProducts(JSON.parse(JSON.stringify(mappedProducts)));

      // Simulated Deals & Packages with details
      const initialDeals: Deal[] = [
        { id: "deal-1", name: "Deep Tissue Massage & Aromatherapy", price: 159.00, duration: "75 Min", usedCount: 14, isPackage: false },
        { id: "deal-2", name: "Facial Glow Premium Treatment", price: 99.00, duration: "60 Min", usedCount: 22, isPackage: false },
        { id: "deal-3", name: "Nail Art Special & Pedicure", price: 55.00, duration: "50 Min", usedCount: 9, isPackage: false },
        { id: "deal-4", name: "Hair Blow Dry & Styling package", price: 69.00, duration: "45 Min", usedCount: 12, isPackage: true },
        { id: "deal-5", name: "Complete Wellness Spa Day Package", price: 249.00, duration: "120 Min", usedCount: 31, isPackage: true },
        { id: "deal-6", name: "Barber Grooming & Hot Towel Pack", price: 49.00, duration: "30 Min", usedCount: 18, isPackage: true },
      ];
      setDeals(initialDeals);
      setOriginalDeals(JSON.parse(JSON.stringify(initialDeals)));

    } catch (error) {
      console.error(error);
      toast.error("Failed to load pricing data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load change logs
  const loadHistoryLogs = useCallback(async (page: number) => {
    setHistoryLoading(true);
    try {
      const res = await apiClient<{ history: PriceChangeLog[]; total: number }>(
        `${API_BASE}/organizations/price-history?page=${page}&limit=5`
      );
      setHistoryLogs(res.history || []);
      setHistoryTotal(res.total || 0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load change history.");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isHistoryOpen) {
      loadHistoryLogs(historyPage);
    }
  }, [isHistoryOpen, historyPage, loadHistoryLogs]);

  // Track Unsaved Changes
  const getUnsavedChanges = useCallback(() => {
    const unsavedServices = services.filter((s) => s.modifiedPrice !== undefined && s.modifiedPrice !== s.basePrice);
    const unsavedProducts = products.filter((p) => p.modifiedPrice !== undefined && p.modifiedPrice !== p.price);
    const unsavedDeals = deals.filter((d) => d.modifiedPrice !== undefined && Number(d.modifiedPrice) !== d.price);
    return {
      services: unsavedServices,
      products: unsavedProducts,
      deals: unsavedDeals,
      totalCount: unsavedServices.length + unsavedProducts.length + unsavedDeals.length,
    };
  }, [services, products, deals]);

  const { totalCount: unsavedChangesCount } = getUnsavedChanges();

  // Warn on page leave
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChangesCount > 0) {
        e.preventDefault();
        e.returnValue = "You have unsaved price changes. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [unsavedChangesCount]);

  // Inline Handlers for Price edits
  const handleServicePriceChange = (id: string, value: string) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return { ...s, modifiedPrice: value };
        }
        return s;
      })
    );
  };

  const handleServicePriceBlur = (id: string, value: string) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const numVal = parseFloat(value);
          const finalVal = isNaN(numVal) || numVal < 0 ? "0.00" : numVal.toFixed(2);
          return { ...s, modifiedPrice: finalVal };
        }
        return s;
      })
    );
  };

  const adjustServicePriceStep = (id: string, step: number) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const currentVal = parseFloat(s.modifiedPrice !== undefined ? s.modifiedPrice : s.basePrice);
          const finalVal = Math.max(0, currentVal + step).toFixed(2);
          return { ...s, modifiedPrice: finalVal };
        }
        return s;
      })
    );
  };

  const handleProductPriceChange = (index: number, value: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.index === index) {
          return { ...p, modifiedPrice: value };
        }
        return p;
      })
    );
  };

  const handleProductPriceBlur = (index: number, value: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.index === index) {
          const numVal = parseFloat(value);
          const finalVal = isNaN(numVal) || numVal < 0 ? "0.00" : numVal.toFixed(2);
          return { ...p, modifiedPrice: finalVal };
        }
        return p;
      })
    );
  };

  const adjustProductPriceStep = (index: number, step: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.index === index) {
          const currentVal = parseFloat(p.modifiedPrice !== undefined ? p.modifiedPrice : p.price);
          const finalVal = Math.max(0, currentVal + step).toFixed(2);
          return { ...p, modifiedPrice: finalVal };
        }
        return p;
      })
    );
  };

  const handleDealPriceChange = (id: string, value: string) => {
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          return { ...d, modifiedPrice: value };
        }
        return d;
      })
    );
  };

  const handleDealPriceBlur = (id: string, value: string) => {
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const numVal = parseFloat(value);
          const finalVal = isNaN(numVal) || numVal < 0 ? "0.00" : numVal.toFixed(2);
          return { ...d, modifiedPrice: finalVal };
        }
        return d;
      })
    );
  };

  const adjustDealPriceStep = (id: string, step: number) => {
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const currentVal = parseFloat(d.modifiedPrice !== undefined ? d.modifiedPrice : d.price.toString());
          const finalVal = Math.max(0, currentVal + step).toFixed(2);
          return { ...d, modifiedPrice: finalVal };
        }
        return d;
      })
    );
  };

  // Global Price Adjustment Calculator
  const handleApplyGlobal = () => {
    const factor = parseFloat(globalValue) / 100;
    if (isNaN(factor) || factor <= 0) {
      toast.error("Please enter a valid adjustment percentage.");
      return;
    }

    const directionMultiplier = globalAction === "increase" ? 1 + factor : 1 - factor;
    let countAdjusted = 0;

    // Apply to services
    if (globalFilter === "All" || globalFilter === "Services" || categories.some(c => c.name.toLowerCase() === globalFilter.toLowerCase())) {
      setServices((prev) =>
        prev.map((s) => {
          const matchesCategory =
            globalFilter === "All" ||
            globalFilter === "Services" ||
            s.categoryName.toLowerCase() === globalFilter.toLowerCase();

          if (matchesCategory) {
            const currentVal = parseFloat(s.modifiedPrice !== undefined ? s.modifiedPrice : s.basePrice);
            const newVal = Math.max(0, currentVal * directionMultiplier).toFixed(2);
            countAdjusted++;
            return { ...s, modifiedPrice: newVal };
          }
          return s;
        })
      );
    }

    // Apply to products
    if (globalFilter === "All" || globalFilter === "Products") {
      setProducts((prev) =>
        prev.map((p) => {
          const currentVal = parseFloat(p.modifiedPrice !== undefined ? p.modifiedPrice : p.price);
          const newVal = Math.max(0, currentVal * directionMultiplier).toFixed(2);
          countAdjusted++;
          return { ...p, modifiedPrice: newVal };
        })
      );
    }

    // Apply to deals
    if (globalFilter === "All") {
      setDeals((prev) =>
        prev.map((d) => {
          const currentVal = parseFloat(d.modifiedPrice !== undefined ? d.modifiedPrice : d.price.toString());
          const newVal = Math.max(0, currentVal * directionMultiplier).toFixed(2);
          countAdjusted++;
          return { ...d, modifiedPrice: newVal };
        })
      );
    }

    toast.success(`Applied ${globalValue}% ${globalAction} to ${countAdjusted} items!`);
  };

  // Revert all edits
  const handleDiscardChanges = () => {
    setServices(JSON.parse(JSON.stringify(originalServices)));
    setProducts(JSON.parse(JSON.stringify(originalProducts)));
    setDeals(JSON.parse(JSON.stringify(originalDeals)));
    toast.info("All changes discarded.");
  };

  // Save changes
  const handleSaveChanges = async () => {
    const { services: modifiedServices, products: modifiedProducts, deals: modifiedDeals } = getUnsavedChanges();
    if (modifiedServices.length === 0 && modifiedProducts.length === 0 && modifiedDeals.length === 0) {
      toast.info("No modifications to save.");
      return;
    }

    setSaving(true);
    try {
      // 1. Save services if modified
      if (modifiedServices.length > 0) {
        const serviceUpdates = modifiedServices.map((s) => {
          const original = originalServices.find((orig) => orig.id === s.id)!;
          const pct = ((parseFloat(s.modifiedPrice!) - parseFloat(original.basePrice)) / parseFloat(original.basePrice)) * 100;
          return {
            serviceId: s.id,
            newPrice: s.modifiedPrice!,
            previousPrice: original.basePrice,
            itemName: s.name,
            changeType: parseFloat(s.modifiedPrice!) > parseFloat(original.basePrice) ? ("increase" as const) : ("decrease" as const),
            changePercentage: isFinite(pct) ? Math.abs(pct).toFixed(2) : "0",
          };
        });

        await apiClient(`${API_BASE}/organizations/services/bulk-prices`, {
          method: "PATCH",
          body: JSON.stringify({ updates: serviceUpdates }),
        });
      }

      // 2. Save products if modified
      if (modifiedProducts.length > 0) {
        // Construct final product list array for JSON payload
        const finalProductsPayload = products.map((p) => ({
          name: p.name,
          price: p.modifiedPrice !== undefined ? p.modifiedPrice : p.price,
          image: p.image,
          category: p.category,
        }));

        // History logs construct
        const productHistoryLogs = modifiedProducts.map((p) => {
          const original = originalProducts.find((orig) => orig.index === p.index)!;
          const pct = ((parseFloat(p.modifiedPrice!) - parseFloat(original.price)) / parseFloat(original.price)) * 100;
          return {
            itemName: p.name,
            previousPrice: original.price,
            newPrice: p.modifiedPrice!,
            changeType: parseFloat(p.modifiedPrice!) > parseFloat(original.price) ? "increase" : "decrease",
            changePercentage: isFinite(pct) ? Math.abs(pct).toFixed(2) : "0",
          };
        });

        await apiClient(`${API_BASE}/organizations/products/prices`, {
          method: "PUT",
          body: JSON.stringify({
            products: finalProductsPayload,
            history: productHistoryLogs,
          }),
        });
      }

      // 3. Simulated save for deals & packages
      if (modifiedDeals.length > 0) {
        // Simulate save - write to local state
        setOriginalDeals(JSON.parse(JSON.stringify(deals)));
      }

      toast.success("All price changes saved and synchronized successfully!");
      // Reload everything
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save price changes.");
    } finally {
      setSaving(false);
    }
  };

  // Search & Category Filters
  const filteredServices = services.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(serviceSearch.toLowerCase());
    const matchesCategory =
      serviceCategoryTab === "All" ||
      s.categoryName.toLowerCase() === serviceCategoryTab.toLowerCase();

    const matchesDropdown =
      serviceCategoryFilter === "All" || s.categoryId === serviceCategoryFilter;

    return matchesSearch && matchesCategory && matchesDropdown;
  });

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
    const matchesBrand =
      productBrandFilter === "All" || p.category.toLowerCase().includes(productBrandFilter.toLowerCase());
    return matchesSearch && matchesBrand;
  });

  const filteredDeals = deals.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(dealSearch.toLowerCase());
    const matchesTab = dealTab === "singles" ? !d.isPackage : d.isPackage;
    return matchesSearch && matchesTab;
  });

  // Services pagination slice
  const paginatedServices = filteredServices.slice(
    (servicePage - 1) * itemsPerPage,
    servicePage * itemsPerPage
  );
  const totalServicePages = Math.ceil(filteredServices.length / itemsPerPage) || 1;

  // Products pagination slice
  const paginatedProducts = filteredProducts.slice(
    (productPage - 1) * itemsPerPage,
    productPage * itemsPerPage
  );
  const totalProductPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;

  // Helpers to get current price (modified or base)
  const getServicePrice = (s: Service) => (s.modifiedPrice !== undefined ? s.modifiedPrice : s.basePrice);
  const getProductPrice = (p: Product) => (p.modifiedPrice !== undefined ? p.modifiedPrice : p.price);
  const getDealPrice = (d: Deal) => (d.modifiedPrice !== undefined ? d.modifiedPrice : d.price.toFixed(2));

  // Determine if single item is modified
  const isServiceModified = (s: Service) => s.modifiedPrice !== undefined && s.modifiedPrice !== s.basePrice;
  const isProductModified = (p: Product) => p.modifiedPrice !== undefined && p.modifiedPrice !== p.price;
  const isDealModified = (d: Deal) => d.modifiedPrice !== undefined && Number(d.modifiedPrice) !== d.price;

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24 relative">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Price Manipulation Centre ✨</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage base prices of all services and products from one place. Changes will reflect across promotions and bookings.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-auto">
          <Button variant="outline" className="h-10" onClick={() => setIsPreviewOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Preview Prices
          </Button>

          <Button variant="outline" className="h-10" onClick={() => setIsHistoryOpen(true)}>
            <History className="mr-2 h-4 w-4" />
            View Change History
          </Button>
        </div>
      </div>

      {/* Global Adjustment Control Row */}
      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-8 bg-card/60 backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>Global Price Adjustment (All Services & Products)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Select
                value={globalAction}
                onValueChange={(val: "increase" | "decrease") => setGlobalAction(val)}
              >
                <SelectTrigger className="w-[120px] h-10">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="increase">Increase</SelectItem>
                  <SelectItem value="decrease">Decrease</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative w-[100px]">
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={globalValue}
                  onChange={(e) => setGlobalValue(e.target.value)}
                  className="h-10 pr-7 text-center font-medium"
                />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">Apply to:</span>
              <Select value={globalFilter} onValueChange={setGlobalFilter}>
                <SelectTrigger className="w-[160px] h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Items</SelectItem>
                  <SelectItem value="Services">All Services</SelectItem>
                  <SelectItem value="Products">All Products</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleApplyGlobal} className="h-10 ml-auto bg-primary hover:bg-primary/90 text-white font-medium">
              Apply to All
            </Button>
          </CardContent>
        </Card>

        {/* Currency Display Banner */}
        <Card className="md:col-span-4 bg-muted/30 border-dashed">
          <CardContent className="flex items-center space-x-4 py-6">
            <div className="bg-primary/10 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">All prices are in AUD ($)</p>
              <p className="text-xs text-muted-foreground">Base prices only. Taxes are excluded.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Deals (Left Col 3), Services (Middle Col 5), Products (Right Col 4) */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        
        {/* 1. Deals & Packages Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="h-[720px] flex flex-col">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Deals & Packages</span>
                </CardTitle>
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  {deals.length} Active
                </Badge>
              </div>
              <CardDescription>Update campaign & bundle pricing</CardDescription>

              {/* Deal Tabs */}
              <div className="flex space-x-1 bg-muted p-1 rounded-lg mt-3 text-xs">
                <button
                  onClick={() => setDealTab("singles")}
                  className={`flex-1 py-1.5 rounded-md transition-colors ${dealTab === "singles" ? "bg-white shadow font-semibold" : "text-muted-foreground"}`}
                >
                  Single Deals
                </button>
                <button
                  onClick={() => setDealTab("packages")}
                  className={`flex-1 py-1.5 rounded-md transition-colors ${dealTab === "packages" ? "bg-white shadow font-semibold" : "text-muted-foreground"}`}
                >
                  Packages
                </button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-3 space-y-3">
              {filteredDeals.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">No deals match criteria</div>
              ) : (
                filteredDeals.map((deal) => (
                  <div key={deal.id} className="p-3 border rounded-xl bg-card/60 flex items-center justify-between gap-3 hover:shadow-sm transition-shadow">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-foreground truncate">{deal.name}</h4>
                      <div className="flex items-center space-x-2 text-[10px] text-muted-foreground mt-1">
                        <span>{deal.duration}</span>
                        <span>•</span>
                        <span className="text-green-600 font-medium">{deal.usedCount} bookings</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => adjustDealPriceStep(deal.id, -5)}
                        className="h-7 w-7 rounded border bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>

                      <div className="relative">
                        <span className="absolute left-1.5 top-1.5 text-[10px] text-muted-foreground font-semibold">$</span>
                        <input
                          type="text"
                          value={getDealPrice(deal)}
                          onChange={(e) => handleDealPriceChange(deal.id, e.target.value)}
                          onBlur={(e) => handleDealPriceBlur(deal.id, e.target.value)}
                          className={`w-[68px] h-7 border rounded text-center text-xs font-bold pl-3.5 ${
                            isDealModified(deal) ? "border-amber-500 bg-amber-50/50" : ""
                          }`}
                        />
                      </div>

                      <button
                        onClick={() => adjustDealPriceStep(deal.id, 5)}
                        className="h-7 w-7 rounded border bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* 2. Services Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="h-[720px] flex flex-col">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center space-x-2">
                  <Layers className="h-4 w-4 text-blue-500" />
                  <span>Services</span>
                </CardTitle>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {filteredServices.length} Total
                </Badge>
              </div>

              {/* Service filters inside card */}
              <div className="flex space-x-2 mt-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search services..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    className="h-8 pl-8 text-xs"
                  />
                </div>

                <Select value={serviceCategoryFilter} onValueChange={setServiceCategoryFilter}>
                  <SelectTrigger className="w-[110px] h-8 text-xs">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category tabs */}
              <div className="flex overflow-x-auto space-x-1 mt-2.5 pb-1 no-scrollbar text-[10px]">
                {["All", "Services", ...categories.map((c) => c.name)].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setServiceCategoryTab(tab); setServicePage(1); }}
                    className={`px-2.5 py-1 rounded-md shrink-0 transition-colors ${
                      serviceCategoryTab === tab ? "bg-primary text-white font-medium" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-3 flex flex-col justify-between">
              <div className="space-y-3">
                {paginatedServices.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground">No services found</div>
                ) : (
                  paginatedServices.map((service) => (
                    <div key={service.id} className="p-3 border rounded-xl bg-card/60 flex items-center justify-between gap-3 hover:shadow-sm transition-shadow">
                      <div className="min-w-0 flex-1 flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0 border">
                          {service.imageUrl ? (
                            <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                          ) : (
                            <Clock className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-semibold text-foreground truncate">{service.name}</h4>
                          <span className="text-[10px] text-muted-foreground">{service.categoryName}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          onClick={() => adjustServicePriceStep(service.id, -5)}
                          className="h-7 w-7 rounded border bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>

                        <div className="relative">
                          <span className="absolute left-1.5 top-1.5 text-[10px] text-muted-foreground font-semibold">$</span>
                          <input
                            type="text"
                            value={getServicePrice(service)}
                            onChange={(e) => handleServicePriceChange(service.id, e.target.value)}
                            onBlur={(e) => handleServicePriceBlur(service.id, e.target.value)}
                            className={`w-[68px] h-7 border rounded text-center text-xs font-bold pl-3.5 ${
                              isServiceModified(service) ? "border-amber-500 bg-amber-50/50" : ""
                            }`}
                          />
                        </div>

                        <button
                          onClick={() => adjustServicePriceStep(service.id, 5)}
                          className="h-7 w-7 rounded border bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Service Pagination */}
              {totalServicePages > 1 && (
                <div className="flex items-center justify-between border-t pt-3 mt-4 text-xs">
                  <span className="text-muted-foreground">Page {servicePage} of {totalServicePages}</span>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setServicePage(p => Math.max(1, p - 1))}
                      disabled={servicePage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setServicePage(p => Math.min(totalServicePages, p + 1))}
                      disabled={servicePage === totalServicePages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 3. Products Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="h-[720px] flex flex-col">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center space-x-2">
                  <ShoppingBag className="h-4 w-4 text-green-500" />
                  <span>Products</span>
                </CardTitle>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {filteredProducts.length} Total
                </Badge>
              </div>

              {/* Product search & filter */}
              <div className="flex space-x-2 mt-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="h-8 pl-8 text-xs"
                  />
                </div>

                <Select value={productBrandFilter} onValueChange={setProductBrandFilter}>
                  <SelectTrigger className="w-[110px] h-8 text-xs">
                    <SelectValue placeholder="Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    <SelectItem value="Skincare">Skincare</SelectItem>
                    <SelectItem value="Hair Care">Hair Care</SelectItem>
                    <SelectItem value="Body Care">Body Care</SelectItem>
                    <SelectItem value="Tools">Tools</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-3 flex flex-col justify-between">
              <div className="space-y-3">
                {paginatedProducts.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground">No products found</div>
                ) : (
                  paginatedProducts.map((product) => (
                    <div key={product.index} className="p-3 border rounded-xl bg-card/60 flex items-center justify-between gap-3 hover:shadow-sm transition-shadow">
                      <div className="min-w-0 flex-1 flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0 border">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-semibold text-foreground truncate">{product.name}</h4>
                          <span className="text-[10px] text-muted-foreground">{product.category}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          onClick={() => adjustProductPriceStep(product.index, -5)}
                          className="h-7 w-7 rounded border bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>

                        <div className="relative">
                          <span className="absolute left-1.5 top-1.5 text-[10px] text-muted-foreground font-semibold">$</span>
                          <input
                            type="text"
                            value={getProductPrice(product)}
                            onChange={(e) => handleProductPriceChange(product.index, e.target.value)}
                            onBlur={(e) => handleProductPriceBlur(product.index, e.target.value)}
                            className={`w-[68px] h-7 border rounded text-center text-xs font-bold pl-3.5 ${
                              isProductModified(product) ? "border-amber-500 bg-amber-50/50" : ""
                            }`}
                          />
                        </div>

                        <button
                          onClick={() => adjustProductPriceStep(product.index, 5)}
                          className="h-7 w-7 rounded border bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Product Pagination */}
              {totalProductPages > 1 && (
                <div className="flex items-center justify-between border-t pt-3 mt-4 text-xs">
                  <span className="text-muted-foreground">Page {productPage} of {totalProductPages}</span>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setProductPage(p => Math.max(1, p - 1))}
                      disabled={productPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setProductPage(p => Math.min(totalProductPages, p + 1))}
                      disabled={productPage === totalProductPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Floating Save/Discard Actions Bar at the bottom */}
      {unsavedChangesCount > 0 && (
        <div className="fixed bottom-6 left-[280px] right-8 bg-card/85 backdrop-blur-md border rounded-2xl shadow-xl px-6 py-4 flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-300 z-30">
          <div className="flex items-center space-x-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
            <p className="text-sm font-semibold text-card-foreground">
              {unsavedChangesCount} Unsaved Price Change{unsavedChangesCount > 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" className="border-border text-foreground hover:bg-muted h-10" onClick={handleDiscardChanges} disabled={saving}>
              <Undo2 className="mr-2 h-4 w-4" />
              Discard All
            </Button>
            <Button className="bg-primary hover:bg-primary/95 text-white h-10" onClick={handleSaveChanges} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save All Changes
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* 1. Preview Prices Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Preview Updated Prices"
        size="lg"
        showCloseButton
        cancelButtonText="Close Preview"
      >
        <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1">
          <p className="text-xs text-muted-foreground">
            Below is a summary of all modified base prices. Make sure these values are correct before saving.
          </p>

          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="py-2.5 px-3 font-semibold text-muted-foreground">Item Name</th>
                <th className="py-2.5 px-3 font-semibold text-muted-foreground">Type</th>
                <th className="py-2.5 px-3 font-semibold text-muted-foreground text-right">Previous Price</th>
                <th className="py-2.5 px-3 font-semibold text-muted-foreground text-right">New Price</th>
                <th className="py-2.5 px-3 font-semibold text-muted-foreground text-right">Change</th>
              </tr>
            </thead>
            <tbody>
              {getUnsavedChanges().services.map((s) => {
                const diff = parseFloat(s.modifiedPrice!) - parseFloat(s.basePrice);
                return (
                  <tr key={s.id} className="border-b hover:bg-muted/30">
                    <td className="py-2.5 px-3 font-medium">{s.name}</td>
                    <td className="py-2.5 px-3"><Badge variant="outline" className="text-blue-600 bg-blue-50/50">Service</Badge></td>
                    <td className="py-2.5 px-3 text-right">${parseFloat(s.basePrice).toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-green-600">${parseFloat(s.modifiedPrice!).toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-amber-600">
                      {diff > 0 ? `+$${diff.toFixed(2)}` : `-$${Math.abs(diff).toFixed(2)}`}
                    </td>
                  </tr>
                );
              })}

              {getUnsavedChanges().products.map((p) => {
                const diff = parseFloat(p.modifiedPrice!) - parseFloat(p.price);
                return (
                  <tr key={p.index} className="border-b hover:bg-muted/30">
                    <td className="py-2.5 px-3 font-medium">{p.name}</td>
                    <td className="py-2.5 px-3"><Badge variant="outline" className="text-green-600 bg-green-50/50">Product</Badge></td>
                    <td className="py-2.5 px-3 text-right">${parseFloat(p.price).toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-green-600">${parseFloat(p.modifiedPrice!).toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-amber-600">
                      {diff > 0 ? `+$${diff.toFixed(2)}` : `-$${Math.abs(diff).toFixed(2)}`}
                    </td>
                  </tr>
                );
              })}

              {getUnsavedChanges().deals.map((d) => {
                const diff = parseFloat(d.modifiedPrice!) - d.price;
                return (
                  <tr key={d.id} className="border-b hover:bg-muted/30">
                    <td className="py-2.5 px-3 font-medium">{d.name}</td>
                    <td className="py-2.5 px-3"><Badge variant="outline" className="text-amber-600 bg-amber-50/50">Deal</Badge></td>
                    <td className="py-2.5 px-3 text-right">${d.price.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-green-600">${parseFloat(d.modifiedPrice!).toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-amber-600">
                      {diff > 0 ? `+$${diff.toFixed(2)}` : `-$${Math.abs(diff).toFixed(2)}`}
                    </td>
                  </tr>
                );
              })}

              {unsavedChangesCount === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground font-medium">
                    No modifications yet. Change some prices to see previews.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* 2. Change History Modal */}
      <Modal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="View Change History"
        size="lg"
        showCloseButton
        cancelButtonText="Close Log"
      >
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Complete audit trail of all manual and global pricing adjustments.
          </p>

          {historyLoading ? (
            <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : historyLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">No change history logs recorded.</div>
          ) : (
            <div className="space-y-3">
              {historyLogs.map((log) => (
                <div key={log.id} className="p-3 border rounded-xl bg-muted/40 text-xs flex justify-between gap-4">
                  <div className="space-y-1">
                    <h5 className="font-semibold text-foreground">{log.itemName}</h5>
                    <div className="flex items-center space-x-2 text-[10px] text-muted-foreground">
                      <span className="capitalize">{log.itemType}</span>
                      <span>•</span>
                      <span>By {log.changedBy}</span>
                      <span>•</span>
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-primary">${parseFloat(log.newPrice).toFixed(2)}</p>
                    <span className="text-[10px] text-muted-foreground">was ${parseFloat(log.previousPrice).toFixed(2)}</span>
                  </div>
                </div>
              ))}

              {/* History pagination */}
              {historyTotal > 5 && (
                <div className="flex items-center justify-between border-t pt-3 text-xs">
                  <span className="text-muted-foreground">Total records: {historyTotal}</span>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                      disabled={historyPage === 1}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHistoryPage(p => p + 1)}
                      disabled={historyPage * 5 >= historyTotal}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
}
