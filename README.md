# Kid-Venture

Website for Kid-Venture, an in-home daycare serving Lehi & American Fork, Utah.

- **Landing page wording:** edit `client/src/pages/landing/content.ts`
- **Enrollment form options** (topics, budget ranges, cities): edit `shared/inquiry.ts`

## Run locally

```bash
npm install
npm run dev        # http://localhost:5000
```

## Forms

| Form | Saved to | Admin page |
| --- | --- | --- |
| Request a spot | `data/inquiries.json` | `/admin/inquiries` |
| Contact | `data/contact-messages.json` | `/contact-messages` |

Log in as the admin user (`dorian`) to see submissions, update their status and export a CSV.

## Deploying

```bash
npm run build
npm start
```

Set these environment variables on your host:

| Variable | Required | Purpose |
| --- | --- | --- |
| `ADMIN_PASSWORD` | **Yes** | Password for the `dorian` admin login (the built-in default is public in this repo). |
| `SESSION_SECRET` | **Yes** | Any long random string. |
| `DATA_DIR` | Recommended | Folder on a persistent disk where form submissions are saved (default `./data`). |
| `RESEND_API_KEY` | Optional | [Resend](https://resend.com) key to email you each new submission. |
| `NOTIFY_EMAIL` | Optional | Where those emails go. |
| `NOTIFY_FROM` | Optional | Verified sender address (defaults to Resend's test sender). |
| `PORT` | Optional | Port to listen on (default `5000`). |

The host must keep `DATA_DIR` between deploys/restarts (for example a Render or Railway persistent disk);
otherwise submissions are lost when the server restarts.
