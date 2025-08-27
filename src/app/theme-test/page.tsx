'use client'

import { ThemeToggle } from '@/components/theme-toggle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTheme } from '@/components/theme-provider'

export default function ThemeTestPage() {
  const { theme, actualTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Theme Test Page</h1>
            <p className="text-muted-foreground mt-2">
              Current theme: {theme} (actual: {actualTheme})
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-card-foreground">Light/Dark Mode Test</CardTitle>
              <CardDescription>
                This card should be clearly visible in both light and dark modes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Test Input</label>
                  <Input placeholder="Type something here..." className="mt-1" />
                </div>
                <div className="flex gap-2">
                  <Button variant="default">Primary Button</Button>
                  <Button variant="secondary">Secondary Button</Button>
                  <Button variant="outline">Outline Button</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-card-foreground">Color Swatches</CardTitle>
              <CardDescription>
                CSS variables should change between themes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="w-full h-12 bg-background border border-border rounded flex items-center justify-center">
                    <span className="text-foreground text-sm">Background</span>
                  </div>
                  <div className="w-full h-12 bg-card border border-border rounded flex items-center justify-center">
                    <span className="text-card-foreground text-sm">Card</span>
                  </div>
                  <div className="w-full h-12 bg-primary rounded flex items-center justify-center">
                    <span className="text-primary-foreground text-sm">Primary</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-12 bg-secondary rounded flex items-center justify-center">
                    <span className="text-secondary-foreground text-sm">Secondary</span>
                  </div>
                  <div className="w-full h-12 bg-muted rounded flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Muted</span>
                  </div>
                  <div className="w-full h-12 bg-accent rounded flex items-center justify-center">
                    <span className="text-accent-foreground text-sm">Accent</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-card-foreground">Text Visibility Test</CardTitle>
            <CardDescription>
              All text should be clearly readable
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-foreground">
                This is primary text using text-foreground class.
              </p>
              <p className="text-muted-foreground">
                This is muted text using text-muted-foreground class.
              </p>
              <p className="text-card-foreground">
                This is card text using text-card-foreground class.
              </p>
              <div className="bg-primary text-primary-foreground p-4 rounded">
                This text is on a primary background.
              </div>
              <div className="bg-secondary text-secondary-foreground p-4 rounded">
                This text is on a secondary background.
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-muted-foreground">
            Toggle between light and dark modes using the button in the top right.
            All elements should remain visible and readable.
          </p>
        </div>
      </div>
    </div>
  )
}
