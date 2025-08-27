'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { apiClient } from '@/lib/api-production'
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
  X
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [user, setUser] = useState({
    name: 'Test User',
    email: 'test@coogi.dev',
    role: 'admin',
    joinDate: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  })
  
  const [editedUser, setEditedUser] = useState({ ...user })

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
  }, [router])

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      // In a real app, you'd call an API to update the user profile
      setUser(editedUser)
      setEditing(false)
      // You could call: await apiClient.updateProfile(editedUser)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedUser({ ...user })
    setEditing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/')}
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="h-6 w-px bg-border hidden sm:block" />
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
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
        {/* Profile Overview */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">
                  {(editedUser.name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{user.name}</h2>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <Badge variant="outline" className="capitalize">
                    <Shield className="w-3 h-3 mr-1" />
                    {user.role}
                  </Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Joined {new Date(user.joinDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <TabsTrigger value="personal" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Security
            </TabsTrigger>
            <TabsTrigger value="preferences" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Preferences
            </TabsTrigger>
            <TabsTrigger value="data" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Data & Export
            </TabsTrigger>
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="personal" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
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
                    <label className="text-sm font-semibold">Full Name</label>
                    <Input
                      value={editedUser.name}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!editing}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Email Address</label>
                    <Input
                      value={editedUser.email}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!editing}
                      placeholder="Enter your email"
                      type="email"
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">Account Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-200">Account Active</span>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-300">Your account is in good standing</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-800 dark:text-blue-200">Last Login</span>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        {new Date(user.lastLogin).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
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
                      <Shield className="w-4 h-4 mr-2" />
                      Change Password (Coming Soon)
                    </Button>
                    <Button variant="outline" className="w-full md:w-auto justify-start" disabled>
                      <Settings className="w-4 h-4 mr-2" />
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
                      <Settings className="w-4 h-4 mr-2" />
                      Sign Out All Devices (Coming Soon)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences */}
          <TabsContent value="preferences" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
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
                        Configure
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Real-time updates in your browser</p>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        <Bell className="w-4 h-4 mr-2" />
                        Configure
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data & Export */}
          <TabsContent value="data" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto p-4 justify-start" disabled>
                      <div className="flex items-start gap-3">
                        <Download className="w-5 h-5 text-blue-500 mt-1" />
                        <div className="text-left">
                          <p className="font-medium">Export Agents</p>
                          <p className="text-xs text-muted-foreground">Download all your agent data</p>
                        </div>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 justify-start" disabled>
                      <div className="flex items-start gap-3">
                        <Download className="w-5 h-5 text-green-500 mt-1" />
                        <div className="text-left">
                          <p className="font-medium">Export Leads</p>
                          <p className="text-xs text-muted-foreground">Download all lead data</p>
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">Data Management</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full md:w-auto justify-start" disabled>
                      <Upload className="w-4 h-4 mr-2" />
                      Import Data (Coming Soon)
                    </Button>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-start gap-2">
                        <Settings className="w-4 h-4 text-yellow-600 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-yellow-900 dark:text-yellow-100">Data Retention</h5>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                            Your data is automatically backed up and retained according to our data policy.
                          </p>
                        </div>
                      </div>
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
