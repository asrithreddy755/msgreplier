'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/lib/auth/actions'
import { toast } from 'sonner'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { compressImage, uploadCompressedImage } from '@/lib/upload'
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Loader2,
  Check,
  X,
  Heart,
  Plus,
  Sparkles,
  Copy,
  Eye,
  Edit3,
  LogOut,
  Crown,
  Menu,
  MessageCircle,
} from 'lucide-react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

type Greeting = {
  id: string
  slug: string
  recipient_name: string
  sender_name: string
  occasion: string
  theme: string
  created_at: string
  expires_at: string
}

type GalleryImage = {
  id: string
  image_url: string
  created_at: string
}

type Props = {
  user: { email: string; id: string; plan?: string; credits?: number }
  greetings: Greeting[]
}

const THEME_ICONS: Record<string, string> = {
  'classic-2d': '🎈',
  aurora: '✨',
  hearts: '🎂',
  wishes3: '🎁',
  wishes4: '✉️',
  wishes5: '🌟',
  wishes6: '🧸',
  wishes7: '🎁',
  wishes8: '🚪',
  wishes9: '🥺',
  wishes10: '🌸',
  wishes11: '🌌',
  wishes12: '🎈',
  wishes13: '💖',
  wishes14: '🧸',
  wishes15: '✉️',
  wishes16: '🌹',
  propose_crush1: '💖',
  apology_1: '🥺',
}

