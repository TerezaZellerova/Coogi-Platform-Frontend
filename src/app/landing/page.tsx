'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle-clean'
import { CoogiLogo } from '@/components/ui/coogi-logo'
import { useCountUp } from '@/hooks/use-count-up'
import LiveDemo from '@/components/LiveDemo'

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
  const leadsCount = useCountUp(2500000, 2000, 200)
  const successCount = useCountUp(94, 1800, 400)
  const companiesCount = useCountUp(10000, 2200, 600)
  const hoursCount = useCountUp(500, 2000, 800)

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
      title: "Lightning Speed",
      description: "AI-powered lead generation in minutes, not hours. Our engineered approach delivers results at unprecedented velocity."
    },
    {
      title: "Precision Targeting", 
      description: "Find the exact prospects your business needs. Advanced algorithms ensure every lead matches your ideal customer profile."
    },
    {
      title: "Enterprise Security",
      description: "Bank-grade security for your sensitive data. SOC 2 compliant infrastructure with end-to-end encryption."
    },
    {
      title: "Smart Automation",
      description: "Intelligent workflows that work while you sleep. Set your parameters once, then watch qualified leads flow in automatically."
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
        className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/20"
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <CoogiLogo size="md" />
          </motion.div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="sm"
              className="text-sm font-medium"
              onClick={() => router.push('/login')}
            >
              Sign In
            </Button>
            <Button 
              size="sm" 
              className="text-sm font-medium px-4 premium-gradient"
              onClick={() => router.push('/signup')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="gradient-aura" />
        <motion.div 
          ref={heroRef}
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="container mx-auto text-center relative z-10"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-5xl mx-auto leading-tight"
          >
            Generate Premium Leads
            <motion.span 
              variants={itemVariants}
              className="block text-transparent bg-clip-text premium-gradient"
            >
              with AI Precision
            </motion.span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Transform your business with intelligent lead generation that finds, validates, and delivers high-quality prospects automatically.
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              size="lg" 
              className="text-base px-8 py-3 premium-gradient"
              onClick={() => router.push('/signup')}
            >
              Start Free Trial
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-base px-8 py-3 glass-card"
              onClick={() => router.push('/login')}
            >
              Watch Demo
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 px-6">
        <motion.div 
          initial="hidden"
          animate={statsInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="container mx-auto"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-center mb-16"
          >
            Trusted by thousands of companies worldwide
          </motion.h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 max-w-6xl mx-auto">
            <motion.div variants={itemVariants} className="text-center">
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-3 tracking-tight leading-none">
                {leadsCount.count.toLocaleString()}<span className="ml-4 text-primary/80">+</span>
              </div>
              <p className="text-muted-foreground font-medium text-sm md:text-base">Leads Generated</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="text-center">
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-3 tracking-tight leading-none">
                {successCount.count}<span className="ml-3 text-primary/80">%</span>
              </div>
              <p className="text-muted-foreground font-medium text-sm md:text-base">Success Rate</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="text-center">
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-3 tracking-tight leading-none">
                {companiesCount.count.toLocaleString()}<span className="ml-4 text-primary/80">+</span>
              </div>
              <p className="text-muted-foreground font-medium text-sm md:text-base">Companies Served</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="text-center">
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-3 tracking-tight leading-none">
                {hoursCount.count}<span className="ml-4 text-primary/80">+</span>
              </div>
              <p className="text-muted-foreground font-medium text-sm md:text-base">Time Saved</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Values Section */}
      <section ref={valuesRef} className="py-20 px-6 bg-muted/10">
        <motion.div 
          initial="hidden"
          animate={valuesInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="container mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to dominate your market with precision lead generation
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="glass-card p-8 card-border group hover:shadow-lg transition-all duration-300"
              >
                <h3 className="text-xl font-semibold mb-4 group-hover:text-primary transition-colors ink-underline">
                  {value.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Parallax Section */}
      <section ref={screensRef} className="py-20 px-6 relative overflow-hidden">
        <motion.div 
          style={{ y: parallaxY }}
          className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"
        />
        <motion.div 
          initial="hidden"
          animate={screensInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="container mx-auto text-center relative z-10"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            See it in action
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto"
          >
            Watch how Coogi transforms your prospecting workflow from manual research to automated precision
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="parallax-frame mx-auto max-w-6xl"
          >
            <LiveDemo />
          </motion.div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section ref={testimonialsRef} className="py-20 px-6">
        <motion.div 
          initial="hidden"
          animate={testimonialsInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="container mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Leaders
            </h2>
            <p className="text-lg text-muted-foreground">
              See what industry leaders say about Coogi
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="glass-card p-8 card-border text-center"
              >
                <p className="text-muted-foreground mb-6 italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary text-primary-foreground">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="container mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Lead Generation?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of companies already using Coogi to generate premium leads automatically.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-base px-8 py-3 font-medium"
            onClick={() => router.push('/signup')}
          >
            Contact Sales
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 py-12 px-6">
        <div className="container mx-auto text-center text-muted-foreground">
          <p className="mb-2 font-medium">Coogi</p>
          <p className="text-sm">Premium AI-Powered Lead Generation Platform</p>
          <p className="text-xs mt-4">&copy; 2025 Coogi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
