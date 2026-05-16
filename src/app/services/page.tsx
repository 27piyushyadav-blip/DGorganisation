'use client';

import { useEffect, useState } from 'react';
import {
  X,
  Plus,
  Upload,
  Trash2,
  Edit2,
  Package,
  Clock,
  LayoutPanelLeft,
} from 'lucide-react';

import { apiClient } from '@/client/api/api-client';
import { Button } from '@/components/ui/button';
import Modal from '@/components/modal/Modal';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

type DiscountType = 'percent' | 'fixed' | null;
type LayoutOrientation = 'horizontal' | 'vertical';

type OrgService = {
  id: string;
  name: string;
  basePrice: string;
  discountType: DiscountType;
  discountValue: string | null;
  durationMinutes: number | null;
  imageUrl: string | null;
  isActive: boolean;
  updatedAt?: string;
};

interface Service {
  id: string;
  name: string;
  price: number;
  discount: number;
  duration: string;
  image: string | null;
  category: string;
  discountType?: DiscountType;
  discountValue?: string | null;
  durationMinutes?: number | null;
  isActive?: boolean;
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

function durationToLabel(minutes: number | null): string {
  if (!minutes) return '';

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }

    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`;
  }

  return `${minutes} minutes`;
}

function durationLabelToMinutes(label: string): number | null {
  const value = label.trim().toLowerCase();

  if (!value) return null;

  const hourMatch = value.match(/(\d+)\s*h(?:our)?s?/);
  const minuteMatch = value.match(/(\d+)\s*m(?:inute)?s?/);

  const hours = hourMatch ? Number(hourMatch[1]) : 0;
  const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;

  if (hours || minutes) return hours * 60 + minutes;

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function orgServiceToUiService(service: OrgService): Service {
  const discountValue =
    service.discountValue === null || service.discountValue === ''
      ? 0
      : Number(service.discountValue);

  return {
    id: service.id,
    name: service.name,
    price: Number(service.basePrice || 0),
    discount:
      service.discountType === 'percent' && Number.isFinite(discountValue)
        ? discountValue
        : 0,
    duration: durationToLabel(service.durationMinutes),
    image: service.imageUrl,
    category: 'Default',
    discountType: service.discountType,
    discountValue: service.discountValue,
    durationMinutes: service.durationMinutes,
    isActive: service.isActive,
  };
}

function buildCategoriesFromServices(services: OrgService[]): Category[] {
  return [
    {
      id: 'default',
      name: 'Default',
      services: services.map(orgServiceToUiService),
    },
  ];
}

function uiServiceToPayload(service: Service) {
  const discountType: DiscountType =
    service.discountType ?? (service.discount > 0 ? 'percent' : null);

  const discountValue =
    discountType === null
      ? null
      : String(service.discountValue ?? service.discount ?? 0);

  return {
    name: service.name,
    basePrice: Number(service.price || 0),
    discountType,
    discountValue:
      discountValue === null || discountValue === ''
        ? null
        : Number(discountValue),
    durationMinutes:
      service.durationMinutes ?? durationLabelToMinutes(service.duration),
    imageUrl: service.image,
    isActive: service.isActive ?? true,
  };
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
          <h4 className="truncate font-medium text-gray-900">
            {service.name}
          </h4>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className="font-semibold text-[var(--primary-start)]">
              ${service.price}
            </span>

            {service.discount > 0 && (
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">
                {service.discount}% OFF
              </span>
            )}

            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {service.duration || 'No duration'}
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
      onDragOver={(event) => {
        event.preventDefault();

        if (!isFull) {
          onDragOver(orientation);
        }
      }}
      onDragLeave={onDragLeave}
      onDrop={(event) => {
        event.preventDefault();

        if (!isFull) {
          onDrop(orientation);
        }
      }}
      className={`rounded-2xl border-2 border-dashed p-4 transition ${
        isActive && !isFull
          ? 'border-[var(--primary-start)] bg-[var(--card-bg)]'
          : 'border-gray-200 bg-white'
      } ${isFull ? 'cursor-not-allowed opacity-60' : ''}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              services.length >= maxItems
                ? 'bg-red-100 text-red-600'
                : 'bg-[var(--card-bg)] text-gray-700'
            }`}
          >
            {services.length} / {maxItems} selected
          </span>

          {isFull && <span className="text-xs text-red-500">Limit reached</span>}
        </div>
      </div>

      <div
        className={
          orientation === 'horizontal'
            ? 'grid gap-3 md:grid-cols-2 xl:grid-cols-3'
            : 'space-y-3'
        }
      >
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
            Drag services here to build the {title.toLowerCase()} layout. (
            {services.length}/{maxItems})
          </div>
        )}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('default');

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
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isServiceLayoutModalOpen, setIsServiceLayoutModalOpen] =
    useState(false);

  const [draggedServiceId, setDraggedServiceId] = useState<string | null>(null);
  const [activeDropZone, setActiveDropZone] =
    useState<LayoutOrientation | null>(null);
  const [serviceLayouts, setServiceLayouts] = useState<
    Record<string, CategoryServiceLayout>
  >({});

  const loadServices = async () => {
    setIsPageLoading(true);

    try {
      const res = await apiClient<any>(`${API_BASE}/organizations/services`);
      const backendServices: OrgService[] = res.services || [];
      const nextCategories = buildCategoriesFromServices(backendServices);

      setCategories(nextCategories);
      setSelectedCategory(nextCategories[0]?.id || 'default');
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    void loadServices();
  }, []);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    isEdit = false
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be less than 10MB');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    try {
      const body = new FormData();
      body.append('file', file);

      const res = await apiClient<any>(
        `${API_BASE}/organizations/services/upload-image`,
        {
          method: 'POST',
          body,
        }
      );

      const uploadedUrl = res.imageUrl;

      if (isEdit && editingService) {
        setEditingService({ ...editingService, image: uploadedUrl });
      } else {
        setNewService({ ...newService, image: uploadedUrl });
      }
    } finally {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleSaveService = async () => {
    setIsLoading(true);

    try {
      if (editingService) {
        const payload = uiServiceToPayload(editingService);

        const res = await apiClient<any>(
          `${API_BASE}/organizations/services/${editingService.id}`,
          {
            method: 'PUT',
            body: JSON.stringify(payload),
          }
        );

        const updatedService = orgServiceToUiService(res.service);

        setCategories((prev) =>
          prev.map((category) => ({
            ...category,
            services: category.services.map((service) =>
              service.id === editingService.id ? updatedService : service
            ),
          }))
        );

        setEditingService(null);
      } else if (
        isAddingService &&
        newService.name &&
        newService.price !== undefined &&
        !Number.isNaN(newService.price)
      ) {
        const category = categories.find(
          (item) => item.id === selectedCategory
        );

        const serviceToCreate: Service = {
          id: '',
          name: newService.name,
          price: newService.price,
          discount: newService.discount || 0,
          duration: newService.duration || '',
          image: newService.image || null,
          category: category?.name || 'Default',
          discountType:
            newService.discount && newService.discount > 0 ? 'percent' : null,
          discountValue:
            newService.discount && newService.discount > 0
              ? String(newService.discount)
              : null,
          durationMinutes: durationLabelToMinutes(newService.duration || ''),
          isActive: true,
        };

        const payload = uiServiceToPayload(serviceToCreate);

        const res = await apiClient<any>(`${API_BASE}/organizations/services`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        const createdService = orgServiceToUiService(res.service);

        setCategories((prev) =>
          prev.map((category) =>
            category.id === selectedCategory
              ? {
                  ...category,
                  services: [...category.services, createdService],
                }
              : category
          )
        );

        setIsAddingService(false);
        setNewService({
          name: '',
          price: 0,
          discount: 0,
          duration: '',
          image: null,
        });
        setImagePreview(null);
      }

      setIsServiceModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    setIsLoading(true);

    try {
      await apiClient(`${API_BASE}/organizations/services/${serviceId}`, {
        method: 'DELETE',
      });

      setCategories((prev) =>
        prev.map((category) => ({
          ...category,
          services: category.services.filter(
            (service) => service.id !== serviceId
          ),
        }))
      );

      setServiceLayouts((prev) => ({
        ...prev,
        [selectedCategory]: {
          horizontal: (prev[selectedCategory]?.horizontal || []).filter(
            (id) => id !== serviceId
          ),
          vertical: (prev[selectedCategory]?.vertical || []).filter(
            (id) => id !== serviceId
          ),
        },
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = () => {
    setIsLoading(true);

    setTimeout(() => {
      if (newCategoryName.trim()) {
        const newCategory: Category = {
          id: Date.now().toString(),
          name: newCategoryName.trim(),
          services: [],
        };

        setCategories((prev) => [...prev, newCategory]);
        setSelectedCategory(newCategory.id);
        setNewCategoryName('');
      }

      setIsCategoryModalOpen(false);
      setIsLoading(false);
    }, 300);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const nextCategories = categories.filter(
      (category) => category.id !== categoryId
    );

    setCategories(nextCategories);

    setServiceLayouts((prev) => {
      const nextLayouts = { ...prev };
      delete nextLayouts[categoryId];
      return nextLayouts;
    });

    if (selectedCategory === categoryId) {
      setSelectedCategory(nextCategories[0]?.id || '');
    }
  };

  const openAddServiceModal = () => {
    setEditingService(null);
    setNewService({
      name: '',
      price: 0,
      discount: 0,
      duration: '',
      image: null,
    });
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
    setNewService({
      name: '',
      price: 0,
      discount: 0,
      duration: '',
      image: null,
    });
    setImagePreview(null);
    setIsAddingService(false);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setNewCategoryName('');
  };

  const getCategoryLayout = (categoryId: string): CategoryServiceLayout =>
    serviceLayouts[categoryId] || { horizontal: [], vertical: [] };

  const updateCategoryLayout = (
    categoryId: string,
    updater: (layout: CategoryServiceLayout) => CategoryServiceLayout
  ) => {
    setServiceLayouts((prev) => {
      const currentLayout = prev[categoryId] || {
        horizontal: [],
        vertical: [],
      };

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

  const handleServiceDrop = (orientation: LayoutOrientation) => {
    if (!draggedServiceId) return;

    updateCategoryLayout(selectedCategory, (layout) => {
      const targetSection =
        orientation === 'horizontal' ? layout.horizontal : layout.vertical;

      if (targetSection.length >= 5) {
        alert(`Cannot add more than 5 services to the ${orientation} section.`);
        return layout;
      }

      const nextHorizontal = layout.horizontal.filter(
        (id) => id !== draggedServiceId
      );
      const nextVertical = layout.vertical.filter(
        (id) => id !== draggedServiceId
      );

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

  const handleRemoveFromLayout = (
    serviceId: string,
    orientation: LayoutOrientation
  ) => {
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

  const currentCategory = categories.find(
    (category) => category.id === selectedCategory
  );

  const currentServices = currentCategory?.services || [];
  const currentLayout = getCategoryLayout(selectedCategory);
  const layoutServiceIds = new Set([
    ...currentLayout.horizontal,
    ...currentLayout.vertical,
  ]);

  const availableServices = currentServices.filter(
    (service) => !layoutServiceIds.has(service.id)
  );

  const horizontalServices = currentLayout.horizontal
    .map((serviceId) =>
      currentServices.find((service) => service.id === serviceId)
    )
    .filter((service): service is Service => Boolean(service));

  const verticalServices = currentLayout.vertical
    .map((serviceId) =>
      currentServices.find((service) => service.id === serviceId)
    )
    .filter((service): service is Service => Boolean(service));

  return (
    <div className="min-h-full bg-[var(--card-bg-light)]">
      <header className="top-5 z-10 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="items-center space-x-3">
              <h1 className="text-3xl font-bold tracking-tight">
                Service Menu
              </h1>
              <p className="text-muted-foreground">
                Create and manage the services you offer to customers.
              </p>
            </div>

            <Button onClick={loadServices} disabled={isPageLoading}>
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                    className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-all flex justify-between items-center group cursor-pointer ${
                      selectedCategory === category.id
                        ? 'bg-[var(--card-bg)] text-gray-900'
                        : 'hover:bg-[var(--card-bg)] text-gray-700'
                    }`}
                  >
                    <span>{category.name.toUpperCase()}</span>

                    {category.id !== 'default' && (
                      <div
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeleteCategory(category.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-3 h-3 text-[var(--primary-end)]" />
                      </div>
                    )}
                  </button>
                ))}

                {!isPageLoading && categories.length === 0 && (
                  <div className="text-sm text-gray-400 px-3 py-4">
                    No categories found.
                  </div>
                )}
              </div>

              <Button
                onClick={() => setIsCategoryModalOpen(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-[var(--card-bg)] flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">
                  Services in {currentCategory?.name || 'Default'}
                </h3>

                <div className="flex space-x-2">
                  <Button
                    onClick={openAddServiceModal}
                    disabled={isPageLoading || !selectedCategory}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Service</span>
                  </Button>

                  <Button
                    onClick={handleOpenServiceLayoutModal}
                    disabled={isPageLoading || !selectedCategory}
                  >
                    <LayoutPanelLeft className="w-4 h-4" />
                    <span>Service Layout</span>
                  </Button>
                </div>
              </div>

              <div className="p-4 max-h-[24rem] min-h-[24rem] overflow-y-auto">
                {isPageLoading ? (
                  <div className="text-center py-12 text-gray-400">
                    Loading services...
                  </div>
                ) : currentServices.length > 0 ? (
                  <div className="space-y-3">
                    {currentServices.map((service) => (
                      <div
                        key={service.id}
                        className="bg-white border border-[var(--primary-start)] rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-4">
                          {service.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={service.image}
                              alt={service.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-[var(--card-bg-light)] flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}

                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {service.name}
                            </h4>

                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-lg font-bold text-[var(--primary-start)]">
                                ${service.price}
                              </span>

                              {service.discount > 0 && (
                                <span className="text-sm text-green-600">
                                  {service.discount}% OFF
                                </span>
                              )}

                              <span className="text-sm text-gray-500 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {service.duration || 'No duration'}
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
                              disabled={isLoading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
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
                onChange={(event) => {
                  if (editingService) {
                    setEditingService({
                      ...editingService,
                      name: event.target.value,
                    });
                  } else {
                    setNewService({
                      ...newService,
                      name: event.target.value,
                    });
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
                onChange={(event) => {
                  const value = Number(event.target.value);

                  if (editingService) {
                    setEditingService({
                      ...editingService,
                      price: value,
                    });
                  } else {
                    setNewService({
                      ...newService,
                      price: value,
                    });
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
                value={
                  editingService ? editingService.discount : newService.discount
                }
                onChange={(event) => {
                  const value = Number(event.target.value);

                  if (editingService) {
                    setEditingService({
                      ...editingService,
                      discount: value,
                      discountType: value > 0 ? 'percent' : null,
                      discountValue: value > 0 ? String(value) : null,
                    });
                  } else {
                    setNewService({
                      ...newService,
                      discount: value,
                      discountType: value > 0 ? 'percent' : null,
                      discountValue: value > 0 ? String(value) : null,
                    });
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
                value={
                  editingService ? editingService.duration : newService.duration
                }
                onChange={(event) => {
                  const duration = event.target.value;

                  if (editingService) {
                    setEditingService({
                      ...editingService,
                      duration,
                      durationMinutes: durationLabelToMinutes(duration),
                    });
                  } else {
                    setNewService({
                      ...newService,
                      duration,
                      durationMinutes: durationLabelToMinutes(duration),
                    });
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
                onChange={(event) => handleImageUpload(event, !!editingService)}
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview || editingService?.image || ''}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg border border-gray-200"
                />

                <button
                  onClick={() => {
                    setImagePreview(null);

                    if (editingService) {
                      setEditingService({
                        ...editingService,
                        image: null,
                      });
                    } else {
                      setNewService({
                        ...newService,
                        image: null,
                      });
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
              onChange={(event) => setNewCategoryName(event.target.value)}
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
        title={`Service Layout: ${currentCategory?.name || ''}`}
        size="xl"
        cancelButtonText="Close"
        confirmButtonText="Reset Layout"
      >
        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Service List
                </h3>
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
                  All services in this category have been assigned to a layout
                  section.
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