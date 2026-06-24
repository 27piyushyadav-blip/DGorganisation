'use client';

import { useEffect, useState } from 'react';
import { redirect, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Ban,
  Calendar,
  CalendarDays,
  Edit,
  Eye,
  Menu,
  Plus,
  Search,
  Trash2,
  Upload,
  User,
  Video,
  Mail,
  UserPlus,
  Play,
  ChevronDown,
} from 'lucide-react';

import Link from 'next/link';
import Swal from 'sweetalert2';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { apiClient } from '@/client/api/api-client';
import AddEditExpertModal, {
  AddExpertFormData,
} from '@/components/expert/AddEditExpertModal';
import ChangeExpertTimingsModal from '@/components/expert/ChangeExpertTimingsModal';
import { showConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatToAmPm, formatRangeToAmPm } from '@/lib/utils';
import {
  createExpertApi,
  deleteExpertApi,
  getExpertDetailsApi,
  GetExpertDetailsResponse,
  getExpertsApi,
  updateExpertApi,
  updateExpertTimingsApi,
  uploadExpertAvatarApi,
  uploadExpertVideoApi,
} from '@/client/api/experts';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

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
  services: ExpertService[];
  timings: ExpertTiming[];
  workHistory: ExpertWorkHistory[];
  createdAt: string;
  joinedAt: string;
  totalBookings: number;
  revenue: number;
  rating?: number;
  videoUrl?: string;
  phone?: string;
}

interface ExpertsApiResponse {
  experts?: unknown[];
  active?: number;
  inactive?: number;
  total?: number;
  data?: unknown[];
  items?: unknown[];
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

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizeServices(value: unknown): ExpertService[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((service) => {
      if (!isRecord(service)) return null;

      return {
        name: asString(service.name, asString(service.title, '')),
        price: asNumber(service.price, asNumber(service.cost, 0)),
        duration: asNumber(service.duration, asNumber(service.time, 60)),
      };
    })
    .filter(
      (service): service is ExpertService =>
        service !== null && service.name !== ''
    );
}

function normalizeTimings(value: unknown): ExpertTiming[] {
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
          time: `${formatToAmPm(startTime)} - ${formatToAmPm(endTime)}`,
        };
      }

      if (dayOfWeek && time) {
        return {
          day: dayShortMap[dayOfWeek] ?? dayOfWeek.slice(0, 3),
          time: formatRangeToAmPm(time),
        };
      }

      return null;
    })
    .filter((slot): slot is ExpertTiming => slot !== null);
}

function normalizeExpert(apiExpert: unknown): Expert | null {
  if (!isRecord(apiExpert)) return null;

  const id = apiExpert.id;
  if (typeof id !== 'string' && typeof id !== 'number') return null;

  const firstName = asString(apiExpert.firstName, '');
  const lastName = asString(apiExpert.lastName, '');
  const fullName = `${firstName} ${lastName}`.trim();

  const rawUsername = asString(apiExpert.username, '');
  const statusValue = asString(apiExpert.status, '').toLowerCase();

  const status: Expert['status'] =
    statusValue === 'hidden' || apiExpert.isHidden === true
      ? 'hidden'
      : statusValue === 'inactive'
        ? 'inactive'
        : 'active';

  const availability: ExpertAvailability[] = Array.isArray(apiExpert.availability)
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
    : [];

  const education: ExpertEducation[] = Array.isArray(apiExpert.education)
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
    : [];

  const workHistory: ExpertWorkHistory[] = Array.isArray(apiExpert.workHistory)
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
    : [];

  return {
    id: String(id),
    name: asString(apiExpert.name, fullName || 'Unnamed Expert'),
    email: asString(apiExpert.email, ''),
    username: rawUsername
      ? rawUsername.startsWith('@')
        ? rawUsername
        : `@${rawUsername}`
      : '@expert',
    avatar: asString(
      apiExpert.avatarUrl,
      asString(apiExpert.avatar, asString(apiExpert.profilePicture, ''))
    ),
    bio: asString(apiExpert.bio, asString(apiExpert.description, '')),
    specialization: asString(apiExpert.specialization, ''),
    consultationFee: String(apiExpert.consultationFee ?? ''),
    experience: asNumber(apiExpert.experience, 0),
    status,
    languages: Array.isArray(apiExpert.languages)
      ? apiExpert.languages.filter(
          (language): language is string => typeof language === 'string'
        )
      : [],
    tags: Array.isArray(apiExpert.tags)
      ? apiExpert.tags.filter((tag): tag is string => typeof tag === 'string')
      : [],
    availability,
    education,
    services: normalizeServices(apiExpert.services),
    timings: normalizeTimings(
      Array.isArray(apiExpert.availability)
        ? apiExpert.availability
        : apiExpert.timings
    ),
    workHistory,
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
    videoUrl: asString(
      apiExpert.videoUrl,
      asString(apiExpert.introductionVideo, '')
    ),
    phone: asString(apiExpert.phone, asString(apiExpert.mobile, '')),
  };
}

