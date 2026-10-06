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
| `RESEND_API_KEY` | **Yes** | [Resend](https://resend.com) API key, used to email every form submission. |
| `NOTIFY_EMAIL` | Optional | Where submissions are emailed (default `databasemaestro@gmail.com`; comma-separate for several). |
| `NOTIFY_FROM` | After DNS | `Kid-Venture <forms@kid-venture.com>` once the domain is verified in Resend (see below). |
| `PORT` | Optional | Port to listen on (default `5000`). |

The host must keep `DATA_DIR` between deploys/restarts (for example a Render or Railway persistent disk);
otherwise submissions are lost when the server restarts.

## Email alerts & DNS

Every "Request a spot" and contact submission is emailed to `NOTIFY_EMAIL`, with
reply-to set to the parent so you can just hit **Reply**.

1. Create a free account at [resend.com](https://resend.com), create an API key and set `RESEND_API_KEY`.
   If you sign up with `databasemaestro@gmail.com`, alerts work right away using Resend's test sender.
2. In Resend go to **Domains → Add domain → `kid-venture.com`**. Resend shows the exact records to add.
   They look like this (copy the real values from Resend, especially the DKIM key):

   | Type | Name (GoDaddy "Host") | Value | Priority |
   | --- | --- | --- | --- |
   | MX | `send` | `feedback-smtp.us-east-1.amazonses.com` | 10 |
   | TXT | `send` | `v=spf1 include:amazonses.com ~all` | |
   | TXT | `resend._domainkey` | `p=MIGfMA0G…` (unique key from Resend) | |
   | TXT | `_dmarc` | `v=DMARC1; p=none;` (recommended) | |

3. Add them at GoDaddy (**My Products → kid-venture.com → DNS → Add New Record**), then click **Verify** in Resend.
4. Set `NOTIFY_FROM=Kid-Venture <forms@kid-venture.com>` and restart.

These records live on the `send` subdomain, so they don't touch the existing Microsoft 365 email (the root `MX`
record pointing to `outlook.com`). Don't change or delete that record.
