# Resource Booking System - Folder Structure

## 📁 Project Organization

\`\`\`
src/
├── app/                          # Next.js App Router
│   ├── globals.css              # Global styles with Tailwind v4
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Main dashboard page
│   └── api/                     # API routes (mock endpoints)
│       └── bookings/
│           ├── route.ts         # GET/POST bookings
│           └── [id]/
│               └── route.ts     # DELETE/PUT booking by ID
│
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── badge.tsx
│   │   ├── alert.tsx
│   │   ├── separator.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── progress.tsx
│   │   ├── label.tsx
│   │   └── sidebar.tsx
│   │
│   ├── layout/                  # Layout components
│   │   ├── app-sidebar.tsx      # Main navigation sidebar
│   │   └── dashboard-content.tsx # Content wrapper with routing
│   │
│   ├── pages/                   # Page components
│   │   ├── overview-page.tsx    # Dashboard overview
│   │   ├── calendar-page.tsx    # Weekly calendar view
│   │   ├── bookings-page.tsx    # All bookings list
│   │   ├── resources-page.tsx   # Resource management
│   │   ├── new-booking-page.tsx # Create new booking
│   │   └── settings-page.tsx    # System settings
│   │
│   ├── forms/                   # Form components
│   │   └── booking-form.tsx     # Booking creation form
│   │
│   ├── dashboard/               # Dashboard-specific components
│   │   └── booking-dashboard.tsx # Booking management dashboard
│   │
│   └── providers/               # Context providers
│       └── providers.tsx        # Redux store provider
│
├── lib/                         # Utility libraries
│   ├── api/                     # API layer
│   │   └── bookingApi.ts        # RTK Query API definitions
│   │
│   ├── store/                   # Redux store
│   │   └── store.ts             # Store configuration
│   │
│   ├── types/                   # TypeScript types
│   │   └── booking.ts           # Booking-related types
│   │
│   ├── utils/                   # Utility functions
│   │   └── utils.ts             # Common utilities (cn, validation, etc.)
│   │
│   └── constants/               # Application constants
│       └── resources.ts         # Resource definitions and rules
│
├── hooks/                       # Custom React hooks
│   └── use-mobile.tsx           # Mobile detection hook
│
└── styles/                      # Additional styles (if needed)
\`\`\`

## 🎯 Key Features

### ✨ Modern Tech Stack
- **Next.js 15** with App Router
- **React 19** with latest features
- **Tailwind CSS v4** with CSS-first configuration
- **TypeScript** for type safety
- **Redux Toolkit Query** for state management
- **shadcn/ui** for component library

### 🎨 Design System
- **Black & White Theme** with sophisticated gradients
- **Glass Morphism** effects
- **Responsive Design** for all devices
- **Dark Mode Support** with automatic switching
- **Smooth Animations** and micro-interactions

### 🚀 Features
- **Resource Booking** with conflict detection
- **Weekly Calendar View** with drag-and-drop feel
- **Real-time Updates** with optimistic UI
- **Buffer Time Management** (10-minute automatic buffer)
- **Duration Limits** (15 minutes to 2 hours)
- **Mobile-First Design** with touch-friendly interactions

### 📱 Pages
1. **Overview** - Dashboard with stats and recent bookings
2. **Calendar** - Weekly grid view with time slots
3. **All Bookings** - Filterable list of all bookings
4. **Resources** - Resource utilization and statistics
5. **New Booking** - Create booking with validation
6. **Settings** - System configuration and rules

## 🔧 Development

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
\`\`\`

## 📦 Dependencies

### Core
- `next@15.0.0` - React framework
- `react@19` - UI library
- `typescript@5` - Type safety

### State Management
- `@reduxjs/toolkit@2.0.1` - State management
- `react-redux@9.0.4` - React bindings for Redux

### UI Components
- `@radix-ui/*` - Headless UI primitives
- `lucide-react@0.294.0` - Icon library
- `class-variance-authority@0.7.0` - Component variants
- `clsx@2.0.0` & `tailwind-merge@2.2.0` - Utility classes

### Styling
- `tailwindcss@4.0.0` - CSS framework

## 🎨 Styling Architecture

### Tailwind v4 Features
- **CSS-first configuration** in `globals.css`
- **Custom design tokens** with `@theme` directive
- **Advanced animations** with CSS custom properties
- **Glass morphism utilities** for modern effects
- **Responsive design** with container queries

### Color System
- **Monochromatic palette** with gray variations
- **High contrast ratios** for accessibility
- **Dark mode support** with CSS custom properties
- **Semantic color naming** for consistency

## 🔒 Type Safety

All components are fully typed with TypeScript:
- **Booking interfaces** with validation
- **API response types** for RTK Query
- **Component prop types** with proper inference
- **Utility function types** for better DX
\`\`\`

Now let me update the main layout to ensure all imports are correct:
