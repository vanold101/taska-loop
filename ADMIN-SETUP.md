# Admin Setup Guide

## 🔐 Authentication System

### User Types

1. **Regular Users** 
   - Start with completely blank data
   - No trips, tasks, or pantry items initially
   - Must create their own content

2. **Admin Users**
   - Start with sample data for demonstration
   - Pre-populated trips, tasks, and pantry items
   - Can access admin features

### Admin Email Addresses

The following emails are configured as admins:
- `devanshagarwal@gmail.com` (Your main account)
- `admin@taskaloop.com` 
- `demo@taskaloop.com`
- `test.admin@gmail.com`

## 🚀 Setup Instructions

### Step 1: Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/project/taska-9ee86/authentication)
2. Click "Get started" to enable Authentication
3. Go to "Sign-in method" tab
4. Enable "Google" provider:
   - Toggle "Enable" to ON
   - Set support email: `devanshagarwal@gmail.com`
   - Click "Save"
5. Add authorized domains:
   - Go to "Settings" tab
   - Add `localhost` to authorized domains

### Step 2: Create Admin Test Accounts

After enabling Firebase Authentication, run:

```bash
node scripts/setup-admin-accounts.js
```

This will create test admin accounts with these credentials:

| Email | Password | Name |
|-------|----------|------|
| `admin@taskaloop.com` | `TaskaAdmin123!` | TaskaLoop Admin |
| `demo@taskaloop.com` | `TaskaDemo123!` | Demo Admin |
| `test.admin@gmail.com` | `TestAdmin123!` | Test Admin |

### Step 3: Test the System

1. **Test Regular User**:
   - Sign in with any Google account not in the admin list
   - Should see completely blank dashboard
   - No trips, tasks, or pantry items

2. **Test Admin User**:
   - Sign in with your Google account (`devanshagarwal@gmail.com`)
   - OR use one of the test admin accounts above
   - Should see sample data pre-populated

## 🎯 User Experience

### New Regular Users
- Clean slate experience
- Must create their first trip/task/pantry item
- Encourages organic usage

### Admin Users  
- Immediate demonstration of features
- Sample data shows app capabilities
- Can test all functionality immediately

## 🔧 Technical Details

### Data Storage
- Each user gets isolated data storage
- Storage keys include user ID: `trips_${userId}`, `tasks_${userId}`, etc.
- Admin status determined by email address matching

### Admin Detection
- Checked in `AuthContext.tsx` 
- Based on email address in `ADMIN_EMAILS` array
- `user.isAdmin` flag set automatically

### Initial Data Logic
```javascript
// In TaskContext and PantryContext
const initialData = user.isAdmin ? sampleData : [];
```

## 🛠️ Adding More Admins

To add more admin emails, edit `src/context/AuthContext.tsx`:

```javascript
const ADMIN_EMAILS = [
  'devanshagarwal@gmail.com',
  'admin@taskaloop.com',
  'your-new-admin@example.com', // Add here
];
``` 