# Vercel Backend Setup Guide

This document explains how to deploy the production-ready backend infrastructure to Vercel.

## Prerequisites

- Supabase project created and configured
- OpenAI API key for receipt OCR analysis
- Vercel project connected to your GitHub repository

## Environment Variables

Set these environment variables in your Vercel project settings:

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### OpenAI Configuration
```
OPENAI_API_KEY=sk-your-api-key
```

## Architecture Overview

### Server Clients

**lib/supabase/server.ts** - User-authenticated server routes using Supabase Auth Helpers with cookies. Use this for all API routes that require user authentication.

**lib/supabase/admin.ts** - Admin/service role client for cron jobs and admin operations only. Never expose this client to users.

**lib/supabase/client.ts** - Browser client for client-side operations.

### API Routes

All routes return proper JSON error responses:

#### GET /api/health
Health check endpoint. No authentication required.

#### GET /api/auth/me
Returns authenticated user info. Requires Supabase session.

#### GET /api/transactions
Fetches user's transactions. Requires authentication.

#### POST /api/transactions
Creates new transaction. Requires authentication.

#### POST /api/receipts/upload
Uploads receipt image to Supabase Storage. Returns public URL.

#### POST /api/receipts/analyze
Analyzes receipt image using OpenAI Vision API. Returns extracted data.

## Deployment Checklist

1. **Environment Variables**
   - [ ] Set all required env vars in Vercel project settings
   - [ ] Verify NEXT_PUBLIC_* variables are marked as public
   - [ ] Test with `curl https://your-app.vercel.app/api/health`

2. **Supabase Setup**
   - [ ] Create `transactions` table with RLS enabled
   - [ ] Create `receipts` table with RLS enabled
   - [ ] Set up storage bucket `receipts` with proper permissions
   - [ ] Enable Row Level Security policies

3. **Database Tables**
   ```sql
   -- Create transactions table
   CREATE TABLE transactions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID NOT NULL REFERENCES auth.users(id),
     amount DECIMAL(12, 2) NOT NULL,
     category TEXT NOT NULL,
     description TEXT,
     date DATE NOT NULL,
     type TEXT NOT NULL, -- 'expense' or 'income'
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Create receipts table
   CREATE TABLE receipts (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID NOT NULL REFERENCES auth.users(id),
     transaction_id UUID REFERENCES transactions(id),
     image_url TEXT NOT NULL,
     extracted_data JSONB,
     confidence DECIMAL(3, 2),
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Enable RLS
   ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

   -- Create policies
   CREATE POLICY "Users can see own transactions"
     ON transactions FOR SELECT
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert own transactions"
     ON transactions FOR INSERT
     WITH CHECK (auth.uid() = user_id);
   ```

4. **Storage Bucket**
   - [ ] Create `receipts` bucket in Supabase Storage
   - [ ] Set bucket to private
   - [ ] Add RLS policy to allow authenticated users to upload

5. **Testing**
   - [ ] Test health check: `curl https://your-app.vercel.app/api/health`
   - [ ] Test auth endpoint: `curl https://your-app.vercel.app/api/auth/me`
   - [ ] Monitor Vercel Function logs for errors
   - [ ] Test with authenticated requests

## Troubleshooting

### "Failed to load '@supabase/ssr'"
This error occurs if the package isn't installed. Run `npm install @supabase/ssr`.

### "Unauthorized" error from API routes
Ensure Supabase session cookie is being sent. Check that middleware.ts is refreshing the session.

### OCR analysis returns 500 error
- Verify OPENAI_API_KEY is set in Vercel
- Check that image URL is publicly accessible
- Monitor OpenAI API usage and rate limits

### Image upload fails
- Verify Supabase Storage bucket exists and is named `receipts`
- Check storage policies allow authenticated users to upload
- Ensure NEXT_PUBLIC_SUPABASE_URL and keys are correct

## Production Monitoring

1. Check Vercel Function logs for errors
2. Monitor Supabase dashboard for database issues
3. Track OpenAI API usage for cost management
4. Set up Supabase alerts for abnormal activity

## Rollback

If issues occur:
1. Revert to previous deployment in Vercel
2. Check error logs to identify the issue
3. Fix and redeploy
