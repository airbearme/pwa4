# Overview

AirBear is a solar-powered rickshaw ride-sharing application built for Binghamton, NY. The app combines eco-friendly transportation with onboard mobile bodegas, allowing users to book solar-powered rickshaw rides while shopping for items during their journey. The application features a modern React frontend with Express/Node.js backend, real-time capabilities, payment processing through Stripe, and progressive web app (PWA) functionality.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development/build tooling
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom eco-luxury theme (emerald, lime, amber gradients)
- **Animations**: Framer Motion for complex animations and micro-interactions
- **State Management**: TanStack Query for server state, React Context for auth state
- **Routing**: Wouter for lightweight client-side routing
- **PWA Features**: Service worker, manifest file, offline capabilities

## Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with structured route handlers
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Storage**: In-memory storage implementation with interface for easy database swapping
- **Build Process**: ESBuild for production bundling, TSX for development

## Data Storage
- **Database**: PostgreSQL (configured via Drizzle but using in-memory for development)
- **Schema**: Comprehensive schema with users, spots, rickshaws, rides, bodega items, orders, and payments
- **User Roles**: Role-based system (user, driver, admin) with different UI experiences
- **Data Models**: Strongly typed with Zod validation schemas

## Authentication & Authorization
- **Auth Strategy**: Custom implementation with email/password and OAuth support (Google, Apple)
- **Session Management**: Local storage for client-side session persistence
- **Role-Based Access**: Different dashboard views and permissions based on user role
- **Security**: Planned integration with Supabase for production auth

## External Dependencies

- **Payment Processing**: Stripe integration with support for card payments, Apple Pay, Google Pay, and cash (QR code)
- **Maps & Location**: Leaflet for interactive maps with custom rickshaw markers
- **Real-time Features**: Planned Supabase integration for real-time ride updates and inventory management
- **Cloud Storage**: Supabase storage for file uploads (avatars, item images)
- **GitHub Integration**: Octokit client for repository management and deployment
- **Fonts & Icons**: Google Fonts (DM Sans, Inter, Poppins), Font Awesome icons
- **Development Tools**: Replit-specific plugins for development environment integration