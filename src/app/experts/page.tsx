'use client';

import { useEffect, useState } from 'react';
import {Toaster , toast } from 'sonner';

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
import AddExpertModal, { AddExpertFormData } from '@/components/expert/AddEditExpertModal';
import ChangeExpertTimingsModal from '@/components/expert/ChangeExpertTimingsModal';
import  AddEditExpertModal  from '@/components/expert/AddEditExpertModal';
import { createExpertApi, deleteExpertApi, getExpertDetailsApi, GetExpertDetailsResponse, getExpertsApi, updateExpertApi, updateExpertTimingsApi, uploadExpertAvatarApi, uploadExpertVideoApi } from '@/client/api/experts';
import { showConfirmDialog } from '@/components/ui/confirm-dialog';
import Swal from 'sweetalert2';

interface ExpertAvailability {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

interface ExpertEducation {
  degree: string;
  institution: string;
  year: number;
}

interface ExpertService {
  name: string;
  price: number;
  duration: number;
}

interface ExpertTiming {
  day: string;
  time: string;
}

interface ExpertWorkHistory {
  company: string;
  position: string;
  period: string;
}

interface Expert {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar: string;
  bio: string;
  specialization: string;
  consultationFee: string;
  experience: number;
  status: 'active' | 'inactive' | 'hidden';
  languages: string[];
  tags: string[];
  availability: ExpertAvailability[];
  education: ExpertEducation[];
  services: ExpertService[];  // This should be array of objects
  timings: ExpertTiming[];
  workHistory: ExpertWorkHistory[];
  createdAt: string;
  joinedAt: string;
  totalBookings: number;
  revenue: number;
  rating?: number;  // Add this if missing
  videoUrl?: string;  // Add this if missing
  phone?: string;  // Add this if missing
}

const createDefaultExpertFromForm = (
  expertData: AddExpertFormData,
  createdId: string
): Expert => ({
  id: createdId,
  name: expertData.name,
  email: expertData.email,
  username: expertData.username.startsWith('@')
    ? expertData.username
    : `@${expertData.username}`,
  avatar: '/avatars/default.jpg',
  bio: expertData.bio,
  specialization: expertData.specialization,
  consultationFee: expertData.consultationFee.toString(),
  experience: expertData.experience,
  status: 'active',
  languages: expertData.languages,
  tags: expertData.tags,
  availability: expertData.availability,
  education: expertData.education,
  services: expertData.services,
  timings: expertData.availability.map((avail) => ({
    day: avail.dayOfWeek.slice(0, 3),
    time: `${avail.startTime} - ${avail.endTime}`,
  })),
  workHistory: expertData.workHistory,
  createdAt: '',
  joinedAt: '',
  totalBookings: 0,
  revenue: 0,
  rating: 0,
  videoUrl: '',
  phone: expertData.phone ?? '',
});

function parseServicesInput(servicesText: string | undefined, fallback: ExpertService[]): ExpertService[] {
  if (!servicesText) return fallback;

  return servicesText
    .split(',')
    .map((service) => service.trim())
    .filter(Boolean)
    .map((name, index) => {
      const existingService = fallback[index];

      return {
        name,
        price: existingService?.price ?? 0,
        duration: existingService?.duration ?? 60,
      };
    });
}

interface ExpertsApiResponse {
  experts: Expert[];
  active: number;
  inactive: number;
  total: number;
}

interface EditFormData {
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  bio?: string;
  services?: string; // String for form input
}

type ApiRecord = Record<string, unknown>;

const dayShortMap: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown, fallback: string = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback: number = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizeServices(value: unknown): ExpertService[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((service) => {
      if (isRecord(service)) {
        return {
          name: asString(service.name, asString(service.title, '')),
          price: asNumber(service.price, asNumber(service.cost, 0)),
          duration: asNumber(service.duration, asNumber(service.time, 60))
        };
      }
      return null;
    })
    .filter((service): service is ExpertService => service !== null && service.name !== '');
}

function normalizeTimings(value: unknown): { day: string; time: string }[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((slot) => {
      if (!isRecord(slot)) return null;

      const dayOfWeek = asString(slot.dayOfWeek, asString(slot.day, ''));
      const startTime = asString(slot.startTime, '');
      const endTime = asString(slot.endTime, '');
      const time = asString(slot.time, '');

      if (dayOfWeek && startTime && endTime) {
        return {
          day: dayShortMap[dayOfWeek] ?? dayOfWeek.slice(0, 3),
          time: `${startTime} - ${endTime}`,
        };
      }

      if (dayOfWeek && time) {
        return {
          day: dayShortMap[dayOfWeek] ?? dayOfWeek.slice(0, 3),
          time,
        };
      }

      if (startTime && endTime) {
        return {
          day: dayShortMap[dayOfWeek] ?? dayOfWeek.slice(0, 3),
          time: `${startTime} - ${endTime}`,
        };
      }

      return null;
    })
    .filter((slot): slot is { day: string; time: string } => slot !== null);
}

function normalizeExpert(apiExpert: unknown): Expert | null {
  if (!isRecord(apiExpert)) return null;

  const id = apiExpert.id;
  if (typeof id !== 'string' && typeof id !== 'number') {
    return null;
  }

  const firstName = asString(apiExpert.firstName, '');
  const lastName = asString(apiExpert.lastName, '');
  const fullName = `${firstName} ${lastName}`.trim();
  const name = asString(apiExpert.name, fullName || 'Unnamed Expert');
  const rawUsername = asString(apiExpert.username, '');
  const email = asString(apiExpert.email, '');
  const phone = asString(apiExpert.phone, asString(apiExpert.mobile, ''));
  const bio = asString(apiExpert.bio, asString(apiExpert.description, ''));
  const avatar = asString(
    apiExpert.avatarUrl,
    asString(apiExpert.avatar, asString(apiExpert.profilePicture, '/avatars/default.jpg'))
  );
  const videoUrl = asString(apiExpert.videoUrl, asString(apiExpert.introductionVideo, ''));
  const services = normalizeServices(
  Array.isArray(apiExpert.services)
    ? apiExpert.services
    : Array.isArray(apiExpert.tags)
      ? apiExpert.tags
      : []
);
  const timings = normalizeTimings(
    Array.isArray(apiExpert.availability)
      ? apiExpert.availability
      : Array.isArray(apiExpert.timings)
        ? apiExpert.timings
        : []
  );

  const statusValue = asString(apiExpert.status, '').toLowerCase();
  const status: Expert['status'] =
    statusValue === 'hidden' || apiExpert.isHidden === true ? 'hidden' : 'active';

  return {
    id: typeof id === 'number' ? id.toString() : id,
    name,
    email: email || '',
    username: rawUsername ? (rawUsername.startsWith('@') ? rawUsername : `@${rawUsername}`) : '@expert',
    avatar,
    bio: bio || '',
    specialization: asString(apiExpert.specialization, ''),
    consultationFee: String(apiExpert.consultationFee ?? ''),
    experience: asNumber(apiExpert.experience, 0),
    status,
    languages: Array.isArray(apiExpert.languages)
      ? apiExpert.languages.filter((language): language is string => typeof language === 'string')
      : [],
    tags: Array.isArray(apiExpert.tags)
      ? apiExpert.tags.filter((tag): tag is string => typeof tag === 'string')
      : [],
    availability: Array.isArray(apiExpert.availability)
      ? apiExpert.availability
          .map((slot) => {
            if (!isRecord(slot)) return null;

            const dayOfWeek = asString(slot.dayOfWeek, asString(slot.day, ''));
            const startTime = asString(slot.startTime, '');
            const endTime = asString(slot.endTime, '');

            if (!dayOfWeek || !startTime || !endTime) return null;

            return { dayOfWeek, startTime, endTime };
          })
          .filter((slot): slot is ExpertAvailability => slot !== null)
      : [],
    education: Array.isArray(apiExpert.education)
      ? apiExpert.education
          .map((entry) => {
            if (!isRecord(entry)) return null;

            return {
              degree: asString(entry.degree, ''),
              institution: asString(entry.institution, ''),
              year: asNumber(entry.year, new Date().getFullYear()),
            };
          })
          .filter((entry): entry is ExpertEducation => entry !== null)
      : [],
    services,
    timings,
    workHistory: Array.isArray(apiExpert.workHistory)
      ? apiExpert.workHistory
          .map((entry) => {
            if (!isRecord(entry)) return null;

            return {
              company: asString(entry.company, ''),
              position: asString(entry.position, ''),
              period: asString(entry.period, ''),
            };
          })
          .filter((entry): entry is ExpertWorkHistory => entry !== null)
      : [],
    createdAt: asString(apiExpert.createdAt, ''),
    joinedAt: asString(apiExpert.joinedAt, asString(apiExpert.createdAt, '')),
    totalBookings: asNumber(
      apiExpert.totalBookings,
      asNumber(apiExpert.bookingCount, asNumber(apiExpert.bookingsCount, 0))
    ),
    revenue: asNumber(
      apiExpert.revenue,
      asNumber(apiExpert.totalRevenue, asNumber(apiExpert.earnings, 0))
    ),
    rating: asNumber(apiExpert.rating, asNumber(apiExpert.averageRating, 0)),
    videoUrl: videoUrl || '',
    phone: phone || '',
  };
}

function extractExperts(response: unknown): Expert[] {
  const list = Array.isArray(response)
    ? response
    : isRecord(response) && Array.isArray(response.data)
      ? response.data
      : isRecord(response) && Array.isArray(response.items)
        ? response.items
        : isRecord(response) && isRecord(response.data) && Array.isArray(response.data.items)
          ? response.data.items
          : [];

  return list
    .map((expert) => normalizeExpert(expert))
    .filter((expert): expert is Expert => expert !== null);
}

export default function ExpertsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('all');
  const [openDropdownId, setOpenDropdownId] = useState<number | string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [isLoadingExperts, setIsLoadingExperts] = useState(true);
  const [expertsError, setExpertsError] = useState('');

