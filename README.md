# Gaming League Platform — Web

The web app for the eFootball mobile league platform: React + TypeScript, Vite, React Router and TanStack Query. It's mobile-first.

The API (ASP.NET Core, .NET 10) is a separate repository: **[gaming-league-platform](https://github.com/Moshood23/gaming-league-platform)**. It also holds the planning documents (business rules, schema, architecture).

## How the two fit together

The browser only ever talks to **one address**. The login cookie and the anti-forgery protection depend on it.

- **Development:** the Vite dev server serves the pages and forwards `/api` to the API on `http://localhost:5080`.
- **Production:** an nginx container serves the built pages and forwards `/api` and `/webhooks` to the API container.

So the web app never needs the API's address in its code, and no CORS is needed.

## Run it (VS Code)

### 1. Install

- **Node.js 22 LTS**: https://nodejs.org
- **VS Code**: https://code.visualstudio.com
- The **API** running locally. Follow the [API README](https://github.com/Moshood23/gaming-league-platform#readme).

### 2. Clone and open

In VS Code: **View → Command Palette → Git: Clone**, paste `https://github.com/Moshood23/gaming-league-platform-web.git`, and open the folder.

### 3. Start it

Open **Terminal → New Terminal** and run:

```bash
npm install     # first time, and after package.json changes
npm run dev
```

Open **http://localhost:5173**. The home page shows **Server: online** when the API is reachable. When you save a file, the browser reloads.

If your API runs on another address, set `API_URL` in the terminal before `npm run dev`:
- PowerShell: `$env:API_URL="https://localhost:7080"; npm run dev`
- bash: `API_URL=https://localhost:7080 npm run dev`

### 4. Try it

Open **Dev tools** in the menu (http://localhost:5173/dev). These tools only exist in `npm run dev`; production builds leave them out.

- **Inbox** (http://localhost:5173/dev/emails). Emails aren't sent in development. Confirmation, reset and notification emails appear here, with their links ready to click.
- **Create demo data.** Adds a demo league: an administrator, six players, a season in progress and a season open for registration. Click a club to log in as it; every demo account uses the password `DemoPass1`.
- **Make me administrator.** Gives the account you're logged in with the Administrator role.
- **Payments aren't real in development.** "Join" opens a test checkout page with a **Pay (test)** button.

## Commands

| Command | Does |
|---|---|
| `npm run dev` | Development server on http://localhost:5173 |
| `npm run lint` | Lint (oxlint) |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the built `dist/` locally |

GitHub Actions runs lint, build and a Docker build on every push.

## Deploying

The `Dockerfile` builds the app and serves it with nginx on port 8080. The container forwards `/api/` and `/webhooks/` to the address in `API_URL`.

```bash
docker build -t gaming-league-web .
docker run -p 8080:8080 -e API_URL=http://your-api-host:8080 gaming-league-web
```

Example with both containers on one Docker network:

```bash
docker network create league
docker run -d --name api --network league -v league-data:/data -e ... gaming-league-api    # see the API README for its settings
docker run -d --name web --network league -p 8080:8080 -e API_URL=http://api:8080 gaming-league-web
```

Then:

- Put HTTPS in front of the **web** container (your host's load balancer, Caddy or nginx).
- Don't publish the API container's port to the internet. Visitors and Paystack reach it only through the web container.
- In the API settings:
  - set `Frontend__BaseUrl` to the web address, e.g. `https://your-domain`;
  - if a load balancer also sits in front of the web container, set `ReverseProxy__ForwardLimit=2`.
- Paystack webhook URL: `https://your-domain/webhooks/payments`.

## Project layout

```
src/
  app/          routing, layout, route guards
  features/     one folder per feature: auth, profile, seasons, registrations, matches, standings,
                moderation, payouts, notifications, admin
  lib/          API client (cookies + anti-forgery header), formatting (₦, dates)
nginx/          production server config: page fallback, /api and /webhooks forwarding, headers
```
