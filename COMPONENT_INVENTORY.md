# Component Inventory

Complete reference for all components in the workforce management platform.

## System Components (`components/system/`)

### Core UI Components

#### Header
**Location**: `components/system/header.tsx`  
**Props**:
- `title: string` - Page title
- `subtitle?: string` - Optional subtitle
- `breadcrumbs?: Array<{label: string, href?: string}>` - Breadcrumb trail
- `actions?: HeaderAction[]` - Action buttons
- `className?: string` - Additional classes

**Features**:
- Integrated GlobalSearch
- ThemeToggle
- AvatarDropdown
- Responsive layout

#### Card
**Location**: `components/system/card.tsx`  
**Props**:
- `title?: string` - Card title
- `subtitle?: string` - Card subtitle
- `actions?: ReactNode` - Action buttons
- `children: ReactNode` - Card content
- `footer?: ReactNode` - Footer content
- `bleed?: boolean` - Remove default padding
- `className?: string` - Additional classes

**Features**:
- Hover elevation effect
- Consistent padding (20px default)
- Border and shadow styling

#### Modal
**Location**: `components/system/modal.tsx`  
**Props**:
- `open: boolean` - Modal visibility
- `title: string` - Modal title
- `description?: string` - Optional description
- `children: ReactNode` - Modal content
- `footer?: ReactNode` - Footer actions
- `onClose: () => void` - Close handler
- `size?: "sm" | "md" | "lg"` - Modal size

**Features**:
- ESC key to close
- Click outside to close
- Accessible ARIA attributes
- Focus management

#### FilePreviewModal
**Location**: `components/system/file-preview-modal.tsx`  
**Props**:
- `open: boolean` - Modal visibility
- `fileName: string` - File name
- `fileType: string` - File type
- `fileSize?: string` - File size
- `onClose: () => void` - Close handler

**Features**:
- Simulated document preview
- Download button
- File type icons
- ESC key support

#### StatusChip
**Location**: `components/system/status-chip.tsx`  
**Props**:
- `label: string` - Chip text
- `tone?: "neutral" | "success" | "warning" | "danger" | "info"` - Color variant
- `className?: string` - Additional classes

**Usage**:
```tsx
<StatusChip label="Active" tone="success" />
<StatusChip label="Pending" tone="warning" />
```

#### SkeletonLoader
**Location**: `components/system/skeleton-loader.tsx`  
**Props**:
- `lines?: number` - Number of skeleton lines
- `className?: string` - Additional classes

**Features**:
- Shimmer animation
- Configurable line count
- Used during loading states

#### FloatingActionButton (FAB)
**Location**: `components/system/fab.tsx`  
**Props**:
- `icon: ReactNode` - Icon element
- `label: string` - Button label
- `onClick: () => void` - Click handler

**Features**:
- Fixed position
- Mobile-optimized
- Accessible

#### Breadcrumbs
**Location**: `components/system/breadcrumbs.tsx`  
**Props**:
- `items: Array<{label: string, href?: string}>` - Breadcrumb items

**Features**:
- Automatic link generation
- Responsive truncation

#### GlobalSearch
**Location**: `components/system/global-search.tsx`  
**Features**:
- Command palette (⌘K)
- Search jobs, candidates, vendors
- Keyboard navigation
- Quick navigation

#### ThemeToggle
**Location**: `components/system/theme-toggle.tsx`  
**Features**:
- Light/dark mode switch
- Uses next-themes
- Accessible button

#### Avatar & AvatarDropdown
**Location**: `components/system/avatar.tsx`, `avatar-dropdown.tsx`  
**Features**:
- Initials fallback
- Dropdown menu
- User actions

### Form Components

#### MultiStepForm
**Location**: `components/system/multi-step-form.tsx`  
**Props**:
- `steps: Step[]` - Form steps
- `activeStep: number` - Current step
- `onBack: () => void` - Back handler
- `onNext: () => void` - Next handler
- `onSave: () => void` - Save handler

**Features**:
- Step indicator
- Progress tracking
- Animated transitions

