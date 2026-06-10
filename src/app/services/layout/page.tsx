'use client';

import { useEffect, useState } from 'react';
import {
  X,
  Plus,
  Clock,
  Package,
  ChevronLeft,
  Save,
  RotateCcw,
  LayoutPanelLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

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

type DiscountType = 'percent' | 'fixed' | null;
type LayoutOrientation = 'horizontal1' | 'horizontal2' | 'vertical1' | 'vertical2';

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
  imageUrl?: string | null;
  price?: string | null;
  services: Service[];
}

interface LayoutSection {
  type: 'services' | 'categories' | 'staff' | 'products';
  title: string;
  services: string[];
}

interface CategoryServiceLayout {
  horizontal1: LayoutSection;
  horizontal2: LayoutSection;
  vertical1: LayoutSection;
  vertical2: LayoutSection;
}

interface ServiceLayoutCardProps {
  service: Service;
  draggable?: boolean;
  onDragStart?: (serviceId: string) => void;
  onRemove?: (serviceId: string) => void;
}

function durationToLabel(minutes: number | null): string {
  if (!minutes) return '';
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} mins`;
  }
  return `${minutes} mins`;
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
      onDragStart={(e) => {
        if (draggable && onDragStart) {
          onDragStart(service.id);
        }
      }}
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

interface LayoutItemCardProps {
  name: string;
  price?: string | number;
  subtitle?: string;
  onRemove: () => void;
}

function LayoutItemCard({
  name,
  price,
  subtitle,
  onRemove,
}: LayoutItemCardProps) {
  return (
    <div className="rounded-xl border border-[var(--primary-start)] bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-medium text-gray-900">
            {name}
          </h4>
          {(price !== undefined || subtitle) && (
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              {price !== undefined && (
                <span className="font-semibold text-[var(--primary-start)]">
                  ${price}
                </span>
              )}
              {subtitle && <span>{subtitle}</span>}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
          aria-label="Remove layout item"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface ServiceDropZoneProps {
  sectionKey: 'horizontal1' | 'horizontal2' | 'vertical1' | 'vertical2';
  section: LayoutSection;
  allAvailableServices: Service[];
  categories: Category[];
  experts: any[];
  products: any[];
  onTitleChange: (title: string) => void;
  onTypeChange: (type: 'services' | 'categories' | 'staff' | 'products') => void;
  isActive: boolean;
  onDragOver: () => void;
  onDrop: () => void;
  onDragLeave: () => void;
  onRemoveService: (serviceId: string) => void;
  onAddService: (serviceId: string) => void;
  onClearSection: () => void;
  onPopulateDefaults: () => void;
  onOpenAddModal: () => void;
}

function ServiceDropZone({
  sectionKey,
  section,
  allAvailableServices,
  categories,
  experts,
  products,
  onTitleChange,
  onTypeChange,
  isActive,
  onDragOver,
  onDrop,
  onDragLeave,
  onRemoveService,
  onAddService,
  onClearSection,
  onPopulateDefaults,
  onOpenAddModal,
}: ServiceDropZoneProps) {
  const [localTitle, setLocalTitle] = useState(section.title);

  useEffect(() => {
    setLocalTitle(section.title);
  }, [section.title]);

  const maxItems = 5;
  const isManual = (section.services || []).length > 0;

  const sectionItems = (() => {
    if (section.type === 'services') {
      return (section.services || [])
        .map((id) => allAvailableServices.find((s) => s.id === id))
        .filter((s): s is Service => !!s);
    } else if (section.type === 'categories') {
      return (section.services || [])
        .map((id) => categories.find((c) => c.id === id))
        .filter((c): c is any => !!c && c.id !== 'default');
    } else if (section.type === 'staff') {
      return (section.services || [])
        .map((id) => experts.find((e) => e.id === id || e.name === id))
        .filter((e): e is any => !!e);
    } else if (section.type === 'products') {
      return (section.services || [])
        .map((id) => products.find((p) => p.id === id || p.name === id))
        .filter((p): p is any => !!p);
    }
    return [];
  })();

  const isFull = sectionItems.length >= maxItems;

  const addableItems = (() => {
    const selectedIds = section.services || [];
    if (section.type === 'services') {
      return allAvailableServices.filter((s) => !selectedIds.includes(s.id));
    } else if (section.type === 'categories') {
      return categories.filter((c) => c.id !== 'default' && !selectedIds.includes(c.id));
    } else if (section.type === 'staff') {
      return experts.filter((e) => !selectedIds.includes(e.id || e.name));
    } else if (section.type === 'products') {
      return products.filter((p) => !selectedIds.includes(p.id || p.name));
    }
    return [];
  })();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
      {/* Header with section name */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <span className="text-xs font-bold text-[var(--primary-start)] uppercase tracking-wider">
          {sectionKey.replace(/(\d+)/, ' $1')}
        </span>
        {(() => {
          let count = 0;
          let label = 'Auto-populated';

          if (isManual) {
            count = (section.services || []).length;
            label = 'Selected';
          } else {
            if (section.type === 'services') {
              count = allAvailableServices.length;
            } else if (section.type === 'categories') {
              count = (categories || []).filter((c) => c.id !== 'default').length;
            } else if (section.type === 'staff') {
              count = (experts || []).length;
            } else if (section.type === 'products') {
              count = (products || []).length;
            }
          }
          const displayCount = Math.min(count, maxItems);
          return (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              isManual ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}>
              {displayCount} / {maxItems} {label}
            </span>
          );
        })()}
      </div>

      {/* Title input */}
      <div>
        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Section Title
        </label>
        <input
          type="text"
          value={section.type === 'staff' ? 'Our Staffs' : section.type === 'services' ? 'Our Services' : section.type === 'products' ? 'Products' : section.type === 'categories' ? 'Our Services' : ''}
          readOnly
          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
          placeholder="Enter section title..."
        />
      </div>

      {/* Content Type Selector */}
      <div>
        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Content Type
        </label>
        <Select value={section.type} onValueChange={(val: any) => onTypeChange(val)}>
          <SelectTrigger className="w-full h-9 text-sm">
            <SelectValue placeholder="Select content type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="services">Services (Separated / Direct List)</SelectItem>
            <SelectItem value="categories">Services (Grouped by Categories)</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="products">Products</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Drag & Drop or Auto-rendered preview */}
      {section.type === 'services' ? (
        <div className="space-y-3">
          {!isFull && addableItems.length > 0 && (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="w-full h-8 text-xs bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition rounded-lg flex items-center justify-center gap-1.5 font-semibold text-gray-650 cursor-pointer shadow-sm animate-fade-in"
            >
              <Plus className="w-3.5 h-3.5 text-gray-450" /> Add Service Directly
            </button>
          )}

          <div
            onDragOver={(event) => {
              event.preventDefault();
              if (!isFull) {
                onDragOver();
              }
            }}
            onDragLeave={onDragLeave}
            onDrop={(event) => {
              event.preventDefault();
              if (!isFull) {
                onDrop();
              }
            }}
            className={`rounded-xl border-2 border-dashed p-3 transition min-h-[8rem] flex flex-col justify-center ${
              isActive && !isFull
                ? 'border-[var(--primary-start)] bg-[var(--card-bg)]'
                : 'border-gray-200 bg-gray-50/50'
            } ${isFull ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            {isManual ? (
              <div className="space-y-2 w-full">
                {sectionItems.map((service: any) => (
                  <ServiceLayoutCard
                    key={service.id}
                    service={service}
                    onRemove={() => onRemoveService(service.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
                <span>Drag services here</span>
                <span className="text-[10px] text-gray-300">or</span>
                <button
                  type="button"
                  onClick={onPopulateDefaults}
                  className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-semibold transition cursor-pointer"
                >
                  Auto-fill first 5 items
                </button>
              </div>
            )}
          </div>

          {isManual && (
            <button
              type="button"
              onClick={onClearSection}
              className="text-[10px] text-blue-600 hover:text-blue-700 hover:underline font-semibold text-left transition select-none flex items-center gap-1 cursor-pointer"
            >
              Reset to dynamic auto-population
            </button>
          )}
        </div>
      ) : (
        /* Non-service type layout (Categories, Staff, Products) */
        <div className="space-y-3">
          {!isFull && addableItems.length > 0 && (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="w-full h-8 text-xs bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition rounded-lg flex items-center justify-center gap-1.5 font-semibold text-gray-655 cursor-pointer shadow-sm animate-fade-in"
            >
              <Plus className="w-3.5 h-3.5 text-gray-450" /> Add {section.type === 'categories' ? 'Category' : section.type === 'staff' ? 'Staff' : 'Product'} Directly
            </button>
          )}

          {isManual ? (
            <div className="space-y-2 w-full animate-fade-in">
              {sectionItems.map((item: any) => {
                let name = item.name;
                let price = item.price || undefined;
                let subtitle = item.role || undefined;
                return (
                  <LayoutItemCard
                    key={item.id || item.name}
                    name={name}
                    price={price}
                    subtitle={subtitle}
                    onRemove={() => onRemoveService(item.id || item.name)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-150 bg-gray-50/50 p-4 text-center text-xs text-gray-500 flex flex-col items-center justify-center min-h-[8rem] space-y-2">
              <span className="font-semibold text-gray-700 capitalize">Auto-Populated</span>
              <span className="text-[10px] text-gray-400 leading-relaxed max-w-[200px]">
                Displays all organization {section.type === 'categories' ? 'categories' : section.type === 'staff' ? 'staff members' : 'products'} automatically (up to 5).
              </span>
              <button
                type="button"
                onClick={onPopulateDefaults}
                className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-semibold transition cursor-pointer pt-1"
              >
                Auto-fill first 5 items
              </button>
            </div>
          )}

          {isManual && (
            <button
              type="button"
              onClick={onClearSection}
              className="text-[10px] text-blue-600 hover:text-blue-700 hover:underline font-semibold text-left transition select-none cursor-pointer flex items-center gap-1"
            >
              Reset to dynamic auto-population
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function normalizeLayout(rawLayout: any): CategoryServiceLayout {
  const defaultSections: CategoryServiceLayout = {
    horizontal1: { type: 'services', title: 'Our Services', services: [] },
    horizontal2: { type: 'staff', title: 'Our Staffs', services: [] },
    vertical1: { type: 'services', title: 'Menu', services: [] },
    vertical2: { type: 'products', title: 'Products', services: [] },
  };

  if (!rawLayout || typeof rawLayout !== 'object') {
    return defaultSections;
  }

  const getSection = (key: string, fallbackType: 'services' | 'categories' | 'staff' | 'products', fallbackTitle: string): LayoutSection => {
    const rawSec = rawLayout[key];
    if (rawSec && typeof rawSec === 'object') {
      return {
        type: rawSec.type || fallbackType,
        title: rawSec.title || fallbackTitle,
        services: Array.isArray(rawSec.services) ? rawSec.services : [],
      };
    }
    return { type: fallbackType, title: fallbackTitle, services: [] };
  };

  const hasOldKeys = ('horizontal' in rawLayout && Array.isArray(rawLayout.horizontal)) ||
                      ('vertical' in rawLayout && Array.isArray(rawLayout.vertical)) ||
                      ('vertical2' in rawLayout && Array.isArray(rawLayout.vertical2));

  const hasNewKeys = 'horizontal1' in rawLayout || 'horizontal2' in rawLayout || 'vertical1' in rawLayout || 'vertical2' in rawLayout;

  if (hasOldKeys && !hasNewKeys) {
    return {
      horizontal1: {
        type: 'services',
        title: 'Our Services',
        services: Array.isArray(rawLayout.horizontal) ? rawLayout.horizontal : [],
      },
      horizontal2: {
        type: 'staff',
        title: 'Our Staffs',
        services: [],
      },
      vertical1: {
        type: 'services',
        title: 'Menu',
        services: Array.isArray(rawLayout.vertical) ? rawLayout.vertical : [],
      },
      vertical2: {
        type: 'products',
        title: rawLayout.vertical2Name || 'Products',
        services: Array.isArray(rawLayout.vertical2) ? rawLayout.vertical2 : [],
      },
    };
  }

  return {
    horizontal1: getSection('horizontal1', 'services', 'Our Services'),
    horizontal2: getSection('horizontal2', 'staff', 'Our Staffs'),
    vertical1: getSection('vertical1', 'services', 'Menu'),
    vertical2: getSection('vertical2', 'products', 'Products'),
  };
}

function buildCategoriesFromServices(services: OrgService[], categories: any[]): Category[] {
  const defaultCat: Category = {
    id: 'default',
    name: 'Services',
    services: [],
  };

  const mappedCategories: Category[] = categories.map((cat) => ({
    id: cat.id || cat._id,
    name: cat.name,
    imageUrl: cat.imageUrl,
    price: cat.price,
    services: [],
  }));

  const categoriesMap: Record<string, Category> = {};
  categoriesMap['default'] = defaultCat;
  for (const cat of mappedCategories) {
    categoriesMap[cat.id] = cat;
  }

  for (const s of services) {
    const mappedService: Service = {
      id: s.id,
      name: s.name,
      price: Number(s.basePrice) || 0,
      discount: s.discountType === 'percent' ? Number(s.discountValue) || 0 : 0,
      duration: durationToLabel(s.durationMinutes),
      image: s.imageUrl,
      category: s.categoryId || 'default',
      discountType: s.discountType,
      discountValue: s.discountValue,
      durationMinutes: s.durationMinutes,
      isActive: s.isActive,
      categoryId: s.categoryId,
    };

    const targetCatId = s.categoryId && categoriesMap[s.categoryId] ? s.categoryId : 'default';
    categoriesMap[targetCatId].services.push(mappedService);
  }

  const result = Object.values(categoriesMap).filter((cat) => cat.id !== 'default' || cat.services.length > 0);
  const orderedResult = [
    ...(categoriesMap['default'] && categoriesMap['default'].services.length > 0 ? [categoriesMap['default']] : []),
    ...mappedCategories,
  ];

  return orderedResult;
}

export default function LayoutPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSavingLayout, setIsSavingLayout] = useState(false);
  const [layoutModalCategory, setLayoutModalCategory] = useState<string>('all');

  const [draggedServiceId, setDraggedServiceId] = useState<string | null>(null);
  const [activeDropZone, setActiveDropZone] = useState<LayoutOrientation | null>(null);
  const [serviceLayouts, setServiceLayouts] = useState<Record<string, CategoryServiceLayout>>({});
  const [experts, setExperts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [addItemsModalSectionKey, setAddItemsModalSectionKey] = useState<LayoutOrientation | null>(null);
  const [addItemsModalCategory, setAddItemsModalCategory] = useState<string>('all');

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
      setProducts(profileRes?.products || []);
      setExperts(expertsRes?.experts || []);

      const layoutsMap: Record<string, CategoryServiceLayout> = {};
      layoutsMap['default'] = servicesRes.defaultLayout || { horizontal: [], vertical: [], vertical2: [], vertical2Name: 'Products' };
      for (const cat of fetchedCategories) {
        layoutsMap[cat.id] = cat.layout || { horizontal: [], vertical: [], vertical2: [], vertical2Name: 'Products' };
      }
      setServiceLayouts(layoutsMap);
    } catch (err) {
      console.error('Error loading layout builder data:', err);
      toast.error('Failed to load layout builder data.');
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    void loadServices();
  }, []);

  const getCategoryLayout = (categoryId: string): CategoryServiceLayout => {
    const layout = serviceLayouts[categoryId];
    return normalizeLayout(layout);
  };

  const updateCategoryLayout = (
    categoryId: string,
    updater: (layout: CategoryServiceLayout) => CategoryServiceLayout
  ) => {
    setServiceLayouts((prev) => {
      const currentLayout = normalizeLayout(prev[categoryId]);
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
      toast.error('Failed to save service layout');
    }
  };

  const handleSaveServiceLayout = async () => {
    setIsSavingLayout(true);
    try {
      const currentLayout = getCategoryLayout('default');
      await saveServiceLayout('default', currentLayout);
      toast.success('Layout saved successfully!');
    } catch (err) {
      console.error('Error saving service layout:', err);
      toast.error('Failed to save layout.');
    } finally {
      setIsSavingLayout(false);
    }
  };

  const handleSectionTitleChange = (
    orientation: LayoutOrientation,
    title: string
  ) => {
    let nextLayout: CategoryServiceLayout | null = null;
    updateCategoryLayout('default', (layout) => {
      nextLayout = {
        ...layout,
        [orientation]: {
          ...layout[orientation],
          title,
        },
      };
      return nextLayout;
    });
    if (nextLayout) {
      void saveServiceLayout('default', nextLayout);
    }
  };

  const handleSectionTypeChange = (
    orientation: LayoutOrientation,
    type: 'services' | 'categories' | 'staff' | 'products'
  ) => {
    let nextLayout: CategoryServiceLayout | null = null;
    updateCategoryLayout('default', (layout) => {
      const defaultTitle = type === 'staff' ? 'Our Staffs' : type === 'services' ? 'Our Services' : type === 'products' ? 'Products' : type === 'categories' ? 'Our Services' : '';
      nextLayout = {
        ...layout,
        [orientation]: {
          ...layout[orientation],
          type,
          title: defaultTitle,
        },
      };
      return nextLayout;
    });
    if (nextLayout) {
      void saveServiceLayout('default', nextLayout);
    }
  };

  const handleAddServiceToLayout = (serviceId: string, orientation: LayoutOrientation) => {
    const currentLayout = getCategoryLayout('default');
    const targetSection = currentLayout[orientation];

    if (targetSection.services.length >= 5) {
      toast.error(`Cannot add more than 5 services to the ${targetSection.title} section.`);
      return;
    }

    if (targetSection.services.includes(serviceId)) {
      toast.error("This item is already in this section.");
      return;
    }

    const nextHorizontal1Services = [...(currentLayout.horizontal1?.services || [])];
    const nextHorizontal2Services = [...(currentLayout.horizontal2?.services || [])];
    const nextVertical1Services = [...(currentLayout.vertical1?.services || [])];
    const nextVertical2Services = [...(currentLayout.vertical2?.services || [])];

    if (orientation === 'horizontal1') {
      nextHorizontal1Services.push(serviceId);
    } else if (orientation === 'horizontal2') {
      nextHorizontal2Services.push(serviceId);
    } else if (orientation === 'vertical1') {
      nextVertical1Services.push(serviceId);
    } else if (orientation === 'vertical2') {
      nextVertical2Services.push(serviceId);
    }

    const nextLayout: CategoryServiceLayout = {
      horizontal1: { ...currentLayout.horizontal1, services: nextHorizontal1Services },
      horizontal2: { ...currentLayout.horizontal2, services: nextHorizontal2Services },
      vertical1: { ...currentLayout.vertical1, services: nextVertical1Services },
      vertical2: { ...currentLayout.vertical2, services: nextVertical2Services },
    };

    setServiceLayouts((prev) => ({
      ...prev,
      default: nextLayout,
    }));

    void saveServiceLayout('default', nextLayout);
  };

  const handleServiceDrop = (orientation: LayoutOrientation) => {
    if (!draggedServiceId) return;
    handleAddServiceToLayout(draggedServiceId, orientation);
    setDraggedServiceId(null);
    setActiveDropZone(null);
  };

  const handleClearSection = (orientation: LayoutOrientation) => {
    let nextLayout: CategoryServiceLayout | null = null;
    updateCategoryLayout('default', (layout) => {
      const targetSection = layout[orientation];
      nextLayout = {
        ...layout,
        [orientation]: {
          ...targetSection,
          services: [],
        },
      };
      return nextLayout;
    });

    if (nextLayout) {
      void saveServiceLayout('default', nextLayout);
    }
  };

  const handlePopulateSectionDefaults = (orientation: LayoutOrientation) => {
    let nextLayout: CategoryServiceLayout | null = null;
    updateCategoryLayout('default', (layout) => {
      const targetSection = layout[orientation];
      let defaultIds: string[] = [];
      if (targetSection.type === 'services') {
        defaultIds = allServices.slice(0, 5).map(s => s.id);
      } else if (targetSection.type === 'categories') {
        defaultIds = categories.filter(c => c.id !== 'default').slice(0, 5).map(c => c.id);
      } else if (targetSection.type === 'staff') {
        defaultIds = experts.slice(0, 5).map(e => e.id || e.name);
      } else if (targetSection.type === 'products') {
        defaultIds = products.slice(0, 5).map(p => p.id || p.name);
      }

      nextLayout = {
        ...layout,
        [orientation]: {
          ...targetSection,
          services: defaultIds,
        },
      };
      return nextLayout;
    });

    if (nextLayout) {
      void saveServiceLayout('default', nextLayout);
    }
  };

  const handleRemoveFromLayout = (
    serviceId: string,
    orientation: LayoutOrientation
  ) => {
    let nextLayout: CategoryServiceLayout | null = null;

    updateCategoryLayout('default', (layout) => {
      const targetSection = layout[orientation];
      nextLayout = {
        ...layout,
        [orientation]: {
          ...targetSection,
          services: targetSection.services.filter((id) => id !== serviceId),
        },
      };
      return nextLayout;
    });

    if (nextLayout) {
      void saveServiceLayout('default', nextLayout);
    }
  };

  const handleResetServiceLayout = () => {
    const nextLayout: CategoryServiceLayout = {
      horizontal1: { type: 'services', title: 'Our Services', services: [] },
      horizontal2: { type: 'staff', title: 'Our Staffs', services: [] },
      vertical1: { type: 'services', title: 'Menu', services: [] },
      vertical2: { type: 'products', title: 'Products', services: [] },
    };
    setServiceLayouts((prev) => ({
      ...prev,
      default: nextLayout,
    }));

    void saveServiceLayout('default', nextLayout);

    setDraggedServiceId(null);
    setActiveDropZone(null);
    toast.success('Layout reset successfully!');
  };

  const allServices = categories.reduce<Service[]>((acc, cat) => {
    return [...acc, ...cat.services];
  }, []);

  const currentLayout = getCategoryLayout('default');
  const totalAvailableCount = allServices.length;

  if (isPageLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-55/50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50/50 pb-12 font-sans">
      {/* Sticky Dashboard Page Header */}
      <div className="bg-white border-b border-gray-100 py-6 px-8 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/services')}
              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-750 transition cursor-pointer flex items-center justify-center shadow-sm"
              title="Back to Services"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <LayoutPanelLeft className="w-6 h-6 text-[var(--primary-start)]" /> Service Layout Builder
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Customize how services, staff, categories, and products are grouped and displayed on your client-facing page.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleResetServiceLayout}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> Reset Layout
            </Button>
            <Button
              onClick={handleSaveServiceLayout}
              disabled={isSavingLayout}
              className="flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" /> {isSavingLayout ? 'Saving...' : 'Save Layout'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
        {/* Workspace: Service List */}
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
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
            <div className="md:col-span-1 border-r border-gray-100 pr-3 max-h-[18rem] overflow-y-auto overflow-x-hidden space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
              
              <button
                type="button"
                onClick={() => setLayoutModalCategory('all')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all text-xs flex justify-between items-center cursor-pointer ${
                  layoutModalCategory === 'all'
                    ? 'bg-[var(--card-bg)] font-semibold text-gray-900 border border-[var(--primary-start)]/20'
                    : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="truncate pr-2">ALL SERVICES</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                  totalAvailableCount > 0
                    ? 'bg-[var(--primary-start)]/10 text-[var(--primary-start)]'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {totalAvailableCount}
                </span>
              </button>

              {categories.map((cat) => {
                const availableCount = cat.services.length;
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
            <div className="md:col-span-3 max-h-[18rem] overflow-y-auto overflow-x-hidden pl-1 pr-2 pt-1 pb-6">
              {(() => {
                const availableInCat = layoutModalCategory === 'all'
                  ? allServices
                  : categories.find(c => c.id === layoutModalCategory)?.services || [];

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

                const catName = layoutModalCategory === 'all'
                  ? 'All Services'
                  : categories.find(c => c.id === layoutModalCategory)?.name || 'this category';

                return (
                  <div className="flex flex-col items-center justify-center h-full min-h-[15rem] rounded-xl bg-[var(--card-bg-light)] px-4 text-center text-xs text-gray-500">
                    No services in {catName}.
                  </div>
                );
              })()}
            </div>
          </div>
        </section>

        {/* Layout Sections Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <ServiceDropZone
            sectionKey="horizontal1"
            section={currentLayout.horizontal1}
            allAvailableServices={allServices}
            categories={categories}
            experts={experts}
            products={products}
            onTitleChange={(title) => handleSectionTitleChange('horizontal1', title)}
            onTypeChange={(type) => handleSectionTypeChange('horizontal1', type)}
            isActive={activeDropZone === 'horizontal1'}
            onDragOver={() => setActiveDropZone('horizontal1')}
            onDrop={() => handleServiceDrop('horizontal1')}
            onDragLeave={() => setActiveDropZone(null)}
            onRemoveService={(serviceId) => handleRemoveFromLayout(serviceId, 'horizontal1')}
            onAddService={(serviceId) => handleAddServiceToLayout(serviceId, 'horizontal1')}
            onClearSection={() => handleClearSection('horizontal1')}
            onPopulateDefaults={() => handlePopulateSectionDefaults('horizontal1')}
            onOpenAddModal={() => {
              setAddItemsModalSectionKey('horizontal1');
              setAddItemsModalCategory('all');
            }}
          />

          <ServiceDropZone
            sectionKey="horizontal2"
            section={currentLayout.horizontal2}
            allAvailableServices={allServices}
            categories={categories}
            experts={experts}
            products={products}
            onTitleChange={(title) => handleSectionTitleChange('horizontal2', title)}
            onTypeChange={(type) => handleSectionTypeChange('horizontal2', type)}
            isActive={activeDropZone === 'horizontal2'}
            onDragOver={() => setActiveDropZone('horizontal2')}
            onDrop={() => handleServiceDrop('horizontal2')}
            onDragLeave={() => setActiveDropZone(null)}
            onRemoveService={(serviceId) => handleRemoveFromLayout(serviceId, 'horizontal2')}
            onAddService={(serviceId) => handleAddServiceToLayout(serviceId, 'horizontal2')}
            onClearSection={() => handleClearSection('horizontal2')}
            onPopulateDefaults={() => handlePopulateSectionDefaults('horizontal2')}
            onOpenAddModal={() => {
              setAddItemsModalSectionKey('horizontal2');
              setAddItemsModalCategory('all');
            }}
          />

          <ServiceDropZone
            sectionKey="vertical1"
            section={currentLayout.vertical1}
            allAvailableServices={allServices}
            categories={categories}
            experts={experts}
            products={products}
            onTitleChange={(title) => handleSectionTitleChange('vertical1', title)}
            onTypeChange={(type) => handleSectionTypeChange('vertical1', type)}
            isActive={activeDropZone === 'vertical1'}
            onDragOver={() => setActiveDropZone('vertical1')}
            onDrop={() => handleServiceDrop('vertical1')}
            onDragLeave={() => setActiveDropZone(null)}
            onRemoveService={(serviceId) => handleRemoveFromLayout(serviceId, 'vertical1')}
            onAddService={(serviceId) => handleAddServiceToLayout(serviceId, 'vertical1')}
            onClearSection={() => handleClearSection('vertical1')}
            onPopulateDefaults={() => handlePopulateSectionDefaults('vertical1')}
            onOpenAddModal={() => {
              setAddItemsModalSectionKey('vertical1');
              setAddItemsModalCategory('all');
            }}
          />

          <ServiceDropZone
            sectionKey="vertical2"
            section={currentLayout.vertical2}
            allAvailableServices={allServices}
            categories={categories}
            experts={experts}
            products={products}
            onTitleChange={(title) => handleSectionTitleChange('vertical2', title)}
            onTypeChange={(type) => handleSectionTypeChange('vertical2', type)}
            isActive={activeDropZone === 'vertical2'}
            onDragOver={() => setActiveDropZone('vertical2')}
            onDrop={() => handleServiceDrop('vertical2')}
            onDragLeave={() => setActiveDropZone(null)}
            onRemoveService={(serviceId) => handleRemoveFromLayout(serviceId, 'vertical2')}
            onAddService={(serviceId) => handleAddServiceToLayout(serviceId, 'vertical2')}
            onClearSection={() => handleClearSection('vertical2')}
            onPopulateDefaults={() => handlePopulateSectionDefaults('vertical2')}
            onOpenAddModal={() => {
              setAddItemsModalSectionKey('vertical2');
              setAddItemsModalCategory('all');
            }}
          />
        </div>
      </div>

      {addItemsModalSectionKey && (
        (() => {
          const section = currentLayout[addItemsModalSectionKey];
          const sectionType = section?.type || 'services';
          const selectedIds = section?.services || [];

          let addableItems: any[] = [];
          if (sectionType === 'services') {
            addableItems = allServices.filter((s) => !selectedIds.includes(s.id));
          } else if (sectionType === 'categories') {
            addableItems = categories.filter((c) => c.id !== 'default' && !selectedIds.includes(c.id));
          } else if (sectionType === 'staff') {
            addableItems = experts.filter((e) => !selectedIds.includes(e.id || e.name));
          } else if (sectionType === 'products') {
            addableItems = products.filter((p) => !selectedIds.includes(p.id || p.name));
          }

          const handleAddItem = (itemId: string) => {
            handleAddServiceToLayout(itemId, addItemsModalSectionKey);
            if (selectedIds.length + 1 >= 5) {
              setAddItemsModalSectionKey(null);
            }
          };

          return (
            <Modal
              isOpen={!!addItemsModalSectionKey}
              onClose={() => setAddItemsModalSectionKey(null)}
              onCancel={() => setAddItemsModalSectionKey(null)}
              title={`Add ${
                sectionType === 'services'
                  ? 'Services'
                  : sectionType === 'categories'
                  ? 'Categories'
                  : sectionType === 'staff'
                  ? 'Staff Members'
                  : 'Products'
              } to Section`}
              size={sectionType === 'services' ? 'xl' : 'lg'}
              showConfirmButton={false}
              cancelButtonText="Close"
            >
              <div className="space-y-4 min-h-[22rem] max-h-[30rem] flex flex-col font-sans">
                {sectionType === 'services' ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 overflow-hidden min-h-[22rem]">
                    {/* Category Filter Column */}
                    <div className="md:col-span-1 border-r border-gray-100 pr-3 overflow-y-auto overflow-x-hidden space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
                      <button
                        type="button"
                        onClick={() => setAddItemsModalCategory('all')}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all text-xs flex justify-between items-center cursor-pointer ${
                          addItemsModalCategory === 'all'
                            ? 'bg-[var(--card-bg)] font-semibold text-gray-900 border border-[var(--primary-start)]/20'
                            : 'hover:bg-gray-50 text-gray-650 hover:text-gray-900'
                        }`}
                      >
                        ALL SERVICES
                      </button>
                      {categories.map((cat) => {
                        const countInCat = cat.services.filter(s => !selectedIds.includes(s.id)).length;
                        const isSelected = addItemsModalCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setAddItemsModalCategory(cat.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-all text-xs flex justify-between items-center cursor-pointer ${
                              isSelected
                                ? 'bg-[var(--card-bg)] font-semibold text-gray-900 border border-[var(--primary-start)]/20'
                                : 'hover:bg-gray-50 text-gray-650 hover:text-gray-900'
                            }`}
                          >
                            <span className="truncate pr-2">{cat.name.toUpperCase()}</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                              countInCat > 0
                                ? 'bg-[var(--primary-start)]/10 text-[var(--primary-start)]'
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              {countInCat}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Services Grid Column */}
                    <div className="md:col-span-3 overflow-y-auto overflow-x-hidden pl-1 pr-2 pt-1 pb-6">
                      {(() => {
                        const filteredServices = addableItems.filter((service) => {
                          if (addItemsModalCategory === 'all') return true;
                          return service.categoryId === addItemsModalCategory || (addItemsModalCategory === 'default' && !service.categoryId);
                        });

                        if (filteredServices.length > 0) {
                          return (
                            <div className="grid gap-3 sm:grid-cols-2">
                              {filteredServices.map((service) => (
                                <div
                                  key={service.id}
                                  onClick={() => handleAddItem(service.id)}
                                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-[var(--primary-start)] hover:shadow-md cursor-pointer flex flex-col justify-between hover:scale-[1.01]"
                                >
                                  <div>
                                    <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">{service.name}</h4>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
                                      <span className="font-bold text-[var(--primary-start)]">${service.price}</span>
                                      {service.discount > 0 && (
                                        <span className="rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-600">
                                          {service.discount}% OFF
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] text-gray-450 mt-2">
                                    <Clock className="h-3 w-3" />
                                    <span>{service.duration || 'No duration'}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        }

                        return (
                          <div className="flex flex-col items-center justify-center h-full min-h-[15rem] rounded-xl bg-[var(--card-bg-light)] px-4 text-center text-xs text-gray-500">
                            All services in this category have been added or none exist.
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ) : (
                  /* Categories, Staff, Products Grids */
                  <div className="overflow-y-auto overflow-x-hidden pr-2 pt-1 pb-6 min-h-[22rem]">
                    {addableItems.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {addableItems.map((item) => {
                          if (sectionType === 'categories') {
                            return (
                              <div
                                key={item.id}
                                onClick={() => handleAddItem(item.id)}
                                className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-[var(--primary-start)] hover:shadow-md cursor-pointer flex items-center gap-3 hover:scale-[1.01]"
                              >
                                {item.imageUrl ? (
                                  <div
                                    className="h-10 w-10 shrink-0 rounded-lg bg-cover bg-center"
                                    style={{ backgroundImage: `url('${item.imageUrl}')` }}
                                  />
                                ) : (
                                  <div className="h-10 w-10 shrink-0 rounded-lg flex items-center justify-center bg-gray-50 text-gray-400">
                                    <Package className="w-5 h-5" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold text-gray-900 text-xs truncate">{item.name}</h4>
                                  {item.price && (
                                    <span className="text-[10px] text-[var(--primary-start)] font-bold">${item.price}</span>
                                  )}
                                </div>
                              </div>
                            );
                          } else if (sectionType === 'staff') {
                            return (
                              <div
                                key={item.id || item.name}
                                onClick={() => handleAddItem(item.id || item.name)}
                                className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-[var(--primary-start)] hover:shadow-md cursor-pointer flex items-center gap-3 hover:scale-[1.01]"
                              >
                                {item.image ? (
                                  <div
                                    className="h-10 w-10 shrink-0 rounded-full bg-cover bg-center"
                                    style={{ backgroundImage: `url('${item.image}')` }}
                                  />
                                ) : (
                                  <div className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center bg-gray-50 text-gray-455 text-[10px] font-bold border border-gray-200">
                                    {item.name.slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold text-gray-900 text-xs truncate">{item.name}</h4>
                                  {item.role && (
                                    <p className="text-[10px] text-gray-500 truncate">{item.role}</p>
                                  )}
                                </div>
                              </div>
                            );
                          } else if (sectionType === 'products') {
                            return (
                              <div
                                key={item.id || item.name}
                                onClick={() => handleAddItem(item.id || item.name)}
                                className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-[var(--primary-start)] hover:shadow-md cursor-pointer flex items-center gap-3 hover:scale-[1.01]"
                              >
                                {item.image ? (
                                  <div
                                    className="h-10 w-10 shrink-0 rounded-lg bg-cover bg-center"
                                    style={{ backgroundImage: `url('${item.image}')` }}
                                  />
                                ) : (
                                  <div className="h-10 w-10 shrink-0 rounded-lg flex items-center justify-center bg-gray-50 text-gray-400">
                                    <Package className="w-5 h-5" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold text-gray-900 text-xs truncate">{item.name}</h4>
                                  {item.price && (
                                    <span className="text-[10px] text-[var(--primary-start)] font-bold">${item.price}</span>
                                  )}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full min-h-[15rem] rounded-xl bg-[var(--card-bg-light)] px-4 text-center text-xs text-gray-500">
                        All items have been added to this section or none exist.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Modal>
          );
        })()
      )}
    </div>
  );
}
