# Nexum Backend

This is the **backend service** for **Nexum**, a web application that helps users track and manage job applications in one organized place.  
It provides a RESTful API for the frontend, handling authentication, CRUD operations for applications, and (soon) notifications and reminders.

Built with **NestJS**, **Prisma**, and **PostgreSQL**, the backend can be run locally or inside Docker.

---

## 🚀 Features

- 🧾 CRUD operations for job applications  
- 🔐 User authentication (JWT-based)  
- 📊 (Planned) Statistics and analytics endpoints  
- 🔔 (Planned) Notification and reminder system  
- 🐳 Docker support for easy deployment  
- 🧩 Type-safe database layer with Prisma ORM  

---

## 🛠️ Tech Stack

- **Framework:** [NestJS](https://nestjs.com/)  
- **ORM:** [Prisma](https://www.prisma.io/)  
- **Database:** [PostgreSQL](https://www.postgresql.org/)  
- **Containerization:** [Docker](https://www.docker.com/)  
- **Package Manager:** [pnpm](https://pnpm.io/)  

---

## ⚙️ Prerequisites

Before starting, make sure you have installed:

- **Node.js** (v18 or later)  
- **pnpm** (v8 or later)  
- **PostgreSQL** (local or Docker)  
- **Docker** (optional, if running via container)

---

## 🧠 Running Nexum Backend Locally

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/nexum-backend.git
cd nexum-backend
```

### 2. Install Dependencies

```bash
pnpm install
```

3. Setup Environment Variables

Create a .env file in the project root.
Example:

```env
# PostgreSQL connection URL
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/nexum"

# JWT secret key for authentication
JWT_SECRET="your_jwt_secret_here"

# Server port
PORT=5000
```

### 4. Run Database Migrations

```bash
pnpm prisma migrate dev
```

### 5. Start the Server

```bash
pnpm run dev
```

The backend will be running at:
👉 http://localhost:5000


🐳 Run with Docker

You can also start the backend (and PostgreSQL) using Docker:

```bash
docker-compose up --build
```

This will:

Start a PostgreSQL container

Run the Nexum backend on port 5000

Automatically connect Prisma to the database

To stop the containers:

```bash
docker-compose down
```

🔗 Frontend Connection

The Nexum frontend connects to this backend API.
Frontend runs on http://localhost:3000

➡️ nexum-frontend
