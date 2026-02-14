# TRULAX Remedies — GitHub Pages site

This is a simple static site (HTML/CSS/JS) designed to be hosted on **GitHub Pages**.

## Local preview

From the repo root:

```bash
cd trulax-site
python3 -m http.server 8080
```

Then open http://localhost:8080

## Add your images

Place your images here:

- `trulax-site/assets/logo.png`
- `trulax-site/assets/product-tube.png`
- `trulax-site/assets/product-benefits.png`

You can rename these, just update the paths in `index.html`.

## Deploy to GitHub Pages

### Option A: Pages from `/trulax-site` (recommended)
1. Push to GitHub
2. Repo Settings → Pages
3. Build and deployment → Source: **Deploy from a branch**
4. Branch: `main` (or `master`)
5. Folder: `/trulax-site`

### Option B: Pages from root
Move the site files to the repository root (not recommended if this repo is code-heavy).

## Customize
- Replace lorem ipsum copy in `index.html`
- Update colors in `styles.css` (`:root` section)
- Replace email/social links in the Contact section

