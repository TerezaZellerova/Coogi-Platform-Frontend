'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { ArrowLeft, Palette, CheckCircle2, Monitor } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestPage() {
  return (
    <div className="page-auto">
      {/* Header with theme toggle */}
      <div className="header-auto">
        <div className="container-auto py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/"
              className="inline-flex items-center text-auto-medium hover:text-auto-high transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content */}
      <div className="container-auto py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 animate-float">
              <Palette className="w-8 h-8 text-white" />
            </div>
            <h1 className="heading-auto-responsive text-auto-high mb-4">
              Tailwind & Theme Test
            </h1>
            <p className="text-auto-medium text-auto-responsive max-w-2xl mx-auto">
              This page demonstrates the global CSS system, dark/light mode compatibility, and premium styling components.
            </p>
          </div>

          {/* Test Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Colors Test */}
            <Card className="glass-auto hover-sophisticated animate-card-entrance">
              <CardHeader>
                <CardTitle className="text-auto-high flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
                  Color System
                </CardTitle>
                <CardDescription className="text-auto-medium">
                  Automatic light/dark mode colors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="text-auto-high text-sm font-medium">High Contrast Text</div>
                  <div className="text-auto-medium text-sm">Medium Contrast Text</div>
                  <div className="text-auto-low text-sm">Low Contrast Text</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-auto-subtle p-2 rounded text-xs text-center">Subtle BG</div>
                  <div className="bg-auto-elevated p-2 rounded text-xs text-center">Elevated BG</div>
                </div>
              </CardContent>
            </Card>

            {/* Buttons Test */}
            <Card className="glass-auto hover-sophisticated animate-card-entrance" style={{animationDelay: '0.1s'}}>
              <CardHeader>
                <CardTitle className="text-auto-high flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
                  Button Styles
                </CardTitle>
                <CardDescription className="text-auto-medium">
                  Premium button effects and states
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full btn-premium">
                  Premium Button
                </Button>
                <Button variant="outline" className="w-full hover-sophisticated">
                  Outline Button
                </Button>
                <Button variant="secondary" className="w-full">
                  Secondary Button
                </Button>
              </CardContent>
            </Card>

            {/* Forms Test */}
            <Card className="glass-auto hover-sophisticated animate-card-entrance" style={{animationDelay: '0.2s'}}>
              <CardHeader>
                <CardTitle className="text-auto-high flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
                  Form Elements
                </CardTitle>
                <CardDescription className="text-auto-medium">
                  Auto-styled form inputs and controls
                </CardDescription>
              </CardHeader>
              <CardContent className="form-auto space-y-3">
                <div>
                  <label>Email Input</label>
                  <input type="email" placeholder="test@example.com" />
                </div>
                <div>
                  <label>Select Dropdown</label>
                  <select>
                    <option>Option 1</option>
                    <option>Option 2</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Animations Demo */}
          <Card className="glass-auto hover-sophisticated mb-12">
            <CardHeader>
              <CardTitle className="text-auto-high flex items-center">
                <Monitor className="w-5 h-5 mr-2" />
                Animation Showcase
              </CardTitle>
              <CardDescription className="text-auto-medium">
                Premium animations and effects in action
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-premium p-4 rounded-xl text-center animate-fade-in">
                  <div className="text-sm font-medium text-auto-high mb-2">Fade In</div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mx-auto"></div>
                </div>
                <div className="glass-premium p-4 rounded-xl text-center animate-slide-in">
                  <div className="text-sm font-medium text-auto-high mb-2">Slide In</div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg mx-auto"></div>
                </div>
                <div className="glass-premium p-4 rounded-xl text-center animate-scale-in">
                  <div className="text-sm font-medium text-auto-high mb-2">Scale In</div>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg mx-auto"></div>
                </div>
                <div className="glass-premium p-4 rounded-xl text-center">
                  <div className="text-sm font-medium text-auto-high mb-2">Float</div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg mx-auto animate-float"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Indicators */}
          <Card className="glass-auto hover-sophisticated mb-12">
            <CardHeader>
              <CardTitle className="text-auto-high">Status & Messages</CardTitle>
              <CardDescription className="text-auto-medium">
                Auto-styled status indicators and message components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Success Message */}
              <div className="success-auto">
                <CheckCircle2 className="w-4 h-4 inline mr-2" />
                Success! All tests are passing.
              </div>

              {/* Error Message */}
              <div className="error-auto">
                <span className="font-medium">Error:</span> This is a sample error message for testing.
              </div>

              {/* Status Indicators */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 status-auto-online"></div>
                  <span className="text-auto-medium text-sm">Online</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2 status-auto-offline"></div>
                  <span className="text-auto-medium text-sm">Offline</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 status-auto-away"></div>
                  <span className="text-auto-medium text-sm">Away</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 status-auto-busy"></div>
                  <span className="text-auto-medium text-sm">Busy</span>
                </div>
              </div>

              {/* Skeleton Loading */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-auto-high">Loading States:</div>
                <div className="skeleton-auto h-4 w-3/4"></div>
                <div className="skeleton-auto h-4 w-1/2"></div>
                <div className="skeleton-auto h-4 w-2/3"></div>
              </div>
            </CardContent>
          </Card>

          {/* Code Block Example */}
          <Card className="glass-auto hover-sophisticated">
            <CardHeader>
              <CardTitle className="text-auto-high">Code Block</CardTitle>
              <CardDescription className="text-auto-medium">
                Auto-styled code blocks with dark mode support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="code-auto">
                <div className="text-green-500">{`// Example CSS classes`}</div>
                <div>{`.text-auto-high { color: rgb(var(--text-high-contrast)); }`}</div>
                <div>{`.glass-auto { backdrop-filter: blur(20px); }`}</div>
                <div>{`.btn-premium { background: linear-gradient(...); }`}</div>
              </div>
            </CardContent>
          </Card>

          {/* Back to Dashboard */}
          <div className="text-center mt-12">
            <Link href="/">
              <Button className="btn-premium px-8">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