  // Modal states
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [viewProfileOpen, setViewProfileOpen] = useState(false);
  const [changeDPOpen, setChangeDPOpen] = useState(false);
  const [changeVideoOpen, setChangeVideoOpen] = useState(false);
  const [changeTimingsOpen, setChangeTimingsOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  
  // Form states
  const [editForm, setEditForm] = useState<EditFormData>({});
  const [newAvatar, setNewAvatar] = useState<string>('');
  const [newVideo, setNewVideo] = useState<string>('');
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [uploadedVideoFile, setUploadedVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [addExpertModalOpen, setAddExpertModalOpen] = useState(false);
  const [getExpertId, setGetExpertId] = useState<number | string | null>(null);

  // Add state for edit mode
const [editingExpert, setEditingExpert] = useState<AddExpertFormData | null>(null);
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [viewExpertDetails, setViewExpertDetails] = useState<GetExpertDetailsResponse | null>(null);
const [isLoadingViewDetails, setIsLoadingViewDetails] = useState(false);
const [isSaving, setIsSaving] = useState(false);

  const filteredExperts = experts.filter((expert) => {
    const matchesSearch =
      expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesView = viewMode === 'all' || 
      (viewMode === 'active' && expert.status === 'active') ||
      (viewMode === 'hidden' && expert.status === 'hidden');
    
    return matchesSearch && matchesView;
  });

  const formatUsername = (username: string) =>
    username.startsWith('@') ? username : `@${username}`;

  const getNextExpertId = () =>
    experts.reduce((maxId, expert) => {
      const numericId =
        typeof expert.id === 'number' ? expert.id : Number.parseInt(expert.id, 10);

      return Number.isNaN(numericId) ? maxId : Math.max(maxId, numericId);
    }, 0) + 1;

  const fetchExperts = async () => {
    try {
      setIsLoadingExperts(true);
      setExpertsError('');

      const response = await getExpertsApi() as ExpertsApiResponse;
      console.log('Raw API response:', response);
      setExperts(extractExperts(response.experts));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load experts';
      setExpertsError(message);
      toast.error(message);
    } finally {
      setIsLoadingExperts(false);
    }
  };

  useEffect(() => {
    void fetchExperts();
  }, []);

  // Add this new handler for adding experts
  const handleAddExpert = async (expertData: AddExpertFormData) => {
    try {
      const createdExpert = await createExpertApi(expertData);

      const createdExpertId = String(createdExpert.id ?? getNextExpertId());
      const newExpert = createDefaultExpertFromForm(expertData, createdExpertId);

      setExperts(prev => [...prev, newExpert]);
      void fetchExperts();
      toast.success('Expert created successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create expert';
      toast.error(message);
      throw error;
    }
  };

  // Add these helper functions to transform API data to form data
const transformApiToFormData = (apiData: GetExpertDetailsResponse): AddExpertFormData => {
  return {
    name: apiData.name || '',
    email: apiData.email || '',
    username: apiData.username?.replace('@', '') || '',
    phone: apiData.phone || '',
    bio: apiData.bio || '',
    specialization: apiData.specialization || '',
    experience: apiData.experience || 0,
    consultationFee: apiData.consultationFee || 0,
    education: apiData.education?.length ? apiData.education : [{ degree: '', institution: '', year: new Date().getFullYear() }],
    workHistory: apiData.workHistory?.length ? apiData.workHistory : [{ company: '', position: '', period: '' }],
    availability: apiData.availability?.length ? apiData.availability : [{ dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' }],
    languages: apiData.languages || [],
    socialLinks: {
      linkedin: apiData.socialLinks?.linkedin || '',
    },
    tags: apiData.tags || [],
    services: apiData.services?.length ? apiData.services : [{ name: '', price: 0, duration: 60 }],
    timezone: apiData.timezone || '',
    gender: apiData.gender as any || undefined,
    location: apiData.location || '',
  };
};

// Add state for loading expert details
const [isLoadingExpertDetails, setIsLoadingExpertDetails] = useState(false);

// Update handleEditProfile to fetch and populate data
const handleEditProfile = async (expert: Expert) => {
  setOpenDropdownId(null);
  setIsLoadingExpertDetails(true);
  
  try {
    // Fetch full expert details from API
    const expertDetails = await getExpertDetailsApi(expert.id);
    
    // Transform API response to form data
    const formData = transformApiToFormData(expertDetails);
    
    setEditingExpert(formData);
    setSelectedExpert(expert);
    setIsEditModalOpen(true);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load expert details';
    toast.error(message);
  } finally {
    setIsLoadingExpertDetails(false);
  }
};

// Common save handler for both add and edit
// Update the save handler to differentiate between create and update
const handleSaveExpert = async (data: AddExpertFormData) => {
  setIsSaving(true);
  try {
    if (editingExpert && selectedExpert) {
      // Call update API for existing expert
      await updateExpertApi(selectedExpert.id.toString(), data);
      toast.success('Expert updated successfully');
    } else {
      // Call create API for new expert
      await createExpertApi(data);
      toast.success('Expert created successfully');
    }
    
    // Refresh the experts list
    await fetchExperts();
    
    // Close modal and reset states
    setIsEditModalOpen(false);
    setAddExpertModalOpen(false);
    setEditingExpert(null);
    setSelectedExpert(null);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save expert';
    toast.error(message);
    throw error;
  } finally {
    setIsSaving(false);
  }
};

  const handleViewProfile = async (expert: Expert) => {
  setOpenDropdownId(null);
  setIsLoadingViewDetails(true);
  
  try {
    // Fetch full expert details from API
    const expertDetails = await getExpertDetailsApi(expert.id);
    setViewExpertDetails(expertDetails);
    setSelectedExpert(expert);
    setViewProfileOpen(true);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load expert details';
    toast.error(message);
  } finally {
    setIsLoadingViewDetails(false);
  }
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

    const handleDisconnectExpert = async (expert: Expert) => {
      const confirmed = await showConfirmDialog({
        title: 'Delete Expert',
        text: `Are you sure you want to delete ${expert.name}? This action cannot be undone.`,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        icon: 'warning'
      });

      if (confirmed) {
        // Show loading
        Swal.fire({
          title: 'Deleting...',
          text: 'Please wait',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        try {
          await deleteExpertApi(expert.id);
          
          // Remove from local state
          setExperts(prev => prev.filter(e => e.id !== expert.id));
          
          // Close loading and show success
          Swal.close();
          toast.success(`${expert.name} has been deleted successfully`);
          setOpenDropdownId(null);
        } catch (error) {
          Swal.close();
          const message = error instanceof Error ? error.message : 'Failed to delete expert';
          toast.error(message);
        }
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
            services: parseServicesInput(editForm.services, e.services),
          }
        : e
    ));
    setEditProfileOpen(false);
  };

  const handleSaveTimings = async (
    availability: { dayOfWeek: string; startTime: string; endTime: string }[]
  ) => {
    if (!selectedExpert) return;

    try {
      await updateExpertTimingsApi(selectedExpert.id, { availability });

      const updatedTimings = availability.map((slot) => ({
        day: slot.dayOfWeek.slice(0, 3),
        time: `${slot.startTime} - ${slot.endTime}`,
      }));

      setExperts((prev) =>
        prev.map((expert) =>
          expert.id === selectedExpert.id
            ? { ...expert, timings: updatedTimings }
            : expert
        )
      );
      setChangeTimingsOpen(false);
      toast.success('Expert timings updated successfully');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update expert timings';
      toast.error(message);
      throw error;
    }
  };

  // File upload handlers
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file size should be less than 5MB');
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
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid video file (MP4, WEBM, OGG)');
      return;
    }
    
    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video file size should be less than 50MB');
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

  // Update the handleSaveDP function with loading state
    const handleSaveDP = async () => {
      debugger;
      if (!selectedExpert) return;
      
      setIsUploading(true);
      
      try {
        let finalAvatarUrl = newAvatar;
        
        // If we have an uploaded file, upload it to the server
        if (uploadedImageFile) {
          const response = await uploadExpertAvatarApi(uploadedImageFile,selectedExpert.id);
          
          if (response.fileUrl) {
            finalAvatarUrl = response.fileUrl;
          } else {
            toast.error('Failed to upload image');
            return;
          }
        }
        
        // Update expert with new avatar URL
        setExperts(prev => prev.map(e => 
          e.id === selectedExpert.id 
            ? { ...e, avatar: finalAvatarUrl }
            : e
        ));
        
        // Reset states
        setUploadedImageFile(null);
        setImagePreview('');
        setChangeDPOpen(false);
        toast.success('Profile picture updated successfully');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to upload image';
        toast.error(message);
      } finally {
        setIsUploading(false);
      }
    };

  // Update the handleSaveVideo function with loading state
const handleSaveVideo = async () => {
  if (!selectedExpert) return;
  
  setIsUploading(true);
  
  try {
    let finalVideoUrl = newVideo;
    
    // If we have an uploaded file, upload it to the server
    if (uploadedVideoFile) {
      const response = await uploadExpertVideoApi(uploadedVideoFile, selectedExpert.id);
      
      if (response.fileUrl) {
        finalVideoUrl = response.fileUrl;
      } else {
        toast.error('Failed to upload video');
        return;
      }
    }
    
    // Update expert with new video URL
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
    toast.success('Video updated successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload video';
    toast.error(message);
  } finally {
    setIsUploading(false);
  }
};

  return (
    <div className="flex-1 h-full space-y-6 p-4 pt-6 md:p-8 bg-[var(--card-bg-light)]">
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
        {isLoadingExperts && (
          <div className="w-full rounded-lg border border-dashed border-[var(--primary-start)] bg-white p-6 text-center text-sm text-gray-500">
            Loading experts...
          </div>
        )}

        {!isLoadingExperts && expertsError && (
          <div className="w-full rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-600">{expertsError}</p>
            <Button className="mt-4" onClick={() => void fetchExperts()}>
              Retry
            </Button>
          </div>
        )}

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
                <div className="bg-gray-50 rounded-lg p-3 overflow-y-scroll scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-red-800" style={{height:'6rem'}}>
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

        {!isLoadingExperts && !expertsError && filteredExperts.length === 0 && (
          <div className="w-full rounded-lg border border-dashed border-[var(--primary-start)] bg-white p-6 text-center text-sm text-gray-500">
            No experts found.
          </div>
        )}

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
            <Button type="submit" onClick={handleSaveProfile} >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Profile Modal */}
      {/* View Profile Modal - Updated to show all data from API */}
<Dialog open={viewProfileOpen} onOpenChange={(open) => {
  setViewProfileOpen(open);
  if (!open) setViewExpertDetails(null);
}}>
  <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Expert Profile Details</DialogTitle>
    </DialogHeader>
    
    {isLoadingViewDetails ? (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading expert details...</p>
        </div>
      </div>
    ) : viewExpertDetails ? (
      <div className="space-y-4">
        {/* Basic Info Section */}
        <div className="flex items-center space-x-4 pb-4 border-b">
          <Avatar className="h-16 w-16">
            <AvatarImage src={viewExpertDetails.avatarUrl || selectedExpert?.avatar} alt={viewExpertDetails.name} />
            <AvatarFallback className="text-lg bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white">
              {viewExpertDetails.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{viewExpertDetails.name}</h3>
            <p className="text-sm text-gray-500">{viewExpertDetails.username?.startsWith('@') ? viewExpertDetails.username : `@${viewExpertDetails.username}`}</p>
            <Badge variant={selectedExpert?.status === 'active' ? 'default' : 'secondary'}>
              {selectedExpert?.status}
            </Badge>
          </div>
        </div>
        
        {/* Contact Information */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Contact Information</h4>
          <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-lg p-3">
            <div>
              <Label className="text-xs text-gray-500">Email</Label>
              <p className="text-sm">{viewExpertDetails.email || 'Not provided'}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Phone</Label>
              <p className="text-sm">{viewExpertDetails.phone || 'Not provided'}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Location</Label>
              <p className="text-sm">{viewExpertDetails.location || 'Not provided'}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Timezone</Label>
              <p className="text-sm">{viewExpertDetails.timezone || 'Not provided'}</p>
            </div>
          </div>
        </div>
        
        {/* Professional Details */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Professional Details</h4>
          <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-lg p-3">
            <div>
              <Label className="text-xs text-gray-500">Specialization</Label>
              <p className="text-sm">{viewExpertDetails.specialization || 'Not provided'}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Experience</Label>
              <p className="text-sm">{viewExpertDetails.experience} years</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Consultation Fee</Label>
              <p className="text-sm">₹{viewExpertDetails.consultationFee}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Rating</Label>
              <p className="text-sm flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                {selectedExpert?.rating || 0}
              </p>
            </div>
          </div>
        </div>
        
        {/* Bio */}
        {viewExpertDetails.bio && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Bio</h4>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm">{viewExpertDetails.bio}</p>
            </div>
          </div>
        )}
        
        {/* Languages */}
        {viewExpertDetails.languages && viewExpertDetails.languages.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Languages</h4>
            <div className="flex flex-wrap gap-2">
              {viewExpertDetails.languages.map((lang, index) => (
                <Badge key={index} variant="outline">{lang}</Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Tags */}
        {viewExpertDetails.tags && viewExpertDetails.tags.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {viewExpertDetails.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Services */}
        {viewExpertDetails.services && viewExpertDetails.services.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Services</h4>
            <div className="space-y-2">
              {viewExpertDetails.services.map((service, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{service.name}</p>
                    <p className="text-xs text-gray-500">{service.duration} minutes</p>
                  </div>
                  <p className="text-sm font-semibold">₹{service.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Education */}
        {viewExpertDetails.education && viewExpertDetails.education.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Education</h4>
            <div className="space-y-2">
              {viewExpertDetails.education.map((edu, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium">{edu.degree}</p>
                  <p className="text-xs text-gray-500">{edu.institution}</p>
                  <p className="text-xs text-gray-400">Year: {edu.year}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Work History */}
        {viewExpertDetails.workHistory && viewExpertDetails.workHistory.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Work History</h4>
            <div className="space-y-2">
              {viewExpertDetails.workHistory.map((work, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium">{work.position}</p>
                  <p className="text-xs text-gray-500">{work.company}</p>
                  <p className="text-xs text-gray-400">Period: {work.period}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Availability Timings */}
        {viewExpertDetails.availability && viewExpertDetails.availability.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Available Timings</h4>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="space-y-1">
                {viewExpertDetails.availability.map((slot, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{slot.dayOfWeek}</span> – {slot.startTime} to {slot.endTime}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Social Links */}
        {viewExpertDetails.socialLinks?.linkedin && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Social Links</h4>
            <div className="bg-gray-50 rounded-lg p-3">
              <a 
                href={viewExpertDetails.socialLinks.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                LinkedIn Profile
              </a>
            </div>
          </div>
        )}
        
        {/* Video Preview */}
        {viewExpertDetails.videoUrl && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Introduction Video</h4>
            <div className="bg-gray-50 rounded-lg p-3">
              <video 
                src={viewExpertDetails.videoUrl} 
                controls 
                className="w-full rounded-lg"
              />
            </div>
          </div>
        )}
        
        {/* Booking Stats */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Statistics</h4>
          <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-lg p-3">
            <div>
              <Label className="text-xs text-gray-500">Total Bookings</Label>
              <p className="text-sm font-semibold">{selectedExpert?.totalBookings || 0}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Total Revenue</Label>
              <p className="text-sm font-semibold">₹{selectedExpert?.revenue || 0}</p>
            </div>
          </div>
        </div>
      </div>
    ) : selectedExpert ? (
      <div className="text-center py-8 text-gray-500">
        No detailed information available
      </div>
    ) : null}
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
            <Button onClick={handleSaveDP} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Save Changes'}
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
            <Button onClick={handleSaveVideo} disabled={isUploading}>
             {isUploading ? 'Uploading...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


<AddEditExpertModal
  isOpen={addExpertModalOpen || isEditModalOpen}
  onClose={() => {
    setAddExpertModalOpen(false);
    setIsEditModalOpen(false);
    setEditingExpert(null);
    setSelectedExpert(null);
  }}
  onSave={handleSaveExpert}
  initialData={editingExpert}
  mode={editingExpert ? 'edit' : 'add'}
  isLoading={isSaving || isLoadingExpertDetails}
/>

      <ChangeExpertTimingsModal
        isOpen={changeTimingsOpen}
        expertName={selectedExpert?.name}
        timings={selectedExpert?.timings ?? []}
        onClose={() => setChangeTimingsOpen(false)}
        onSave={handleSaveTimings}
      />
    </div>
  );
}
