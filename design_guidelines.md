# DogeRat Web Admin Panel - Design Guidelines

## Design Approach

**Selected Framework:** Angular Material Design System
**Justification:** Given the Angular frontend requirement and the application's nature as a security-focused, data-intensive admin panel, Angular Material provides:
- Native Angular integration with excellent performance
- Comprehensive component library for complex data displays
- Strong accessibility and security patterns
- Professional, enterprise-grade aesthetic appropriate for security tools

**Design Principles:**
1. **Clarity Over Decoration** - Every element serves a functional purpose
2. **Information Hierarchy** - Critical device status and security alerts take precedence
3. **Efficient Workflows** - Minimize clicks for common operations
4. **Trust Through Consistency** - Predictable patterns reduce errors in critical operations

## Color Palette

**Dark Mode Primary (Default):**
- Primary Brand: 220 85% 55% (Professional blue - trustworthy, security-focused)
- Primary Variant: 220 90% 45% (Darker blue for depth)
- Accent/Action: 150 70% 50% (Green - success, connected devices)
- Warning: 35 95% 60% (Orange - alerts, pending actions)
- Error/Critical: 0 85% 60% (Red - disconnected devices, failed operations)
- Background Primary: 220 15% 12% (Deep charcoal)
- Background Secondary: 220 15% 16% (Elevated surfaces)
- Background Tertiary: 220 12% 20% (Cards, modals)
- Text Primary: 0 0% 95%
- Text Secondary: 0 0% 70%
- Border/Divider: 220 10% 25%

**Light Mode:**
- Background Primary: 0 0% 98%
- Background Secondary: 0 0% 100%
- Background Tertiary: 220 20% 97%
- Text Primary: 220 15% 15%
- Text Secondary: 220 10% 45%
- Border: 220 15% 85%

**Status Colors:**
- Online/Connected: 150 70% 50%
- Offline: 0 0% 50%
- Pending Command: 45 95% 60%
- Error State: 0 85% 60%

## Typography

**Font Families:**
- Primary: 'Inter', system-ui, -apple-system, sans-serif (UI text, data displays)
- Monospace: 'JetBrains Mono', 'Fira Code', Consolas, monospace (device IDs, logs, code)

**Scale & Usage:**
- H1 (32px, 700): Page titles, "Device Management", "Dashboard"
- H2 (24px, 600): Section headers, "Connected Devices", "Recent Commands"
- H3 (20px, 600): Card titles, modal headers
- H4 (16px, 600): Table headers, form labels
- Body (14px, 400): Default text, descriptions
- Small (12px, 400): Timestamps, metadata, helper text
- Code (13px, 400): Device IDs, IP addresses, technical data

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Micro spacing (2-4): Icon-to-text gaps, form field internal padding
- Component spacing (6-8): Button padding, card internal margins
- Section spacing (12-16): Between form fields, list items
- Major spacing (20-24): Between distinct sections, page margins

**Grid Structure:**
- Main Layout: Fixed sidebar (280px) + flexible content area
- Dashboard Grid: 12-column responsive grid for stat cards and charts
- Device Tables: Full-width with fixed column widths for consistency
- Modals/Drawers: 600px max-width for forms, 800px for detail views

## Component Library

### Navigation
- **Top Bar:** Fixed, 64px height, contains user profile, notifications, global search
- **Sidebar:** 280px wide, collapsible to 64px (icon-only), contains:
  - Dashboard
  - Devices (with active count badge)
  - Commands History
  - File Manager
  - User Management (admin only)
  - Audit Logs (admin only)
  - Settings
- Active state: Accent color background with 4px left border indicator

### Dashboard Components
- **Stat Cards:** 4-column grid on desktop, stacked on mobile
  - Total Devices, Online Devices, Active Commands, Recent Actions
  - Large number (32px), label below, trend indicator (↑/↓)
- **Device Status Chart:** Pie/donut chart showing online vs offline
- **Activity Timeline:** Recent 10 actions with user, device, timestamp
- **Quick Actions Panel:** Frequently used commands for selected devices

