'use client';

import CoogiEmailIntelligence from '@/components/CoogiEmailIntelligence';

export default function EmailIntelligencePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmMWY1ZjkiIGZpbGwtb3BhY2l0eT0iMC4zIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
      
      {/* Gradient Aura */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
      
      <div className="relative container mx-auto px-4 py-8">
        <CoogiEmailIntelligence />
      </div>
    </div>
  );
}
