'use client';

import { useState } from 'react';
import { 
  MessageCircle, 
  DollarSign, 
  Link as LinkIcon, 
  Check, 
  X, 
  Plus, 
  Upload, 
  Trash2, 
  Edit2,
  Save,
  ChevronRight,
  Users,
  Package,
  CreditCard,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Modal from '@/components/modal/Modal';

// Types
interface Service {
  id: string;
  name: string;
  price: number;
  discount: number;
  duration: string;
  image: string | null;
  category: string;
}

interface Category {
  id: string;
  name: string;
  services: Service[];
}

const flowSteps = [
  {
    id: 1,
    type: 'initial' as const,
    title: 'Initial Message',
    description: 'Hi! Let\'s discuss your requirements and finalize the details.',
    expertName: 'Sarah',
    expertImage: null,
  },
  {
    id: 2,
    type: 'step' as const,
    icon: MessageCircle,
    title: 'Chat & Negotiate',
    description: 'Discuss requirements and finalize a custom service',
  },
  {
    id: 3,
    type: 'step' as const,
    icon: DollarSign,
    title: 'Set Custom Price',
    description: 'Agree on the final negotiated price',
  },
  {
    id: 4,
    type: 'step' as const,
    icon: LinkIcon,
    title: 'Send Payment Link',
    description: 'Expert will generate and send a payment link',
  },
  {
    id: 5,
    type: 'action' as const,
    icon: Check,
    title: 'Customer Books or Not',
    description: 'Customer decides to book or decline the service',
    actions: ['Book Service', 'Decline'],
  },
];

const experts = [
  { id: 1, name: 'Sarah Johnson', role: 'Hair Stylist', rating: 4.9, image: null },
  { id: 2, name: 'Michael Chen', role: 'Makeup Artist', rating: 4.8, image: null },
  { id: 3, name: 'Emma Davis', role: 'Nail Technician', rating: 4.9, image: null },
  { id: 4, name: 'James Wilson', role: 'Barber', rating: 4.7, image: null },
];

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState<'services' | 'flow'>('services');
  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      name: 'Category1',
      services: [
        { id: '1', name: 'Haircut', price: 20, discount: 10, duration: '1hour', image: null, category: 'Category1' },
        { id: '2', name: 'Keratin', price: 30, discount: 0, duration: '30minutes', image: null, category: 'Category1' },
        { id: '3', name: 'Rebonding', price: 50, discount: 0, duration: '2hours', image: null, category: 'Category1' },
      ]
    },
    {
      id: '2',
      name: 'Category2',
      services: [
        { id: '4', name: 'Bald', price: 100, discount: 0, duration: '20minutes', image: null, category: 'Category2' },
      ]
    }
  ]);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('1');
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAddingService, setIsAddingService] = useState(false);
  const [newService, setNewService] = useState<Partial<Service>>({
    name: '',
    price: 0,
    discount: 0,
    duration: '',
    image: null,
  });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(experts[0]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Modal states
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setImagePreview(imageUrl);
        if (isEdit && editingService) {
          setEditingService({ ...editingService, image: imageUrl });
        } else {
          setNewService({ ...newService, image: imageUrl });
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert('Image must be less than 10MB');
    }
  };

  const handleSaveService = () => {
    setIsLoading(true);
    
    // Simulate async operation
    setTimeout(() => {
      if (editingService) {
        setCategories(categories.map(cat => ({
          ...cat,
          services: cat.services.map(s => s.id === editingService.id ? editingService : s)
        })));
        setEditingService(null);
      } else if (isAddingService && newService.name && newService.price) {
        const category = categories.find(c => c.id === selectedCategory);
        if (category) {
          const service: Service = {
            id: Date.now().toString(),
            name: newService.name,
            price: newService.price,
            discount: newService.discount || 0,
            duration: newService.duration || '',
            image: newService.image || null,
            category: category.name,
          };
          setCategories(categories.map(cat => 
            cat.id === selectedCategory 
              ? { ...cat, services: [...cat.services, service] }
              : cat
          ));
        }
        setIsAddingService(false);
        setNewService({ name: '', price: 0, discount: 0, duration: '', image: null });
        setImagePreview(null);
      }
      
      setIsServiceModalOpen(false);
      setIsLoading(false);
    }, 500);
  };

  const handleDeleteService = (serviceId: string) => {
    setCategories(categories.map(cat => ({
      ...cat,
      services: cat.services.filter(s => s.id !== serviceId)
    })));
  };

  const handleAddCategory = () => {
    setIsLoading(true);
    
    // Simulate async operation
    setTimeout(() => {
      if (newCategoryName.trim()) {
        const newCategory: Category = {
          id: Date.now().toString(),
          name: newCategoryName,
          services: [],
        };
        setCategories([...categories, newCategory]);
        setNewCategoryName('');
        setIsAddingCategory(false);
      }
      
      setIsCategoryModalOpen(false);
      setIsLoading(false);
    }, 500);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(categories.filter(c => c.id !== categoryId));
    if (selectedCategory === categoryId && categories.length > 1) {
      setSelectedCategory(categories.find(c => c.id !== categoryId)?.id || '');
    }
  };

  const openAddServiceModal = () => {
    setEditingService(null);
    setNewService({ name: '', price: 0, discount: 0, duration: '', image: null });
    setImagePreview(null);
    setIsAddingService(true);
    setIsServiceModalOpen(true);
  };

  const openEditServiceModal = (service: Service) => {
    setEditingService(service);
    setImagePreview(service.image);
    setIsAddingService(false);
    setIsServiceModalOpen(true);
  };

  const closeServiceModal = () => {
    setIsServiceModalOpen(false);
    setEditingService(null);
    setNewService({ name: '', price: 0, discount: 0, duration: '', image: null });
    setImagePreview(null);
    setIsAddingService(false);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setNewCategoryName('');
  };

  const currentServices = categories.find(c => c.id === selectedCategory)?.services || [];

  return (
    <div className="min-h-full bg-[var(--card-bg-light)]">
      {/* Header */}
      <header className=" top-5 z-10 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className=" items-center space-x-3">
              <h1 className="text-3xl font-bold tracking-tight">Service Menu</h1>
              <p className="text-muted-foreground">
                Review and approve pending booking requests
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-[var(--card-bg)]">
                <h3 className="font-semibold text-gray-900">Categories</h3>
              </div>
              <div className="p-2 max-h-[13rem] overflow-y-auto">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-all flex justify-between items-center group cursor-pointer  ${
                      selectedCategory === category.id
                        ? 'bg-[var(--card-bg)] text-gray-900'
                        : 'hover:bg-[var(--card-bg)] text-gray-700'
                    }`}
                  >
                    <span>{category.name.toUpperCase()}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-3 h-3 text-[var(--primary-end)]" />
                    </button>
                  </button>
                ))}
              </div>
  
              <Button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="w-full "
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </Button>

            </div>
          </div>

          {/* Services Grid */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-[var(--card-bg)] flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">
                  Services in {categories.find(c => c.id === selectedCategory)?.name}
                </h3>
                <Button onClick={openAddServiceModal}>
                  <Plus className="w-4 h-4" />
                  <span>Add Service</span>
                </Button>
              </div>
              
              <div className="p-4 max-h-[24rem] min-h-[24rem] overflow-y-auto">
                {/* Services List */}
                <div className="space-y-3">
                  {currentServices.map((service) => (
                    <div key={service.id} className="bg-white border border-[var(--primary-start)] rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                        {service.image && (
                          <img src={service.image} alt={service.name} className="w-16 h-16 object-cover rounded-lg" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{service.name}</h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-lg font-bold text-[var(--primary-start)]">${service.price}</span>
                            {service.discount > 0 && (
                              <span className="text-sm text-green-600">{service.discount}% OFF</span>
                            )}
                            <span className="text-sm text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {service.duration}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditServiceModal(service)}
                            className="p-2 text-[var(--primary-end)] hover:text-[var(--primary-start)] transition cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteService(service.id)}
                            className="p-2 text-[var(--primary-end)] hover:text-red-500 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {currentServices.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No services in this category</p>
                      <button
                        onClick={openAddServiceModal}
                        className="mt-3 text-purple-600 hover:text-purple-700"
                      >
                        Add your first service
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Modal (Add/Edit) */}
      <Modal
        isOpen={isServiceModalOpen}
        onClose={closeServiceModal}
        title={editingService ? 'Edit Service' : 'Add New Service'}
        size="lg"
        confirmButtonText={editingService ? 'Update Service' : 'Add Service'}
        onConfirm={handleSaveService}
        onCancel={closeServiceModal}
        isConfirmLoading={isLoading}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Name *
              </label>
              <input
                type="text"
                placeholder="Enter service name"
                value={editingService ? editingService.name : newService.name}
                onChange={(e) => {
                  if (editingService) {
                    setEditingService({ ...editingService, name: e.target.value });
                  } else {
                    setNewService({ ...newService, name: e.target.value });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price ($) *
              </label>
              <input
                type="number"
                placeholder="Enter price"
                value={editingService ? editingService.price : newService.price}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (editingService) {
                    setEditingService({ ...editingService, price: value });
                  } else {
                    setNewService({ ...newService, price: value });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount (%)
              </label>
              <input
                type="number"
                placeholder="Enter discount percentage"
                value={editingService ? editingService.discount : newService.discount}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (editingService) {
                    setEditingService({ ...editingService, discount: value });
                  } else {
                    setNewService({ ...newService, discount: value });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <input
                type="text"
                placeholder="e.g., 1 hour, 30 minutes"
                value={editingService ? editingService.duration : newService.duration}
                onChange={(e) => {
                  if (editingService) {
                    setEditingService({ ...editingService, duration: e.target.value });
                  } else {
                    setNewService({ ...newService, duration: e.target.value });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Image
            </label>
            <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 transition">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, !!editingService)}
                className="hidden"
              />
              <div className="text-center">
                <Upload className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">
                  Click to upload image (max 10MB)
                </span>
              </div>
            </label>
            {(imagePreview || (editingService?.image && !imagePreview)) && (
              <div className="mt-3 relative w-24 h-24">
                <img 
                  src={imagePreview || editingService?.image || ''} 
                  alt="Preview" 
                  className="w-full h-full object-cover rounded-lg border border-gray-200" 
                />
                <button
                  onClick={() => {
                    setImagePreview(null);
                    if (editingService) {
                      setEditingService({ ...editingService, image: null });
                    } else {
                      setNewService({ ...newService, image: null });
                    }
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={closeCategoryModal}
        title="Add New Category"
        size="sm"
        confirmButtonText="Add Category"
        onConfirm={handleAddCategory}
        onCancel={closeCategoryModal}
        isConfirmLoading={isLoading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter category name"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
              autoFocus
            />
            <p className="mt-2 text-sm text-gray-500">
              Categories help organize your services for better navigation.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}