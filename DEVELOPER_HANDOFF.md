# Developer Handoff Documentation

## Overview

This is a comprehensive frontend-only workforce management platform prototype built with Next.js 14, React, TypeScript, and Tailwind CSS. The application simulates a complete multi-tenant system for managing candidates, organizations, and vendors without requiring a backend.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: shadcn/ui + custom system components
- **State Management**: React Context (DemoDataProvider)
- **Icons**: Lucide React
- **Theme**: next-themes for dark mode support

## Project Structure

```
workforce-management-ui/
├── app/                    # Next.js App Router pages
│   ├── candidate/         # Candidate portal routes
│   ├── organization/       # Organization portal routes
│   ├── vendor/             # Vendor portal routes
│   └── layout.tsx          # Root layout
├── components/
│   ├── system/             # Custom system components
│   ├── ui/                 # shadcn/ui primitives
│   └── providers/          # Context providers
├── lib/
│   ├── mock-data.ts        # All mock data and types
│   ├── navigation-links.ts # Route metadata
│   └── utils.ts            # Utility functions
└── public/                 # Static assets
```

## Key Features

### 1. Multi-Portal Architecture
- **Candidate Portal**: Job browsing, applications, documents, notifications
- **Organization Portal**: Job creation, application management, compliance, workforce tracking
- **Vendor Portal**: Vendor management, bid submission, performance tracking

### 2. State Management
All state is managed through `DemoDataProvider` which provides:
- Mock data slices (candidate, organization, vendor)
- Action functions for mutations
- Simulated async delays for realism

### 3. Design System
- Consistent spacing (20px card padding, 16px table padding)
- Status chips with semantic colors
- Responsive breakpoints (mobile, tablet, desktop)
- Dark mode support via ThemeProvider

### 4. Components
- **System Components**: Header, Card, Modal, StatusChip, SkeletonLoader, etc.
- **UI Primitives**: Button, Input, Select, Textarea, Switch, etc.
- **Feature Components**: GlobalSearch, ThemeToggle, FilePreviewModal

## Implementation Details

### Mock Data Flow
1. Initial data defined in `lib/mock-data.ts`
2. Provider wraps app in `components/providers/app-providers.tsx`
3. Routes consume via `useDemoData()` hook
4. Actions mutate state with simulated delays

### Routing
- App Router with nested layouts per portal
- Dynamic routes: `[id]` for detail pages
- Breadcrumbs generated from route metadata

### Styling
- CSS variables in `app/globals.css`
- Tailwind utility classes
- Custom component classes (`.ph5-*`)

## Development Workflow

### Running the Application
```bash
npm install
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### Key Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

## Backend Integration Points

When integrating with a real backend:

1. **Replace DemoDataProvider** with API calls
2. **Update action functions** to call API endpoints
3. **Add authentication** middleware
4. **Implement real file uploads** for documents
5. **Add error handling** for API failures
6. **Implement real-time updates** (WebSockets/SSE)

## Known Limitations

- No persistence (refresh resets state)
- Simulated file uploads/downloads
- Mock email/SMS notifications
- No real-time collaboration
- No actual document rendering

## Accessibility

- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management in modals
- Screen reader friendly
- Color not sole indicator of state

## Performance Considerations

- Lazy loading for heavy components
- Memoization for expensive computations
- Skeleton loaders during async operations
- Optimized bundle size with tree-shaking

## Testing Strategy

Recommended testing approach:
1. Unit tests for utility functions
2. Component tests for UI components
3. Integration tests for user flows
4. E2E tests for critical paths

## Deployment

The application can be deployed to:
- **Netlify**
- **AWS Amplify**
- Any static hosting service that supports Next.js

## Support & Documentation

- See `FEATURES_DOCUMENTATION.md` for feature details
- See `COMPONENT_INVENTORY.md` for component reference
- See `ROUTE_MAP.md` for route structure
- See `DATA_MODEL_REFERENCE.md` for data types

## Contact

For questions or issues, refer to the project repository or contact the development team.
