'use client';

import { useState, useEffect, useRef } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/client/api/api-client';
import {
  Image as ImageIcon,
  Trash2,
  Plus,
  Loader2,
  ExternalLink,
  AlertCircle,
  ArrowRight,
  Pencil,
  Upload,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface BannerItem {
  id: string;
  imageUrl: string;
  title?: string;
  description?: string;
  link?: string;
}

interface BannersState {
  horizontal: BannerItem[];
  vertical: BannerItem[];
}

const BANNER_ASPECTS = {
  horizontal: 16 / 9,
  vertical: 9 / 16,
} as const;

const BANNER_ASPECT_CLASSES = {
  horizontal: 'aspect-[16/9]',
  vertical: 'aspect-[9/16]',
} as const;

const objectUrlToImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', reject);
    image.src = url;
  });

const canvasToFile = (canvas: HTMLCanvasElement, fileName: string, mimeType: string) =>
  new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to crop image'));
          return;
        }

        resolve(new File([blob], fileName, { type: blob.type || mimeType }));
      },
      mimeType,
      0.92
    );
  });

const getCroppedImageFile = async (
  imageSrc: string,
  crop: Area,
  fileName: string,
  mimeType: string
) => {
  const image = await objectUrlToImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = crop.width;
  canvas.height = crop.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context unavailable');
  }

  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);

  const safeMimeType = mimeType && mimeType.startsWith('image/') ? mimeType : 'image/jpeg';
  return canvasToFile(canvas, fileName, safeMimeType);
};

