'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signInWithEmail, signInWithGoogle, sendResetPasswordEmail } from '@/lib/auth/actions'
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/wishes/dashboard'
  const isFromCreate = next.includes('/digital-greeting/create')

  const [authError, setAuthError] = useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isFocused, setIsFocused] = useState<string | null>(null)
  const [resetSuccess, setResetSuccess] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const [isResetLoading, setIsResetLoading] = useState(false)
  const [showResetLink, setShowResetLink] = useState(false)

  // Countdown timer for reset email cooldown
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const emailRegister = register('email')
  const passwordRegister = register('password')

  const onSubmit = async (data: LoginForm) => {
    setAuthError(null)
    setResetSuccess(null)
    const { error } = await signInWithEmail(data.email, data.password)
    if (error) {
      // Map Supabase error messages to user-friendly strings
      if (error.toLowerCase().includes('invalid login credentials') ||
          error.toLowerCase().includes('invalid credentials')) {
        setAuthError('Incorrect email or password. Please try again.')
        setShowResetLink(true)
      } else if (error.toLowerCase().includes('email not confirmed')) {
        setAuthError('Please verify your email address before logging in.')
      } else {
        setAuthError(error)
      }
      return
    }
    router.push(next)
    router.refresh()
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setAuthError(null)
    const { error } = await signInWithGoogle(next)
    if (error) {
      setAuthError(error)
      setIsGoogleLoading(false)
    }
    // On success, browser is redirected by Supabase OAuth — no further action needed
  }

  const handleForgotPassword = async () => {
    if (cooldown > 0) return

    const email = getValues('email')
    if (!email || !email.includes('@')) {
      setAuthError('Please enter a valid email address first.')
      return
    }

    setIsResetLoading(true)
    setAuthError(null)
    setResetSuccess(null)

    const { error } = await sendResetPasswordEmail(email)
    setIsResetLoading(false)

    if (error) {
      setAuthError(error)
    } else {
      setResetSuccess('Reset password link has been sent to your email.')
      setCooldown(60)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff1f2] via-[#fce7f3] to-[#faf6f8] font-body text-[#3d2c2e] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4 animate-bounce">💌</div>
          <h1 className="text-3xl font-bold font-heading text-[#3d2c2e] mb-2">
            Welcome Back
          </h1>
          <p className="text-[#9e8a8e]">
            Sign in to manage your Wishes
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-[#78555e]/10 p-8 border border-[#f0e8ec]">
          {isFromCreate && (
            <div className="bg-gradient-to-r from-[#fff1f2] to-[#fef3c7] border border-[#fecdd3] rounded-2xl p-4 mb-6 text-center">
              <p className="text-sm font-semibold text-[#be123c]">
                ✨ Account creation is 100% free! Please sign in to create and save your Wishes Website.
              </p>
            </div>
          )}

          {authError && (
            <div className="bg-[#fff1f2] border border-[#fecdd3] rounded-2xl p-4 mb-6 flex items-start gap-3">
              <div className="text-[#f43f5e] text-xl flex-shrink-0">⚠️</div>
              <p className="text-sm font-semibold text-[#be123c] leading-relaxed">
                {authError}
              </p>
            </div>
          )}

          {resetSuccess && (
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-4 mb-6 flex items-start gap-3 animate-fadeIn">
              <div className="text-[#22c55e] text-xl flex-shrink-0">✅</div>
              <p className="text-sm font-semibold text-[#166534] leading-relaxed">
                {resetSuccess}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-xs font-bold uppercase tracking-wider text-[#78555e]">
                Email Address
              </label>
              <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                  isFocused === 'email' ? 'text-[#c64b7a]' : 'text-[#9e8a8e]'
                }`}>
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  onFocus={() => setIsFocused('email')}
                  className={`w-full pl-12 pr-4 py-4 bg-[#faf6f8] border-2 rounded-2xl text-sm font-semibold text-[#3d2c2e] placeholder-[#b5a5a8] focus:outline-none focus:bg-white transition-all ${
                    errors.email
                      ? 'border-[#f43f5e] focus:border-[#f43f5e]'
                      : isFocused === 'email'
                      ? 'border-[#c64b7a]'
                      : 'border-[#e0d4d8] focus:border-[#c64b7a]'
                  }`}
                  placeholder="you@example.com"
                  {...emailRegister}
                  onBlur={(e) => {
                    emailRegister.onBlur(e)
                    setIsFocused(null)
                  }}
                />
              </div>
              {errors.email && (
                <p className="text-xs font-bold text-[#f43f5e] pl-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="login-password" className="text-xs font-bold uppercase tracking-wider text-[#78555e]">
                Password
              </label>
              <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                  isFocused === 'password' ? 'text-[#c64b7a]' : 'text-[#9e8a8e]'
                }`}>
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  onFocus={() => setIsFocused('password')}
                  className={`w-full pl-12 pr-4 py-4 bg-[#faf6f8] border-2 rounded-2xl text-sm font-semibold text-[#3d2c2e] placeholder-[#b5a5a8] focus:outline-none focus:bg-white transition-all ${
                    errors.password
                      ? 'border-[#f43f5e] focus:border-[#f43f5e]'
                      : isFocused === 'password'
                      ? 'border-[#c64b7a]'
                      : 'border-[#e0d4d8] focus:border-[#c64b7a]'
                  }`}
                  placeholder="Enter your password"
                  {...passwordRegister}
                  onBlur={(e) => {
                    passwordRegister.onBlur(e)
                    setIsFocused(null)
                  }}
                />
              </div>
              {errors.password && (
                <p className="text-xs font-bold text-[#f43f5e] pl-1">
                  {errors.password.message}
                </p>
              )}
              {showResetLink && (
                <div className="text-right mt-1">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={cooldown > 0 || isResetLoading}
                    className="text-xs font-bold text-[#c64b7a] hover:text-[#78555e] hover:underline disabled:opacity-50 transition-all focus:outline-none"
                  >
                    {isResetLoading ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Forgot password?'}
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              id="login-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#78555e] to-[#c64b7a] text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-[#78555e]/20 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#e0d4d8]" />
            <span className="text-xs font-bold text-[#9e8a8e] uppercase">
              Or continue with
            </span>
            <div className="flex-1 h-px bg-[#e0d4d8]" />
          </div>

          {/* Google Button */}
          <button
            id="login-google"
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-[#78555e] py-4 rounded-2xl font-bold text-sm border-2 border-[#e0d4d8] hover:border-[#c64b7a] hover:bg-[#faf6f8] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" />
                  <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
                </svg>
                Google
              </>
            )}
          </button>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-[#9e8a8e]">
              Don&apos;t have an account?{' '}
              <Link href={`/wishes/signup?next=${encodeURIComponent(next)}`} className="font-bold text-[#c64b7a] hover:text-[#78555e] transition-colors underline-offset-4 hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WishesLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#fff1f2] via-[#fce7f3] to-[#faf6f8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#fecdd3] border-t-[#f43f5e] rounded-full animate-spin" />
          <p className="text-sm font-semibold text-[#78555e]">Loading...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}
