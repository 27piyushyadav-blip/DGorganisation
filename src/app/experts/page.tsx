'use client';

import { useState } from 'react';

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
  menu,
  Menu,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import AddExpertModal from '@/components/expert/AddExpertModal';

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
  services?: string; // String for form input
}

interface TimingSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export default function ExpertsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('all');
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [experts, setExperts] = useState<Expert[]>([
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      username: '@dr_sarah_consulting',
      avatar: '/avatars/sarah.jpg',
      status: 'active',
      rating: 4.8,
      timings: [
        { day: 'Mon', time: '9AM - 5PM' },
        { day: 'Wed', time: '9AM - 5PM' },
        { day: 'Fri', time: '9AM - 5PM' },
      ],
      totalBookings: 45,
      revenue: 1250,
      services: ['Business Consulting', 'Strategy Planning'],
      email: 'sarah.johnson@example.com',
      phone: '+1 234-567-8900',
      bio: 'Experienced business consultant with 10+ years helping companies grow.',
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      username: '@dr_michael_advisor',
      avatar: '/avatars/michael.jpg',
      status: 'active',
      rating: 4.6,
      timings: [
        { day: 'Tue', time: '10AM - 6PM' },
        { day: 'Thu', time: '10AM - 6PM' },
        { day: 'Sat', time: '10AM - 2PM' },
      ],
      totalBookings: 38,
      revenue: 980,
      services: ['Financial Advisory', 'Investment Planning'],
      email: 'michael.chen@example.com',
      phone: '+1 234-567-8901',
      bio: 'Financial expert specializing in investment strategies and wealth management.',
    },
    {
      id: 3,
      name: 'Dr. Emily Davis',
      username: '@dr_emily_expert',
      avatar: '/avatars/emily.jpg',
      status: 'active',
      rating: 4.9,
      timings: [],
      totalBookings: 52,
      revenue: 1450,
      services: ['Legal Consulting', 'Compliance Advisory'],
      email: 'emily.davis@example.com',
      phone: '+1 234-567-8902',
      bio: 'Legal consultant with expertise in corporate law and regulatory compliance.',
    },
    {
      id: 4,
      name: 'Dr. Robert Wilson',
      username: '@dr_robert_consultant',
      avatar: '/avatars/robert.jpg',
      status: 'hidden',
      rating: 4.7,
      timings: [
        { day: 'Mon', time: '1PM - 8PM' },
        { day: 'Fri', time: '1PM - 8PM' },
      ],
      totalBookings: 28,
      revenue: 720,
      services: ['Technology Consulting', 'Digital Transformation'],
      email: 'robert.wilson@example.com',
      phone: '+1 234-567-8903',
      bio: 'Technology consultant helping businesses with digital transformation.',
    },
  ]);

  // Modal states
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [viewProfileOpen, setViewProfileOpen] = useState(false);
  const [changeDPOpen, setChangeDPOpen] = useState(false);
  const [changeVideoOpen, setChangeVideoOpen] = useState(false);
  const [changeTimingsOpen, setChangeTimingsOpen] = useState(false);
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
  const [addExpertModalOpen, setAddExpertModalOpen] = useState(false);

  const filteredExperts = experts.filter((expert) => {
    const matchesSearch =
      expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesView = viewMode === 'all' || 
      (viewMode === 'active' && expert.status === 'active') ||
      (viewMode === 'hidden' && expert.status === 'hidden');
    
    return matchesSearch && matchesView;
  });


  // Add this new handler for adding experts
  const handleAddExpert = async (expertData: any) => {
    // Transform the form data to match your Expert interface
    const newExpert: Expert = {
      id: experts.length + 1,
      name: expertData.name,
      username: expertData.username,
      avatar: '/avatars/default.jpg', // Default avatar
      status: 'active',
      rating: 0, // Will be updated later
      timings: expertData.availability.map((avail: any) => ({
        day: avail.dayOfWeek.slice(0, 3), // Convert "Monday" to "Mon"
        time: `${avail.startTime} - ${avail.endTime}`
      })),
      totalBookings: 0,
      revenue: 0,
      services: expertData.services.map((service: any) => service.name),
      email: expertData.email,
      phone: '', // Not in form, can be added later
      bio: expertData.bio,
    };
    
    setExperts(prev => [...prev, newExpert]);
    console.log('New expert added:', expertData);
  };

  // Handler functions
  const handleEditProfile = (expert: Expert) => {
    setSelectedExpert(expert);
    setEditForm({
      name: expert.name,
      username: expert.username,
      email: expert.email,
      phone: expert.phone,
      bio: expert.bio,
      services: expert.services.join(', '), // Convert array to string for form
    });
    setEditProfileOpen(true);
    setOpenDropdownId(null);
  };

  const handleViewProfile = (expert: Expert) => {
    setSelectedExpert(expert);
    setViewProfileOpen(true);
    setOpenDropdownId(null);
  };

  const handleChangeDP = (expert: Expert) => {
    setSelectedExpert(expert);
    setNewAvatar(expert.avatar);
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
        startTime: '9AM',
        endTime: '5PM',
        isAvailable: false,
      };
    });
    
    setTimingSlots(slots);
    setChangeTimingsOpen(true);
    setOpenDropdownId(null);
  };

  const handleToggleProfileStatus = (expert: Expert) => {
    setExperts(prev => prev.map(e => 
      e.id === expert.id 
        ? { ...e, status: e.status === 'active' ? 'hidden' : 'active' }
        : e
    ));
    setOpenDropdownId(null);
  };

  const handleDisconnectExpert = (expert: Expert) => {
    if (confirm(`Are you sure you want to disconnect ${expert.name}? This action cannot be undone.`)) {
      setExperts(prev => prev.filter(e => e.id !== expert.id));
      setOpenDropdownId(null);
    }
  };

  const handleSaveProfile = () => {
    if (!selectedExpert) return;
    
    setExperts(prev => prev.map(e => 
      e.id === selectedExpert.id 
        ? { 
            ...e, 
            name: editForm.name || e.name,
            username: editForm.username || e.username,
            email: editForm.email || e.email,
            phone: editForm.phone || e.phone,
            bio: editForm.bio || e.bio,
            services: editForm.services?.split(',').map((s: string) => s.trim()).filter((s: string) => s) || e.services
          }
        : e
    ));
    setEditProfileOpen(false);
  };

  const handleSaveTimings = () => {
    if (!selectedExpert) return;
    
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
    setChangeTimingsOpen(false);
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
  const handleSaveDP = () => {
    if (!selectedExpert) return;
    
    let finalAvatarUrl = newAvatar;
    
    // If we have an uploaded file, in a real app you would upload it to a server
    if (uploadedImageFile) {
      // For demo purposes, we'll use the preview URL
      // In production, you would upload to cloud storage and get the URL
      console.log('Uploading image:', uploadedImageFile.name);
      finalAvatarUrl = imagePreview;
    }
    
    setExperts(prev => prev.map(e => 
      e.id === selectedExpert.id 
        ? { ...e, avatar: finalAvatarUrl }
        : e
    ));
    
    // Reset states
    setUploadedImageFile(null);
    setImagePreview('');
    setChangeDPOpen(false);
  };

  const handleSaveVideo = () => {
    if (!selectedExpert) return;
    
    let finalVideoUrl = newVideo;
    
    // If we have an uploaded file, in a real app you would upload it to a server
    if (uploadedVideoFile) {
      // For demo purposes, we'll use the preview URL
      // In production, you would upload to cloud storage and get the URL
      console.log('Uploading video:', uploadedVideoFile.name);
      finalVideoUrl = videoPreview;
    }
    
    setExperts(prev => prev.map(e => 
      e.id === selectedExpert.id 
        ? { ...e, videoUrl: finalVideoUrl }
        : e
    ));
    
    // Reset states
    setUploadedVideoFile(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview('');
    setChangeVideoOpen(false);
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
          <button className="w-full px-4 py-2.5 border bg-card text-card-foreground font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 cursor-pointer max-w-[10rem] flex bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white"
          onClick={() => setAddExpertModalOpen(true)}
          >
            <Plus className="h-6 w-6 text-white" />
                      Add Expert
                    </button>
        </div>
        
      </div>

      <div className="flex flex-wrap gap-4">
        {filteredExperts.map((expert) => (
          <Card key={expert.id} className="w-[280px] shadow-sm border-[#f79a4e] bg-[var(--card-bg)]">
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
                    className="h-8 w-8 p-0 bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] cursor-pointer"
                    onClick={() => setOpenDropdownId(openDropdownId === expert.id ? null : expert.id)}
                  >
                    <Menu className="h-4 w-4 cursor-pointer text-white" />
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
              <div className="flex flex-col items-center mb-6 ">
                <Avatar className="h-20 w-20 ">
                  <AvatarImage src={expert.avatar} alt={expert.name} />
                  <AvatarFallback className="text-lg bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white">
                    {expert.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/*Edit Section */}
              {/* <div className="space-y-3 mb-5">
                <div className="flex items-center">
                  <div className="flex justify-between w-full text-2xl font-medium text-gray-700">
                    <Edit className="h-5 w-5 cursor-pointer" />
                    <Eye className="h-5 w-5 cursor-pointer" />
                    <User className="h-5 w-5 cursor-pointer" />
                    <Video className="h-5 w-5 cursor-pointer" />
                    <Calendar className="h-5 w-5 cursor-pointer" />
                    <CalendarDays className="h-5 w-5 cursor-pointer" />
                  </div>
                </div>
              </div> */}

              <div className="space-y-3 mb-5">
  <div className="flex items-center">
    <div className="flex justify-between w-full text-gray-700">

      {[
        { icon: Edit, label: "Edit",onClick: () => handleEditProfile(expert) },
        { icon: Eye, label: "View",onClick: () => handleViewProfile(expert)  },
        { icon: User, label: "Image" ,onClick: () => handleChangeDP(expert) },
        { icon: Video, label: "Video",onClick: () => handleChangeVideo(expert)  },
        { icon: Calendar, label: "Timing",onClick: () => handleChangeTimings(expert)  },
        { icon: CalendarDays, label: "Details",onClick: () => redirect(`/experts/${expert.id}/booking-details`)  },
      ].map(({ icon: Icon, label,onClick }) => (
        <div key={label} className="relative group flex flex-col items-center">
          <Icon className="h-5 w-5 cursor-pointer" onClick={onClick}/>

          <span className="absolute bottom-8 scale-0 group-hover:scale-100 transition bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white text-xs rounded px-2 py-1">
            {label}
          </span>
        </div>
      ))}

    </div>
  </div>
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
                
                <div className='bg-gradient-to-r from-[var(--primary-start)]  p-0.5 rounded-lg'>
                <div className="bg-gray-50 rounded-lg p-3">
                  {expert.timings.length > 0 ? (
                    <div className="space-y-2">
                      {expert.timings.map((timing, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          <span className='text-[var(--primary-end)]'>{timing.day}</span> – {timing.time}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No timings added</div>
                  )}
                </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* <Card className="w-[280px] border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer shadow-sm border-gray-100">
          <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[280px]">
            <div className="bg-primary/10 rounded-full p-4 mb-4">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg text-gray-900">Add New Expert</h3>
            <p className="text-sm text-gray-500 text-center mt-2">
              Invite an expert to join your organization
            </p>
          </CardContent>
        </Card> */}
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Expert Profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={editForm.name || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                value={editForm.username || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={editForm.email || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={editForm.phone || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="services" className="text-right">
                Services
              </Label>
              <Input
                id="services"
                value={editForm.services || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, services: e.target.value }))}
                placeholder="Comma separated"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bio" className="text-right">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={editForm.bio || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveProfile}>
              Save Changes
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
                value={newAvatar}
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
                value={newVideo}
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
                        {['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM'].map(time => (
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
                        {['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM'].map(time => (
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

      <AddExpertModal
        isOpen={addExpertModalOpen}
        onClose={() => setAddExpertModalOpen(false)}
        onAddExpert={handleAddExpert}
      />
    </div>
  );
}
