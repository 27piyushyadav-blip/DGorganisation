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
  Clock,
  LayoutPanelLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Modal from '@/components/modal/Modal';

type LayoutOrientation = 'horizontal' | 'vertical';

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

interface CategoryServiceLayout {
  horizontal: string[];
  vertical: string[];
}

interface ServiceLayoutCardProps {
  service: Service;
  draggable?: boolean;
  onDragStart?: (serviceId: string) => void;
  onRemove?: (serviceId: string) => void;
}

function ServiceLayoutCard({
  service,
  draggable = false,
  onDragStart,
  onRemove,
}: ServiceLayoutCardProps) {
  return (
    <div
      draggable={draggable}
      onDragStart={() => onDragStart?.(service.id)}
      className={`rounded-xl border border-[var(--primary-start)] bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${
        draggable ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-medium text-gray-900">{service.name}</h4>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className="font-semibold text-[var(--primary-start)]">${service.price}</span>
            {service.discount > 0 && (
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">
                {service.discount}% OFF
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {service.duration}
            </span>
          </div>
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(service.id)}
            className="rounded-full p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
            aria-label={`Remove ${service.name} from layout`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// interface ServiceDropZoneProps {
//   title: string;
//   description: string;
//   services: Service[];
//   orientation: LayoutOrientation;
//   isActive: boolean;
//   onDragOver: (orientation: LayoutOrientation) => void;
//   onDrop: (orientation: LayoutOrientation) => void;
//   onDragLeave: () => void;
//   onRemove: (serviceId: string, orientation: LayoutOrientation) => void;
// }

interface ServiceDropZoneProps {
  title: string;
  description: string;
  services: Service[];
  orientation: LayoutOrientation;
  isActive: boolean;
  onDragOver: (orientation: LayoutOrientation) => void;
  onDrop: (orientation: LayoutOrientation) => void;
  onDragLeave: () => void;
  onRemove: (serviceId: string, orientation: LayoutOrientation) => void;
}

// function ServiceDropZone({
//   title,
//   description,
//   services,
//   orientation,
//   isActive,
//   onDragOver,
//   onDrop,
//   onDragLeave,
//   onRemove,
// }: ServiceDropZoneProps) {
//   return (
//     <div
//       onDragOver={(e) => {
//         e.preventDefault();
//         onDragOver(orientation);
//       }}
//       onDragLeave={onDragLeave}
//       onDrop={(e) => {
//         e.preventDefault();
//         onDrop(orientation);
//       }}
//       className={`rounded-2xl border-2 border-dashed p-4 transition ${
//         isActive
//           ? 'border-[var(--primary-start)] bg-[var(--card-bg)]'
//           : 'border-gray-200 bg-white'
//       }`}
//     >
//       <div className="mb-4 flex items-start justify-between gap-3">
//         <div>
//           <h3 className="text-base font-semibold text-gray-900">{title}</h3>
//           <p className="text-sm text-gray-500">{description}</p>
//         </div>
//         <span className="rounded-full bg-[var(--card-bg)] px-3 py-1 text-xs font-medium text-gray-700">
//           {services.length} selected
//         </span>
//       </div>

//       <div className={orientation === 'horizontal' ? 'grid gap-3 md:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
//         {services.length > 0 ? (
//           services.map((service) => (
//             <ServiceLayoutCard
//               key={service.id}
//               service={service}
//               onRemove={(serviceId) => onRemove(serviceId, orientation)}
//             />
//           ))
//         ) : (
//           <div className="rounded-xl border border-transparent bg-[var(--card-bg-light)] px-4 py-8 text-center text-sm text-gray-500">
//             Drag services here to build the {title.toLowerCase()} layout.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

function ServiceDropZone({
  title,
  description,
  services,
  orientation,
  isActive,
  onDragOver,
  onDrop,
  onDragLeave,
  onRemove,
}: ServiceDropZoneProps) {
  const maxItems = 5;
  const isFull = services.length >= maxItems;
  
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!isFull) {
          onDragOver(orientation);
        }
      }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        if (!isFull) {
          onDrop(orientation);
        }
      }}
      className={`rounded-2xl border-2 border-dashed p-4 transition ${
        isActive && !isFull
          ? 'border-[var(--primary-start)] bg-[var(--card-bg)]'
          : 'border-gray-200 bg-white'
      } ${isFull ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${
            services.length >= maxItems 
              ? 'bg-red-100 text-red-600' 
              : 'bg-[var(--card-bg)] text-gray-700'
          }`}>
            {services.length} / {maxItems} selected
          </span>
          {isFull && (
            <span className="text-xs text-red-500">Limit reached</span>
          )}
        </div>
      </div>

      <div className={orientation === 'horizontal' ? 'grid gap-3 md:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
        {services.length > 0 ? (
          services.map((service) => (
            <ServiceLayoutCard
              key={service.id}
              service={service}
              onRemove={(serviceId) => onRemove(serviceId, orientation)}
            />
          ))
        ) : (
          <div className="rounded-xl border border-transparent bg-[var(--card-bg-light)] px-4 py-8 text-center text-sm text-gray-500">
            {isFull 
              ? `${title} section is full (max ${maxItems} items)`
              : `Drag services here to build the ${title.toLowerCase()} layout. (${services.length}/${maxItems})`
            }
          </div>
        )}
      </div>
    </div>
  );
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
  const [isServiceLayoutModalOpen, setIsServiceLayoutModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [draggedServiceId, setDraggedServiceId] = useState<string | null>(null);
  const [activeDropZone, setActiveDropZone] = useState<LayoutOrientation | null>(null);
  const [serviceLayouts, setServiceLayouts] = useState<Record<string, CategoryServiceLayout>>({});

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
    setServiceLayouts((prev) => ({
      ...prev,
      [selectedCategory]: {
        horizontal: (prev[selectedCategory]?.horizontal || []).filter((id) => id !== serviceId),
        vertical: (prev[selectedCategory]?.vertical || []).filter((id) => id !== serviceId),
      },
    }));
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
    setServiceLayouts((prev) => {
      const nextLayouts = { ...prev };
      delete nextLayouts[categoryId];
      return nextLayouts;
    });
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

  const getCategoryLayout = (categoryId: string): CategoryServiceLayout => (
    serviceLayouts[categoryId] || { horizontal: [], vertical: [] }
  );

  const updateCategoryLayout = (
    categoryId: string,
    updater: (layout: CategoryServiceLayout) => CategoryServiceLayout
  ) => {
    setServiceLayouts((prev) => {
      const currentLayout = prev[categoryId] || { horizontal: [], vertical: [] };
      return {
        ...prev,
        [categoryId]: updater(currentLayout),
      };
    });
  };

  const handleOpenServiceLayoutModal = () => {
    setDraggedServiceId(null);
    setActiveDropZone(null);
    setIsServiceLayoutModalOpen(true);
  };

  const handleCloseServiceLayoutModal = () => {
    setDraggedServiceId(null);
    setActiveDropZone(null);
    setIsServiceLayoutModalOpen(false);
  };

  // const handleServiceDrop = (orientation: LayoutOrientation) => {
  //   if (!draggedServiceId) return;

  //   updateCategoryLayout(selectedCategory, (layout) => {
  //     const nextHorizontal = layout.horizontal.filter((id) => id !== draggedServiceId);
  //     const nextVertical = layout.vertical.filter((id) => id !== draggedServiceId);

  //     if (orientation === 'horizontal') {
  //       nextHorizontal.push(draggedServiceId);
  //     } else {
  //       nextVertical.push(draggedServiceId);
  //     }

  //     return {
  //       horizontal: nextHorizontal,
  //       vertical: nextVertical,
  //     };
  //   });

  //   setDraggedServiceId(null);
  //   setActiveDropZone(null);
  // };

  const handleServiceDrop = (orientation: LayoutOrientation) => {
  if (!draggedServiceId) return;

  updateCategoryLayout(selectedCategory, (layout) => {
    // Check if the target section already has 5 or more items
    const targetSection = orientation === 'horizontal' ? layout.horizontal : layout.vertical;
    
    if (targetSection.length >= 5) {
      alert(`Cannot add more than 5 services to the ${orientation} section.`);
      return layout;
    }

    const nextHorizontal = layout.horizontal.filter((id) => id !== draggedServiceId);
    const nextVertical = layout.vertical.filter((id) => id !== draggedServiceId);

    if (orientation === 'horizontal') {
      nextHorizontal.push(draggedServiceId);
    } else {
      nextVertical.push(draggedServiceId);
    }

    return {
      horizontal: nextHorizontal,
      vertical: nextVertical,
    };
  });

  setDraggedServiceId(null);
  setActiveDropZone(null);
};


  const handleRemoveFromLayout = (serviceId: string, orientation: LayoutOrientation) => {
    updateCategoryLayout(selectedCategory, (layout) => ({
      ...layout,
      [orientation]: layout[orientation].filter((id) => id !== serviceId),
    }));
  };

  const handleResetServiceLayout = () => {
    setServiceLayouts((prev) => ({
      ...prev,
      [selectedCategory]: { horizontal: [], vertical: [] },
    }));
    setDraggedServiceId(null);
    setActiveDropZone(null);
  };

  const currentServices = categories.find(c => c.id === selectedCategory)?.services || [];
  const currentLayout = getCategoryLayout(selectedCategory);
  const layoutServiceIds = new Set([...currentLayout.horizontal, ...currentLayout.vertical]);
  const availableServices = currentServices.filter((service) => !layoutServiceIds.has(service.id));
  const horizontalServices = currentLayout.horizontal
    .map((serviceId) => currentServices.find((service) => service.id === serviceId))
    .filter((service): service is Service => Boolean(service));
  const verticalServices = currentLayout.vertical
    .map((serviceId) => currentServices.find((service) => service.id === serviceId))
    .filter((service): service is Service => Boolean(service));

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
              <div className="p-2 max-h-[13rem] min-h-[13rem] overflow-y-auto">
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
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-3 h-3 text-[var(--primary-end)]" />
                    </div>
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
                <div className="flex space-x-2">
                <Button onClick={openAddServiceModal}>
                  <Plus className="w-4 h-4" />
                  <span>Add Service</span>
                </Button>
                <Button onClick={handleOpenServiceLayoutModal}>
                  <LayoutPanelLeft className="w-4 h-4" />
                  <span>Service Layout</span>
                </Button>
                </div>
                
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

      <Modal
        isOpen={isServiceLayoutModalOpen}
        onClose={handleCloseServiceLayoutModal}
        onCancel={handleCloseServiceLayoutModal}
        onConfirm={handleResetServiceLayout}
        title={`Service Layout: ${categories.find(c => c.id === selectedCategory)?.name || ''}`}
        size="xl"
        cancelButtonText="Close"
        confirmButtonText="Reset Layout"
      >
        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Service List</h3>
                <p className="text-sm text-gray-500">
                  Drag a service into the horizontal or vertical section below.
                </p>
              </div>
              <span className="rounded-full bg-[var(--card-bg)] px-3 py-1 text-xs font-medium text-gray-700">
                {availableServices.length} available
              </span>
            </div>

            <div className="grid max-h-[18rem] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
              {availableServices.length > 0 ? (
                availableServices.map((service) => (
                  <ServiceLayoutCard
                    key={service.id}
                    service={service}
                    draggable
                    onDragStart={(serviceId) => setDraggedServiceId(serviceId)}
                  />
                ))
              ) : (
                <div className="col-span-full rounded-xl bg-[var(--card-bg-light)] px-4 py-10 text-center text-sm text-gray-500">
                  All services in this category have been assigned to a layout section.
                </div>
              )}
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-2">
            <ServiceDropZone
              title="Horizontal"
              description="Best for side-by-side cards and grouped service rows."
              services={horizontalServices}
              orientation="horizontal"
              isActive={activeDropZone === 'horizontal'}
              onDragOver={setActiveDropZone}
              onDrop={handleServiceDrop}
              onDragLeave={() => setActiveDropZone(null)}
              onRemove={handleRemoveFromLayout}
            />

            <ServiceDropZone
              title="Vertical"
              description="Best for stacked service items and detailed lists."
              services={verticalServices}
              orientation="vertical"
              isActive={activeDropZone === 'vertical'}
              onDragOver={setActiveDropZone}
              onDrop={handleServiceDrop}
              onDragLeave={() => setActiveDropZone(null)}
              onRemove={handleRemoveFromLayout}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
