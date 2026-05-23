// app/page.tsx
'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Copy, 
  CheckCircle, 
  Phone, 
  Calendar, 
  Clock, 
  CreditCard, 
  Wallet, 
  Landmark, 
  Smartphone,
  MessageSquare,
  Mail,
  Send,
  Plus,
  Trash2,
  User,
  PhoneCall,
  Users,
  Link2,
  FileText,
  ChevronRight,
  Eye,
  RefreshCw,
  AlertCircle,
  DollarSign,
  CalendarDays,
  Sparkles,
  Star,
  Award,
  Briefcase,
  Minus
} from 'lucide-react';

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

// Updated available services data with images
const availableServices: Service[] = [
  { id: '1', name: 'Deep Tissue Massage', duration: '60 min', price: 120, category: 'Massage', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=150&h=150&fit=crop' },
  { id: '2', name: 'Hair Spa Treatment', duration: '60 min', price: 90, category: 'Hair', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=150&h=150&fit=crop' },
  { id: '3', name: 'Aromatherapy Massage', duration: '60 min', price: 110, category: 'Massage', image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=150&h=150&fit=crop' },
  { id: '4', name: 'Swedish Massage', duration: '90 min', price: 150, category: 'Massage', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=150&h=150&fit=crop' },
  { id: '5', name: 'Facial Treatment', duration: '45 min', price: 85, category: 'Facial', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=150&h=150&fit=crop' },
  { id: '6', name: 'Hot Stone Massage', duration: '75 min', price: 140, category: 'Massage', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=150&h=150&fit=crop' },
  { id: '7', name: 'Manicure & Pedicure', duration: '60 min', price: 65, category: 'Nails', image: 'https://images.unsplash.com/photo-1610991923496-b62c5e2d34cf?w=150&h=150&fit=crop' },
  { id: '8', name: 'Body Scrub', duration: '45 min', price: 95, category: 'Body', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=150&h=150&fit=crop' },
];

// Available experts data
const availableExperts: Expert[] = [
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
  },
];

type TabType = 'customer' | 'services' | 'experts' | 'payment' | 'summary';

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
    name: 'Emma Roberts',
    phone: '+1 987 654 3210',
    email: 'emma.roberts@example.com',
    notes: 'Customer called and requested the following services for tomorrow.',
  });
  const [notesCharCount, setNotesCharCount] = useState(customer.notes.length);
  
  // Services state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([
    { ...availableServices[0], quantity: 1 },
    { ...availableServices[1], quantity: 1 },
    { ...availableServices[2], quantity: 1 },
  ]);
  
  // Experts state
  const [expertSearchQuery, setExpertSearchQuery] = useState('');
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  
  // Payment link state
  const [orderId] = useState(() => `#VO-${Math.floor(Math.random() * 90000) + 10000}`);
  const [paymentLink] = useState(() => `https://99messages.com/pay/${Math.floor(Math.random() * 90000) + 10000}`);
  const [linkCopied, setLinkCopied] = useState(false);
  const [paymentSent, setPaymentSent] = useState(false);
  const [sendingMethod, setSendingMethod] = useState<string | null>(null);
  
  // Order date
  const orderDate = new Date(2025, 4, 18, 11, 30);
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

  // Filter experts based on search query
  const filteredExperts = availableExperts.filter(expert =>
    expert.name.toLowerCase().includes(expertSearchQuery.toLowerCase()) ||
    expert.role.toLowerCase().includes(expertSearchQuery.toLowerCase()) ||
    expert.specialties.some(specialty => specialty.toLowerCase().includes(expertSearchQuery.toLowerCase()))
  );

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
  const handleSendPayment = (method: string) => {
    setSendingMethod(method);
    setTimeout(() => {
      setPaymentSent(true);
      setTimeout(() => setPaymentSent(false), 3000);
    }, 500);
  };

  // Check if current tab is complete
  const isTabComplete = (tab: TabType): boolean => {
    switch (tab) {
      case 'customer':
        return customer.name.trim() !== '' && customer.phone.trim() !== '';
      case 'services':
        return selectedServices.length > 0;
      case 'experts':
        return true; // Expert selection is optional
      case 'payment':
        return true;
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

  // Handle next tab
  const goToNextTab = () => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    if (currentIndex < tabs.length - 1 && isTabComplete(activeTab)) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  // Handle previous tab
  const goToPrevTab = () => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
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
                const isPending = status === 'pending';
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      // Allow navigation to completed tabs or previous tabs
                      if (isCompleted || idx <= tabs.findIndex(t => t.id === activeTab)) {
                        setActiveTab(tab.id);
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
                        onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-slate-50/30"
                        placeholder="Enter customer name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={customer.phone}
                        onChange={(e) => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-slate-50/30"
                        placeholder="Enter phone number"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={customer.email}
                        onChange={(e) => setCustomer(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-slate-50/30"
                        placeholder="Enter email address"
                      />
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

                  {/* Search Results */}
                  {searchQuery && (
                    <div className="mb-5 border border-slate-100 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 px-3 py-2 border-b border-slate-100">
                        <p className="text-xs font-medium text-slate-500 uppercase">Search Results</p>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                        {filteredServices.length > 0 ? (
                            filteredServices.map((service) => (
                            <button
                                key={service.id}
                                onClick={() => addService(service)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 transition border-b last:border-b-0 text-left"
                            >
                                <ServiceImage
                                  src={service.image}
                                  alt={service.name}
                                  className="w-12 h-12 rounded-xl object-cover"
                                />
                                <div className="flex-1">
                                <p className="font-medium text-slate-800">{service.name}</p>
                                <div className="flex gap-3 text-xs text-slate-500">
                                    <span>{service.duration}</span>
                                    <span className="text-blue-600 font-medium">${service.price}</span>
                                </div>
                                </div>
                                <Plus className="w-5 h-5 text-blue-500" />
                            </button>
                            ))
                        ) : (
                            <p className="p-4 text-slate-500 text-center text-sm">No services found</p>
                        )}
                        </div>
                    </div>
                    )}

                  {/* Selected Services */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm font-medium text-slate-700">Selected Services</p>
                      <p className="text-xs text-slate-500">{selectedServices.length} item(s)</p>
                    </div>
                    
                    {selectedServices.length > 0 ? (
                        <div className="space-y-2">
                            {selectedServices.map((service) => (
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
                                <p className="font-medium text-slate-800">{service.name}</p>
                                <p className="text-xs text-slate-500">{service.duration}</p>
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
                            ))}
                            
                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                            <span className="font-semibold text-slate-800">Total Amount</span>
                            <span className="text-2xl font-bold text-blue-600">${totalAmount}</span>
                            </div>
                        </div>
                        ) : (
                        <div className="text-center py-10 bg-slate-50 rounded-xl">
                            <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-slate-400">No services selected</p>
                            <p className="text-xs text-slate-400">Search and add services above</p>
                        </div>
                        )}
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
                    {filteredExperts.length > 0 ? (
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
                  <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Payment link generated successfully!</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Send this link to customer via SMS, WhatsApp or Email.
                    </p>
                  </div>

                  {/* Payment Link Display */}
                  <div className="bg-slate-50 rounded-xl p-4 mb-6">
                    <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Payment Link</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={paymentLink}
                        readOnly
                        className="flex-1 bg-transparent text-blue-600 text-sm font-mono outline-none"
                      />
                      <button
                        onClick={copyPaymentLink}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-blue-50 hover:border-blue-200 transition text-sm"
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

                  {/* Send Options */}
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-3">Send payment link via</p>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => handleSendPayment('SMS')}
                        className="flex flex-col items-center gap-2 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition group"
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-xs">SMS</span>
                      </button>
                      <button
                        onClick={() => handleSendPayment('WhatsApp')}
                        className="flex flex-col items-center gap-2 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition group"
                      >
                        <Send className="w-5 h-5" />
                        <span className="text-xs">WhatsApp</span>
                      </button>
                      <button
                        onClick={() => handleSendPayment('Email')}
                        className="flex flex-col items-center gap-2 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition group"
                      >
                        <Mail className="w-5 h-5" />
                        <span className="text-xs">Email</span>
                      </button>
                    </div>
                  </div>

                  {/* Success Message */}
                  {paymentSent && (
                    <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200 animate-in fade-in duration-300">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-4 h-4" />
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
                  Previous
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
                    onClick={() => alert('Order created successfully!')}
                    className="px-5 py-2 rounded-xl font-medium transition flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 shadow-md"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirm Order
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
    </div>
  );
}