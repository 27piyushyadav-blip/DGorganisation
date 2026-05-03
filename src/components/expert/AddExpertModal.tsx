// components/AddExpertModal.tsx
'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Trash2 } from 'lucide-react';
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

const addExpertSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
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
});

type AddExpertFormData = z.infer<typeof addExpertSchema>;
export type { AddExpertFormData };

interface AddExpertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpert: (data: AddExpertFormData) => Promise<void>;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

export default function AddExpertModal({ isOpen, onClose, onAddExpert }: AddExpertModalProps) {
  const [languageInput, setLanguageInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleModalClose = () => {
    setSubmitError('');
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
    defaultValues: {
      name: '',
      email: '',
      username: '',
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
    },
  });

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

  const onSubmit = async (data: AddExpertFormData) => {
    setSubmitError('');

    try {
      await onAddExpert(data);
      reset();
      handleModalClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add expert';
      setSubmitError(message);
    }
  };

  if (!isOpen) return null;

return (
  <Modal
    isOpen={isOpen}
    onClose={handleModalClose}
    title="Add New Expert"
    size="xl"
    showCloseButton={true}
    confirmButtonText="Add Expert"
    cancelButtonText="Cancel"
    onConfirm={handleSubmit(onSubmit)}
    onCancel={handleModalClose}
    isConfirmLoading={isSubmitting}
  >
    <form id="add-expert-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-[var(--card-bg-light)]">
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

      {/* Services */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-[var(--primary-start)] pb-2">
          <h3 className="text-lg font-semibold text-gray-900">Services *</h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => appendService({ name: '', price: 0, duration: 60 })}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Service
          </Button>
        </div>
        {serviceFields.map((field, index) => (
          <div key={field.id} className="p-4 border border-[var(--primary-start)] rounded-lg relative">
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeService(index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Service Name *</Label>
                <Input {...register(`services.${index}.name`)} className="mt-1" />
                {errors.services?.[index]?.name && 
                  <p className="text-red-500 text-sm mt-1">{errors.services[index]?.name?.message}</p>}
              </div>
              <div>
                <Label>Price (₹) *</Label>
                <Input 
                  type="number" 
                  {...register(`services.${index}.price`, { valueAsNumber: true })} 
                  className="mt-1" 
                />
                {errors.services?.[index]?.price && 
                  <p className="text-red-500 text-sm mt-1">{errors.services[index]?.price?.message}</p>}
              </div>
              <div>
                <Label>Duration (minutes) *</Label>
                <Input 
                  type="number" 
                  {...register(`services.${index}.duration`, { valueAsNumber: true })} 
                  className="mt-1" 
                />
                {errors.services?.[index]?.duration && 
                  <p className="text-red-500 text-sm mt-1">{errors.services[index]?.duration?.message}</p>}
              </div>
            </div>
          </div>
        ))}
        {errors.services && <p className="text-red-500 text-sm">{errors.services.message}</p>}
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
  </Modal>
);
}
