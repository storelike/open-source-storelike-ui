# Base — E-commerce Starter Template

> **🤖 Don't want to set it up yourself?**
> **Our AI Agent can do everything for you — install, configure, launch, and connect Telegram.**
> **Just describe what you need in plain language — and it will be done.**
> Contact us: **pavel@lavrentev.tk**

A universal minimalist e-commerce template.
Perfect for launching a new store or customizing for any niche.
Clean structure, lightweight design, and full flexibility.

---

## Table of Contents

1. [What You Need](#1-what-you-need)
2. [Preparing Your VPS](#2-preparing-your-vps)
3. [Install Claude Code or OpenClaw (AI Assistant)](#3-install-claude-code-or-openclaw)
4. [Run the Store with Docker](#4-run-the-store-with-docker)
5. [Telegram Setup — Receive Orders](#5-telegram-setup--receive-orders)
6. [Verify Everything Works](#6-verify-everything-works)
7. [Get Help from Real People](#7-get-help-from-real-people)

---

## 1. What You Need

| Requirement | Minimum |
|-------------|---------|
| VPS (server) | 1 CPU, 1 GB RAM, Ubuntu 22.04 / 24.04 |
| Server access | SSH (login + password or key) |
| Telegram account | To receive orders from customers |
| Domain (optional) | e.g. `myshop.com` — not required to get started |

---

## 2. Preparing Your VPS

Connect to your server via SSH. If you're not sure how — use **PuTTY** (Windows) or **Terminal** (Mac/Linux):

```bash
ssh root@YOUR_SERVER_IP
```

### Install Docker

Docker runs your store in an isolated container. Install it with one command:

```bash
curl -fsSL https://get.docker.com | sh
```

Verify Docker is installed:

```bash
docker --version
```

You should see something like: `Docker version 27.x.x`

### Install Git

```bash
apt-get update && apt-get install -y git
```

### Download the Template

```bash
git clone https://github.com/storelike/open-source-storelike-ui.git
cd open-source-storelike-ui/ecommerce-templates/basic
```

---

## 3. Install Claude Code or OpenClaw

**Claude Code** and **OpenClaw** are AI assistants that help you configure and customize your store using plain language — no coding knowledge required.

### Option A: Claude Code (recommended)

```bash
# Install Node.js if not already installed
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Launch inside the project folder
cd open-source-storelike-ui/ecommerce-templates/basic
claude
```

On first launch, Claude Code will ask for an API key — get one at [console.anthropic.com](https://console.anthropic.com).

Once running, you can type in plain English:
> *"Change the button color to green"*
> *"Add a new product: Nike Sneakers, price $45"*

### Option B: OpenClaw

```bash
npm install -g openclaw
openclaw
```

---

## 4. Run the Store with Docker

From inside the `ecommerce-templates/basic` folder:

### Build the Image

```bash
docker build -t my-store .
```

This takes 2–5 minutes. Wait for `Successfully built`.

### Start the Container

```bash
docker run -d \
  --name my-store \
  --restart always \
  -p 8080:8080 \
  my-store
```

**Flags explained:**
- `-d` — run in background
- `--restart always` — auto-restart on server reboot
- `-p 8080:8080` — expose port 8080

### Check It's Running

```bash
docker ps
```

You should see a line with `my-store` and status `Up`.

Open your browser and go to:
```
http://YOUR_SERVER_IP:8080
```

---

## 5. Telegram Setup — Receive Orders

To receive customer order notifications in Telegram, follow these steps.

### Step 1: Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Enter a display name, e.g.: `My Store Notifications`
4. Enter a username (Latin letters, must end in `bot`), e.g.: `myshop_notify_bot`
5. BotFather will give you a **token** — a string like:
   ```
   1234567890:AAEfhx3K2mhm0OdHs6FJWu8RkP8k4cRTNtI
   ```
   **Save this token!**

### Step 2: Find Your chat_id

1. Send any message to your new bot (e.g. `/start`)
2. Open this URL in your browser (replace with your token):
   ```
   https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
   ```
3. In the response find `"chat":{"id":XXXXXXX}` — this is your **chat_id**

### Step 3: Add Keys to the Project

Create a `.env` file in the `ecommerce-templates/basic` folder:

```bash
nano .env
```

Paste the following (replace with your values):

```env
TELEGRAM_BOT_TOKEN=1234567890:AAEfhx3K2mhm0OdHs6FJWu8RkP8k4cRTNtI
TELEGRAM_CHAT_ID=987654321
```

Save the file: `Ctrl+O`, then `Enter`, then `Ctrl+X`.

### Step 4: Restart the Store with Environment Variables

```bash
docker stop my-store && docker rm my-store

docker run -d \
  --name my-store \
  --restart always \
  -p 8080:8080 \
  --env-file .env \
  my-store
```

Every new order will now send a notification directly to your Telegram.

---

## 6. Verify Everything Works

```bash
# View store logs
docker logs my-store

# Restart if something went wrong
docker restart my-store

# Rebuild and redeploy after changes
docker build -t my-store . \
  && docker stop my-store \
  && docker rm my-store \
  && docker run -d --name my-store --restart always -p 8080:8080 --env-file .env my-store
```

---

## 7. Get Help from Real People

If you have any questions or run into issues — write to us. Real specialists will help with setup and launch:

**📧 pavel@lavrentev.tk**

We can help with:
- Connecting a domain and SSL certificate
- Setting up Telegram notifications
- Adding products and customizing the design
- Any technical questions about running the store

---

*Template: Base — open-source-storelike-ui*
*License: see [LICENSE](./LICENSE)*