#### FormField
**Location**: `components/system/form-field.tsx`  
**Props**:
- `label: string` - Field label
- `error?: string` - Error message
- `children: ReactNode` - Input element

**Features**:
- Label association
- Error display
- Consistent styling

#### DatePicker
**Location**: `components/system/date-picker.tsx`  
**Features**:
- Calendar popup
- Date selection
- Formatting

### Data Display Components

#### Table (DataTable)
**Location**: `components/system/table.tsx`  
**Features**:
- Responsive design
- Zebra striping
- Hover effects
- Consistent padding (16px)

#### ExpandableRow
**Location**: `components/system/expandable-row.tsx`  
**Features**:
- Accordion behavior
- Nested content
- Smooth animations

#### ProgressBar
**Location**: `components/system/progress-bar.tsx`  
**Props**:
- `value: number` - Progress percentage
- `max?: number` - Maximum value

**Features**:
- Animated gradient
- Smooth transitions

### Navigation Components

#### Sidebar
**Location**: `components/system/sidebar.tsx`  
**Features**:
- Collapsible
- Mobile drawer
- Active route highlighting

#### Dropdown
**Location**: `components/system/dropdown.tsx`  
**Features**:
- Menu items
- Keyboard navigation
- Click outside to close

## UI Primitives (`components/ui/`)

These are shadcn/ui components adapted for the project:

### Form Controls
- `Button` - Primary, secondary, ghost, destructive variants
- `Input` - Text input with validation states
- `Textarea` - Multi-line text input
- `Select` - Dropdown selection
- `Switch` - Toggle switch
- `Checkbox` - Checkbox input
- `RadioGroup` - Radio button group
- `DatePicker` - Date selection (via Calendar)

### Display Components
- `Card` - Base card component
- `Badge` - Status badges
- `Avatar` - User avatars
- `Skeleton` - Loading skeletons
- `Progress` - Progress indicators
- `Separator` - Visual divider

### Overlay Components
- `Dialog` - Modal dialogs
- `Sheet` - Slide-in panels
- `Popover` - Popover menus
- `Tooltip` - Tooltips
- `Alert` - Alert messages
- `Toast` - Toast notifications

### Navigation Components
- `Tabs` - Tab navigation
- `Accordion` - Accordion panels
- `Breadcrumb` - Breadcrumb navigation
- `Command` - Command palette

### Data Display
- `Table` - Data tables
- `Chart` - Data visualization
- `Carousel` - Image carousel

## Component Usage Patterns

### Consistent Spacing
- Cards: 20px padding
- Tables: 16px padding
- Forms: 16px gap between fields

### Status Colors
- Success: Green (#48BB78)
- Warning: Orange (#ED8936)
- Danger: Red (#F56565)
- Info: Blue (#3182CE)
- Neutral: Gray (#EDF2F7)

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Accessibility
- All interactive elements have ARIA labels
- Keyboard navigation supported
- Focus management in modals
- Screen reader friendly

## Component Composition

### Example: Application Card
```tsx
<Card title="Application" subtitle="Candidate details">
  <StatusChip label={status} tone={getTone(status)} />
  <Button onClick={handleAction}>Action</Button>
</Card>
```

### Example: Form with Validation
```tsx
<FormField label="Email" error={errors.email}>
  <Input type="email" value={email} onChange={handleChange} />
</FormField>
```

### Example: Modal with Actions
```tsx
<Modal open={isOpen} onClose={handleClose} title="Confirm">
  <p>Are you sure?</p>
  <footer>
    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
    <Button onClick={handleConfirm}>Confirm</Button>
  </footer>
</Modal>
```

## Best Practices

1. **Always use system components** for consistency
2. **Provide ARIA labels** for accessibility
3. **Handle loading states** with SkeletonLoader
4. **Use StatusChip** for status indicators
5. **Follow spacing guidelines** (20px cards, 16px tables)
6. **Test keyboard navigation** for all interactive elements
7. **Ensure color is not sole indicator** of state

## Component Dependencies

- **System components** depend on UI primitives
- **UI primitives** are from shadcn/ui
- **All components** use Tailwind CSS
- **Theme** managed via next-themes
