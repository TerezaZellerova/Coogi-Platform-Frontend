#!/bin/bash
# Test script to verify Netlify deployment environment

echo "🔍 NETLIFY DEPLOYMENT DEBUG SCRIPT"
echo "=================================="

echo "📁 Current directory: $(pwd)"
echo "📅 Date: $(date)"

echo -e "\n📋 Environment Files:"
ls -la .env* 2>/dev/null || echo "No .env files found"

echo -e "\n🔧 Environment Variables (simulating Netlify):"
export NODE_ENV=production
export NEXT_PUBLIC_SUPABASE_URL=https://wbpuumoitoftzfqznwnq.supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndicHV1bW9pdG9mdHpmcXpud25xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NDMxOTAsImV4cCI6MjA3MTIxOTE5MH0.wGWX3j4zCfLSGSNZBtKR8EoIjjfSVjY8VL1nY9_zlNs
export NEXT_PUBLIC_API_BASE=https://coogi-backend-7yca.onrender.com

echo "✅ NODE_ENV: $NODE_ENV"
echo "✅ NEXT_PUBLIC_API_BASE: $NEXT_PUBLIC_API_BASE"
echo "✅ NEXT_PUBLIC_SUPABASE_URL: $(echo $NEXT_PUBLIC_SUPABASE_URL | cut -c1-30)..."

echo -e "\n🏗️  Building with Netlify environment..."
npm run build

echo -e "\n🧪 Testing API connection from built app..."
node -e "
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'NOT_SET';
console.log('🔗 API Base from env:', API_BASE);

if (API_BASE !== 'NOT_SET') {
  console.log('🌐 Testing connection...');
  fetch(API_BASE + '/health')
    .then(res => res.json())
    .then(data => {
      console.log('✅ Backend health:', data.status);
      console.log('🔧 Demo mode:', data.demo_mode);
    })
    .catch(err => console.error('❌ Connection failed:', err.message));
} else {
  console.log('❌ API_BASE not set!');
}
"

echo -e "\n✅ Debug script completed!"
