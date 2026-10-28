# EaziBook Authentication System

## Overview
EaziBook implements a secure authentication system using Supabase Auth with email/password authentication. Users must create an account and log in before accessing the application.

---

## Authentication Flow

### **New User Journey**
1. User lands on **Login** page
2. Clicks "Sign up" link
3. Fills out **Signup** form:
   - Full Name
   - Email Address
   - Password (min 6 characters)
   - Confirm Password
4. Account created with **Free Plan** by default
5. Automatically logged in and redirected to **Dashboard**

### **Returning User Journey**
1. User lands on **Login** page
2. Enters credentials:
   - Email Address
   - Password
3. Logged in and redirected to **Dashboard**
4. Session persists across browser refreshes

### **Logout Journey**
1. User clicks **Logout** button in sidebar footer
2. Session cleared from local storage
3. User redirected to **Login** page

---

## Pages

### **Login Page** (`/components/Login.tsx`)

**Features:**
- Clean, minimalistic design matching EaziBook theme
- Email and password input fields
- "Sign in" button with loading state
- Link to switch to Signup page
- Error message display
- Demo mode information card

**Validation:**
- All fields required
- Email format validation
- Password authentication via Supabase

**UI Elements:**
- EaziBook branding header
- Card-based layout
- Form with proper labels and inputs
- Error alerts (destructive variant)
- Demo info card at bottom

---

### **Signup Page** (`/components/Signup.tsx`)

**Features:**
- Two-column layout (form + plan info)
- Full name, email, password, and confirm password fields
- "Create Account" button with loading state
- Free plan feature preview
- Link to switch to Login page
- Comprehensive validation

**Validation:**
- All fields required
- Email format validation (regex)
- Password minimum 6 characters
- Password confirmation match
- Duplicate email checking (via Supabase)

**UI Elements:**
- EaziBook branding header
- Responsive grid layout (3 columns on desktop)
- Form card with validation
- Free plan benefits card with check icons
- Error alerts (destructive variant)

---

## Technical Implementation

### **AuthContext** (`/utils/AuthContext.tsx`)

**State Management:**
- `user` - Current authenticated user object
- `isLoading` - Loading state during session check
- `login()` - Login function
- `signup()` - Signup function
- `logout()` - Logout function

**User Object:**
```typescript
interface User {
  id: string;
  email: string;
  name: string;
}
```

**Session Management:**
- Access token stored in `localStorage` as `access_token`
- Session checked on app load via `/auth/session` endpoint
- Auto-logout if session invalid

**Functions:**

#### `signup(email, password, name)`
- Creates user via Supabase Admin API
- Auto-confirms email (no email server needed)
- Creates session and returns access token
- Stores user metadata (name)

#### `login(email, password)`
- Authenticates via Supabase Auth
- Returns access token and user data
- Stores token in localStorage

#### `logout()`
- Calls Supabase signOut
- Clears localStorage
- Resets user state to null

#### `checkSession()`
- Called on app mount
- Validates stored access token
- Restores user session if valid
- Clears token if invalid

---

## Backend Endpoints

### **POST** `/make-server-db10586b/auth/signup`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "access_token": "eyJhbGciOi..."
}
```

**Errors:**
- 400: Missing fields or invalid email
- 400: Email already exists

---

### **POST** `/make-server-db10586b/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "access_token": "eyJhbGciOi..."
}
```

**Errors:**
- 400: Missing fields
- 401: Invalid credentials

---

### **GET** `/make-server-db10586b/auth/session`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Errors:**
- 401: No token provided
- 401: Invalid token

---

### **POST** `/make-server-db10586b/auth/logout`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true
}
```

---

## Security Features

### **Password Requirements**
- Minimum 6 characters
- No special character requirements (for demo mode)
- Production should enforce stronger policies

### **Email Confirmation**
- Auto-confirmed in demo mode (`email_confirm: true`)
- Production should send verification emails

### **Session Security**
- JWT access tokens
- Token validation on each request
- Automatic session expiry via Supabase
- Secure token storage in localStorage

### **API Protection**
- CORS enabled for all routes
- Authorization headers required for protected routes
- Service role key never exposed to frontend
- Anon key used for client-side operations

---

## Integration with Main App

### **App.tsx Structure**
```
App (AuthProvider)
  └─ MainApp (conditionally renders based on auth state)
      ├─ Login (if not authenticated)
      ├─ Signup (if not authenticated)
      └─ Dashboard + Layout (if authenticated)
          └─ SubscriptionProvider
              └─ CurrencyProvider
```

### **Loading State**
```tsx
if (isLoading) {
  return <LoadingScreen />;
}
```

### **Auth Gate**
```tsx
if (!user) {
  return <Login /> or <Signup />;
}
```

### **Authenticated App**
```tsx
return (
  <SubscriptionProvider>
    <CurrencyProvider>
      <Layout>
        {/* Main app content */}
      </Layout>
    </CurrencyProvider>
  </SubscriptionProvider>
);
```

---

## UI/UX Design

### **Design Principles**
- Minimalistic black and white theme
- Consistent with main EaziBook design
- Clean card-based layouts
- Clear call-to-action buttons
- Helpful error messages
- Loading states for all async operations

### **Branding**
- EaziBook logo/title on all auth pages
- "by LifeisEazi Group Enterprises" tagline
- Demo mode information cards
- Free plan feature preview on signup

### **Responsive Design**
- Mobile-first approach
- Single column on mobile
- Two/three columns on desktop (signup)
- Full-width forms with max-width constraint
- Proper padding and spacing

---

## User Information Display

### **Sidebar Footer**
- User name (truncated if long)
- User email (truncated if long)
- Rounded card with muted background
- Displayed above theme toggle and logout button

### **Example:**
```
┌─────────────────────┐
│ John Doe           │
│ john@example.com   │
└─────────────────────┘
```

---

## Error Handling

### **Common Errors**

**Login Errors:**
- "Please fill in all fields" - Missing email or password
- "Invalid email or password" - Authentication failed

**Signup Errors:**
- "Please fill in all fields" - Any field missing
- "Password must be at least 6 characters long"
- "Passwords do not match" - Confirmation mismatch
- "Please enter a valid email address" - Invalid format
- "Email already exists" - Duplicate account

**Session Errors:**
- Auto-logout if token invalid
- Silent error handling on session check
- Console logging for debugging

---

## Testing Notes

### **Demo/Development Mode**
- Email confirmation disabled
- No email server required
- All users auto-confirmed
- Passwords stored securely via Supabase

### **Test Accounts**
Create accounts directly via signup page:
1. Visit app
2. Click "Sign up"
3. Fill form with any valid email/password
4. Account created instantly

---

## Future Enhancements

1. **Social Login** - Google, Facebook, GitHub OAuth
2. **Password Reset** - Email-based password recovery
3. **Email Verification** - Production email confirmation
4. **Two-Factor Authentication** - Enhanced security
5. **Remember Me** - Extended session duration
6. **Account Management** - Profile editing, password change
7. **Session Management** - View/revoke active sessions
8. **Account Deletion** - GDPR compliance

---

*Last Updated: January 2025*