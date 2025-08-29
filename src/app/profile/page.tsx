'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { apiClient } from '@/lib/api-production'
import { useToast } from '@/components/ui/toast'
import { CoogiLogo } from '@/components/ui/coogi-logo'
import { 
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Shield,
  Bell,
  Palette,
  Download,
  Upload,
  Settings,
  Edit,
  Save,
  X,
  Camera,
  Phone,
  MapPin,
  Briefcase,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Activity
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  phone?: string
  location?: string
  company?: string
  website?: string
  role: string
  joinDate: string
  lastLogin: string
  timezone: string
  language: string
  emailNotifications: boolean
  pushNotifications: boolean
  marketingEmails: boolean
  twoFactorEnabled: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addToast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  
  const [user, setUser] = useState<UserProfile>({
    id: '1',
    name: 'Test User',
    email: 'test@coogi.dev',
    avatar: '',
    bio: 'Lead generation specialist passionate about connecting businesses with their ideal customers.',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    company: 'Coogi Inc.',
    website: 'https://coogi.dev',
    role: 'Admin',
    joinDate: '2025-01-15T10:30:00Z',
    lastLogin: new Date().toISOString(),
    timezone: 'America/New_York',
    language: 'en',
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    twoFactorEnabled: false
  })
  
  const [editedUser, setEditedUser] = useState<UserProfile>({ ...user })
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  useEffect(() => {
    if (!apiClient.isAuthenticated()) {
      router.push('/login')
      return
    }
    
    // Get user info from API client
    const currentUser = apiClient.getCurrentUser()
    if (currentUser) {
      setUser(prev => ({ ...prev, ...currentUser }))
      setEditedUser(prev => ({ ...prev, ...currentUser }))
    }

    // Load saved profile data from localStorage
    const savedProfile = localStorage.getItem('userProfile')
    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile)
        setUser(prev => ({ ...prev, ...profileData }))
        setEditedUser(prev => ({ ...prev, ...profileData }))
      } catch (error) {
        console.error('Failed to parse saved profile data:', error)
      }
    }

    // Load saved avatar from localStorage (fallback if not in profile data)
    const savedAvatar = localStorage.getItem('userAvatar')
    if (savedAvatar && !savedProfile) {
      setUser(prev => ({ ...prev, avatar: savedAvatar }))
      setEditedUser(prev => ({ ...prev, avatar: savedAvatar }))
    }
  }, [router])

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast({
        type: 'error',
        title: 'File too large',
        message: 'Please choose an image smaller than 5MB'
      })
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      addToast({
        type: 'error',
        title: 'Invalid file type',
        message: 'Please choose an image file'
      })
      return
    }

    setUploading(true)
    
    try {
      // Convert to base64 for demo (in production, upload to cloud storage)
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setUser(prev => ({ ...prev, avatar: result }))
        setEditedUser(prev => ({ ...prev, avatar: result }))
        
        // Save avatar to localStorage for persistence
        localStorage.setItem('userAvatar', result)
        
        // Update the full profile with avatar
        const savedProfile = localStorage.getItem('userProfile')
        if (savedProfile) {
          try {
            const profileData = JSON.parse(savedProfile)
            profileData.avatar = result
            localStorage.setItem('userProfile', JSON.stringify(profileData))
          } catch (error) {
            console.error('Failed to update profile with avatar:', error)
          }
        }
        
        // Dispatch custom event to notify other components (like dashboard)
        window.dispatchEvent(new CustomEvent('profileUpdated'))
        
        addToast({
          type: 'success',
          title: 'Avatar updated',
          message: 'Your profile picture has been updated successfully'
        })
      }
      reader.readAsDataURL(file)
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Upload failed',
        message: 'Failed to upload avatar. Please try again.'
      })
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveAvatar = () => {
    setUser(prev => ({ ...prev, avatar: '' }))
    setEditedUser(prev => ({ ...prev, avatar: '' }))
    localStorage.removeItem('userAvatar')
    
    // Update the full profile to remove avatar
    const savedProfile = localStorage.getItem('userProfile')
    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile)
        profileData.avatar = ''
        localStorage.setItem('userProfile', JSON.stringify(profileData))
      } catch (error) {
        console.error('Failed to update profile:', error)
      }
    }
    
    // Dispatch custom event to notify other components (like dashboard)
    window.dispatchEvent(new CustomEvent('profileUpdated'))
    
    addToast({
      type: 'success',
      title: 'Avatar removed',
      message: 'Your profile picture has been removed'
    })
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      // In production: await apiClient.updateProfile(editedUser)
      setUser({ ...editedUser })
      setEditing(false)
      
      // Save profile data to localStorage for persistence
      localStorage.setItem('userProfile', JSON.stringify(editedUser))
      if (editedUser.avatar) {
        localStorage.setItem('userAvatar', editedUser.avatar)
      }
      
      // Dispatch custom event to notify other components (like dashboard)
      window.dispatchEvent(new CustomEvent('profileUpdated'))
      
      addToast({
        type: 'success',
        title: 'Profile updated',
        message: 'Your profile has been updated successfully'
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Update failed',
        message: 'Failed to update profile. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedUser({ ...user })
    setEditing(false)
  }

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      addToast({
        type: 'error',
        title: 'Password mismatch',
        message: 'New passwords do not match'
      })
      return
    }

    if (passwordData.new.length < 8) {
      addToast({
        type: 'error',
        title: 'Password too short',
        message: 'Password must be at least 8 characters long'
      })
      return
    }

    setLoading(true)
    try {
      // In production: await apiClient.changePassword(passwordData)
      setPasswordData({ current: '', new: '', confirm: '' })
      
      addToast({
        type: 'success',
        title: 'Password changed',
        message: 'Your password has been updated successfully'
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Password change failed',
        message: 'Failed to change password. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    )
    
    if (!confirmed) return

    setLoading(true)
    try {
      // In production: await apiClient.deleteAccount()
      addToast({
        type: 'success',
        title: 'Account scheduled for deletion',
        message: 'Your account will be deleted within 24 hours'
      })
      router.push('/login')
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Deletion failed',
        message: 'Failed to delete account. Please contact support.'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/dashboard')}
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="h-6 w-px bg-border hidden sm:block" />
              <div className="flex items-center space-x-4">
                <CoogiLogo size="sm" iconOnly />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    User Profile
                  </h1>
                  <p className="text-xs text-muted-foreground">Manage your account and preferences</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              {editing ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveProfile} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Overview Card */}
        <Card className="shadow-lg border-0 bg-card">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Avatar Section */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {editing && (
                  <div className="absolute -bottom-2 -right-2 flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 rounded-full p-0 bg-background shadow-md"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      title="Upload new avatar"
                    >
                      {uploading ? (
                        <Clock className="w-3 h-3 animate-spin" />
                      ) : (
                        <Camera className="w-3 h-3" />
                      )}
                    </Button>
                    {user.avatar && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 rounded-full p-0 bg-background shadow-md"
                        onClick={handleRemoveAvatar}
                        title="Remove avatar"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              
              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
                <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
                  <Badge variant="outline" className="capitalize">
                    <Shield className="w-3 h-3 mr-1" />
                    {user.role}
                  </Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Joined {formatDate(user.joinDate)}
                  </span>
                </div>
                {user.bio && (
                  <p className="text-sm text-muted-foreground mt-2 max-w-md">{user.bio}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings Tabs */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted p-1 rounded-lg">
            <TabsTrigger value="personal" className="rounded-md">
              <User className="w-4 h-4 mr-2" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-md">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="preferences" className="rounded-md">
              <Settings className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="data" className="rounded-md">
              <Download className="w-4 h-4 mr-2" />
              Data
            </TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  Personal Information
                </CardTitle>
                <CardDescription>Update your personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={editedUser.name}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!editing}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={editedUser.email}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!editing}
                      placeholder="Enter your email"
                      type="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={editedUser.phone || ''}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!editing}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={editedUser.location || ''}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!editing}
                      placeholder="Enter your location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={editedUser.company || ''}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, company: e.target.value }))}
                      disabled={!editing}
                      placeholder="Enter your company"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={editedUser.website || ''}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, website: e.target.value }))}
                      disabled={!editing}
                      placeholder="Enter your website"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    value={editedUser.bio || ''}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!editing}
                    placeholder="Tell us about yourself..."
                    className="w-full min-h-[100px] px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    rows={4}
                  />
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">Account Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-200">Account Active</span>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-300">Your account is in good standing</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-800 dark:text-blue-200">Last Login</span>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        {formatDateTime(user.lastLogin)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  Security Settings
                </CardTitle>
                <CardDescription>Manage your account security and authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Password & Authentication</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full md:w-auto justify-start" disabled>
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password (Coming Soon)
                    </Button>
                    <Button variant="outline" className="w-full md:w-auto justify-start" disabled>
                      <Shield className="w-4 h-4 mr-2" />
                      Enable Two-Factor Auth (Coming Soon)
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">Session Management</h4>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full md:w-auto justify-start"
                      onClick={() => {
                        localStorage.removeItem('token')
                        router.push('/login')
                      }}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Sign Out of This Device
                    </Button>
                    <Button variant="outline" className="w-full md:w-auto justify-start" disabled>
                      <Users className="w-4 h-4 mr-2" />
                      Sign Out All Devices (Coming Soon)
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-800 dark:text-red-200">Danger Zone</h4>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                          Account deletion is permanent and cannot be undone.
                        </p>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="mt-3"
                          onClick={handleDeleteAccount}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account (Coming Soon)
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-500" />
                  Preferences
                </CardTitle>
                <CardDescription>Customize your platform experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive updates about your agents and campaigns</p>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        <Bell className="w-4 h-4 mr-2" />
                        Configure (Coming Soon)
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Real-time updates in your browser</p>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        <Bell className="w-4 h-4 mr-2" />
                        Configure (Coming Soon)
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">Display</h4>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <Palette className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-blue-900 dark:text-blue-100">Theme Settings</h5>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          Dark mode and theme customization features are coming soon.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">Language & Region</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full md:w-auto justify-start" disabled>
                      <Globe className="w-4 h-4 mr-2" />
                      Language: English (Coming Soon)
                    </Button>
                    <Button variant="outline" className="w-full md:w-auto justify-start" disabled>
                      <Clock className="w-4 h-4 mr-2" />
                      Timezone: {user.timezone} (Coming Soon)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data & Export Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-green-500" />
                  Data & Export
                </CardTitle>
                <CardDescription>Manage your data and export options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Export Your Data</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full md:w-auto justify-start" disabled>
                      <Download className="w-4 h-4 mr-2" />
                      Export Profile Data (Coming Soon)
                    </Button>
                    <Button variant="outline" className="w-full md:w-auto justify-start" disabled>
                      <Download className="w-4 h-4 mr-2" />
                      Export Lead Data (Coming Soon)
                    </Button>
                    <Button variant="outline" className="w-full md:w-auto justify-start" disabled>
                      <Download className="w-4 h-4 mr-2" />
                      Export Campaign Data (Coming Soon)
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">Data Usage</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-gray-600" />
                        <span className="font-medium">Total Leads</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">1,234</p>
                      <p className="text-xs text-muted-foreground">Lifetime leads generated</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-gray-600" />
                        <span className="font-medium">Active Campaigns</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">12</p>
                      <p className="text-xs text-muted-foreground">Currently running</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
