// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Copy, 
  CheckCircle, 
  Calendar, 
  Clock, 
  CreditCard, 
  Wallet, 
  MessageSquare,
  Mail,
  Send,
  Plus,
  Trash2,
  User,
  Users,
  Link2,
  FileText,
  ChevronRight,
  Eye,
  AlertCircle,
  Sparkles,
  Star,
  Award,
  Briefcase,
  Minus,
  type LucideIcon
} from 'lucide-react';
import { Calendar as DatePickerCalendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  getOrganizationServicesApi,
  getOrganizationExpertsForOrderApi,
  createVoiceCallBookingApi,
  sendPaymentLinkApi,
} from '@/client/api/services-bookings';

// Service type definition
type Service = {
  id: string;
  name: string;
  duration: string;
  price: number;
  category?: string;
  image: string;
};

// Expert type definition
type Expert = {
  id: string;
  name: string;
  role: string;
  experience: string;
  rating: number;
  reviewCount: number;
  image: string;
  specialties: string[];
  available: boolean;
  services?: any[];
};

// Selected service with quantity
type SelectedService = Service & {
  quantity: number;
};

// Customer details type
type CustomerDetails = {
  name: string;
  phone: string;
  email: string;
  notes: string;
};

type ServiceImageProps = {
  src: string;
  alt: string;
  className: string;
};

