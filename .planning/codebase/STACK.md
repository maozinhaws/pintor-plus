# Technology Stack Analysis - Pintor Plus

## Overview
Pintor Plus is a Progressive Web Application (PWA) built for professional painters to manage budgets, clients, and scheduling. The application is built entirely with client-side technologies and integrates with Google Drive for data synchronization.

## Core Technologies

### Frontend Framework
- **Vanilla JavaScript**: The application uses pure JavaScript without any major frameworks like React, Vue, or Angular
- **HTML5/CSS3**: Modern web standards for structure and styling
- **Service Workers**: For offline functionality and background sync

### Rendering & Styling
- **CSS Grid/Flexbox**: Modern layout techniques for responsive design
- **Custom CSS**: Extensive custom styling with CSS variables for theming
- **SVG Icons**: Vector icons embedded directly in the code

### Data Management
- **localStorage/sessionStorage**: Client-side data persistence
- **JSON**: Data serialization format
- **Custom encryption layer**: `_Vault` module for enhanced data protection

### External Libraries
- **html2pdf.js**: PDF generation library for receipts and budgets
- **Google Maps Places API**: Address autocomplete functionality
- **Google Identity Services**: OAuth integration with Google accounts

## Architecture Components

### Authentication & Sync
- **Google Drive API**: Primary data storage and synchronization
- **OAuth 2.0**: Secure authentication with Google accounts
- **appDataFolder**: Isolated storage space in Google Drive
- **Automatic sync**: Background synchronization when online

### Features
- **Offline-first**: Works without internet connection
- **Budget management**: Detailed budget creation with measurements
- **PDF generation**: Automatic receipt generation
- **WhatsApp integration**: Message templates for client communication
- **Scheduling**: Event and reminder system with notifications
- **Client management**: Customer database with contact information
- **Supplier management**: Vendor and supplier contacts

### Security
- **Client-side encryption**: Data protection in localStorage
- **CSP Headers**: Strict Content Security Policy in vercel.json
- **Input sanitization**: HTML escaping functions
- **Secure OAuth**: Google authentication with proper scopes

## Deployment
- **Vercel**: Hosting platform with custom headers and rewrites
- **PWA**: Installable web application with native-like experience
- **Cross-platform**: Works on Android, iOS, and desktop browsers