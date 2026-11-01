# ResourceX
# ResourceX — Share More. Waste Less.

**A Digital Resource-Sharing Platform for Institutions and Communities**

ResourceX is a web-based platform designed to help institutions, organizations, and communities discover, share, rent, and manage underutilized resources. It creates a structured ecosystem where resource owners can make unused spaces and equipment available to others, improving accessibility, utilization, and collaboration.

Instead of purchasing resources that may only be needed occasionally, users can discover and access existing resources through a centralized platform.

---

## 1. Problem Statement

Educational institutions, organizations, and communities often have valuable resources that remain underutilized.

Examples include:
- Classrooms and seminar halls.
- Laboratories and specialized equipment.
- Sports facilities and recreational spaces.
- Meeting rooms and workspaces.
- Tools, machinery, and other shared equipment.

At the same time, other individuals and organizations may need these resources but lack an efficient way to discover or access them.

ResourceX addresses this gap by connecting resource owners with people who need those resources.

## 2. Our Solution

ResourceX provides a centralized digital marketplace where:

- **Resource Owners** can list, manage, and monetize underutilized resources.
- **Borrowers** can discover resources, check availability, make bookings, and manage their requests.
- **Administrators** can monitor platform activities, manage users, moderate listings, and resolve reported issues.

The platform aims to promote efficient resource utilization, affordability, and community collaboration.

## 3. Key Features

### Resource Discovery
- Browse resources across multiple categories.
- Search and filter available resources.
- Sort listings based on relevant criteria.
- View detailed resource information, images, and availability.

### Authentication & User Management
- Secure user registration and login.
- Role-based access control.
- User profiles and account management.
- Separate owner and borrower experiences.

### Booking & Availability
- Interactive booking calendar.
- Resource availability management.
- Booking conflict and overlapping-request validation.
- FIFO-based waitlist functionality.
- Booking status tracking and notifications.

### Resource Owner Dashboard
- Add, edit, and manage resource listings.
- Upload resource images.
- Manage booking requests.
- Monitor resource activity.

### Borrower Dashboard
- Track current and previous bookings.
- Manage wishlists.
- Submit reviews and ratings.
- View booking-related notifications.

### Trust & Safety
- User reviews and ratings.
- Trust badges.
- Reporting and dispute management.
- Administrative moderation.
- Audit logs for important platform activities.

### Payment Management
- Razorpay payment gateway integration.
- Test-mode payment processing.
- Refund and security deposit workflows.
- Webhook-based payment event handling.

### Admin Dashboard
- User and listing management.
- Resource category management.
- Reports and dispute monitoring.
- Platform settings and audit logs.

## 4. Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 16, React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui, Radix UI |
| Backend | Next.js App Router |
| Database | SQLite (`node:sqlite`) |
| Authentication | JWT, HTTP-only cookies |
| Password Security | Scrypt hashing |
| Validation | Zod |
| Payments | Razorpay |
| Package Manager | pnpm |
| Runtime | Node.js |

## 5. System Architecture

ResourceX follows a full-stack web application architecture.

```text
             USERS
               |
               v
       NEXT.JS FRONTEND
       (React + TypeScript)
               |
               v
       APPLICATION LAYER
       (Next.js App Router)
               |
       +-------+--------+
       |       |        |
       v       v        v
   AUTH &   RESOURCE   BOOKING
   RBAC     MANAGEMENT SYSTEM
       |       |        |
       +-------+--------+
               |
               v
          SQLITE DATABASE
               |
       +-------+--------+
       |                |
       v                v
   RAZORPAY        NOTIFICATIONS
   INTEGRATION     & AUDIT LOGS
```

## 6. Getting Started

Follow these instructions to run ResourceX locally.

### Prerequisites

Install the following:

- Node.js (compatible with the project runtime).
- pnpm.
- Git.

### Step 1: Clone the Repository

```bash
git clone https://github.com/Wali-Ahmad1707/ResourceX.git
```

### Step 2: Navigate to the Project

```bash
cd ResourceX
```

### Step 3: Install Dependencies

```bash
pnpm install
```

### Step 4: Configure Environment Variables

Create your local environment file using `.env.example` as a reference.

```bash
copy .env.example .env.local
```

Configure the required environment variables before starting the application.

**Important:** Generate a secure JWT secret for local or production use. Never commit `.env.local` or expose payment credentials.

### Step 5: Start the Development Server

```bash
pnpm run dev
```

Open:

```text
http://localhost:3000
```

## 7. Security & Privacy

Security is an important part of ResourceX.

The project incorporates:

- Password hashing using scrypt.
- JWT-based authentication.
- HTTP-only authentication cookies.
- Role-based authorization.
- Server-side validation.
- Environment-based secret management.
- Protected administrative operations.
- Audit logging for important activities.

**Security Guidelines:**
- Never commit `.env.local` or production credentials.
- Use a strong, randomly generated `JWT_SECRET`.
- Keep Razorpay credentials in environment variables.
- Use HTTPS in production.
- Do not expose administrative credentials publicly.

## 8. Payment Integration

ResourceX integrates Razorpay for payment-related workflows.

The current implementation is configured for **Razorpay Test Mode**.

It supports payment-related workflows such as:
- Payment initiation.
- Security deposit handling.
- Refund workflows.
- Payment event processing through webhooks.

Live transactions require separate production configuration and verification.

## 9. Testing & Verification

The project includes automated tests and build verification.

The development verification report records:

- TypeScript type checking.
- Production build verification.
- Feature-specific automated test suites.
- Authentication and application workflow checks.

A previous development report recorded **144 passing tests**. Results should be revalidated against the latest code before a production release.

## 10. Deployment Considerations

ResourceX currently uses SQLite and local file uploads.

For production deployment, the hosting environment must support persistent database and upload storage.

Before deployment:

- Configure persistent storage for SQLite.
- Configure persistent storage for uploaded images.
- Set production environment variables.
- Configure Razorpay production credentials only after testing.
- Replace in-memory rate limiting with a distributed solution for multi-instance deployments.
- Enable HTTPS and production security settings.

A standard serverless deployment without persistent storage is not suitable for the current storage architecture without modifications.

## 11. Future Scope

ResourceX can be extended with:

- AI-powered resource recommendations.
- Smart resource demand forecasting.
- Institution-level resource analytics.
- Advanced availability optimization.
- Multi-institution resource networks.
- Mobile application support.
- Location-based resource discovery.
- Enhanced identity verification.
- Scalable cloud-based database and storage infrastructure.

These are proposed future enhancements, not claims about existing functionality.

## 12. Project Impact

ResourceX aims to create measurable value through:

- Better utilization of existing infrastructure.
- Reduced unnecessary purchases.
- Affordable access to equipment and facilities.
- Increased collaboration between institutions.
- More sustainable consumption practices.
- Improved visibility of underutilized resources.

**Our vision:** Build a connected ecosystem where useful resources are accessible to those who need them instead of remaining unused.

## 13. Project Team

| Name | Role |
|---|---|
| Wali Ahmad | Team Leader — Frontend Development & UI/UX |
| Mohd Sameer Kuraishi | Backend Development Lead |
| Hamza Zakir | Research & Quality Assurance |
| Mohd Uzair Akhtar | Product Strategy & Business Analysis |

## 14. Repository

**GitHub:** https://github.com/Wali-Ahmad1707/ResourceX

## 15. License

Add an appropriate open-source license before distributing or reusing this project.

---

<p align="center">
  <strong>ResourceX — Share More. Waste Less.</strong>
  <br/>
  Making existing resources more accessible, useful, and sustainable.
</p>
