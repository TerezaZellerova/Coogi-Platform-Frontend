'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Search } from 'lucide-react'

interface CandidateSearchFormProps {
  onSearchAction: (params: {
    job_title: string
    location?: string
    domain?: string
    company_size?: string
    limit?: number
  }) => void
  isLoading: boolean
}

export default function CandidateSearchForm({ onSearchAction, isLoading }: CandidateSearchFormProps) {
  const [jobTitle, setJobTitle] = useState('')
  const [location, setLocation] = useState('')
  const [domain, setDomain] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [limit, setLimit] = useState(10)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!jobTitle.trim()) {
      alert('Please enter a job title')
      return
    }

    onSearchAction({
      job_title: jobTitle.trim(),
      location: location.trim() || undefined,
      domain: domain.trim() || undefined,
      company_size: companySize || undefined,
      limit
    })
  }

  const handleReset = () => {
    setJobTitle('')
    setLocation('')
    setDomain('')
    setCompanySize('')
    setLimit(10)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search Job Candidates
        </CardTitle>
        <CardDescription>
          Find qualified candidates using Apollo.io's professional database
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Job Title - Required */}
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title *</Label>
            <Input
              id="jobTitle"
              type="text"
              placeholder="e.g., Software Engineer, Marketing Manager"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
            />
          </div>

          {/* Location - Optional */}
          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              type="text"
              placeholder="e.g., San Francisco, New York, Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Company Domain - Optional */}
          <div className="space-y-2">
            <Label htmlFor="domain">Company Domain (Optional)</Label>
            <Input
              id="domain"
              type="text"
              placeholder="e.g., google.com, microsoft.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </div>

          {/* Company Size - Optional */}
          <div className="space-y-2">
            <Label htmlFor="companySize">Company Size (Optional)</Label>
            <select
              id="companySize"
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select company size</option>
              <option value="startup">Startup (1-10 employees)</option>
              <option value="small">Small (11-50 employees)</option>
              <option value="medium">Medium (51-250 employees)</option>
              <option value="large">Large (251-1000 employees)</option>
              <option value="enterprise">Enterprise (1000+ employees)</option>
            </select>
          </div>

          {/* Results Limit */}
          <div className="space-y-2">
            <Label htmlFor="limit">Number of Results</Label>
            <select
              id="limit"
              value={limit.toString()}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="5">5 candidates</option>
              <option value="10">10 candidates</option>
              <option value="15">15 candidates</option>
              <option value="20">20 candidates</option>
              <option value="25">25 candidates</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading || !jobTitle.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search Candidates
                </>
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset
            </Button>
          </div>
        </form>

        {/* Search Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Search Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use specific job titles for better results (e.g., "Senior React Developer" vs "Developer")</li>
            <li>• Add location to find local candidates or use "Remote" for remote workers</li>
            <li>• Use company domain to target specific organizations or competitors</li>
            <li>• Apollo.io searches through 275M+ professional profiles</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
