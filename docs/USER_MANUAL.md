# DogeRat Web Admin - User Manual

## Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [User Roles & Permissions](#user-roles--permissions)
- [Main Features](#main-features)
  - [Dashboard](#dashboard)
  - [Device Management](#device-management)
  - [User Management](#user-management)
  - [Audit Trail](#audit-trail)
- [FAQ](#faq)
- [Troubleshooting](#troubleshooting)
- [Support](#support)

---

## Introduction

DogeRat Web Admin is a comprehensive web-based administration panel for managing and controlling Android devices remotely. The platform provides real-time device monitoring, command execution, user management, and comprehensive audit logging.

**Key Features:**
- Real-time device status monitoring
- Remote device control
- Role-based access control (RBAC)
- Comprehensive audit trail
- Dark mode UI with Angular Material
- WebSocket-based real-time updates

---

## Getting Started

### First Login

1. Navigate to the Web Admin URL (e.g., `http://localhost:3000`)
2. Use the default admin credentials:
   - **Username**: `admin`
   - **Password**: `Admin@123456`
3. **Important**: Change the default password immediately after first login

### Changing Your Password

1. Click on your profile icon in the top-right corner
2. Select "Settings" (if available) or ask an admin to reset your password

---

## User Roles & Permissions

DogeRat Web Admin supports 4 user roles with different permission levels:

### Admin
- **Full system access**
- Can create, edit, and delete users
- Can manage all devices
- Can view and export audit logs
- Can configure system settings

### Manager
- Can view and manage users (limited)
- Can control all devices
- Can view audit logs
- Cannot modify system-critical settings

### Operator
- Can view all devices
- Can send commands to devices
- Cannot manage users
- Cannot view audit logs

### Viewer
- **Read-only access**
- Can view device list and status
- Cannot execute commands
- Cannot manage users or view audit logs

---

## Main Features

### Dashboard

The Dashboard provides a quick overview of your system.

**Components:**

1. **Statistics Cards**
   - Total Devices
   - Online Devices
   - Offline Devices
   - Recent Actions

2. **Recent Devices Table**
   - Shows last 10 connected devices
   - Real-time status updates
   - Device model, IP address, and last seen time

**How to Use:**
- Click "Refresh" to manually reload dashboard data
- Real-time updates automatically reflect device status changes

---

### Device Management

Manage all connected Android devices from a centralized interface.

#### Viewing Devices

1. Navigate to **Devices** from the sidebar
2. Use the search bar to filter devices by:
   - Model name
   - IP address
   - Device ID
3. Use filter chips to show:
   - All devices
   - Online only
   - Offline only

#### Device Actions

For **Online devices**, you can:

1. **View Details**: Click the three-dot menu → "View Details"
2. **Get Device Info**: Retrieve device specifications
3. **Get Location**: Request current GPS location
4. **Send Custom Commands**: Execute specific actions

**Available Commands:**
- `get_info` - Device information
- `get_location` - GPS coordinates
- `get_sms` - Read SMS messages
- `get_contacts` - Retrieve contact list
- `get_call_logs` - Fetch call history
- `take_photo` - Capture photo from camera
- `record_audio` - Record microphone audio
- `get_files` - List files from storage

#### Deleting Devices

1. Click the three-dot menu on a device row
2. Select "Delete Device"
3. Confirm the action

**Note**: Only admins and managers can delete devices.

---

### User Management

**(Admin & Manager only)**

#### Creating a New User

1. Navigate to **Users** from the sidebar
2. Click "Create User"
3. Fill in the form:
   - Username (required)
   - Email (optional)
   - Password (required, min 6 characters)
   - Role (select from dropdown)
4. Click "Save"

#### Editing Users

1. Click the three-dot menu on a user row
2. Select "Edit"
3. Modify user details (password is optional when editing)
4. Click "Save"

#### Resetting Passwords

1. Click the three-dot menu on a user row
2. Select "Reset Password"
3. Enter new password
4. Confirm

#### Deleting Users

1. Click the three-dot menu on a user row
2. Select "Delete"
3. Confirm the action

**Note**: Admin users cannot be deleted.

---

### Audit Trail

**(Admin & Manager only)**

The Audit Trail logs all system activities for security and compliance.

#### Viewing Logs

1. Navigate to **Audit Trail** from the sidebar
2. View the table showing:
   - Timestamp
   - User who performed the action
   - Action type (Create, Update, Delete, Login, etc.)
   - Resource affected
   - Details
   - IP address

#### Filtering Logs

Use the filter section to narrow down results:

1. **User Filter**: Select a specific user
2. **Action Type**: Filter by action (Create, Update, Delete, etc.)
3. **Date Range**: Select start and end dates
4. Click "Clear Filters" to reset

#### Exporting Logs

1. Apply desired filters (optional)
2. Click "Export CSV"
3. The filtered audit log will download as a CSV file

**CSV Format:**
```
Timestamp,User,Action,Resource,Details,IP Address
2024-10-20T10:30:00Z,admin,LOGIN,user,"Successful login",192.168.1.100
```

---

## FAQ

### Q: What happens if I lose my admin password?

**A:** You need to reset it using the backend script:
```bash
cd /path/to/project
npm run db:seed  # This recreates the admin user
```

### Q: How do I know if a device is online?

**A:** Devices with a green "Online" badge in the status column are currently connected. The dashboard updates in real-time via WebSocket.

### Q: Can I undo a deleted device?

**A:** No, device deletion is permanent. The device will need to reconnect to appear in the system again.

### Q: What's the difference between Manager and Operator roles?

**A:**
- **Manager**: Can manage users + control devices + view audit logs
- **Operator**: Can only control devices (no user management or audit access)

### Q: How often does the dashboard update?

**A:** The dashboard uses WebSocket connections for real-time updates. Changes appear instantly without manual refresh.

### Q: Can I export device data?

**A:** Currently, only audit logs can be exported as CSV. Device data export may be added in future versions.

---

## Troubleshooting

### Issue: "Login failed" error

**Solutions:**
1. Check username and password (case-sensitive)
2. Ensure backend server is running
3. Clear browser cache and cookies
4. Try using the default admin credentials if first-time setup

### Issue: Devices not appearing

**Solutions:**
1. Verify the Android app is running on the target device
2. Check network connectivity
3. Ensure the device app is configured with correct server URL
4. Check backend logs for connection errors

### Issue: Commands not executing

**Solutions:**
1. Verify the device is **Online** (green status)
2. Check device app permissions
3. Review audit logs for error messages
4. Ensure you have the correct role (Operator or above)

### Issue: Real-time updates not working

**Solutions:**
1. Check browser console for WebSocket errors
2. Ensure firewall/proxy allows WebSocket connections
3. Refresh the page to re-establish connection
4. Verify backend Socket.IO server is running

---

## Support

### Reporting Issues

1. Check this manual and FAQ first
2. Review audit logs for error details
3. Check browser console for JavaScript errors
4. Contact your system administrator with:
   - Description of the issue
   - Steps to reproduce
   - Browser and version
   - Screenshot (if applicable)

### Logs & Debugging

- **Backend logs**: Check `logs/` directory
- **Browser console**: Press F12 → Console tab
- **Audit logs**: Use the Audit Trail page

### Educational Use Disclaimer

⚠️ **Important**: DogeRat is developed for **educational and research purposes only**. Unauthorized use of this software to monitor or control devices without explicit permission is illegal and unethical.

By using this software, you agree to:
- Use it only in controlled, authorized environments
- Obtain proper consent before deploying on any device
- Comply with all applicable laws and regulations
- Take full responsibility for your actions

---

## Version Information

- **Web Admin Version**: 2.0.0
- **Last Updated**: 2024-10-20
- **Angular Version**: 20.3.0
- **Node.js Version**: 20.x

---

## Quick Reference

### Default Credentials
- Username: `admin`
- Password: `Admin@123456`

### Keyboard Shortcuts
- `Ctrl + R` / `Cmd + R`: Refresh current page
- `Esc`: Close dialogs and modals

### Important URLs
- Dashboard: `/dashboard`
- Devices: `/devices`
- Users: `/users` (Admin/Manager only)
- Audit Trail: `/audit` (Admin/Manager only)
- API Documentation: `/api-docs` (Swagger UI)

---

*End of User Manual*

