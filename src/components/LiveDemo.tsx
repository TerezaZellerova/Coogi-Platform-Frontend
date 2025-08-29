'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Building2, 
  Users, 
  Mail, 
  Briefcase, 
  Clock, 
  CheckCircle, 
  Sparkles,
  ArrowRight,
  Globe,
  MapPin,
  Phone,
  Linkedin,
  Star
} from 'lucide-react'

interface Contact {
  name: string
  role: string
  email: string
  phone?: string
  linkedin?: string
  confidence: number
}

interface JobPosting {
  title: string
  department: string
  location: string
  posted: string
}

interface CompanyInsight {
  name: string
  industry: string
  size: string
  location: string
  website: string
  description: string
  headcount: number
  founded?: string
}

interface DemoResult {
  company: CompanyInsight
  contacts: Contact[]
  jobs: JobPosting[]
  processingTime: number
}

const suggestedCompanies = [
  "Stripe", "Shopify", "Airbnb", "Slack", "Zoom", "Atlassian", "HubSpot", "Salesforce"
]

const mockResults: { [key: string]: DemoResult } = {
  "stripe": {
    company: {
      name: "Stripe",
      industry: "Financial Services",
      size: "1,001-5,000 employees",
      location: "San Francisco, CA",
      website: "stripe.com",
      description: "Financial infrastructure for the internet",
      headcount: 4000,
      founded: "2010"
    },
    contacts: [
      {
        name: "Sarah Chen",
        role: "VP of Engineering",
        email: "s.chen@stripe.com",
        phone: "+1 (555) 123-4567",
        linkedin: "linkedin.com/in/sarahchen",
        confidence: 95
      },
      {
        name: "Michael Rodriguez",
        role: "Head of Business Development",
        email: "m.rodriguez@stripe.com",
        linkedin: "linkedin.com/in/mrodriguez",
        confidence: 88
      },
      {
        name: "Jessica Kim",
        role: "Senior Product Manager",
        email: "j.kim@stripe.com",
        confidence: 92
      },
      {
        name: "David Thompson",
        role: "Director of Sales",
        email: "d.thompson@stripe.com",
        phone: "+1 (555) 987-6543",
        confidence: 90
      }
    ],
    jobs: [
      {
        title: "Senior Software Engineer",
        department: "Engineering",
        location: "San Francisco, CA",
        posted: "2 days ago"
      },
      {
        title: "Product Marketing Manager",
        department: "Marketing",
        location: "Remote",
        posted: "1 week ago"
      },
      {
        title: "Business Development Representative",
        department: "Sales",
        location: "New York, NY",
        posted: "3 days ago"
      }
    ],
    processingTime: 3.2
  },
  "shopify": {
    company: {
      name: "Shopify",
      industry: "E-commerce",
      size: "5,001-10,000 employees",
      location: "Ottawa, Canada",
      website: "shopify.com",
      description: "Commerce platform for businesses of all sizes",
      headcount: 7000,
      founded: "2006"
    },
    contacts: [
      {
        name: "Alex Johnson",
        role: "VP of Partnerships",
        email: "a.johnson@shopify.com",
        phone: "+1 (613) 555-0123",
        linkedin: "linkedin.com/in/alexjohnson",
        confidence: 93
      },
      {
        name: "Maria Garcia",
        role: "Senior Engineering Manager",
        email: "m.garcia@shopify.com",
        confidence: 89
      },
      {
        name: "Robert Lee",
        role: "Head of Enterprise Sales",
        email: "r.lee@shopify.com",
        phone: "+1 (613) 555-0456",
        confidence: 91
      }
    ],
    jobs: [
      {
        title: "Full Stack Developer",
        department: "Engineering",
        location: "Toronto, Canada",
        posted: "4 days ago"
      },
      {
        title: "Partnership Manager",
        department: "Business Development",
        location: "Remote",
        posted: "1 week ago"
      }
    ],
    processingTime: 2.8
  },
  "airbnb": {
    company: {
      name: "Airbnb",
      industry: "Travel & Hospitality",
      size: "5,001-10,000 employees",
      location: "San Francisco, CA",
      website: "airbnb.com",
      description: "Online marketplace for lodging and tourism experiences",
      headcount: 6000,
      founded: "2008"
    },
    contacts: [
      {
        name: "Emily Zhang",
        role: "Director of Product",
        email: "e.zhang@airbnb.com",
        linkedin: "linkedin.com/in/emilyzhang",
        confidence: 94
      },
      {
        name: "James Wilson",
        role: "VP of Engineering",
        email: "j.wilson@airbnb.com",
        phone: "+1 (415) 555-7890",
        confidence: 87
      },
      {
        name: "Lisa Patel",
        role: "Head of Marketing",
        email: "l.patel@airbnb.com",
        confidence: 92
      }
    ],
    jobs: [
      {
        title: "Senior Data Scientist",
        department: "Data Science",
        location: "San Francisco, CA",
        posted: "5 days ago"
      },
      {
        title: "Product Designer",
        department: "Design",
        location: "Remote",
        posted: "1 week ago"
      }
    ],
    processingTime: 3.1
  }
}

