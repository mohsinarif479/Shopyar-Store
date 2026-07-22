Shopyar Store

This storefront is deployed as a static site with Vercel serverless APIs.

Important deployment notes

- Products, orders, branding, slider, and storefront content are stored in Vercel KV.
- Browser `localStorage` is only a local preview/cache fallback. If one laptop looks correct but another device looks different, the first laptop is probably showing old localStorage data while the other device is showing Vercel KV/default data.
- Admin login does not use hardcoded credentials in the frontend. Vercel must have the required environment variables.

Required Vercel environment variables

Set these in Vercel Project Settings -> Environment Variables:

```env
ADMIN_EMAIL=admin@shopyar.com
ADMIN_PASSWORD_HASH=your_sha256_password_hash
ADMIN_TOKEN=a_long_random_secret_token
```

Generate a SHA-256 hash for your real admin password and use that value. Do not commit your real `.env` file.

Vercel KV

Connect Vercel KV to the project. Vercel should automatically add:

```env
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

After setting env variables, redeploy the project.

Setup check

Open this URL after deployment:

```text
https://your-domain.vercel.app/api/setup
```

It should return `ok: true`. If it returns missing env or KV errors, admin login and shared products will not work properly across devices.

Local preview

```powershell
cd "C:\Users\mohsi\Downloads\eccomerence Store"
python -m http.server 3000
```

Local static preview cannot fully test Vercel serverless APIs unless you use Vercel tooling. For deployed behavior, use the live Vercel URL.
