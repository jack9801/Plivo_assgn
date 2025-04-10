# Status Page Deployment Guide

This guide provides instructions for deploying the Status Page application to a production environment.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Email Configuration](#email-configuration)
5. [Build and Deployment](#build-and-deployment)
6. [Deployment Options](#deployment-options)

## Prerequisites

- Node.js 18.x or later
- PostgreSQL database
- Email service (SMTP) for notifications
- Git (for version control)

## Environment Setup

Create a `.env` file in the root of your project with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database_name?schema=public

# Email Configuration
EMAIL_HOST=your_smtp_host
EMAIL_PORT=your_smtp_port
EMAIL_USER=your_smtp_username
EMAIL_PASSWORD=your_smtp_password
EMAIL_FROM=your_from_email
EMAIL_SECURE=true_or_false
EMAIL_DEV_MODE=false

# Application URL for links in emails
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

Make sure to replace the placeholder values with your actual configuration.

## Database Setup

1. Create a PostgreSQL database for your application:

```sql
CREATE DATABASE status_page;
```

2. Generate and apply the Prisma schema:

```bash
npx prisma generate
npx prisma db push
```

## Email Configuration

The application uses SMTP for sending email notifications. You have several options:

1. **Production Email Services**:
   - [SendGrid](https://sendgrid.com/)
   - [Mailgun](https://www.mailgun.com/)
   - [Amazon SES](https://aws.amazon.com/ses/)
   - [Postmark](https://postmarkapp.com/)

2. **For testing**: [Mailtrap](https://mailtrap.io/) (as used in development)

Update the `.env` file with your email service credentials.

## Build and Deployment

1. Install dependencies:

```bash
npm install
```

2. Build the application:

```bash
npm run build
```

3. Start the production server:

```bash
# For Linux/Mac
npm start

# For Windows
npm run start:win
```

## Deployment Options

### 1. Vercel (Recommended)

[Vercel](https://vercel.com/) is the simplest option for deploying Next.js applications.

1. Create an account on Vercel
2. Install the Vercel CLI: `npm i -g vercel`
3. Run `vercel` in your project directory
4. Follow the prompts to deploy

You'll need to add all your environment variables in the Vercel dashboard.

### 2. Docker Deployment

Create a `Dockerfile` in your project root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run the Docker container:

```bash
docker build -t status-page .
docker run -p 3000:3000 --env-file .env status-page
```

### 3. Traditional VPS/Server

1. Clone the repository on your server
2. Install dependencies: `npm install`
3. Build the application: `npm run build`
4. Set up a process manager like PM2:

```bash
npm install -g pm2
pm2 start npm --name "status-page" -- start
pm2 save
pm2 startup
```

5. Set up a reverse proxy with Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Custom Server Considerations

The application uses a custom server setup in `server.js` to handle WebSocket connections via Socket.IO for real-time updates. Make sure your deployment environment supports WebSockets.

## SSL/TLS Configuration

For production, always use HTTPS. If you're using a service like Vercel, this is handled automatically. If you're managing your own server, set up SSL certificates using [Let's Encrypt](https://letsencrypt.org/) and configure your web server accordingly.

## Monitoring and Maintenance

- Set up monitoring tools like [UptimeRobot](https://uptimerobot.com/) or [Pingdom](https://www.pingdom.com/) to monitor your status page
- Regularly backup your database
- Set up log monitoring to track application issues 