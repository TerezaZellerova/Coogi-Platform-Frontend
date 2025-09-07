'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  ExternalLink, 
  Mail, 
  MapPin, 
  Building, 
  User, 
  Briefcase,
  Plus,
  Phone,
  Globe
} from 'lucide-react'

interface Candidate {
  name: string
  first_name: string
  last_name: string
  email: string
  title: string
  company: string
  domain: string
  location: string
  linkedin_url: string
  phone: string
  seniority: string
  departments: string[]
  functions: string[]
  email_status: string
  apollo_id: string
  source: string
}

interface CandidateResultsListProps {
  candidates: Candidate[]
  isLoading: boolean
  onAttachToJob?: (candidate: Candidate) => void
  showAttachButton?: boolean
}

export default function CandidateResultsList({ 
  candidates, 
  isLoading, 
  onAttachToJob, 
  showAttachButton = false 
}: CandidateResultsListProps) {
  
  const getSeniorityColor = (seniority: string) => {
    switch (seniority?.toLowerCase()) {
      case 'senior': return 'bg-purple-100 text-purple-800'
      case 'entry': return 'bg-green-100 text-green-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'director': return 'bg-orange-100 text-orange-800'
      case 'vp': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEmailStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'verified': return 'bg-green-100 text-green-800'
      case 'guessed': return 'bg-yellow-100 text-yellow-800'
      case 'unavailable': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2 text-gray-600">Searching candidates...</span>
        </CardContent>
      </Card>
    )
  }

  if (candidates.length === 0) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
          <p className="text-gray-600">Try adjusting your search criteria to find more candidates.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Candidate Search Results
        </CardTitle>
        <CardDescription>
          Found {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} matching your criteria
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name & Contact</TableHead>
                <TableHead>Title & Company</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Email Status</TableHead>
                <TableHead>Links</TableHead>
                {showAttachButton && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate, index) => (
                <TableRow key={`${candidate.apollo_id}-${index}`}>
                  {/* Name & Contact */}
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{candidate.name}</div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Mail className="h-3 w-3" />
                        {candidate.email === 'email_not_unlocked@domain.com' 
                          ? 'Email available (unlock required)' 
                          : candidate.email}
                      </div>
                      {candidate.phone && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          {candidate.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Title & Company */}
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{candidate.title}</div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Building className="h-3 w-3" />
                        {candidate.company}
                      </div>
                      {candidate.domain && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Globe className="h-3 w-3" />
                          {candidate.domain}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Location */}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">{candidate.location || 'N/A'}</span>
                    </div>
                  </TableCell>

                  {/* Experience */}
                  <TableCell>
                    <div className="space-y-2">
                      <Badge className={getSeniorityColor(candidate.seniority)}>
                        {candidate.seniority || 'Unknown'}
                      </Badge>
                      {candidate.functions.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {candidate.functions.slice(0, 2).map((func, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {func.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                          {candidate.functions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{candidate.functions.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Email Status */}
                  <TableCell>
                    <Badge className={getEmailStatusColor(candidate.email_status)}>
                      {candidate.email_status || 'Unknown'}
                    </Badge>
                  </TableCell>

                  {/* Links */}
                  <TableCell>
                    <div className="flex gap-2">
                      {candidate.linkedin_url && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(candidate.linkedin_url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          LinkedIn
                        </Button>
                      )}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  {showAttachButton && (
                    <TableCell>
                      <Button 
                        size="sm" 
                        onClick={() => onAttachToJob?.(candidate)}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Attach to Job
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Search Summary */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="font-medium">Search powered by Apollo.io</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-600">{candidates.length} results shown</span>
            </div>
            <div className="text-gray-600">
              Data from 275M+ professional profiles
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