function extractExperts(response: unknown): Expert[] {
  const list =
    isRecord(response) && Array.isArray(response.experts)
      ? response.experts
      : Array.isArray(response)
        ? response
        : isRecord(response) && Array.isArray(response.data)
          ? response.data
          : isRecord(response) && Array.isArray(response.items)
            ? response.items
            : isRecord(response) &&
                isRecord(response.data) &&
                Array.isArray(response.data.items)
              ? response.data.items
              : [];

  return list
    .map((expert) => normalizeExpert(expert))
    .filter((expert): expert is Expert => expert !== null);
}

export default function ExpertsPage() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('all');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const [experts, setExperts] = useState<Expert[]>([]);
  const [isLoadingExperts, setIsLoadingExperts] = useState(true);
  const [expertsError, setExpertsError] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const [addExpertModalOpen, setAddExpertModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoadingExpertDetails, setIsLoadingExpertDetails] = useState(false);

  const [viewProfileOpen, setViewProfileOpen] = useState(false);
  const [isLoadingViewDetails, setIsLoadingViewDetails] = useState(false);
  const [viewExpertDetails, setViewExpertDetails] =
    useState<GetExpertDetailsResponse | null>(null);

  const [changeDPOpen, setChangeDPOpen] = useState(false);
  const [changeVideoOpen, setChangeVideoOpen] = useState(false);
  const [changeTimingsOpen, setChangeTimingsOpen] = useState(false);
  const [orgProfile, setOrgProfile] = useState<any>(null);

  const [inviteExpertOpen, setInviteExpertOpen] = useState(false);
  const [choiceModalOpen, setChoiceModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [editingExpert, setEditingExpert] =
    useState<AddExpertFormData | null>(null);

  const [newAvatar, setNewAvatar] = useState('');
  const [newVideo, setNewVideo] = useState('');
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [uploadedVideoFile, setUploadedVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [videoPreview, setVideoPreview] = useState('');

  const filteredExperts = experts.filter((expert) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      expert.name.toLowerCase().includes(search) ||
      expert.username.toLowerCase().includes(search) ||
      expert.email.toLowerCase().includes(search);

    const matchesView =
      viewMode === 'all' ||
      (viewMode === 'active' && expert.status === 'active') ||
      (viewMode === 'hidden' && expert.status === 'hidden');

    return matchesSearch && matchesView;
  });

  const fetchExperts = async () => {
    try {
      setIsLoadingExperts(true);
      setExpertsError('');

      const response = (await getExpertsApi()) as ExpertsApiResponse;
      setExperts(extractExperts(response));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load experts';
      setExpertsError(message);
      toast.error(message);
    } finally {
      setIsLoadingExperts(false);
    }
  };

  useEffect(() => {
    void fetchExperts();
    const fetchOrgProfile = async () => {
      try {
        const response = await apiClient(process.env.NEXT_PUBLIC_PROFILE_BASE_URL!);
        setOrgProfile(response);
      } catch (err) {
        console.error('Failed to load organization profile', err);
      }
    };
    void fetchOrgProfile();
  }, []);

  const transformApiToFormData = (
    apiData: GetExpertDetailsResponse
  ): AddExpertFormData => {
    return {
      id: apiData.id,
      avatar: apiData.avatarUrl || (apiData as any).profileImage || (apiData as any).avatar || '',
      introVideo: apiData.videoUrl || (apiData as any).introVideo || '',
      name: apiData.name || '',
      email: apiData.email || '',
      username: apiData.username?.replace('@', '') || '',
      phone: apiData.phone || '',
      bio: apiData.bio || '',
      specialization: apiData.specialization || '',
      experience: apiData.experience || 0,
      consultationFee: apiData.consultationFee || 0,
      education: apiData.education?.length
        ? apiData.education
        : [{ degree: '', institution: '', year: new Date().getFullYear() }],
      workHistory: apiData.workHistory?.length
        ? apiData.workHistory
        : [{ company: '', position: '', period: '' }],
      availability: apiData.availability?.length
        ? apiData.availability
        : [{ dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' }],
      languages: apiData.languages || [],
      socialLinks: {
        linkedin: apiData.socialLinks?.linkedin || '',
      },
      tags: apiData.tags || [],
      services: apiData.services?.length
        ? apiData.services.map((s: any) =>
            typeof s === 'string'
              ? { name: s, price: 0, duration: 60 }
              : {
                  name: s.name || '',
                  price: Number(s.price ?? s.videoPrice ?? s.clinicPrice ?? 0),
                  duration: Number(s.duration) || 60,
                }
          )
        : [],
      timezone: apiData.timezone || '',
      gender: (apiData.gender as any) || undefined,
      location: apiData.location || '',
    };
  };

  const handleEditProfile = async (expert: Expert) => {
    setOpenDropdownId(null);
    setIsLoadingExpertDetails(true);

    try {
      const expertDetails = await getExpertDetailsApi(expert.id);
      const formData = transformApiToFormData(expertDetails);

      setEditingExpert(formData);
      setSelectedExpert(expert);
      setIsEditModalOpen(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load expert details';
      toast.error(message);
    } finally {
      setIsLoadingExpertDetails(false);
    }
  };

  const handleSaveExpert = async (data: AddExpertFormData) => {
    setIsSaving(true);

    const payload = {
      ...data,
      consultationFee: data.consultationFee ?? 0,
    };

    try {
      if (editingExpert && selectedExpert) {
        await updateExpertApi(selectedExpert.id.toString(), payload);
        toast.success('Expert updated successfully');
      } else {
        await createExpertApi(payload);
        toast.success('Expert created successfully');
      }

      await fetchExperts();

      setIsEditModalOpen(false);
      setAddExpertModalOpen(false);
      setEditingExpert(null);
      setSelectedExpert(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save expert';
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
      const expertDetails = await getExpertDetailsApi(expert.id);
      setViewExpertDetails(expertDetails);
      setSelectedExpert(expert);
      setViewProfileOpen(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load expert details';
      toast.error(message);
    } finally {
      setIsLoadingViewDetails(false);
    }
  };

  const handleInviteExpert = async () => {
    if (!inviteEmail) return;

    setIsInviting(true);

    try {
      await apiClient(`${API_BASE}/organizations/invite-expert`, {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail }),
      });

      const newExpert: Expert = {
        id: Date.now().toString(),
        name: inviteEmail.split('@')[0],
        username: `@${inviteEmail.split('@')[0]}`,
        avatar: '',
        bio: '',
        specialization: '',
        consultationFee: '',
        experience: 0,
        status: 'hidden',
        languages: [],
        tags: [],
        availability: [],
        education: [],
        services: [],
        timings: [],
        workHistory: [],
        createdAt: '',
        joinedAt: '',
        totalBookings: 0,
        revenue: 0,
        rating: 0,
        videoUrl: '',
        phone: '',
        email: inviteEmail,
      };

      setExperts((prev) => [...prev, newExpert]);
      setInviteExpertOpen(false);
      setInviteEmail('');
      toast.success('Expert invited successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to invite expert');
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

      setExperts((prev) =>
        prev.map((item) =>
          item.id === expert.id ? { ...item, status: newStatus } : item
        )
      );

      toast.success(`Expert is now ${newStatus}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    } finally {
      setOpenDropdownId(null);
    }
  };

  const handleDisconnectExpert = async (expert: Expert) => {
    const confirmed = await showConfirmDialog({
      title: 'Delete Expert',
      text: `Are you sure you want to delete ${expert.name}? This action cannot be undone.`,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      icon: 'warning',
    });

    if (!confirmed) return;

    Swal.fire({
      title: 'Deleting...',
      text: 'Please wait',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await deleteExpertApi(expert.id);

      setExperts((prev) => prev.filter((item) => item.id !== expert.id));

      Swal.close();
      toast.success(`${expert.name} has been deleted successfully`);
      setOpenDropdownId(null);
    } catch (error) {
      Swal.close();
      const message =
        error instanceof Error ? error.message : 'Failed to delete expert';
      toast.error(message);
    }
  };

  const handleSaveTimings = async (
    availability: { dayOfWeek: string; startTime: string; endTime: string }[]
  ) => {
    if (!selectedExpert) return;

    try {
      await updateExpertTimingsApi(selectedExpert.id, { availability });

      const updatedTimings = availability.map((slot) => ({
        day: slot.dayOfWeek.slice(0, 3),
        time: `${formatToAmPm(slot.startTime)} - ${formatToAmPm(slot.endTime)}`,
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
        error instanceof Error
          ? error.message
          : 'Failed to update expert timings';
      toast.error(message);
      throw error;
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file size should be less than 5MB');
      return;
    }

    setUploadedImageFile(file);

    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);
      setNewAvatar(result);
    };

    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid video file (MP4, WEBM, OGG)');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video file size should be less than 50MB');
      return;
    }

    setUploadedVideoFile(file);

    const videoUrl = URL.createObjectURL(file);
    setVideoPreview(videoUrl);
    setNewVideo(videoUrl);
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

  const handleSaveDP = async () => {
    if (!selectedExpert) return;

    setIsUploading(true);

    try {
      let finalAvatarUrl = newAvatar;

      if (uploadedImageFile) {
        const response = await uploadExpertAvatarApi(
          uploadedImageFile,
          selectedExpert.id
        );

        if (response.fileUrl) {
          finalAvatarUrl = response.fileUrl;
        } else {
          toast.error('Failed to upload image');
          return;
        }
      }

      setExperts((prev) =>
        prev.map((expert) =>
          expert.id === selectedExpert.id
            ? { ...expert, avatar: finalAvatarUrl }
            : expert
        )
      );

      setUploadedImageFile(null);
      setImagePreview('');
      setChangeDPOpen(false);
      toast.success('Profile picture updated successfully');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to upload image';
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveVideo = async () => {
    if (!selectedExpert) return;

    setIsUploading(true);

    try {
      let finalVideoUrl = newVideo;

      if (uploadedVideoFile) {
        const response = await uploadExpertVideoApi(
          uploadedVideoFile,
          selectedExpert.id
        );

        if (response.fileUrl) {
          finalVideoUrl = response.fileUrl;
        } else {
          toast.error('Failed to upload video');
          return;
        }
      }

      setExperts((prev) =>
        prev.map((expert) =>
          expert.id === selectedExpert.id
            ? { ...expert, videoUrl: finalVideoUrl }
            : expert
        )
      );

      setUploadedVideoFile(null);

      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }

      setVideoPreview('');
      setChangeVideoOpen(false);
      toast.success('Video updated successfully');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to upload video';
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 h-full space-y-6 p-4 pt-6 md:p-8 bg-[var(--card-bg-light)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Expert Management System
          </h2>
          <p className="text-muted-foreground">
            Manage your expert team and their profiles
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative max-w-sm">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder="Search experts..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
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

          <button
            className="w-full px-4 py-2.5 border font-semibold rounded-xl transition-all duration-300 cursor-pointer max-w-[10rem] flex items-center gap-2 bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white"
            onClick={() => {
              setEditingExpert(null);
              setSelectedExpert(null);
              setAddExpertModalOpen(true);
            }}
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

        {!isLoadingExperts &&
          !expertsError &&
          filteredExperts.map((expert) => (
            <Card
              key={expert.id}
              className="w-[280px] shadow-sm border border-zinc-200 bg-white rounded-2xl overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* 1. Cover Photo with play button overlay */}
                <div className="relative aspect-[4/3] w-full bg-zinc-50 overflow-hidden border-b flex items-center justify-center">
                  {expert.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={expert.avatar}
                      alt={expert.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-white text-3xl font-bold uppercase select-none">
                      {expert.name.charAt(0)}
                    </div>
                  )}
                  {expert.videoUrl && (
                    <div 
                      onClick={() => handleViewProfile(expert)}
                      className="absolute inset-0 bg-black/15 flex items-center justify-center opacity-85 hover:opacity-100 transition-opacity cursor-pointer z-10"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                        <Play className="h-4.5 w-4.5 text-zinc-800 fill-zinc-800 ml-0.5" />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Top Bar below image */}
                <div className="flex items-center justify-between border-b text-xs text-zinc-600 bg-zinc-50/50">
                  <button
                    type="button"
                    onClick={() => handleViewProfile(expert)}
                    className="flex-1 py-2 text-center hover:bg-zinc-100/80 transition-colors font-semibold cursor-pointer text-[11px]"
                  >
                    View Profile
                  </button>
                  <div className="w-px h-8 bg-zinc-200" />
                  <button
                    type="button"
                    onClick={() => handleToggleProfileStatus(expert)}
                    title={expert.status === 'hidden' ? 'Show Profile' : 'Hide Profile'}
                    className="px-3 py-2 hover:bg-zinc-100/80 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    {expert.status === 'hidden' ? (
                      <Ban className="h-3.5 w-3.5 text-red-500" />
                    ) : (
                      <Eye className="h-3.5 w-3.5 text-zinc-600" />
                    )}
                  </button>
                  <div className="w-px h-8 bg-zinc-200" />
                  <button
                    type="button"
                    onClick={() => handleEditProfile(expert)}
                    title="Edit Profile"
                    className="px-3 py-2 hover:bg-zinc-100/80 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5 text-zinc-600" />
                  </button>
                </div>

                {/* 3. Info and Action Buttons */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-zinc-900 text-base leading-tight truncate">
                      {expert.name}
                    </h3>
                    <p className="text-xs text-zinc-500 font-semibold mt-0.5 truncate uppercase tracking-wider">
                      {expert.specialization || 'No Specialization'}
                    </p>
                  </div>

                  {/* Row 1: Bookings & Timings */}
                  <div className="flex gap-2">
                    <Link
                      href={`/experts/${expert.id}/booking-details`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        className="w-full h-9 rounded-lg text-xs bg-none bg-emerald-700 text-white hover:bg-emerald-800 hover:text-white font-semibold flex items-center justify-center gap-1 border-0 shadow-sm transition-all"
                      >
                        <CalendarDays className="h-3.5 w-3.5" /> Bookings
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => handleChangeTimings(expert)}
                      className="flex-1 h-9 rounded-lg text-xs font-semibold bg-none bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 flex items-center justify-center gap-1 border border-zinc-200 shadow-sm"
                    >
                      <Calendar className="h-3.5 w-3.5 text-zinc-500" /> Timings
                    </Button>
                  </div>

                  {/* Row 2: Change Picture & Video dropdown */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleChangeDP(expert)}
                      className="flex-1 h-8 rounded-lg text-[11px] font-semibold bg-none bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 flex items-center justify-center gap-1 border border-zinc-200 shadow-sm"
                    >
                      <User className="h-3.5 w-3.5 text-zinc-500" /> Change Picture
                    </Button>

                    <div className="relative shrink-0">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setOpenDropdownId(
                            openDropdownId === `video-${expert.id}`
                              ? null
                              : `video-${expert.id}`
                          )
                        }
                        className="h-8 px-2.5 rounded-lg text-xs font-semibold bg-none bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 flex items-center justify-center gap-1 border border-zinc-200 shadow-sm"
                      >
                        <Video className="h-3.5 w-3.5 text-zinc-500" />
                        <ChevronDown className="h-3 w-3 text-zinc-400" />
                      </Button>

                      {openDropdownId === `video-${expert.id}` && (
                        <div className="absolute right-0 bottom-9 z-50 w-44 bg-white border border-zinc-200 rounded-lg shadow-xl py-1">
                          <button
                            type="button"
                            onClick={() => {
                              handleChangeVideo(expert);
                              setOpenDropdownId(null);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Video className="h-3.5 w-3.5 text-zinc-500" />
                            Change Video
                          </button>
                          <div className="border-t border-zinc-100 my-1" />
                          <button
                            type="button"
                            onClick={() => {
                              handleDisconnectExpert(expert);
                              setOpenDropdownId(null);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Ban className="h-3.5 w-3.5 text-red-500" />
                            Disconnect Expert
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

        {!isLoadingExperts &&
          !expertsError &&
          filteredExperts.length === 0 && (
            <div className="w-full rounded-lg border border-dashed border-[var(--primary-start)] bg-white p-6 text-center text-sm text-gray-500">
              No experts found.
            </div>
          )}
      </div>

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
                <div className="text-xs text-zinc-500">
                  Send an invitation link via email
                </div>
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
                <div className="text-xs text-zinc-500">
                  Explicitly fill all profile details now
                </div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                onChange={(event) => setInviteEmail(event.target.value)}
              />
            </div>

            <p className="text-sm text-gray-500">
              An invitation will be sent to this email address containing
              instructions to join your organization.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInviteExpertOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleInviteExpert} disabled={isInviting}>
              {isInviting ? 'Inviting...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewProfileOpen} onOpenChange={setViewProfileOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Expert Profile</DialogTitle>
            <DialogDescription>
              View detailed information about this expert.
            </DialogDescription>
          </DialogHeader>

          {isLoadingViewDetails ? (
            <div className="py-8 text-center text-sm text-gray-500">
              Loading expert details...
            </div>
          ) : viewExpertDetails ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={viewExpertDetails.avatarUrl || selectedExpert?.avatar}
                    alt={viewExpertDetails.name || selectedExpert?.name}
                  />
                  <AvatarFallback>
                    {(viewExpertDetails.name || selectedExpert?.name || 'E')
                      .charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h3 className="text-xl font-bold">
                    {viewExpertDetails.name || selectedExpert?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {viewExpertDetails.email || selectedExpert?.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    {viewExpertDetails.username || selectedExpert?.username}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Bio
                </h4>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  {viewExpertDetails.bio || 'No bio available'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-lg p-3">
                <div>
                  <Label className="text-xs text-gray-500">
                    Specialization
                  </Label>
                  <p className="text-sm font-semibold">
                    {viewExpertDetails.specialization || '-'}
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-gray-500">Experience</Label>
                  <p className="text-sm font-semibold">
                    {viewExpertDetails.experience || 0} years
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-gray-500">
                    Consultation Fee
                  </Label>
                  <p className="text-sm font-semibold">
                    ${viewExpertDetails.consultationFee || 0}
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-gray-500">Phone</Label>
                  <p className="text-sm font-semibold">
                    {viewExpertDetails.phone || '-'}
                  </p>
                </div>
              </div>

              {viewExpertDetails.videoUrl && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Introduction Video
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <video
                      src={viewExpertDetails.videoUrl}
                      controls
                      className="w-full rounded-lg"
                    />
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Statistics
                </h4>
                <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-lg p-3">
                  <div>
                    <Label className="text-xs text-gray-500">
                      Total Bookings
                    </Label>
                    <p className="text-sm font-semibold">
                      {selectedExpert?.totalBookings || 0}
                    </p>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500">
                      Total Revenue
                    </Label>
                    <p className="text-sm font-semibold">
                      ${selectedExpert?.revenue || 0}
                    </p>
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
                  onClick={() =>
                    document.getElementById('image-upload')?.click()
                  }
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
                  Selected: {uploadedImageFile.name} (
                  {(uploadedImageFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar-url">Or Image URL</Label>
              <Input
                id="avatar-url"
                value={newAvatar}
                onChange={(event) => {
                  setNewAvatar(event.target.value);
                  setImagePreview('');
                  setUploadedImageFile(null);
                }}
                placeholder="Enter image URL"
              />
            </div>

            <div className="text-xs text-gray-500">
              Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setChangeDPOpen(false);
                handleImageRemove();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveDP} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={changeVideoOpen} onOpenChange={setChangeVideoOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Change Introduction Video</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
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
                  onClick={() =>
                    document.getElementById('video-upload')?.click()
                  }
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
                  Selected: {uploadedVideoFile.name} (
                  {(uploadedVideoFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {(videoPreview || newVideo) && (
              <video
                src={videoPreview || newVideo}
                controls
                className="w-full rounded-lg"
              />
            )}

            <div className="space-y-2">
              <Label htmlFor="video-url">Or Video URL</Label>
              <Input
                id="video-url"
                value={newVideo}
                onChange={(event) => {
                  setNewVideo(event.target.value);
                  setVideoPreview('');
                  setUploadedVideoFile(null);
                }}
                placeholder="Enter video URL"
              />
            </div>

            <div className="text-xs text-gray-500">
              Supported formats: MP4, WEBM, OGG (Max 50MB)
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setChangeVideoOpen(false);
                handleVideoRemove();
              }}
            >
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
        operatingHours={orgProfile?.operatingHours}
      />

      <ChangeExpertTimingsModal
        isOpen={changeTimingsOpen}
        expertName={selectedExpert?.name}
        timings={selectedExpert?.timings ?? []}
        onClose={() => setChangeTimingsOpen(false)}
        onSave={handleSaveTimings}
        operatingHours={orgProfile?.operatingHours}
      />
    </div>
  );
}