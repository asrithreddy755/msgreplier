'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import GalleryPickerModal from '@/app/digital-greeting/components/GalleryPickerModal';
import TemplateCake from '@/app/digital-greeting/components/TemplateCake';
import TemplateAurora from '@/app/digital-greeting/components/TemplateAurora';
import TemplateClassic2D from '@/app/digital-greeting/components/TemplateClassic2D';
import { X, Heart } from 'lucide-react';

const OCCASIONS = [
  'Birthday',
  'Anniversary',
  'Love Greeting',
  'Apoloy',
  'Special Moments',
  'Flowers'
];

const editSchema = z.object({
  recipient_name: z.string().min(1, 'Recipient name is required'),
  sender_name: z.string().min(1, 'Sender name is required'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(500),
  occasion: z.string(),
  theme: z.string(),
  photo_url: z.string().optional().nullable(),
  birthday_date: z.string().optional().nullable(),
  fit_mode: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.occasion !== 'Anniversary' && (!data.birthday_date || data.birthday_date.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Date of birth is required',
      path: ['birthday_date'],
    });
  }
});

type EditForm = z.infer<typeof editSchema>;

type Greeting = {
  slug: string;
  recipient_name: string;
  sender_name: string;
  message: string;
  occasion: string;
  theme: string;
  relationship: string;
  photo_url?: string | null;
  birthday_date?: string | null;
  fit_mode?: string | null;
};

function IframeTemplate({ greeting, templateFolder }: { greeting: any; templateFolder: string }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const dummyDOB = `${today.getFullYear() - 22}-${month}-${day}`;

    const params = new URLSearchParams({
      recipient_name: greeting.recipient_name || "",
      sender_name: greeting.sender_name || "",
      message: greeting.message || "",
      occasion: greeting.occasion || "Birthday",
      music_id: greeting.music_id || "none",
      slug: greeting.slug || "",
      name: greeting.recipient_name || "",
      dob: greeting.dob || dummyDOB,
      photo_url: greeting.photo_url || "",
      preview: "true",
      fit_mode: greeting.fit_mode || "cover",
    });

    setSrc(`/templates/${templateFolder}/index.html?${params.toString()}`);
  }, [greeting, templateFolder]);

  if (!src) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-black">
        <Heart className="w-10 h-10 animate-pulse text-pink-500" />
      </div>
    );
  }

  return (
    <iframe
      src={src}
      className="w-full h-screen border-none overflow-hidden"
      style={{ display: "block", width: "100%", height: "100vh" }}
      allow="microphone; autoplay; clipboard-write"
    />
  );
}

