# Overview

TPT Seller Hub is a comprehensive optimization platform for Teachers Pay Teachers sellers, designed to enhance product visibility and maximize sales through SEO analysis, rank tracking, social content generation, and performance analytics. The application provides an all-in-one solution for managing TPT product listings with AI-powered optimization tools and automated tracking capabilities.

The platform offers product management through CSV imports and manual entry, AI-powered SEO rewriting with scoring, keyword position monitoring, automated social media content generation for Pinterest/Instagram/Facebook, and comprehensive sales analytics. A demo mode allows full functionality testing without requiring API keys.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application uses a **hybrid vanilla JavaScript and React architecture**. The main application structure is built with vanilla JavaScript using Vite as the build tool, while newer components utilize React with TypeScript. This approach allows for progressive modernization while maintaining compatibility with existing code.

The vanilla JavaScript portion implements a single-page application (SPA) pattern with:
- Hash-based routing system for navigation between pages
- Component-based UI structure with reusable modules
- Event-driven architecture for user interactions
- Modular service layer for API integrations

The React portion (in `/client/src/`) uses:
- React with TypeScript for type safety
- Wouter for client-side routing
- TanStack Query for data fetching and caching
- Custom hooks for auth state management

## Database and Authentication
**Supabase** serves as the primary backend service providing:
- PostgreSQL database with Row Level Security (RLS)
- Magic-link email authentication
- Real-time subscriptions capabilities
- File storage for CSV uploads
- Edge Functions for serverless operations

The database schema includes core entities:
- Profiles (user accounts and settings)
- Products (TPT listings and SEO data)
- Keywords (rank tracking targets)
- Ranks (position history)
- Social posts (generated content)
- Sales data (performance metrics)

**Drizzle ORM** is configured for database schema management and migrations, providing type-safe database operations with PostgreSQL dialect support.

## API Integration Strategy
The platform integrates multiple external services with graceful fallback mechanisms:
- **OpenAI GPT-4o** for AI-powered SEO optimization and content generation
- **SerpAPI** for Google search ranking data
- **Chart.js** for analytics visualization
- **Stripe** for subscription billing (configured but not implemented)

All external APIs include demo mode functionality when API keys are unavailable, ensuring the application remains functional during development and testing.

## Development and Build Pipeline
**Vite** serves as the build tool with:
- TypeScript support for type checking
- Hot module replacement for development
- Optimized production builds
- Asset bundling and optimization

The project structure separates client-side code (`/client/src/`), server components (`/server/`), and shared schemas (`/shared/`), enabling clean separation of concerns and potential future microservice extraction.

## State Management and Data Flow
The application employs multiple state management approaches:
- Global app state for user authentication and current product context
- Local component state for UI interactions
- TanStack Query for server state management and caching
- Supabase real-time subscriptions for live data updates

Error handling is implemented through toast notifications and graceful degradation when external services are unavailable.

# External Dependencies

## Core Services
- **Supabase**: Backend-as-a-Service providing authentication, PostgreSQL database, real-time subscriptions, file storage, and Edge Functions
- **OpenAI API**: GPT-4o model for AI-powered SEO optimization and social content generation
- **SerpAPI**: Google search results for keyword ranking data and position tracking

## Development and Build Tools
- **Vite**: Frontend build tool and development server
- **Drizzle Kit**: Database schema management and migrations
- **TypeScript**: Type checking and development tooling
- **Tailwind CSS**: Utility-first styling framework
- **PostCSS**: CSS processing and optimization

## UI and Visualization Libraries
- **React**: Component-based UI framework (for newer features)
- **TanStack Query**: Data fetching and state management
- **Wouter**: Lightweight React router
- **Chart.js**: Data visualization for analytics
- **Radix UI**: Accessible component primitives
- **Font Awesome**: Icon library
- **Papa Parse**: CSV parsing and processing

## Utility Libraries
- **clsx**: Conditional CSS class composition
- **class-variance-authority**: Component variant management
- **nanoid**: Unique identifier generation

## Payment Processing
- **Stripe**: Subscription billing and payment processing (configured for future implementation)

The architecture prioritizes scalability through its modular design, graceful degradation through demo modes, and progressive enhancement from vanilla JavaScript to React components as the application evolves.