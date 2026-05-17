// components/AddExpertModal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Trash2, Check } from 'lucide-react';
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
import Modal from '../modal/Modal';
import { apiClient } from '@/client/api/api-client';
import { toast } from 'sonner';

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
  consultationFee: z.number().min(0, 'Consultation fee must be positive'),
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
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

export default function AddEditExpertModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  mode,
  isLoading = false 
}: AddEditExpertModalProps) {
  const [languageInput, setLanguageInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [orgServices, setOrgServices] = useState<any[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchServices = async () => {
        setIsLoadingServices(true);
        try {
          const response = await apiClient<any>(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/organizations/services`
          );
          if (response?.services) {
            setOrgServices(response.services);
          }
        } catch (error) {
          console.error('Failed to load organization services:', error);
        } finally {
          setIsLoadingServices(false);
        }
      };
      fetchServices();
    }
  }, [isOpen]);

  const handleModalClose = () => {
    setSubmitError('');
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
    },
  });

    // Reset form when initialData changes or modal opens
  useEffect(() => {
    if (isOpen && initialData) {
      const formatted = {
        ...initialData,
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
      });
    }
  }, [isOpen, initialData, reset]);

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
          <div>
            <Label htmlFor="consultationFee">Consultation Fee (₹) *</Label>
            <Input 
              id="consultationFee" 
              type="number" 
              {...register('consultationFee', { valueAsNumber: true })} 
              className="mt-1" 
            />
            {errors.consultationFee && <p className="text-red-500 text-sm mt-1">{errors.consultationFee.message}</p>}
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
        {availabilityFields.map((field, index) => (
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
                <Select onValueChange={(value) => setValue(`availability.${index}.dayOfWeek`, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.availability?.[index]?.dayOfWeek && 
                  <p className="text-red-500 text-sm mt-1">{errors.availability[index]?.dayOfWeek?.message}</p>}
              </div>
              <div>
                <Label>Start Time *</Label>
                <Select onValueChange={(value) => setValue(`availability.${index}.startTime`, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.availability?.[index]?.startTime && 
                  <p className="text-red-500 text-sm mt-1">{errors.availability[index]?.startTime?.message}</p>}
              </div>
              <div>
                <Label>End Time *</Label>
                <Select onValueChange={(value) => setValue(`availability.${index}.endTime`, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.availability?.[index]?.endTime && 
                  <p className="text-red-500 text-sm mt-1">{errors.availability[index]?.endTime?.message}</p>}
              </div>
            </div>
          </div>
        ))}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {orgServices.map((orgService) => {
              const isSelected = selectedServices.some(
                (s: any) => s.name === orgService.name
              );
              return (
                <div
                  key={orgService.id}
                  onClick={() => handleToggleService(orgService)}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 relative overflow-hidden flex flex-col justify-between h-28 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/30 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/30'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white p-1 rounded-bl-lg">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                      {orgService.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {orgService.description || 'No description available'}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-2 border-t pt-2 border-dashed border-gray-100">
                    <span className="text-xs text-gray-400 font-medium">
                      {orgService.durationMinutes || 60} mins
                    </span>
                    <span className="text-sm font-bold text-indigo-600">
                      ₹{Number(orgService.basePrice).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
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
