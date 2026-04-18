"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  FileText, 
  Share2, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Upload,
  Globe,
  MapPin,
  Tag,
  Video,
  Plus,
  X,
  Phone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/client/api/api-client";

type OperatingHour = {
  day: string;
  open: string;
  close: string;
  is_closed: boolean;
};

type OnboardingFormProps = {
  initialData: any;
  onComplete: () => void;
};

export default function OnboardingForm({ initialData, onComplete }: OnboardingFormProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    tagline: initialData.tagline || "",
    aboutUs: initialData.aboutUs || initialData.description || "",
    category: initialData.category || initialData.industry || "",
    subdomain: initialData.subdomain || "",
    officialEmail: initialData.officialEmail || initialData.email || "",
    phoneNumber: initialData.phoneNumber || initialData.phone || "",
    websiteUrl: initialData.websiteUrl || initialData.website || "",
    socialLinks: initialData.socialLinks || { linkedin: "", twitter: "", instagram: "" },
    isPhysicalOffice: initialData.isPhysicalOffice || false,
    addressLine1: initialData.addressLine1 || initialData.location || "",
    city: initialData.city || "",
    state: initialData.state || "",
    zipCode: initialData.zipCode || "",
    coordinates: initialData.coordinates || { lat: 0, lng: 0 },
    offeredServiceTypes: (initialData.offeredServiceTypes as string[]) || ["Video Call"],
    operatingHours: (initialData.operatingHours as OperatingHour[]) || [
      { day: "Monday", open: "09:00", close: "18:00", is_closed: false },
      { day: "Tuesday", open: "09:00", close: "18:00", is_closed: false },
      { day: "Wednesday", open: "09:00", close: "18:00", is_closed: false },
      { day: "Thursday", open: "09:00", close: "18:00", is_closed: false },
      { day: "Friday", open: "09:00", close: "18:00", is_closed: false },
      { day: "Saturday", open: "09:00", close: "12:00", is_closed: true },
      { day: "Sunday", open: "09:00", close: "12:00", is_closed: true },
    ],
    bookingPolicy: initialData.bookingPolicy || "",
    cancellationWindowHours: initialData.cancellationWindowHours || 24,
    taxIdNumber: initialData.taxIdNumber || initialData.licenseNumber || "",
    businessLicenseUrl: initialData.businessLicenseUrl || "",
    bankDetails: initialData.bankDetails || { accountName: "", accountNumber: "", ifscCode: "" },
    logo: initialData.logo || "",
    coverImageUrl: initialData.coverImageUrl || "",
    introVideo: initialData.introVideo || "",
    documents: initialData.documents || [],
    tags: initialData.tags || [],
  });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const [newTag, setNewTag] = useState("");

  const steps = [
    { title: "Identity", icon: Building2 },
    { title: "Contact", icon: Phone },
    { title: "Location", icon: MapPin },
    { title: "Services", icon: Tag },
    { title: "Legal & Bank", icon: FileText },
  ];

  const handleNext = () => setStep((s) => Math.min(s + 1, 5));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const handleSocialChange = (platform: string, value: string) => {
    handleNestedInputChange("socialLinks", platform, value);
  };

  const handleBankChange = (field: string, value: string) => {
    handleNestedInputChange("bankDetails", field, value);
  };

  const handleOperatingHoursChange = (index: number, field: string, value: any) => {
    const newHours = [...formData.operatingHours];
    newHours[index] = { ...newHours[index], [field]: value };
    setFormData((prev) => ({ ...prev, operatingHours: newHours }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t: string) => t !== tag) }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    const body = new FormData();
    body.append("file", file);

    try {
      const res: any = await apiClient("http://localhost:3000/organizations/profile/logo", {
        method: "POST",
        body,
      });
      setFormData((prev) => ({ ...prev, logo: res.logoUrl }));
    } catch (error) {
      console.error("Logo upload failed:", error);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    const body = new FormData();
    body.append("file", file);

    try {
      const res: any = await apiClient("http://localhost:3000/organizations/profile/cover-image", {
        method: "POST",
        body,
      });
      setFormData((prev) => ({ ...prev, coverImageUrl: res.coverUrl }));
    } catch (error) {
      console.error("Cover upload failed:", error);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const title = prompt("Enter document title:", "Business License");
    if (!title) return;

    setIsUploadingDoc(true);
    const body = new FormData();
    body.append("file", file);
    body.append("title", title);
    body.append("category", "Verification");

    try {
      const res: any = await apiClient("http://localhost:3000/organizations/profile/documents", {
        method: "POST",
        body,
      });
      setFormData((prev) => ({ 
        ...prev, 
        documents: [...(prev.documents || []), res.document],
        ...(title.toLowerCase().includes('license') || !prev.businessLicenseUrl ? { businessLicenseUrl: res.document.url } : {})
      }));
    } catch (error) {
      console.error("Document upload failed:", error);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVideo(true);
    const body = new FormData();
    body.append("file", file);

    try {
      const res: any = await apiClient("http://localhost:3000/organizations/profile/intro-video", {
        method: "POST",
        body,
      });
      setFormData((prev) => ({ ...prev, introVideo: res.fileUrl }));
    } catch (error) {
      console.error("Video upload failed:", error);
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await apiClient("http://localhost:3000/organizations/profile", {
        method: "PUT",
        body: JSON.stringify({
          ...formData,
          industry: formData.category, // Keep industry synced for backend compatibility
          description: formData.aboutUs, // Keep description synced
          phone: formData.phoneNumber, // Keep phone synced
          website: formData.websiteUrl, // Keep website synced
          location: formData.addressLine1, // Keep location synced
          licenseNumber: formData.taxIdNumber, // Keep licenseNumber synced
          verificationStatus: "PENDING",
        }),
      });
      onComplete();
    } catch (error) {
      console.error("Onboarding submission failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Stepper */}
      <div className="mb-10">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 z-0" />
          {steps.map((s, i) => {
            const Icon = s.icon;
            const active = step >= i + 1;
            const current = step === i + 1;
            return (
              <div key={i} className="relative z-10 flex flex-col items-center group">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                  active ? "bg-primary border-primary text-primary-foreground" : "bg-background border-muted text-muted-foreground",
                  current && "ring-4 ring-primary/20 scale-110"
                )}>
                  {step > i + 1 ? <Check className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={cn(
                  "mt-2 text-xs font-medium transition-colors duration-300",
                  active ? "text-primary" : "text-muted-foreground"
                )}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <Card className="border-none shadow-2xl bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {steps[step - 1].title}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Basic identity and branding of your organization."}
            {step === 2 && "How can clients and experts reach you?"}
            {step === 3 && "Tell us about your physical presence."}
            {step === 4 && "Configure your services and operating hours."}
            {step === 5 && "Final legal documents and settlement info."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Organization Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Digital Health Inc." 
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input 
                    id="tagline" 
                    placeholder="Briefly describe your focus" 
                    value={formData.tagline}
                    onChange={(e) => handleInputChange("tagline", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input 
                    id="category" 
                    placeholder="e.g. Healthcare, Legal" 
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subdomain">Preferred Subdomain</Label>
                  <Input 
                    id="subdomain" 
                    placeholder="organization-name" 
                    value={formData.subdomain}
                    onChange={(e) => handleInputChange("subdomain", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="aboutUs">About Us</Label>
                <Textarea 
                  id="aboutUs" 
                  placeholder="Detailed description of your organization..." 
                  className="min-h-[100px]"
                  value={formData.aboutUs}
                  onChange={(e) => handleInputChange("aboutUs", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Logo</Label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded border flex items-center justify-center overflow-hidden">
                      {formData.logo ? <img src={formData.logo} className="object-cover" /> : <Building2 className="w-8 h-8 opacity-20" />}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()} disabled={isUploadingLogo}>
                      <Upload className="w-3 h-3 mr-2" /> {isUploadingLogo ? "..." : "Upload"}
                    </Button>
                    <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Cover Image</Label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded border flex items-center justify-center overflow-hidden">
                      {formData.coverImageUrl ? <img src={formData.coverImageUrl} className="object-cover" /> : <Globe className="w-8 h-8 opacity-20" />}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => coverInputRef.current?.click()} disabled={isUploadingCover}>
                      <Upload className="w-3 h-3 mr-2" /> {isUploadingCover ? "..." : "Upload"}
                    </Button>
                    <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleCoverUpload} />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Intro Video</Label>
                <div className="flex items-center gap-3">
                  <div className="w-full h-24 rounded border flex items-center justify-center overflow-hidden bg-muted/20">
                    {formData.introVideo ? (
                      <video src={formData.introVideo} className="h-full" />
                    ) : (
                      <Video className="w-8 h-8 opacity-20" />
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => videoInputRef.current?.click()} disabled={isUploadingVideo}>
                    <Upload className="w-3 h-3 mr-2" /> {isUploadingVideo ? "Uploading..." : "Upload Video"}
                  </Button>
                  <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={handleVideoUpload} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="officialEmail">Official Email</Label>
                  <Input 
                    id="officialEmail" 
                    type="email"
                    placeholder="contact@org.com" 
                    value={formData.officialEmail}
                    onChange={(e) => handleInputChange("officialEmail", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input 
                    id="phoneNumber" 
                    placeholder="+1 234-567-890" 
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input 
                  id="websiteUrl" 
                  placeholder="https://www.organization.com" 
                  value={formData.websiteUrl}
                  onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                />
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border space-y-4">
                <Label className="text-sm font-semibold">Social Media Links</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-xs">LinkedIn</Label>
                    <Input 
                      placeholder="URL" 
                      value={formData.socialLinks.linkedin}
                      onChange={(e) => handleSocialChange("linkedin", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">Twitter</Label>
                    <Input 
                      placeholder="URL" 
                      value={formData.socialLinks.twitter}
                      onChange={(e) => handleSocialChange("twitter", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">Instagram</Label>
                    <Input 
                      placeholder="URL" 
                      value={formData.socialLinks.instagram}
                      onChange={(e) => handleSocialChange("instagram", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center space-x-2 p-4 bg-muted/30 rounded-lg border">
                <Label htmlFor="isPhysical">Do you have a physical office?</Label>
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                  <Button 
                    variant={formData.isPhysicalOffice ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleInputChange("isPhysicalOffice", true)}
                  >
                    Yes
                  </Button>
                  <Button 
                    variant={!formData.isPhysicalOffice ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleInputChange("isPhysicalOffice", false)}
                  >
                    No
                  </Button>
                </div>
              </div>

              {formData.isPhysicalOffice && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address Line 1</Label>
                    <Input 
                      id="address" 
                      placeholder="Street address, Suite, etc." 
                      value={formData.addressLine1}
                      onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={formData.city} onChange={(e) => handleInputChange("city", e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" value={formData.state} onChange={(e) => handleInputChange("state", e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="zip">Zip Code</Label>
                      <Input id="zip" value={formData.zipCode} onChange={(e) => handleInputChange("zipCode", e.target.value)} />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Service Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Video Call", "Physical Appointment"].map(type => (
                      <Badge 
                        key={type} 
                        variant={formData.offeredServiceTypes.includes(type) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const current = formData.offeredServiceTypes;
                          if (current.includes(type)) {
                            handleInputChange("offeredServiceTypes", current.filter((c: string) => c !== type));
                          } else {
                            handleInputChange("offeredServiceTypes", [...current, type]);
                          }
                        }}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cancelHours">Cancellation Window (Hours)</Label>
                  <Input 
                    id="cancelHours" 
                    type="number" 
                    value={formData.cancellationWindowHours} 
                    onChange={(e) => handleInputChange("cancellationWindowHours", parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="policy">Booking Policy</Label>
                <Textarea 
                  id="policy" 
                  placeholder="Terms for booking and cancellations..." 
                  value={formData.bookingPolicy}
                  onChange={(e) => handleInputChange("bookingPolicy", e.target.value)}
                />
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border space-y-4 max-h-[300px] overflow-y-auto">
                <Label className="text-sm font-semibold">Operating Hours</Label>
                {formData.operatingHours.map((hour: OperatingHour, i: number) => (
                  <div key={hour.day} className="grid grid-cols-4 items-center gap-3">
                    <span className="text-xs font-medium w-max">{hour.day}</span>
                    <Input 
                      type="time" 
                      className="h-8 text-xs" 
                      value={hour.open} 
                      disabled={hour.is_closed}
                      onChange={(e) => handleOperatingHoursChange(i, "open", e.target.value)} 
                    />
                    <Input 
                      type="time" 
                      className="h-8 text-xs" 
                      value={hour.close} 
                      disabled={hour.is_closed}
                      onChange={(e) => handleOperatingHoursChange(i, "close", e.target.value)} 
                    />
                    <div className="flex items-center gap-2">
                       <input 
                        type="checkbox" 
                        checked={hour.is_closed} 
                        onChange={(e) => handleOperatingHoursChange(i, "is_closed", e.target.checked)}
                      />
                      <span className="text-[10px]">Closed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="grid gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="taxId">Tax ID Number (GST/PAN)</Label>
                  <Input 
                    id="taxId" 
                    placeholder="TAX-ID-123456" 
                    value={formData.taxIdNumber}
                    onChange={(e) => handleInputChange("taxIdNumber", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Business License or Legal Documents</Label>
                  <Button variant="outline" className="w-full" onClick={() => docInputRef.current?.click()} disabled={isUploadingDoc}>
                    <FileText className="w-4 h-4 mr-2" /> {isUploadingDoc ? "Uploading..." : "Click to Upload"}
                  </Button>
                  <input type="file" ref={docInputRef} className="hidden" onChange={handleDocumentUpload} />
                  
                  {formData.documents && formData.documents.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {formData.documents.map((doc: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 p-2 text-xs border rounded bg-muted/20">
                          <FileText className="w-4 h-4 text-primary" />
                          <div className="flex-1 overflow-hidden">
                            <p className="truncate font-medium">{doc.title || "Document"}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0" 
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                documents: prev.documents.filter((_: any, idx: number) => idx !== i)
                              }));
                            }}
                          >
                            <X className="w-3 h-3 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-4">
                <Label className="text-sm font-semibold text-primary">Settlement Bank Details</Label>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label className="text-xs">Account Name</Label>
                    <Input 
                      placeholder="Account Holder Name" 
                      value={formData.bankDetails.accountName}
                      onChange={(e) => handleBankChange("accountName", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label className="text-xs">Account Number</Label>
                      <Input 
                        placeholder="0000000000" 
                        value={formData.bankDetails.accountNumber}
                        onChange={(e) => handleBankChange("accountNumber", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs">IFSC Code</Label>
                      <Input 
                        placeholder="IFSC000123" 
                        value={formData.bankDetails.ifscCode}
                        onChange={(e) => handleBankChange("ifscCode", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted border flex items-start gap-3">
                <FileText className="w-5 h-5 text-muted-foreground mt-1" />
                <div>
                   <h4 className="text-sm font-semibold">Verification Process</h4>
                   <p className="text-xs text-muted-foreground">
                      Once submitted, our team will review the provided legal and bank details. You will be notified via email about your verification status.
                   </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t border-muted pt-6">
          <Button 
            variant="ghost" 
            onClick={handleBack} 
            disabled={step === 1}
            className={cn(step === 1 && "opacity-0 pointer-events-none")}
          >
            <ChevronLeft className="mr-2 w-4 h-4" />
            Back
          </Button>
          
          {step < 5 ? (
            <Button onClick={handleNext}>
              Next Step
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading} className="bg-primary hover:bg-primary/90">
              {isLoading ? "Submitting..." : "Submit for Verification"}
              <Check className="ml-2 w-4 h-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