### Device Management
- **Device Table:** Material Data Table with:
  - Columns: Status indicator (dot), Device Model, IP, Last Seen, Version, Actions
  - Row selection (checkboxes) for bulk operations
  - Inline action menu (3-dot) per row
  - Search/filter bar above table
  - Pagination: 25/50/100 items per page
- **Device Detail View:** Side drawer (600px) containing:
  - Device info card (model, IP, version, connection time)
  - Tabs: Actions, Data Logs, Command History, Files
  - Action buttons grouped by category (Data, Control, Advanced)

### Action Modals
- **Standard Modal:** 500px width, centered
  - Header with icon and title
  - Form fields with clear labels and validation
  - Footer with Cancel (outline) and Execute (filled) buttons
- **File Manager Modal:** 800px width
  - Split view: directory tree (left 40%) + file list (right 60%)
  - Breadcrumb navigation
  - Action toolbar (upload, download, delete)

### Data Display
- **Contact/SMS/Call Lists:** Scrollable tables within device detail
  - Compact rows (40px height)
  - Icons for contact type
  - Timestamp in secondary text color
- **Keylogger Output:** Monospace text area with:
  - Syntax highlighting for app names
  - Auto-scroll option
  - Export to file button
- **Screenshot Gallery:** Grid of thumbnails (3 columns)
  - Click to expand lightbox view
  - Download individual or bulk

### Forms
- **Input Fields:** Material outline style
  - 48px height for touch targets
  - Clear error states with red underline and error text
  - Disabled state with reduced opacity (0.5)
- **Buttons:**
  - Primary: Filled with primary color, white text
  - Secondary: Outlined with primary color border
  - Danger: Filled red for destructive actions (delete, encrypt)
  - Icon buttons: 40px square for action menus
- **Selectors:**
  - Device picker: Multi-select dropdown with search
  - Role selector: Single-select dropdown with icons

### Overlays
- **Notifications:** Toast-style, top-right corner
  - Success: Green left border
  - Error: Red left border
  - Info: Blue left border
  - Auto-dismiss after 5s or manual close
- **Confirmation Dialogs:** 400px width
  - Warning icon for destructive actions
  - Clear description of consequences
  - Prominent Cancel button

### User Management
- **User Table:** Similar to device table
  - Columns: Avatar, Username, Email, Role, Last Login, Status, Actions
  - Inline role switcher for admins
  - Add User button (top-right)
- **User Form:** Modal with tabs
  - Basic Info: Username, email, password
  - Permissions: Role selector with permission matrix display
  - Audit: User's action history

### Audit Trail
- **Activity Log:** Full-width table
  - Columns: Timestamp, User, Action, Target (device), Details, Status
  - Advanced filters: Date range, user, action type
  - Export to CSV button
  - Color-coded status (success/failed)

## Animations

**Minimal and Purposeful Only:**
- Page transitions: Subtle fade (150ms) when changing routes
- Modal/drawer entry: Slide + fade (200ms ease-out)
- Toast notifications: Slide in from right (200ms)
- Table row loading: Skeleton shimmer effect
- Button states: None (rely on native Material ripple)
- Charts: Initial load animation (500ms) only

**No Animations for:**
- Hover states
- Focus states  
- Scrolling effects
- Parallax or decorative motion

## Images

**No hero images.** This is a utility application focused on functionality.

**Icon Usage:**
- Material Icons via CDN for all UI icons
- Consistent 24px size for inline icons
- 40px for feature icons in empty states

**Device Representations:**
- Use Material Icons: phone_android, tablet, devices
- Status indicators: colored dots (8px diameter) rather than images

**Empty States:**
- Large icon (64px) in secondary color
- Helpful text explaining how to populate
- Primary action button below

---

**Critical Implementation Notes:**
- All form inputs and text fields must maintain dark mode consistency
- Tables must support virtual scrolling for 1000+ devices
- Real-time updates via Socket.IO should show visual indicators (pulse animation on status dots)
- Keyboard shortcuts for power users (e.g., Ctrl+K for command palette)
- Maintain strict separation between read-only (Viewer) and action-capable interfaces
- Failed commands should retry automatically with visible retry counter
- Sensitive operations (file deletion, encryption) require secondary confirmation
- All timestamps in user's local timezone with UTC indicator