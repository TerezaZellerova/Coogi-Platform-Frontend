'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle-clean'
import { CoogiLogo } from '@/components/ui/coogi-logo'
import { useCountUp } from '@/hooks/use-count-up'
import LiveDemo from '@/components/LiveDemo'
import { ArrowRight, CheckCircle, Target, Zap, Shield, Bot } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const heroRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const valuesRef = useRef<HTMLDivElement>(null)
  const screensRef = useRef<HTMLDivElement>(null)
  const testimonialsRef = useRef<HTMLDivElement>(null)
  
  const heroInView = useInView(heroRef, { once: true })
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" })
  const valuesInView = useInView(valuesRef, { once: true, margin: "-100px" })
  const screensInView = useInView(screensRef, { once: true, margin: "-100px" })
  const testimonialsInView = useInView(testimonialsRef, { once: true, margin: "-100px" })

  const { scrollY } = useScroll()
  const parallaxY = useTransform(scrollY, [0, 1000], [0, -100])

  // Count-up animations for stats
  const leadsCount = useCountUp(25000, 2000, 200)
  const successCount = useCountUp(94, 1800, 400)
  const companiesCount = useCountUp(500, 2200, 600)
  const hoursCount = useCountUp(10000, 2000, 800)

  useEffect(() => {
    if (statsInView) {
      leadsCount.start()
      successCount.start()
      companiesCount.start()
      hoursCount.start()
    }
  }, [statsInView, leadsCount, successCount, companiesCount, hoursCount])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.22
      }
    }
  }

  const values = [
    {
      icon: Zap,
      title: "Lightning Fast Results",
      description: "Get qualified leads in minutes, not weeks. Our AI processes thousands of prospects instantly."
    },
    {
      icon: Target,
      title: "Precision Targeting", 
      description: "Advanced algorithms find prospects that match your exact ideal customer profile with 94% accuracy."
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade security and SOC 2 compliance. Your data stays protected with end-to-end encryption."
    },
    {
      icon: Bot,
      title: "AI-Powered Automation",
      description: "Intelligent workflows that work 24/7. Set your criteria once and watch qualified leads flow in automatically."
    }
  ]

  const testimonials = [
    {
      quote: "Coogi transformed our lead generation completely. We're seeing 300% more qualified prospects.",
      author: "Sarah Chen",
      role: "VP of Sales, TechCorp"
    },
    {
      quote: "The precision targeting is incredible. Every lead feels hand-picked for our business.",
      author: "Michael Rodriguez", 
      role: "Founder, GrowthLabs"
    },
    {
      quote: "Finally, a platform that understands the complexity of enterprise sales cycles.",
      author: "Emily Watson",
      role: "Director of Revenue, ScaleUp"
    }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/10"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <CoogiLogo size="md" />
            </motion.div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#demo" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Demo</a>
              <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="sm"
                className="text-sm font-medium"
                onClick={() => router.push('/login')}
              >
                Sign in
              </Button>
              <Button 
                size="sm" 
                className="text-sm font-medium px-4 rounded-lg"
                onClick={() => router.push('/signup')}
              >
                Get started
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 relative">
        <div className="gradient-aura" />
        <motion.div 
          ref={heroRef}
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="container mx-auto text-center relative z-10 max-w-4xl"
        >
          {/* Badge */}
          <motion.div 
            variants={itemVariants}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
              <CheckCircle className="w-4 h-4" />
              Trusted by 500+ growing companies
            </div>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
          >
            Generate qualified leads
            <span className="block text-primary">
              10x faster with AI
            </span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Transform your sales pipeline with AI-powered lead generation. 
            Find, verify, and engage your ideal prospects automatically.
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button 
              size="lg" 
              className="text-base px-8 py-3 bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-white border-0 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => router.push('/signup')}
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-900">P</span>
                </div>
                Start Free Trial
              </div>
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-base px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => {
                document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[4px] border-l-purple-600 border-t-[2px] border-t-transparent border-b-[2px] border-b-transparent ml-0.5"></div>
                </div>
                Book live demo
              </div>
            </Button>
          </motion.div>

          {/* Social Proof */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap justify-center items-center gap-8 opacity-60"
          >
            <div className="text-sm text-muted-foreground">Trusted by teams at</div>
            <div className="flex items-center gap-6 text-muted-foreground">
              <div className="font-semibold">TechCorp</div>
              <div className="font-semibold">GrowthLabs</div>
              <div className="font-semibold">ScaleUp</div>
              <div className="font-semibold">InnovateCo</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-16 px-6 bg-muted/30">
        <motion.div 
          initial="hidden"
          animate={statsInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="container mx-auto"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <motion.div variants={itemVariants} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {leadsCount.count.toLocaleString()}+
              </div>
              <p className="text-muted-foreground font-medium text-sm">Leads Generated</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {successCount.count}%
              </div>
              <p className="text-muted-foreground font-medium text-sm">Success Rate</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {companiesCount.count}+
              </div>
              <p className="text-muted-foreground font-medium text-sm">Companies</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {hoursCount.count.toLocaleString()}+
              </div>
              <p className="text-muted-foreground font-medium text-sm">Hours Saved</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" ref={valuesRef} className="py-24 px-6">
        <motion.div 
          initial="hidden"
          animate={valuesInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="container mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to scale your sales
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features that help you find, verify, and engage prospects more effectively than ever before.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {values.map((value, index) => {
              const IconComponent = value.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group p-8 rounded-2xl border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg bg-card/50"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </section>

      {/* Demo Section */}
      <section id="demo" ref={screensRef} className="py-24 px-6 bg-muted/30">
        <motion.div 
          initial="hidden"
          animate={screensInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="container mx-auto text-center"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            See Coogi in action
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto"
          >
            Watch how Coogi transforms your prospecting workflow from manual research to automated precision
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="max-w-5xl mx-auto"
          >
            <div className="rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
              <LiveDemo />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" ref={testimonialsRef} className="py-24 px-6">
        <motion.div 
          initial="hidden"
          animate={testimonialsInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="container mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by sales teams worldwide
            </h2>
            <p className="text-lg text-muted-foreground">
              See what industry leaders say about their success with Coogi
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-8 rounded-2xl border border-border/50 bg-card/50 hover:shadow-lg transition-all duration-300"
              >
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="py-20 px-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="container mx-auto text-center max-w-3xl"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to 10x your lead generation?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join 500+ companies already using Coogi to automate their sales pipeline and close more deals.
          </p>
          
          <div className="flex justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="text-base px-8 py-3 font-medium rounded-lg"
              onClick={() => router.push('/signup')}
            >
              Start free trial
            </Button>
          </div>
          
          <p className="text-sm mt-6 opacity-70">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 py-12 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <CoogiLogo size="sm" />
              <div className="text-sm text-muted-foreground">
                AI-powered lead generation platform
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
          
          <div className="border-t border-border/20 mt-8 pt-6 text-center text-xs text-muted-foreground">
            © 2025 Coogi. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
