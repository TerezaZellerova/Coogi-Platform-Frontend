'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/theme-toggle'
import { CoogiLogo } from '@/components/ui/coogi-logo'
import { apiClient } from '@/lib/api-production'
import { useToast } from '@/components/ui/toast'
import { 
  Globe, 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all fields',
        duration: 4000
      })
      return
    }

    setLoading(true)
    
    // Show initial feedback
    addToast({
      type: 'info',
      title: 'Signing In...',
      message: 'Connecting to backend...',
      duration: 5000
    })
    
    try {
      const authData = await apiClient.login(email, password)
      
      // Check if we're in demo mode by checking the token
      if (authData.token.startsWith('demo_')) {
        addToast({
          type: 'warning',
          title: 'Demo Mode Active',
          message: 'Backend unavailable - using demo data for testing',
          duration: 5000
        })
      } else {
        addToast({
          type: 'success',
          title: 'Welcome Back!',
          message: 'Login successful. Redirecting to dashboard...',
          duration: 3000
        })
      }
      
      router.push('/dashboard')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid credentials'
      addToast({
        type: 'error',
        title: 'Login Failed',
        message: errorMessage,
        duration: 8000
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <div 
          className="flex items-center space-x-3 cursor-pointer group" 
          onClick={() => router.push('/landing')}
        >
          <CoogiLogo size="sm" />
        </div>
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="backdrop-blur-lg bg-card/80 border-border/50 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto">
              <CoogiLogo size="lg" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Sign in to your Coogi account to continue
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-border/50 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 border-border/50 focus:border-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 text-base font-medium group border border-primary/20"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Connecting... (may take 30-60s)</span>
                  </div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {/* Forgot Password */}
            <div className="text-center">
              <button
                onClick={() => {
                  addToast({
                    type: 'info',
                    title: 'Password Reset',
                    message: 'Password reset functionality will be available soon.',
                    duration: 4000
                  })
                }}
                className="text-sm text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
              >
                Forgot your password?
              </button>
            </div>

            {/* OAuth Options */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  addToast({
                    type: 'info',
                    title: 'Google Sign-In',
                    message: 'Google OAuth will be available soon.',
                    duration: 4000
                  })
                }}
                className="h-12 border-border/50 hover:bg-accent/50 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  addToast({
                    type: 'info',
                    title: 'GitHub Sign-In',
                    message: 'GitHub OAuth will be available soon.',
                    duration: 4000
                  })
                }}
                className="h-12 border-border/50 hover:bg-accent/50 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button
                  onClick={() => router.push('/signup')}
                  className="text-primary hover:text-primary/80 font-medium transition-colors underline-offset-4 hover:underline"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/landing')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  )
}
