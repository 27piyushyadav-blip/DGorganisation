'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Upload, Plus, Save, Image as ImageIcon } from 'lucide-react';

import { apiClient } from '@/client/api/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

type DiscountType = 'percent' | 'fixed' | null;

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

function calcFinalPrice(basePrice: number, discountType: DiscountType, discountValue: number | null) {
  const base = Number.isFinite(basePrice) ? basePrice : 0;
  let discountAmount = 0;
  if (discountType === 'percent' && discountValue !== null) {
    const pct = Math.max(0, Math.min(100, discountValue));
    discountAmount = (base * pct) / 100;
  } else if (discountType === 'fixed' && discountValue !== null) {
    discountAmount = Math.max(0, discountValue);
  }
  const finalPrice = Math.max(0, base - discountAmount);
  return { discountAmount, finalPrice };
}

export default function ServicesPage() {
  const [services, setServices] = useState<OrgService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient<any>(`${API_BASE}/organizations/services`);
      setServices(res.services || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addNewRow = () => {
    const tempId = `temp_${Date.now()}`;
    setServices((prev) => [
      {
        id: tempId,
        name: '',
        basePrice: '0.00',
        discountType: null,
        discountValue: null,
        durationMinutes: 30,
        imageUrl: null,
        isActive: true,
      },
      ...prev,
    ]);
  };

  const updateLocal = (id: string, patch: Partial<OrgService>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const saveService = async (service: OrgService) => {
    setSavingIds((prev) => new Set(prev).add(service.id));
    try {
      const payload = {
        name: service.name,
        basePrice: Number(service.basePrice || 0),
        discountType: service.discountType,
        discountValue: service.discountValue === null || service.discountValue === '' ? null : Number(service.discountValue),
        durationMinutes: service.durationMinutes,
        imageUrl: service.imageUrl,
        isActive: service.isActive,
      };

      if (service.id.startsWith('temp_')) {
        setAdding(true);
        const res = await apiClient<any>(`${API_BASE}/organizations/services`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        const created: OrgService = res.service;
        setServices((prev) => prev.map((s) => (s.id === service.id ? created : s)));
      } else {
        const res = await apiClient<any>(`${API_BASE}/organizations/services/${service.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        const updated: OrgService = res.service;
        setServices((prev) => prev.map((s) => (s.id === service.id ? updated : s)));
      }
    } finally {
      setAdding(false);
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(service.id);
        return next;
      });
    }
  };

  const uploadImage = async (serviceId: string, file: File) => {
    const body = new FormData();
    body.append('file', file);
    const res = await apiClient<any>(`${API_BASE}/organizations/services/upload-image`, {
      method: 'POST',
      body,
    });
    updateLocal(serviceId, { imageUrl: res.imageUrl });
  };

  const rows = useMemo(() => services, [services]);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Service Menu</h2>
          <p className="text-muted-foreground">Create and manage the services you offer to customers.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={isLoading}>
            Refresh
          </Button>
          <Button onClick={addNewRow} disabled={isLoading}>
            <Plus className="h-4 w-4 mr-2" />
            Add service
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Services</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-muted-foreground">No services yet. Click “Add service”.</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-3 text-xs text-muted-foreground font-medium px-1">
                <div className="col-span-3">Name</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-2">Discount</div>
                <div className="col-span-1">Final</div>
                <div className="col-span-2">Duration</div>
                <div className="col-span-2 text-right">Image / Save</div>
              </div>

              {rows.map((s) => {
                const base = Number(s.basePrice || 0);
                const discVal = s.discountValue === null || s.discountValue === '' ? null : Number(s.discountValue);
                const { finalPrice } = calcFinalPrice(base, s.discountType, discVal);
                const isSaving = savingIds.has(s.id);

                return (
                  <div key={s.id} className="grid grid-cols-12 gap-3 items-center border rounded-lg p-3">
                    <div className="col-span-3">
                      <Label className="sr-only">Name</Label>
                      <Input value={s.name} onChange={(e) => updateLocal(s.id, { name: e.target.value })} placeholder="Service name" />
                    </div>

                    <div className="col-span-2">
                      <Label className="sr-only">Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={s.basePrice}
                        onChange={(e) => updateLocal(s.id, { basePrice: e.target.value })}
                      />
                    </div>

                    <div className="col-span-2 flex gap-2">
                      <Select
                        value={s.discountType || 'none'}
                        onValueChange={(v) => updateLocal(s.id, { discountType: v === 'none' ? null : (v as DiscountType) })}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="percent">%</SelectItem>
                          <SelectItem value="fixed">Fixed</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        type="number"
                        step="0.01"
                        value={s.discountValue ?? ''}
                        onChange={(e) => updateLocal(s.id, { discountValue: e.target.value })}
                        disabled={!s.discountType}
                        placeholder={s.discountType === 'percent' ? '10' : '5'}
                      />
                    </div>

                    <div className="col-span-1">
                      <Badge variant="secondary">${finalPrice.toFixed(2)}</Badge>
                    </div>

                    <div className="col-span-2">
                      <Label className="sr-only">Duration</Label>
                      <Input
                        type="number"
                        value={s.durationMinutes ?? ''}
                        onChange={(e) => updateLocal(s.id, { durationMinutes: e.target.value === '' ? null : Number(e.target.value) })}
                        placeholder="mins"
                      />
                    </div>

                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded border overflow-hidden bg-muted flex items-center justify-center">
                          {s.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={s.imageUrl} alt={s.name || 'service'} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => fileInputRefs.current[s.id]?.click()}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={(el) => {
                            fileInputRefs.current[s.id] = el;
                          }}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) uploadImage(s.id, f);
                          }}
                        />
                      </div>

                      <Button onClick={() => saveService(s)} disabled={isSaving || adding || !s.name}>
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
