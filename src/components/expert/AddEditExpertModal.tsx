// components/AddExpertModal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Trash2, Check, Package, User, Video } from 'lucide-react';
import { uploadExpertAvatarApi, uploadExpertVideoApi } from '@/client/api/experts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Clock } from 'lucide-react';
import Modal from '../modal/Modal';
import { apiClient } from '@/client/api/api-client';
import { toast } from 'sonner';
import { formatToAmPm } from '@/lib/utils';

// Zod validation schema
const educationSchema = z.object({
  degree: z.string().min(1, 'Degree is required'),
  institution: z.string().min(1, 'Institution is required'),
  year: z.number().min(1900, 'Valid year required').max(new Date().getFullYear(), 'Year cannot be in future'),
});

const workHistorySchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  position: z.string().min(1, 'Position is required'),
  period: z.string().min(1, 'Period is required'),
});

const availabilitySchema = z.object({
  dayOfWeek: z.string().min(1, 'Day is required'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
});

const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  price: z.number().min(0, 'Price must be positive'),
  duration: z.number().min(5, 'Duration must be at least 5 minutes'),
});

// Add phone to the schema
const addExpertSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  phone: z.string().optional(),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  specialization: z.string().min(2, 'Specialization is required'),
  experience: z.number().min(0, 'Experience must be a positive number').max(50, 'Experience cannot exceed 50 years'),
  consultationFee: z.number().min(0, 'Consultation fee must be positive').optional(),
  education: z.array(educationSchema).min(1, 'At least one education entry is required'),
  workHistory: z.array(workHistorySchema).min(1, 'At least one work history entry is required'),
  availability: z.array(availabilitySchema).min(1, 'At least one availability slot is required'),
  languages: z.array(z.string()).min(1, 'At least one language is required'),
  socialLinks: z.object({
    linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  }),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  services: z.array(serviceSchema).min(1, 'At least one service is required'),
  timezone: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  location: z.string().optional(),
  avatar: z.string().optional(),
  introVideo: z.string().optional(),
  id: z.string().optional(),
});

type AddExpertFormData = z.infer<typeof addExpertSchema>;
export type { AddExpertFormData };

