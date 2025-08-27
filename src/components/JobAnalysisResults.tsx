'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Building2, 
  ExternalLink, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Briefcase,
  MapPin,
  Clock,
  TrendingUp,
  Mail,
  Link,
  Zap
} from 'lucide-react'
import { JobSearchResults, CompanyAnalysis } from '@/lib/api-production'

interface JobAnalysisResultsProps {
  results: JobSearchResults
  onClose?: () => void
}

export default function JobAnalysisResults({ results, onClose }: JobAnalysisResultsProps) {
  // Get job source statistics
  const getJobSourceStats = () => {
    const sources: Record<string, number> = {}
    results.companies_analyzed.forEach(company => {
      const source = company.job_source || 'Unknown'
      sources[source] = (sources[source] || 0) + 1
    })
    return sources
  }

  const getJobSourceBadge = (jobSource: string) => {
    const source = jobSource.toLowerCase()
    
    if (source.includes('linkedin') && source.includes('rapidapi')) {
      return (
        <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
          <Link className="w-3 h-3 mr-1" />
          LinkedIn Pro
        </Badge>
      )
    } else if (source.includes('linkedin')) {
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-600 font-medium">
          <Link className="w-3 h-3 mr-1" />
          LinkedIn
        </Badge>
      )
    } else if (source.includes('indeed')) {
      return (
        <Badge variant="outline" className="border-indigo-500 text-indigo-600 font-medium">
          <Briefcase className="w-3 h-3 mr-1" />
          Indeed
        </Badge>
      )
    } else if (source.includes('glassdoor')) {
      return (
        <Badge variant="outline" className="border-green-500 text-green-600 font-medium">
          <Building2 className="w-3 h-3 mr-1" />
          Glassdoor
        </Badge>
      )
    } else if (source.includes('zip_recruiter')) {
      return (
        <Badge variant="outline" className="border-purple-500 text-purple-600 font-medium">
          <Zap className="w-3 h-3 mr-1" />
          ZipRecruiter
        </Badge>
      )
    } else {
      return (
        <Badge variant="secondary" className="font-medium">
          <Building2 className="w-3 h-3 mr-1" />
          {jobSource}
        </Badge>
      )
    }
  }

  const getRecommendationBadge = (recommendation: string) => {
    if (recommendation.toLowerCase().includes('target') || recommendation.toLowerCase().includes('process')) {
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">
          <CheckCircle className="w-3 h-3 mr-1" />
          Target
        </Badge>
      )
    } else if (recommendation.toLowerCase().includes('skip')) {
      return (
        <Badge variant="outline" className="border-red-500 text-red-600">
          <XCircle className="w-3 h-3 mr-1" />
          Skip
        </Badge>
      )
    } else {
      return (
        <Badge variant="secondary">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Review
        </Badge>
      )
    }
  }

  const sourceStats = getJobSourceStats()
  const targetCompanies = results.companies_analyzed.filter(c => 
    c.recommendation.toLowerCase().includes('target') || 
    c.recommendation.toLowerCase().includes('process')
  )

  return (
    <div className="space-y-6">
      {/* Header with key stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Job Analysis Results</h2>
          <p className="text-muted-foreground mt-1">
            Found {results.companies_analyzed.length} companies from {results.jobs_found} jobs
          </p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close Results
          </Button>
        )}
      </div>

      {/* Job Source Overview */}
      <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <TrendingUp className="w-5 h-5" />
            Job Sources Overview
          </CardTitle>
          <CardDescription>Distribution of jobs by source platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(sourceStats).map(([source, count]) => (
              <div key={source} className="text-center p-3 rounded-lg bg-white/60 dark:bg-slate-800/60">
                <div className="mb-2">{getJobSourceBadge(source)}</div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{count}</div>
                <div className="text-xs text-muted-foreground">companies</div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Link className="w-4 h-4 text-blue-600" />
              <span className="font-medium">LinkedIn Pro (RapidAPI)</span>
              <span className="text-muted-foreground">provides enhanced job data and company insights</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{targetCompanies.length}</div>
            <div className="text-sm text-muted-foreground">Target Companies</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{results.jobs_found}</div>
            <div className="text-sm text-muted-foreground">Total Jobs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {results.companies_analyzed.reduce((sum, c) => sum + c.contacts_found, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Contacts Found</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{results.leads_added || 0}</div>
            <div className="text-sm text-muted-foreground">Leads Added</div>
          </CardContent>
        </Card>
      </div>

      {/* Company Analysis Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Company Analysis ({results.companies_analyzed.length})
          </CardTitle>
          <CardDescription>
            Detailed analysis of each company with job sources and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {results.companies_analyzed.map((company, index) => (
                <Card key={index} className="border border-slate-200 dark:border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-foreground">{company.company}</h3>
                          {getJobSourceBadge(company.job_source)}
                          {getRecommendationBadge(company.recommendation)}
                        </div>
                        <p className="text-muted-foreground font-medium">{company.job_title}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span>{company.contacts_found} contacts found</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-green-500" />
                        <span>TA Team: {company.has_ta_team ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span>{new Date(company.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {company.company_website && (
                      <div className="flex items-center gap-2 text-sm mt-2">
                        <ExternalLink className="w-4 h-4 text-blue-500" />
                        <a 
                          href={`https://${company.company_website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {company.company_website}
                        </a>
                      </div>
                    )}

                    {company.job_url && (
                      <div className="mt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => window.open(company.job_url, '_blank')}
                          className="text-xs"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Job Posting
                        </Button>
                      </div>
                    )}

                    {company.top_contacts && company.top_contacts.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="text-sm font-medium mb-2">Key Contacts:</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {company.top_contacts.slice(0, 4).map((contact, idx) => (
                            <div key={idx} className="text-sm p-2 rounded bg-slate-50 dark:bg-slate-800">
                              <div className="font-medium">{contact.name}</div>
                              <div className="text-muted-foreground text-xs">{contact.title}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