export default function LiveDemo() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<DemoResult | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [searchStep, setSearchStep] = useState(0)

  const searchSteps = [
    "Analyzing company profile...",
    "Scanning job postings...",
    "Finding decision makers...",
    "Verifying contact information...",
    "Generating insights..."
  ]

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setShowResults(false)
    setSearchStep(0)

    // Simulate AI processing with step-by-step updates
    for (let i = 0; i < searchSteps.length; i++) {
      setSearchStep(i)
      await new Promise(resolve => setTimeout(resolve, 600))
    }

    // Get mock results based on search query
    const normalizedQuery = searchQuery.toLowerCase().trim()
    const result = mockResults[normalizedQuery] || mockResults["stripe"]

    setResults(result)
    setIsSearching(false)
    setShowResults(true)
  }

  const handleSuggestedCompany = (company: string) => {
    setSearchQuery(company)
    handleSearch()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Search Section */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Try Our Live Lead Generation
          </h3>
          <p className="text-muted-foreground mb-6">
            Enter any company name and watch Coogi find decision makers in real-time
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-md mx-auto mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Enter company name (try: Stripe, Shopify, Airbnb)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-24 h-12 text-lg border-2 border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
              disabled={isSearching}
            />
            <Button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
              className="absolute right-1 top-1 h-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isSearching ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </Button>
          </div>
        </motion.div>

        {/* Suggested Companies */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          {suggestedCompanies.map((company, index) => (
            <Button
              key={company}
              variant="outline"
              size="sm"
              onClick={() => handleSuggestedCompany(company)}
              disabled={isSearching}
              className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              {company}
            </Button>
          ))}
        </motion.div>
      </div>

      {/* Loading Animation */}
      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-12"
          >
            <div className="inline-flex items-center gap-3 bg-white dark:bg-slate-800 px-6 py-4 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
              />
              <span className="text-lg font-medium text-gray-900 dark:text-gray-100">{searchSteps[searchStep]}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {showResults && results && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            {/* Processing Time Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 text-lg border border-green-200 dark:border-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Found in {results.processingTime}s • Powered by Hunter.io, RapidAPI, OpenAI
              </Badge>
            </motion.div>

            {/* Company Insights */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
                    <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    Company Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{results.company.name}</h4>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">{results.company.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">{results.company.website}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">{results.company.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <span className="font-medium text-gray-900 dark:text-gray-100">Employee Count</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{results.company.headcount.toLocaleString()}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{results.company.size}</p>
                      </div>
                      <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-600">
                        {results.company.industry}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contacts Found */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-2 border-green-200 dark:border-green-800 bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
                    <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
                    Decision Makers Found ({results.contacts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.contacts.map((contact, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-green-200 dark:border-green-700 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-semibold text-gray-900 dark:text-gray-100">{contact.name}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{contact.role}</p>
                          </div>
                          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700">
                            {contact.confidence}% match
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{contact.email}</span>
                          </div>
                          {contact.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{contact.phone}</span>
                            </div>
                          )}
                          {contact.linkedin && (
                            <div className="flex items-center gap-2">
                              <Linkedin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">LinkedIn Profile</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Job Postings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-2 border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
                    <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    Recent Job Openings ({results.jobs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {results.jobs.map((job, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700"
                      >
                        <div>
                          <h6 className="font-medium text-gray-900 dark:text-gray-100">{job.title}</h6>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                            <span>{job.department}</span>
                            <span>•</span>
                            <span>{job.location}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                            <Clock className="w-3 h-3" />
                            {job.posted}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center py-8"
            >
              <h4 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Ready to generate leads for your business?</h4>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
