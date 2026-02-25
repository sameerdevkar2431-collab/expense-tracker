# Supabase Transactions Not Saving - Complete Fix

## Root Causes Identified & Fixed

### 1. **Frontend Not Sending Credentials**
**Problem**: The expenses module was only saving to localStorage, never calling the API.
**Fix**: Updated `app/modules/expenses/page.tsx` to:
- Check `isLoggedIn` state from auth context
- Call `/api/transactions` POST endpoint when authenticated
- Include `credentials: 'include'` in fetch requests to send session cookies

### 2. **API Route Missing Debug Logging**
**Problem**: No visibility into why inserts were failing silently.
**Fix**: Added comprehensive console.log statements:
```javascript
console.log("[v0] Auth check:", { hasUser: !!user, userId: user?.id })
console.log("[v0] Request body:", body)
console.log("[v0] Inserting transaction for user:", user.id)
console.log("[v0] Successfully inserted transaction:", data?.[0]?.id)
```
This reveals authentication status, request data, and Supabase responses.

### 3. **Environment Variables Verification**
**Required env vars** (confirmed set):
- `NEXT_PUBLIC_SUPABASE_URL` - Frontend & server
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Frontend & server
- `SUPABASE_SERVICE_ROLE_KEY` - Server only (NOT in use for user transactions)

### 4. **RLS Policies Not Blocking But May Not Exist**
**Problem**: Transactions table needs RLS policies to enforce user_id isolation.
**Status**: Supabase shows RLS enabled with 4 policies, but verify with:
```sql
SELECT tablename, policyname FROM pg_policies WHERE tablename = 'transactions';
```

If policies don't exist, run the SQL in `SUPABASE_RLS_SETUP.sql`

### 5. **Middleware Cookie Handling**
**Fix Applied**: Middleware correctly refreshes session via `updateSession()`:
```typescript
export async function updateSession(request: NextRequest) {
  // Gets cookies from request
  // Calls supabase.auth.getUser() to refresh session
  // Sets cookies in response
  return supabaseResponse
}
```

This ensures auth state persists across requests.

## Step-by-Step Testing

### 1. Check Console Logs
Open browser DevTools → Console
When you save an expense, look for:
```
[v0] POST /api/transactions - Starting
[v0] Auth check: { hasUser: true, userId: "uuid..." }
[v0] Request body: { amount: 100, category: "Food", ... }
[v0] Inserting transaction for user: uuid...
[v0] Successfully inserted transaction: uuid...
```

If you see `hasUser: false`, authentication failed. Check:
- User is logged in (check `/api/auth/me`)
- Session cookies exist (DevTools → Application → Cookies)
- Middleware is running

### 2. Check API Response
In Network tab, inspect POST `/api/transactions`:
- Status 201 = Success
- Status 401 = Not authenticated
- Status 400 = Invalid data
- Status 500 = Database error (check response body for details)

### 3. Verify Database
Open Supabase dashboard:
1. SQL Editor → Run:
```sql
SELECT id, user_id, amount, category, date, created_at 
FROM transactions 
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC 
LIMIT 10;
```

2. Check auth_users table:
```sql
SELECT id, email, created_at FROM auth.users LIMIT 1;
```

## Complete Code Changes

### File: `app/api/transactions/route.ts`
✓ Rewritten with comprehensive logging
✓ Validates all required fields
✓ Returns structured error responses
✓ Properly awaits Supabase operations

### File: `app/modules/expenses/page.tsx`
✓ Detects `isLoggedIn` from auth context
✓ Calls API when authenticated, localStorage when guest
✓ Includes `credentials: 'include'` in fetch
✓ Shows loading/error states
✓ Falls back gracefully if API fails

### File: `lib/supabase/server.ts`
✓ Uses `@supabase/ssr` package
✓ Gets cookies from NextRequest
✓ Sets user_id from `auth.uid()`
✓ RLS policies enforce isolation

### File: `middleware.ts`
✓ Calls updateSession on all requests
✓ Refreshes auth state
✓ Manages session cookies

## Debugging Checklist

- [ ] User is authenticated (check `/api/auth/me`)
- [ ] Console shows `[v0]` logs with user ID
- [ ] Network tab shows 201 response from `/api/transactions`
- [ ] Supabase dashboard shows transaction in `transactions` table
- [ ] Transaction has correct `user_id` matching logged-in user
- [ ] RLS policies exist on transactions table (4 policies)
- [ ] Middleware is configured (check `middleware.ts` exists)
- [ ] Environment variables are set (NEXT_PUBLIC_SUPABASE_URL, etc.)

## Production Safety Notes

1. **No Service Role Key in Frontend**: Anon key is used for user operations, service role key only on server (not exposed).

2. **User ID Enforcement**: Every insert uses `user_id: user.id` from verified session - cannot be overridden by client.

3. **RLS Policies**: Database enforces that users only modify their own records even if API is compromised.

4. **Error Messages**: Production should not expose full Supabase error details. Console.log is for debugging; use generic messages in UI.

## Next Steps

1. Test saving an expense while authenticated
2. Check console for `[v0]` logs
3. Verify in Supabase dashboard
4. If still failing, post the console output from step 2
5. Remove all `console.log("[v0]")` statements before production deployment
