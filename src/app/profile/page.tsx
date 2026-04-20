"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/client/api/api-client";
import { 
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Users,
  Calendar,
  Edit,
  Save,
  X,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Video,
  Tag,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Lock,
  Loader2,
  RefreshCcw,
  FileText
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import OnboardingForm from "@/components/OnboardingForm";


const PROFILE_BASE = process.env.NEXT_PUBLIC_PROFILE_BASE_URL!;

export default function ProfilePage() {
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    aboutUs: "",
    category: "",
    subdomain: "",
    officialEmail: "",
    phoneNumber: "",
    websiteUrl: "",
    socialLinks: { linkedin: "", twitter: "", instagram: "" },
    isPhysicalOffice: false,
    addressLine1: "",
    city: "",
    state: "",
    zipCode: "",
    coordinates: { lat: 0, lng: 0 },
    offeredServiceTypes: [] as string[],
    operatingHours: [] as any[],
    bookingPolicy: "",
    cancellationWindowHours: 24,
    taxIdNumber: "",
    businessLicenseUrl: "",
    bankDetails: { accountName: "", accountNumber: "", ifscCode: "" },
    logo: "",
    coverImageUrl: "",
    profileVideo: "",
    tags: [] as string[]
  });

  const [visibilitySettings, setVisibilitySettings] = useState({
    showEmail: true,
    showPhone: true,
    showAddress: true,
    showWebsite: true,
    showProfileVideo: true
  });

  const [newTag, setNewTag] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data: any = await apiClient(PROFILE_BASE);
      setProfileData(data);
      setFormData({
        name: data.name || "",
        tagline: data.tagline || "",
        aboutUs: data.aboutUs || data.description || "",
        category: data.category || data.industry || "",
        subdomain: data.subdomain || "",
        officialEmail: data.officialEmail || data.email || "",
        phoneNumber: data.phoneNumber || data.phone || "",
        websiteUrl: data.websiteUrl || data.website || "",
        socialLinks: data.socialLinks || { linkedin: "", twitter: "", instagram: "" },
        isPhysicalOffice: data.isPhysicalOffice || false,
        addressLine1: data.addressLine1 || data.location || "",
        city: data.city || "",
        state: data.state || "",
        zipCode: data.zipCode || "",
        coordinates: data.coordinates || { lat: 0, lng: 0 },
        offeredServiceTypes: data.offeredServiceTypes || [],
        operatingHours: data.operatingHours || [],
        bookingPolicy: data.bookingPolicy || "",
        cancellationWindowHours: data.cancellationWindowHours || 24,
        taxIdNumber: data.taxIdNumber || data.licenseNumber || "",
        businessLicenseUrl: data.businessLicenseUrl || "",
        bankDetails: data.bankDetails || { accountName: "", accountNumber: "", ifscCode: "" },
        logo: data.logo || "",
        coverImageUrl: data.coverImageUrl || "",
        profileVideo: data.introVideo || "",
        tags: data.tags || []
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleVisibilityChange = (field: string, checked: boolean) => {
    setVisibilitySettings(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      try {
        const d = await apiClient<any>(`${PROFILE_BASE}/logo`, {
  method: "POST",
  body: formDataUpload
});
        setFormData(prev => ({...prev, logo: d.logoUrl}));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      try {
        const d = await apiClient<any>(`${PROFILE_BASE}/intro-video`, {
  method: "POST",
  body: formDataUpload
});
        setFormData(prev => ({...prev, profileVideo: d.fileUrl}));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      try {
        const d = await apiClient<any>(`${PROFILE_BASE}/cover-image`, {
  method: "POST",
  body: formDataUpload
});
        setFormData(prev => ({...prev, coverImageUrl: d.coverUrl}));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleLicenseUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("title", "Business License");
      formDataUpload.append("category", "Verification");
      try {
        const d = await apiClient<any>(`${PROFILE_BASE}/documents`, {
  method: "POST",
  body: formDataUpload
});
        setFormData(prev => ({...prev, businessLicenseUrl: d.document.url}));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = async () => {
    try {
      await apiClient(PROFILE_BASE, {
         method: "PUT",
         body: JSON.stringify({
           ...formData,
           industry: formData.category,
           description: formData.aboutUs,
           phone: formData.phoneNumber,
           website: formData.websiteUrl,
           location: formData.addressLine1,
           licenseNumber: formData.taxIdNumber,
         })
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleOnboardingComplete = async () => {
    setIsFixing(false);
    await refreshUser();
    await loadProfile();
  };

  const status = user?.verificationStatus || "ONBOARDING";

  if (authLoading || loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }


  if (status === "REJECTED" && !isFixing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 p-4 md:p-8 pt-6 h-[80vh]">
        <div className="bg-red-100 dark:bg-red-900/20 p-8 rounded-full border-2 border-red-500 shadow-xl">
          <AlertCircle className="h-16 w-16 text-red-600" />
        </div>
        <div className="text-center space-y-4 max-w-lg">
          <Badge variant="destructive" className="px-4 py-1">
            Application Rejected
          </Badge>
          <h1 className="text-3xl font-bold">Profile Verification Failed</h1>
          <p className="text-muted-foreground">
            Our team has reviewed your application and unfortunately, it could not be approved at this time.
          </p>
          
          {profileData?.rejectionReason && (
            <Card className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 text-left">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-red-800 dark:text-red-400">Reason for Rejection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700 dark:text-red-300 italic">
                  "{profileData.rejectionReason}"
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button onClick={() => setIsFixing(true)} size="lg" className="w-full sm:w-auto">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Fix Issues & Resubmit
            </Button>
            <Button variant="outline" onClick={loadProfile} className="w-full sm:w-auto">
              Check Again
            </Button>
          </div>
          <p className="text-xs text-muted-foreground pt-4">
            If you believe this was a mistake, please contact our support team.
          </p>
        </div>
      </div>
    );
  }

  if (status === "ONBOARDING" || (status === "REJECTED" && isFixing)) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex flex-col items-center justify-center text-center space-y-4 mb-8">
          <Badge variant="outline" className="px-4 py-1 text-primary border-primary bg-primary/5">
            {status === "REJECTED" ? "Fixing Profile" : "Initial Setup"}
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">
            {status === "REJECTED" ? "Revise Your Information" : "Complete Your Profile"}
          </h1>
          <p className="text-muted-foreground max-w-xl">
            {status === "REJECTED" 
              ? "Please address the feedback provided by the administration and resubmit your profile."
              : "You are just a few steps away. Fill out your organization details to submit for verification."}
          </p>
        </div>
        <OnboardingForm initialData={profileData} onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  if (status === "PENDING") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 p-4 md:p-8 pt-6 h-[80vh]">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping scale-150 opacity-20" />
          <div className="relative bg-background p-8 rounded-full border-2 border-primary shadow-xl">
            <Clock className="h-16 w-16 text-primary" />
          </div>
        </div>
        <div className="text-center space-y-4 max-w-lg">
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 border-yellow-200">
            Pending Admin Review
          </Badge>
          <h1 className="text-3xl font-bold">Profile Under Verification</h1>
          <p className="text-muted-foreground">
            Thank you for completing your profile! Our administration team is currently reviewing your information.
          </p>
          <Card className="bg-muted/50 border-none">
            <CardContent className="pt-6">
              <p className="text-sm italic">
                "We typically verify organizations within 24-48 hours. You will receive an email once your profile is live."
              </p>
            </CardContent>
          </Card>
          <Button variant="outline" onClick={loadProfile} className="mt-4">
            Check Status
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Organization Profile</h2>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Organization Logo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  {formData.logo ? (
                    <img src={formData.logo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Building className="h-16 w-16 text-muted-foreground" />
                  )}
                </div>
              </div>
              {isEditing && (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Logo
                  </Button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Maximum size: 2MB</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Cover Photo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="relative w-full">
                <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center overflow-hidden border">
                  {formData.coverImageUrl ? (
                    <img src={formData.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <Globe className="h-10 w-10 text-muted-foreground opacity-20" />
                  )}
                </div>
              </div>
              {isEditing && (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => coverInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Cover
                  </Button>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Maximum size: 5MB</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Video className="h-5 w-5" />
                <span>Profile Video</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(visibilitySettings.showProfileVideo || isEditing) && (
                <>
                  {formData.profileVideo ? (
                    <video 
                      src={formData.profileVideo} 
                      controls 
                      className="w-full rounded-lg"
                      style={{ maxHeight: '200px' }}
                    />
                  ) : (
                    <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                      <Video className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </>
              )}
              {!visibilitySettings.showProfileVideo && !isEditing && (
                <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                  <EyeOff className="h-12 w-12 text-muted-foreground" />
                  <span className="text-muted-foreground ml-2">Video Hidden</span>
                </div>
              )}
              {isEditing && (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => videoInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Video
                  </Button>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                  <p className="text-[10px] text-muted-foreground">Maximum size: 50MB</p>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-video"
                      checked={visibilitySettings.showProfileVideo}
                      onCheckedChange={(checked: boolean) => handleVisibilityChange('showProfileVideo', checked)}
                    />
                    <Label htmlFor="show-video" className="text-sm">
                      {visibilitySettings.showProfileVideo ? (
                        <span className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>Visible to public</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1">
                          <EyeOff className="h-3 w-3" />
                          <span>Hidden from public</span>
                        </span>
                      )}
                    </Label>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Email Verified</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">License Verified</span>
              </div>
              <div className="flex items-center space-x-2">
                {status === "VERIFIED" ? (
                   <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                   <AlertCircle className={`h-4 w-4 ${status === "REJECTED" ? "text-red-500" : "text-yellow-500"}`} />
                )}
                <span className="text-sm">
                  {status === "VERIFIED" ? "Profile Verified" : status === "REJECTED" ? "Profile Rejected" : "Profile Pending Review"}
                </span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Last updated: February 10, 2024
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Experts</span>
                <span className="font-semibold">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Bookings</span>
                <span className="font-semibold">1,247</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Sessions</span>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Member Since</span>
                <span className="font-semibold">2018</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="identity" className="space-y-4">
            <TabsList className="grid w-full grid-cols-6 h-auto">
              <TabsTrigger value="identity">Identity</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="legal">Legal & Bank</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="identity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Identity & Branding</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label>Name</Label>
                       {isEditing ? <Input value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} /> : <p className="text-sm">{formData.name}</p>}
                    </div>
                    <div className="space-y-2">
                       <Label>Tagline</Label>
                       {isEditing ? <Input value={formData.tagline} onChange={(e) => handleInputChange('tagline', e.target.value)} /> : <p className="text-sm">{formData.tagline}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label>Category</Label>
                       {isEditing ? <Input value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)} /> : <p className="text-sm">{formData.category}</p>}
                    </div>
                    <div className="space-y-2">
                       <Label>Subdomain</Label>
                       {isEditing ? <Input value={formData.subdomain} onChange={(e) => handleInputChange('subdomain', e.target.value)} /> : <p className="text-sm">{formData.subdomain}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>About Us</Label>
                    {isEditing ? <Textarea value={formData.aboutUs} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('aboutUs', e.target.value)} rows={4} /> : <p className="text-sm">{formData.aboutUs}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, i) => <Badge key={i} variant="secondary">{tag}</Badge>)}
                      {isEditing && (
                        <div className="flex items-center gap-2">
                          <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} className="w-24 h-8" placeholder="Add..." />
                          <Button size="sm" onClick={addTag} className="h-8"><Plus className="w-3 h-3" /></Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Official Email</Label>
                      {isEditing ? <Input value={formData.officialEmail} onChange={(e) => handleInputChange('officialEmail', e.target.value)} /> : <p className="text-sm">{formData.officialEmail}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      {isEditing ? <Input value={formData.phoneNumber} onChange={(e) => handleInputChange('phoneNumber', e.target.value)} /> : <p className="text-sm">{formData.phoneNumber}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Website URL</Label>
                    {isEditing ? <Input value={formData.websiteUrl} onChange={(e) => handleInputChange('websiteUrl', e.target.value)} /> : <p className="text-sm">{formData.websiteUrl}</p>}
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border space-y-4 mt-4">
                    <Label className="text-sm font-semibold">Social Media Links</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {["linkedin", "twitter", "instagram"].map(plat => (
                        <div key={plat} className="space-y-2">
                          <Label className="capitalize text-xs">{plat}</Label>
                          {isEditing ? (
                            <Input value={(formData.socialLinks as any)[plat]} onChange={(e) => setFormData(prev => ({...prev, socialLinks: {...prev.socialLinks, [plat]: e.target.value}})) } />
                          ) : (
                            <p className="text-sm">{(formData.socialLinks as any)[plat] || "N/A"}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="location" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Location Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                     <Switch checked={formData.isPhysicalOffice} onCheckedChange={(val) => handleInputChange('isPhysicalOffice', val)} disabled={!isEditing} />
                     <Label>Physical Office</Label>
                  </div>
                  {formData.isPhysicalOffice && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Address Line 1</Label>
                        {isEditing ? <Input value={formData.addressLine1} onChange={(e) => handleInputChange('addressLine1', e.target.value)} /> : <p className="text-sm">{formData.addressLine1}</p>}
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>City</Label>
                          {isEditing ? <Input value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} /> : <p className="text-sm">{formData.city}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label>State</Label>
                          {isEditing ? <Input value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} /> : <p className="text-sm">{formData.state}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label>Zip Code</Label>
                          {isEditing ? <Input value={formData.zipCode} onChange={(e) => handleInputChange('zipCode', e.target.value)} /> : <p className="text-sm">{formData.zipCode}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Service Settings & Operating Hours</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Service Types</Label>
                      <div className="flex flex-wrap gap-2">
                        {formData.offeredServiceTypes.map(t => <Badge key={t}>{t}</Badge>)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Cancellation Window (Hours)</Label>
                      {isEditing ? <Input type="number" value={formData.cancellationWindowHours} onChange={(e) => handleInputChange('cancellationWindowHours', parseInt(e.target.value))} /> : <p className="text-sm">{formData.cancellationWindowHours}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Booking Policy</Label>
                    {isEditing ? <Textarea value={formData.bookingPolicy} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('bookingPolicy', e.target.value)} /> : <p className="text-sm">{formData.bookingPolicy}</p>}
                  </div>
                  <div className="space-y-4">
                    <Label className="font-semibold">Operating Hours</Label>
                    <div className="grid gap-2 border p-4 rounded-md">
                      {formData.operatingHours?.map((day: any, i: number) => (
                        <div key={i} className="flex items-center gap-4 text-sm">
                           <span className="w-20 font-medium">{day.day}</span>
                           <span className={day.is_closed ? "text-red-500" : "text-green-600"}>{day.is_closed ? "Closed" : `${day.open} - ${day.close}`}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="legal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Legal & Bank Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tax ID Number</Label>
                      {isEditing ? <Input value={formData.taxIdNumber} onChange={(e) => handleInputChange('taxIdNumber', e.target.value)} /> : <p className="text-sm">{formData.taxIdNumber}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Business License</Label>
                      {formData.businessLicenseUrl ? (
                        <a href={formData.businessLicenseUrl} target="_blank" className="text-sm text-primary underline flex items-center">
                          <FileText className="w-3 h-3 mr-1" /> View License
                        </a>
                      ) : <p className="text-sm text-muted-foreground">No license uploaded</p>}
                      {isEditing && (
                        <div className="mt-2">
                           <Button variant="outline" size="sm" onClick={() => docInputRef.current?.click()}>
                             <Upload className="h-4 w-4 mr-2" />
                             {formData.businessLicenseUrl ? "Update License" : "Upload License"}
                           </Button>
                           <p className="text-[10px] text-muted-foreground mt-1">Maximum size: 10MB (PDF, PNG, JPG)</p>
                           <input type="file" ref={docInputRef} className="hidden" onChange={handleLicenseUpload} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-4">
                    <Label className="text-sm font-semibold text-primary">Settlement Bank Details</Label>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Account Name</Label>
                        {isEditing ? <Input value={formData.bankDetails.accountName} onChange={(e) => setFormData(prev => ({...prev, bankDetails: {...prev.bankDetails, accountName: e.target.value}}))} /> : <p className="text-sm">{formData.bankDetails.accountName}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs">Account Number</Label>
                          {isEditing ? <Input value={formData.bankDetails.accountNumber} onChange={(e) => setFormData(prev => ({...prev, bankDetails: {...prev.bankDetails, accountNumber: e.target.value}}))} /> : <p className="text-sm">{formData.bankDetails.accountNumber}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">IFSC Code</Label>
                          {isEditing ? <Input value={formData.bankDetails.ifscCode} onChange={(e) => setFormData(prev => ({...prev, bankDetails: {...prev.bankDetails, ifscCode: e.target.value}}))} /> : <p className="text-sm">{formData.bankDetails.ifscCode}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account settings and preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive email updates about new bookings and expert requests
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Enable
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Data Export</p>
                        <p className="text-sm text-muted-foreground">
                          Download your organization's data
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Export
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
