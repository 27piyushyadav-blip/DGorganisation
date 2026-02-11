# Organization Panel - DigitalOffices

A comprehensive organization management panel for the DigitalOffices consultancy booking platform.

## Features

### 🏠 Dashboard
- Overview of key metrics (experts, bookings, sessions, revenue)
- Recent bookings and pending expert requests
- Analytics and insights

### 👥 Expert Management
- **Pending Requests**: Review and approve expert applications
- **Active Experts**: Manage current expert roster
- **Expert Profiles**: View detailed expert information
- **Search & Filter**: Find experts quickly

### 📅 Booking Management
- **Upcoming Bookings**: View and manage future appointments
- **Past Bookings**: Access booking history and receipts
- **Status Management**: Approve, reschedule, or cancel bookings
- **Real-time Updates**: Live booking status tracking

### 🎥 Session Management
- **Active Sessions**: Monitor ongoing consultations
- **Scheduled Sessions**: View upcoming appointments
- **Whiteboard Integration**: Access collaborative drawing tools
- **Session Controls**: Start, pause, and end sessions

### ⚙️ Profile Management
- **Organization Info**: Update basic information
- **Verification Status**: Track admin approval status
- **Services & Specialties**: Manage offered services
- **Account Settings**: Configure notifications and security

## Technical Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS with custom theme
- **Components**: Radix UI primitives with custom variants
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Theme & Design

The organization panel uses the same design system as the client and expert panels:

- **Color Scheme**: Zinc-based neutral palette
- **Dark Mode**: Full dark/light theme support
- **Components**: Consistent UI library across all panels
- **Responsive**: Mobile-first design approach

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3004](http://localhost:3004) in your browser

## Project Structure

```
apps/organization/
├── src/
│   ├── app/
│   │   ├── dashboard/          # Dashboard overview
│   │   ├── experts/            # Expert management
│   │   ├── bookings/           # Booking management
│   │   ├── sessions/           # Session management
│   │   ├── profile/            # Organization profile
│   │   ├── layout.tsx          # Root layout with sidebar
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   └── ui/                # Reusable UI components
│   └── lib/
│       └── utils.ts            # Utility functions
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.mjs
```

## Key Features

### Expert Approval Workflow
1. Experts submit join requests
2. Organizations review applications
3. Approved experts become part of the organization
4. Admin verification required for public visibility

### Booking Management
- Online and offline session support
- Real-time status tracking
- Automated notifications
- Receipt generation

### Session Monitoring
- Live session tracking
- Whiteboard collaboration
- Audio/video controls
- Session recording capabilities

### Profile Management
- Admin verification system
- Service customization
- Working hours configuration
- Multi-location support

## UI Components

The panel includes a comprehensive set of reusable components:

- **Button**: Multiple variants and sizes
- **Card**: Flexible content containers
- **Input**: Form inputs with validation
- **Badge**: Status indicators
- **Avatar**: User profile images
- **Tabs**: Content organization
- **Sidebar**: Navigation menu

## Security & Verification

- Admin verification for all profile changes
- Two-factor authentication support
- Role-based access control
- Audit logging for all actions

## Performance

- Optimized for large datasets
- Lazy loading for better performance
- Responsive design for all devices
- Accessibility compliance

## Integration

The organization panel is designed to work seamlessly with:
- Client panel for user bookings
- Expert panel for consultant management
- Admin panel for platform oversight
- Real-time notification system
