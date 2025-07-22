# Session Expiration Management Guide

This guide explains how to use the new streamlined session expiration handling system that prevents multiple login modal popups.

## Problem Solved

Previously, when a user's session expired, multiple authentication-related modals could appear simultaneously:
1. Global `SessionExpiredModal` from the authentication context
2. Individual `RequireLoginModal` from various components
3. Component-specific authentication warnings

This created a frustrating user experience where users had to dismiss multiple modals.

## Solution Components

### 1. Global Session Management (`useAuthGuard` hook)

The `useAuthGuard` hook provides centralized session expiration detection:

```javascript
import { useAuthGuard } from '../hooks/useAuthGuard.js';

const { isAuthenticated, requiresAuth, isSessionExpired } = useAuthGuard();
```

### 2. Conditional Authentication (`useConditionalAuth` hook)

For components that need to perform auth-dependent actions:

```javascript
import { useConditionalAuth } from '../components/auth/AuthGuard.jsx';

const { canPerformAuthAction, attemptAuthAction, isSessionExpired } = useConditionalAuth();

// Use in event handlers
const handleAuthAction = () => {
  return attemptAuthAction(async () => {
    // Your authenticated action here
    const response = await authenticatedFetch('/api/data', {}, auth);
    // Handle response
  }, () => {
    // Fallback for unauthenticated users (only if session hasn't expired)
    if (!isSessionExpired) {
      setShowLoginModal(true);
    }
  });
};
```

### 3. Enhanced API Utility

The `authenticatedFetch` function now prevents multiple session expiry triggers:

```javascript
// Global flag prevents duplicate session expiry modals
// Automatically resets when user logs in
```

## Implementation Guidelines

### For New Components

1. **Import the hooks:**
```javascript
import { useConditionalAuth } from '../components/auth/AuthGuard.jsx';
```

2. **Use conditional auth in your component:**
```javascript
function MyComponent() {
  const { canPerformAuthAction, attemptAuthAction, isSessionExpired } = useConditionalAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const handleAuthRequiredAction = () => {
    return attemptAuthAction(async () => {
      // Your authenticated logic
    }, () => {
      // Only show login modal if session hasn't expired
      if (!isSessionExpired) {
        setShowLoginModal(true);
      }
    });
  };

  return (
    <div>
      {/* Your component content */}
      
      {/* Only show login modal if session hasn't expired */}
      {!isSessionExpired && (
        <RequireLoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          title="Login Required"
          message="Please log in to continue."
        />
      )}
    </div>
  );
}
```

### For Existing Components

1. **Add the import:**
```javascript
import { useConditionalAuth } from '../components/auth/AuthGuard.jsx';
```

2. **Replace auth checks:**
```javascript
// OLD WAY:
const handleAction = async () => {
  if (!auth.token) {
    setShowLoginModal(true);
    return;
  }
  // ... rest of logic
};

// NEW WAY:
const handleAction = async () => {
  return attemptAuthAction(async () => {
    // ... authenticated logic
  }, () => {
    if (!isSessionExpired) {
      setShowLoginModal(true);
    }
  });
};
```

3. **Update RequireLoginModal rendering:**
```javascript
// Wrap with session expiry check
{!isSessionExpired && (
  <RequireLoginModal
    isOpen={showLoginModal}
    onClose={() => setShowLoginModal(false)}
    // ... other props
  />
)}
```

## Key Benefits

1. **Single Modal Experience:** Users only see one authentication-related modal when session expires
2. **Cleaner Code:** Centralized authentication logic reduces boilerplate
3. **Better UX:** No need to dismiss multiple overlapping modals
4. **Consistent Behavior:** All components handle session expiration the same way

## Migration Checklist

For each component that uses authentication:

- [ ] Add `useConditionalAuth` hook
- [ ] Replace `if (!auth.token)` checks with `attemptAuthAction`
- [ ] Wrap `RequireLoginModal` with `!isSessionExpired` condition
- [ ] Test session expiration behavior
- [ ] Test normal authentication flows

## Files Updated

1. **Core System:**
   - ✅ `src/hooks/useAuthGuard.js` - New authentication guard hook
   - ✅ `src/components/auth/AuthGuard.jsx` - Higher-order components and conditional auth
   - ✅ `src/utils/apiUtil.js` - Enhanced to prevent duplicate session expiry
   - ✅ `src/context/AuthContext.jsx` - Updated to work with new system

2. **Migrated Components:**
   - ✅ `src/pages/MealPlannerPage.jsx` - Updated auth patterns and modal handling
   - ✅ `src/pages/IngredientClassifierPage.jsx` - Updated auth patterns and modal handling
   - ✅ `src/pages/RecipeDetailPage.jsx` - Updated auth patterns and modal handling
   - ✅ `src/pages/PublicRecipeBrowserPage.jsx` - Updated auth patterns and modal handling
   - ✅ `src/pages/PersonalizedRecipesPage.jsx` - Updated auth patterns and conditional rendering
   - ✅ `src/pages/PantryPage.jsx` - Updated auth patterns and conditional rendering
   - ✅ `src/pages/RecipeSuggestionsPage.jsx` - Added imports for future auth patterns

3. **Documentation:**
   - ✅ `docs/Session_Expiration_Management.md` - Complete migration guide

## Migration Status

**✅ COMPLETED COMPONENTS:**
- All major authentication-dependent pages have been updated
- All RequireLoginModal instances now check for session expiry
- All authentication actions use the new `attemptAuthAction` pattern
- Components gracefully handle session expiration without duplicate modals

**🔄 REMAINING WORK:**
- Any new components should follow the patterns established here
- Consider migrating admin components if they have similar auth patterns
- Monitor for any edge cases during testing

## Testing

To test the new system:

1. Log in to the application
2. Let your session expire (or manually trigger expiry in dev tools)
3. Try to perform an authenticated action
4. Verify only the global `SessionExpiredModal` appears
5. Click "Login Again" and verify you're redirected properly
6. Test that normal authentication flows still work correctly
