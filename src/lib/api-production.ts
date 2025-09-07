// Main API Export - Provides unified access to all API functionality
// This replaces the large api-production.ts file with a modular structure
//
// 📁 MODULAR STRUCTURE (Already Created):
// ├── api-types.ts      (398 lines) - All TypeScript interfaces, types, constants
// ├── api-agents.ts     (316 lines) - Progressive agent methods, WebSocket, polling
// ├── api-client.ts     (900 lines) - Core client, auth, CRUD, SES, campaigns
// └── api-production.ts (this file) - Clean re-exports for backward compatibility
//
// 🔄 USAGE: Import from this file maintains all existing functionality
// Example: import { apiClient, type Agent, type Campaign } from '@/lib/api-production'
//
// 🤖 AI AGENTS: Use the individual files above for editing specific functionality
// - Need to add types? → Edit api-types.ts
// - Need agent methods? → Edit api-agents.ts  
// - Need core client features? → Edit api-client.ts

export { apiClient } from './api-client'
export { ProgressiveAgentAPI } from './api-agents'
export type * from './api-types'

// Re-export for backward compatibility
export { apiClient as default } from './api-client'
