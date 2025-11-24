# Nexum Backend

This is the **backend service** for **Nexum**, a web application that helps users track and manage job applications in one organized place.  
It provides a comprehensive RESTful API for the frontend, handling authentication, job applications, companies, interviews, reminders, activity logs, and data visualization.

Built with **NestJS**, **Prisma**, **PostgreSQL**, and **Redis**, the backend features background job processing, email notifications, and robust data analytics.

> **Live Demo:** [https://nexumtracker.com](https://nexumtracker.com)

---

## 🚀 Features

### Core Functionality

- 🧾 **Full CRUD for Job Applications** - Create, read, update, and delete job applications with detailed tracking
- 🏢 **Company Management** - Organize applications by company with contact information and notes
- 📅 **Interview Tracking** - Schedule and track interviews with status management (upcoming/done)
- 📝 **Activity Logs** - Maintain detailed history of application status changes with timestamps and notes
- 🔔 **Smart Reminders** - Set custom reminders with automated email notifications via background jobs

### Authentication & Security

- 🔐 **JWT-based Authentication** - Secure token-based auth with refresh tokens
- 👤 **User Management** - Registration, login, and profile management
- 🛡️ **Rate Limiting** - Built-in throttling to prevent abuse (30 requests/minute)
- 🔒 **Access Control** - Row-level security ensuring users only access their own data

### Analytics & Insights

- 📊 **Data Visualization** - Three chart types (pie, bar, sankey) with time-based filtering
- 📈 **Application Statistics** - Track application success rates and status distributions
- 🎯 **Priority & Favorites** - Prioritize applications and mark favorites for quick access
- 🔍 **Advanced Search & Filtering** - Filter by status, priority, and custom search queries
- 📄 **Pagination & Sorting** - Efficient data loading with multiple sorting strategies

### Technical Features

- 🐳 **Docker Support** - Production-ready containerization with multi-stage builds
- 🔄 **Background Jobs** - BullMQ with Redis for async email processing
- 📧 **Email Integration** - Automated reminder emails via Nodemailer
- 🎨 **API Documentation** - Interactive Swagger/OpenAPI documentation
- 🧩 **Type Safety** - End-to-end type safety with Prisma ORM and TypeScript
- ⚡ **Performance Optimized** - Efficient queries, indexing, and caching strategies

---

## 🛠️ Tech Stack

### Backend Framework & Language

- **[NestJS](https://nestjs.com/)** - Progressive Node.js framework for scalable server-side applications
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript with modern features

### Database & ORM

- **[PostgreSQL](https://www.postgresql.org/)** - Robust relational database
- **[Prisma](https://www.prisma.io/)** - Next-generation ORM with type safety and migrations

### Background Jobs & Caching

- **[Redis](https://redis.io/)** - In-memory data store for caching and job queues
- **[BullMQ](https://docs.bullmq.io/)** - Redis-based queue for background job processing

### Email & Notifications

- **[Nodemailer](https://nodemailer.com/)** - Email sending with Handlebars templates
- **[@nestjs-modules/mailer](https://github.com/nest-modules/mailer)** - NestJS integration for emails

### Authentication & Security

- **[Passport JWT](http://www.passportjs.org/)** - JWT authentication strategy
- **[bcrypt](https://github.com/kelektiv/node.bcrypt.js)** - Password hashing
- **[@nestjs/throttler](https://github.com/nestjs/throttler)** - Rate limiting

### API Documentation

- **[Swagger/OpenAPI](https://swagger.io/)** - Interactive API documentation

### Development & Deployment

- **[Docker](https://www.docker.com/)** - Containerization for consistent deployments
- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager

---

## ⚙️ Prerequisites

Before starting, make sure you have installed:

- **Node.js** (v22 or later)
- **pnpm** (v9 or later)
- **PostgreSQL** (v17 or later, local or Docker)
- **Redis** (v7 or later, for background jobs)
- **Docker** & **Docker Compose** (optional, for containerized development)

---

## 🧠 Getting Started

### Option 1: Local Development (Recommended for Development)

#### 1. Clone the Repository

```bash
git clone https://github.com/zh-deng/nexum-backend.git
cd nexum-backend
```

#### 2. Install Dependencies

```bash
pnpm install
```

#### 3. Setup Environment Variables

Create a `.env` file in the project root. You can use `.env.example` as a template:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/nexum"
POSTGRES_USER="nexum_user"
POSTGRES_PASSWORD="your_password"
POSTGRES_DB="nexum"
POSTGRES_PORT="5432"
POSTGRES_EXPOSED_PORT="5433"

# Redis (for background jobs)
REDIS_HOST="localhost"
REDIS_PORT="6379"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Application
BACKEND_PORT="3000"
BACKEND_EXPOSED_PORT="5000"
WEB_URL="http://localhost:3000"

# Email Configuration (for reminders)
MAIL_HOST="smtp.gmail.com"
MAIL_PORT="587"
MAIL_USER="your-email@gmail.com"
MAIL_PASS="your-app-password"

# Access Control
SIGNUP_ACCESS_CODE="your-signup-code"
```

> **Note:** For Gmail, you need to use an [App Password](https://support.google.com/accounts/answer/185833), not your regular password.

#### 4. Start PostgreSQL and Redis

If you have them installed locally, start the services. Or use Docker for just the databases:

```bash
# Start only Postgres and Redis with Docker
docker-compose up postgres redis -d
```

#### 5. Run Database Migrations

```bash
pnpm prisma migrate dev
```

#### 6. (Optional) Seed Sample Data

```bash
pnpm prisma db seed
```

This creates a demo user and sample applications for testing.

#### 7. Start the Development Server

```bash
pnpm run start:dev
```

The backend will be running at:

- 🌐 API: **http://localhost:5000**
- 📚 Swagger Docs: **http://localhost:5000/api**

---

### Option 2: Docker (Recommended for Production-like Environment)

Run the entire stack (PostgreSQL, Redis, and backend) with Docker Compose:

```bash
docker-compose up --build -d
```

This will:

- Start a PostgreSQL container on port `5433`
- Start a Redis container on port `6379`
- Build and run the backend on port `5000`
- Automatically run migrations on startup

To view logs:

```bash
docker-compose logs -f backend
```

To stop all containers:

```bash
docker-compose down
```

To reset the database:

```bash
docker-compose down -v  # Removes volumes
docker-compose up --build -d
```

---

## 📡 API Documentation

Once running, explore the full interactive API documentation at:

- **Swagger UI:** http://localhost:5000/api

The API includes endpoints for:

- **Authentication** - User registration, login, JWT tokens
- **Job Applications** - Full CRUD with search, filters, and pagination
- **Companies** - Manage application companies
- **Interviews** - Track interview schedules and outcomes
- **Reminders** - Automated email notifications
- **Activity Logs** - Detailed application history
- **Analytics** - Charts and statistics (pie, bar, sankey diagrams)

---

## 🚢 Deployment

This backend is production-ready with Docker support. See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guide to Fly.io or other platforms.

---

## 🏗️ Key Architecture Highlights

- **Multi-stage Docker builds** - Optimized for production with security best practices
- **Background job processing** - BullMQ + Redis for async email notifications
- **Type-safe database layer** - Prisma with automatic migrations
- **Modular NestJS structure** - Clean separation of concerns
- **JWT authentication** - Secure token-based auth with Passport
- **Rate limiting** - Built-in protection against abuse
- **API documentation** - Auto-generated Swagger from decorators

---

## 🔗 Related Projects

- **Frontend:** [nexum-frontend](https://github.com/zh-deng/nexum-frontend) - React + TypeScript web application
- **Live Application:** [https://nexumtracker.com](https://nexumtracker.com)

---

## 📝 License

This project is licensed under the UNLICENSED license - it is private and not for redistribution.

---

## 👨‍💻 Author

**zh-deng**

- GitHub: [@zh-deng](https://github.com/zh-deng)