interface AddEditExpertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AddExpertFormData) => Promise<void>;
  initialData?: AddExpertFormData | null;
  mode: 'add' | 'edit';
  isLoading?: boolean;
  operatingHours?: any[];
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeSlots = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2).toString().padStart(2, '0');
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour}:${minute}`;
});

let cachedServices: any[] | null = null;
let cachedCategories: any[] | null = null;

const TimePicker = ({
  value,
  onChange,
  disabled,
  minTime,
  maxTime,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  minTime?: string;
  maxTime?: string;
}) => {
  const [open, setOpen] = React.useState(false);

  const { hour, min, ampm } = React.useMemo(() => {
    if (!value) return { hour: '09', min: '00', ampm: 'AM' };
    const [h24Str, mStr] = value.split(':');
    const h24 = parseInt(h24Str, 10);
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return {
      hour: h12.toString().padStart(2, '0'),
      min: mStr || '00',
      ampm: h24 >= 12 ? 'PM' : 'AM',
    };
  }, [value]);

  // Convert "HH:MM" to total minutes
  const toMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + (m || 0);
  };
  const to24hMins = (h12: string, m: string, a: string) => {
    let h24 = parseInt(h12, 10);
    if (a === 'PM' && h24 !== 12) h24 += 12;
    if (a === 'AM' && h24 === 12) h24 = 0;
    return h24 * 60 + parseInt(m, 10);
  };

  const minMins = minTime ? toMins(minTime) : 0;
  const maxMins = maxTime ? toMins(maxTime) : 23 * 60 + 59;

  // An hour row is selectable if at least one minute of that hour falls in [minMins, maxMins]
  const isHourValid = (h12: string, a: string) => {
    let h24 = parseInt(h12, 10);
    if (a === 'PM' && h24 !== 12) h24 += 12;
    if (a === 'AM' && h24 === 12) h24 = 0;
    return h24 * 60 + 59 >= minMins && h24 * 60 <= maxMins;
  };

  const isMinuteValidForAmpm = (m: string, a: string) => {
    const total = to24hMins(hour, m, a);
    return total >= minMins && total <= maxMins;
  };

  const isAmpmValid = (a: string) =>
    Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).some(h =>
      isHourValid(h, a)
    );

  const handleUpdate = React.useCallback(
    (h: string, m: string, a: string) => {
      let h24 = parseInt(h, 10);
      if (a === 'PM' && h24 !== 12) h24 += 12;
      if (a === 'AM' && h24 === 12) h24 = 0;
      onChange(`${h24.toString().padStart(2, '0')}:${m}`);
    },
    [onChange]
  );

  const ITEM_H = 36;
  const REPEATS = 7;

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const repeatedHours = Array.from({ length: REPEATS }, () => hours).flat();
  const repeatedMinutes = Array.from({ length: REPEATS }, () => minutes).flat();

  const hourRef = React.useRef<HTMLDivElement>(null);
  const minRef = React.useRef<HTMLDivElement>(null);

  // On open: jump to the middle repeat at the currently selected item
  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        const hIdx = hours.indexOf(hour);
        const mIdx = minutes.indexOf(min);
        const midH = Math.floor(REPEATS / 2) * hours.length + hIdx;
        const midM = Math.floor(REPEATS / 2) * minutes.length + mIdx;
        if (hourRef.current) hourRef.current.scrollTop = midH * ITEM_H;
        if (minRef.current) minRef.current.scrollTop = midM * ITEM_H;
      }, 60);
    }
  }, [open]);

  // Silently jump when approaching either edge so scrolling never stops
  const handleHourScroll = () => {
    const el = hourRef.current;
    if (!el) return;
    const oneLoop = hours.length * ITEM_H;
    if (el.scrollTop < oneLoop) el.scrollTop += oneLoop * 2;
    else if (el.scrollTop > oneLoop * (REPEATS - 2)) el.scrollTop -= oneLoop * 2;
  };

  const handleMinScroll = () => {
    const el = minRef.current;
    if (!el) return;
    const oneLoop = minutes.length * ITEM_H;
    if (el.scrollTop < oneLoop) el.scrollTop += oneLoop * 2;
    else if (el.scrollTop > oneLoop * (REPEATS - 2)) el.scrollTop -= oneLoop * 2;
  };

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="flex items-center gap-2 h-9 px-3 rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-800 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
        >
          <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span>{hour}:{min} {ampm}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-auto shadow-xl border border-gray-100 rounded-xl overflow-hidden"
        align="start"
        sideOffset={6}
      >
        {/* columns */}
        <div className="flex">
          {/* Hour column */}
          <div className="flex flex-col w-16">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center py-1.5 border-b border-gray-100">HR</div>
            <div
              ref={hourRef}
              onScroll={handleHourScroll}
              className="overflow-y-auto"
              style={{ height: 180, scrollbarWidth: 'none' }}
            >
              {repeatedHours.map((h, i) => {
                const otherAmpm = ampm === 'AM' ? 'PM' : 'AM';
                const validCurrent = isHourValid(h, ampm);
                const validOther = isHourValid(h, otherAmpm);
                const valid = validCurrent || validOther;
                const isSelected = h === hour && validCurrent;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={!valid}
                    onClick={() => {
                      if (validCurrent) {
                        handleUpdate(h, min, ampm);
                      } else if (validOther) {
                        handleUpdate(h, min, otherAmpm);
                      }
                    }}
                    style={{ height: ITEM_H }}
                    className={`w-full text-sm font-medium text-center transition-colors ${
                      isSelected
                        ? 'bg-orange-500 text-white'
                        : valid
                        ? 'text-gray-700 hover:bg-orange-50'
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-px bg-gray-100" />

          {/* Minute column */}
          <div className="flex flex-col w-16">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center py-1.5 border-b border-gray-100">MIN</div>
            <div
              ref={minRef}
              onScroll={handleMinScroll}
              className="overflow-y-auto"
              style={{ height: 180, scrollbarWidth: 'none' }}
            >
              {repeatedMinutes.map((m, i) => {
                const otherAmpm = ampm === 'AM' ? 'PM' : 'AM';
                const validCurrent = isMinuteValidForAmpm(m, ampm);
                const validOther = isMinuteValidForAmpm(m, otherAmpm);
                const valid = validCurrent || validOther;
                const isSelected = m === min && validCurrent;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={!valid}
                    onClick={() => {
                      if (validCurrent) {
                        handleUpdate(hour, m, ampm);
                      } else if (validOther) {
                        handleUpdate(hour, m, otherAmpm);
                      }
                    }}
                    style={{ height: ITEM_H }}
                    className={`w-full text-sm font-medium text-center transition-colors ${
                      isSelected
                        ? 'bg-orange-500 text-white'
                        : valid
                        ? 'text-gray-700 hover:bg-orange-50'
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-px bg-gray-100" />

          {/* AM/PM column */}
          <div className="flex flex-col w-16">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center py-1.5 border-b border-gray-100">AM/PM</div>
            <div className="flex flex-col justify-center gap-1.5 p-1.5" style={{ height: 180 }}>
              {(['AM', 'PM'] as const).map((a) => {
                const valid = isAmpmValid(a);
                return (
                  <button
                    key={a}
                    type="button"
                    disabled={!valid}
                    onClick={() => valid && handleUpdate(hour, min, a)}
                    className={`w-full py-3 text-xs font-semibold tracking-wide rounded-md transition-colors ${
                      a === ampm
                        ? 'bg-orange-500 text-white'
                        : valid
                        ? 'text-gray-600 hover:bg-orange-50'
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default function AddEditExpertModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  mode,
  isLoading = false,
  operatingHours,
}: AddEditExpertModalProps) {
  const [languageInput, setLanguageInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [orgServices, setOrgServices] = useState<any[]>(cachedServices || []);
  const [categories, setCategories] = useState<any[]>(cachedCategories || []);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isLoadingServices, setIsLoadingServices] = useState(!cachedServices);

  useEffect(() => {
    const fetchServicesAndCategories = async () => {
      if (!cachedServices) {
        setIsLoadingServices(true);
      }
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const [servicesRes, categoriesRes] = await Promise.all([
          apiClient<any>(`${baseUrl}/organizations/services`),
          apiClient<any>(`${baseUrl}/organizations/services/categories`)
        ]);
        if (servicesRes?.services) {
          setOrgServices(servicesRes.services);
          cachedServices = servicesRes.services;
        }
        if (categoriesRes?.categories) {
          setCategories(categoriesRes.categories);
          cachedCategories = categoriesRes.categories;
        }
      } catch (error) {
        console.error('Failed to load organization services/categories:', error);
      } finally {
        setIsLoadingServices(false);
      }
    };
    fetchServicesAndCategories();
  }, []);

  const handleModalClose = () => {
    setSubmitError('');
    setSelectedCategoryFilter('all');
    reset();
    onClose();
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<AddExpertFormData>({
    resolver: zodResolver(addExpertSchema),
    defaultValues: initialData || {
      id: '',
      name: '',
      email: '',
      username: '',
      phone: '',
      bio: '',
      specialization: '',
      experience: 0,
      consultationFee: 0,
      education: [{ degree: '', institution: '', year: new Date().getFullYear() }],
      workHistory: [{ company: '', position: '', period: '' }],
      availability: [{ dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' }],
      languages: [],
      socialLinks: { linkedin: '' },
      tags: [],
      services: [{ name: '', price: 0, duration: 60 }],
      timezone: '',
      gender: undefined,
      location: '',
      avatar: '',
      introVideo: '',
    },
  });

    // Reset form when initialData changes or modal opens
  useEffect(() => {
    if (isOpen && initialData) {
      const formatted = {
        ...initialData,
        id: initialData.id || '',
        avatar: initialData.avatar || '',
        introVideo: initialData.introVideo || '',
        experience: initialData.experience !== undefined ? Number(initialData.experience) : 0,
        consultationFee: initialData.consultationFee !== undefined ? Number(initialData.consultationFee) : 0,
        education: initialData.education && initialData.education.length > 0 
          ? initialData.education.map((e: any) => ({ ...e, year: Number(e.year) || new Date().getFullYear() }))
          : [{ degree: '', institution: '', year: new Date().getFullYear() }],
        workHistory: initialData.workHistory && initialData.workHistory.length > 0
          ? initialData.workHistory
          : [{ company: '', position: '', period: '' }],
        availability: initialData.availability && initialData.availability.length > 0
          ? initialData.availability
          : [{ dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' }],
        languages: initialData.languages || [],
        tags: initialData.tags || [],
        services: (initialData.services || []).map((s: any) => ({
          name: s.name || '',
          price: Number(s.price || s.videoPrice || s.clinicPrice) || 0,
          duration: Number(s.duration) || 60,
        })),
      };
      reset(formatted);
    } else if (isOpen && !initialData) {
      reset({
        id: '',
        name: '',
        email: '',
        username: '',
        phone: '',
        bio: '',
        specialization: '',
        experience: 0,
        consultationFee: 0,
        education: [{ degree: '', institution: '', year: new Date().getFullYear() }],
        workHistory: [{ company: '', position: '', period: '' }],
        availability: [{ dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' }],
        languages: [],
        socialLinks: { linkedin: '' },
        tags: [],
        services: [],
        timezone: '',
        gender: undefined,
        location: '',
        avatar: '',
        introVideo: '',
      });
    }
  }, [isOpen, initialData, reset]);

  const avatarVal = watch('avatar');
  const introVideoVal = watch('introVideo');

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const expertId = watch('id');
      const res = await uploadExpertAvatarApi(file, expertId);
      if (res.fileUrl) {
        setValue('avatar', res.fileUrl);
        toast.success('Profile photo uploaded successfully');
      } else {
        toast.error('Failed to upload profile photo');
      }
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Failed to upload profile photo');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video size must be less than 50MB');
      return;
    }

    setIsUploadingVideo(true);
    try {
      const expertId = watch('id');
      const res = await uploadExpertVideoApi(file, expertId);
      if (res.fileUrl) {
        setValue('introVideo', res.fileUrl);
        toast.success('Introduction video uploaded successfully');
      } else {
        toast.error('Failed to upload introduction video');
      }
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Failed to upload introduction video');
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control,
    name: 'education',
  });

  const { fields: workHistoryFields, append: appendWorkHistory, remove: removeWorkHistory } = useFieldArray({
    control,
    name: 'workHistory',
  });

  const { fields: availabilityFields, append: appendAvailability, remove: removeAvailability } = useFieldArray({
    control,
    name: 'availability',
  });

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control,
    name: 'services',
  });

  const selectedServices = watch('services') || [];

  const hasDefaultServices = orgServices.some((s: any) => !s.categoryId);
  const displayedCategories = [
    { id: 'all', name: 'All' },
    ...(hasDefaultServices ? [{ id: 'default', name: 'Services' }] : []),
    ...categories.map((c: any) => ({ id: c.id, name: c.name }))
  ];

  const filteredServices = orgServices.filter((s: any) => {
    if (selectedCategoryFilter === 'all') return true;
    if (selectedCategoryFilter === 'default') return !s.categoryId;
    return s.categoryId === selectedCategoryFilter;
  });

  const handleToggleService = (orgService: any) => {
    const existingIndex = selectedServices.findIndex((s: any) => s.name === orgService.name);
    if (existingIndex > -1) {
      removeService(existingIndex);
    } else {
      appendService({
        name: orgService.name,
        price: Number(orgService.basePrice) || 0,
        duration: orgService.durationMinutes || 60,
      });
    }
  };

  const languages = watch('languages');
  const tags = watch('tags');

  const addLanguage = () => {
    if (languageInput.trim() && !languages.includes(languageInput.trim())) {
      setValue('languages', [...languages, languageInput.trim()]);
      setLanguageInput('');
    }
  };

  const removeLanguage = (lang: string) => {
    setValue('languages', languages.filter(l => l !== lang));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue('tags', [...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setValue('tags', tags.filter(t => t !== tag));
  };

  const onInvalid = (errors: any) => {
    const errorFields = Object.keys(errors);
    if (errorFields.length > 0) {
      const firstKey = errorFields[0];
      const errorObj = errors[firstKey];
      const msg = errorObj?.message || (Array.isArray(errorObj) ? 'Invalid entry in list' : 'Validation failed');
      toast.error(`Please fix: "${firstKey}" — ${msg}`);
    } else {
      toast.error('Please fill in all required fields correctly.');
    }
  };

   const onSubmit = async (data: AddExpertFormData) => {
    setSubmitError('');

    if (operatingHours && Array.isArray(operatingHours)) {
      for (const slot of data.availability || []) {
        const dayHours = operatingHours.find(
          (h) => h && h.day && h.day.toLowerCase() === slot.dayOfWeek.toLowerCase()
        );
        if (!dayHours) {
          const errMsg = `Organization operating hours are not configured for ${slot.dayOfWeek}.`;
          setSubmitError(errMsg);
          toast.error(errMsg);
          return;
        }
        if (dayHours.is_closed) {
          const errMsg = `Organization is closed on ${slot.dayOfWeek}. Availability cannot be set.`;
          setSubmitError(errMsg);
          toast.error(errMsg);
          return;
        }
        if (slot.startTime < dayHours.open) {
          const errMsg = `Start time on ${slot.dayOfWeek} cannot be earlier than organization open time (${formatToAmPm(dayHours.open)}).`;
          setSubmitError(errMsg);
          toast.error(errMsg);
          return;
        }
        if (slot.endTime > dayHours.close) {
          const errMsg = `End time on ${slot.dayOfWeek} cannot be later than organization close time (${formatToAmPm(dayHours.close)}).`;
          setSubmitError(errMsg);
          toast.error(errMsg);
          return;
        }
        if (slot.startTime >= slot.endTime) {
          const errMsg = `End time must be later than start time on ${slot.dayOfWeek}.`;
          setSubmitError(errMsg);
          toast.error(errMsg);
          return;
        }
      }
    }

    try {
      await onSave(data);
      handleModalClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to ${mode} expert`;
      setSubmitError(message);
    }
  };

  if (!isOpen) return null;

return (
  <Modal
  isOpen={isOpen}
  onClose={handleModalClose}
  title={mode === 'add' ? "Add New Expert" : "Edit Expert"}
  size="xl"
  showCloseButton={true}
  confirmButtonText={mode === 'add' ? "Add Expert" : "Update Expert"}
  cancelButtonText="Cancel"
  onConfirm={handleSubmit(onSubmit, onInvalid)}
  onCancel={handleModalClose}
  isConfirmLoading={isSubmitting || isLoading}
>
    <form id="add-expert-form" onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6 bg-[var(--card-bg-light)]">
      {submitError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {submitError}
        </div>
      )}
      {/* Profile Media Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-[var(--primary-start)] pb-2">Profile Media</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50/50 border border-gray-100 rounded-xl">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center sm:flex-row gap-4">
            <div className="relative group w-24 h-24 shrink-0 rounded-full overflow-hidden border border-gray-200 bg-white">
              {avatarVal ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarVal} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                  <User className="w-10 h-10" />
                </div>
              )}
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <h4 className="text-sm font-semibold text-gray-800">Profile Photo</h4>
              <p className="text-xs text-gray-500">JPG, PNG, GIF up to 5MB.</p>
              <div className="flex gap-2 justify-center sm:justify-start">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => document.getElementById('modal-avatar-upload')?.click()}
                  disabled={isUploadingAvatar}
                >
                  Upload Image
                </Button>
                {avatarVal && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setValue('avatar', '')}
                  >
                    Remove
                  </Button>
                )}
                <input 
                  id="modal-avatar-upload" 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
              </div>
            </div>
          </div>

          {/* Video Upload */}
          <div className="flex flex-col items-center sm:flex-row gap-4 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6">
            <div className="relative group w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-zinc-950 flex items-center justify-center">
              {introVideoVal ? (
                <video src={introVideoVal} className="w-full h-full object-cover" />
              ) : (
                <Video className="w-8 h-8 text-zinc-600" />
              )}
              {isUploadingVideo && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <h4 className="text-sm font-semibold text-gray-800">Intro Video</h4>
              <p className="text-xs text-gray-500">MP4, WebM up to 50MB.</p>
              <div className="flex gap-2 justify-center sm:justify-start">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => document.getElementById('modal-video-upload')?.click()}
                  disabled={isUploadingVideo}
                >
                  Upload Video
                </Button>
                {introVideoVal && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setValue('introVideo', '')}
                  >
                    Remove
                  </Button>
                )}
                <input 
                  id="modal-video-upload" 
                  type="file" 
                  className="hidden" 
                  accept="video/*"
                  onChange={handleVideoUpload}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-[var(--primary-start)] pb-2">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input id="name" {...register('name')} className="mt-1" />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register('email')} className="mt-1" />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" {...register('phone')} className="mt-1" />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <Label htmlFor="username">Username *</Label>
            <Input id="username" {...register('username')} className="mt-1" />
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
          </div>
          <div>
            <Label htmlFor="specialization">Specialization *</Label>
            <Input id="specialization" {...register('specialization')} className="mt-1" />
            {errors.specialization && <p className="text-red-500 text-sm mt-1">{errors.specialization.message}</p>}
          </div>
          <div>
            <Label htmlFor="experience">Experience (Years) *</Label>
            <Input 
              id="experience" 
              type="number" 
              {...register('experience', { valueAsNumber: true })} 
              className="mt-1" 
            />
            {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience.message}</p>}
          </div>
        </div>
        <div>
          <Label htmlFor="bio">Bio *</Label>
          <Textarea id="bio" {...register('bio')} rows={3} className="mt-1" />
          {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>}
        </div>
      </div>

      {/* Education */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-[var(--primary-start)] pb-2">
          <h3 className="text-lg font-semibold text-gray-900">Education *</h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => appendEducation({ degree: '', institution: '', year: new Date().getFullYear() })}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Education
          </Button>
        </div>
        {educationFields.map((field, index) => (
          <div key={field.id} className="p-4 border border-[var(--primary-start)] rounded-lg relative">
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeEducation(index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Degree *</Label>
                <Input {...register(`education.${index}.degree`)} className="mt-1" />
                {errors.education?.[index]?.degree && 
                  <p className="text-red-500 text-sm mt-1">{errors.education[index]?.degree?.message}</p>}
              </div>
              <div>
                <Label>Institution *</Label>
                <Input {...register(`education.${index}.institution`)} className="mt-1" />
                {errors.education?.[index]?.institution && 
                  <p className="text-red-500 text-sm mt-1">{errors.education[index]?.institution?.message}</p>}
              </div>
              <div>
                <Label>Year *</Label>
                <Input 
                  type="number" 
                  {...register(`education.${index}.year`, { valueAsNumber: true })} 
                  className="mt-1" 
                />
                {errors.education?.[index]?.year && 
                  <p className="text-red-500 text-sm mt-1">{errors.education[index]?.year?.message}</p>}
              </div>
            </div>
          </div>
        ))}
        {errors.education && <p className="text-red-500 text-sm">{errors.education.message}</p>}
      </div>

      {/* Work History */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-[var(--primary-start)] pb-2">
          <h3 className="text-lg font-semibold text-gray-900">Work History *</h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => appendWorkHistory({ company: '', position: '', period: '' })}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Work History
          </Button>
        </div>
        {workHistoryFields.map((field, index) => (
          <div key={field.id} className="p-4 border border-[var(--primary-start)] rounded-lg relative">
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeWorkHistory(index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Company *</Label>
                <Input {...register(`workHistory.${index}.company`)} className="mt-1" />
                {errors.workHistory?.[index]?.company && 
                  <p className="text-red-500 text-sm mt-1">{errors.workHistory[index]?.company?.message}</p>}
              </div>
              <div>
                <Label>Position *</Label>
                <Input {...register(`workHistory.${index}.position`)} className="mt-1" />
                {errors.workHistory?.[index]?.position && 
                  <p className="text-red-500 text-sm mt-1">{errors.workHistory[index]?.position?.message}</p>}
              </div>
              <div>
                <Label>Period *</Label>
                <Input {...register(`workHistory.${index}.period`)} placeholder="e.g., 2018-Present" className="mt-1" />
                {errors.workHistory?.[index]?.period && 
                  <p className="text-red-500 text-sm mt-1">{errors.workHistory[index]?.period?.message}</p>}
              </div>
            </div>
          </div>
        ))}
        {errors.workHistory && <p className="text-red-500 text-sm">{errors.workHistory.message}</p>}
      </div>

      {/* Availability */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-[var(--primary-start)] pb-2">
          <h3 className="text-lg font-semibold text-gray-900">Availability *</h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => appendAvailability({ dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' })}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Time Slot
          </Button>
        </div>
        {availabilityFields.map((field, index) => {
          const dayVal = watch(`availability.${index}.dayOfWeek`);
          const startVal = watch(`availability.${index}.startTime`);
          const endVal = watch(`availability.${index}.endTime`);

          const dayHours = operatingHours?.find(
            (h) => h && h.day && h.day.toLowerCase() === dayVal?.toLowerCase()
          );

          const isClosed = dayHours?.is_closed;

          return (
            <div key={field.id} className="p-4 border-b border-[var(--primary-start)] rounded-lg relative">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeAvailability(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Day *</Label>
                  <Select
                    value={dayVal || undefined}
                    onValueChange={(value) => {
                      setValue(`availability.${index}.dayOfWeek`, value);
                      setValue(`availability.${index}.startTime`, '');
                      setValue(`availability.${index}.endTime`, '');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map(day => {
                        const dayOpenHours = operatingHours?.find(
                          (h) => h && h.day && h.day.toLowerCase() === day.toLowerCase()
                        );
                        const dayIsClosed = dayOpenHours?.is_closed;
                        return (
                          <SelectItem key={day} value={day} disabled={dayIsClosed}>
                            {day} {dayIsClosed ? '(Closed)' : ''}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {errors.availability?.[index]?.dayOfWeek && 
                    <p className="text-red-500 text-sm mt-1">{errors.availability[index]?.dayOfWeek?.message}</p>}
                  {isClosed && (
                    <p className="text-red-500 text-xs mt-1">Organization is closed on this day.</p>
                  )}
                </div>
                <div>
                  <Label>Start Time *</Label>
                  <TimePicker
                    value={startVal || ''}
                    disabled={!dayVal || isClosed}
                    minTime={dayHours?.open}
                    maxTime={dayHours?.close}
                    onChange={(value) => {
                      setValue(`availability.${index}.startTime`, value);
                      if (endVal && endVal <= value) {
                        setValue(`availability.${index}.endTime`, '');
                      }
                    }}
                  />
                  {errors.availability?.[index]?.startTime && 
                    <p className="text-red-500 text-sm mt-1">{errors.availability[index]?.startTime?.message}</p>}
                </div>
                <div>
                  <Label>End Time *</Label>
                  <TimePicker
                    value={endVal || ''}
                    disabled={!dayVal || isClosed || !startVal}
                    minTime={startVal || dayHours?.open}
                    maxTime={dayHours?.close}
                    onChange={(value) => setValue(`availability.${index}.endTime`, value)}
                  />
                  {errors.availability?.[index]?.endTime && 
                    <p className="text-red-500 text-sm mt-1">{errors.availability[index]?.endTime?.message}</p>}
                </div>
              </div>
            </div>
          );
        })}
        {errors.availability && <p className="text-red-500 text-sm">{errors.availability.message}</p>}
      </div>

      {/* Languages */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-[var(--primary-start)] pb-2">Languages *</h3>
        <div className="flex gap-2">
          <Input 
            value={languageInput}
            onChange={(e) => setLanguageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
            placeholder="Add a language"
            className="flex-1"
          />
          <Button type="button" onClick={addLanguage}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {languages.map((lang, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {lang}
              <button type="button" onClick={() => removeLanguage(lang)} className="hover:text-blue-600">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        {errors.languages && <p className="text-red-500 text-sm">{errors.languages.message}</p>}
      </div>

      {/* Tags */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-[var(--primary-start)] pb-2">Tags *</h3>
        <div className="flex gap-2">
          <Input 
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Add a tag"
            className="flex-1"
          />
          <Button type="button" onClick={addTag}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:text-green-600">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        {errors.tags && <p className="text-red-500 text-sm">{errors.tags.message}</p>}
      </div>

      {/* Services Selection */}
      <div className="space-y-4">
        <div className="border-b border-[var(--primary-start)] pb-2 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Assigned Services *</h3>
          <span className="text-xs text-gray-500 font-medium hidden sm:inline">
            Select the services this expert offers from your organization catalog
          </span>
        </div>

        {isLoadingServices ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            <p className="text-sm text-gray-500">Loading organization services...</p>
          </div>
        ) : orgServices.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center bg-gray-50/50">
            <p className="text-gray-500 text-sm mb-4">
              Your organization doesn't have any services configured yet.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                handleModalClose();
                window.location.href = '/services';
              }}
              className="inline-flex items-center gap-2"
            >
              Configure Services First
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 pb-1 border-b border-gray-100">
              {displayedCategories.map((cat) => {
                const isActive = selectedCategoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {filteredServices.length === 0 ? (
              <div className="py-8 text-center bg-gray-50/50 border border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-500 text-sm">No services found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredServices.map((orgService) => {
                  const isSelected = selectedServices.some(
                    (s: any) => s.name === orgService.name
                  );
                  return (
                    <div
                      key={orgService.id}
                      onClick={() => handleToggleService(orgService)}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 relative overflow-hidden flex gap-3 h-28 items-center ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/30 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/30'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-0 right-0 bg-indigo-600 text-white p-1 rounded-bl-lg z-10">
                          <Check className="h-3 w-3" />
                        </div>
                      )}

                      {orgService.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={orgService.imageUrl}
                          alt={orgService.name}
                          className="w-16 h-16 object-cover rounded-lg shrink-0 border border-gray-100"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                            {orgService.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {orgService.description || 'No description available'}
                          </p>
                        </div>
                        <div className="flex justify-between items-center mt-1 pt-1 border-t border-dashed border-gray-100">
                          <span className="text-xs text-gray-400 font-medium">
                            {orgService.durationMinutes || 60} mins
                          </span>
                          <span className="text-sm font-bold text-indigo-600">
                            ${Number(orgService.basePrice).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {errors.services && (
          <p className="text-red-500 text-sm mt-1">{errors.services.message}</p>
        )}
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-[var(--primary-start)] pb-2">Social Links</h3>
        <div>
          <Label htmlFor="linkedin">LinkedIn Profile</Label>
          <Input id="linkedin" {...register('socialLinks.linkedin')} placeholder="https://linkedin.com/in/..." className="mt-1" />
          {errors.socialLinks?.linkedin && <p className="text-red-500 text-sm mt-1">{errors.socialLinks.linkedin.message}</p>}
        </div>
      </div>
    </form>

    {isLoading && (
    <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Loading expert details...</p>
      </div>
    </div>
  )}
  </Modal>
);
}