export default function BannersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [banners, setBanners] = useState<BannersState>({ horizontal: [], vertical: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'horizontal' | 'vertical'>('horizontal');
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerDescription, setNewBannerDescription] = useState('');
  const [newBannerLink, setNewBannerLink] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [editingType, setEditingType] = useState<'horizontal' | 'vertical'>('horizontal');
  const [editBannerTitle, setEditBannerTitle] = useState('');
  const [editBannerDescription, setEditBannerDescription] = useState('');
  const [editBannerLink, setEditBannerLink] = useState('');
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string>('');
  const [editCrop, setEditCrop] = useState<Point>({ x: 0, y: 0 });
  const [editZoom, setEditZoom] = useState(1);
  const [editCroppedAreaPixels, setEditCroppedAreaPixels] = useState<Area | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;

    const loadBanners = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient<{ banners?: BannersState }>(`${API_BASE}/organizations/banners`);
        if (!isMounted) return;

        if (res?.banners) {
          setBanners({
            horizontal: res.banners.horizontal || [],
            vertical: res.banners.vertical || [],
          });
        }
      } catch (err) {
        console.error('Error loading banners:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadBanners();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (editPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(editPreviewUrl);
      }
    };
  }, [editPreviewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    }
  };

  const resetUploadForm = () => {
    if (previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl('');
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setNewBannerTitle('');
    setNewBannerDescription('');
    setNewBannerLink('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenUpload = (type: 'horizontal' | 'vertical') => {
    setUploadType(type);
    resetUploadForm();
    setIsUploadModalOpen(true);
  };

  const handleCloseUpload = () => {
    setIsUploadModalOpen(false);
    resetUploadForm();
  };

  const handleUploadBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !previewUrl || !croppedAreaPixels) return;

    setIsUploading(true);
    try {
      const croppedFile = await getCroppedImageFile(
        previewUrl,
        croppedAreaPixels,
        selectedFile.name,
        selectedFile.type || 'image/jpeg'
      );

      const formData = new FormData();
      formData.append('file', croppedFile);

      // 1. Upload the image file to banners folder
      const uploadRes = await apiClient<{ imageUrl: string }>(
        `${API_BASE}/organizations/banners/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!uploadRes?.imageUrl) {
        throw new Error('Upload failed');
      }

      // 2. Create the new banner item
      const newBanner: BannerItem = {
        id: Math.random().toString(36).substring(2, 9),
        imageUrl: uploadRes.imageUrl,
        title: newBannerTitle.trim() || undefined,
        description: newBannerDescription.trim() || undefined,
        link: newBannerLink.trim() || undefined,
      };

      // 3. Update local state and save to DB
      const nextBanners = {
        ...banners,
        [uploadType]: [...banners[uploadType], newBanner],
      };

      await apiClient(`${API_BASE}/organizations/banners`, {
        method: 'PUT',
        body: JSON.stringify(nextBanners),
      });

      setBanners(nextBanners);
      handleCloseUpload();
    } catch (err) {
      console.error('Error uploading banner:', err);
      alert('Failed to upload banner. Please make sure the backend is running and the file is an image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteBanner = async (type: 'horizontal' | 'vertical', bannerId: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const nextBanners = {
        ...banners,
        [type]: banners[type].filter((b) => b.id !== bannerId),
      };

      await apiClient(`${API_BASE}/organizations/banners`, {
        method: 'PUT',
        body: JSON.stringify(nextBanners),
      });

      setBanners(nextBanners);
    } catch (err) {
      console.error('Error deleting banner:', err);
      alert('Failed to delete banner');
    }
  };

  const handleOpenEdit = (type: 'horizontal' | 'vertical', banner: BannerItem) => {
    setEditingType(type);
    setEditingBanner(banner);
    setEditBannerTitle(banner.title || '');
    setEditBannerDescription(banner.description || '');
    setEditBannerLink(banner.link || '');
    setEditPreviewUrl(banner.imageUrl);
    setEditSelectedFile(null);
    setEditCrop({ x: 0, y: 0 });
    setEditZoom(1);
    setEditCroppedAreaPixels(null);
    setIsEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setEditingBanner(null);
    setEditBannerTitle('');
    setEditBannerDescription('');
    setEditBannerLink('');
    setEditPreviewUrl('');
    setEditSelectedFile(null);
    setEditCrop({ x: 0, y: 0 });
    setEditZoom(1);
    setEditCroppedAreaPixels(null);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (editPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(editPreviewUrl);
      }

      setEditSelectedFile(file);
      const url = URL.createObjectURL(file);
      setEditPreviewUrl(url);
      setEditCrop({ x: 0, y: 0 });
      setEditZoom(1);
      setEditCroppedAreaPixels(null);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;

    setIsLoading(true);
    try {
      let finalImageUrl = editingBanner.imageUrl;

      if (editSelectedFile) {
        if (!editPreviewUrl || !editCroppedAreaPixels) {
          throw new Error('Please select and crop the image first');
        }

        const croppedFile = await getCroppedImageFile(
          editPreviewUrl,
          editCroppedAreaPixels,
          editSelectedFile.name,
          editSelectedFile.type || 'image/jpeg'
        );

        const formData = new FormData();
        formData.append('file', croppedFile);

        const uploadRes = await apiClient<{ imageUrl: string }>(
          `${API_BASE}/organizations/banners/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!uploadRes?.imageUrl) {
          throw new Error('Upload failed');
        }
        finalImageUrl = uploadRes.imageUrl;
      }

      const nextBanners = {
        ...banners,
        [editingType]: banners[editingType].map((b) =>
          b.id === editingBanner.id
            ? {
                ...b,
                imageUrl: finalImageUrl,
                title: editBannerTitle.trim() || undefined,
                description: editBannerDescription.trim() || undefined,
                link: editBannerLink.trim() || undefined,
              }
            : b
        ),
      };

      await apiClient(`${API_BASE}/organizations/banners`, {
        method: 'PUT',
        body: JSON.stringify(nextBanners),
      });

      setBanners(nextBanners);
      handleCloseEdit();
    } catch (err) {
      console.error('Error saving banner edit:', err);
      alert('Failed to save banner changes');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isVerified = user?.verificationStatus === 'VERIFIED';

  if (!isVerified) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-6 p-4 md:p-8 pt-6 h-[80vh]">
        <div className="bg-yellow-100 dark:bg-yellow-900/20 p-8 rounded-full border-2 border-yellow-500 shadow-xl">
          <AlertCircle className="h-16 w-16 text-yellow-600" />
        </div>
        <div className="text-center space-y-4 max-w-lg">
          <Badge variant="outline" className="px-4 py-1 text-yellow-600 border-yellow-500 bg-yellow-500/5">
            Verification Required
          </Badge>
          <h1 className="text-3xl font-bold">Verification Pending</h1>
          <p className="text-muted-foreground">
            Banners management is only available to fully verified organizations. Please wait for the admin team to approve your onboarding request.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] bg-clip-text text-transparent">
            Promotional Banners
          </h2>
          <p className="text-muted-foreground mt-1">
            Display high-quality promotional advertisements to clients visiting your profile details menu.
          </p>
        </div>
      </div>

      <Tabs defaultValue="horizontal" className="space-y-6">
        <div className="flex items-center justify-between border-b pb-1">
          <TabsList className="bg-[var(--card-bg-light)]">
            <TabsTrigger value="horizontal" className="px-6 py-2.5">Horizontal Banners</TabsTrigger>
            <TabsTrigger value="vertical" className="px-6 py-2.5">Vertical Banners</TabsTrigger>
          </TabsList>

          <TabsContent value="horizontal" className="mt-0">
            <Button onClick={() => handleOpenUpload('horizontal')} className="bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white hover:opacity-95">
              <Plus className="mr-2 h-4 w-4" /> Add Horizontal Banner
            </Button>
          </TabsContent>
          <TabsContent value="vertical" className="mt-0">
            <Button onClick={() => handleOpenUpload('vertical')} className="bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white hover:opacity-95">
              <Plus className="mr-2 h-4 w-4" /> Add Vertical Banner
            </Button>
          </TabsContent>
        </div>

        <TabsContent value="horizontal" className="space-y-6 outline-none">
          {banners.horizontal.length === 0 ? (
            <Card className="border-dashed flex flex-col items-center justify-center py-16 text-center">
              <ImageIcon className="h-16 w-16 text-muted-foreground opacity-30 mb-4" />
              <CardTitle className="text-lg">No Horizontal Banners</CardTitle>
              <CardDescription className="max-w-sm mt-1">
                Wide landscape banners are perfect for horizontal grids or carousel highlights at the top of your details page.
              </CardDescription>
              <Button onClick={() => handleOpenUpload('horizontal')} variant="outline" className="mt-6 border-[var(--primary-start)] text-[var(--primary-start)] hover:bg-[var(--primary-start)]/5">
                <Plus className="mr-2 h-4 w-4" /> Upload First Banner
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {banners.horizontal.map((banner) => (
                <Card key={banner.id} className="group overflow-hidden border bg-[var(--card-bg)] hover:shadow-lg transition-all duration-300">
                  <div className={`relative ${BANNER_ASPECT_CLASSES.horizontal} bg-muted overflow-hidden`}>
                    <img
                      src={banner.imageUrl}
                      alt={banner.title || 'Horizontal Banner'}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 flex items-center space-x-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => handleOpenEdit('horizontal', banner)}
                        className="h-8 w-8 shadow-md bg-white hover:bg-slate-100 text-slate-800"
                        type="button"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteBanner('horizontal', banner.id)}
                        className="h-8 w-8 shadow-md"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-base truncate">{banner.title || 'Untitled Banner'}</h3>
                    {banner.description && (
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{banner.description}</p>
                    )}
                    {banner.link ? (
                      <a
                        href={banner.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[var(--primary-start)] flex items-center mt-1.5 hover:underline truncate"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {banner.link}
                      </a>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1.5">No click-through link</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="vertical" className="space-y-6 outline-none">
          {banners.vertical.length === 0 ? (
            <Card className="border-dashed flex flex-col items-center justify-center py-16 text-center">
              <ImageIcon className="h-16 w-16 text-muted-foreground opacity-30 mb-4" />
              <CardTitle className="text-lg">No Vertical Banners</CardTitle>
              <CardDescription className="max-w-sm mt-1">
                Tall portrait banners are ideal for sidebars or vertical columns to highlight premium services or special experts.
              </CardDescription>
              <Button onClick={() => handleOpenUpload('vertical')} variant="outline" className="mt-6 border-[var(--primary-start)] text-[var(--primary-start)] hover:bg-[var(--primary-start)]/5">
                <Plus className="mr-2 h-4 w-4" /> Upload First Banner
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {banners.vertical.map((banner) => (
                <Card key={banner.id} className="group overflow-hidden border bg-[var(--card-bg)] hover:shadow-lg transition-all duration-300">
                  <div className={`relative ${BANNER_ASPECT_CLASSES.vertical} bg-muted overflow-hidden`}>
                    <img
                      src={banner.imageUrl}
                      alt={banner.title || 'Vertical Banner'}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 flex items-center space-x-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => handleOpenEdit('vertical', banner)}
                        className="h-8 w-8 shadow-md bg-white hover:bg-slate-100 text-slate-800"
                        type="button"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteBanner('vertical', banner.id)}
                        className="h-8 w-8 shadow-md"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-base truncate">{banner.title || 'Untitled Banner'}</h3>
                    {banner.description && (
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{banner.description}</p>
                    )}
                    {banner.link ? (
                      <a
                        href={banner.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[var(--primary-start)] flex items-center mt-1.5 hover:underline truncate"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {banner.link}
                      </a>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1.5">No click-through link</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Upload Banner Dialog */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs ">
          <Card className="w-full max-w-lg bg-[var(--card-bg)] border shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Upload {uploadType === 'horizontal' ? 'Horizontal' : 'Vertical'} Banner</CardTitle>
                <Button variant="ghost" size="icon" onClick={handleCloseUpload} className="h-8 w-8 rounded-full">
                  <span className="text-lg">×</span>
                </Button>
              </div>
            </CardHeader>

            <form onSubmit={handleUploadBanner}>
              <CardContent className="space-y-5 pt-5 overflow-auto max-h-[70vh]">
                <div className="space-y-2">
                  <Label>Select Banner File</Label>
                  <div
                    onClick={() => !previewUrl?fileInputRef.current?.click():null}
                    className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      previewUrl
                        ? 'border-[var(--primary-start)]/65 bg-[var(--primary-start)]/5'
                        : 'border-border hover:border-[var(--primary-start)] hover:bg-[var(--card-bg-light)]'
                    }`}
                  >
                    {previewUrl ? (
                      <>
                      <div className="w-full space-y-3">
                        <div className="relative w-full h-80 overflow-hidden rounded-md bg-black/10">
                          <Cropper
                            image={previewUrl}
                            crop={crop}
                            zoom={zoom}
                            aspect={BANNER_ASPECTS[uploadType]}
                            showGrid={false}
                            cropShape="rect"
                            onCropChange={setCrop}
                            onCropComplete={(_, area) => setCroppedAreaPixels(area)}
                            onZoomChange={setZoom}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Adjust crop and zoom before uploading</span>
                            <span>{uploadType === 'horizontal' ? '16:9' : '9:16'}</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.01"
                            value={zoom}
                            onChange={(event) => setZoom(Number(event.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>
                      
                        </>
                    ) : (
                      <>
                        <ImageIcon className="h-10 w-10 text-muted-foreground opacity-50 mb-2" />
                        <p className="text-sm font-medium">Click to select image file</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 10MB</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="banner-title">Banner Title (Optional)</Label>
                  <Input
                    id="banner-title"
                    placeholder="e.g. Special Holiday Discounts"
                    value={newBannerTitle}
                    onChange={(e) => setNewBannerTitle(e.target.value)}
                    className="bg-[var(--card-bg)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="banner-description">Banner Description (Optional)</Label>
                  <Input
                    id="banner-description"
                    placeholder="e.g. Get 20% off on all workspace bookings this month."
                    value={newBannerDescription}
                    onChange={(e) => setNewBannerDescription(e.target.value)}
                    className="bg-[var(--card-bg)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="banner-link">Click-through Destination Link (Optional)</Label>
                  <Input
                    id="banner-link"
                    type="url"
                    placeholder="e.g. https://yoursite.com/promotions"
                    value={newBannerLink}
                    onChange={(e) => setNewBannerLink(e.target.value)}
                    className="bg-[var(--card-bg)]"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Clients will be redirected to this URL when they click on the banner.
                  </p>
                </div>
              </CardContent>

              <div className="flex items-center justify-end space-x-3 p-6 border-t bg-[var(--card-bg-light)]">
                <Button type="button" variant="outline" onClick={handleCloseUpload} disabled={isUploading}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!selectedFile || !croppedAreaPixels || isUploading}
                  className="bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white hover:opacity-95 shadow-md flex items-center"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      Upload Banner <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Banner Dialog */}
      {isEditModalOpen && editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <Card className="w-full max-w-lg bg-[var(--card-bg)] border shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Edit {editingType === 'horizontal' ? 'Horizontal' : 'Vertical'} Banner</CardTitle>
                <Button variant="ghost" size="icon" onClick={handleCloseEdit} className="h-8 w-8 rounded-full">
                  <span className="text-lg">×</span>
                </Button>
              </div>
              <CardDescription>
                Modify details for this promotional banner.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSaveEdit}>
              <CardContent className="space-y-5 pt-5 overflow-auto max-h-[70vh]">
                <div className="space-y-2">
                  <Label>Banner Image</Label>
                  {editPreviewUrl.startsWith('blob:') ? (
                    <div className="border-2 border-dashed rounded-lg p-3 flex flex-col items-center justify-center border-[var(--primary-start)]/65 bg-[var(--primary-start)]/5">
                      <div className="w-full space-y-3">
                        <div className="relative w-full h-64 overflow-hidden rounded-md bg-black/10">
                          <Cropper
                            image={editPreviewUrl}
                            crop={editCrop}
                            zoom={editZoom}
                            aspect={BANNER_ASPECTS[editingType]}
                            showGrid={false}
                            cropShape="rect"
                            onCropChange={setEditCrop}
                            onCropComplete={(_, area) => setEditCroppedAreaPixels(area)}
                            onZoomChange={setEditZoom}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Adjust crop and zoom before saving</span>
                            <span>{editingType === 'horizontal' ? '16:9' : '9:16'}</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.01"
                            value={editZoom}
                            onChange={(event) => setEditZoom(Number(event.target.value))}
                            className="w-full"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs flex-1 flex items-center justify-center gap-1.5"
                            onClick={() => editFileInputRef.current?.click()}
                          >
                            <Upload className="h-3.5 w-3.5" /> Select Different Image
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => {
                              if (editPreviewUrl.startsWith('blob:')) {
                                URL.revokeObjectURL(editPreviewUrl);
                              }
                              setEditPreviewUrl(editingBanner.imageUrl);
                              setEditSelectedFile(null);
                              setEditCrop({ x: 0, y: 0 });
                              setEditZoom(1);
                              setEditCroppedAreaPixels(null);
                              if (editFileInputRef.current) {
                                editFileInputRef.current.value = '';
                              }
                            }}
                          >
                            Cancel Change
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => editFileInputRef.current?.click()}
                      className="border-2 border-dashed rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer transition-all border-[var(--primary-start)]/40 bg-[var(--primary-start)]/5 hover:bg-[var(--primary-start)]/10"
                    >
                      <div className="relative w-full overflow-hidden rounded-md flex justify-center bg-black/5">
                        <img
                          src={editPreviewUrl}
                          alt="Banner Preview"
                          className={`object-cover rounded-md max-h-48 ${
                            editingType === 'horizontal' ? 'aspect-[16/9] w-full' : 'aspect-[9/16] h-48'
                          }`}
                        />
                        <div className="absolute inset-0 bg-black/30 hover:bg-black/45 flex items-center justify-center transition-colors rounded-md">
                          <p className="text-white text-xs font-semibold flex items-center bg-black/55 px-3 py-1.5 rounded-md backdrop-blur-xs">
                            <Upload className="h-4 w-4 mr-1.5" /> Change Image
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleEditFileChange}
                    className="hidden"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-banner-title">Banner Title</Label>
                  <Input
                    id="edit-banner-title"
                    placeholder="e.g. Special Holiday Discounts"
                    value={editBannerTitle}
                    onChange={(e) => setEditBannerTitle(e.target.value)}
                    className="bg-[var(--card-bg)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-banner-description">Banner Description</Label>
                  <Input
                    id="edit-banner-description"
                    placeholder="e.g. Get 20% off on all workspace bookings this month."
                    value={editBannerDescription}
                    onChange={(e) => setEditBannerDescription(e.target.value)}
                    className="bg-[var(--card-bg)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-banner-link">Click-through Destination Link</Label>
                  <Input
                    id="edit-banner-link"
                    type="url"
                    placeholder="e.g. https://yoursite.com/promotions"
                    value={editBannerLink}
                    onChange={(e) => setEditBannerLink(e.target.value)}
                    className="bg-[var(--card-bg)]"
                  />
                </div>
              </CardContent>

              <div className="flex items-center justify-end space-x-3 p-6 border-t bg-[var(--card-bg-light)]">
                <Button type="button" variant="outline" onClick={handleCloseEdit}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white hover:opacity-95 shadow-md flex items-center"
                >
                  Save Changes <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
