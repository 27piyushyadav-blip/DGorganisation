'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Plus,
  Upload,
  Trash2,
  Edit2,
  Package,
  Clock,
  LayoutPanelLeft,
  Eye,
} from 'lucide-react';

import { apiClient } from '@/client/api/api-client';
import { Button } from '@/components/ui/button';
import Modal from '@/components/modal/Modal';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const CLIENT_BASE = process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3002';

type DiscountType = 'percent' | 'fixed' | null;

type OrgService = {
  id: string;
  name: string;
  basePrice: string;
  discountType: DiscountType;
  discountValue: string | null;
  durationMinutes: number | null;
  imageUrl: string | null;
  description: string | null;
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
  description: string | null;
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
  imageUrl?: string | null;
  price?: string | null;
  services: Service[];
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
    description: service.description ?? null,
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
  fetchedCategories: { id: string; name: string; imageUrl?: string | null; price?: string | null }[]
): Category[] {
  const categoryMap = new Map<string, Category>();

  // Initialize Default category
  categoryMap.set('default', {
    id: 'default',
    name: 'Services',
    imageUrl: null,
    price: null,
    services: [],
  });

  // Initialize all other categories fetched from DB
  for (const cat of fetchedCategories) {
    categoryMap.set(cat.id, {
      id: cat.id,
      name: cat.name,
      imageUrl: cat.imageUrl || null,
      price: cat.price || null,
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
    description: service.description ?? null,
    isActive: service.isActive ?? true,
    categoryId: service.categoryId === 'default' ? null : (service.categoryId ?? null),
  };
}

export default function ServicesPage() {
  const router = useRouter();
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
    description: null,
  });

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryPrice, setNewCategoryPrice] = useState('');
  const [newCategoryImageUrl, setNewCategoryImageUrl] = useState<string | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState<string | null>(null);
  const [isCategoryImageUploading, setIsCategoryImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCategoriesSetting, setShowCategoriesSetting] = useState(false);

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [experts, setExperts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

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
      const [categoriesRes, servicesRes, profileRes, expertsRes] = await Promise.all([
        apiClient<any>(`${API_BASE}/organizations/services/categories`),
        apiClient<any>(`${API_BASE}/organizations/services`),
        apiClient<any>(`${API_BASE}/organizations/profile`),
        apiClient<any>(`${API_BASE}/organizations/experts`).catch(() => ({ experts: [] })),
      ]);

      const fetchedCategories = categoriesRes.categories || [];
      const backendServices: OrgService[] = servicesRes.services || [];
      const nextCategories = buildCategoriesFromServices(backendServices, fetchedCategories);

      setCategories(nextCategories);
      setSelectedCategory(nextCategories[0]?.id || 'default');
      setShowCategoriesSetting(profileRes?.showCategories || false);
      setOrgId(profileRes?.id || null);
      setProducts(profileRes?.products || []);
      setExperts(expertsRes?.experts || []);
    } catch (err) {
      console.error('Error loading services/categories:', err);
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleToggleShowCategories = async (checked: boolean) => {
    setShowCategoriesSetting(checked);
    try {
      await apiClient<any>(`${API_BASE}/organizations/profile`, {
        method: 'PUT',
        body: JSON.stringify({
          showCategories: checked,
        }),
      });
      toast.success(
        checked
          ? 'Categories will now be displayed on your booking page.'
          : 'Services will now be displayed directly on your booking page.'
      );
    } catch (err) {
      console.error('Failed to update category display setting:', err);
      toast.error('Failed to update display setting.');
      // Revert state on failure
      setShowCategoriesSetting(!checked);
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
      toast.error('Image must be less than 10MB');
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
      toast.error('Service name is required.');
      return;
    }
    if (price === undefined || price === null || Number.isNaN(price)) {
      toast.error('Price is required.');
      return;
    }
    if (!duration || !duration.trim()) {
      toast.error('Duration is required.');
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
          description: newService.description || null,
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
          description: null,
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
      toast.success('Service deleted successfully!');
    } catch (err) {
      console.error('Error deleting service:', err);
      toast.error('Failed to delete service.');
    } finally {
      setIsLoading(false);
    }
  };

  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryPrice('');
    setNewCategoryImageUrl(null);
    setCategoryImagePreview(null);
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryPrice(category.price || '');
    setNewCategoryImageUrl(category.imageUrl || null);
    setCategoryImagePreview(category.imageUrl || null);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name is required.');
      return;
    }
    setIsLoading(true);

    try {
      if (editingCategory) {
        const res = await apiClient<any>(
          `${API_BASE}/organizations/services/categories/${editingCategory.id}`,
          {
            method: 'PATCH',
            body: JSON.stringify({
              name: newCategoryName.trim(),
              imageUrl: newCategoryImageUrl || null,
              price: newCategoryPrice.trim() || null,
            }),
          }
        );

        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === editingCategory.id
              ? {
                  ...cat,
                  name: res.category.name,
                  imageUrl: res.category.imageUrl || null,
                  price: res.category.price || null,
                }
              : cat
          )
        );

        setEditingCategory(null);
        toast.success('Category updated successfully!');
      } else {
        const res = await apiClient<any>(
          `${API_BASE}/organizations/services/categories`,
          {
            method: 'POST',
            body: JSON.stringify({
              name: newCategoryName.trim(),
              imageUrl: newCategoryImageUrl || null,
              price: newCategoryPrice.trim() || null,
            }),
          }
        );

        const newCategory: Category = {
          id: res.category.id,
          name: res.category.name,
          imageUrl: res.category.imageUrl || null,
          price: res.category.price || null,
          services: [],
        };

        setCategories((prev) => [...prev, newCategory]);
        setSelectedCategory(newCategory.id);
        toast.success('Category created successfully!');
      }

      setNewCategoryName('');
      setNewCategoryPrice('');
      setNewCategoryImageUrl(null);
      setCategoryImagePreview(null);
      setIsCategoryModalOpen(false);
    } catch (err) {
      console.error('Error saving category:', err);
      toast.error('Failed to save category.');
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
      description: null,
    });
    setImagePreview(null);
    setIsAddingService(false);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryPrice('');
    setNewCategoryImageUrl(null);
    setCategoryImagePreview(null);
  };

  const handleCategoryImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setCategoryImagePreview(previewUrl);
    setIsCategoryImageUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await apiClient<any>(
        `${API_BASE}/organizations/services/categories/upload-image`,
        { method: 'POST', body },
      );
      setNewCategoryImageUrl(res.imageUrl);
    } catch (err) {
      console.error('Category image upload failed:', err);
      toast.error('Failed to upload image.');
      setCategoryImagePreview(null);
    } finally {
      setIsCategoryImageUploading(false);
      URL.revokeObjectURL(previewUrl);
    }
  };

  const currentCategory = categories.find(
    (category) => category.id === selectedCategory
  );

  const currentServices = currentCategory?.services || [];

  return (
    <div className="min-h-full bg-[var(--card-bg-light)]">
      <header className="top-5 z-10 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-center gap-4 py-4 border-b border-gray-100">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">
                Service Menu
              </h1>
              <p className="text-muted-foreground text-sm">
                Create and manage the services you offer to customers.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button onClick={loadServices} disabled={isPageLoading} variant="outline">
                Refresh
              </Button>

              <Button
                disabled={isPageLoading || !orgId}
                onClick={() => {
                  if (orgId) {
                    window.open(`${CLIENT_BASE}/main/specific/${orgId}`, '_blank');
                  }
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                <span>Preview</span>
              </Button>
            </div>
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

              <div className="p-2 max-h-[calc(100vh-26rem)] min-h-[calc(100vh-26rem)] overflow-y-auto">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-all flex justify-between items-center group cursor-pointer select-none ${
                      selectedCategory === category.id
                        ? 'bg-[var(--card-bg)] text-gray-900'
                        : 'hover:bg-[var(--card-bg)] text-gray-700'
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      {category.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="w-7 h-7 rounded-md object-cover flex-shrink-0 border border-gray-200"
                        />
                      ) : (
                        <span className="w-7 h-7 rounded-md bg-[var(--card-bg-light)] flex-shrink-0 flex items-center justify-center border border-gray-200">
                          <Package className="w-3.5 h-3.5 text-gray-400" />
                        </span>
                      )}
                      <span className="truncate">{category.name.toUpperCase()}</span>
                      {category.price && (
                        <span className="text-xs font-semibold text-[var(--primary-start)] flex-shrink-0">
                          ${category.price}
                        </span>
                      )}
                    </span>

                    {category.id !== 'default' && (
                      <div className="flex items-center gap-1.5 transition flex-shrink-0">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openEditCategoryModal(category);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-950 rounded hover:bg-gray-200 transition cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            requestDeleteCategory(category.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 transition cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {!isPageLoading && categories.length === 0 && (
                  <div className="text-sm text-gray-400 px-3 py-4">
                    No categories found.
                  </div>
                )}
              </div>

              <Button
                onClick={openAddCategoryModal}
                className="w-full"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-[var(--card-bg)] flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  {currentCategory?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentCategory.imageUrl}
                      alt={currentCategory.name}
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200 shadow-sm flex-shrink-0"
                    />
                  ) : (
                    selectedCategory !== 'default' && (
                      <div className="w-10 h-10 rounded-lg bg-[var(--card-bg-light)] flex items-center justify-center border border-gray-200 flex-shrink-0">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                    )
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 truncate">
                        Services in {currentCategory?.name || 'Services'}
                      </h3>
                      {selectedCategory !== 'default' && currentCategory && (
                        <button
                          onClick={() => openEditCategoryModal(currentCategory)}
                          className="p-1 rounded-md text-gray-400 hover:bg-gray-150 hover:text-gray-900 transition cursor-pointer flex items-center justify-center"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {selectedCategory !== 'default' && currentCategory?.price && (
                      <p className="text-xs font-semibold text-[var(--primary-start)] mt-0.5">
                        Starting Price: ${currentCategory.price}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={openAddServiceModal}
                    disabled={isPageLoading || !selectedCategory}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Service</span>
                  </Button>

                  <Button
                    onClick={() => router.push('/services/layout')}
                    disabled={isPageLoading}
                  >
                    <LayoutPanelLeft className="w-4 h-4" />
                    <span>Service Layout</span>
                  </Button>
                </div>
              </div>

              <div className="p-4 max-h-[calc(100vh-24.5rem)] min-h-[calc(100vh-24.5rem)] overflow-y-auto">
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

          {/* Nature of Service */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nature of Service
              <span className="ml-1.5 text-xs font-normal text-gray-400">( max 50 words — shown on client service cards )</span>
            </label>
            <textarea
              rows={3}
              maxLength={300}
              placeholder="Briefly describe what this service involves, its benefits, or who it's for…"
              value={editingService ? (editingService.description ?? '') : (newService.description ?? '')}
              onChange={(e) => {
                const val = e.target.value;
                if (editingService) {
                  setEditingService({ ...editingService, description: val || null });
                } else {
                  setNewService({ ...newService, description: val || null });
                }
              }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary-start)] focus:ring-1 focus:ring-[var(--primary-start)]/30 text-sm resize-none"
            />
            <p className="mt-1 text-right text-[11px] text-gray-400">
              {(() => {
                const val = editingService ? (editingService.description ?? '') : (newService.description ?? '');
                const words = val.trim().split(/\s+/).filter(Boolean).length;
                return `${words} / 50 words`;
              })()}
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isCategoryModalOpen}
        onClose={closeCategoryModal}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        size="sm"
        confirmButtonText={editingCategory ? 'Update Category' : 'Add Category'}
        onConfirm={handleSaveCategory}
        onCancel={closeCategoryModal}
        isConfirmLoading={isLoading}
      >
        <div className="space-y-4">
          {/* Category Name */}
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
          </div>

          {/* Category Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Starting Price (optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newCategoryPrice}
                onChange={(event) => setNewCategoryPrice(event.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary-start)] focus:ring-1 focus:ring-[var(--primary-start)]/30"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">Displayed beside the category name.</p>
          </div>

          {/* Category Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Image (optional)
            </label>
            {categoryImagePreview ? (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={categoryImagePreview}
                  alt="Category preview"
                  className="w-24 h-24 rounded-xl object-cover border border-gray-200 shadow-sm"
                />
                {isCategoryImageUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
                    <span className="text-white text-xs font-medium">Uploading…</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => { setNewCategoryImageUrl(null); setCategoryImagePreview(null); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="category-image-upload"
                className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[var(--primary-start)] hover:bg-[var(--card-bg-light)] transition"
              >
                <Upload className="w-5 h-5 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">Click to upload image</span>
                <input
                  id="category-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCategoryImageUpload}
                />
              </label>
            )}
            <p className="mt-2 text-xs text-gray-400">
              Image shown beside the category name in the sidebar.
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
    </div>
  );
}