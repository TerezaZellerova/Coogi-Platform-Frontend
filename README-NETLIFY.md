# 🚀 Netlify Deployment Instructions

## ✅ Quick Setup

1. **Build Settings** (in Netlify dashboard):
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/.next`

2. **Environment Variables** (Site Settings → Environment Variables):
   ```
   NEXT_PUBLIC_API_BASE=https://coogi-backend-7yca.onrender.com
   NODE_ENV=production
   
   # Add your actual API keys from local .env.local:
   NEXT_PUBLIC_SUPABASE_URL=your_value_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_value_here
   NEXT_PUBLIC_OPENAI_API_KEY=your_value_here
   NEXT_PUBLIC_HUNTER_API_KEY=your_value_here
   NEXT_PUBLIC_INSTANTLY_API_KEY=your_value_here
   NEXT_PUBLIC_RAPIDAPI_KEY=your_value_here
   NEXT_PUBLIC_APIFY_API_KEY=your_value_here
   ```

3. **Deploy**: 
   - Trigger deploy → Clear cache and deploy site

## 🔒 Security
- No API keys are committed to git
- All secrets managed via Netlify dashboard only
