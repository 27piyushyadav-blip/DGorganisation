'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
  CheckCircle,
  Clock,
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  Users,
  XCircle,
  Video,
  Calendar,
  User,
  Settings,
  Ban,
  ChevronDown,
  CalendarDays,
  X,
  Save,
  Upload,
  Camera,
  Trash2,
  Briefcase,
  GraduationCap,
  Globe,
  MapPin,
  ShieldCheck,
  Link as LinkIcon,
  Languages,
  Mail,
  UserPlus,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { apiClient } from '@/client/api/api-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

interface Expert {
  id: number;
  name: string;
  username: string;
  avatar: string;
  status: 'active' | 'hidden';
  rating: number;
  timings: { day: string; time: string }[];
  totalBookings: number;
  revenue: number;
  services: string[];
  email?: string;
  phone?: string;
  bio?: string;
  videoUrl?: string;
}

interface EditFormData {
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  bio?: string;
  specialization?: string;
  experience?: string;
  consultationFee?: string;
  languages?: string;
  tags?: string;
  education?: any[];
  workHistory?: any[];
  services?: any[];
  availability?: any[];
  socialLinks?: Record<string, string>;
  location?: string;
  gender?: string;
  timezone?: string;
}

interface TimingSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export default function ExpertsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('all');
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [experts, setExperts] = useState<Expert[]>([]);

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient<any>(`${API_BASE}/organizations/experts`);
        setExperts(response.experts || []);
      } catch (error) {
        console.error("Failed to fetch experts:", error);
        toast.error("Failed to load experts from database");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperts();
  }, []);

  // Modal states
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [viewProfileOpen, setViewProfileOpen] = useState(false);
  const [changeDPOpen, setChangeDPOpen] = useState(false);
  const [changeVideoOpen, setChangeVideoOpen] = useState(false);
  const [changeTimingsOpen, setChangeTimingsOpen] = useState(false);
  const [inviteExpertOpen, setInviteExpertOpen] = useState(false);
  const [choiceModalOpen, setChoiceModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  


  // Form states
  const [editForm, setEditForm] = useState<EditFormData>({});
  const [timingSlots, setTimingSlots] = useState<TimingSlot[]>([]);
  const [newAvatar, setNewAvatar] = useState<string>('');
  const [newVideo, setNewVideo] = useState<string>('');
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [uploadedVideoFile, setUploadedVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [videoPreview, setVideoPreview] = useState<string>('');

  const filteredExperts = experts.filter((expert) => {
    const matchesSearch =
      expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesView = viewMode === 'all' || 
      (viewMode === 'active' && expert.status === 'active') ||
      (viewMode === 'hidden' && expert.status === 'hidden');
    
    return matchesSearch && matchesView;
  });

  // Handler functions
  const handleEditProfile = async (expert: Expert) => {
    try {
      const details = await apiClient<any>(`${API_BASE}/organizations/experts/${expert.id}`);
      setSelectedExpert(details);
      setEditForm({
        name: details.name,
        username: details.username,
        email: details.email,
        phone: details.phone,
        bio: details.bio,
        specialization: details.specialization,
        experience: String(details.experience || '0'),
        consultationFee: String(details.consultationFee || '0'),
        languages: (details.languages || []).join(', '),
        tags: (details.tags || []).join(', '),
        education: details.education || [],
        workHistory: details.workHistory || [],
        services: details.services || [],
        availability: details.availability || [],
        socialLinks: details.socialLinks || {},
        location: details.location || '',
        gender: details.gender || '',
        timezone: details.timezone || 'UTC',
      });
    } catch (error) {
      console.error("Failed to fetch expert details for edit:", error);
      setSelectedExpert(expert);
      setEditForm({
        name: expert.name,
        username: expert.username,
        email: expert.email,
        phone: expert.phone,
        bio: expert.bio,
        services: expert.services.map(s => ({ name: s })),
      });
    }
    setEditProfileOpen(true);
    setOpenDropdownId(null);
  };

  const handleViewProfile = async (expert: Expert) => {
    try {
      const details = await apiClient<any>(`${API_BASE}/organizations/experts/${expert.id}`);
      setSelectedExpert(details);
    } catch (error) {
      console.error("Failed to fetch expert details:", error);
      setSelectedExpert(expert); // Fallback to list data
    }
    setViewProfileOpen(true);
    setOpenDropdownId(null);
  };

  const handleInviteExpert = async () => {
    if (!inviteEmail) return;
    setIsInviting(true);
    try {
      await apiClient(`${API_BASE}/organizations/invite-expert`, {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail }),
      });
      // Add a mock expert to the list just for UI response
      const newExpert: Expert = {
        id: Date.now(),
        name: inviteEmail.split('@')[0],
        username: `@${inviteEmail.split('@')[0]}`,
        avatar: '',
        status: 'hidden',
        rating: 0,
        timings: [],
        totalBookings: 0,
        revenue: 0,
        services: [],
        email: inviteEmail,
      };
      setExperts([...experts, newExpert]);
      setInviteExpertOpen(false);
      setInviteEmail('');
      alert("Expert invited successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to invite expert");
    } finally {
      setIsInviting(false);
    }
  };

  const handleChangeDP = (expert: Expert) => {
    setSelectedExpert(expert);
    setNewAvatar(expert.avatar || '');
    setImagePreview('');
    setUploadedImageFile(null);
    setChangeDPOpen(true);
    setOpenDropdownId(null);
  };

  const handleChangeVideo = (expert: Expert) => {
    setSelectedExpert(expert);
    setNewVideo(expert.videoUrl || '');
    setVideoPreview('');
    setUploadedVideoFile(null);
    setChangeVideoOpen(true);
    setOpenDropdownId(null);
  };

  const handleChangeTimings = (expert: Expert) => {
    setSelectedExpert(expert);
    
    // Convert existing timings to timing slots format
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const slots: TimingSlot[] = days.map(day => {
      const existingTiming = expert.timings.find(t => t.day === day);
      if (existingTiming) {
        const [start, end] = existingTiming.time.split(' - ');
        return {
          id: `${day}-${expert.id}`,
          day,
          startTime: start,
          endTime: end,
          isAvailable: true,
        };
      }
      return {
        id: `${day}-${expert.id}`,
        day,
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: false,
      };
    });
    
    setTimingSlots(slots);
    setChangeTimingsOpen(true);
    setOpenDropdownId(null);
  };

  const handleToggleProfileStatus = async (expert: Expert) => {
    try {
      const newStatus = expert.status === 'active' ? 'hidden' : 'active';
      await apiClient(`${API_BASE}/organizations/experts/${expert.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      
      setExperts(prev => prev.map(e => 
        e.id === expert.id 
          ? { ...e, status: newStatus }
          : e
      ));
      toast.success(`Expert is now ${newStatus}`);
    } catch (error) {
      console.error("Failed to toggle status:", error);
      toast.error("Failed to update status");
    }
    setOpenDropdownId(null);
  };

  const handleDisconnectExpert = async (expert: Expert) => {
    if (confirm(`Are you sure you want to disconnect ${expert.name}? This action cannot be undone.`)) {
      try {
        await apiClient(`${API_BASE}/organizations/experts/${expert.id}`, {
          method: 'DELETE',
        });
        setExperts(prev => prev.filter(e => e.id !== expert.id));
        toast.success("Expert disconnected successfully");
      } catch (error) {
        console.error("Failed to disconnect expert:", error);
        toast.error("Failed to disconnect expert");
      }
      setOpenDropdownId(null);
    }
  };

  const handleSaveProfile = async () => {
    if (!selectedExpert) return;
    
    try {
      const payload = {
        ...editForm,
        experience: Number(editForm.experience) || 0,
        languages: editForm.languages?.split(',').map((l: string) => l.trim()).filter(Boolean) || [],
        tags: editForm.tags?.split(',').map((t: string) => t.trim()).filter(Boolean) || [],
      };

      await apiClient(`${API_BASE}/organizations/experts/${selectedExpert.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      // Refresh experts list to show updated data
      const response = await apiClient<any>(`${API_BASE}/organizations/experts`);
      setExperts(response.experts || []);
      
      toast.success("Profile updated successfully");
      setEditProfileOpen(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleSaveTimings = async () => {
    if (!selectedExpert) return;
    
    try {
      const dbAvailability = timingSlots
        .filter(slot => slot.isAvailable)
        .map(slot => ({
          dayOfWeek: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }));

      await apiClient(`${API_BASE}/organizations/experts/${selectedExpert.id}/timings`, {
        method: 'PATCH',
        body: JSON.stringify({ availability: dbAvailability }),
      });

      const updatedTimings = timingSlots
        .filter(slot => slot.isAvailable)
        .map(slot => ({
          day: slot.day,
          time: `${slot.startTime} - ${slot.endTime}`,
        }));
      
      setExperts(prev => prev.map(e => 
        e.id === selectedExpert.id 
          ? { ...e, timings: updatedTimings }
          : e
      ));
      toast.success("Timings updated successfully");
      setChangeTimingsOpen(false);
    } catch (error) {
      console.error("Failed to update timings:", error);
      toast.error("Failed to update timings");
    }
  };

  const handleTimingToggle = (slotId: string) => {
    setTimingSlots(prev => prev.map(slot => 
      slot.id === slotId 
        ? { ...slot, isAvailable: !slot.isAvailable }
        : slot
    ));
  };

  const handleTimingTimeChange = (slotId: string, field: 'startTime' | 'endTime', value: string) => {
    setTimingSlots(prev => prev.map(slot => 
      slot.id === slotId 
        ? { ...slot, [field]: value }
        : slot
    ));
  };

  // File upload handlers
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file size should be less than 5MB');
        return;
      }
      
      setUploadedImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setNewAvatar(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        alert('Please select a video file');
        return;
      }
      
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('Video file size should be less than 50MB');
        return;
      }
      
      setUploadedVideoFile(file);
      
      // Create preview URL
      const videoUrl = URL.createObjectURL(file);
      setVideoPreview(videoUrl);
      setNewVideo(videoUrl);
    }
  };

  const handleImageRemove = () => {
    setUploadedImageFile(null);
    setImagePreview('');
    setNewAvatar(selectedExpert?.avatar || '');
  };

  const handleVideoRemove = () => {
    setUploadedVideoFile(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview('');
    setNewVideo(selectedExpert?.videoUrl || '');
  };

  // Update save handlers to include file upload
  const handleSaveDP = async () => {
    if (!selectedExpert) return;
    
    try {
      let finalAvatarUrl = newAvatar;
      
      if (uploadedImageFile) {
        const formData = new FormData();
        formData.append('file', uploadedImageFile);
        formData.append('expertId', String(selectedExpert.id));
        const uploadRes = await apiClient<any>(`${API_BASE}/organizations/experts/upload-avatar`, {
          method: 'POST',
          body: formData,
        });
        finalAvatarUrl = uploadRes.fileUrl;
      }

      await apiClient(`${API_BASE}/organizations/experts/${selectedExpert.id}/avatar`, {
        method: 'PATCH',
        body: JSON.stringify({ avatarUrl: finalAvatarUrl }),
      });
      
      setExperts(prev => prev.map(e => 
        e.id === selectedExpert.id 
          ? { ...e, avatar: finalAvatarUrl }
          : e
      ));
      
      toast.success("Profile photo updated");
      setUploadedImageFile(null);
      setImagePreview('');
      setChangeDPOpen(false);
    } catch (error) {
      console.error("Failed to update photo:", error);
      toast.error("Failed to update photo");
    }
  };

  const handleSaveVideo = async () => {
    if (!selectedExpert) return;
    
    try {
      let finalVideoUrl = newVideo;
      
      if (uploadedVideoFile) {
        const formData = new FormData();
        formData.append('file', uploadedVideoFile);
        formData.append('expertId', String(selectedExpert.id));
        const uploadRes = await apiClient<any>(`${API_BASE}/organizations/experts/upload-video`, {
          method: 'POST',
          body: formData,
        });
        finalVideoUrl = uploadRes.fileUrl;
      }

      await apiClient(`${API_BASE}/organizations/experts/${selectedExpert.id}/video`, {
        method: 'PATCH',
        body: JSON.stringify({ videoUrl: finalVideoUrl }),
      });
      
      setExperts(prev => prev.map(e => 
        e.id === selectedExpert.id 
          ? { ...e, videoUrl: finalVideoUrl }
          : e
      ));
      
      toast.success("Intro video updated");
      setUploadedVideoFile(null);
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
      setVideoPreview('');
      setChangeVideoOpen(false);
    } catch (error) {
      console.error("Failed to update video:", error);
      toast.error("Failed to update video");
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Expert Management System</h2>
          <p className="text-muted-foreground">Manage your expert team and their profiles</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative max-w-sm">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder="Search experts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Experts</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 min-h-[400px]">
        {isLoading ? (
          // Skeleton Cards
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={`skeleton-${i}`} className="w-[280px] shadow-sm border-gray-100 overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
                <div className="flex flex-col items-center">
                  <Skeleton className="h-20 w-20 rounded-full" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            {filteredExperts.map((expert) => (
              <Card key={expert.id} className="w-[280px] shadow-sm border-gray-100 animate-in fade-in duration-500">
                <CardContent className="p-6">
                  {/* Name and Username Section */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{expert.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{expert.username}</p>
                    </div>
                    <div className="relative">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setOpenDropdownId(openDropdownId === expert.id ? null : expert.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      {openDropdownId === expert.id && (
                        <div className="absolute right-0 top-8 z-50 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1">
                          <div className="px-1 py-1 text-sm text-gray-700">
                            <div 
                              className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded"
                              onClick={() => handleEditProfile(expert)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Profile
                            </div>
                            <div 
                              className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded"
                              onClick={() => handleViewProfile(expert)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </div>
                            <div className="border-t border-gray-100 my-1"></div>
                            <div 
                              className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded"
                              onClick={() => handleChangeDP(expert)}
                            >
                              <User className="mr-2 h-4 w-4" />
                              Change D.P
                            </div>
                            <div 
                              className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded"
                              onClick={() => handleChangeVideo(expert)}
                            >
                              <Video className="mr-2 h-4 w-4" />
                              Change Video
                            </div>
                            <div 
                              className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded"
                              onClick={() => handleChangeTimings(expert)}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              Change Timings
                            </div>
                            <div className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded">
                              <CalendarDays className="mr-2 h-4 w-4" />
                              <Link href={`/experts/${expert.id}/booking-details`} className="w-full">
                                Booking Details
                              </Link>
                            </div>
                            <div className="border-t border-gray-100 my-1"></div>
                            <div 
                              className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded"
                              onClick={() => handleToggleProfileStatus(expert)}
                            >
                              {expert.status === 'hidden' ? (
                                <>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Show Profile
                                </>
                              ) : (
                                <>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Hide Profile
                                </>
                              )}
                            </div>
                            <div 
                              className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded text-red-600"
                              onClick={() => handleDisconnectExpert(expert)}
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Disconnect Expert
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile Image Section */}
                  <div className="flex flex-col items-center mb-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={expert.avatar} alt={expert.name} />
                      <AvatarFallback className="text-lg">
                        {expert.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Timings Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <Clock className="h-4 w-4" />
                        <span>Timings</span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      {expert.timings.length > 0 ? (
                        <div className="space-y-2">
                          {expert.timings.map((timing, index) => (
                            <div key={index} className="text-sm text-gray-600">
                              {timing.day} – {timing.time}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No timings added</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card 
              className="w-[280px] border-dashed border-2 hover:border-primary/50 transition-all cursor-pointer shadow-sm border-gray-100 animate-in fade-in duration-500"
              onClick={() => setChoiceModalOpen(true)}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[280px]">
                <div className="bg-primary/10 rounded-full p-4 mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-gray-900">Add New Expert</h3>
                <p className="text-sm text-gray-500 text-center mt-2">
                  Invite an expert to join your organization
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Choice Modal */}
      <Dialog open={choiceModalOpen} onOpenChange={setChoiceModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add New Expert</DialogTitle>
            <DialogDescription>
              Choose how you want to add an expert to your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button 
              variant="outline" 
              className="h-auto flex flex-col items-center gap-3 p-6 hover:bg-zinc-50 border-2"
              onClick={() => {
                setChoiceModalOpen(false);
                setInviteExpertOpen(true);
              }}
            >
              <Mail className="h-8 w-8 text-primary" />
              <div className="text-center">
                <div className="font-bold">Quick Invite</div>
                <div className="text-xs text-zinc-500">Send an invitation link via email</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex flex-col items-center gap-3 p-6 hover:bg-zinc-50 border-2"
              onClick={() => {
                setChoiceModalOpen(false);
                router.push('/experts/new');
              }}
            >
              <UserPlus className="h-8 w-8 text-indigo-600" />
              <div className="text-center">
                <div className="font-bold">Add Manually</div>
                <div className="text-xs text-zinc-500">Explicitly fill all profile details now</div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Expert Modal */}
      <Dialog open={inviteExpertOpen} onOpenChange={setInviteExpertOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite via Email</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="invite-email">Expert Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="expert@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <p className="text-sm text-gray-500">
              An invitation will be sent to this email address containing instructions to join your organization.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteExpertOpen(false)}>Cancel</Button>
            <Button onClick={handleInviteExpert} disabled={isInviting}>
              {isInviting ? "Inviting..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Modal */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Expert Profile</DialogTitle>
            <DialogDescription>Update all details for this expert profile.</DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 mb-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="pro">Pro</TabsTrigger>
              <TabsTrigger value="career">Career</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="docs">Docs</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input id="edit-name" value={editForm.name || ''} onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-username">Username</Label>
                  <Input id="edit-username" value={editForm.username || ''} onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input id="edit-email" type="email" value={editForm.email || ''} onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input id="edit-phone" value={editForm.phone || ''} onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input id="edit-location" value={editForm.location || ''} onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-gender">Gender</Label>
                  <Select value={editForm.gender} onValueChange={v => setEditForm(prev => ({...prev, gender: v}))}>
                    <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-languages">Languages (comma separated)</Label>
                <Input id="edit-languages" value={editForm.languages || ''} onChange={(e) => setEditForm(prev => ({ ...prev, languages: e.target.value }))} />
              </div>
            </TabsContent>

            <TabsContent value="pro" className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-spec">Specialization</Label>
                  <Input id="edit-spec" value={editForm.specialization || ''} onChange={(e) => setEditForm(prev => ({ ...prev, specialization: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-exp">Experience (Years)</Label>
                  <Input id="edit-exp" type="number" value={editForm.experience || ''} onChange={(e) => setEditForm(prev => ({ ...prev, experience: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-fee">Consultation Fee</Label>
                  <Input id="edit-fee" type="number" value={editForm.consultationFee || ''} onChange={(e) => setEditForm(prev => ({ ...prev, consultationFee: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                  <Input id="edit-tags" value={editForm.tags || ''} onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-bio">Bio</Label>
                <Textarea id="edit-bio" value={editForm.bio || ''} onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))} rows={4} />
              </div>
            </TabsContent>

            <TabsContent value="career" className="space-y-6 py-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-bold">Education</Label>
                  <Button variant="outline" size="sm" onClick={() => setEditForm(prev => ({
                    ...prev, 
                    education: [...(prev.education || []), { institution: '', degree: '', year: '' }]
                  }))}>Add</Button>
                </div>
                {editForm.education?.map((edu, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-2 p-3 border rounded relative bg-zinc-50">
                    <Input placeholder="Institution" value={edu.institution} onChange={e => {
                      const newEdu = [...(editForm.education || [])];
                      newEdu[idx].institution = e.target.value;
                      setEditForm(prev => ({...prev, education: newEdu}));
                    }} />
                    <Input placeholder="Degree" value={edu.degree} onChange={e => {
                      const newEdu = [...(editForm.education || [])];
                      newEdu[idx].degree = e.target.value;
                      setEditForm(prev => ({...prev, education: newEdu}));
                    }} />
                    <Input placeholder="Year" value={edu.year} onChange={e => {
                      const newEdu = [...(editForm.education || [])];
                      newEdu[idx].year = e.target.value;
                      setEditForm(prev => ({...prev, education: newEdu}));
                    }} />
                    <Button variant="ghost" size="sm" className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-white border text-red-500" onClick={() => {
                      setEditForm(prev => ({...prev, education: prev.education?.filter((_, i) => i !== idx)}));
                    }}><X className="h-3 w-3" /></Button>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-bold">Work History</Label>
                  <Button variant="outline" size="sm" onClick={() => setEditForm(prev => ({
                    ...prev, 
                    workHistory: [...(prev.workHistory || []), { company: '', role: '', duration: '' }]
                  }))}>Add</Button>
                </div>
                {editForm.workHistory?.map((work, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-2 p-3 border rounded relative bg-zinc-50">
                    <Input placeholder="Company" value={work.company} onChange={e => {
                      const newWork = [...(editForm.workHistory || [])];
                      newWork[idx].company = e.target.value;
                      setEditForm(prev => ({...prev, workHistory: newWork}));
                    }} />
                    <Input placeholder="Role" value={work.role} onChange={e => {
                      const newWork = [...(editForm.workHistory || [])];
                      newWork[idx].role = e.target.value;
                      setEditForm(prev => ({...prev, workHistory: newWork}));
                    }} />
                    <Input placeholder="Duration" value={work.duration} onChange={e => {
                      const newWork = [...(editForm.workHistory || [])];
                      newWork[idx].duration = e.target.value;
                      setEditForm(prev => ({...prev, workHistory: newWork}));
                    }} />
                    <Button variant="ghost" size="sm" className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-white border text-red-500" onClick={() => {
                      setEditForm(prev => ({...prev, workHistory: prev.workHistory?.filter((_, i) => i !== idx)}));
                    }}><X className="h-3 w-3" /></Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="services" className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <Label className="text-base font-bold">Consultation Services</Label>
                <Button variant="outline" size="sm" onClick={() => setEditForm(prev => ({
                  ...prev, 
                  services: [...(prev.services || []), { name: '', duration: 60, videoPrice: '', clinicPrice: '', currency: 'INR', description: '' }]
                }))}>Add Service</Button>
              </div>
              {editForm.services?.map((service, idx) => (
                <div key={idx} className="space-y-3 p-4 border rounded bg-zinc-50 relative">
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Service Name" value={service.name} onChange={e => {
                      const newS = [...(editForm.services || [])];
                      newS[idx].name = e.target.value;
                      setEditForm(prev => ({...prev, services: newS}));
                    }} />
                    <Input type="number" placeholder="Duration (min)" value={service.duration} onChange={e => {
                      const newS = [...(editForm.services || [])];
                      newS[idx].duration = Number(e.target.value);
                      setEditForm(prev => ({...prev, services: newS}));
                    }} />
                    <Input type="number" placeholder="Video Price" value={service.videoPrice} onChange={e => {
                      const newS = [...(editForm.services || [])];
                      newS[idx].videoPrice = e.target.value;
                      setEditForm(prev => ({...prev, services: newS}));
                    }} />
                    <Input type="number" placeholder="Clinic Price" value={service.clinicPrice} onChange={e => {
                      const newS = [...(editForm.services || [])];
                      newS[idx].clinicPrice = e.target.value;
                      setEditForm(prev => ({...prev, services: newS}));
                    }} />
                  </div>
                  <Button variant="ghost" size="sm" className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-white border text-red-500" onClick={() => {
                    setEditForm(prev => ({...prev, services: prev.services?.filter((_, i) => i !== idx)}));
                  }}><X className="h-3 w-3" /></Button>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4 py-2">
              <div className="grid gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                  const daySlot = editForm.availability?.find(s => s.dayOfWeek === day);
                  const isActive = !!daySlot;
                  return (
                    <div key={day} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <Switch checked={isActive} onCheckedChange={(checked) => {
                          if (checked) {
                            setEditForm(prev => ({ ...prev, availability: [...(prev.availability || []), { dayOfWeek: day, startTime: '09:00', endTime: '17:00' }] }));
                          } else {
                            setEditForm(prev => ({ ...prev, availability: prev.availability?.filter(s => s.dayOfWeek !== day) }));
                          }
                        }} />
                        <span className="font-medium text-sm">{day}</span>
                      </div>
                      {isActive && (
                        <div className="flex items-center gap-2">
                          <Input type="time" className="h-8 w-28" value={daySlot.startTime} onChange={e => {
                            const newA = editForm.availability?.map(s => s.dayOfWeek === day ? { ...s, startTime: e.target.value } : s);
                            setEditForm(prev => ({ ...prev, availability: newA }));
                          }} />
                          <span className="text-xs">to</span>
                          <Input type="time" className="h-8 w-28" value={daySlot.endTime} onChange={e => {
                            const newA = editForm.availability?.map(s => s.dayOfWeek === day ? { ...s, endTime: e.target.value } : s);
                            setEditForm(prev => ({ ...prev, availability: newA }));
                          }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="social" className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>LinkedIn</Label>
                  <Input value={editForm.socialLinks?.linkedin || ''} onChange={e => setEditForm(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, linkedin: e.target.value } }))} placeholder="https://linkedin.com/in/..." />
                </div>
                <div className="space-y-2">
                  <Label>Twitter</Label>
                  <Input value={editForm.socialLinks?.twitter || ''} onChange={e => setEditForm(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, twitter: e.target.value } }))} placeholder="https://twitter.com/..." />
                </div>
                <div className="space-y-2">
                  <Label>Instagram</Label>
                  <Input value={editForm.socialLinks?.instagram || ''} onChange={e => setEditForm(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, instagram: e.target.value } }))} placeholder="https://instagram.com/..." />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input value={editForm.socialLinks?.website || ''} onChange={e => setEditForm(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, website: e.target.value } }))} placeholder="https://..." />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="docs" className="space-y-4 py-2">
              <p className="text-sm text-zinc-500">Documents are managed separately. Please use the verification section for document updates.</p>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setEditProfileOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProfile} className="bg-indigo-600 hover:bg-indigo-700">
              Save Expert Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Profile Modal */}
      <Dialog open={viewProfileOpen} onOpenChange={setViewProfileOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Expert Profile Details</DialogTitle>
          </DialogHeader>
          {selectedExpert && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedExpert.avatar} alt={selectedExpert.name} />
                  <AvatarFallback>{selectedExpert.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedExpert.name}</h3>
                  <p className="text-sm text-gray-500">{selectedExpert.username}</p>
                  <Badge variant={selectedExpert.status === 'active' ? 'default' : 'secondary'}>
                    {selectedExpert.status}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-sm">{selectedExpert.email || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phone</Label>
                  <p className="text-sm">{selectedExpert.phone || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Rating</Label>
                  <p className="text-sm flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    {selectedExpert.rating}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Total Bookings</Label>
                  <p className="text-sm">{selectedExpert.totalBookings}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Services</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedExpert.services.map((service, index) => (
                    <Badge key={index} variant="outline">{service}</Badge>
                  ))}
                </div>
              </div>
              
              {selectedExpert.bio && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Bio</Label>
                  <p className="text-sm mt-1">{selectedExpert.bio}</p>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Available Timings</Label>
                <div className="bg-gray-50 rounded-lg p-3 mt-1">
                  {selectedExpert.timings.length > 0 ? (
                    <div className="space-y-1">
                      {selectedExpert.timings.map((timing, index) => (
                        <div key={index} className="text-sm">
                          {timing.day} – {timing.time}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No timings added</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Display Picture Modal */}
      <Dialog open={changeDPOpen} onOpenChange={setChangeDPOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Display Picture</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={imagePreview || newAvatar} alt="Preview" />
                <AvatarFallback>Preview</AvatarFallback>
              </Avatar>
            </div>
            
            {/* File Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="image-upload">Upload Image</Label>
              <div className="flex items-center space-x-2">
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Image
                </Button>
                {uploadedImageFile && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleImageRemove}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {uploadedImageFile && (
                <p className="text-sm text-green-600">
                  Selected: {uploadedImageFile.name} ({(uploadedImageFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
            
            {/* URL Input Section */}
            <div className="space-y-2">
              <Label htmlFor="avatar-url">Or enter Image URL</Label>
              <Input
                id="avatar-url"
                value={newAvatar || ''}
                onChange={(e) => {
                  setNewAvatar(e.target.value);
                  if (!uploadedImageFile) {
                    setImagePreview(e.target.value);
                  }
                }}
                placeholder="Enter image URL"
              />
            </div>
            
            <div className="text-xs text-gray-500">
              Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setChangeDPOpen(false);
              handleImageRemove();
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveDP}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Video Modal */}
      <Dialog open={changeVideoOpen} onOpenChange={setChangeVideoOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Change Introduction Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* File Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="video-upload">Upload Video</Label>
              <div className="flex items-center space-x-2">
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => document.getElementById('video-upload')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Video
                </Button>
                {uploadedVideoFile && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleVideoRemove}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {uploadedVideoFile && (
                <p className="text-sm text-green-600">
                  Selected: {uploadedVideoFile.name} ({(uploadedVideoFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
            
            {/* URL Input Section */}
            <div className="space-y-2">
              <Label htmlFor="video-url">Or enter Video URL</Label>
              <Input
                id="video-url"
                value={newVideo || ''}
                onChange={(e) => setNewVideo(e.target.value)}
                placeholder="Enter video URL (YouTube, Vimeo, etc.)"
              />
            </div>
            
            {/* Video Preview */}
            {(videoPreview || newVideo) && (
              <div className="space-y-2">
                <Label>Video Preview</Label>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  {videoPreview ? (
                    <video 
                      src={videoPreview} 
                      controls 
                      className="w-full h-full object-cover"
                    />
                  ) : newVideo ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Video URL: {newVideo}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="text-xs text-gray-500">
              Supported formats: MP4, WebM, OGG (Max 50MB)
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setChangeVideoOpen(false);
              handleVideoRemove();
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveVideo}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Timings Modal */}
      <Dialog open={changeTimingsOpen} onOpenChange={setChangeTimingsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Expert Timings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {timingSlots.map((slot) => (
              <div key={slot.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="flex items-center space-x-2 flex-1">
                  <input
                    type="checkbox"
                    checked={slot.isAvailable}
                    onChange={() => handleTimingToggle(slot.id)}
                    className="h-4 w-4"
                  />
                  <Label className="font-medium w-12">{slot.day}</Label>
                </div>
                {slot.isAvailable && (
                  <>
                    <Select
                      value={slot.startTime}
                      onValueChange={(value) => handleTimingTimeChange(slot.id, 'startTime', value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-500">to</span>
                    <Select
                      value={slot.endTime}
                      onValueChange={(value) => handleTimingTimeChange(slot.id, 'endTime', value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
                {!slot.isAvailable && (
                  <span className="text-sm text-gray-500 italic">Not Available</span>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeTimingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTimings}>
              Save Timings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
