"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/client/api/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  RotateCcw,
  Sparkles,
  Loader2,
  FileText,
  Palette,
  Check,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

const PROFILE_BASE = process.env.NEXT_PUBLIC_PROFILE_BASE_URL!;

// Preset Accent Colors from screenshot/spec
const PRESET_COLORS = [
  { name: "Purple", hex: "#7e22ce" },
  { name: "Pink", hex: "#db2777" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Green", hex: "#059669" },
  { name: "Brown", hex: "#b45309" },
  { name: "Black", hex: "#18181b" },
];

// Preset Background Colors from screenshot/spec
const PRESET_BACKGROUNDS = [
  { name: "White", hex: "#ffffff" },
  { name: "Beige", hex: "#fdf8f2" },
  { name: "Purple Tint", hex: "#faf5ff" },
  { name: "Green Tint", hex: "#f0fdf4" },
  { name: "Blue Tint", hex: "#f0f9ff" },
];

export default function CustomizeInvoicePage() {
  const { user, refreshUser } = useAuth();
  
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Invoice settings state
  const [brandName, setBrandName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [color, setColor] = useState("#7e22ce");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [textSize, setTextSize] = useState<"small" | "medium" | "large">("medium");

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const data: any = await apiClient(PROFILE_BASE);
        setProfileData(data);
        
        // Initialize customizations from DB or fallbacks
        const custom = data?.invoiceCustomization || {};
        setBrandName(custom.brandName || data?.name || "");
        setLogoUrl(custom.logoUrl || data?.logoUrl || data?.logo || "");
        setColor(custom.color || "#7e22ce");
        setBackgroundColor(custom.backgroundColor || "#ffffff");
        setTextSize(custom.textSize || "medium");
      } catch (err: any) {
        console.error("Failed to load profile details:", err);
        toast.error("Could not fetch invoice settings.");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/image\/(jpeg|png|gif|webp|avif)/)) {
      toast.error("Please upload an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploadingLogo(true);
    try {
      const res: any = await apiClient(`${PROFILE_BASE}/invoice-logo`, {
        method: "POST",
        body: formData,
      });
      setLogoUrl(res.logoUrl);
      toast.success("Logo uploaded successfully for invoice.");
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to upload logo.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleResetName = () => {
    setBrandName(profileData?.name || "");
    toast.info("Reset to default organization name");
  };

  const handleResetLogo = () => {
    setLogoUrl(profileData?.logoUrl || profileData?.logo || "");
    toast.info("Reset to default organization logo");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient(PROFILE_BASE, {
        method: "PUT",
        body: JSON.stringify({
          invoiceCustomization: {
            brandName,
            logoUrl,
            color,
            backgroundColor,
            textSize,
          },
        }),
      });
      
      toast.success("Invoice settings saved successfully!");
      refreshUser();
    } catch (err: any) {
      console.error("Save failed:", err);
      toast.error(err.message || "Could not save invoice settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-sm text-zinc-500 font-medium">Loading settings...</p>
      </div>
    );
  }

  // Preview sizing styles
  const previewTextClass = 
    textSize === "small" 
      ? "text-[11px]" 
      : textSize === "large" 
      ? "text-sm" 
      : "text-xs";
  
  const previewPadding = 
    textSize === "small" 
      ? "p-6 md:p-8" 
      : textSize === "large" 
      ? "p-10 md:p-14" 
      : "p-8 md:p-12";

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl font-sans text-zinc-800 dark:text-zinc-200">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <Palette className="w-8 h-8 text-indigo-600" /> Customize Your Invoice
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Design the payment receipt invoice sent to clients after their booking payment completes.
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl min-w-[140px] shadow-sm flex items-center justify-center gap-2"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: CONTROL PANEL (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Logo Uploader */}
          <Card className="border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm bg-white dark:bg-zinc-900/50 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-extrabold tracking-wide uppercase text-zinc-400">1. Change Logo</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleResetLogo}
                  className="text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center overflow-hidden">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-zinc-300" />
                  )}
                </div>
                
                <div className="flex-1 space-y-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleUploadLogo} 
                    className="hidden" 
                    accept="image/*"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    disabled={isUploadingLogo}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 gap-2 rounded-xl"
                  >
                    {isUploadingLogo ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    Upload Logo
                  </Button>
                  
                  <Input 
                    type="text" 
                    value={logoUrl} 
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="Or paste Logo URL"
                    className="text-xs rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Brand Name Customizer */}
          <Card className="border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm bg-white dark:bg-zinc-900/50 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-extrabold tracking-wide uppercase text-zinc-400">2. Change Name</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleResetName}
                  className="text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </Button>
              </div>
              
              <Input 
                type="text" 
                value={brandName} 
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Your Brand Name"
                className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-semibold"
              />
            </CardContent>
          </Card>

          {/* Accent Color Customizer */}
          <Card className="border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm bg-white dark:bg-zinc-900/50 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <Label className="text-sm font-extrabold tracking-wide uppercase text-zinc-400 block">3. Change Color (Accent)</Label>
              
              <div className="flex flex-wrap items-center gap-3">
                {PRESET_COLORS.map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setColor(preset.hex)}
                    style={{ backgroundColor: preset.hex }}
                    className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center cursor-pointer transition-transform hover:scale-110 shadow-sm focus:outline-none"
                    title={preset.name}
                  >
                    {color.toLowerCase() === preset.hex.toLowerCase() && (
                      <Check className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                    )}
                  </button>
                ))}

                {/* Custom Color Input */}
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-sm hover:scale-110 transition-transform">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                    title="Choose custom accent color"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Hex Code:</span>
                <span className="text-xs font-mono font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-indigo-600 dark:text-indigo-400">{color}</span>
              </div>
            </CardContent>
          </Card>

          {/* Background Color Customizer */}
          <Card className="border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm bg-white dark:bg-zinc-900/50 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <Label className="text-sm font-extrabold tracking-wide uppercase text-zinc-400 block">4. Change Background</Label>
              
              <div className="flex flex-wrap items-center gap-3">
                {PRESET_BACKGROUNDS.map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setBackgroundColor(preset.hex)}
                    style={{ backgroundColor: preset.hex }}
                    className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 shadow-sm focus:outline-none"
                    title={preset.name}
                  >
                    {backgroundColor.toLowerCase() === preset.hex.toLowerCase() && (
                      <Check className="w-4 h-4 text-zinc-800 dark:text-zinc-200" />
                    )}
                  </button>
                ))}

                {/* Custom Background Color Input */}
                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-sm hover:scale-105 transition-transform">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                    title="Choose custom background color"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Hex Code:</span>
                <span className="text-xs font-mono font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-indigo-600 dark:text-indigo-400">{backgroundColor}</span>
              </div>
            </CardContent>
          </Card>

          {/* Text Size Customizer */}
          <Card className="border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm bg-white dark:bg-zinc-900/50 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <Label className="text-sm font-extrabold tracking-wide uppercase text-zinc-400 block">5. Text Size</Label>
              
              <div className="grid grid-cols-3 gap-2">
                {(["small", "medium", "large"] as const).map((sz) => (
                  <Button
                    key={sz}
                    type="button"
                    variant={textSize === sz ? "default" : "outline"}
                    onClick={() => setTextSize(sz)}
                    className={`rounded-xl capitalize border-zinc-200 dark:border-zinc-800 font-semibold ${
                      textSize === sz 
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {sz}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE PREVIEW PANEL (7 columns) */}
        <div className="lg:col-span-7">
          <div className="sticky top-6">
            
            <div className="mb-3 flex justify-between items-center px-1">
              <p className="text-sm font-bold text-zinc-400 tracking-wide uppercase flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-zinc-400" /> Live Receipt Preview
              </p>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active Draft</span>
              </div>
            </div>

            {/* Simulated Receipt Sheet */}
            <div 
              style={{ backgroundColor }} 
              className={`w-full ${previewPadding} rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden transition-all duration-300`}
            >
              
              {/* Brand Accent Bar */}
              <div style={{ backgroundColor: color }} className="absolute top-0 left-0 right-0 h-2"></div>
              
              {/* Header Box */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 pb-6 border-b border-zinc-100 dark:border-zinc-800/80">
                {/* Left side info */}
                <div className="flex-1 space-y-3">
                  {logoUrl && (
                    <img 
                      src={logoUrl} 
                      alt="Brand Logo" 
                      className="max-h-16 object-contain rounded-lg max-w-[150px] block" 
                    />
                  )}
                  <h2 style={{ color }} className="text-2xl font-extrabold tracking-tight uppercase">
                    {brandName || "YOUR BRAND"}
                  </h2>
                  <div className="text-[10px] text-zinc-500 space-y-1">
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-zinc-400" />
                      123 Wellness Avenue, Melbourne, VIC 3000
                    </p>
                    <p className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-zinc-400" />
                      +61 400 123 456
                    </p>
                    <p className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-zinc-400" />
                      hello@yourbrand.com
                    </p>
                  </div>
                </div>
                
                {/* Right side details & BILL TO */}
                <div className="w-full md:w-56 flex flex-col items-start md:items-end text-left md:text-right gap-4">
                  <div>
                    <h1 style={{ color }} className="text-2xl font-black tracking-wider leading-none">INVOICE</h1>
                    <div className="text-[10px] text-zinc-500 space-y-0.5 mt-2">
                      <p><strong>Invoice No.</strong> : INV-2025-0058</p>
                      <p><strong>Invoice Date</strong> : 24 May 2025</p>
                      <p className="flex items-center md:justify-end gap-1">
                        <strong>Status</strong> : 
                        <span className="px-1.5 py-0.2 rounded-full text-[8px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/20">
                          PAID
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* BILL TO Card */}
                  <div className="w-full text-left bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
                    <p className="text-[8px] font-extrabold text-zinc-400 tracking-wider uppercase mb-1">BILL TO</p>
                    <h3 className="text-[11px] font-bold text-zinc-900 dark:text-white">Valued Customer</h3>
                    <p className="text-[10px] text-zinc-500 truncate">support@example.com</p>
                    <p className="text-[10px] text-zinc-500">+61 412 345 678</p>
                  </div>
                </div>
              </div>

              {/* Table of elements */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: color }} className="text-[9px] font-extrabold text-white tracking-wider uppercase">
                      <th className="p-2 text-left w-6 rounded-l-lg">#</th>
                      <th className="p-2 text-left">DESCRIPTION</th>
                      <th className="p-2 text-right w-10">QTY</th>
                      <th className="p-2 text-right w-20">PRICE</th>
                      <th className="p-2 text-right w-16">TAX (%)</th>
                      <th className="p-2 text-right w-20 rounded-r-lg">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y divide-zinc-100 dark:divide-zinc-800/40 ${previewTextClass}`}>
                    <tr className="text-zinc-700 dark:text-zinc-300">
                      <td className="p-2 text-zinc-400">01</td>
                      <td className="p-2 font-semibold text-zinc-950 dark:text-white">Swedish Massage (60 min)</td>
                      <td className="p-2 text-right">1</td>
                      <td className="p-2 text-right">$99.00</td>
                      <td className="p-2 text-right">18%</td>
                      <td className="p-2 text-right font-semibold text-zinc-950 dark:text-white">$99.00</td>
                    </tr>
                    <tr className="text-zinc-700 dark:text-zinc-300">
                      <td className="p-2 text-zinc-400">02</td>
                      <td className="p-2 font-semibold text-zinc-950 dark:text-white">Facial Treatment (45 min)</td>
                      <td className="p-2 text-right">1</td>
                      <td className="p-2 text-right">$79.00</td>
                      <td className="p-2 text-right">18%</td>
                      <td className="p-2 text-right font-semibold text-zinc-950 dark:text-white">$79.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total calculations */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                {/* Bottom Left: Payment Info & Thank You */}
                <div className="w-full md:w-7/12 space-y-3">
                  <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 text-[10px] text-zinc-600 dark:text-zinc-300">
                    <p className="text-[8px] font-extrabold text-zinc-400 tracking-wider uppercase mb-1">PAYMENT INFORMATION</p>
                    <table className="w-full text-left border-collapse">
                      <tbody>
                        <tr>
                          <td className="py-0.5 text-zinc-400">Account Name</td>
                          <td className="py-0.5 font-bold text-zinc-800 dark:text-zinc-100">: {brandName || "YOUR BRAND"} Pty Ltd</td>
                        </tr>
                        <tr>
                          <td className="py-0.5 text-zinc-400">BSB / Bank</td>
                          <td className="py-0.5 font-bold text-zinc-800 dark:text-zinc-100">: 123-456 (Wellness Bank)</td>
                        </tr>
                        <tr>
                          <td className="py-0.5 text-zinc-400">Account No.</td>
                          <td className="py-0.5 font-bold text-zinc-800 dark:text-zinc-100">: 9876 5432 1098</td>
                        </tr>
                        <tr>
                          <td className="py-0.5 text-zinc-400">Reference</td>
                          <td className="py-0.5 font-bold text-zinc-800 dark:text-zinc-100">: INV-2025-0058</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="space-y-0.5">
                    <p style={{ color }} className="text-sm font-bold font-serif italic">
                      Thank You! ❤️
                    </p>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      We appreciate your trust in our services. We look forward to serving you again.
                    </p>
                  </div>
                </div>
                
                <div className={`w-full md:w-5/12 space-y-2 ${previewTextClass}`}>
                  <div className="flex justify-between text-zinc-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">$178.00</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Tax (GST 18%)</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">$32.04</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Discount</span>
                    <span className="font-semibold text-emerald-600">-$0.00</span>
                  </div>
                  
                  {/* Highlight Box */}
                  <div 
                    style={{ backgroundColor: color }} 
                    className="p-3 rounded-xl text-white flex justify-between items-baseline shadow-sm"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider">TOTAL AMOUNT</span>
                    <span className="text-base font-extrabold">
                      $210.04
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Details & Core Badges */}
              <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[9px] font-extrabold text-zinc-500 uppercase tracking-wider">
                  <div>🌿 Natural & Safe</div>
                  <div>✨ Hygienic & Clean</div>
                  <div>⏰ On-time Service</div>
                  <div>❤️ Customer Care</div>
                </div>
                
                <div className="text-[9px] text-zinc-400 space-y-0.5">
                  <p>This transaction is securely processed in accordance with our terms of service.</p>
                  <p>Powered by <strong>Velvetbook</strong></p>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
