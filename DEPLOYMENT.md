# thoughts — Deployment & Neon Database Guide

This guide walks you step-by-step through setting up your **Neon Serverless PostgreSQL** database, deploying the app, and installing it as a standalone application on your devices.

---

## 1. Zero Data Loss Architecture

Your thoughts and private journal entries are protected with a **three-tier safety system**:

1. **Offline-First Instant Persistence**: Every thought you type is saved locally to your device's persistent storage immediately. You will **never lose writing** even if you close the tab, lose Wi-Fi, or haven't connected a database yet.
2. **One-Click JSON Backups**: Under **Settings → Data Protection & Backup**, you can download a full `.json` backup file anytime and restore it on any device with one click.
3. **Neon PostgreSQL Cloud Synchronization**: When connected to Neon, all your notes sync bidirectionally to the cloud.

---

## 2. Setting Up Your Free Neon PostgreSQL Database

[Neon](https://neon.tech) offers a free-tier serverless PostgreSQL database with automated backups and instant branching.

### Step 1: Create a Free Project
1. Go to [https://console.neon.tech](https://console.neon.tech) and sign up (or sign in with GitHub/Google).
2. Click **Create Project**.
3. Name your project (e.g. `thoughts-journal`) and choose a region close to you.
4. Click **Create Project**.

### Step 2: Initialize the Database Schema
1. In your Neon project dashboard, click **SQL Editor** on the left menu.
2. Open the file [`db/schema.sql`](./db/schema.sql) in this repository, copy all the SQL code, paste it into the Neon SQL Editor, and click **Run**.
3. You will see `CREATE TABLE` and `CREATE INDEX` confirmation messages. Your database is now ready!

### Step 3: Copy Your Connection String
1. On the Neon Dashboard, locate the **Connection Details** card.
2. Ensure **Connection string** is selected.
3. Copy the string. It will look like this:
   ```text
   postgresql://username:password@ep-cool-cloud-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

---

## 3. Deploying to Vercel (Recommended — Free & 2 Minutes)

Vercel provides native zero-configuration hosting for Vite + React with Serverless API functions:

1. Push this project to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "feat: thoughts journal with Neon & PWA"
   git remote add origin https://github.com/your-username/thoughts.git
   git push -u origin main
   ```
2. Go to [Vercel](https://vercel.com) and click **Add New... → Project**.
3. Import your `thoughts` repository.
4. Under **Environment Variables**, add:
   - **Key**: `DATABASE_URL`
   - **Value**: Your Neon PostgreSQL connection string from Section 2.
5. Click **Deploy**.
6. That's it! Your app will be live at `https://your-app.vercel.app` with instant Neon cloud sync.

---

## 4. Deploying to Render or Railway

If you prefer a continuous Node.js fullstack container:

### On Render (Free Web Service)
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New → Web Service**.
2. Connect your GitHub repository.
3. Configure:
   - **Environment**: Node
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. Under **Environment Variables**, add:
   - `DATABASE_URL`: *your Neon connection string*
5. Click **Create Web Service**.

### On Railway
1. Go to [Railway](https://railway.app/) and create a new project from your GitHub repo.
2. Add the variable `DATABASE_URL` with your Neon connection string.
3. Railway automatically detects `npm run build` and `npm start`.

---

## 5. Running Locally with Neon

To test the Neon cloud sync on your local computer:

1. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
2. Paste your Neon connection string inside `.env`:
   ```env
   DATABASE_URL="postgresql://username:password@ep-cool-cloud-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
   PORT=3001
   ```
3. Start the fullstack server:
   ```bash
   npm run build
   npm run server
   ```
4. Open [http://localhost:3001](http://localhost:3001) in your browser. All your entries will automatically save locally and sync to Neon!

---

## 6. How to Install as an "App" (PWA)

"thoughts" is configured as a standalone Progressive Web Application. You can install it on any computer or mobile device:

### Desktop (Google Chrome or Microsoft Edge)
- Click the **Install App** button in the sidebar, or
- Look at the right side of the URL address bar and click the **Install icon** (a small monitor with a downward arrow), then click **Install**.
- It opens in its own distraction-free, borderless native window with desktop dock/taskbar integration!

### iPhone / iPad (Apple Safari)
1. Open the website in **Safari**.
2. Tap the **Share** button (box with an upward arrow at the bottom).
3. Scroll down and tap **Add to Home Screen**.
4. Tap **Add**. The app icon will appear on your home screen and open in full-screen standalone mode without any browser chrome.

### Android (Google Chrome)
1. Open the website in **Chrome**.
2. Tap the **Install App** button in the sidebar, or tap the three dots **(⋮)** in the top right corner.
3. Tap **Install app** or **Add to Home screen**.
