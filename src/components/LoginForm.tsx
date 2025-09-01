'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { apiClient } from '@/lib/api-production'
import { CoogiLogo } from '@/components/ui/coogi-logo'
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'

interface LoginFormProps {
  onLoginSuccessAction: () => void
}

export default function LoginForm({ onLoginSuccessAction }: LoginFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isLogin) {
        await apiClient.login(email, password)
        setSuccess('Login successful! Redirecting to dashboard...')
        setTimeout(() => {
          onLoginSuccessAction()
        }, 1000)
      } else {
        await apiClient.signup(email, password)
        setSuccess('Account created successfully! Please log in.')
        setIsLogin(true)
        setEmail('')
        setPassword('')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleTestLogin = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await apiClient.login('test@coogi.dev', 'coogi123')
      setSuccess('Test login successful! Redirecting to dashboard...')
      setTimeout(() => {
        onLoginSuccessAction()
      }, 1000)
    } catch (error) {
      setError('Test login failed. Please try manual login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CoogiLogo className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isLogin ? 'Welcome to COOGI' : 'Create COOGI Account'}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Sign in to access your recruitment dashboard'
              : 'Join COOGI to start finding top talent'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={handleTestLogin}
            disabled={loading}
            className="w-full"
          >
            Use Demo Account
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setSuccess('')
              }}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              {isLogin 
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"
              }
            </button>
          </div>

          {isLogin && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-semibold">Demo Credentials:</p>
              <p>Email: test@coogi.dev</p>
              <p>Password: coogi123</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
