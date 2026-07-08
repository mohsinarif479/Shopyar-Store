Shopyar - Modern static storefront

How to use

1. Place your official logo at `assets/logo.jpg` or update the Branding tab in admin.
2. Start a local server to preview:

```powershell
cd "C:\Users\mohsi\Downloads\eccomerence Store"
python -m http.server 8000
```

3. Open:
- http://127.0.0.1:8000/index.html
- http://127.0.0.1:8000/shop.html
- http://127.0.0.1:8000/popular.html
- http://127.0.0.1:8000/deals.html
- http://127.0.0.1:8000/admin.html

Admin

- Email: admin@shopyar.com
- Password: shopyar123
- Admin pages: `admin.html`, `admin-orders.html`, `admin-products.html`, `admin-storefront.html`, `admin-slider.html`, `admin-branding.html`

Notes

- Local preview uses browser localStorage as a fallback.
- On Vercel, connect Vercel KV so products, orders, branding, slider, and storefront content are shared and persistent.
- Set `ADMIN_TOKEN` in Vercel Environment Variables. For the current admin screen, use `shopyar123` unless you also change `admin.js`.
- To deploy to Vercel, push this folder to GitHub and import the project into Vercel. `vercel.json` and `/api` routes are included.
