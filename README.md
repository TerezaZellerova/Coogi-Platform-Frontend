# COOGI Frontend

A modern Next.js dashboard for the COOGI lead generation platform.

## Features

- **Modern UI**: Built with Next.js 14, TypeScript, Tailwind CSS, and Shadcn/ui components
- **Authentication**: Login/signup flow with local storage authentication
- **Agent Management**: Create, monitor, and manage lead generation agents
- **Campaign Integration**: View and manage Instantly.ai email campaigns
- **Real-time Stats**: Dashboard with live metrics and performance indicators
- **Responsive Design**: Mobile-first responsive design for all devices

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui (built on Radix UI)
- **Icons**: Lucide React
- **Charts**: Recharts (for future analytics)
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your actual values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://dbtdplhlatnlzcvdvptn.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   NEXT_PUBLIC_RAILWAY_API=https://coogi-2-production.up.railway.app
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Dashboard (main page)
│   ├── components/
│   │   └── ui/                # Reusable UI components
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── table.tsx
│   │       └── tabs.tsx
│   └── lib/
│       ├── api.ts             # API client and endpoints
│       └── utils.ts           # Utility functions
├── .env.example               # Environment variables template
├── package.json
└── README.md
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## API Integration

The frontend integrates with the COOGI backend through the API client (`src/lib/api.ts`):

### Key Features:
- **Agent Management**: Create, read, update, delete agents
- **Dashboard Stats**: Real-time metrics and performance data
- **Authentication**: Login/signup with token management
- **Campaign Data**: Integration with Instantly.ai campaigns

### API Endpoints:
- `GET /agents` - Fetch all agents
- `POST /agents` - Create new agent
- `PATCH /agents/{id}` - Update agent
- `DELETE /agents/{id}` - Delete agent
- `POST /start-agent` - Start a new agent search

## Authentication Flow

1. **Login/Signup**: Users authenticate via forms
2. **Token Storage**: JWT tokens stored in localStorage
3. **Route Protection**: Dashboard checks authentication on load
4. **Auto-redirect**: Unauthenticated users redirected to login

## Component Architecture

### UI Components (Shadcn/ui)
- **Badge**: Status indicators for agents and campaigns
- **Button**: Interactive elements with variants
- **Card**: Content containers with headers
- **Input**: Form input fields
- **Table**: Data display for campaigns and leads
- **Tabs**: Navigation between dashboard sections

### Pages
- **Dashboard** (`page.tsx`): Main interface with stats, agents, campaigns
- **Login** (`login/page.tsx`): Authentication form
- **Signup** (`signup/page.tsx`): Registration form

## Styling

The app uses a modern design system with:
- **Color Scheme**: Purple/pink gradients with neutral backgrounds
- **Typography**: Inter font family
- **Layout**: CSS Grid and Flexbox
- **Responsiveness**: Mobile-first responsive design
- **Dark Mode**: Built-in dark mode support

## Development Notes

### Current Status:
- ✅ Basic dashboard with mock data
- ✅ Authentication flow
- ✅ Agent management UI
- ✅ Campaign display
- ✅ API client structure

### Next Steps:
1. **Connect Real APIs**: Replace mock data with actual backend calls
2. **Lead Management**: Build detailed lead database interface
3. **Real-time Updates**: Add WebSocket or polling for live data
4. **Analytics**: Add charts and detailed performance metrics
5. **Settings**: User preferences and configuration pages

### Known Issues:
- Badge component import issue (resolved by clearing cache)
- TypeScript strict mode may require additional type definitions
- Environment variables need to be properly configured

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Docker containers

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure TypeScript compilation passes
4. Test responsiveness and functionality
5. Submit a pull request

## License

This project is part of the COOGI lead generation platform.
