# ☕ BlueBrew Coffee

<div align="center">
  <img src="./Coffee-shop-app-photos-14.2.26/Screenshot 2026-02-14 at 6.50.45 pm.png" width="100%" alt="BlueBrew Coffee App UI">
</div>

A modern, full-stack 3-tier web application serving as a fully functional coffee shop ordering system. Built with performance and scalability in mind, it features a sleek consumer-facing frontend, a robust API, and a reliable database backbone.

## 🚀 Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Infrastructure:** Docker, Docker Compose

## 📦 Project Structure

- `frontend/`: The Vite + React consumer application featuring modern UI components.
- `backend/`: The Node.js + Express REST API. Includes a production-ready Dockerfile.
- `database/`: Contains the PostgreSQL configuration and `init.sql` for automated schema creation and data seeding.
- `docker-compose.yml`: Orchestrates the entire application stack for seamless local development.

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## 🛠️ Quick Start (Local Environment)

1. **Clone the repository** (if you haven't already).
2. **Build and start the application** using the provided Docker configuration:
   ```bash
   docker-compose up --build
   ```
3. **Access the Application**:
   - **Frontend UI:** [http://localhost:3000](http://localhost:3000)
   - **Backend API:** [http://localhost:4000](http://localhost:4000)
   - **Postgres Database:** `localhost:5432` *(Credentials: user=`postgres`, password=`postgres`, db=`coffeeshop`)*

## 🌐 Notes for Production Deployment

To take this application to production, consider the following best practices:
- **Database:** Replace the local PostgreSQL container with a managed database service like AWS RDS. Ensure you update `DB_HOST`, `DB_USER`, `DB_PASS`, and `DB_NAME` accordingly.
- **Security:** 
  - Hash administrator passwords using `bcrypt` instead of storing them in plain text.
  - Enforce HTTPS and restrict CORS origins to trusted domains.
  - Implement JWT authentication for protected API routes.
- **Hosting:** Build the frontend context (`npm run build`) and host it statically (e.g., AWS S3 + CloudFront, Vercel, or Netlify).
