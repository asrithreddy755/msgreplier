'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { compressImage, uploadCompressedImage } from '@/lib/upload';
import { toast } from 'sonner';
import { UploadCloud, ImageIcon, Loader2, Check, X } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
};

type GalleryImage = {
  id: string;
  image_url: string;
  created_at: string;
};

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const PLAN_LIMITS = {
  free: { size: 2 * 1024 * 1024, count: 6, sizeLabel: '2MB' },
  starter: { size: 3 * 1024 * 1024 * 1024, count: 15, sizeLabel: '3GB' },
  creator: { size: 5 * 1024 * 1024 * 1024, count: 40, sizeLabel: '5GB' },
};

const getPlanLimits = (plan: string | undefined) => {
  const normalizedPlan = (plan || 'free').toLowerCase();
  if (normalizedPlan === 'creator') return PLAN_LIMITS.creator;
  if (normalizedPlan === 'starter') return PLAN_LIMITS.starter;
  return PLAN_LIMITS.free;
};

export default function GalleryPickerModal({ isOpen, onClose, onSelect }: Props) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Plan limits states
  const [plan, setPlan] = useState<string>('free');
  const [credits, setCredits] = useState<number>(0);
  const [limitError, setLimitError] = useState<{ title: string; message: string } | null>(null);

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);

  // Optimization & Upload states
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user gallery on mount/open
  useEffect(() => {
    if (!isOpen) {
      // Clear pending upload state when closed
      resetUploadState();
      return;
    }

    const fetchGalleryAndPlan = async () => {
      setLoading(true);
      try {
        const supabase = createSupabaseBrowserClient();
        
        // Fetch user and profile plan + credits
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('plan, credits')
            .eq('id', user.id)
            .single();
          if (profile) {
            setPlan(profile.plan || 'free');
            setCredits(typeof profile.credits === 'number' ? profile.credits : 0);
          }
        }

        const { data, error } = await supabase
          .from('user_gallery')
          .select('id, image_url, created_at')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[GalleryPicker] Error fetching:', error.message);
          toast.error('Failed to load gallery images');
        } else {
          setImages(data ?? []);
        }
      } catch (err) {
        console.error('[GalleryPicker] Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryAndPlan();
  }, [isOpen]);

  const resetUploadState = () => {
    setPendingFile(null);
    setCompressedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (originalUrl) {
      URL.revokeObjectURL(originalUrl);
      setOriginalUrl(null);
    }
    setCompressing(false);
    setUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadClick = () => {
    if (credits <= 0) {
      setLimitError({
        title: "No credits remaining",
        message: "You have 0 credits remaining. Please buy more credits to upload images."
      });
      return;
    }
    const limits = getPlanLimits(plan);
    if (images.length >= limits.count) {
      setLimitError({
        title: "Gallery limit reached",
        message: `Your gallery has reached the limit of ${limits.count} images for your ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan. Please delete some images from your dashboard gallery first or upgrade your plan.`
      });
      return;
    }
    fileInputRef.current?.click();
  };

  // Centralized file processing (compress in browser)
  const processImageFile = async (file: File) => {
    // 1. Reject non-image files
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type. Please select an image file (JPEG, PNG, WebP).');
      return;
    }

    if (credits <= 0) {
      toast.error('You have 0 credits remaining. Please purchase more credits.');
      return;
    }

    const limits = getPlanLimits(plan);

    if (images.length >= limits.count) {
      setLimitError({
        title: `Gallery Limit Reached (${images.length}/${limits.count} images used)`,
        message: `Your ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan allows up to ${limits.count} images in your gallery. Please delete some images from your dashboard gallery first or upgrade your plan.`
      });
      return;
    }

    if (file.size > limits.size) {
      setLimitError({
        title: `File Size Limit Exceeded (Max ${limits.sizeLabel})`,
        message: `Your file size is ${formatBytes(file.size)}. Under the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan, the maximum allowed size is ${limits.sizeLabel}. Please select a smaller file or upgrade your plan.`
      });
      return;
    }

    setPendingFile(file);
    setCompressing(true);

    try {
      // 2. Compress client-side via Web Workers
      const compressed = await compressImage(file);
      setCompressedFile(compressed);
      
      // 3. Generate preview URLs
      const url = URL.createObjectURL(compressed);
      setPreviewUrl(url);
      const origUrl = URL.createObjectURL(file);
      setOriginalUrl(origUrl);
    } catch (err: any) {
      console.error('[GalleryPicker] Compression failed:', err);
      toast.error(err.message || 'Failed to compress image.');
      setPendingFile(null);
    } finally {
      setCompressing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const limits = getPlanLimits(plan);
    if (!uploading && !compressing && images.length < limits.count) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (uploading || compressing) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Perform upload to Cloudflare R2
  const handleConfirmUpload = async () => {
    if (!compressedFile) return;

    if (credits <= 0) {
      toast.error('You have 0 credits remaining. Please buy more credits.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // 1. Upload to Cloudflare R2 via presigned URL with progress
      const publicUrl = await uploadCompressedImage(compressedFile, (progress) => {
        setUploadProgress(progress);
      });

      // 2. Insert into Supabase user_gallery
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to save photos.');
        return;
      }

      const { data, error } = await supabase
        .from('user_gallery')
        .insert([{ user_id: user.id, image_url: publicUrl }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // 2b. Deduct credit
      const { error: creditError } = await supabase
        .from('profiles')
        .update({ credits: Math.max(0, credits - 1) })
        .eq('id', user.id);

      if (creditError) {
        console.error('Error deducting credit:', creditError.message);
      }

      setCredits((prev) => Math.max(0, prev - 1));

      // 3. Success and select it
      setImages((prev) => [data, ...prev]);
      toast.success('Optimized image uploaded and added to gallery! 📸 (1 Credit Used)');
      onSelect(publicUrl);
      onClose();
    } catch (error: any) {
      console.error('[GalleryPicker] Upload failed:', error);
      toast.error(error.message || 'Failed to upload optimized image.');
    } finally {
      setUploading(false);
    }
  };

  const limits = getPlanLimits(plan);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && !uploading && onClose()}>
        <DialogContent 
          aria-describedby={undefined}
          className="max-w-xl w-[95%] max-h-[85vh] flex flex-col p-6 rounded-[24px] bg-white border border-[#d4c3ab] shadow-2xl overflow-hidden transition-all duration-200"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Style block to ensure Work Sans and Unbounded fonts apply to headings */}
          <style dangerouslySetInnerHTML={{ __html: `
            h1, h2, h3, h4, h5, h6, .font-heading {
              font-family: 'Unbounded', sans-serif !important;
            }
          `}} />

          <DialogHeader className={compressing ? "sr-only" : "pb-2"}>
            <DialogTitle className="text-xl font-bold text-[#110f0f] flex items-center gap-2 font-heading">
              {compressing 
                ? "Optimizing Image" 
                : pendingFile && compressedFile 
                  ? "✨ Preview Optimized Image" 
                  : `🖼️ Select from Gallery (${images.length}/${limits.count})`}
            </DialogTitle>
          </DialogHeader>
          {/* Drag & Drop Visual Backdrop Overlay */}
          {isDragging && (
            <div className="absolute inset-0 z-50 bg-[#f5eedf]/95 border-3 border-dashed border-[#110f0f] backdrop-blur-[2px] flex flex-col items-center justify-center pointer-events-none animate-fade-in">
              <UploadCloud className="w-16 h-16 text-[#110f0f] animate-bounce" />
              <h3 className="text-lg font-bold text-[#110f0f] mt-2 font-heading">Drop your image here</h3>
              <p className="text-xs text-[#5d6c7b] mt-1 font-semibold">Convert automatically to WebP</p>
            </div>
          )}

          {/* Compression Loading View */}
          {compressing && (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 text-[#5d6c7b]">
              <Loader2 className="w-10 h-10 animate-spin text-[#110f0f]" />
              <p className="text-sm font-bold text-[#110f0f] animate-pulse">Optimizing image in browser...</p>
              <p className="text-xs text-[#948678] max-w-[280px] text-center">
                Resizing to 1920px, converting to WebP using Web Workers for smooth performance.
              </p>
            </div>
          )}

          {/* Normal Gallery List View */}
          {!pendingFile && !compressing && (
            <>
              {/* Scrollable Gallery Content */}
              <div className="flex-1 overflow-y-auto min-h-[220px] max-h-[50vh] pr-1 py-2">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-[#110f0f]" />
                    <p className="text-sm font-semibold">Loading gallery images...</p>
                  </div>
                ) : images.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                    <ImageIcon className="w-12 h-12 text-slate-300" />
                    <p className="text-sm font-bold text-[#110f0f]">Your gallery is empty</p>
                    <p className="text-xs text-[#5d6c7b] max-w-[240px] text-center leading-relaxed">
                      Drag & drop an image here or click below to optimize and upload your first photo.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((img) => (
                      <div
                        key={img.id}
                        onClick={() => {
                          onSelect(img.image_url);
                          onClose();
                        }}
                        className="group relative aspect-square bg-[#eedfc6]/10 rounded-xl overflow-hidden border border-[#d4c3ab] hover:border-[#110f0f] hover:shadow-md cursor-pointer transition-all"
                      >
                        <img
                          src={img.image_url}
                          alt="Gallery item"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[10px] text-white font-bold px-2.5 py-1 bg-[#110f0f] rounded-full uppercase tracking-wider font-heading">
                            Select
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center gap-2">
                <span className="text-[10px] text-[#5d6c7b] font-semibold">💡 Drag & drop images here to upload!</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-bold text-[#110f0f] hover:bg-slate-50 rounded-xl transition-colors h-10 border border-[#d4c3ab]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    disabled={images.length >= limits.count}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#110f0f] hover:bg-[#2b95ff] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md font-heading"
                  >
                    <UploadCloud className="w-4 h-4" /> Upload New Photo
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Preview & Confirm Optimization View */}
          {pendingFile && compressedFile && !compressing && (
            <>
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 py-2 min-h-[300px]">
                {/* Image Preview Container (Side-by-Side Comparison) */}
                <div className="grid grid-cols-2 gap-3 max-h-[32vh] flex-1">
                  {/* Original Image Preview */}
                  <div className="relative aspect-video bg-[#110f0f] rounded-xl overflow-hidden border border-[#d4c3ab] flex items-center justify-center">
                    {originalUrl && (
                      <img
                        src={originalUrl}
                        alt="Original preview"
                        className="w-full h-full object-contain"
                      />
                    )}
                    <span className="absolute top-2 left-2 text-[9px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full uppercase">
                      Original
                    </span>
                  </div>

                  {/* Optimized WebP Preview */}
                  <div className="relative aspect-video bg-[#110f0f] rounded-xl overflow-hidden border border-[#d4c3ab] flex items-center justify-center">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Optimized preview"
                        className="w-full h-full object-contain"
                      />
                    )}
                    <span className="absolute top-2 left-2 text-[9px] font-bold text-white bg-[#eedfc6] text-[#110f0f] px-2 py-0.5 rounded-full uppercase">
                      Optimized WebP
                    </span>
                  </div>
                </div>

                {/* Optimization Statistics */}
                <div className="grid grid-cols-3 gap-2 text-center bg-[#eedfc6]/20 border border-[#d4c3ab] rounded-xl p-3">
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Original Size</p>
                    <p className="text-sm font-semibold text-[#110f0f]">{formatBytes(pendingFile.size)}</p>
                  </div>
                  <div className="space-y-0.5 border-x border-[#d4c3ab]/60">
                    <p className="text-[10px] uppercase font-bold text-[#110f0f]">Optimized Size</p>
                    <p className="text-sm font-bold text-[#110f0f]">{formatBytes(compressedFile.size)}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Space Saved</p>
                    <p className="text-sm font-bold text-green-600">
                      {Math.max(0, Math.round(((pendingFile.size - compressedFile.size) / pendingFile.size) * 100))}%
                    </p>
                  </div>
                </div>

                <p className="text-center text-xs text-[#5d6c7b] font-medium">
                  ℹ️ Image is converted to WebP for better loading in the website
                </p>

                {/* Credit Notice */}
                <div className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                  💡 Uploading this image will consume 1 credit. (Remaining credits: {credits})
                </div>

                {/* Upload Progress Indicator */}
                {uploading && (
                  <div className="bg-[#eedfc6]/10 border border-[#d4c3ab] rounded-xl p-4 space-y-2 text-center">
                    <div className="text-xs font-bold text-[#110f0f] animate-pulse">
                      Uploading WebP image to R2 storage ({uploadProgress}%) · Uses 1 credit
                    </div>
                    <Progress value={uploadProgress} className="h-1.5 bg-slate-100" />
                  </div>
                )}
              </div>

              {/* Preview Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetUploadState}
                  disabled={uploading}
                  className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-[#110f0f] hover:bg-slate-50 rounded-xl transition-colors h-10 border border-[#d4c3ab]"
                >
                  <X className="w-3.5 h-3.5" /> Discard
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUpload}
                  disabled={uploading}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#110f0f] hover:bg-[#2b95ff] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md h-10 font-heading"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Confirm & Upload
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dynamic Limit Upgrade Modal */}
      <Dialog open={!!limitError} onOpenChange={(open) => !open && setLimitError(null)}>
        <DialogContent
          aria-describedby={undefined}
          className="max-w-md p-6 rounded-[24px] bg-white border border-[#d4c3ab] shadow-2xl"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-heading text-[#110f0f] flex items-center gap-2">
              🔒 Paid Plan Required
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm font-semibold text-[#110f0f]">
              {limitError?.title}
            </p>
            <p className="text-xs text-[#5d6c7b] leading-relaxed">
              {limitError?.message}
            </p>
            <div className="bg-[#eedfc6]/20 border border-[#d4c3ab] rounded-[16px] p-4 space-y-2">
              <p className="text-[11px] font-bold text-[#110f0f] uppercase font-heading tracking-wider">Plan Limits & Features:</p>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-semibold text-[#110f0f] pt-1">
                <div className="p-2 bg-white rounded-xl border border-[#d4c3ab]">
                  <p className="font-bold font-heading">Free</p>
                  <p className="text-[#5d6c7b] mt-1">12 Websites</p>
                  <p className="text-[#5d6c7b]">2MB size</p>
                  <p className="text-[#5d6c7b]">6 Images</p>
                </div>
                <div className="p-2 bg-white rounded-xl border border-[#d4c3ab] relative">
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-[7px] px-1.5 rounded-full font-bold">POPULAR</span>
                  <p className="font-bold font-heading">Starter</p>
                  <p className="text-[#110f0f] mt-1 font-bold">25 Websites</p>
                  <p className="text-[#110f0f] font-bold">3GB size</p>
                  <p className="text-[#110f0f] font-bold">15 Images</p>
                </div>
                <div className="p-2 bg-[#110f0f] text-white rounded-xl">
                  <p className="font-bold font-heading text-[#eedfc6]">Creator</p>
                  <p className="text-white/80 mt-1">100 Websites</p>
                  <p className="text-white/80">5GB size</p>
                  <p className="text-white/80">40 Images</p>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-[#d4c3ab] flex justify-end gap-2">
            <button
              onClick={() => setLimitError(null)}
              className="px-4 py-2.5 text-xs font-bold text-[#110f0f] hover:bg-slate-50 rounded-xl transition-colors border border-[#d4c3ab]"
            >
              Close
            </button>
            <Link
              href="/digital-greeting/pricing"
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#110f0f] hover:bg-[#2b95ff] rounded-xl transition-all shadow-md font-heading"
            >
              Upgrade Plan
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