export default function WishesEditClient({ greeting }: { greeting: Greeting }) {
  const router = useRouter();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<EditForm | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      recipient_name: greeting.recipient_name,
      sender_name: greeting.sender_name,
      message: greeting.message,
      occasion: greeting.occasion,
      theme: greeting.theme,
      photo_url: greeting.photo_url || '',
      birthday_date: greeting.birthday_date || '',
      fit_mode: greeting.fit_mode || 'cover',
    },
  });

  const occasion = watch('occasion');
  const theme = watch('theme');
  const message = watch('message');
  const photoUrlValue = watch('photo_url');
  const fitModeValue = watch('fit_mode') || 'cover';

  const [activePhotoSlot, setActivePhotoSlot] = useState<number | null>(null);

  const getPhotosArray = (photoUrlValue: string): { url: string; caption: string }[] => {
    const maxSlots = theme === "classic-2d" ? 6 : (theme === "aurora" ? 1 : 4);
    try {
      if (photoUrlValue && photoUrlValue.startsWith('[')) {
        const parsed = JSON.parse(photoUrlValue);
        if (Array.isArray(parsed)) {
          const result = [...parsed];
          while (result.length < maxSlots) {
            result.push({ url: '', caption: '' });
          }
          return result.slice(0, maxSlots);
        }
      }
    } catch (e) {
      console.error("Error parsing photo_url JSON", e);
    }
    const arr = Array.from({ length: maxSlots }, () => ({ url: '', caption: '' }));
    if (photoUrlValue && !photoUrlValue.startsWith('[')) {
      arr[0].url = photoUrlValue;
    }
    return arr;
  };

  const handleRemovePhoto = () => {
    setValue('photo_url', '', { shouldDirty: true });
    toast.success('Photo removed');
  };

  const handleRemovePhotoAtIndex = (index: number) => {
    const photos = getPhotosArray(photoUrlValue || '');
    photos[index] = { url: '', caption: '' };
    const allEmpty = photos.every(p => !p.url);
    setValue('photo_url', allEmpty ? "" : JSON.stringify(photos), { shouldDirty: true });
    toast.success(`Photo ${index + 1} removed`);
  };

  const handleCaptionChange = (index: number, caption: string) => {
    const photos = getPhotosArray(photoUrlValue || '');
    photos[index].caption = caption;
    setValue('photo_url', JSON.stringify(photos), { shouldDirty: true });
  };

  const onPreviewSubmit = (data: EditForm) => {
    setPreviewData(data);
    setPreviewTemplate(data.theme);
  };

  const onDirectSubmit = async (data: EditForm) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/digital-greeting/update/${greeting.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        setSaveError(json.error ?? 'Failed to save changes. Please try again.');
        return;
      }

      toast.success('Wish updated successfully! ✨');
      router.push('/wishes/dashboard');
      router.refresh();
    } catch {
      setSaveError('Network error. Please check your connection and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const onInvalidSubmit = () => {
    toast.error("Please fill all the remaining boxes: Recipient Name, Date of Birth, Message, and Your Name.");
  };

  const handleSave = async () => {
    if (!previewData) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/digital-greeting/update/${greeting.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(previewData),
      });

      if (!res.ok) {
        const json = await res.json();
        setSaveError(json.error ?? 'Failed to save changes. Please try again.');
        setPreviewTemplate(null);
        return;
      }

      toast.success('Wish updated successfully! ✨');
      setPreviewTemplate(null);
      router.push('/wishes/dashboard');
      router.refresh();
    } catch {
      setSaveError('Network error. Please check your connection and try again.');
      setPreviewTemplate(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="wishes-edit-page">
      <div className="wishes-edit-container">
        {/* Back link */}
        <Link href="/wishes/dashboard" className="wishes-edit-back">
          ← Back to Dashboard
        </Link>

        <div className="wishes-auth-header">
          <div className="wishes-auth-logo">✏️</div>
          <h1 className="wishes-auth-title">Edit Wish</h1>
          <p className="wishes-auth-subtitle">
            Editing the wish for <strong>{greeting.recipient_name}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit(onPreviewSubmit, onInvalidSubmit)} className="wishes-auth-form" noValidate>
          {saveError && (
            <div className="wishes-auth-error" role="alert">
              <span className="wishes-auth-error-icon">⚠️</span>
              {saveError}
            </div>
          )}

          <div className="wishes-field">
            <label htmlFor="edit-recipient" className="wishes-label">Recipient&apos;s Name</label>
            <input
              id="edit-recipient"
              type="text"
              className={`wishes-input ${errors.recipient_name ? 'wishes-input-error' : ''}`}
              {...register('recipient_name')}
            />
            {errors.recipient_name && (
              <p className="wishes-field-error">{errors.recipient_name.message}</p>
            )}
          </div>

          {occasion !== 'Anniversary' && (
            <div className="wishes-field">
              <label htmlFor="edit-birthday-date" className="wishes-label">Date of Birth</label>
              <input
                id="edit-birthday-date"
                type="date"
                className={`wishes-input ${errors.birthday_date ? 'wishes-input-error' : ''}`}
                {...register('birthday_date')}
              />
              {errors.birthday_date && (
                <p className="wishes-field-error">{errors.birthday_date.message}</p>
              )}
            </div>
          )}

          <div className="wishes-field">
            <label htmlFor="edit-sender" className="wishes-label">Your Name (Sender)</label>
            <input
              id="edit-sender"
              type="text"
              className={`wishes-input ${errors.sender_name ? 'wishes-input-error' : ''}`}
              {...register('sender_name')}
            />
            {errors.sender_name && (
              <p className="wishes-field-error">{errors.sender_name.message}</p>
            )}
          </div>

          <div className="wishes-field">
            <label className="wishes-label">Occasion</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {OCCASIONS.map((occ) => (
                <button
                  key={occ}
                  type="button"
                  onClick={() => setValue('occasion', occ, { shouldDirty: true })}
                  className={`wishes-option-btn ${occasion === occ ? 'wishes-option-btn-active' : ''}`}
                >
                  {occ === 'Birthday' ? '🎂 Birthday' : 
                   occ === 'Anniversary' ? '💍 Anniversary' :
                   occ === 'Love Greeting' ? '💖 Love Greeting' :
                   occ === 'Apoloy' ? '🥺 Apoloy' :
                   occ === 'Special Moments' ? '✨ Special Moments' :
                   '💐 Flowers'}
                </button>
              ))}
            </div>
          </div>

          <div className="wishes-field">
            <label htmlFor="edit-message" className="wishes-label">
              Message
              <span style={{ float: 'right', fontWeight: 400, color: message.length > 450 ? '#f43f5e' : '#94a3b8' }}>
                {message.length}/500
              </span>
            </label>
            <textarea
              id="edit-message"
              rows={6}
              maxLength={500}
              className={`wishes-input wishes-textarea ${errors.message ? 'wishes-input-error' : ''}`}
              {...register('message')}
            />
            {errors.message && (
              <p className="wishes-field-error">{errors.message.message}</p>
            )}
          </div>

          <div className="wishes-field" style={{ marginTop: '1.5rem' }}>
            <label className="wishes-label">
              Photo
              <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: '11px', marginLeft: '4px' }}>
                {['wishes3', 'wishes5', 'wishes6', 'wishes7', 'wishes8', 'wishes10', 'wishes11'].includes(theme) ? ' (recommended)' : ' (optional)'}
              </span>
            </label>
            {['hearts', 'classic-2d', 'aurora', 'wishes3', 'wishes5', 'wishes6', 'wishes7', 'wishes8', 'wishes10', 'wishes11'].includes(theme) ? (
              /* Render multiple slots for Cake Surprise, Classic 2D, Cham 3D or Zodiac templates */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
                {getPhotosArray(photoUrlValue || '').map((photo, index) => (
                  <div
                    key={index}
                    style={{
                      border: '1px solid #ffe4e6',
                      borderRadius: '16px',
                      padding: '1rem',
                      backgroundColor: '#fffdfd',
                      boxShadow: '0 4px 12px rgba(251,113,133,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#be123c' }}>
                        📸 Memory Slot {index + 1}
                      </span>
                      {photo.url && (
                        <button
                          type="button"
                          onClick={() => handleRemovePhotoAtIndex(index)}
                          style={{
                            fontSize: '11px',
                            fontWeight: 'bold',
                            color: '#e11d48',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      {photo.url ? (
                        <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #fecdd3', flexShrink: 0 }}>
                          <img src={photo.url} alt={`Slot ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setActivePhotoSlot(index);
                            setIsGalleryOpen(true);
                          }}
                          style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '12px',
                            border: '1px dashed #fda4af',
                            backgroundColor: '#fff5f5',
                            color: '#be123c',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '2px',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        >
                          <span style={{ fontSize: '18px' }}>+</span>
                          <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Upload</span>
                        </button>
                      )}

                      <div style={{ flex: 1 }}>
                        <textarea
                          placeholder="Write a message to display below this memory (optional)..."
                          value={photo.caption}
                          onChange={(e) => handleCaptionChange(index, e.target.value)}
                          rows={2}
                          style={{
                            width: '100%',
                            fontSize: '12px',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #fecdd3',
                            outline: 'none',
                            resize: 'none',
                            backgroundColor: '#fff'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Legacy single photo upload */
              <div style={{
                border: '1px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '16px',
                backgroundColor: 'rgba(248, 250, 252, 0.5)',
                marginTop: '0.5rem'
              }}>
                {photoUrlValue ? (
                  <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <img
                      src={photoUrlValue}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 0', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setActivePhotoSlot(null);
                        setIsGalleryOpen(true);
                      }}
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'none',
                        border: 'none'
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>📸</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#ec4899', textDecoration: 'underline' }}>Choose or upload a photo</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Select from gallery or upload new</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Photo Fit Mode Toggle */}
          {photoUrlValue && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.5)',
              border: '1px solid rgba(120, 85, 94, 0.1)',
              padding: '0.75rem 1rem',
              borderRadius: '14px',
              marginTop: '1rem',
              marginBottom: '1rem',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#78555e' }}>Photo Fit Mode</span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {fitModeValue === 'cover' ? 'Photos cropped to fill the template frame' : 'Full photo visible (may have letterbox bars)'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setValue('fit_mode', fitModeValue === 'cover' ? 'contain' : 'cover', { shouldDirty: true })}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                {/* Track */}
                <span style={{
                  display: 'inline-block',
                  width: '44px',
                  height: '24px',
                  borderRadius: '50px',
                  background: fitModeValue === 'cover' ? 'linear-gradient(135deg,#be123c,#e11d48)' : 'rgba(0,0,0,0.12)',
                  position: 'relative',
                  transition: 'background 0.3s',
                  border: fitModeValue === 'cover' ? '1.5px solid #be123c' : '1.5px solid rgba(0,0,0,0.1)',
                }}>
                  {/* Thumb */}
                  <span style={{
                    position: 'absolute',
                    top: '3px',
                    left: fitModeValue === 'cover' ? '22px' : '3px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: '#fff',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                    transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)',
                  }} />
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: fitModeValue === 'cover' ? '#be123c' : '#94a3b8',
                  minWidth: '22px',
                  letterSpacing: '0.04em',
                }}>
                  {fitModeValue === 'cover' ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          )}

          <div className="wishes-edit-actions">
            <Link href="/wishes/dashboard" className="wishes-btn-cancel">
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSubmit(onPreviewSubmit, onInvalidSubmit)}
              className="wishes-btn-secondary"
              style={{
                flex: 1,
                padding: '0.65rem 0.85rem',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '8px',
                border: '1.5px solid #ec4899',
                color: '#ec4899',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              👁️ Preview
            </button>
            <button
              id="edit-save"
              type="button"
              onClick={handleSubmit(onDirectSubmit, onInvalidSubmit)}
              disabled={isSubmitting || isSaving}
              className="wishes-btn-primary"
              style={{ flex: 2 }}
            >
              {isSubmitting || isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
      <GalleryPickerModal
        isOpen={isGalleryOpen}
        onClose={() => {
          setIsGalleryOpen(false);
          setActivePhotoSlot(null);
        }}
        onSelect={(url) => {
          if ((theme === 'hearts' || theme === 'classic-2d' || theme === 'aurora' || theme === 'wishes5' || theme === 'wishes3' || theme === 'wishes6' || theme === 'wishes7' || theme === 'wishes8' || theme === 'wishes10' || theme === 'wishes11') && activePhotoSlot !== null) {
            const photos = getPhotosArray(photoUrlValue || '');
            photos[activePhotoSlot].url = url;
            setValue('photo_url', JSON.stringify(photos), { shouldDirty: true });
          } else {
            setValue('photo_url', url, { shouldDirty: true });
          }
          setActivePhotoSlot(null);
        }}
      />

      {/* ── Template Preview Overlay ──────────────────────── */}
      {previewTemplate && previewData && (
        <div
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black bg-opacity-95"
        >
          <div className="fixed top-6 left-6 right-6 z-[10000] flex justify-between items-center pointer-events-none">
            <button
              type="button"
              onClick={() => setPreviewTemplate(null)}
              className="pointer-events-auto"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.5rem",
                borderRadius: "999px",
                background: "rgba(0,0,0,0.8)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              <X size={18} /> Close Preview
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="pointer-events-auto"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.5rem",
                borderRadius: "999px",
                background: "#ec4899", // pink-500
                color: "#fff",
                border: "none",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: "0 8px 32px rgba(236,72,153,0.4)",
              }}
            >
              {isSaving ? "Saving changes..." : "✨ Confirm & Save Changes"}
            </button>
          </div>
          <div className="min-h-screen w-full relative z-10">
            {previewTemplate === "hearts" ? (
               <TemplateCake
                 greeting={{
                   recipient_name: previewData.recipient_name || "Sarah",
                   sender_name: previewData.sender_name || "Michael",
                   message:
                     previewData.message ||
                     "This is a preview of your beautiful wish! It contains all the love and happiness in the world.",
                   occasion: previewData.occasion || "Birthday",
                   music_id: "none",
                   photo_url: previewData.photo_url || undefined,
                   birthday_date: previewData.birthday_date || undefined,
                 }}
                 photoFitMode={previewData.fit_mode === "cover"}
                 isPreview={true}
               />
             ) : previewTemplate === "classic-2d" ? (
               <TemplateClassic2D
                 greeting={{
                   recipient_name: previewData.recipient_name || "Sarah",
                   sender_name: previewData.sender_name || "Michael",
                   message:
                     previewData.message ||
                     "This is a preview of your beautiful wish! It contains all the love and happiness in the world.",
                   occasion: previewData.occasion || "Birthday",
                   photo_url: previewData.photo_url || undefined,
                   birthday_date: previewData.birthday_date || undefined,
                 }}
                 photoFitMode={previewData.fit_mode === "cover"}
                 isPreview={true}
               />
             ) : previewTemplate === "aurora" ? (
               <TemplateAurora
                 greeting={{
                   recipient_name: previewData.recipient_name || "Sarah",
                   sender_name: previewData.sender_name || "Michael",
                   message:
                     previewData.message ||
                     "This is a preview of your beautiful wish! It contains all the love and happiness in the world.",
                   occasion: previewData.occasion || "Birthday",
                   photo_url: previewData.photo_url || undefined,
                   birthday_date: previewData.birthday_date || undefined,
                 }}
                 photoFitMode={previewData.fit_mode === "cover"}
                 isPreview={true}
               />
             ) : (
               <IframeTemplate
                 greeting={{
                   recipient_name: previewData.recipient_name || "Sarah",
                   sender_name: previewData.sender_name || "Michael",
                   message:
                     previewData.message ||
                     "This is a preview of your beautiful wish! It contains all the love and happiness in the world.",
                   occasion: previewData.occasion || "Birthday",
                   music_id: "none",
                   dob: previewData.birthday_date || "",
                   photo_url: previewData.photo_url || undefined,
                   fit_mode: previewData.fit_mode || "cover",
                 }}
                 templateFolder={`template_${previewTemplate}`}
               />
             )}
          </div>
        </div>
      )}
    </div>
  );
}
