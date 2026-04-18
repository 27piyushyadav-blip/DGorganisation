'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Camera,
  ChevronDown,
  Clock,
  Globe,
  GraduationCap,
  Languages,
  Link as LinkIcon,
  Mail,
  MapPin,
  Play,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  UploadCloud,
  User,
  Users,
  Video,
  X,
  Sparkles,
  DollarSign,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/client/api/api-client';
import { toast } from 'sonner';

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

export default function NewExpertPage() {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);

  const [manualForm, setManualForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    location: '',
    timezone: 'UTC',
    languages: '',
    specialization: '',
    bio: '',
    experience: '',
    consultationFee: '',
    tags: '',
    education: [] as any[],
    workHistory: [] as any[],
    services: [] as any[],
    documents: [] as any[],
    socialLinks: {
      linkedin: '',
      twitter: '',
      website: '',
    },
    introVideo: '',
    availability: [] as any[],
    leaves: [] as any[],
    avatar: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const handleAddExpert = async () => {
    if (!manualForm.name || !manualForm.email) {
      toast.error("Name and Email are required");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // 1. Calculate base consultation fee from services if provided
      let baseFee = manualForm.consultationFee;
      if (manualForm.services.length > 0) {
        const prices = manualForm.services
          .map(s => Number(s.videoPrice))
          .filter(p => !isNaN(p) && p > 0);
        if (prices.length > 0) {
          baseFee = Math.min(...prices).toString();
        }
      }

      // 2. Map payload to DB Schema
      const payload = {
        ...manualForm,
        languages: manualForm.languages.split(',').map(l => l.trim()).filter(Boolean),
        tags: manualForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        consultationFee: baseFee || "0",
        experience: Number(manualForm.experience) || 0,
      };

      const response = await apiClient<any>(`${API_BASE}/organizations/experts`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      toast.success("Expert profile created and saved to DB successfully!");
      router.push('/experts');
    } catch (error: any) {
      console.error("Failed to save expert:", error);
      
      if (error.statusCode === 409) {
        toast.warning("Expert Profile Exists", {
          description: "This email is already registered in our system. You can invite them to your organization instead of creating a new profile.",
        });
      } else {
        toast.error(error.message || "Failed to save expert to database");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 pt-6 px-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/experts')}
            className="mb-2 -ml-2 text-zinc-500 hover:text-zinc-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Experts
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Add New Expert</h1>
          <p className="text-zinc-500 mt-1">Fill in the profile details to onboard a new expert.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.push('/experts')}>Cancel</Button>
          <Button onClick={handleAddExpert} disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 h-10 px-8 rounded-xl shadow-lg shadow-indigo-100 transition-all font-semibold">
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving to Database...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" /> Create Expert Profile
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: NAVIGATION TABS */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-500">Sections</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <TabsList className="flex flex-col h-auto bg-transparent gap-1">
                <TabsTrigger value="basic" className="w-full justify-start gap-2 px-4 py-3 data-[state=active]:bg-zinc-100 data-[state=active]:shadow-none">
                  <User className="h-4 w-4" /> Identity
                </TabsTrigger>
                <TabsTrigger value="professional" className="w-full justify-start gap-2 px-4 py-3 data-[state=active]:bg-zinc-100 data-[state=active]:shadow-none">
                  <Briefcase className="h-4 w-4" /> Professional
                </TabsTrigger>
                <TabsTrigger value="career" className="w-full justify-start gap-2 px-4 py-3 data-[state=active]:bg-zinc-100 data-[state=active]:shadow-none">
                  <GraduationCap className="h-4 w-4" /> Career & Education
                </TabsTrigger>
                <TabsTrigger value="schedule" className="w-full justify-start gap-2 px-4 py-3 data-[state=active]:bg-zinc-100 data-[state=active]:shadow-none">
                  <Clock className="h-4 w-4" /> Availability
                </TabsTrigger>
                <TabsTrigger value="services" className="w-full justify-start gap-2 px-4 py-3 data-[state=active]:bg-zinc-100 data-[state=active]:shadow-none">
                  <Sparkles className="h-4 w-4" /> Services & Pricing
                </TabsTrigger>
                <TabsTrigger value="social" className="w-full justify-start gap-2 px-4 py-3 data-[state=active]:bg-zinc-100 data-[state=active]:shadow-none">
                  <Globe className="h-4 w-4" /> Social & Links
                </TabsTrigger>
                <TabsTrigger value="documents" className="w-full justify-start gap-2 px-4 py-3 data-[state=active]:bg-zinc-100 data-[state=active]:shadow-none">
                  <ShieldCheck className="h-4 w-4" /> Documents
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: FORM FIELDS */}
        <div className="lg:col-span-2">
          {/* CONTENT AREA FOR TABS */}
          <TabsContent value="basic" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Identity</CardTitle>
                  <CardDescription>Primary account details and profile photo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* MEDIA: AVATAR SECTION */}
                  <div className="flex flex-col md:flex-row items-center gap-8 pb-6 border-b border-zinc-100">
                    <div className="relative group">
                      <Avatar className="h-32 w-32 border-4 border-white shadow-xl bg-zinc-100">
                        <AvatarImage src={avatarPreview} className="object-cover" />
                        <AvatarFallback className="text-3xl font-bold text-zinc-400">
                          {manualForm.name?.[0]?.toUpperCase() || <User className="h-10 w-10 opacity-20" />}
                        </AvatarFallback>
                      </Avatar>
                      <label 
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                        htmlFor="avatar-upload"
                      >
                        <Camera className="h-6 w-6 text-white mb-1" />
                        <span className="text-[10px] text-white font-bold uppercase tracking-wider">Change</span>
                      </label>
                      <input 
                        id="avatar-upload" 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </div>
                    
                    <div className="flex-1 space-y-2 text-center md:text-left">
                      <h4 className="text-sm font-bold text-zinc-900">Profile Photo</h4>
                      <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
                        A clear profile photo helps clients trust and recognize the expert. Recommended size: 400x400px.
                      </p>
                      <div className="flex gap-2 justify-center md:justify-start pt-1">
                        <Button variant="outline" size="sm" onClick={() => document.getElementById('avatar-upload')?.click()}>
                          Upload Image
                        </Button>
                        {avatarPreview && (
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => {
                            setAvatarPreview('');
                            setAvatarFile(null);
                          }}>
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" value={manualForm.name} onChange={e => setManualForm(prev => ({...prev, name: e.target.value}))} placeholder="Dr. John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" value={manualForm.email} onChange={e => setManualForm(prev => ({...prev, email: e.target.value}))} placeholder="john@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={manualForm.phone} onChange={e => setManualForm(prev => ({...prev, phone: e.target.value}))} placeholder="+1 234 567 8900" />
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select value={manualForm.gender} onValueChange={v => setManualForm(prev => ({...prev, gender: v}))}>
                        <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loc">Location</Label>
                      <Input id="loc" value={manualForm.location} onChange={e => setManualForm(prev => ({...prev, location: e.target.value}))} placeholder="City, Country" />
                    </div>
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Input value={manualForm.timezone} onChange={e => setManualForm(prev => ({...prev, timezone: e.target.value}))} placeholder="e.g. Asia/Kolkata" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="languages">Languages (comma separated)</Label>
                    <Input id="languages" value={manualForm.languages} onChange={e => setManualForm(prev => ({...prev, languages: e.target.value}))} placeholder="English, Spanish" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="professional" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Background</CardTitle>
                  <CardDescription>Expertise and consultation details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Specialization</Label>
                      <Input value={manualForm.specialization} onChange={e => setManualForm(prev => ({...prev, specialization: e.target.value}))} placeholder="e.g. Business Strategy" />
                    </div>
                    <div className="space-y-2">
                      <Label>Experience (Years)</Label>
                      <Input type="number" value={manualForm.experience} onChange={e => setManualForm(prev => ({...prev, experience: e.target.value}))} placeholder="5" />
                    </div>
                    <div className="space-y-2">
                      <Label>Consultation Fee</Label>
                      <Input type="number" value={manualForm.consultationFee} onChange={e => setManualForm(prev => ({...prev, consultationFee: e.target.value}))} placeholder="1000" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tags (comma separated)</Label>
                      <Input value={manualForm.tags} onChange={e => setManualForm(prev => ({...prev, tags: e.target.value}))} placeholder="Strategy, Finance" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea value={manualForm.bio} onChange={e => setManualForm(prev => ({...prev, bio: e.target.value}))} placeholder="A short description of the эксперт's professional background..." rows={5} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="career" className="mt-0 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Education</CardTitle>
                    <CardDescription>Academic degrees and certifications.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setManualForm(prev => ({
                    ...prev, 
                    education: [...prev.education, { institution: '', degree: '', year: '' }]
                  }))}>
                    <Plus className="h-3 w-3 mr-1" /> Add Degree
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {manualForm.education.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed rounded-lg text-zinc-400">
                      No education history added yet.
                    </div>
                  )}
                  {manualForm.education.map((edu, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 border p-4 rounded-lg relative bg-zinc-50/50">
                      <div className="space-y-1">
                        <Label className="text-xs">Institution</Label>
                        <Input placeholder="University Name" value={edu.institution} onChange={e => {
                          const newEdu = [...manualForm.education];
                          newEdu[idx].institution = e.target.value;
                          setManualForm(prev => ({...prev, education: newEdu}));
                        }} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Degree</Label>
                        <Input placeholder="Bachelor of Science" value={edu.degree} onChange={e => {
                          const newEdu = [...manualForm.education];
                          newEdu[idx].degree = e.target.value;
                          setManualForm(prev => ({...prev, education: newEdu}));
                        }} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Year</Label>
                        <Input placeholder="2018" value={edu.year} onChange={e => {
                          const newEdu = [...manualForm.education];
                          newEdu[idx].year = e.target.value;
                          setManualForm(prev => ({...prev, education: newEdu}));
                        }} />
                      </div>
                      <Button variant="ghost" size="sm" className="absolute -top-2 -right-2 h-7 w-7 p-0 rounded-full bg-white border shadow-sm text-red-500" onClick={() => {
                        const newEdu = manualForm.education.filter((_, i) => i !== idx);
                        setManualForm(prev => ({...prev, education: newEdu}));
                      }}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Work History</CardTitle>
                    <CardDescription>Professional experience and roles.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setManualForm(prev => ({
                    ...prev, 
                    workHistory: [...prev.workHistory, { company: '', role: '', duration: '' }]
                  }))}>
                    <Plus className="h-3 w-3 mr-1" /> Add Experience
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {manualForm.workHistory.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed rounded-lg text-zinc-400">
                      No work history added yet.
                    </div>
                  )}
                  {manualForm.workHistory.map((work, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 border p-4 rounded-lg relative bg-zinc-50/50">
                      <div className="space-y-1">
                        <Label className="text-xs">Company</Label>
                        <Input placeholder="Google" value={work.company} onChange={e => {
                          const newWork = [...manualForm.workHistory];
                          newWork[idx].company = e.target.value;
                          setManualForm(prev => ({...prev, workHistory: newWork}));
                        }} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Role</Label>
                        <Input placeholder="Senior Consultant" value={work.role} onChange={e => {
                          const newWork = [...manualForm.workHistory];
                          newWork[idx].role = e.target.value;
                          setManualForm(prev => ({...prev, workHistory: newWork}));
                        }} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Duration</Label>
                        <Input placeholder="2020 - Present" value={work.duration} onChange={e => {
                          const newWork = [...manualForm.workHistory];
                          newWork[idx].duration = e.target.value;
                          setManualForm(prev => ({...prev, workHistory: newWork}));
                        }} />
                      </div>
                      <Button variant="ghost" size="sm" className="absolute -top-2 -right-2 h-7 w-7 p-0 rounded-full bg-white border shadow-sm text-red-500" onClick={() => {
                        const newWork = manualForm.workHistory.filter((_, i) => i !== idx);
                        setManualForm(prev => ({...prev, workHistory: newWork}));
                      }}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Availability Schedule</CardTitle>
                  <CardDescription>Define when the expert is available for bookings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-3">
                    <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-900">
                      <p className="font-bold">Weekly Recurring Schedule</p>
                      <p className="opacity-80">Toggle available days and set the standard time range for bookings.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                      const daySlot = manualForm.availability.find(s => s.dayOfWeek === day);
                      const isActive = !!daySlot;
                      
                      return (
                        <div key={day} className={`flex items-center justify-between p-4 border rounded-xl transition-all ${isActive ? 'bg-white border-indigo-200 shadow-sm' : 'bg-zinc-50 border-zinc-100 opacity-60'}`}>
                          <div className="flex items-center gap-4">
                            <Switch 
                              checked={isActive} 
                              onCheckedChange={(checked: boolean) => {
                                if (checked) {
                                  setManualForm(prev => ({
                                    ...prev, 
                                    availability: [...prev.availability, { dayOfWeek: day, startTime: '09:00', endTime: '17:00' }]
                                  }));
                                } else {
                                  setManualForm(prev => ({
                                    ...prev, 
                                    availability: prev.availability.filter(s => s.dayOfWeek !== day)
                                  }));
                                }
                              }} 
                              className="data-[state=checked]:bg-indigo-600"
                            />
                            <Label className="text-sm font-bold">{day}</Label>
                          </div>
                          {isActive && (
                            <div className="flex items-center space-x-3">
                              <Input 
                                type="time" 
                                value={daySlot.startTime} 
                                onChange={(e) => {
                                  const newAv = manualForm.availability.map(s => 
                                    s.dayOfWeek === day ? { ...s, startTime: e.target.value } : s
                                  );
                                  setManualForm(prev => ({ ...prev, availability: newAv }));
                                }} 
                                className="h-9 text-sm w-32 bg-white" 
                              />
                              <span className="text-zinc-400 font-medium">to</span>
                              <Input 
                                type="time" 
                                value={daySlot.endTime} 
                                onChange={(e) => {
                                  const newAv = manualForm.availability.map(s => 
                                    s.dayOfWeek === day ? { ...s, endTime: e.target.value } : s
                                  );
                                  setManualForm(prev => ({ ...prev, availability: newAv }));
                                }} 
                                className="h-9 text-sm w-32 bg-white" 
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="mt-0 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Services & Pricing</CardTitle>
                    <CardDescription>Define the consultation types and their respective fees.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setManualForm(prev => ({
                    ...prev, 
                    services: [...prev.services, { name: '', duration: 60, videoPrice: '', clinicPrice: '', currency: 'INR', description: '' }]
                  }))}>
                    <Plus className="h-3 w-3 mr-1" /> Add Service
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {manualForm.services.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl text-zinc-400 bg-zinc-50/30">
                      <Sparkles className="h-10 w-10 opacity-10 mb-2" />
                      <p>No services defined yet.</p>
                      <Button variant="link" onClick={() => setManualForm(prev => ({
                        ...prev, 
                        services: [{ name: 'Standard Consultation', duration: 60, videoPrice: '1000', clinicPrice: '1200', currency: 'INR', description: '' }]
                      }))}>Add a standard service</Button>
                    </div>
                  )}
                  {manualForm.services.map((service, idx) => (
                    <div key={idx} className="bg-white border rounded-xl overflow-hidden relative shadow-sm">
                      <div className="bg-zinc-50/50 p-4 border-b flex justify-between items-center">
                        <h4 className="font-bold text-sm flex items-center gap-2">
                          <span className="flex items-center justify-center h-5 w-5 rounded-full bg-zinc-200 text-[10px]">{idx + 1}</span>
                          Service Item
                        </h4>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => {
                          const newServices = manualForm.services.filter((_, i) => i !== idx);
                          setManualForm(prev => ({...prev, services: newServices}));
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs uppercase text-zinc-400 font-bold tracking-wider">Service Name</Label>
                            <Input placeholder="e.g. Initial Consultation" value={service.name} onChange={e => {
                              const newS = [...manualForm.services];
                              newS[idx].name = e.target.value;
                              setManualForm(prev => ({...prev, services: newS}));
                            }} />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs uppercase text-zinc-400 font-bold tracking-wider">Duration (Minutes)</Label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                              <Input type="number" className="pl-9" placeholder="60" value={service.duration} onChange={e => {
                                const newS = [...manualForm.services];
                                newS[idx].duration = Number(e.target.value);
                                setManualForm(prev => ({...prev, services: newS}));
                              }} />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs uppercase text-zinc-400 font-bold tracking-wider flex items-center gap-1">
                              <Video className="h-3 w-3" /> Video Price
                            </Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                              <Input type="number" className="pl-9" placeholder="1000" value={service.videoPrice} onChange={e => {
                                const newS = [...manualForm.services];
                                newS[idx].videoPrice = e.target.value;
                                setManualForm(prev => ({...prev, services: newS}));
                              }} />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs uppercase text-zinc-400 font-bold tracking-wider flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> Clinic Price
                            </Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                              <Input type="number" className="pl-9" placeholder="1200" value={service.clinicPrice} onChange={e => {
                                const newS = [...manualForm.services];
                                newS[idx].clinicPrice = e.target.value;
                                setManualForm(prev => ({...prev, services: newS}));
                              }} />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs uppercase text-zinc-400 font-bold tracking-wider">Description</Label>
                          <Textarea placeholder="What can clients expect from this service?" value={service.description} onChange={e => {
                            const newS = [...manualForm.services];
                            newS[idx].description = e.target.value;
                            setManualForm(prev => ({...prev, services: newS}));
                          }} rows={2} />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social" className="mt-0 space-y-6">
              {/* INTRO VIDEO STUDIO */}
              <Card className="overflow-hidden border-zinc-200 shadow-sm transition-all focus-within:ring-2 focus-within:ring-rose-100">
                <CardHeader className="bg-rose-50/30 border-b border-rose-100 pb-6 flex flex-row items-center gap-4">
                  <div className="h-10 w-10 bg-white rounded-xl border border-rose-200 flex items-center justify-center shadow-sm text-rose-600">
                    <Video className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Intro Video Studio</CardTitle>
                    <CardDescription>Experts with video intros get 3x more bookings.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* VIDEO PREVIEW */}
                    <div className="bg-zinc-900 aspect-video flex items-center justify-center relative overflow-hidden">
                      {(videoPreview || manualForm.introVideo) ? (
                        <div className="w-full h-full relative group">
                          <video 
                            src={videoPreview || manualForm.introVideo} 
                            className="w-full h-full object-cover"
                            controls
                          />
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              setVideoPreview('');
                              setVideoFile(null);
                              setManualForm(prev => ({...prev, introVideo: ''}));
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center space-y-3 p-6">
                          <div className="h-16 w-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto border border-zinc-700">
                            <Play className="h-8 w-8 text-zinc-600 opacity-20" />
                          </div>
                          <p className="text-sm text-zinc-500">No video provided</p>
                        </div>
                      )}
                    </div>

                    {/* VIDEO UPLOAD CONTROLS */}
                    <div className="p-6 flex flex-col justify-center space-y-5">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Select File</Label>
                        <div 
                          className="border-2 border-dashed rounded-xl p-6 text-center hover:bg-zinc-50 cursor-pointer transition-colors border-zinc-200 group"
                          onClick={() => document.getElementById('video-upload')?.click()}
                        >
                          <UploadCloud className="h-8 w-8 text-zinc-300 mx-auto mb-2 group-hover:text-rose-400" />
                          <p className="text-sm text-zinc-600 font-medium">Click to upload video</p>
                          <p className="text-[10px] text-zinc-400 mt-1">MP4, WebM up to 50MB</p>
                          <input 
                            id="video-upload" 
                            type="file" 
                            className="hidden" 
                            accept="video/*"
                            onChange={handleVideoChange}
                          />
                        </div>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-zinc-100" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase">
                          <span className="bg-white px-2 text-zinc-400 font-bold">OR</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-zinc-400 font-bold">External URL</Label>
                        <Input 
                          placeholder="YouTube, Vimeo or direct link" 
                          value={manualForm.introVideo} 
                          onChange={e => setManualForm(prev => ({...prev, introVideo: e.target.value}))} 
                          className="h-10 border-zinc-200"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Online Presence</CardTitle>
                  <CardDescription>Social profiles and personal website.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 uppercase text-[10px] font-bold text-zinc-500 tracking-wider">
                        <Globe className="h-3 w-3 text-indigo-500" /> LinkedIn Profile
                      </Label>
                      <Input placeholder="https://linkedin.com/in/expertname" value={manualForm.socialLinks.linkedin} onChange={e => setManualForm(prev => ({...prev, socialLinks: {...prev.socialLinks, linkedin: e.target.value}}))} />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 uppercase text-[10px] font-bold text-zinc-500 tracking-wider">
                        <LinkIcon className="h-3 w-3 text-zinc-500" /> Personal Website
                      </Label>
                      <Input placeholder="https://expertname.com" value={manualForm.socialLinks.website} onChange={e => setManualForm(prev => ({...prev, socialLinks: {...prev.socialLinks, website: e.target.value}}))} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-0 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Documents</CardTitle>
                    <CardDescription>Verification records for security and trust.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setManualForm(prev => ({
                    ...prev, 
                    documents: [...prev.documents, { title: '', category: 'Identification' }]
                  }))}>
                    <Plus className="h-3 w-3 mr-1" /> Add Document
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {manualForm.documents.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed rounded-lg text-zinc-400">
                      No documents listed yet.
                    </div>
                  )}
                  {manualForm.documents.map((doc, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-xl relative bg-zinc-50/50">
                      <div className="space-y-1">
                        <Label className="text-xs">Document Title</Label>
                        <Input placeholder="e.g. Medical License #123" value={doc.title} onChange={e => {
                          const newDocs = [...manualForm.documents];
                          newDocs[idx].title = e.target.value;
                          setManualForm(prev => ({...prev, documents: newDocs}));
                        }} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Category</Label>
                        <Select value={doc.category} onValueChange={v => {
                          const newDocs = [...manualForm.documents];
                          newDocs[idx].category = v;
                          setManualForm(prev => ({...prev, documents: newDocs}));
                        }}>
                          <SelectTrigger className="bg-white"><SelectValue placeholder="Category" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Identification">Identification</SelectItem>
                            <SelectItem value="License">Professional License</SelectItem>
                            <SelectItem value="Education">Educational Degree</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button variant="ghost" size="sm" className="absolute -top-2 -right-2 h-7 w-7 p-0 rounded-full bg-white border shadow-sm text-red-500" onClick={() => {
                        const newDocs = manualForm.documents.filter((_, i) => i !== idx);
                        setManualForm(prev => ({...prev, documents: newDocs}));
                      }}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-start gap-3 mt-4">
                    <ShieldCheck className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <p className="text-xs text-indigo-900 leading-relaxed">
                      Experts added manually are marked as having "Vetted" records by default. However, any digital documents linked should be checked by an administrator for final LIVE status.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    );
}
