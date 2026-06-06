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
import { toast } from 'sonner';

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
  categoryId?: string | null;
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
  categoryId?: string | null;
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
    category: service.categoryId || 'default',
    discountType: service.discountType,
    discountValue: service.discountValue,
    durationMinutes: service.durationMinutes,
    isActive: service.isActive,
    categoryId: service.categoryId,
  };
}

function buildCategoriesFromServices(
  services: OrgService[],
  fetchedCategories: { id: string; name: string }[]
): Category[] {
  const categoryMap = new Map<string, Category>();

  // Initialize Default category
  categoryMap.set('default', {
    id: 'default',
    name: 'Services',
    services: [],
  });

  // Initialize all other categories fetched from DB
  for (const cat of fetchedCategories) {
    categoryMap.set(cat.id, {
      id: cat.id,
      name: cat.name,
      services: [],
    });
  }

  // Group services under their categories
  for (const service of services) {
    const uiService = orgServiceToUiService(service);
    const catId = service.categoryId || 'default';
    const targetCategory = categoryMap.get(catId) || categoryMap.get('default')!;
    targetCategory.services.push(uiService);
  }

  return Array.from(categoryMap.values());
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
    categoryId: service.categoryId === 'default' ? null : (service.categoryId ?? null),
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
  const [layoutModalCategory, setLayoutModalCategory] =
    useState<string>('default');

  const [draggedServiceId, setDraggedServiceId] = useState<string | null>(null);
  const [activeDropZone, setActiveDropZone] =
    useState<LayoutOrientation | null>(null);
  const [serviceLayouts, setServiceLayouts] = useState<
    Record<string, CategoryServiceLayout>
  >({});

  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);

  const requestDeleteCategory = (categoryId: string) => {
    if (categoryId === 'default') return;
    setCategoryToDelete(categoryId);
    setIsDeleteCategoryModalOpen(true);
  };

  const updateDuration = (mins: number) => {
    const clamped = Math.max(5, Math.min(300, mins));
    if (editingService) {
      setEditingService({
        ...editingService,
        duration: durationToLabel(clamped),
        durationMinutes: clamped,
      });
    } else {
      setNewService({
        ...newService,
        duration: durationToLabel(clamped),
        durationMinutes: clamped,
      });
    }
  };

  const getMinuteOptions = (h: number) => {
    if (h === 0) {
      return [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
    }
    if (h === 5) {
      return [0];
    }
    return [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  };

  const loadServices = async () => {
    setIsPageLoading(true);

    try {
      const [categoriesRes, servicesRes] = await Promise.all([
        apiClient<any>(`${API_BASE}/organizations/services/categories`),
        apiClient<any>(`${API_BASE}/organizations/services`),
      ]);

      const fetchedCategories = categoriesRes.categories || [];
      const backendServices: OrgService[] = servicesRes.services || [];
      const nextCategories = buildCategoriesFromServices(backendServices, fetchedCategories);

      setCategories(nextCategories);
      setSelectedCategory(nextCategories[0]?.id || 'default');

      // Map and populate layouts for each category from backend
      const layoutsMap: Record<string, CategoryServiceLayout> = {};
      layoutsMap['default'] = servicesRes.defaultLayout || { horizontal: [], vertical: [] };
      for (const cat of fetchedCategories) {
        layoutsMap[cat.id] = cat.layout || { horizontal: [], vertical: [] };
      }
      setServiceLayouts(layoutsMap);
    } catch (err) {
      console.error('Error loading services/categories:', err);
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
    const name = editingService ? editingService.name : newService.name;
    const price = editingService ? editingService.price : newService.price;
    const duration = editingService ? editingService.duration : newService.duration;

    if (!name || !name.trim()) {
      alert('Service name is required.');
      return;
    }
    if (price === undefined || price === null || Number.isNaN(price)) {
      alert('Price is required.');
      return;
    }
    if (!duration || !duration.trim()) {
      alert('Duration is required.');
      return;
    }

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
        toast.success('Service updated successfully!');
      } else if (isAddingService) {
        const category = categories.find(
          (item) => item.id === selectedCategory
        );

        const serviceToCreate: Service = {
          id: '',
          name: newService.name || '',
          price: newService.price || 0,
          discount: newService.discount || 0,
          duration: newService.duration || '',
          image: newService.image || null,
          category: category?.name || 'Services',
          discountType:
            newService.discount && newService.discount > 0 ? 'percent' : null,
          discountValue:
            newService.discount && newService.discount > 0
              ? String(newService.discount)
              : null,
          durationMinutes: newService.durationMinutes ?? durationLabelToMinutes(newService.duration || ''),
          isActive: true,
          categoryId: selectedCategory === 'default' ? null : selectedCategory,
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
          duration: '1 hour',
          durationMinutes: 60,
          image: null,
        });
        setImagePreview(null);
        toast.success('Service created successfully!');
      }

      setIsServiceModalOpen(false);
    } catch (err) {
      console.error('Error saving service:', err);
      toast.error('Failed to save service.');
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
        default: {
          horizontal: (prev.default?.horizontal || []).filter(
            (id) => id !== serviceId
          ),
          vertical: (prev.default?.vertical || []).filter(
            (id) => id !== serviceId
          ),
        },
        [selectedCategory]: {
          horizontal: (prev[selectedCategory]?.horizontal || []).filter(
            (id) => id !== serviceId
          ),
          vertical: (prev[selectedCategory]?.vertical || []).filter(
            (id) => id !== serviceId
          ),
        },
      }));
      toast.success('Service deleted successfully!');
    } catch (err) {
      console.error('Error deleting service:', err);
      toast.error('Failed to delete service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsLoading(true);

    try {
      const res = await apiClient<any>(
        `${API_BASE}/organizations/services/categories`,
        {
          method: 'POST',
          body: JSON.stringify({ name: newCategoryName.trim() }),
        }
      );

      const newCategory: Category = {
        id: res.category.id,
        name: res.category.name,
        services: [],
      };

      setCategories((prev) => [...prev, newCategory]);
      setSelectedCategory(newCategory.id);
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
      toast.success('Category created successfully!');
    } catch (err) {
      console.error('Error creating category:', err);
      toast.error('Failed to create category.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (categoryId === 'default') return;
    setIsLoading(true);

    try {
      await apiClient(
        `${API_BASE}/organizations/services/categories/${categoryId}`,
        {
          method: 'DELETE',
        }
      );

      // Re-load to properly move orphaned services of deleted category back to Default
      await loadServices();
      toast.success('Category deleted successfully!');
    } catch (err) {
      console.error('Error deleting category:', err);
      toast.error('Failed to delete category.');
    } finally {
      setIsLoading(false);
    }
  };


  const openAddServiceModal = () => {
    setEditingService(null);
    setNewService({
      name: '',
      price: 0,
      discount: 0,
      duration: '1 hour',
      durationMinutes: 60,
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
      duration: '1 hour',
      durationMinutes: 60,
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

  const saveServiceLayout = async (categoryId: string, nextLayout: CategoryServiceLayout) => {
    try {
      await apiClient(
        `${API_BASE}/organizations/services/categories/${categoryId}/layout`,
        {
          method: 'PUT',
          body: JSON.stringify(nextLayout),
        }
      );
    } catch (err) {
      console.error('Error saving service layout:', err);
      alert('Failed to save service layout');
    }
  };

  const handleOpenServiceLayoutModal = () => {
    setDraggedServiceId(null);
    setActiveDropZone(null);
    setLayoutModalCategory(selectedCategory || 'default');
    setIsServiceLayoutModalOpen(true);
  };

  const handleCloseServiceLayoutModal = () => {
    setDraggedServiceId(null);
    setActiveDropZone(null);
    setIsServiceLayoutModalOpen(false);
  };

  const handleServiceDrop = (orientation: LayoutOrientation) => {
    if (!draggedServiceId) return;

    let nextLayout: CategoryServiceLayout | null = null;

    updateCategoryLayout('default', (layout) => {
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

      nextLayout = {
        horizontal: nextHorizontal,
        vertical: nextVertical,
      };

      return nextLayout;
    });

    if (nextLayout) {
      void saveServiceLayout('default', nextLayout);
    }

    setDraggedServiceId(null);
    setActiveDropZone(null);
  };

  const handleRemoveFromLayout = (
    serviceId: string,
    orientation: LayoutOrientation
  ) => {
    let nextLayout: CategoryServiceLayout | null = null;

    updateCategoryLayout('default', (layout) => {
      nextLayout = {
        ...layout,
        [orientation]: layout[orientation].filter((id) => id !== serviceId),
      };
      return nextLayout;
    });

    if (nextLayout) {
      void saveServiceLayout('default', nextLayout);
    }
  };

  const handleResetServiceLayout = () => {
    const nextLayout = { horizontal: [], vertical: [] };
    setServiceLayouts((prev) => ({
      ...prev,
      default: nextLayout,
    }));

    void saveServiceLayout('default', nextLayout);

    setDraggedServiceId(null);
    setActiveDropZone(null);
  };

  const currentCategory = categories.find(
    (category) => category.id === selectedCategory
  );

  const currentServices = currentCategory?.services || [];

  // Service Layout is global/independent of category, using 'default' layout
  const allServices = categories.reduce<Service[]>((acc, cat) => {
    return [...acc, ...cat.services];
  }, []);

  const currentLayout = getCategoryLayout('default');
  const layoutServiceIds = new Set([
    ...currentLayout.horizontal,
    ...currentLayout.vertical,
  ]);

  const totalAvailableCount = allServices.filter(
    (service) => !layoutServiceIds.has(service.id)
  ).length;

  const horizontalServices = currentLayout.horizontal
    .map((serviceId) =>
      allServices.find((service) => service.id === serviceId)
    )
    .filter((service): service is Service => Boolean(service));

  const verticalServices = currentLayout.vertical
    .map((serviceId) =>
      allServices.find((service) => service.id === serviceId)
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
                          requestDeleteCategory(category.id);
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
                  Services in {currentCategory?.name || 'Services'}
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
                    disabled={isPageLoading}
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
                      className="mt-3 text-[var(--primary-start)] hover:text-[var(--primary-end)] font-medium"
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary-start)] focus:ring-1 focus:ring-[var(--primary-start)]/30"
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary-start)] focus:ring-1 focus:ring-[var(--primary-start)]/30"
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary-start)] focus:ring-1 focus:ring-[var(--primary-start)]/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration *
              </label>

              <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-inner">
                {/* Header/Status */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[var(--primary-start)]" />
                    Selected Duration:
                  </span>
                  <span className="font-bold text-[var(--primary-end)] bg-[var(--primary-start)]/10 border border-[var(--primary-start)]/25 px-3 py-1 rounded-full shadow-sm">
                    {editingService 
                      ? durationToLabel(editingService.durationMinutes || durationLabelToMinutes(editingService.duration))
                      : durationToLabel(newService.durationMinutes || durationLabelToMinutes(newService.duration || '')) || '1 hour'}
                  </span>
                </div>

                {/* Slider with +/- buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const currentVal = editingService
                        ? (editingService.durationMinutes || durationLabelToMinutes(editingService.duration) || 60)
                        : (newService.durationMinutes || durationLabelToMinutes(newService.duration || '') || 60);
                      updateDuration(currentVal - 5);
                    }}
                    className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 active:scale-95 transition cursor-pointer select-none font-bold text-lg"
                    title="Decrease by 5 minutes"
                  >
                    -
                  </button>

                  <div className="flex-1 flex flex-col">
                    <input
                      type="range"
                      min="5"
                      max="300"
                      step="5"
                      value={
                        editingService
                          ? (editingService.durationMinutes || durationLabelToMinutes(editingService.duration) || 60)
                          : (newService.durationMinutes || durationLabelToMinutes(newService.duration || '') || 60)
                      }
                      onChange={(event) => {
                        updateDuration(Number(event.target.value));
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--primary-start)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-start)]/30 transition-all"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                      <span>5 mins</span>
                      <span>5 hours</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const currentVal = editingService
                        ? (editingService.durationMinutes || durationLabelToMinutes(editingService.duration) || 60)
                        : (newService.durationMinutes || durationLabelToMinutes(newService.duration || '') || 60);
                      updateDuration(currentVal + 5);
                    }}
                    className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 active:scale-95 transition cursor-pointer select-none font-bold text-lg"
                    title="Increase by 5 minutes"
                  >
                    +
                  </button>
                </div>

                {/* Direct Dropdowns for Hours and Minutes */}
                <div className="pt-2 border-t border-gray-200/60">
                  <p className="text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Exact Time Selector</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">Hours</label>
                      <select
                        value={Math.floor(
                          (editingService
                            ? (editingService.durationMinutes || durationLabelToMinutes(editingService.duration) || 60)
                            : (newService.durationMinutes || durationLabelToMinutes(newService.duration || '') || 60)
                          ) / 60
                        )}
                        onChange={(e) => {
                          const h = Number(e.target.value);
                          const currentVal = editingService
                            ? (editingService.durationMinutes || durationLabelToMinutes(editingService.duration) || 60)
                            : (newService.durationMinutes || durationLabelToMinutes(newService.duration || '') || 60);
                          const m = currentVal % 60;
                          
                          // If hours is 5, force mins to 0
                          let targetMins = m;
                          if (h === 5) {
                            targetMins = 0;
                          } else if (h === 0 && m === 0) {
                            targetMins = 5; // force min 5 mins
                          }
                          updateDuration(h * 60 + targetMins);
                        }}
                        className="w-full px-2.5 py-1.5 border border-gray-200 bg-white rounded-lg focus:outline-none focus:border-[var(--primary-start)] focus:ring-1 focus:ring-[var(--primary-start)]/30 text-sm text-gray-700 font-medium"
                      >
                        {[0, 1, 2, 3, 4, 5].map((h) => (
                          <option key={h} value={h}>
                            {h} hour{h !== 1 ? 's' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">Minutes</label>
                      <select
                        value={
                          (editingService
                            ? (editingService.durationMinutes || durationLabelToMinutes(editingService.duration) || 60)
                            : (newService.durationMinutes || durationLabelToMinutes(newService.duration || '') || 60)
                          ) % 60
                        }
                        onChange={(e) => {
                          const m = Number(e.target.value);
                          const currentVal = editingService
                            ? (editingService.durationMinutes || durationLabelToMinutes(editingService.duration) || 60)
                            : (newService.durationMinutes || durationLabelToMinutes(newService.duration || '') || 60);
                          const h = Math.floor(currentVal / 60);
                          updateDuration(h * 60 + m);
                        }}
                        className="w-full px-2.5 py-1.5 border border-gray-200 bg-white rounded-lg focus:outline-none focus:border-[var(--primary-start)] focus:ring-1 focus:ring-[var(--primary-start)]/30 text-sm text-gray-700 font-medium"
                      >
                        {getMinuteOptions(
                          Math.floor(
                            (editingService
                              ? (editingService.durationMinutes || durationLabelToMinutes(editingService.duration) || 60)
                              : (newService.durationMinutes || durationLabelToMinutes(newService.duration || '') || 60)
                            ) / 60
                          )
                        ).map((m) => (
                          <option key={m} value={m}>
                            {m} min{m !== 1 ? 's' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="pt-2 border-t border-gray-200/60">
                  <p className="text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Quick Presets</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[15, 30, 45, 60, 90, 120, 180].map((mins) => {
                      const label = mins >= 60 ? `${mins / 60}h` : `${mins}m`;
                      const currentVal = editingService
                        ? (editingService.durationMinutes || durationLabelToMinutes(editingService.duration) || 60)
                        : (newService.durationMinutes || durationLabelToMinutes(newService.duration || '') || 60);
                      const isSelected = currentVal === mins;

                      return (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => {
                            updateDuration(mins);
                          }}
                          className={`text-xs px-2.5 py-1 rounded-full border transition cursor-pointer select-none ${
                            isSelected
                              ? 'bg-[var(--primary-start)] border-[var(--primary-start)] text-white font-semibold shadow-sm'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Image
            </label>

            <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[var(--primary-start)] transition">
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary-start)] focus:ring-1 focus:ring-[var(--primary-start)]/30"
              autoFocus
            />

            <p className="mt-2 text-sm text-gray-500">
              Categories help organize your services for better navigation.
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteCategoryModalOpen}
        onClose={() => {
          setIsDeleteCategoryModalOpen(false);
          setCategoryToDelete(null);
        }}
        title="Delete Category"
        size="sm"
        confirmButtonText="Delete Category"
        cancelButtonText="Cancel"
        onConfirm={async () => {
          if (categoryToDelete) {
            setIsDeleteCategoryModalOpen(false);
            const id = categoryToDelete;
            setCategoryToDelete(null);
            await handleDeleteCategory(id);
          }
        }}
        onCancel={() => {
          setIsDeleteCategoryModalOpen(false);
          setCategoryToDelete(null);
        }}
        isConfirmLoading={isLoading}
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to delete this category? All services belonging to it will be moved back to the default <strong>Services</strong> category.
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={isServiceLayoutModalOpen}
        onClose={handleCloseServiceLayoutModal}
        onCancel={handleCloseServiceLayoutModal}
        onConfirm={handleResetServiceLayout}
        title="Service Layout"
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
                {totalAvailableCount} available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-h-[18rem]">
              {/* Left Column: Categories List */}
              <div className="md:col-span-1 border-r border-gray-100 pr-3 max-h-[18rem] overflow-y-auto space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
                {categories.map((cat) => {
                  const availableCount = cat.services.filter(s => !layoutServiceIds.has(s.id)).length;
                  const isSelected = layoutModalCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setLayoutModalCategory(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all text-xs flex justify-between items-center cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--card-bg)] font-semibold text-gray-900 border border-[var(--primary-start)]/20'
                          : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <span className="truncate pr-2">{cat.name.toUpperCase()}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                        availableCount > 0 
                          ? 'bg-[var(--primary-start)]/10 text-[var(--primary-start)]' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {availableCount}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Services Grid */}
              <div className="md:col-span-3 max-h-[18rem] overflow-y-auto pl-1">
                {(() => {
                  const cat = categories.find(c => c.id === layoutModalCategory);
                  const availableInCat = cat?.services.filter(s => !layoutServiceIds.has(s.id)) || [];

                  if (availableInCat.length > 0) {
                    return (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {availableInCat.map((service) => (
                          <ServiceLayoutCard
                            key={service.id}
                            service={service}
                            draggable
                            onDragStart={(serviceId) => setDraggedServiceId(serviceId)}
                          />
                        ))}
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col items-center justify-center h-full min-h-[15rem] rounded-xl bg-[var(--card-bg-light)] px-4 text-center text-xs text-gray-500">
                      All services in {cat?.name || 'this category'} have been assigned to a layout section.
                    </div>
                  );
                })()}
              </div>
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