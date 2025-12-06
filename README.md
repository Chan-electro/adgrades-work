# AdGrades

Internal client workflow app built with Next.js, Tailwind CSS, and Antigravity.

## Features

- **Secure Authentication**: 3-user limit, bcrypt hashing, HTTP-only sessions.
- **Dashboard**: KPI overview and workflow triggers.
- **Client Management**: Searchable client list, detailed client views with tabs.
- **Workflow Integration**: Placeholders for n8n webhooks (Research, Package generation).
- **Services**: Dynamic service selection and package pricing calculator.

## Quick Start

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Configure Environment**
    Copy `.env.example` to `.env` and fill in the values.
    ```bash
    cp .env.example .env
    ```

    **Generating Password Hashes:**
    Run this command to generate a bcrypt hash for your passwords:
    ```bash
    node -e "console.log(require('bcrypt').hashSync('yourPassword', 12))"
    ```
    Paste the output into `USER*_HASH` in `.env`.

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

4.  **Run Smoke Test**
    ```bash
    npm run test:smoke
    ```

## Environment Variables

- `USER*_ID`: Username for login.
- `USER*_HASH`: Bcrypt hash of the password.
- `SESSION_SECRET`: Long random string for session signing.
- `N8N_WEBHOOK_*`: URLs for n8n workflows. If empty, the app uses placeholder responses.

## Security Notes

- Rate limiting is enabled (5 attempts / 15 mins).
- Sessions are valid for 12 hours.
- In production, ensure `NODE_ENV=production` is set for secure cookies.