// Fallback services — shown while API loads or if it fails
const FALLBACK_SERVICES: Service[] = [
  { id: '1', name: 'Deep Tissue Massage', duration: '60 min', price: 120, category: 'Massage', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=150&h=150&fit=crop' },
  { id: '2', name: 'Hair Spa Treatment', duration: '60 min', price: 90, category: 'Hair', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=150&h=150&fit=crop' },
  { id: '3', name: 'Aromatherapy Massage', duration: '60 min', price: 110, category: 'Massage', image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=150&h=150&fit=crop' },
  { id: '4', name: 'Swedish Massage', duration: '90 min', price: 150, category: 'Massage', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=150&h=150&fit=crop' },
  { id: '5', name: 'Facial Treatment', duration: '45 min', price: 85, category: 'Facial', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=150&h=150&fit=crop' },
  { id: '6', name: 'Hot Stone Massage', duration: '75 min', price: 140, category: 'Massage', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=150&h=150&fit=crop' },
  { id: '7', name: 'Manicure & Pedicure', duration: '60 min', price: 65, category: 'Nails', image: 'https://images.unsplash.com/photo-1610991923496-b62c5e2d34cf?w=150&h=150&fit=crop' },
  { id: '8', name: 'Body Scrub', duration: '45 min', price: 95, category: 'Body', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=150&h=150&fit=crop' },
];

// Fallback experts — shown while API loads or if it fails
const FALLBACK_EXPERTS: Expert[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Senior Massage Therapist',
    experience: '8 years',
    rating: 4.9,
    reviewCount: 234,
    image: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&h=150&fit=crop',
    specialties: ['Deep Tissue', 'Sports Massage', 'Trigger Point'],
    available: true,
    services: ['1', '3', '4', '6'],
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Hair Stylist Specialist',
    experience: '10 years',
    rating: 4.8,
    reviewCount: 189,
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop',
    specialties: ['Hair Styling', 'Color Treatment', 'Hair Spa'],
    available: true,
    services: ['2'],
  },
  {
    id: '3',
    name: 'Emma Williams',
    role: 'Aromatherapy Expert',
    experience: '6 years',
    rating: 4.9,
    reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    specialties: ['Aromatherapy', 'Swedish Massage', 'Relaxation'],
    available: true,
    services: ['3', '4'],
  },
  {
    id: '4',
    name: 'David Rodriguez',
    role: 'Facial Specialist',
    experience: '7 years',
    rating: 4.7,
    reviewCount: 142,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    specialties: ['Anti-aging', 'Acne Treatment', 'Hydrafacial'],
    available: false,
    services: ['5'],
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    role: 'Nail Care Expert',
    experience: '5 years',
    rating: 4.8,
    reviewCount: 98,
    image: 'https://images.unsplash.com/photo-1534751516642-1d2aa6d3f2d0?w=150&h=150&fit=crop',
    specialties: ['Manicure', 'Pedicure', 'Nail Art'],
    available: true,
    services: ['7'],
  },
  {
    id: '6',
    name: 'James Wilson',
    role: 'Body Therapy Specialist',
    experience: '9 years',
    rating: 4.9,
    reviewCount: 267,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    specialties: ['Body Scrub', 'Hot Stone', 'Therapy'],
    available: true,
    services: ['6', '8'],
  },
];

type TabType = 'customer' | 'services' | 'experts' | 'payment' | 'summary';

const serviceCategoryMeta: Record<string, { icon: LucideIcon; badgeClassName: string; iconClassName: string }> = {
  Massage: {
    icon: Sparkles,
    badgeClassName: 'bg-blue-50 text-blue-700',
    iconClassName: 'text-blue-600',
  },
  Hair: {
    icon: Star,
    badgeClassName: 'bg-violet-50 text-violet-700',
    iconClassName: 'text-violet-600',
  },
  Facial: {
    icon: Award,
    badgeClassName: 'bg-amber-50 text-amber-700',
    iconClassName: 'text-amber-600',
  },
  Nails: {
    icon: CheckCircle,
    badgeClassName: 'bg-emerald-50 text-emerald-700',
    iconClassName: 'text-emerald-600',
  },
  Body: {
    icon: Briefcase,
    badgeClassName: 'bg-rose-50 text-rose-700',
    iconClassName: 'text-rose-600',
  },
};

const timeSlots = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
  '05:30 PM',
  '06:00 PM',
];

const buildAvailableDates = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index + 1);
    return date;
  });
};

const formatAppointmentDate = (date: Date) =>
  date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const getServiceCategoryMeta = (category?: string) =>
  serviceCategoryMeta[category ?? ''] ?? {
    icon: Sparkles,
    badgeClassName: 'bg-slate-100 text-slate-700',
    iconClassName: 'text-slate-600',
  };

function ServiceImage({ src, alt, className }: ServiceImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-gradient-to-br from-blue-100 to-slate-200 text-blue-600`}
        aria-label={`${alt} placeholder`}
      >
        <Sparkles className="w-1/2 h-1/2" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
    />
  );
}

export default function Home() {
  // Active tab state
  const [activeTab, setActiveTab] = useState<TabType>('customer');
  
  // Customer details state
  const [customer, setCustomer] = useState<CustomerDetails>({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [notesCharCount, setNotesCharCount] = useState(0);
  
  // Touched fields state for real-time validation error rendering
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const getValidationError = (field: string, value: string): string | null => {
    if (field === 'name') {
      if (!value.trim()) return 'Full Name is required';
      if (value.trim().length < 2) return 'Full Name must be at least 2 characters';
      if (!/^[a-zA-Z\s]+$/.test(value)) return 'Full Name must contain only letters and spaces';
    }
    if (field === 'phone') {
      if (!value.trim()) return 'Phone Number is required';
      
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length < 6) {
        return 'Please enter a valid phone number';
      }
    }
    if (field === 'email') {
      if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Please enter a valid email address';
      }
    }
    return null;
  };

  // ── Live data from organization API (falls back to FALLBACK constants) ──────
  const [availableServices, setAvailableServices] = useState<Service[]>(FALLBACK_SERVICES);
  const [availableExperts, setAvailableExperts] = useState<Expert[]>(FALLBACK_EXPERTS);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [expertsLoading, setExpertsLoading] = useState(true);

  // ── Order submission state ────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Services state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  
  // Experts state
  const [expertSearchQuery, setExpertSearchQuery] = useState('');
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  
  // Payment link state
  const [orderId] = useState(() => `#VO-${Math.floor(Math.random() * 90000) + 10000}`);
  const [paymentLink, setPaymentLink] = useState('');
  const [createdBooking, setCreatedBooking] = useState<any | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [paymentSent, setPaymentSent] = useState(false);
  const [sendingMethod, setSendingMethod] = useState<string | null>(null);
  const [isSendingPayment, setIsSendingPayment] = useState(false);
  const [sendPaymentError, setSendPaymentError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isDateTimeDialogOpen, setIsDateTimeDialogOpen] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(null);
  const [tempSelectedTime, setTempSelectedTime] = useState<string | null>(null);
  const availableDates = buildAvailableDates();

  // ── Load real services & experts from the org backend on mount ─────────────
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      // Load services
      try {
        const res = await getOrganizationServicesApi();
        if (!cancelled && res.services && res.services.length > 0) {
          setAvailableServices(
            res.services.map((s) => ({
              id: s.id,
              name: s.name,
              duration: s.duration ? `${s.duration} min` : '60 min',
              price: s.basePrice,
              category: s.category || 'General',
              image:
                s.image ||
                'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=150&h=150&fit=crop',
            }))
          );
        }
      } catch {
        // FALLBACK_SERVICES already in state
      } finally {
        if (!cancelled) setServicesLoading(false);
      }

      // Load experts
      try {
        const res = await getOrganizationExpertsForOrderApi();
        if (!cancelled && res.experts && res.experts.length > 0) {
          setAvailableExperts(
            res.experts.map((e) => ({
              id: e.id,
              name: e.name,
              role: e.specialization || e.role || 'Specialist',
              experience: e.experience ? `${e.experience} years` : 'Experienced',
              rating: e.rating ?? 4.8,
              reviewCount: e.reviewCount ?? 0,
              image:
                e.avatar ||
                'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&h=150&fit=crop',
              specialties: e.specialties?.length
                ? e.specialties
                : e.specialization
                ? [e.specialization]
                : [],
              available: e.status === 'active' || e.available !== false,
              services: e.services || [],
            }))
          );
        }
      } catch {
        // FALLBACK_EXPERTS already in state
      } finally {
        if (!cancelled) setExpertsLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  // Auto-generate booking & payment link when landing on payment tab with date/time selected
  useEffect(() => {
    if (activeTab === 'payment' && selectedDate && selectedTime && !createdBooking && !isSubmitting) {
      const autoCreate = async () => {
        setIsSubmitting(true);
        setSendPaymentError(null);
        try {
          const res = await createVoiceCallBookingApi({
            customerName: customer.name,
            customerPhone: customer.phone,
            customerEmail: customer.email || undefined,
            customerNotes: customer.notes || undefined,
            services: selectedServices.map((s) => ({
              id: s.id,
              name: s.name,
              price: s.price,
              quantity: s.quantity,
            })),
            expertId: selectedExpert?.id ?? null,
            scheduledDate: selectedDate.toISOString(),
            scheduledTime: selectedTime,
            totalAmount,
          });
          setCreatedBooking(res.booking);
          setPaymentLink(res.booking.paymentLink || `http://localhost:3002/invoice/${res.booking.id}`);
        } catch (err: any) {
          setSendPaymentError(err?.message || 'Failed to auto-generate payment link.');
        } finally {
          setIsSubmitting(false);
        }
      };
      autoCreate();
    }
  }, [activeTab, selectedDate, selectedTime]);

  // Order date
  const orderDate = selectedDate ?? new Date(2025, 4, 18, 11, 30);
  const formattedDate = orderDate.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  const formattedTime = orderDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Calculate total amount
  const totalAmount = selectedServices.reduce(
    (sum, service) => sum + service.price * service.quantity, 
    0
  );

  // Filter services based on search query
  const filteredServices = availableServices.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const appointmentLabel =
    selectedDate && selectedTime
      ? `${formatAppointmentDate(selectedDate)} at ${selectedTime}`
      : 'Select date & time';

  // Filter experts based on selected services and search query
  const filteredExperts = availableExperts.filter(expert => {
    // Only show experts who provide at least one of the selected services
    if (selectedServices.length > 0) {
      const hasMatchingService = selectedServices.some(selected => {
        if (!expert.services || !Array.isArray(expert.services)) return false;
        return expert.services.some((s: any) => {
          if (!s) return false;
          if (typeof s === 'object') {
            return s.id === selected.id || s._id === selected.id || s.name === selected.name;
          }
          return s === selected.id || s === selected.name;
        });
      });
      if (!hasMatchingService) return false;
    }

    return (
      expert.name.toLowerCase().includes(expertSearchQuery.toLowerCase()) ||
      expert.role.toLowerCase().includes(expertSearchQuery.toLowerCase()) ||
      expert.specialties.some(specialty => specialty.toLowerCase().includes(expertSearchQuery.toLowerCase()))
    );
  });

  // Add service to selected list
  const addService = (service: Service) => {
    const existing = selectedServices.find(s => s.id === service.id);
    if (existing) {
      setSelectedServices(prev =>
        prev.map(s =>
          s.id === service.id ? { ...s, quantity: s.quantity + 1 } : s
        )
      );
    } else {
      setSelectedServices(prev => [...prev, { ...service, quantity: 1 }]);
    }
  };

  // Remove service from selected list
  const removeService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
  };

  // Update quantity
  const updateQuantity = (serviceId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeService(serviceId);
      return;
    }
    setSelectedServices(prev =>
      prev.map(s =>
        s.id === serviceId ? { ...s, quantity: newQuantity } : s
      )
    );
  };

  // Copy payment link to clipboard
  const copyPaymentLink = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle notes change with character limit
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 200) {
      setCustomer(prev => ({ ...prev, notes: value }));
      setNotesCharCount(value.length);
    }
  };

  // Handle sending payment link
  const handleSendPayment = async (method: string) => {
    setSendingMethod(method);
    setSendPaymentError(null);
    setPaymentSent(false);

    try {
      let currentBooking = createdBooking;
      let currentPaymentLink = paymentLink;

      if (!currentBooking) {
        setIsSendingPayment(true);
        const res = await createVoiceCallBookingApi({
          customerName: customer.name,
          customerPhone: customer.phone,
          customerEmail: customer.email || undefined,
          customerNotes: customer.notes || undefined,
          services: selectedServices.map((s) => ({
            id: s.id,
            name: s.name,
            price: s.price,
            quantity: s.quantity,
          })),
          expertId: selectedExpert?.id ?? null,
          scheduledDate: selectedDate ? selectedDate.toISOString() : null,
          scheduledTime: selectedTime ?? null,
          totalAmount,
        });
        currentBooking = res.booking;
        setCreatedBooking(res.booking);
        currentPaymentLink = res.booking.paymentLink || `http://localhost:3002/invoice/${res.booking.id}`;
        setPaymentLink(currentPaymentLink);
      }

      if (method === 'Email') {
        if (!customer.email || !customer.email.trim()) {
          setSendPaymentError('Customer email address is required to send payment link.');
          return;
        }

        setIsSendingPayment(true);
        await sendPaymentLinkApi({
          customerEmail: customer.email,
          customerName: customer.name,
          paymentLink: currentPaymentLink,
          totalAmount: totalAmount
        });
        setPaymentSent(true);
        setTimeout(() => setPaymentSent(false), 5000);
      } else {
        // Mock SMS and WhatsApp options using the real link
        setIsSendingPayment(true);
        setTimeout(() => {
          setIsSendingPayment(false);
          setPaymentSent(true);
          setTimeout(() => setPaymentSent(false), 3000);
        }, 600);
      }
    } catch (err: any) {
      setSendPaymentError(err?.message || 'Failed to generate booking or send payment link. Please try again.');
    } finally {
      setIsSendingPayment(false);
    }
  };

  const openDateTimeDialog = () => {
    setTempSelectedDate(selectedDate ?? availableDates[0] ?? null);
    setTempSelectedTime(selectedTime);
    setIsDateTimeDialogOpen(true);
  };

  const handleDateTimeConfirm = () => {
    if (!tempSelectedDate || !tempSelectedTime) {
      return;
    }

    setSelectedDate(tempSelectedDate);
    setSelectedTime(tempSelectedTime);
    setIsDateTimeDialogOpen(false);
  };

  // Check if current tab is complete
  const isTabComplete = (tab: TabType): boolean => {
    switch (tab) {
      case 'customer':
        return (
          customer.name.trim() !== '' &&
          customer.phone.trim() !== '' &&
          getValidationError('name', customer.name) === null &&
          getValidationError('phone', customer.phone) === null &&
          getValidationError('email', customer.email) === null
        );
      case 'services':
        return selectedServices.length > 0;
      case 'experts':
        return true; // Expert selection is optional
      case 'payment':
        return Boolean(selectedDate && selectedTime);
      case 'summary':
        return true;
      default:
        return false;
    }
  };

  // Get tab completion status
  const getTabStatus = (tab: TabType): 'completed' | 'current' | 'pending' => {
    if (activeTab === tab) return 'current';
    const tabIndex = tabs.findIndex(t => t.id === tab);
    const activeIndex = tabs.findIndex(t => t.id === activeTab);
    if (tabIndex < activeIndex && isTabComplete(tabs[tabIndex].id)) return 'completed';
    return 'pending';
  };

  const tabs = [
    { id: 'customer' as TabType, label: 'Customer Details', icon: User, description: 'Contact information' },
    { id: 'services' as TabType, label: 'Select Services', icon: Sparkles, description: 'Add requested services' },
    { id: 'experts' as TabType, label: 'Select Expert', icon: Users, description: 'Choose preferred expert' },
    { id: 'payment' as TabType, label: 'Payment Link', icon: Link2, description: 'Generate & send' },
    { id: 'summary' as TabType, label: 'Order Summary', icon: FileText, description: 'Review & confirm' },
  ];

  const goToTab = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'payment' && (!selectedDate || !selectedTime)) {
      openDateTimeDialog();
    }
  };

  // Handle next tab
  const goToNextTab = () => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    if (currentIndex < tabs.length - 1 && isTabComplete(activeTab)) {
      goToTab(tabs[currentIndex + 1].id);
    }
  };

  // Handle previous tab
  const goToPrevTab = () => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    if (currentIndex > 0) {
      goToTab(tabs[currentIndex - 1].id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <div className="text-left mb-3">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Create Order via <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Voice Call</span>
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Add services, select expert, generate link & send payment receipt to customer
          </p>
        </div>

        {/* Modern Tab Bar */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-100 p-1.5">
            <div className="flex flex-wrap gap-1">
              {tabs.map((tab, idx) => {
                const Icon = tab.icon;
                const status = getTabStatus(tab.id);
                const isActive = activeTab === tab.id;
                const isCompleted = status === 'completed';
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      // Allow navigation to completed tabs or previous tabs
                      if (isCompleted || idx <= tabs.findIndex(t => t.id === activeTab)) {
                        goToTab(tab.id);
                      }
                    }}
                    className={`
                      flex-1 flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                        : isCompleted
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }
                      ${!isCompleted && !isActive && idx > tabs.findIndex(t => t.id === activeTab) 
                        ? 'cursor-not-allowed opacity-50' 
                        : 'cursor-pointer'
                      }
                    `}
                    disabled={!isCompleted && !isActive && idx > tabs.findIndex(t => t.id === activeTab)}
                  >
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center transition-all
                      ${isActive 
                        ? 'bg-white/20' 
                        : isCompleted
                          ? 'bg-green-100'
                          : 'bg-slate-100'
                      }
                    `}>
                      {isCompleted && !isActive ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : isCompleted ? 'text-green-600' : 'text-slate-400'}`} />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-medium ${isActive ? 'text-white' : isCompleted ? 'text-green-700' : 'text-slate-600'}`}>
                        {tab.label}
                      </p>
                      <p className={`text-xs ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
                        {tab.description}
                      </p>
                    </div>
                    {idx < tabs.length - 1 && (
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white/50' : 'text-slate-300'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
              {/* Customer Details Tab */}
              {activeTab === 'customer' && (
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">Customer Information</h2>
                      <p className="text-sm text-slate-500">Enter the customer&apos;s contact details</p>
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customer.name}
                        onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                        onChange={(e) => {
                          setCustomer(prev => ({ ...prev, name: e.target.value }));
                          setTouched(prev => ({ ...prev, name: true }));
                        }}
                        className={cn(
                          "w-full px-4 py-2.5 border rounded-xl focus:ring-2 outline-none transition bg-slate-50/30",
                          touched.name && getValidationError('name', customer.name)
                            ? "border-red-300 focus:ring-red-500 focus:border-transparent"
                            : "border-slate-200 focus:ring-blue-500 focus:border-transparent"
                        )}
                        placeholder="Enter customer name"
                      />
                      {touched.name && getValidationError('name', customer.name) && (
                        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {getValidationError('name', customer.name)}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={customer.phone}
                        onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                        onChange={(e) => {
                          setCustomer(prev => ({ ...prev, phone: e.target.value }));
                          setTouched(prev => ({ ...prev, phone: true }));
                        }}
                        className={cn(
                          "w-full px-4 py-2.5 border rounded-xl focus:ring-2 outline-none transition bg-slate-50/30",
                          touched.phone && getValidationError('phone', customer.phone)
                            ? "border-red-300 focus:ring-red-500 focus:border-transparent"
                            : "border-slate-200 focus:ring-blue-500 focus:border-transparent"
                        )}
                        placeholder="+61 400 000 000"
                      />
                      {touched.phone && getValidationError('phone', customer.phone) && (
                        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{getValidationError('phone', customer.phone)}</span>
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={customer.email}
                        onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                        onChange={(e) => {
                          setCustomer(prev => ({ ...prev, email: e.target.value }));
                          setTouched(prev => ({ ...prev, email: true }));
                        }}
                        className={cn(
                          "w-full px-4 py-2.5 border rounded-xl focus:ring-2 outline-none transition bg-slate-50/30",
                          touched.email && getValidationError('email', customer.email)
                            ? "border-red-300 focus:ring-red-500 focus:border-transparent"
                            : "border-slate-200 focus:ring-blue-500 focus:border-transparent"
                        )}
                        placeholder="Enter email address"
                      />
                      {touched.email && getValidationError('email', customer.email) && (
                        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {getValidationError('email', customer.email)}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-sm font-medium text-slate-700">
                          Notes (Optional)
                        </label>
                        <span className="text-xs text-slate-400">{notesCharCount} / 200</span>
                      </div>
                      <textarea
                        value={customer.notes}
                        onChange={handleNotesChange}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none bg-slate-50/30"
                        placeholder="Add any additional notes about the order..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Select Services Tab */}
              {activeTab === 'services' && (
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">Select Services</h2>
                      <p className="text-sm text-slate-500">Add the services requested by customer</p>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative mb-5">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search services..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-slate-50/30"
                    />
                  </div>

                  {/* Available Services */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="text-sm font-medium text-slate-700">Available Services</p>
                        <p className="text-xs text-slate-500">
                          {searchQuery ? `Showing ${filteredServices.length} result(s)` : 'Browse all services and add them to this order'}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500">{availableServices.length} total</p>
                    </div>

                    <div className='max-h-[20rem] overflow-y-scroll'>
                    {servicesLoading ? (
                      <div className="grid gap-3 md:grid-cols-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 animate-pulse">
                            <div className="flex items-start gap-3">
                              <div className="w-16 h-16 rounded-2xl bg-slate-200 flex-shrink-0" />
                              <div className="flex-1 space-y-2 pt-1">
                                <div className="h-4 bg-slate-200 rounded w-3/4" />
                                <div className="h-3 bg-slate-200 rounded w-1/2" />
                                <div className="h-7 bg-slate-200 rounded w-1/3 mt-3" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : filteredServices.length > 0 ? (
                      <div className="grid gap-3 md:grid-cols-2">
                        {filteredServices.map((service) => {
                          const serviceInCart = selectedServices.find((selectedService) => selectedService.id === service.id);
                          const categoryMeta = getServiceCategoryMeta(service.category);
                          const CategoryIcon = categoryMeta.icon;

                          return (
                            <div
                              key={service.id}
                              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
                            >
                              <div className="flex items-start gap-3">
                                <ServiceImage
                                  src={service.image}
                                  alt={service.name}
                                  className="w-16 h-16 rounded-2xl object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className="font-medium text-slate-800">{service.name}</p>
                                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                        <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium', categoryMeta.badgeClassName)}>
                                          <CategoryIcon className="w-3.5 h-3.5" />
                                          {service.category}
                                        </span>
                                        <span className="text-slate-500">{service.duration}</span>
                                      </div>
                                    </div>
                                    <span className="text-base font-semibold text-blue-600">${service.price}</span>
                                  </div>
                                  <div className="mt-4 flex items-center justify-between">
                                    <p className="text-xs text-slate-500">
                                      {serviceInCart ? `${serviceInCart.quantity} selected` : 'Tap add to include'}
                                    </p>
                                    <button
                                      onClick={() => addService(service)}
                                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                                    >
                                      <Plus className="w-4 h-4" />
                                      Add
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-slate-50 rounded-xl">
                        <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-400">No services found</p>
                        <p className="text-xs text-slate-400">Try a different search term</p>
                      </div>
                    )}
                    </div>
                  </div>

                  {/* Selected Services */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm font-medium text-slate-700">Selected Services</p>
                      <p className="text-xs text-slate-500">{selectedServices.length} item(s)</p>
                    </div>
                    
                    <div className='max-h-[10rem] overflow-y-scroll'>
                    {selectedServices.length > 0 ? (
                        <div className="space-y-2">
                            {selectedServices.map((service) => {
                            const categoryMeta = getServiceCategoryMeta(service.category);
                            const CategoryIcon = categoryMeta.icon;

                            return (
                            <div
                                key={service.id}
                                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                            >
                                <ServiceImage
                                  src={service.image}
                                  alt={service.name}
                                  className="w-12 h-12 rounded-xl object-cover"
                                />
                                <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', categoryMeta.badgeClassName)}>
                                    <CategoryIcon className={cn('w-4 h-4', categoryMeta.iconClassName)} />
                                  </div>
                                  <div>
                                    <p className="font-medium text-slate-800">{service.name}</p>
                                    <p className="text-xs text-slate-500">{service.category} - {service.duration}</p>
                                  </div>
                                </div>
                                </div>
                                <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <button
                                    onClick={() => updateQuantity(service.id, service.quantity - 1)}
                                    className="w-7 h-7 rounded-full bg-white  flex items-center justify-center text-slate-600 hover:bg-blue-50 hover:border-blue-200 transition cursor-pointer"
                                    >
                                    <Minus className='w-5 h-5'/>
                                    </button>
                                    <span className="w-8 text-center font-medium text-sm">{service.quantity}</span>
                                    <button
                                    onClick={() => updateQuantity(service.id, service.quantity + 1)}
                                    className="w-7 h-7 rounded-full bg-white   flex items-center justify-center text-slate-600 hover:bg-blue-50 hover:border-blue-200 transition cursor-pointer"
                                    >
                                    <Plus className='w-5 h-5'/>
                                    </button>
                                </div>
                                <div className="w-20 text-right font-semibold text-blue-600">
                                    ${service.price * service.quantity}
                                </div>
                                <button
                                    onClick={() => removeService(service.id)}
                                    className="text-slate-400 hover:text-red-500 transition"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                </div>
                            </div>
                            );
                            })}
                            
              
                        </div>
                        ) : (
                        <div className="text-center py-10 bg-slate-50 rounded-xl">
                            <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-slate-400">No services selected</p>
                            <p className="text-xs text-slate-400">Search and add services above</p>
                        </div>
                        )}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                            <span className="font-semibold text-slate-800">Total Amount</span>
                            <span className="text-2xl font-bold text-blue-600">${totalAmount}</span>
                            </div>
                  </div>
                </div>
              )}

              {/* Select Expert Tab */}
              {activeTab === 'experts' && (
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">Select Expert</h2>
                      <p className="text-sm text-slate-500">Choose a preferred expert for this order (optional)</p>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative mb-5">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by name, role, or specialty..."
                      value={expertSearchQuery}
                      onChange={(e) => setExpertSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-slate-50/30"
                    />
                  </div>

                  {/* Expert Cards Grid */}
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {expertsLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="rounded-xl border-2 border-slate-200 p-4 animate-pulse">
                            <div className="flex gap-4">
                              <div className="w-20 h-20 rounded-xl bg-slate-200 flex-shrink-0" />
                              <div className="flex-1 space-y-2 pt-1">
                                <div className="h-4 bg-slate-200 rounded w-1/2" />
                                <div className="h-3 bg-slate-200 rounded w-1/3" />
                                <div className="flex gap-2 mt-2">
                                  <div className="h-5 bg-slate-200 rounded-full w-20" />
                                  <div className="h-5 bg-slate-200 rounded-full w-24" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : filteredExperts.length > 0 ? (
                      filteredExperts.map((expert) => (
                        <div
                          key={expert.id}
                          onClick={() => expert.available && setSelectedExpert(expert)}
                          className={`
                            relative p-4 rounded-xl border-2 transition-all cursor-pointer
                            ${selectedExpert?.id === expert.id 
                              ? 'border-blue-500 bg-blue-50/50 shadow-md' 
                              : expert.available 
                                ? 'border-slate-200 hover:border-blue-300 hover:bg-slate-50' 
                                : 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                            }
                          `}
                        >
                          {!expert.available && (
                            <div className="absolute top-3 right-3 bg-slate-400 text-white text-xs px-2 py-0.5 rounded-full">
                              Unavailable
                            </div>
                          )}
                          <div className="flex gap-4">
                            <ServiceImage
                              src={expert.image}
                              alt={expert.name}
                              className="w-20 h-20 rounded-xl object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-slate-800">{expert.name}</h3>
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm font-medium text-slate-700">{expert.rating}</span>
                                  <span className="text-xs text-slate-400">({expert.reviewCount})</span>
                                </div>
                              </div>
                              <p className="text-sm text-blue-600 mb-2">{expert.role}</p>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {expert.specialties.map((specialty, idx) => (
                                  <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                    {specialty}
                                  </span>
                                ))}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Briefcase className="w-3 h-3" />
                                  {expert.experience} exp.
                                </span>
                                <span className="flex items-center gap-1">
                                  <Award className="w-3 h-3" />
                                  Certified Professional
                                </span>
                              </div>
                            </div>
                          </div>
                          {selectedExpert?.id === expert.id && (
                            <div className="absolute bottom-3 right-3">
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 bg-slate-50 rounded-xl">
                        <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-400">No experts found</p>
                        <p className="text-xs text-slate-400">Try a different search term</p>
                      </div>
                    )}
                  </div>

                  {/* Selected Expert Summary */}
                  {selectedExpert && (
                    <div className="mt-5 p-3 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Selected Expert: {selectedExpert.name}</span>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        {selectedExpert.name} will be assigned to this order
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Link Tab */}
              {activeTab === 'payment' && (
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Link2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">Generate Payment Link</h2>
                      <p className="text-sm text-slate-500">Create and send payment link to customer</p>
                    </div>
                  </div>

                  {/* Generated Link Success */}
                  {paymentLink && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 animate-in fade-in duration-300">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Payment link generated successfully!</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        Send this link to customer via SMS, WhatsApp or Email.
                      </p>
                    </div>
                  )}

                  {/* Payment Link Display */}
                  <div className="bg-slate-50 rounded-xl p-4 mb-6">
                    <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Payment Link</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={paymentLink}
                        readOnly
                        placeholder={isSubmitting ? "Generating payment link..." : "Please select Date & Time below to generate..."}
                        className="flex-1 bg-transparent text-blue-600 text-sm font-mono outline-none"
                      />
                      <button
                        onClick={copyPaymentLink}
                        disabled={!paymentLink}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-blue-50 hover:border-blue-200 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {linkCopied ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-blue-50/40 rounded-xl p-4 mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-600">Total Amount Due</span>
                      <span className="text-xl font-bold text-blue-600">${totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Order ID: {orderId}</span>
                      <span>Valid for 24 hours</span>
                    </div>
                  </div>

                  <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-700">Select Date & Time</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Choose the appointment slot before sending the payment link
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={openDateTimeDialog}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-blue-600 transition hover:border-blue-300 hover:bg-blue-50"
                      >
                        {selectedDate && selectedTime ? 'Change' : 'Select'}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={openDateTimeDialog}
                      className="mt-4 flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{appointmentLabel}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {selectedDate && selectedTime ? 'Click to update appointment slot' : 'Required before continuing'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>

                  {/* Send Options */}
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-3">Send payment link via</p>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => handleSendPayment('SMS')}
                        disabled={isSendingPayment || !selectedDate || !selectedTime}
                        className={cn(
                          "flex flex-col items-center gap-2 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition group cursor-pointer",
                          (isSendingPayment || !selectedDate || !selectedTime) && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-xs">SMS</span>
                      </button>
                      <button
                        onClick={() => handleSendPayment('WhatsApp')}
                        disabled={isSendingPayment || !selectedDate || !selectedTime}
                        className={cn(
                          "flex flex-col items-center gap-2 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition group cursor-pointer",
                          (isSendingPayment || !selectedDate || !selectedTime) && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Send className="w-5 h-5" />
                        <span className="text-xs">WhatsApp</span>
                      </button>
                      <button
                        onClick={() => handleSendPayment('Email')}
                        disabled={isSendingPayment || !selectedDate || !selectedTime}
                        className={cn(
                          "flex flex-col items-center gap-2 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition group cursor-pointer",
                          (isSendingPayment || !selectedDate || !selectedTime) && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {isSendingPayment && sendingMethod === 'Email' ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Mail className="w-5 h-5" />
                        )}
                        <span className="text-xs">{isSendingPayment && sendingMethod === 'Email' ? 'Sending...' : 'Email'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {sendPaymentError && (
                    <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-200 animate-in fade-in duration-300">
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{sendPaymentError}</span>
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {paymentSent && (
                    <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200 animate-in fade-in duration-300">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">Payment link sent via {sendingMethod} successfully!</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Summary Tab */}
              {activeTab === 'summary' && (
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">Review Order</h2>
                      <p className="text-sm text-slate-500">Confirm all details before finalizing</p>
                    </div>
                  </div>

                  {/* Customer Info Summary */}
                  <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-slate-700">Customer Details</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500">Name</p>
                        <p className="font-medium text-slate-800">{customer.name}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Phone</p>
                        <p className="font-medium text-slate-800">{customer.phone}</p>
                      </div>
                      {customer.email && (
                        <div className="col-span-2">
                          <p className="text-slate-500">Email</p>
                          <p className="font-medium text-slate-800">{customer.email}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Services Summary */}
                  <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-slate-700">Services</span>
                    </div>
                    <div className="space-y-2">
                      {selectedServices.map((service) => (
                        <div key={service.id} className="flex items-center gap-3 text-sm">
                          <ServiceImage
                            src={service.image}
                            alt={service.name}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <span className="text-slate-600">{service.name}</span>
                            <span className="text-xs text-slate-400 ml-2">x{service.quantity}</span>
                          </div>
                          <span className="text-slate-800">${service.price * service.quantity}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-slate-200 flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-blue-600">${totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expert Summary */}
                  {selectedExpert && (
                    <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-slate-700">Assigned Expert</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <ServiceImage
                          src={selectedExpert.image}
                          alt={selectedExpert.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div>
                          <p className="font-medium text-slate-800">{selectedExpert.name}</p>
                          <p className="text-xs text-slate-500">{selectedExpert.role}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-slate-600">{selectedExpert.rating} ({selectedExpert.reviewCount} reviews)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Summary */}
                  <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Link2 className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-slate-700">Payment Information</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Payment Link</span>
                        <span className="font-mono text-xs text-blue-600">{paymentLink}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Order ID</span>
                        <span className="font-mono">{orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Order Date</span>
                        <span>{formattedDate} - {formattedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Appointment Slot</span>
                        <span>{appointmentLabel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Confirmation Notice */}
                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                      Once confirmed, the payment link will be valid for 24 hours. 
                      The booking will be automatically confirmed upon successful payment.
                      {selectedExpert && ` Expert ${selectedExpert.name} will be assigned to this order.`}
                    </p>
                  </div>

                  {/* ── Submit Feedback ──────────────────────────────────── */}
                  {submitError && (
                    <div className="mt-3 flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-200">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700">{submitError}</p>
                    </div>
                  )}
                  {submitSuccess && (
                    <div className="mt-3 flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-green-700">
                        Order <strong>{orderId}</strong> created successfully! Payment link is ready to share.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between">
                <button
                  onClick={goToPrevTab}
                  className={`px-5 py-2 rounded-xl font-medium transition ${
                    tabs.findIndex(t => t.id === activeTab) > 0
                      ? 'bg-white cursor-pointer border border-slate-200 text-slate-600 hover:bg-slate-100'
                      : 'opacity-50 cursor-not-allowed bg-white border border-slate-200 text-slate-400'
                  }`}
                  disabled={tabs.findIndex(t => t.id === activeTab) === 0}
                >
                  Back
                </button>
                {activeTab !== 'summary' ? (
                  <button
                    onClick={goToNextTab}
                    disabled={!isTabComplete(activeTab)}
                    className={`px-5 py-2 rounded-xl font-medium transition flex items-center cursor-pointer gap-2 ${
                      isTabComplete(activeTab)
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      if (submitSuccess) return;
                      setIsSubmitting(true);
                      setSubmitError(null);
                      try {
                        if (!createdBooking) {
                          const res = await createVoiceCallBookingApi({
                            customerName: customer.name,
                            customerPhone: customer.phone,
                            customerEmail: customer.email || undefined,
                            customerNotes: customer.notes || undefined,
                            services: selectedServices.map((s) => ({
                              id: s.id,
                              name: s.name,
                              price: s.price,
                              quantity: s.quantity,
                            })),
                            expertId: selectedExpert?.id ?? null,
                            scheduledDate: selectedDate ? selectedDate.toISOString() : null,
                            scheduledTime: selectedTime ?? null,
                            totalAmount,
                          });
                          setCreatedBooking(res.booking);
                          setPaymentLink(res.booking.paymentLink || `http://localhost:3002/invoice/${res.booking.id}`);
                        }
                        setSubmitSuccess(true);
                      } catch (err: any) {
                        setSubmitError(err?.message || 'Failed to create order. Please try again.');
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    disabled={isSubmitting || submitSuccess}
                    className={`px-5 py-2 rounded-xl font-medium transition flex items-center gap-2 shadow-md ${
                      submitSuccess
                        ? 'bg-green-500 text-white cursor-default'
                        : isSubmitting
                        ? 'bg-green-400 text-white cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {isSubmitting ? 'Confirming…' : submitSuccess ? 'Order Confirmed!' : 'Confirm Order'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Order Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 sticky top-6">
              <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-800">Live Preview</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">Real-time order summary</p>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Order ID</p>
                    <p className="font-mono font-semibold text-slate-800 text-sm">{orderId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Date</p>
                    <p className="text-xs text-slate-600">{formattedDate}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wide mb-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    Appointment
                  </div>
                  <p className="text-sm font-medium text-slate-700">{appointmentLabel}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Services</p>
                  <div className="space-y-2">
                    {selectedServices.slice(0, 3).map((service) => (
                      <div key={service.id} className="flex items-center gap-2 text-xs">
                        <ServiceImage
                          src={service.image}
                          alt={service.name}
                          className="w-6 h-6 rounded-lg object-cover"
                        />
                        <span className="text-slate-600 flex-1">{service.name}</span>
                        <span className="text-slate-700">${service.price * service.quantity}</span>
                      </div>
                    ))}
                    {selectedServices.length > 3 && (
                      <p className="text-xs text-blue-500 pl-8">+{selectedServices.length - 3} more</p>
                    )}
                  </div>
                </div>

                {/* Expert Preview */}
                {selectedExpert && (
                  <div className="pt-2">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Assigned Expert</p>
                    <div className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded-lg">
                      <ServiceImage
                        src={selectedExpert.image}
                        alt={selectedExpert.name}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-slate-700">{selectedExpert.name}</p>
                        <p className="text-slate-500 text-xs">{selectedExpert.role}</p>
                      </div>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-slate-600">{selectedExpert.rating}</span>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-800">Total</span>
                    <span className="text-blue-600">${totalAmount}</span>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Clock className="w-3 h-3 text-blue-500" />
                    <span className="text-slate-600">Services held for 24 hours</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <CreditCard className="w-3 h-3 text-blue-500" />
                    <span className="text-slate-600">Payment link valid 24h</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Wallet className="w-3 h-3 text-blue-500" />
                    <span className="text-slate-600">Multiple payment options</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2.5 rounded-xl">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Auto-confirm on payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDateTimeDialogOpen} onOpenChange={setIsDateTimeDialogOpen}>
  <DialogContent className="max-h-[90vh] max-w-lg overflow-hidden rounded-3xl p-0 bg-white">
    <DialogHeader className="border-b border-slate-100 px-6 pb-4 pt-6">
      <DialogTitle className="text-2xl font-bold text-slate-900">Select Date & Time</DialogTitle>
      <DialogDescription className="text-sm text-slate-500">Choose your preferred appointment slot</DialogDescription>
    </DialogHeader>
    
    <div className="max-h-[calc(90vh-120px)] overflow-y-scroll scrollbar-thin px-6 pb-8">
      {/* Calendar */}
      <div className="mt-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Calendar className="h-4 w-4 text-blue-600" />
          <span>Select Date</span>
        </div>
        <div className="mt-3 flex justify-center rounded-2xl border border-slate-200 p-4 ">
          <DatePickerCalendar
            mode="single"
            selected={tempSelectedDate || undefined}
            onSelect={(date: Date | undefined) => setTempSelectedDate(date ?? null)}
            disabled={(date: Date) => {
              const minDate = availableDates[0];
              const maxDate = availableDates[availableDates.length - 1];

              if (!minDate || !maxDate) {
                return false;
              }

              return date < minDate || date > maxDate;
            }}
            className="rounded-md bg-white text-black"
          />
        </div>
      </div>

      {/* Time Slots */}
<div className="mt-6">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
      <Clock className="h-4 w-4 text-blue-600" />
      <span>Select Time Slot</span>
    </div>
    <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
      <span>🍽️</span>
      <span>Lunch Break</span>
    </div>
  </div>
  <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
    {timeSlots.map((time) => {
      const isSelected = tempSelectedTime === time;
      const isDisabled = !tempSelectedDate || time === "12:30 PM" || time === "01:00 PM";
      const isLunchSlot = time === "12:30 PM" || time === "01:00 PM";
      
      return (
        <button
          key={time}
          type="button"
          onClick={() => !isDisabled && setTempSelectedTime(time)}
          disabled={isDisabled}
          className={cn(
            "rounded-xl border px-3 py-2.5 text-sm font-semibold transition",
            isSelected
              ? "border-blue-600 bg-blue-600 text-white"
              : isDisabled
              ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
              : "border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50",
            isLunchSlot && !isSelected && "relative"
          )}
        >
          {time}
          {isLunchSlot && !isSelected && (
            <span className="absolute -top-1 -right-1 text-xs">🍽️</span>
          )}
        </button>
      );
    })}
  </div>
  {!tempSelectedDate && (
    <p className="mt-3 text-center text-xs text-amber-600">
      Please select a date first
    </p>
  )}
  {tempSelectedDate && (
    <p className="mt-3 text-center text-xs text-slate-500">
      ⚠️ Lunch break: 12:30 PM - 1:00 PM (not available)
    </p>
  )}
</div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={() => {
            setTempSelectedDate(selectedDate);
            setTempSelectedTime(selectedTime);
            setIsDateTimeDialogOpen(false);
          }}
          className="flex-1 rounded-2xl border border-slate-200 bg-white py-6 text-base font-semibold text-black transition hover:bg-slate-100"
          >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleDateTimeConfirm}
          disabled={!tempSelectedDate || !tempSelectedTime}
          className="flex-1 rounded-2xl bg-blue-600 py-6 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Confirm
        </button>
      </div>
    </div>
  </DialogContent>
</Dialog>
    </div>
  );
}
