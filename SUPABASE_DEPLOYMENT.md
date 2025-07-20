# Supabase Deployment Guide for Mental Health Chatbot

This guide will help you deploy your mental health chatbot to Supabase, including database setup, authentication, and Edge Functions.

## Prerequisites

- Supabase account (free tier available)
- Supabase CLI installed
- Node.js and npm installed
- Git repository set up

## Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `mental-health-chatbot`
   - Database Password: (generate a strong password)
   - Region: Choose closest to your users
5. Click "Create new project"
6. Wait for project to be created (2-3 minutes)

## Step 2: Install Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login
```

## Step 3: Initialize Supabase in Your Project

```bash
# Navigate to your project directory
cd MentalPEP

# Initialize Supabase
supabase init

# Link to your remote project
supabase link --project-ref YOUR_PROJECT_REF
```

Replace `YOUR_PROJECT_REF` with your actual project reference (found in your Supabase dashboard URL).

## Step 4: Configure Environment Variables

1. Go to your Supabase Dashboard → Settings → API
2. Copy the following values:
   - Project URL
   - Anon public key
   - Service role key (keep this secret)

3. Create a `.env` file in your project root:

```bash
# .env
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Update `frontend/supabase-client.js`:

```javascript
const supabaseUrl = 'your_project_url'
const supabaseAnonKey = 'your_anon_key'
```

## Step 5: Deploy Database Schema

```bash
# Push the database schema
supabase db push

# Verify the schema was applied
supabase db diff
```

## Step 6: Configure Authentication

1. Go to Supabase Dashboard → Authentication → Settings
2. Configure the following:

### Site URL
```
https://your-domain.com
```

### Redirect URLs
```
https://your-domain.com/index.html
https://your-domain.com/login.html
http://localhost:3000/index.html
http://localhost:3000/login.html
```

### Email Templates (Optional)
Customize email templates for:
- Confirm signup
- Reset password
- Magic link

### OAuth Providers
1. Go to Authentication → Providers
2. Enable Google OAuth:
   - Client ID: Your Google OAuth client ID
   - Client Secret: Your Google OAuth client secret
   - Redirect URL: `https://your-project-ref.supabase.co/auth/v1/callback`

## Step 7: Deploy Edge Functions

```bash
# Deploy the chat function
supabase functions deploy chat

# Verify deployment
supabase functions list
```

## Step 8: Configure Storage

1. Go to Supabase Dashboard → Storage
2. Create a new bucket called `avatars`
3. Set bucket to public
4. Configure RLS policies:

```sql
-- Allow users to upload their own avatars
CREATE POLICY "Users can upload own avatars" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to view avatars
CREATE POLICY "Users can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users can update own avatars" ON storage.objects
    FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete own avatars" ON storage.objects
    FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 9: Deploy Frontend

### Option A: Deploy to Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd frontend
vercel --prod
```

3. Configure environment variables in Vercel dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

### Option B: Deploy to Netlify

1. Create `netlify.toml` in your project root:

```toml
[build]
  publish = "frontend"
  command = ""

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Deploy to Netlify:
```bash
netlify deploy --prod
```

### Option C: Deploy to GitHub Pages

1. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./frontend
```

## Step 10: Configure Custom Domain (Optional)

1. Go to your hosting provider (Vercel/Netlify)
2. Add custom domain
3. Update Supabase redirect URLs
4. Configure DNS records

## Step 11: Set Up Monitoring

### Supabase Dashboard
- Monitor database performance
- Check authentication logs
- Review Edge Function logs

### External Monitoring
- Set up Uptime Robot for availability
- Configure error tracking (Sentry)
- Set up analytics (Google Analytics)

## Step 12: Security Configuration

### Environment Variables
- Never commit `.env` files
- Use environment variables in production
- Rotate keys regularly

### Database Security
- Enable RLS on all tables
- Review and test policies
- Monitor for suspicious activity

### API Security
- Rate limiting on Edge Functions
- Input validation
- CORS configuration

## Step 13: Testing

### Local Testing
```bash
# Start local Supabase
supabase start

# Test Edge Functions locally
supabase functions serve

# Test database locally
supabase db reset
```

### Production Testing
1. Test authentication flow
2. Test chat functionality
3. Test crisis detection
4. Test data persistence
5. Test real-time features

## Step 14: Performance Optimization

### Database
- Add appropriate indexes
- Monitor query performance
- Use connection pooling

### Edge Functions
- Optimize function size
- Use caching where appropriate
- Monitor execution time

### Frontend
- Optimize bundle size
- Use CDN for static assets
- Implement lazy loading

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check redirect URLs in Supabase
   - Verify domain configuration
   - Check CORS headers in Edge Functions

2. **Authentication Issues**
   - Verify OAuth configuration
   - Check redirect URLs
   - Review auth logs

3. **Database Connection Issues**
   - Check connection string
   - Verify RLS policies
   - Check database status

4. **Edge Function Errors**
   - Check function logs
   - Verify environment variables
   - Test function locally

### Debug Commands

```bash
# Check Supabase status
supabase status

# View logs
supabase logs

# Reset local database
supabase db reset

# Generate types
supabase gen types typescript --local > types.ts
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Authentication configured
- [ ] Edge Functions deployed
- [ ] Storage buckets created
- [ ] Frontend deployed
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Monitoring set up
- [ ] Security policies reviewed
- [ ] Performance tested
- [ ] Crisis resources updated
- [ ] Privacy policy updated
- [ ] Terms of service updated

## Maintenance

### Regular Tasks
- Monitor database performance
- Review authentication logs
- Update dependencies
- Backup database
- Review security policies

### Updates
- Keep Supabase CLI updated
- Update Edge Functions
- Monitor for breaking changes
- Test updates in staging

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Community](https://github.com/supabase/supabase/discussions)
- [Supabase Discord](https://discord.supabase.com)

---

**Important**: Remember to update crisis resources and emergency contact information for your deployment region. 