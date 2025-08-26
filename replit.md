# SEWAVAULT DEMO2

## Overview

SEWAVAULT DEMO2 is a full-stack token-based item management system designed for the Sikh community (Sangat) during religious services (sewa). The application manages the secure deposit and return of electronic items using barcode-enabled tokens. Built as a mobile-responsive web application, it provides a streamlined workflow for tracking personal belongings during community gatherings.

The system operates with pre-defined physical tokens (numbered 1001-1020) that contain unique barcodes with embedded security codes. Each token can hold multiple electronic items along with a mandatory photo of the depositor for identification purposes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18+ with TypeScript for type safety and modern development practices
- **UI Library**: Shadcn/ui components built on Radix UI primitives for consistent, accessible interface design
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **Navigation**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management with optimistic updates
- **Camera Integration**: Browser MediaDevices API with custom hooks for barcode scanning and photo capture

### Backend Architecture
- **Runtime**: Node.js with Express.js for RESTful API endpoints
- **Language**: TypeScript throughout the entire stack for consistency and type safety
- **Data Validation**: Zod schemas for runtime type checking and API contract validation
- **Build Tool**: Vite for fast development and optimized production builds
- **Development**: Hot module replacement and error overlay for enhanced developer experience

### Data Storage Strategy
- **Database**: Configured for PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Design**: Separate tables for tokens and deposits with foreign key relationships
- **Demo Mode**: In-memory storage implementation using Map data structures for development/demo purposes
- **Migration System**: Drizzle Kit for database schema versioning and deployment

### Token Security Model
- **Predefined Tokens**: Fixed set of 20 tokens (1001-1020) with unique security codes
- **Barcode Format**: Structured format "ABX_{token_number}_{security_code}_RSSB" for validation
- **State Tracking**: Boolean flags to prevent double-booking and ensure token availability
- **Data Integrity**: Server-side validation of token existence and usage status

### API Design Patterns
- **RESTful Endpoints**: Standard HTTP methods following REST conventions
- **Error Handling**: Structured error responses with appropriate HTTP status codes
- **Request Validation**: Input sanitization and validation at API boundaries
- **Response Formatting**: Consistent JSON response structure across all endpoints

### Photo Management
- **Format**: Base64 encoded images for simplicity in demo environment
- **Capture**: Browser camera API with fallback handling for different devices
- **Storage**: Embedded within deposit records as text fields
- **Security**: Mandatory photo requirement for all deposits to ensure accountability

### Mobile-First Design
- **Responsive Layout**: Mobile-optimized interface with touch-friendly controls
- **Progressive Enhancement**: Core functionality works without advanced browser features
- **Accessibility**: ARIA labels and keyboard navigation support throughout the application
- **Performance**: Optimized bundle size and lazy loading for mobile networks

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL connection driver for serverless environments
- **drizzle-orm**: Type-safe ORM for database operations and query building
- **drizzle-kit**: Database migration and schema management tooling
- **express**: Web application framework for API server implementation

### UI and Component Libraries
- **@radix-ui/react-***: Comprehensive set of headless UI components for accessibility
- **@tanstack/react-query**: Server state management and caching solution
- **tailwindcss**: Utility-first CSS framework for rapid styling
- **class-variance-authority**: Component variant management for consistent styling
- **lucide-react**: Icon library with tree-shakable SVG icons

### Development and Build Tools
- **vite**: Fast build tool and development server with HMR support
- **typescript**: Static type checking and enhanced developer experience
- **@vitejs/plugin-react**: React integration for Vite build system
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay for debugging

### Validation and Utility Libraries
- **zod**: Runtime type validation and schema definition
- **clsx**: Conditional className utility for dynamic styling
- **wouter**: Lightweight client-side routing solution
- **date-fns**: Date manipulation and formatting utilities

### Camera and Media APIs
- **Browser MediaDevices API**: Native browser camera access for barcode scanning and photo capture
- **Canvas API**: Image processing and base64 encoding for photo storage