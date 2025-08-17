# TPT Seller Hub - Static Version

A fully static version of the TPT Seller Hub that runs without any build steps or server requirements.

## How to Run

### Option 1: Direct File Opening
Simply double-click `static/index.html` to open the app in your browser. The app will work locally using the file protocol.

### Option 2: Host on Any Web Server
Upload the entire `/static` folder to any web server, CDN, or hosting service. The app will work from any URL.

### Option 3: Local Development Server
If you prefer a local server for development:

```bash
# Using Python 3
cd static
python -m http.server 8000

# Using Node.js
cd static
npx serve .

# Using PHP
cd static
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## How to Configure

1. **Copy the config file:**
   ```bash
   cp assets/config.example.js assets/config.js
   ```

2. **Edit `assets/config.js` and set your API keys:**
   ```javascript
   window.APP_CONFIG = {
       SUPABASE_URL: "your-supabase-url",
       SUPABASE_ANON_KEY: "your-supabase-anon-key",
       OPENAI_API_KEY: "your-openai-key", // optional
       SERPAPI_KEY: "your-serpapi-key", // optional
       BUFFER_WEBHOOK_URL: "your-buffer-webhook" // optional
   };
   ```

3. **API Keys Explained:**
   - **SUPABASE_URL & SUPABASE_ANON_KEY**: Required for authentication and database
   - **OPENAI_API_KEY**: Optional - enables AI-powered content generation (runs in stub mode without it)
   - **SERPAPI_KEY**: Optional - enables real search engine ranking data (runs in stub mode without it)
   - **BUFFER_WEBHOOK_URL**: Optional - for social media scheduling

## Features

### ✅ What Works Out of the Box
- **Authentication**: Full Supabase auth with magic links
- **Product Management**: Import products via CSV or URLs
- **Dashboard**: View products and basic stats
- **Navigation**: Hash-based routing between pages
- **Responsive Design**: Works on all devices
- **Toast Notifications**: User feedback system

### 🔄 Stub Mode (When No API Keys)
- **AI Content**: Generates templated content variations
- **Rank Tracking**: Shows deterministic pseudo-random positions
- **Search Results**: Displays realistic mock SERP data
- **Sales Analytics**: Generates sample sales data

### 🚧 Coming Soon
- **Product Editing**: Full CRUD operations
- **Advanced Analytics**: Charts and detailed metrics
- **Social Media**: Buffer integration for scheduling
- **SEO Tools**: Advanced optimization features

## File Structure

```
/static
├── index.html          # Main app shell
├── app.js             # App bootstrap and auth guard
├── router.js          # Hash-based routing
├── supa.js            # Supabase client and database helpers
├── ui.js              # DOM utilities and components
├── /assets
│   ├── config.js      # API configuration (edit this)
│   ├── config.example.js # Template config file
│   └── styles.css     # Custom styles (minimal)
├── /pages             # Page components
│   ├── landing.js     # Landing/signup page
│   ├── auth.js        # Login/signup forms
│   ├── dashboard.js   # Main dashboard
│   ├── products.js    # Product management
│   ├── product_detail.js # Product details
│   ├── rank_tracker.js # Rank tracking
│   ├── social.js      # Social content generation
│   ├── analytics.js   # Analytics dashboard
│   └── settings.js    # User settings
├── /services          # Business logic
│   ├── seo.js         # SEO analysis and suggestions
│   ├── ranks.js       # Rank tracking service
│   ├── social_gen.js  # Social content generation
│   ├── sales.js       # Sales analytics
│   ├── aiProvider.js  # AI content generation
│   └── serpProvider.js # Search engine data
└── /samples           # Sample CSV files
    ├── products_sample.csv
    └── sales_sample.csv
```

## Dependencies (CDN)

The app uses these CDN libraries:
- **Tailwind CSS**: `https://cdn.tailwindcss.com`
- **Supabase**: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
- **Chart.js**: `https://cdn.jsdelivr.net/npm/chart.js`
- **PapaParse**: `https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js`

## Browser Compatibility

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile**: iOS Safari 13+, Chrome Mobile 80+
- **Features**: ES2020 modules, async/await, fetch API

## Development Notes

### Adding New Pages
1. Create a new file in `/pages/`
2. Export a `renderPageName()` function
3. Add the route to `router.js`
4. Update navigation in other pages

### Adding New Services
1. Create a new file in `/services/`
2. Export your service functions
3. Import and use in your pages

### Styling
- Use Tailwind CSS classes for most styling
- Add custom styles to `assets/styles.css` only when necessary
- Keep custom CSS minimal (<10KB)

### State Management
- Use `window.app` for global app state
- Use local variables for page-specific state
- Avoid complex state management libraries

## Troubleshooting

### Common Issues

**"Cannot read property 'APP_CONFIG' of undefined"**
- Make sure `config.js` is loaded before `app.js`
- Check that the config file path is correct

**"Supabase is not defined"**
- Check that the Supabase CDN script loaded
- Verify network connectivity

**"Router is not defined"**
- Ensure all page files are properly exported
- Check for JavaScript errors in console

**Authentication not working**
- Verify Supabase credentials in `config.js`
- Check that Supabase project has auth enabled
- Ensure proper redirect URLs in Supabase settings

### Debug Mode
Open browser console and look for:
- JavaScript errors
- Network request failures
- Missing dependencies

## Deployment

### Netlify
1. Drag and drop the `/static` folder
2. Set build command to: `echo "No build required"`
3. Set publish directory to: `static`

### Vercel
1. Import the project
2. Set build command to: `echo "No build required"`
3. Set output directory to: `static`

### GitHub Pages
1. Push to GitHub
2. Enable Pages in repository settings
3. Set source to `/static` folder

### Any Static Hosting
The app works on any static hosting service that supports:
- HTML files
- JavaScript modules
- CORS for Supabase API calls

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify your configuration in `config.js`
3. Test with the sample data first
4. Ensure all CDN scripts are loading

---

**Note**: This is a static build - Edge Functions, cron jobs, and server-side features are not included. They can be added later as optional enhancements.
