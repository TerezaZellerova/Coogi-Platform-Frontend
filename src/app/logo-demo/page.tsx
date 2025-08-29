'use client'

import { CoogiLogo } from '@/components/ui/coogi-logo'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'

export default function LogoDemo() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Coogi Logo Demo</h1>
          <ThemeToggle />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Different Sizes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Small</p>
                <CoogiLogo size="sm" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Medium</p>
                <CoogiLogo size="md" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Large</p>
                <CoogiLogo size="lg" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Extra Large</p>
                <CoogiLogo size="xl" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Icon Only</p>
                <CoogiLogo size="md" iconOnly />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Without Text</p>
                <CoogiLogo size="md" showText={false} />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Full Logo</p>
                <CoogiLogo size="md" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dark Mode Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                Toggle dark mode with the button above to see how the logo adapts.
              </p>
              <CoogiLogo size="lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