const THEME_LABELS: Record<string, string> = {
  'classic-2d': 'Classic 2D',
  aurora: 'Cham 3D',
  hearts: 'Cake Surprise',
  wishes3: 'Slider Surprise',
  wishes4: 'Love Letter Box',
  wishes5: 'Zodiac Celebration',
  wishes6: 'Sweet Scratch',
  wishes7: 'Birthday Surprise',
  wishes8: 'Curtain Surprise',
  wishes9: 'Sweet Apology',
  wishes10: 'Retro Windows',
  wishes11: 'Matrix Neon',
  wishes12: 'Birthday Heart',
  wishes13: 'Do You Love Me',
  wishes14: 'Special for You',
  wishes15: 'Valentine Letter',
  wishes16: 'Valentine Letter Card',
  propose_crush1: 'Crush Proposal',
  apology_1: 'Interactive Apology',
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function isExpired(dateStr: string) {
  return new Date(dateStr) < new Date()
}

const PLAN_LIMITS = {
  free: { size: 2 * 1024 * 1024, count: 6, sizeLabel: '2MB', websiteLimit: 12 },
  starter: { size: 5 * 1024 * 1024, count: 15, sizeLabel: '5MB', websiteLimit: 25 },
  creator: { size: 15 * 1024 * 1024, count: 40, sizeLabel: '15MB', websiteLimit: 100 },
};

const getPlanLimits = (plan: string | undefined) => {
  const normalizedPlan = (plan || 'free').toLowerCase();
  if (normalizedPlan === 'creator') return PLAN_LIMITS.creator;
  if (normalizedPlan === 'starter') return PLAN_LIMITS.starter;
  return PLAN_LIMITS.free;
};

export default function WishesDashboardClient({ user, greetings }: Props) {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [creditsState, setCreditsState] = useState<number>(user.credits ?? 0)

  // Limit modal state
  const [limitError, setLimitError] = useState<{ title: string; message: string } | null>(null)

  // Gallery states
  const [activeTab, setActiveTab] = useState<'wishes' | 'gallery' | 'plan'>('wishes')
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Preview / Optimization states
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [compressedFile, setCompressedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [compressing, setCompressing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const username = user.email.split('@')[0]

  useEffect(() => {
    // Reset state when changing tabs
    resetUploadState()
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== 'gallery') return

    const fetchGallery = async () => {
      setGalleryLoading(true)
      try {
        const supabase = createSupabaseBrowserClient()
        const { data, error } = await supabase
          .from('user_gallery')
          .select('id, image_url, created_at')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('[Dashboard Gallery] Fetch error:', error.message)
          toast.error('Failed to load gallery images')
        } else {
          setGalleryImages(data ?? [])
        }
      } catch (err) {
        console.error('[Dashboard Gallery] Unexpected error:', err)
      } finally {
        setGalleryLoading(false)
      }
    }

    fetchGallery()
  }, [activeTab])

  const resetUploadState = () => {
    setPendingFile(null)
    setCompressedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (originalUrl) {
      URL.revokeObjectURL(originalUrl)
      setOriginalUrl(null)
    }
    setCompressing(false)
    setUploading(false)
    setUploadProgress(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut()
    router.push('/wishes/login')
    router.refresh()
  }

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/greet/${slug}`
    navigator.clipboard.writeText(url)
    setCopiedSlug(slug)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  const handleDeleteImage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase
        .from('user_gallery')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      setGalleryImages((prev) => prev.filter((img) => img.id !== id))
      toast.success('Image deleted successfully')
    } catch (err: any) {
      console.error('[Gallery Delete] Error:', err)
      toast.error(err.message || 'Failed to delete image')
    }
  }

  // Centralized file processing (compress in browser)
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type. Please select an image file (JPEG, PNG, WebP).')
      return
    }

    if (creditsState <= 0) {
      toast.error('You have 0 credits remaining. Please purchase more credits to upload images.')
      return
    }

    const plan = user.plan || 'free';
    const limits = getPlanLimits(plan);

    if (galleryImages.length >= limits.count) {
      setLimitError({
        title: `Gallery Limit Reached (${galleryImages.length}/${limits.count} images used)`,
        message: `Your ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan allows up to ${limits.count} images in your gallery. Please delete some images or upgrade your plan.`
      });
      return
    }

    if (file.size > limits.size) {
      setLimitError({
        title: `File Size Limit Exceeded (Max ${limits.sizeLabel})`,
        message: `Your file size is ${formatBytes(file.size)}. Under the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan, the maximum allowed size is ${limits.sizeLabel}. Please select a smaller file or upgrade your plan.`
      });
      return
    }

    setPendingFile(file)
    setCompressing(true)

    try {
      const compressed = await compressImage(file)
      setCompressedFile(compressed)

      const url = URL.createObjectURL(compressed)
      setPreviewUrl(url)
      const origUrl = URL.createObjectURL(file)
      setOriginalUrl(origUrl)
    } catch (err: any) {
      console.error('[Dashboard Gallery] Compression failed:', err)
      toast.error(err.message || 'Failed to compress image.')
      setPendingFile(null)
    } finally {
      setCompressing(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processImageFile(file)
    }
  }

  const handleConfirmUpload = async () => {
    if (!compressedFile) return

    if (creditsState <= 0) {
      toast.error('You have 0 credits remaining. Please buy more credits.')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const publicUrl = await uploadCompressedImage(compressedFile, (progress) => {
        setUploadProgress(progress)
      })

      const supabase = createSupabaseBrowserClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        toast.error('You must be logged in to save photos.')
        return
      }

      const { data, error } = await supabase
        .from('user_gallery')
        .insert([{ user_id: authUser.id, image_url: publicUrl }])
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      const { error: creditError } = await supabase
        .from('profiles')
        .update({ credits: Math.max(0, creditsState - 1) })
        .eq('id', authUser.id)

      if (creditError) {
        console.error('Error deducting credit:', creditError.message)
      }

      setCreditsState((prev) => Math.max(0, prev - 1))
      setGalleryImages((prev) => [data, ...prev])
      toast.success('Optimized image uploaded successfully! 📸 (1 Credit Used)')
      resetUploadState()
    } catch (error: any) {
      console.error('[Dashboard Gallery] Upload failed:', error)
      toast.error(error.message || 'Failed to upload optimized image.')
    } finally {
      setUploading(false)
    }
  }

  const plan = user.plan || 'free';
  const limits = getPlanLimits(plan);
  const maxImages = limits.count;
  const maxUploadSizeLabel = limits.sizeLabel;

  return (
    <div className="min-h-screen bg-[#f5eedf] font-body text-[#110f0f] antialiased">
      {/* Style block to ensure Work Sans and Unbounded fonts apply to headings */}
      <style dangerouslySetInnerHTML={{ __html: `
        h1, h2, h3, h4, h5, h6, .font-heading {
          font-family: 'Unbounded', sans-serif !important;
        }
      `}} />

      {/* Header */}
      <header className="bg-white border-b border-[#d4c3ab] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#110f0f] bg-[#eedfc6]/40 px-4 py-2 rounded-full border border-[#d4c3ab]">
                <Heart className="w-4 h-4 fill-current text-red-500" />
                Hello, {username}
              </span>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800 bg-amber-50 px-4 py-2 rounded-full border border-amber-200">
                <Sparkles className="w-4 h-4 text-amber-500 fill-current" />
                {creditsState} Credits
              </span>
            </div>

            {/* Desktop Navigation (visible on md screens and larger) */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/digital-greeting/templates"
                className="flex items-center gap-2 bg-[#110f0f] text-white px-5 py-2.5 rounded-full font-bold text-sm font-heading shadow-md hover:bg-[#2b95ff] transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                Create New
              </Link>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#110f0f] bg-white border border-[#d4c3ab] rounded-full hover:bg-slate-50 transition-colors"
              >
                {signingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing out…
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </>
                )}
              </button>
            </div>

            {/* Mobile Navigation Menu Toggle (visible only on mobile view) */}
            <div className="flex items-center md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button
                    className="p-2 text-[#110f0f] hover:bg-[#eedfc6]/20 rounded-full border border-[#d4c3ab] transition-colors focus:outline-none"
                    aria-label="Open dashboard menu"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[280px] sm:w-[320px] bg-[#f5eedf] border-l border-[#d4c3ab] p-6 text-[#110f0f] flex flex-col justify-between"
                >
                  <div className="space-y-6">
                    <div className="pt-4 border-b border-[#d4c3ab]/60 pb-4">
                      <p className="text-xs font-bold text-[#948678] uppercase tracking-wider mb-2">Welcome</p>
                      <h3 className="font-heading text-lg font-bold text-[#110f0f] truncate">
                        Hello, {username}
                      </h3>
                      <div className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-current" />
                        {creditsState} Credits
                      </div>
                    </div>

                    {/* Dashboard Tabs Section (no icons) */}
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-[#948678] uppercase tracking-wider mb-2">Dashboard</p>
                      <button
                        onClick={() => {
                          setActiveTab('wishes')
                          setIsMobileMenuOpen(false)
                        }}
                        className={`w-full text-left py-2 px-3 rounded-xl font-bold text-sm transition-all ${
                          activeTab === 'wishes'
                            ? 'bg-[#110f0f] text-white'
                            : 'hover:bg-[#eedfc6]/40 text-[#110f0f]'
                        }`}
                      >
                        Wishes
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('gallery')
                          setIsMobileMenuOpen(false)
                        }}
                        className={`w-full text-left py-2 px-3 rounded-xl font-bold text-sm transition-all ${
                          activeTab === 'gallery'
                            ? 'bg-[#110f0f] text-white'
                            : 'hover:bg-[#eedfc6]/40 text-[#110f0f]'
                        }`}
                      >
                        Gallery
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('plan')
                          setIsMobileMenuOpen(false)
                        }}
                        className={`w-full text-left py-2 px-3 rounded-xl font-bold text-sm transition-all ${
                          activeTab === 'plan'
                            ? 'bg-[#110f0f] text-white'
                            : 'hover:bg-[#eedfc6]/40 text-[#110f0f]'
                        }`}
                      >
                        Plan
                      </button>
                    </div>

                    {/* Actions and General Navigation Links */}
                    <div className="space-y-3 pt-4 border-t border-[#d4c3ab]/60">
                      <p className="text-xs font-bold text-[#948678] uppercase tracking-wider mb-2">Actions & Links</p>
                      <Link
                        href="/"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 w-full py-2.5 px-3 bg-white text-[#110f0f] border border-[#d4c3ab] rounded-xl font-bold text-sm justify-center hover:bg-slate-50 transition-colors"
                      >
                        Home
                      </Link>
                      <Link
                        href="/digital-greeting/templates"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 w-full py-2.5 px-3 bg-[#110f0f] text-white rounded-xl font-bold text-sm font-heading shadow-md justify-center"
                      >
                        <Plus className="w-4 h-4" />
                        Create New
                      </Link>
                      <Link
                        href="/digital-greeting/pricing"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 w-full py-2.5 px-3 bg-white text-[#110f0f] border border-[#d4c3ab] rounded-xl font-bold text-sm justify-center hover:bg-slate-50 transition-colors"
                      >
                        Pricing
                      </Link>
                      <Link
                        href="/contact"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 w-full py-2.5 px-3 bg-white text-[#110f0f] border border-[#d4c3ab] rounded-xl font-bold text-sm justify-center hover:bg-slate-50 transition-colors"
                      >
                        Contact
                      </Link>
                    </div>
                  </div>

                  {/* Sign Out Button at bottom of drawer */}
                  <div className="pt-6 border-t border-[#d4c3ab]/60">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        handleSignOut()
                      }}
                      disabled={signingOut}
                      className="flex items-center gap-2 w-full py-2.5 px-3 text-sm font-semibold text-[#110f0f] bg-white border border-[#d4c3ab] rounded-xl hover:bg-slate-50 transition-colors justify-center"
                    >
                      {signingOut ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Signing out…
                        </>
                      ) : (
                        <>
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </>
                      )}
                    </button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-[#d4c3ab] hidden md:block">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 pt-2">
            <button
              onClick={() => setActiveTab('wishes')}
              className={`pb-4 px-1 text-sm font-bold border-b-3 transition-all ${
                activeTab === 'wishes'
                  ? 'text-[#110f0f] border-[#110f0f]'
                  : 'text-[#5d6c7b] border-transparent hover:text-[#110f0f]'
              }`}
            >
              💌 Wishes
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`pb-4 px-1 text-sm font-bold border-b-3 transition-all ${
                activeTab === 'gallery'
                  ? 'text-[#110f0f] border-[#110f0f]'
                  : 'text-[#5d6c7b] border-transparent hover:text-[#110f0f]'
              }`}
            >
              🖼️ Gallery
            </button>
            <button
              onClick={() => setActiveTab('plan')}
              className={`pb-4 px-1 text-sm font-bold border-b-3 transition-all ${
                activeTab === 'plan'
                  ? 'text-[#110f0f] border-[#110f0f]'
                  : 'text-[#5d6c7b] border-transparent hover:text-[#110f0f]'
              }`}
            >
              ⭐ Plan
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {activeTab === 'plan' ? (
          /* ── My Plan Tab ── */
          <div className="max-w-4xl mx-auto">
            {/* Current plan banner */}
            <div className="bg-gradient-to-br from-[#110f0f] to-[#2d2929] rounded-[24px] p-6 mb-8 text-white border border-[#d4c3ab] shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-[#eedfc6]/70 text-xs font-bold uppercase tracking-wider mb-1">Current Plan</p>
                  <h2 className="text-2xl font-bold font-heading text-[#eedfc6]">
                    {plan === 'starter' ? '⚡ Starter Plan' : plan === 'creator' ? '👑 Creator Plan' : '🎁 Free Plan'}
                  </h2>
                  <p className="text-white/80 text-sm mt-1">
                    {plan === 'starter' ? 'You are on the Starter tier.' : plan === 'creator' ? 'You are on the Creator tier.' : 'You are on the Free tier. Upgrade to unlock more.'}
                  </p>
                </div>
                <Link
                  href="/digital-greeting/pricing"
                  className="flex-shrink-0 bg-[#eedfc6] text-[#110f0f] font-bold text-sm px-6 py-2.5 rounded-full hover:bg-white transition-all shadow-md font-heading"
                >
                  Upgrade Plan →
                </Link>
              </div>
            </div>

            {/* Premium Support / WhatsApp Contact Card */}
            {(plan === 'starter' || plan === 'creator') && (
              <div className="bg-[#eedfc6]/20 border border-[#d4c3ab] rounded-[24px] p-6 mb-8 text-[#110f0f] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold font-heading text-lg text-[#110f0f] flex items-center gap-2">
                    <span>👑</span> Premium Support
                  </h3>
                  <p className="text-sm text-[#5d6c7b] mt-1 leading-relaxed">
                    As a valued premium member, feel free to contact us on WhatsApp for priority assistance, changes, or questions.
                  </p>
                </div>
                <a
                  href="https://wa.me/918499989032"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 flex items-center gap-2 bg-[#25d366] hover:bg-[#20ba56] text-white font-bold text-sm px-6 py-3 rounded-full transition-all shadow-md hover:scale-[1.02]"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>+91 8499989032</span>
                </a>
              </div>
            )}

            {/* Plan limits */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: '⚡', label: 'Credits', value: String(creditsState), max: 'remaining' },
                { icon: '🌐', label: 'Websites Limit', value: `${greetings.length} / ${plan === 'starter' ? '25' : plan === 'creator' ? '100' : '12'}`, max: 'used / limit' },
                { icon: '🖼️', label: 'Image Upload', value: plan === 'starter' ? '5MB' : plan === 'creator' ? '15MB' : '2MB', max: 'limit' },
                { icon: '💬', label: 'Live Chat', value: plan === 'creator' ? '✓' : '✕', max: plan === 'creator' ? 'included' : 'not included' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-[24px] p-5 border border-[#d4c3ab] shadow-sm text-center">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <p className="text-xs font-bold text-[#5d6c7b] uppercase tracking-wider mb-1 font-heading">{item.label}</p>
                  <p className="text-xl font-extrabold text-[#110f0f] font-heading">{item.value}</p>
                  <p className="text-xs text-[#948678] mt-0.5">{item.max}</p>
                </div>
              ))}
            </div>

            {/* Plan comparison cards */}
            <p className="text-sm font-bold text-[#5d6c7b] uppercase tracking-wider mb-4 font-heading">Available Plans</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">

              {/* Starter */}
              <div className="bg-white rounded-[24px] p-6 border border-[#d4c3ab] shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#eedfc6]/30 border border-[#d4c3ab] flex items-center justify-center text-xl">⚡</div>
                  <div>
                    <h3 className="font-bold text-[#110f0f] font-heading">Starter</h3>
                    <p className="text-amber-700 text-sm font-bold font-heading">₹49 / month</p>
                  </div>
                </div>
                <ul className="flex flex-col gap-2 flex-1 mb-5 text-sm">
                  {['20 credits / month', '25 websites limit', '5MB image size limit', 'Email support'].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-[#110f0f]">
                      <span className="w-4 h-4 rounded-md bg-[#eedfc6]/30 border border-[#d4c3ab] text-[#110f0f] text-[10px] font-bold flex items-center justify-center">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/digital-greeting/pricing" className="w-full py-2.5 rounded-xl text-sm font-bold border border-[#110f0f] text-[#110f0f] hover:bg-[#110f0f] hover:text-white transition-all text-center block font-heading">
                  Upgrade to Starter
                </Link>
              </div>

              {/* Creator */}
              <div className="bg-gradient-to-br from-[#110f0f] to-[#201d1e] border border-[#d4c3ab] rounded-[24px] p-6 flex flex-col shadow-lg text-white relative">
                <div className="absolute -top-3 right-4"><span className="bg-amber-400 text-black text-[9px] font-bold px-2.5 py-0.5 rounded-full font-heading">POPULAR</span></div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">👑</div>
                  <div>
                    <h3 className="font-bold text-white font-heading">Creator</h3>
                    <p className="text-white/80 text-sm font-bold font-heading">₹99 / month</p>
                  </div>
                </div>
                <ul className="flex flex-col gap-2 flex-1 mb-5 text-sm text-white">
                  {['50 credits / month', '100 websites limit', '15MB image size limit', 'Priority email support', 'Live chat support'].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-white/95">
                      <span className="w-4 h-4 rounded-md bg-white/20 text-white text-[10px] font-bold flex items-center justify-center">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/digital-greeting/pricing" className="w-full py-2.5 rounded-xl text-sm font-bold bg-[#eedfc6] text-[#110f0f] hover:bg-white transition-all text-center block font-heading">
                  Upgrade to Creator
                </Link>
              </div>

            </div>

            <p className="text-center text-xs text-[#948678] mt-6">
              All plans are billed securely via Razorpay. Save up to 20% with annual billing.
              <Link href="/digital-greeting/pricing" className="text-[#110f0f] font-semibold ml-1 hover:underline">See full pricing →</Link>
            </p>
          </div>
        ) : activeTab === 'wishes' ? (
          greetings.length === 0 ? (
            <div className="text-center py-16 max-w-md mx-auto">
              <div className="text-7xl mb-6 animate-pulse">🎁</div>
              <h2 className="text-2xl font-bold font-heading text-[#110f0f] mb-4">
                No wishes created yet
              </h2>
              <p className="text-[#5d6c7b] mb-8 leading-relaxed">
                Create your first magical wishes page and it will appear here for you to manage.
              </p>
              <Link
                href="/digital-greeting/templates"
                className="inline-flex items-center gap-2 bg-[#110f0f] text-white px-8 py-3 rounded-full font-bold text-sm shadow-md hover:bg-[#2b95ff] transition-transform hover:scale-105 font-heading"
              >
                <Sparkles className="w-4 h-4" />
                Create your first Wish
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-[#5d6c7b] mb-6 font-bold">
                {greetings.length} of {limits.websiteLimit} wishes created (Remaining: {limits.websiteLimit - greetings.length})
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {greetings.map((g) => {
                  const expired = isExpired(g.expires_at)
                  return (
                    <article
                      key={g.id}
                      className={`bg-white/85 backdrop-blur-sm rounded-[24px] p-6 border border-[#d4c3ab] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all ${
                        expired ? 'opacity-65' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-3xl">{THEME_ICONS[g.theme] ?? '💌'}</span>
                        {expired ? (
                           <span className="px-3 py-1 bg-[#fee2e2] text-[#dc2626] text-[10px] font-bold uppercase tracking-wider rounded-full font-heading">
                            Expired
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-[#dcfce7] text-[#16a34a] text-[10px] font-bold uppercase tracking-wider rounded-full font-heading">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="mb-6">
                        <h2 className="text-lg font-bold text-[#110f0f] font-heading mb-2">
                          To: {g.recipient_name}
                        </h2>
                        <p className="text-sm text-[#5d6c7b] mb-1 font-semibold">
                          {g.occasion} · {THEME_LABELS[g.theme] ?? g.theme}
                        </p>
                        <p className="text-xs text-[#948678]">
                          Created {formatDate(g.created_at)}
                          {!expired && ` · Expires ${formatDate(g.expires_at)}`}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <a
                          href={`/greet/${g.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1 px-2.5 py-2 bg-white text-[#110f0f] text-xs font-bold rounded-xl border border-[#d4c3ab] hover:bg-slate-50 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </a>

                        <button
                          onClick={() => copyLink(g.slug)}
                          className="flex-1 flex items-center justify-center gap-1 px-2.5 py-2 bg-[#eedfc6]/40 text-[#110f0f] text-xs font-bold rounded-xl border border-[#d4c3ab] hover:bg-[#eedfc6] transition-colors"
                        >
                          {copiedSlug === g.slug ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy Link
                            </>
                          )}
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            </>
          )
        ) : activeTab === 'gallery' ? (
          /* Gallery Tab */
          <div
            onDragOver={(e) => {
              e.preventDefault()
              if (!uploading && !compressing && galleryImages.length < maxImages) {
                setIsDragging(true)
              }
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              setIsDragging(false)
            }}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              if (uploading || compressing) return
              const file = e.dataTransfer.files?.[0]
              if (file) {
                processImageFile(file)
              }
            }}
            className="relative"
          >
            {/* Drag & Drop Visual Backdrop Overlay */}
            {isDragging && (
              <div className="absolute inset-0 z-40 bg-[#f5eedf]/95 border-3 border-dashed border-[#110f0f] rounded-2xl flex flex-col items-center justify-center pointer-events-none">
                <UploadCloud className="w-16 h-16 text-[#110f0f] animate-bounce" />
                <h3 className="text-lg font-bold text-[#110f0f] mt-4 font-heading">Drop your image here</h3>
                <p className="text-sm text-[#5d6c7b] mt-2">Convert automatically to WebP</p>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-[#5d6c7b] font-bold">
                {galleryImages.length} of {maxImages} images used (Remaining: {maxImages - galleryImages.length})
              </p>
              {galleryImages.length >= maxImages && (
                <span className="text-xs font-bold text-rose-600">
                  ⚠️ Gallery is full (Limit: {maxImages})
                </span>
              )}
            </div>

            {galleryLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#5d6c7b]">
                <Loader2 className="w-10 h-10 animate-spin text-[#110f0f]" />
                <p className="text-sm font-semibold">Loading your gallery...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {/* Upload Card */}
                {galleryImages.length < maxImages ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square bg-white border-2 border-dashed border-[#d4c3ab] rounded-[24px] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#110f0f] hover:bg-[#eedfc6]/20 transition-all group"
                  >
                    <UploadCloud className="w-10 h-10 text-[#5d6c7b] group-hover:text-[#110f0f] transition-colors" />
                    <span className="text-xs font-bold text-[#5d6c7b] group-hover:text-[#110f0f] transition-colors">
                      Upload Photo
                    </span>
                    <span className="text-[10px] text-[#948678]">Max {maxUploadSizeLabel}</span>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      setLimitError({
                        title: "Gallery limit reached",
                        message: `Your gallery has reached the limit of ${maxImages} images for your ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan. Please delete some images or upgrade your plan.`
                      });
                    }}
                    className="aspect-square bg-rose-50 border-2 border-rose-200 rounded-[24px] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-rose-100/50 transition-all group"
                  >
                    <ImageIcon className="w-10 h-10 text-[#e11d48]" />
                    <span className="text-xs font-bold text-[#e11d48] text-center">
                      Gallery Full
                    </span>
                    <span className="text-[10px] text-[#e11d48] text-center">
                      Click to view plans
                    </span>
                  </div>
                )}

                {/* Gallery Images List */}
                {galleryImages.map((img) => (
                  <div key={img.id} className="bg-white rounded-[24px] overflow-hidden border border-[#d4c3ab] shadow-sm group hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="relative aspect-square bg-[#eedfc6]/10">
                      <img
                        src={img.image_url}
                        alt="Gallery item"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      className="w-full py-3 bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : null}
      </main>

      {/* Image Preview & Optimization Dialog */}
      <Dialog open={!!pendingFile} onOpenChange={(open) => !open && !uploading && resetUploadState()}>
        <DialogContent
          aria-describedby={undefined}
          className="max-w-xl w-[95%] max-h-[85vh] flex flex-col p-6 rounded-[24px] bg-white border border-[#d4c3ab] shadow-xl overflow-hidden"
        >
          {/* Title */}
          <DialogHeader className={compressing || !compressedFile ? 'sr-only' : 'pb-2'}>
            <DialogTitle className="text-xl font-bold font-heading text-[#110f0f] flex items-center gap-2">
              ✨ Preview Optimized Image
            </DialogTitle>
          </DialogHeader>

          {/* Loading / Compressing state */}
          {(compressing || !compressedFile) && (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 text-[#5d6c7b]">
              <Loader2 className="w-10 h-10 animate-spin text-[#110f0f]" />
              <p className="text-sm font-bold text-[#110f0f] animate-pulse">
                {compressing ? 'Optimizing image in browser...' : 'Preparing image…'}
              </p>
              <p className="text-xs text-[#948678] max-w-[280px] text-center">
                {compressing
                  ? 'Resizing to 1920px, converting to WebP using Web Workers for smooth performance.'
                  : 'Please wait a moment.'}
              </p>
            </div>
          )}

          {/* Preview & Confirm state */}
          {!compressing && pendingFile && compressedFile && (
            <>
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 py-2 min-h-[300px]">
                {/* Side-by-side image comparison */}
                <div className="grid grid-cols-2 gap-3 max-h-[32vh] flex-1">
                  {/* Original */}
                  <div className="relative aspect-video bg-[#110f0f] rounded-xl overflow-hidden border border-[#d4c3ab] flex items-center justify-center">
                    {originalUrl && (
                      <img src={originalUrl} alt="Original preview" className="w-full h-full object-contain" />
                    )}
                    <span className="absolute top-2 left-2 text-[9px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full uppercase">
                      Original
                    </span>
                  </div>

                  {/* Optimized WebP */}
                  <div className="relative aspect-video bg-[#110f0f] rounded-xl overflow-hidden border border-[#d4c3ab] flex items-center justify-center">
                    {previewUrl && (
                      <img src={previewUrl} alt="Optimized preview" className="w-full h-full object-contain" />
                    )}
                    <span className="absolute top-2 left-2 text-[9px] font-bold text-white bg-[#eedfc6] text-[#110f0f] px-2 py-0.5 rounded-full uppercase">
                      Optimized WebP
                    </span>
                  </div>
                </div>

                {/* Size comparison stats */}
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
                  💡 Uploading this image will consume 1 credit. (Remaining credits: {creditsState})
                </div>

                {/* Upload progress bar */}
                {uploading && (
                  <div className="bg-[#eedfc6]/10 border border-[#d4c3ab] rounded-xl p-4 space-y-2 text-center">
                    <div className="text-xs font-bold text-[#110f0f] animate-pulse">
                      Uploading WebP image to R2 storage ({uploadProgress}%) · Uses 1 credit
                    </div>
                    <Progress value={uploadProgress} className="h-1.5 bg-slate-100" />
                  </div>
                )}
              </div>

              {/* Footer action buttons */}
              <div className="pt-4 border-t border-[#d4c3ab] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetUploadState}
                  disabled={uploading}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-[#110f0f] hover:bg-slate-50 rounded-xl transition-colors h-10 border border-[#d4c3ab]"
                >
                  <X className="w-3.5 h-3.5" />
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUpload}
                  disabled={uploading}
                  className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-[#110f0f] hover:bg-[#2b95ff] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md h-10 font-heading"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Confirm & Upload
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
                  <p className="text-[#110f0f] font-bold">5MB size</p>
                  <p className="text-[#110f0f] font-bold">15 Images</p>
                </div>
                <div className="p-2 bg-[#110f0f] text-white rounded-xl">
                  <p className="font-bold font-heading text-[#eedfc6]">Creator</p>
                  <p className="text-white/80 mt-1">100 Websites</p>
                  <p className="text-white/80">15MB size</p>
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
    </div>
  )
}
