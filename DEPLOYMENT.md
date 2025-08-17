# Deployment Guide for TPT Seller Hub Static Site

## Step 1: Push to GitHub

### Option A: Using GitHub CLI (Recommended)
```bash
# Install GitHub CLI if not already installed
brew install gh

# Login to GitHub
gh auth login

# Create a new repository
gh repo create tpt-seller-hub --public --description "TPT Seller Hub - Static Site" --source=. --remote=origin --push

# Or if you want to create it manually on GitHub first:
gh repo create tpt-seller-hub --public --description "TPT Seller Hub - Static Site" --source=. --remote=origin --push --clone
```

### Option B: Manual GitHub Setup
1. Go to [GitHub.com](https://github.com) and create a new repository
2. Name it `tpt-seller-hub` (or your preferred name)
3. Make it public
4. Don't initialize with README, .gitignore, or license (we already have these)
5. Copy the repository URL

Then run these commands:
```bash
# Add the remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/tpt-seller-hub.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option B: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `static`
   - **Build Command**: Leave empty (no build required)
   - **Output Directory**: Leave empty (files are already in place)
   - **Install Command**: Leave empty
5. Click "Deploy"

## Step 3: Configure Vercel

After deployment, you may need to configure:

### Environment Variables (Optional)
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `OPENAI_API_KEY`: For AI features (optional)
- `SERPAPI_KEY`: For search data (optional)

### Custom Domain (Optional)
1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## Step 4: Verify Deployment

1. Check that your site loads correctly
2. Test authentication with Supabase
3. Verify all pages load and navigate properly
4. Test CSV import functionality
5. Check that stub services work without API keys

## Troubleshooting

### Common Issues

**Build Errors**
- Ensure the root directory is set to `static`
- No build command is needed for static sites

**404 Errors**
- Check that the `static` folder is the root directory
- Verify all file paths are correct

**CORS Issues**
- Ensure Supabase is configured to allow your Vercel domain
- Check that environment variables are set correctly

**Authentication Issues**
- Verify Supabase project settings
- Check redirect URLs in Supabase auth settings

## Next Steps

After successful deployment:
1. Set up custom domain (if desired)
2. Configure Supabase auth redirects
3. Add environment variables for optional features
4. Set up monitoring and analytics
5. Configure CDN settings if needed

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **GitHub Docs**: [docs.github.com](https://docs.github.com)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
