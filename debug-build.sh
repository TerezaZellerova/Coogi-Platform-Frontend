#!/bin/bash
set -e

echo "🔍 Debugging Netlify Build Issue"
echo "================================"

echo "📋 Environment:"
echo "Node: $(node --version)"
echo "NPM: $(npm --version)"
echo "Working Directory: $(pwd)"

echo -e "\n📂 Directory Structure:"
ls -la

echo -e "\n🔍 Checking critical files:"
echo "- package.json exists: $(test -f package.json && echo "✅" || echo "❌")"
echo "- tsconfig.json exists: $(test -f tsconfig.json && echo "✅" || echo "❌")"
echo "- next.config.js exists: $(test -f next.config.js && echo "✅" || echo "❌")"

echo -e "\n🔍 Checking UI components:"
test -f src/components/ui/card.tsx && echo "✅ card.tsx" || echo "❌ card.tsx"
test -f src/components/ui/button.tsx && echo "✅ button.tsx" || echo "❌ button.tsx"
test -f src/components/ui/badge.tsx && echo "✅ badge.tsx" || echo "❌ badge.tsx"
test -f src/components/ui/scroll-area.tsx && echo "✅ scroll-area.tsx" || echo "❌ scroll-area.tsx"

echo -e "\n🔍 Checking lib files:"
test -f src/lib/api-production.ts && echo "✅ api-production.ts" || echo "❌ api-production.ts"
test -f src/lib/utils.ts && echo "✅ utils.ts" || echo "❌ utils.ts"

echo -e "\n🔍 Checking problematic import in agents/[id]/page.tsx:"
if test -f "src/app/agents/[id]/page.tsx"; then
    echo "✅ File exists"
    echo "First few imports:"
    head -10 "src/app/agents/[id]/page.tsx" | grep "import"
else
    echo "❌ File not found"
fi

echo -e "\n📦 Installing dependencies..."
npm ci

echo -e "\n🔨 Running build..."
npm run build
