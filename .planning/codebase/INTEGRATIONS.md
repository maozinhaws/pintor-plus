# External Integrations - Pintor Plus

## Google Services Integration

### Google Drive API
- **Primary Storage**: All user data is stored in Google Drive's `appDataFolder`
- **Authentication**: OAuth 2.0 with Google accounts
- **Sync Mechanism**: Automatic synchronization when device is online
- **Data Isolation**: Uses `appDataFolder` to keep data private from other apps
- **Permissions**: Limited scope access to user's Google Drive

### Google Identity Services (GIS)
- **User Authentication**: Login via Google account
- **Token Management**: Access token handling with refresh mechanism
- **Silent Reconnection**: Automatic reconnection when app regains focus
- **Account Persistence**: Stores user email for seamless re-authentication

### Google Maps Places API
- **Address Autocomplete**: Location input assistance for client addresses
- **Geocoding**: Convert addresses to coordinates and vice versa
- **Restrictions**: Limited to Brazil (BR) country codes only
- **API Key**: Integrated with server-side key management

## Third-Party Libraries

### html2pdf.js
- **PDF Generation**: Converts HTML elements to PDF documents
- **Receipt Creation**: Generates professional receipts for clients
- **Download Capability**: Allows users to download or share PDFs

## Browser APIs

### Service Worker API
- **Offline Support**: Enables PWA functionality
- **Background Sync**: Synchronization when connectivity is restored
- **Push Notifications**: System notifications for reminders
- **Background Operations**: Handle alarms and sync operations

### Web Storage API
- **localStorage**: Persistent client-side data storage
- **sessionStorage**: Temporary data storage for recovery
- **Encryption Layer**: Enhanced security with `_Vault` module

### Notification API
- **System Notifications**: Desktop/mobile notifications for reminders
- **Permission Management**: Handles notification permissions gracefully
- **Background Notifications**: Works even when app is not active

### Media Capture API
- **Photo Capture**: Integration with device camera
- **Image Upload**: Attach photos to budget items
- **Multiple Sources**: Camera and gallery access

### Web Audio API
- **Audio Alerts**: Custom audio feedback for notifications
- **Synthesized Sounds**: Different tones for different alerts
- **Browser Compatibility**: Graceful degradation when not available

## Device APIs

### PWA Capabilities
- **Installable**: Can be installed as standalone app
- **Mobile Optimized**: Touch-friendly interface
- **Offline Functionality**: Works without internet
- **Push Notifications**: Native-like notification system

### Browser Features
- **History API**: SPA navigation without page reloads
- **Viewport API**: Mobile-optimized viewport settings
- **Theme Detection**: Automatic dark/light mode based on system preferences
- **Visibility API**: Detect when app is in background to optimize sync

## Security Integrations

### Content Security Policy (CSP)
- **Header Configuration**: Defined in vercel.json with strict policies
- **Script Sources**: Limited to self and trusted Google domains
- **Style Sources**: Controlled CSS loading
- **Connect Origins**: Restricted API endpoints