# Aura App — Frontend

React PWA built with Vite. Deploys automatically to GitHub Pages (or Hostinger Business) on every push to `main`.

## Structure
```
aura-app/
├── index.html              # Root HTML shell
├── vite.config.js          # Vite build config
├── package.json            # Dependencies
├── public/
│   ├── manifest.json       # PWA manifest (install on mobile/desktop)
│   └── .htaccess           # For Hostinger shared hosting — React routing fix
├── src/
│   ├── main.jsx            # React entry point
│   └── App.jsx             # Full Aura application (all screens)
└── .github/
    └── workflows/
        └── deploy.yml      # Auto-build + deploy to GitHub Pages on push
```

## Deploy

### GitHub Pages (standard shared hosting plan)
1. Go to repo **Settings → Pages → Source → GitHub Actions**
2. Add these **Settings → Secrets → Actions → New secret**:
   - `VITE_API_URL` → your Vercel backend URL (e.g. `https://aura-backend.vercel.app`)
3. Push any change to `main` — GitHub builds and deploys automatically in ~2 min
4. App lives at `https://yourusername.github.io/aura-app`

### Hostinger Business/Cloud plan
1. hPanel → Websites → Add Website → Node.js Apps → Import Git Repository
2. Select this repo → framework auto-detected as Vite/React
3. Output dir: `dist`
4. Add env var: `VITE_API_URL` = your Vercel URL
5. Click Deploy — auto-redeploys on every push

### Point your custom domain
Add a CNAME record in Hostinger DNS:
- Name: `app`
- Value: `yourusername.github.io`

Then in GitHub Pages settings → Custom domain → `app.yourdomain.com`

## Environment Variables
| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ Yes | Your Vercel backend URL |
| `VITE_SUPABASE_URL` | Optional | Supabase project URL (Phase 2) |
| `VITE_SUPABASE_KEY` | Optional | Supabase anon key (Phase 2) |
