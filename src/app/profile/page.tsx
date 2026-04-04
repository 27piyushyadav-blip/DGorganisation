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
  Trash2
} from "lucide-react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "Digital Health Organization",
    email: "contact@digitalhealth.com",
    phone: "+1 (555) 123-4567",
    address: "123 Healthcare Ave, Medical District, NY 10001",
    website: "www.digitalhealth.com",
    description: "We are a leading healthcare organization providing expert mental health and wellness services through both online and offline consultations. Our team of certified professionals is dedicated to providing personalized care to help individuals achieve their mental health goals.",
    foundedYear: "2018",
    licenseNumber: "HLTH-ORG-2018-4567",
    specialties: ["Clinical Psychology", "Counseling", "Psychiatry", "Therapy"],
    workingHours: "Mon-Fri: 9:00 AM - 8:00 PM, Sat-Sun: 10:00 AM - 6:00 PM",
    tags: ["Healthcare", "Mental Health", "Wellness", "Professional"],
    profileImage: "",
    profileVideo: ""
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(process.env.NEXT_PUBLIC_PROFILE_BASE_URL || "http://localhost:3000/organizations/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFormData(prev => ({
             ...prev,
             name: data.name || prev.name,
             email: data.email || prev.email,
             description: data.description || prev.description,
             profileImage: data.logo || prev.profileImage,
             profileVideo: data.introVideo || prev.profileVideo,
             address: data.location || prev.address,
             website: data.website || prev.website,
          }));
        }
      } catch (err) {
        console.error(err);
      }
    }
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
      const token = localStorage.getItem("access_token");
      try {
        const res = await fetch("http://localhost:3000/organizations/profile/logo", {
           method: "POST",
           headers: { Authorization: `Bearer ${token}` },
           body: formDataUpload
        });
        if (res.ok) {
           const d = await res.json();
           setFormData(prev => ({...prev, profileImage: d.logoUrl}));
        }
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
      const token = localStorage.getItem("access_token");
      try {
        const res = await fetch("http://localhost:3000/organizations/profile/intro-video", {
           method: "POST",
           headers: { Authorization: `Bearer ${token}` },
           body: formDataUpload
        });
        if (res.ok) {
           const d = await res.json();
           setFormData(prev => ({...prev, profileVideo: d.fileUrl}));
        }
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
    const token = localStorage.getItem("access_token");
    try {
      await fetch("http://localhost:3000/organizations/profile", {
         method: "PUT",
         headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
         },
         body: JSON.stringify({
           name: formData.name,
           description: formData.description,
           location: formData.address,
           website: formData.website,
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
                  {formData.profileImage ? (
                    <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
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
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Profile Pending Review</span>
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
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList>
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Update your organization's basic information. Changes require admin verification.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Organization Name</label>
                      {isEditing ? (
                        <Input
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                      ) : (
                        <p className="text-sm">{formData.name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                          />
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="show-email"
                              checked={visibilitySettings.showEmail}
                              onCheckedChange={(checked: boolean) => handleVisibilityChange('showEmail', checked)}
                            />
                            <Label htmlFor="show-email" className="text-sm">
                              {visibilitySettings.showEmail ? (
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
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{visibilitySettings.showEmail ? formData.email : 'Hidden'}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone</label>
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                          />
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="show-phone"
                              checked={visibilitySettings.showPhone}
                              onCheckedChange={(checked: boolean) => handleVisibilityChange('showPhone', checked)}
                            />
                            <Label htmlFor="show-phone" className="text-sm">
                              {visibilitySettings.showPhone ? (
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
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{visibilitySettings.showPhone ? formData.phone : 'Hidden'}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Website</label>
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={formData.website}
                            onChange={(e) => handleInputChange('website', e.target.value)}
                          />
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="show-website"
                              checked={visibilitySettings.showWebsite}
                              onCheckedChange={(checked: boolean) => handleVisibilityChange('showWebsite', checked)}
                            />
                            <Label htmlFor="show-website" className="text-sm">
                              {visibilitySettings.showWebsite ? (
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
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{visibilitySettings.showWebsite ? formData.website : 'Hidden'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Address</label>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                        />
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="show-address"
                            checked={visibilitySettings.showAddress}
                            onCheckedChange={(checked: boolean) => handleVisibilityChange('showAddress', checked)}
                          />
                          <Label htmlFor="show-address" className="text-sm">
                            {visibilitySettings.showAddress ? (
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
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{visibilitySettings.showAddress ? formData.address : 'Hidden'}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bio</label>
                    {isEditing ? (
                      <textarea
                        className="w-full p-3 border rounded-md resize-none"
                        rows={4}
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                      />
                    ) : (
                      <p className="text-sm">{formData.description}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center space-x-2">
                      <Tag className="h-4 w-4" />
                      <span>Tags</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                          <span>{tag}</span>
                          {isEditing && (
                            <button
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </Badge>
                      ))}
                      {isEditing && (
                        <div className="flex items-center space-x-1">
                          <Input
                            placeholder="Add tag"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addTag()}
                            className="w-24 h-8"
                          />
                          <Button size="sm" onClick={addTag} className="h-8 px-2">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Legal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Founded Year</label>
                      {isEditing ? (
                        <Input
                          value={formData.foundedYear}
                          onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                        />
                      ) : (
                        <p className="text-sm">{formData.foundedYear}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">License Number</label>
                      {isEditing ? (
                        <Input
                          value={formData.licenseNumber}
                          onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                        />
                      ) : (
                        <p className="text-sm">{formData.licenseNumber}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Services & Specialties</CardTitle>
                  <CardDescription>
                    Manage the services and specialties your organization offers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Specialties</label>
                    <div className="flex flex-wrap gap-2">
                      {formData.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                      {isEditing && (
                        <Button variant="outline" size="sm">
                          Add Specialty
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Working Hours</label>
                    {isEditing ? (
                      <Input
                        value={formData.workingHours}
                        onChange={(e) => handleInputChange('workingHours', e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formData.workingHours}</span>
                      </div>
                    )}
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
