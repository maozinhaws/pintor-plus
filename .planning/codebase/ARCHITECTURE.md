# System Architecture - Pintor Plus

## Overview
Pintor Plus follows a client-side architecture pattern with data synchronization to cloud storage. The application is designed as a Progressive Web App (PWA) with offline-first capabilities, utilizing Google Drive as the primary data persistence layer.

## High-Level Architecture

### Client-Server Model
```
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Client Side   │◄──►│  Google Drive    │◄──►│   Google APIs    │
│                 │    │  (Primary DB)    │    │                  │
│  - HTML/CSS     │    │                  │    │  - OAuth 2.0     │
│  - JavaScript   │    │  - JSON Storage  │    │  - Maps Places   │
│  - Service      │    │  - Encryption    │    │                  │
│    Worker       │    │                  │    │                  │
└─────────────────┘    └──────────────────┘    └──────────────────┘
```

## Component Architecture

### 1. Presentation Layer
- **Single Page Application (SPA)**: Built with vanilla JavaScript
- **Modular Pages**: Separate sections (home, budgets, clients, suppliers, agenda, settings)
- **Responsive Design**: Mobile-first approach with desktop compatibility
- **PWA Features**: Installable, offline support, push notifications

### 2. Business Logic Layer
- **Global State (S Object)**: Centralized application state management
- **Utility Functions**: Helper functions for calculations, formatting, and DOM manipulation
- **Validation Logic**: Input validation and business rule enforcement
- **Navigation System**: History API integration for SPA navigation

### 3. Data Layer
- **Client-Side Storage**: localStorage and sessionStorage for data persistence
- **Encryption Layer**: `_Vault` module for enhanced security
- **Sync Engine**: Google Drive synchronization with conflict resolution
- **Data Models**: Structured objects for budgets, clients, suppliers, events

### 4. Integration Layer
- **Google Drive API**: Primary data persistence and sync
- **Google Identity Services**: Authentication and session management
- **Google Maps Places API**: Address autocomplete functionality
- **Third-party Libraries**: PDF generation, audio synthesis

## Data Flow Architecture

### Offline-First Approach
```
User Interaction → Client-Side State → Local Storage → Sync Queue → Google Drive
                                    ↓              ↓
                              Immediate UI    Background Sync
                              Response        (When Online)
```

### Sync Strategy
1. **Immediate Local Storage**: All changes saved locally immediately
2. **Background Sync**: Changes synchronized with Google Drive when online
3. **Conflict Resolution**: Last-write-wins strategy with timestamp comparison
4. **Error Handling**: Fallback mechanisms for sync failures

## State Management

### Global State Object (S)
- **orcs**: Budgets/orçamentos array
- **clientes**: Clients/customers array  
- **fornecedores**: Suppliers/vendors array
- **eventos**: Events/scheduling array
- **config**: Application configuration object
- **isDirty**: Flag indicating unsaved changes

### State Persistence
- **Primary**: Google Drive (encrypted JSON files)
- **Secondary**: localStorage (for immediate access)
- **Recovery**: sessionStorage (for crash recovery)

## Security Architecture

### Data Protection
- **Client-Side Encryption**: Data encrypted before storing in localStorage
- **Google Drive Isolation**: Uses appDataFolder for private storage
- **OAuth Scopes**: Minimal required permissions
- **Input Sanitization**: HTML escaping for user-generated content

### Authentication Flow
```
User clicks login → Google OAuth → Token received → Store in memory → Access Drive
                     ↓              ↓                   ↓                ↓
               Redirect to Google  Store email      Session active   Sync data
               consent screen      for reauth       for API calls    with Drive
```

## Service Worker Architecture

### Offline Capabilities
- **Resource Caching**: Critical assets cached for offline use
- **Background Sync**: Data synchronization when connectivity restored
- **Push Notifications**: System notifications for reminders
- **Background Processing**: Alarm management and periodic tasks

## Module Organization

### Core Modules
- **Navigation Module**: SPA routing and page management
- **Data Module**: CRUD operations and sync logic
- **UI Module**: Dynamic rendering and user interactions
- **Security Module**: Encryption and authentication
- **Integration Module**: Third-party API connections

### Feature Modules
- **Budget Module**: Budget creation, calculation, and management
- **Client Module**: Customer data management
- **Supplier Module**: Vendor contact management  
- **Scheduling Module**: Event management and alarms
- **PDF Module**: Receipt generation and export
- **Settings Module**: Configuration and preferences

## Deployment Architecture

### Hosting
- **Platform**: Vercel for static hosting
- **CDN**: Global content delivery for assets
- **Custom Headers**: Security headers and CSP policy
- **Rewrite Rules**: Clean URL routing

### Performance Optimization
- **Asset Bundling**: Combined CSS and optimized images
- **Progressive Loading**: Lazy loading for non-critical resources
- **Caching Strategy**: Aggressive caching for static assets
- **Code Splitting**: Modular organization for faster initial load