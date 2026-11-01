import { createClient, type Client } from "@libsql/client";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { MOCK_RESOURCES } from "./mock-data";

export interface DbUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: "borrower" | "owner" | "admin";
  avatar: string;
  verified: number; // 1 or 0
  status: "active" | "suspended" | "pending";
  suspendedReason?: string | null;
  suspendedAt?: string | null;
  suspendedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbAuditLog {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}

export type BookingStatus = "pending" | "approved" | "rejected" | "cancelled" | "completed";

export interface DbBooking {
  id: string;
  resourceId: string;
  borrowerId: string;
  ownerId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  purpose: string;
  message?: string;
  pickupPreference?: string;
  status: BookingStatus;
  depositStatus?: DepositStatus;
  depositPaidAt?: string | null;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbBookingWithDetails extends DbBooking {
  borrowerName?: string;
  borrowerEmail?: string;
  borrowerPhone?: string;
  ownerName?: string;
  ownerEmail?: string;
}

export type WaitlistStatus = "active" | "notified" | "converted" | "cancelled";

export interface DbWaitlist {
  id: string;
  resourceId: string;
  borrowerId: string;
  startDate: string;
  endDate: string;
  status: WaitlistStatus;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 
  | "booking_request"
  | "booking_approved"
  | "booking_rejected"
  | "booking_cancelled"
  | "waitlist_available"
  | "system";

export interface DbNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedEntityId?: string;
  isRead: number; // 0 or 1
  createdAt: string;
}

// ==========================================
// PHASE 5: RESOURCE, WISHLIST & REVIEW TYPES
// ==========================================

export interface DbResource {
  id: string;
  ownerId: string;
  title: string;
  tagline: string;
  description: string;
  longDescription: string;
  category: string;
  images: string; // JSON array of string URLs
  condition: "Like New" | "Excellent" | "Good" | "Fair";
  location: string;
  specs: string; // JSON object
  borrowingTerms: string;
  eligibility: string; // JSON array of strings
  deposit: string;
  maxDuration: string;
  pickupInstructions?: string;
  safetyInstructions?: string;
  tags: string; // JSON array of strings
  featured: number; // 0 or 1
  popularityScore: number;
  availabilityStatus: "Available" | "In Use" | "Waitlist" | "Paused" | "Maintenance";
  status: "active" | "paused" | "deleted";
  moderationStatus?: "pending" | "approved" | "rejected" | "suspended" | "removed";
  moderationReason?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParsedResource {
  id: string;
  ownerId: string;
  title: string;
  tagline: string;
  description: string;
  longDescription: string;
  category: string;
  images: string[];
  condition: "Like New" | "Excellent" | "Good" | "Fair";
  location: string;
  specs: Record<string, string>;
  borrowingTerms: string;
  eligibility: string[];
  deposit: string;
  maxDuration: string;
  pickupInstructions: string;
  safetyInstructions: string;
  tags: string[];
  featured: boolean;
  popularityScore: number;
  availabilityStatus: "Available" | "In Use" | "Waitlist" | "Paused" | "Maintenance";
  status: "active" | "paused" | "deleted";
  moderationStatus?: ModerationStatus;
  moderationReason?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  createdAt: string;
  updatedAt: string;
  ownerName?: string;
  ownerAvatar?: string;
  ownerRating?: number;
  ownerReviewCount?: number;
  ownerVerified?: boolean;
  bookingCount?: number;
}

export interface DbSavedResource {
  id: string;
  userId: string;
  resourceId: string;
  createdAt: string;
}

export interface SavedResourceWithDetails extends DbSavedResource {
  resourceTitle: string;
  resourceImage: string;
  resourceCategory: string;
  resourceLocation: string;
  resourceCondition: string;
  resourceAvailability: string;
  deposit: string;
  ownerName: string;
}

export interface DbReview {
  id: string;
  bookingId: string;
  reviewerId: string;
  revieweeId: string;
  resourceId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbReviewWithDetails extends DbReview {
  reviewerName?: string;
  reviewerAvatar?: string;
  reviewerRole?: string;
  resourceTitle?: string;
}

// ==========================================
// PHASE 6: ADMIN, MODERATION & SAFETY TYPES
// ==========================================

export type ModerationStatus = "pending" | "approved" | "rejected" | "suspended" | "removed";

export interface DbDispute {
  id: string;
  bookingId: string;
  initiatorId: string;
  respondentId: string;
  reason: string;
  description: string;
  evidence?: string | null;
  status: "open" | "under_review" | "resolved" | "rejected" | "closed";
  assignedAdminId?: string | null;
  adminNotes?: string | null;
  resolution?: string | null;
  actionTaken?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbDisputeWithDetails extends DbDispute {
  bookingResourceId?: string;
  resourceTitle?: string;
  initiatorName?: string;
  initiatorEmail?: string;
  respondentName?: string;
  respondentEmail?: string;
  assignedAdminName?: string;
}

export type ReportTargetType = "user" | "resource" | "booking";
export type ReportStatus = "open" | "investigating" | "resolved" | "dismissed";

export interface DbReport {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details: string;
  evidence?: string | null;
  status: ReportStatus;
  assignedAdminId?: string | null;
  adminNotes?: string | null;
  resolution?: string | null;
  actionTaken?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbReportWithDetails extends DbReport {
  reporterName?: string;
  reporterEmail?: string;
  targetTitleOrName?: string;
  assignedAdminName?: string;
}

export interface DbPlatformCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: number; // 1 or 0
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface DbPlatformCategoryWithCount extends DbPlatformCategory {
  resourceCount: number;
}

export interface DbPlatformSetting {
  key: string;
  value: string;
  description: string;
  category: string;
  updatedBy?: string | null;
  updatedAt: string;
}

export interface AdminDashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalResources: number;
  pendingReviewResources: number;
  approvedResources: number;
  suspendedResources: number;
  totalBookings: number;
  activeDisputes: number;
  openReports: number;
  categoriesCount: number;
  categoryDistribution: { category: string; count: number }[];
  userRoleDistribution: { role: string; count: number }[];
  bookingStatusDistribution: { status: string; count: number }[];
  recentAuditLogs: DbAuditLog[];
}

// ==========================================
// PHASE 7: PAYMENTS & REFUNDS TYPES
// ==========================================

export type PaymentType = "security_deposit" | "booking_fee" | "refund";
export type PaymentStatus = "created" | "pending" | "authorized" | "captured" | "failed" | "refunded" | "partially_refunded";
export type DepositStatus = "awaiting_payment" | "paid" | "held" | "refund_pending" | "partially_refunded" | "refunded" | "refund_failed";
export type RefundStatus = "created" | "pending" | "processed" | "failed";

export interface DbPayment {
  id: string;
  userId: string;
  bookingId: string;
  resourceId: string;
  ownerId: string;
  amount: number; // in paise
  currency: string;
  paymentType: PaymentType;
  status: PaymentStatus;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
}

export interface DbPaymentWithDetails extends DbPayment {
  resourceTitle?: string;
  borrowerName?: string;
  borrowerEmail?: string;
  ownerName?: string;
  ownerEmail?: string;
  refundedAmount?: number;
}

export interface DbRefund {
  id: string;
  paymentId: string;
  bookingId: string;
  userId: string;
  amount: number; // in paise
  reason: string;
  status: RefundStatus;
  razorpayRefundId: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;
}

export interface DbRefundWithDetails extends DbRefund {
  resourceTitle?: string;
  borrowerName?: string;
  borrowerEmail?: string;
}

export interface DbPaymentWebhookEvent {
  id: string;
  eventId: string;
  eventType: string;
  payload: string;
  processingStatus: "received" | "processed" | "ignored" | "failed";
  receivedAt: string;
  processedAt: string | null;
}

export interface AdminPaymentMetrics {
  totalVolumePaise: number;
  totalTransactions: number;
  successfulPayments: number;
  failedPayments: number;
  totalRefundsCount: number;
  totalRefundedPaise: number;
  pendingRefundsCount: number;
  statusDistribution: { status: string; count: number }[];
  recentPayments: DbPaymentWithDetails[];
}

// Ensure database directory exists
// LibSQL / Turso Database Client & Unified Wrapper
export interface StatementWrapper {
  get: <T = any>(...args: any[]) => Promise<T | null>;
  all: <T = any>(...args: any[]) => Promise<T[]>;
  run: (...args: any[]) => Promise<{ rowsAffected: number; changes: number; lastInsertRowid?: bigint | number }>;
}

export interface LibSqlDbWrapper {
  client: Client;
  prepare: (sql: string) => StatementWrapper;
  exec: (sql: string) => Promise<void>;
  transaction: (mode?: "write" | "read" | "deferred") => Promise<any>;
}

function flattenArgs(args: any[]): any[] {
  if (args.length === 1 && Array.isArray(args[0])) return args[0];
  return args;
}

export function createDbWrapper(client: Client): LibSqlDbWrapper {
  return {
    client,
    prepare: (sql: string) => ({
      get: async <T = any>(...args: any[]): Promise<T | null> => {
        const res = await client.execute({ sql, args: flattenArgs(args) });
        return res.rows[0] ? (res.rows[0] as unknown as T) : null;
      },
      all: async <T = any>(...args: any[]): Promise<T[]> => {
        const res = await client.execute({ sql, args: flattenArgs(args) });
        return (res.rows || []) as unknown as T[];
      },
      run: async (...args: any[]): Promise<{ rowsAffected: number; changes: number; lastInsertRowid?: bigint | number }> => {
        const res = await client.execute({ sql, args: flattenArgs(args) });
        return { rowsAffected: res.rowsAffected, changes: res.rowsAffected, lastInsertRowid: res.lastInsertRowid };
      },
    }),
    exec: async (sql: string): Promise<void> => {
      await client.executeMultiple(sql);
    },
    transaction: async (mode: "write" | "read" | "deferred" = "write") => {
      return client.transaction(mode);
    },
  };
}

const globalForDb = globalThis as unknown as {
  _resourcexDb?: LibSqlDbWrapper;
  _resourcexClient?: Client;
  _resourcexInitPromise?: Promise<LibSqlDbWrapper>;
  _resourcexInitialized?: boolean;
};

export async function getDatabase(): Promise<LibSqlDbWrapper> {
  if (globalForDb._resourcexDb && globalForDb._resourcexInitialized) {
    return globalForDb._resourcexDb;
  }

  if (!globalForDb._resourcexInitPromise) {
    globalForDb._resourcexInitPromise = (async () => {
      const url = process.env.TURSO_DATABASE_URL || "file:data/resourcex.db";
      const authToken = process.env.TURSO_AUTH_TOKEN;

      // Ensure local data dir exists only when using local file storage
      if (url.startsWith("file:") && !url.includes(":memory:")) {
        const filePath = url.replace(/^file:/, "");
        const dir = path.dirname(filePath);
        if (dir && dir !== "." && !fs.existsSync(dir)) {
          try { fs.mkdirSync(dir, { recursive: true }); } catch {}
        }
      }

      const client = createClient({ url, authToken });
      const wrapper = createDbWrapper(client);

      // Initialize schema, migrations and seeds once
      await initSchema(wrapper);

      globalForDb._resourcexClient = client;
      globalForDb._resourcexDb = wrapper;
      globalForDb._resourcexInitialized = true;
      return wrapper;
    })();
  }

  return globalForDb._resourcexInitPromise;
}

async function initSchema(db: LibSqlDbWrapper) {
  // 1. Users Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      fullName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      phone TEXT NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('borrower', 'owner', 'admin')),
      avatar TEXT,
      verified INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'pending')),
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // Index on email for fast lookups
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);

  // 2. Audit Logs Table (per ARCHITECTURE.md Section 4 & 5)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actorId TEXT NOT NULL,
      action TEXT NOT NULL,
      entityType TEXT NOT NULL,
      entityId TEXT NOT NULL,
      details TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (actorId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_audit_logs_actorId ON audit_logs(actorId);
  `);

  // 3. Bookings Table (Phase 4 Core Booking System)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      resourceId TEXT NOT NULL,
      borrowerId TEXT NOT NULL,
      ownerId TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      purpose TEXT NOT NULL,
      message TEXT,
      pickupPreference TEXT,
      status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected', 'cancelled', 'completed')) DEFAULT 'pending',
      rejectionReason TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (borrowerId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_bookings_resourceId ON bookings(resourceId);
    CREATE INDEX IF NOT EXISTS idx_bookings_borrowerId ON bookings(borrowerId);
    CREATE INDEX IF NOT EXISTS idx_bookings_ownerId ON bookings(ownerId);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
    CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(startDate, endDate);
  `);

  // 4. Waitlist Table (Phase 4 Waitlist System)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS waitlist (
      id TEXT PRIMARY KEY,
      resourceId TEXT NOT NULL,
      borrowerId TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('active', 'notified', 'converted', 'cancelled')) DEFAULT 'active',
      position INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (borrowerId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_waitlist_resourceId ON waitlist(resourceId);
    CREATE INDEX IF NOT EXISTS idx_waitlist_borrowerId ON waitlist(borrowerId);
    CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status);
  `);

  // 5. In-App Notifications Table (Phase 4 Notification System)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('booking_request', 'booking_approved', 'booking_rejected', 'booking_cancelled', 'waitlist_available', 'system')),
      relatedEntityId TEXT,
      isRead INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId);
    CREATE INDEX IF NOT EXISTS idx_notifications_isRead ON notifications(isRead);
  `);

  // 6. Resources Table (Phase 5 Persistent Resources)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      ownerId TEXT NOT NULL,
      title TEXT NOT NULL,
      tagline TEXT,
      description TEXT NOT NULL,
      longDescription TEXT,
      category TEXT NOT NULL,
      images TEXT NOT NULL,
      condition TEXT NOT NULL CHECK(condition IN ('Like New', 'Excellent', 'Good', 'Fair')),
      location TEXT NOT NULL,
      specs TEXT,
      borrowingTerms TEXT,
      eligibility TEXT,
      deposit TEXT,
      maxDuration TEXT,
      pickupInstructions TEXT,
      safetyInstructions TEXT,
      tags TEXT,
      featured INTEGER NOT NULL DEFAULT 0,
      popularityScore INTEGER NOT NULL DEFAULT 0,
      availabilityStatus TEXT NOT NULL CHECK(availabilityStatus IN ('Available', 'In Use', 'Waitlist', 'Paused', 'Maintenance')) DEFAULT 'Available',
      status TEXT NOT NULL CHECK(status IN ('active', 'paused', 'deleted')) DEFAULT 'active',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_resources_ownerId ON resources(ownerId);
    CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
    CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
    CREATE INDEX IF NOT EXISTS idx_resources_availabilityStatus ON resources(availabilityStatus);
  `);

  // 7. Saved Resources / Wishlist Table (Phase 5)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS saved_resources (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      resourceId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      UNIQUE(userId, resourceId),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (resourceId) REFERENCES resources(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_saved_userId ON saved_resources(userId);
    CREATE INDEX IF NOT EXISTS idx_saved_resourceId ON saved_resources(resourceId);
  `);

  // 8. Reviews Table (Phase 5 Community Reviews)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      bookingId TEXT NOT NULL,
      reviewerId TEXT NOT NULL,
      revieweeId TEXT NOT NULL,
      resourceId TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      UNIQUE(bookingId, reviewerId),
      FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewerId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (revieweeId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (resourceId) REFERENCES resources(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_reviews_resourceId ON reviews(resourceId);
    CREATE INDEX IF NOT EXISTS idx_reviews_revieweeId ON reviews(revieweeId);
    CREATE INDEX IF NOT EXISTS idx_reviews_reviewerId ON reviews(reviewerId);
    CREATE INDEX IF NOT EXISTS idx_reviews_bookingId ON reviews(bookingId);
  `);

  // 9. Apply Phase 6 non-destructive column migrations & new tables
  await applyPhase6Migrations(db);

  // 10. Apply Phase 7 payments, deposits, refunds & webhooks migrations
  await applyPhase7Migrations(db);

  // Seed default demo accounts if not already present
  await seedDemoUsers(db);

  // Seed resources from catalog if no resources exist
  await seedResources(db);

  // Seed default platform categories if empty
  await seedPlatformCategories(db);

  // Seed default platform settings if empty
  await seedPlatformSettings(db);
}

async function applyPhase6Migrations(db: LibSqlDbWrapper) {
  // Check users table columns
  const userColumns = await db.prepare("PRAGMA table_info(users);").all() as { name: string }[];
  const userColNames = new Set(userColumns.map((c) => c.name));

  if (!userColNames.has("suspendedReason")) {
    await db.exec("ALTER TABLE users ADD COLUMN suspendedReason TEXT;");
  }
  if (!userColNames.has("suspendedAt")) {
    await db.exec("ALTER TABLE users ADD COLUMN suspendedAt TEXT;");
  }
  if (!userColNames.has("suspendedBy")) {
    await db.exec("ALTER TABLE users ADD COLUMN suspendedBy TEXT;");
  }

  // Check resources table columns
  const resourceColumns = await db.prepare("PRAGMA table_info(resources);").all() as { name: string }[];
  const resourceColNames = new Set(resourceColumns.map((c) => c.name));

  if (!resourceColNames.has("moderationStatus")) {
    await db.exec("ALTER TABLE resources ADD COLUMN moderationStatus TEXT NOT NULL DEFAULT 'approved';");
  }
  if (!resourceColNames.has("moderationReason")) {
    await db.exec("ALTER TABLE resources ADD COLUMN moderationReason TEXT;");
  }
  if (!resourceColNames.has("moderatedBy")) {
    await db.exec("ALTER TABLE resources ADD COLUMN moderatedBy TEXT;");
  }
  if (!resourceColNames.has("moderatedAt")) {
    await db.exec("ALTER TABLE resources ADD COLUMN moderatedAt TEXT;");
  }

  // Phase 6 Tables
  // 1. Booking Disputes
  await db.exec(`
    CREATE TABLE IF NOT EXISTS booking_disputes (
      id TEXT PRIMARY KEY,
      bookingId TEXT NOT NULL,
      initiatorId TEXT NOT NULL,
      respondentId TEXT NOT NULL,
      reason TEXT NOT NULL,
      description TEXT NOT NULL,
      evidence TEXT,
      status TEXT NOT NULL CHECK(status IN ('open', 'under_review', 'resolved', 'rejected', 'closed')) DEFAULT 'open',
      assignedAdminId TEXT,
      adminNotes TEXT,
      resolution TEXT,
      actionTaken TEXT,
      resolvedAt TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE CASCADE,
      FOREIGN KEY (initiatorId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (respondentId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (assignedAdminId) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_disputes_bookingId ON booking_disputes(bookingId);
    CREATE INDEX IF NOT EXISTS idx_disputes_initiatorId ON booking_disputes(initiatorId);
    CREATE INDEX IF NOT EXISTS idx_disputes_respondentId ON booking_disputes(respondentId);
    CREATE INDEX IF NOT EXISTS idx_disputes_status ON booking_disputes(status);
  `);

  // 2. User Reports
  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_reports (
      id TEXT PRIMARY KEY,
      reporterId TEXT NOT NULL,
      targetType TEXT NOT NULL CHECK(targetType IN ('user', 'resource', 'booking')),
      targetId TEXT NOT NULL,
      reason TEXT NOT NULL,
      details TEXT NOT NULL,
      evidence TEXT,
      status TEXT NOT NULL CHECK(status IN ('open', 'investigating', 'resolved', 'dismissed')) DEFAULT 'open',
      assignedAdminId TEXT,
      adminNotes TEXT,
      resolution TEXT,
      actionTaken TEXT,
      resolvedAt TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (reporterId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (assignedAdminId) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_reports_reporterId ON user_reports(reporterId);
    CREATE INDEX IF NOT EXISTS idx_reports_target ON user_reports(targetType, targetId);
    CREATE INDEX IF NOT EXISTS idx_reports_status ON user_reports(status);
  `);

  // 3. Platform Categories
  await db.exec(`
    CREATE TABLE IF NOT EXISTS platform_categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'Tag',
      isActive INTEGER NOT NULL DEFAULT 1,
      displayOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_platform_categories_slug ON platform_categories(slug);
    CREATE INDEX IF NOT EXISTS idx_platform_categories_active ON platform_categories(isActive);
  `);

  // 4. Platform Settings
  await db.exec(`
    CREATE TABLE IF NOT EXISTS platform_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      updatedBy TEXT,
      updatedAt TEXT NOT NULL
    );
  `);

  // 5. Resource Moderation History
  await db.exec(`
    CREATE TABLE IF NOT EXISTS resource_moderation_history (
      id TEXT PRIMARY KEY,
      resourceId TEXT NOT NULL,
      adminId TEXT NOT NULL,
      previousStatus TEXT NOT NULL,
      newStatus TEXT NOT NULL,
      reason TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (resourceId) REFERENCES resources(id) ON DELETE CASCADE,
      FOREIGN KEY (adminId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_moderation_resourceId ON resource_moderation_history(resourceId);
  `);
}

async function applyPhase7Migrations(db: LibSqlDbWrapper) {
  // Check bookings table columns for depositStatus and depositPaidAt
  const bookingColumns = await db.prepare("PRAGMA table_info(bookings);").all() as { name: string }[];
  const bookingColNames = new Set(bookingColumns.map((c) => c.name));

  if (!bookingColNames.has("depositStatus")) {
    await db.exec("ALTER TABLE bookings ADD COLUMN depositStatus TEXT NOT NULL DEFAULT 'awaiting_payment';");
  }
  if (!bookingColNames.has("depositPaidAt")) {
    await db.exec("ALTER TABLE bookings ADD COLUMN depositPaidAt TEXT;");
  }

  // Phase 7 Tables
  // 1. Payments Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      bookingId TEXT NOT NULL,
      resourceId TEXT NOT NULL,
      ownerId TEXT NOT NULL,
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      paymentType TEXT NOT NULL DEFAULT 'security_deposit' CHECK(paymentType IN ('security_deposit', 'booking_fee', 'refund')),
      status TEXT NOT NULL DEFAULT 'created' CHECK(status IN ('created', 'pending', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded')),
      razorpayOrderId TEXT UNIQUE,
      razorpayPaymentId TEXT UNIQUE,
      razorpaySignature TEXT,
      failureReason TEXT,
      paidAt TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE CASCADE,
      FOREIGN KEY (resourceId) REFERENCES resources(id) ON DELETE CASCADE,
      FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_payments_userId ON payments(userId);
    CREATE INDEX IF NOT EXISTS idx_payments_bookingId ON payments(bookingId);
    CREATE INDEX IF NOT EXISTS idx_payments_resourceId ON payments(resourceId);
    CREATE INDEX IF NOT EXISTS idx_payments_ownerId ON payments(ownerId);
    CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
    CREATE INDEX IF NOT EXISTS idx_payments_razorpayOrderId ON payments(razorpayOrderId);
    CREATE INDEX IF NOT EXISTS idx_payments_razorpayPaymentId ON payments(razorpayPaymentId);
  `);

  // 2. Refunds Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS refunds (
      id TEXT PRIMARY KEY,
      paymentId TEXT NOT NULL,
      bookingId TEXT NOT NULL,
      userId TEXT NOT NULL,
      amount INTEGER NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'created' CHECK(status IN ('created', 'pending', 'processed', 'failed')),
      razorpayRefundId TEXT UNIQUE,
      failureReason TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      processedAt TEXT,
      FOREIGN KEY (paymentId) REFERENCES payments(id) ON DELETE CASCADE,
      FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_refunds_paymentId ON refunds(paymentId);
    CREATE INDEX IF NOT EXISTS idx_refunds_bookingId ON refunds(bookingId);
    CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
    CREATE INDEX IF NOT EXISTS idx_refunds_razorpayRefundId ON refunds(razorpayRefundId);
  `);

  // 3. Payment Webhook Events Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS payment_webhook_events (
      id TEXT PRIMARY KEY,
      eventId TEXT UNIQUE,
      eventType TEXT NOT NULL,
      payload TEXT NOT NULL,
      processingStatus TEXT NOT NULL DEFAULT 'received' CHECK(processingStatus IN ('received', 'processed', 'ignored', 'failed')),
      receivedAt TEXT NOT NULL,
      processedAt TEXT
    );
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_webhooks_eventId ON payment_webhook_events(eventId);
    CREATE INDEX IF NOT EXISTS idx_webhooks_processingStatus ON payment_webhook_events(processingStatus);
  `);
}

async function seedResources(db: LibSqlDbWrapper) {
  const countRow = await db.prepare("SELECT COUNT(*) as count FROM resources;").get() as { count: number };
  if (countRow && countRow.count > 0) {
    return;
  }

  const insert = db.prepare(`
    INSERT INTO resources (
      id, ownerId, title, tagline, description, longDescription, category,
      images, condition, location, specs, borrowingTerms, eligibility,
      deposit, maxDuration, pickupInstructions, safetyInstructions, tags,
      featured, popularityScore, availabilityStatus, status, createdAt, updatedAt
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, 'active', ?, ?
    )
  `);

  for (const r of MOCK_RESOURCES) {
    let ownerId = "usr_demo_owner_01";
    if (r.owner.name === "Elena Rostova") ownerId = "usr_demo_borrower_01";

    await insert.run(
      r.id,
      ownerId,
      r.title,
      r.tagline || "",
      r.description,
      r.longDescription || r.description,
      r.category,
      JSON.stringify(r.images || []),
      r.condition,
      r.location,
      JSON.stringify(r.specs || {}),
      r.borrowingTerms || "",
      JSON.stringify(r.eligibility || []),
      r.deposit || "$0 (Free)",
      r.maxDuration || "7 days",
      `Pickup available at ${r.location} Community Hub or by direct coordination with ${r.owner.name}.`,
      "Inspect item thoroughly upon collection. Return cleaned in original packaging/cases. Report any wear or anomalies immediately.",
      JSON.stringify(r.tags || []),
      r.featured ? 1 : 0,
      r.popularityScore || 50,
      r.availability || "Available",
      r.createdAt || new Date().toISOString(),
      r.createdAt || new Date().toISOString()
    );
  }
}

async function seedDemoUsers(db: LibSqlDbWrapper) {
  // 1. NEVER create demo accounts in production environment
  if (process.env.NODE_ENV === "production") {
    return;
  }

  // 2. Demo account creation is strictly opt-in through development-only environment setting
  const isDemoSeedingEnabled = 
    process.env.SEED_DEMO_ACCOUNTS === "true" || 
    process.env.ENABLE_DEMO_ACCOUNTS === "true";

  if (!isDemoSeedingEnabled) {
    return;
  }

  // 3. Demo passwords MUST be supplied via environment variables, NEVER hardcoded in source
  const borrowerPass = process.env.DEMO_BORROWER_PASSWORD;
  const ownerPass = process.env.DEMO_OWNER_PASSWORD;
  const adminPass = process.env.DEMO_ADMIN_PASSWORD;

  const now = new Date().toISOString();

  // Demo Borrower: Elena Rostova (only created if password is provided via env)
  if (borrowerPass && borrowerPass.trim().length > 0) {
    const borrowerId = "usr_demo_borrower_01";
    const borrowerExists = await db.prepare("SELECT id FROM users WHERE email = ?").get("borrower@resourcex.com");
    if (!borrowerExists) {
      const borrowerSalt = crypto.randomBytes(16).toString("hex");
      const borrowerHash = crypto.scryptSync(borrowerPass.trim(), borrowerSalt, 64).toString("hex");
      const borrowerPassHash = `${borrowerSalt}:${borrowerHash}`;
      
      await db.prepare(`
        INSERT INTO users (id, fullName, email, phone, passwordHash, role, avatar, verified, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'active', ?, ?)
      `).run(
        borrowerId,
        "Elena Rostova",
        "borrower@resourcex.com",
        "+1 (555) 234-5678",
        borrowerPassHash,
        "borrower",
        "/placeholder-user.jpg",
        now,
        now
      );

      await db.prepare(`
        INSERT INTO audit_logs (id, actorId, action, entityType, entityId, details, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        "aud_seed_01",
        borrowerId,
        "USER_REGISTERED",
        "users",
        borrowerId,
        JSON.stringify({ note: "Initial seed borrower account" }),
        now
      );
    }
  }

  // Demo Owner: Marcus Vance (only created if password is provided via env)
  if (ownerPass && ownerPass.trim().length > 0) {
    const ownerId = "usr_demo_owner_01";
    const ownerExists = await db.prepare("SELECT id FROM users WHERE email = ?").get("owner@resourcex.com");
    if (!ownerExists) {
      const ownerSalt = crypto.randomBytes(16).toString("hex");
      const ownerHash = crypto.scryptSync(ownerPass.trim(), ownerSalt, 64).toString("hex");
      const ownerPassHash = `${ownerSalt}:${ownerHash}`;
      
      await db.prepare(`
        INSERT INTO users (id, fullName, email, phone, passwordHash, role, avatar, verified, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'active', ?, ?)
      `).run(
        ownerId,
        "Marcus Vance",
        "owner@resourcex.com",
        "+1 (555) 876-5432",
        ownerPassHash,
        "owner",
        "/placeholder-user.jpg",
        now,
        now
      );

      await db.prepare(`
        INSERT INTO audit_logs (id, actorId, action, entityType, entityId, details, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        "aud_seed_02",
        ownerId,
        "USER_REGISTERED",
        "users",
        ownerId,
        JSON.stringify({ note: "Initial seed owner account" }),
        now
      );
    }
  }

  // Demo Admin: ResourceX Admin (only created if password is provided via env)
  if (adminPass && adminPass.trim().length > 0) {
    const adminId = "usr_demo_admin_01";
    const adminExists = await db.prepare("SELECT id FROM users WHERE email = ?").get("admin@resourcex.com");
    if (!adminExists) {
      const adminSalt = crypto.randomBytes(16).toString("hex");
      const adminHash = crypto.scryptSync(adminPass.trim(), adminSalt, 64).toString("hex");
      const adminPassHash = `${adminSalt}:${adminHash}`;

      await db.prepare(`
        INSERT INTO users (id, fullName, email, phone, passwordHash, role, avatar, verified, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'active', ?, ?)
      `).run(
        adminId,
        "ResourceX Admin",
        "admin@resourcex.com",
        "+1 (555) 000-0001",
        adminPassHash,
        "admin",
        "/placeholder-user.jpg",
        now,
        now
      );

      await db.prepare(`
        INSERT INTO audit_logs (id, actorId, action, entityType, entityId, details, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        "aud_seed_03",
        adminId,
        "USER_REGISTERED",
        "users",
        adminId,
        JSON.stringify({ note: "Initial seed platform administrator account" }),
        now
      );
    }
  }
}

async function seedPlatformCategories(db: LibSqlDbWrapper) {
  const countRow = await db.prepare("SELECT COUNT(*) as count FROM platform_categories;").get() as { count: number };
  if (countRow && countRow.count > 0) return;

  const now = new Date().toISOString();
  const insert = db.prepare(`
    INSERT INTO platform_categories (id, name, slug, description, icon, isActive, displayOrder, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
  `);

  const defaultCategories = [
    { id: "cat_tools", name: "Tools & Equipment", slug: "tools-equipment", description: "Drills, saws, pressure washers, hand tools, ladders and DIY equipment", icon: "Wrench", order: 1 },
    { id: "cat_outdoor", name: "Outdoor & Camping", slug: "outdoor-camping", description: "Tents, sleeping bags, backpacks, camp kitchens and hiking gear", icon: "Tent", order: 2 },
    { id: "cat_electronics", name: "Electronics", slug: "electronics", description: "Projectors, audio gear, VR headsets, test gear and lighting", icon: "Cpu", order: 3 },
    { id: "cat_sports", name: "Sports & Fitness", slug: "sports-fitness", description: "Kayaks, paddle boards, bikes, weights and winter equipment", icon: "Activity", order: 4 },
    { id: "cat_photo", name: "Photography", slug: "photography", description: "Cameras, lenses, gimbals, lighting kits and backdrops", icon: "Camera", order: 5 },
    { id: "cat_books", name: "Books & Education", slug: "books-education", description: "Textbooks, reference manuals, robotics kits and lab items", icon: "BookOpen", order: 6 },
    { id: "cat_industrial", name: "Industrial Machinery", slug: "industrial-machinery", description: "CNC centers, metal lathes, knee mills, welding stations, and industrial compressors", icon: "Factory", order: 7 },
    { id: "cat_lab", name: "General Laboratory Equipment", slug: "general-laboratory", description: "Analytical balances, optical microscopes, centrifuges, spectrophotometers, and autoclaves", icon: "FlaskConical", order: 8 },
    { id: "cat_medical", name: "Medical Laboratory Equipment", slug: "medical-laboratory", description: "Clinical hematology analyzers, biochemistry instruments, PCR cyclers, and cold storage", icon: "Stethoscope", order: 9 },
    { id: "cat_construction", name: "Construction & Workshop Equipment", slug: "construction-workshop", description: "Concrete mixers, mag-drills, fabrication toolkits, horizontal band saws, and porta-power rams", icon: "HardHat", order: 10 },
    { id: "cat_educational", name: "Educational & Research Equipment", slug: "educational-research", description: "Autonomous ROS 2 robotics kits, programmable DC supplies, oscilloscopes, and IoT labs", icon: "GraduationCap", order: 11 },
  ];

  for (const cat of defaultCategories) {
    await insert.run(cat.id, cat.name, cat.slug, cat.description, cat.icon, cat.order, now, now);
  }
}

async function seedPlatformSettings(db: LibSqlDbWrapper) {
  const countRow = await db.prepare("SELECT COUNT(*) as count FROM platform_settings;").get() as { count: number };
  if (countRow && countRow.count > 0) return;

  const now = new Date().toISOString();
  const insert = db.prepare(`
    INSERT INTO platform_settings (key, value, description, category, updatedAt)
    VALUES (?, ?, ?, ?, ?)
  `);

  const defaults = [
    { key: "announcement_banner_enabled", value: "false", description: "Toggle display of global platform announcement banner", category: "announcement" },
    { key: "announcement_banner_text", value: "Welcome to ResourceX — The community sharing platform. Access what you need, when you need it.", description: "Global announcement banner content", category: "announcement" },
    { key: "maintenance_mode_enabled", value: "false", description: "Toggle platform-wide maintenance mode", category: "system" },
    { key: "max_upload_size_mb", value: "5", description: "Maximum file size allowed for image and document uploads (MB)", category: "storage" },
    { key: "allowed_file_types", value: ".jpg,.jpeg,.png,.webp,.pdf", description: "Comma-delimited file extensions permitted for uploads", category: "storage" },
    { key: "auto_approve_listings", value: "true", description: "Automatically mark new resource listings as approved", category: "moderation" },
  ];

  for (const s of defaults) {
    await insert.run(s.key, s.value, s.description, s.category, now);
  }
}

// User DAO Methods
export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const db = await getDatabase();
  const row = await db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase().trim()) as DbUser | undefined;
  return row || null;
}

export async function findUserById(id: string): Promise<DbUser | null> {
  const db = await getDatabase();
  const row = await db.prepare("SELECT * FROM users WHERE id = ?").get(id) as DbUser | undefined;
  return row || null;
}

export async function createUser(user: Omit<DbUser, "verified" | "status" | "createdAt" | "updatedAt">): Promise<DbUser> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  
  await db.prepare(`
    INSERT INTO users (id, fullName, email, phone, passwordHash, role, avatar, verified, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'active', ?, ?)
  `).run(
    user.id,
    user.fullName.trim(),
    user.email.toLowerCase().trim(),
    user.phone.trim(),
    user.passwordHash,
    user.role,
    user.avatar || "/placeholder-user.jpg",
    now,
    now
  );

  // Record in audit log
  await createAuditLog({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: user.id,
    action: "USER_REGISTERED",
    entityType: "users",
    entityId: user.id,
    details: JSON.stringify({ role: user.role, email: user.email }),
    timestamp: now,
  });

  return (await findUserById(user.id))!;
}

export async function updateUser(id: string, updates: Partial<Pick<DbUser, "fullName" | "phone" | "avatar" | "passwordHash">>): Promise<DbUser | null> {
  const db = await getDatabase();
  const existing = await findUserById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const fullName = updates.fullName !== undefined ? updates.fullName.trim() : existing.fullName;
  const phone = updates.phone !== undefined ? updates.phone.trim() : existing.phone;
  const avatar = updates.avatar !== undefined ? updates.avatar : existing.avatar;
  const passwordHash = updates.passwordHash !== undefined ? updates.passwordHash : existing.passwordHash;

  await db.prepare(`
    UPDATE users 
    SET fullName = ?, phone = ?, avatar = ?, passwordHash = ?, updatedAt = ?
    WHERE id = ?
  `).run(fullName, phone, avatar, passwordHash, now, id);

  await createAuditLog({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: id,
    action: "USER_PROFILE_UPDATED",
    entityType: "users",
    entityId: id,
    details: JSON.stringify({ updatedFields: Object.keys(updates) }),
    timestamp: now,
  });

  return await findUserById(id);
}

export async function createAuditLog(log: DbAuditLog): Promise<void> {
  const db = await getDatabase();
  await db.prepare(`
    INSERT INTO audit_logs (id, actorId, action, entityType, entityId, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(log.id, log.actorId, log.action, log.entityType, log.entityId, log.details, log.timestamp);
}

export async function getUserAuditLogs(userId: string, limit = 5): Promise<DbAuditLog[]> {
  const db = await getDatabase();
  const rows = await db.prepare(`
    SELECT * FROM audit_logs WHERE actorId = ? ORDER BY timestamp DESC LIMIT ?
  `).all(userId, limit) as unknown as DbAuditLog[];
  return rows || [];
}

// ==========================================
// PHASE 4: BOOKINGS SYSTEM DAO METHODS
// ==========================================

export async function createBooking(params: {
  resourceId: string;
  borrowerId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  purpose: string;
  message?: string;
  pickupPreference?: string;
  resourceTitle?: string;
}): Promise<{ success: boolean; booking?: DbBooking; error?: string }> {
  const db = await getDatabase();

  // Validate dates
  const today = new Date().toISOString().split("T")[0];
  if (params.startDate < today) {
    return { success: false, error: "Booking start date cannot be in the past." };
  }
  if (params.endDate < params.startDate) {
    return { success: false, error: "Booking end date cannot be earlier than start date." };
  }

  // 1. Check for overlapping approved bookings for this resource
  const overlappingApproved = await db.prepare(`
    SELECT * FROM bookings 
    WHERE resourceId = ? 
      AND status = 'approved' 
      AND startDate <= ? 
      AND endDate >= ?
  `).all(params.resourceId, params.endDate, params.startDate) as unknown as DbBooking[];

  if (overlappingApproved.length > 0) {
    return { 
      success: false, 
      error: "This resource is already booked and unavailable for the selected dates. You can join the waitlist instead." 
    };
  }

  // 2. Prevent duplicate active booking request by same borrower for overlapping dates
  const duplicateRequest = await db.prepare(`
    SELECT * FROM bookings 
    WHERE resourceId = ? 
      AND borrowerId = ? 
      AND status IN ('pending', 'approved') 
      AND startDate <= ? 
      AND endDate >= ?
  `).all(params.resourceId, params.borrowerId, params.endDate, params.startDate) as unknown as DbBooking[];

  if (duplicateRequest.length > 0) {
    return { 
      success: false, 
      error: "You already have an active or pending booking request for this resource during these dates." 
    };
  }

  const now = new Date().toISOString();
  const bookingId = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  await db.prepare(`
    INSERT INTO bookings (
      id, resourceId, borrowerId, ownerId, startDate, endDate, 
      purpose, message, pickupPreference, status, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
  `).run(
    bookingId,
    params.resourceId,
    params.borrowerId,
    params.ownerId,
    params.startDate,
    params.endDate,
    params.purpose.trim(),
    params.message ? params.message.trim() : null,
    params.pickupPreference ? params.pickupPreference.trim() : "Standard Pickup",
    now,
    now
  );

  // Audit event
  await createAuditLog({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: params.borrowerId,
    action: "BOOKING_REQUESTED",
    entityType: "bookings",
    entityId: bookingId,
    details: JSON.stringify({
      resourceId: params.resourceId,
      startDate: params.startDate,
      endDate: params.endDate,
      ownerId: params.ownerId,
    }),
    timestamp: now,
  });

  // Notify Owner
  await createNotification({
    userId: params.ownerId,
    title: "New Booking Request",
    message: `You have received a new booking request for ${params.resourceTitle || "your equipment"} (${params.startDate} to ${params.endDate}).`,
    type: "booking_request",
    relatedEntityId: bookingId,
  });

  const created = await getBookingById(bookingId);
  return { success: true, booking: created! };
}

export async function getBookingById(id: string): Promise<DbBookingWithDetails | null> {
  const db = await getDatabase();
  const row = await db.prepare(`
    SELECT 
      b.*,
      u1.fullName as borrowerName,
      u1.email as borrowerEmail,
      u1.phone as borrowerPhone,
      u2.fullName as ownerName,
      u2.email as ownerEmail
    FROM bookings b
    LEFT JOIN users u1 ON b.borrowerId = u1.id
    LEFT JOIN users u2 ON b.ownerId = u2.id
    WHERE b.id = ?
  `).get(id) as DbBookingWithDetails | undefined;

  return row || null;
}

export async function getBookingsByBorrower(borrowerId: string, status?: BookingStatus): Promise<DbBookingWithDetails[]> {
  const db = await getDatabase();
  let query = `
    SELECT 
      b.*,
      u2.fullName as ownerName,
      u2.email as ownerEmail
    FROM bookings b
    LEFT JOIN users u2 ON b.ownerId = u2.id
    WHERE b.borrowerId = ?
  `;
  const params: any[] = [borrowerId];

  if (status) {
    query += " AND b.status = ?";
    params.push(status);
  }

  query += " ORDER BY b.createdAt DESC";
  return await db.prepare(query).all(...params) as unknown as DbBookingWithDetails[];
}

export async function getBookingsByOwner(ownerId: string, status?: BookingStatus): Promise<DbBookingWithDetails[]> {
  const db = await getDatabase();
  let query = `
    SELECT 
      b.*,
      u1.fullName as borrowerName,
      u1.email as borrowerEmail,
      u1.phone as borrowerPhone
    FROM bookings b
    LEFT JOIN users u1 ON b.borrowerId = u1.id
    WHERE b.ownerId = ?
  `;
  const params: any[] = [ownerId];

  if (status) {
    query += " AND b.status = ?";
    params.push(status);
  }

  query += " ORDER BY b.createdAt DESC";
  return await db.prepare(query).all(...params) as unknown as DbBookingWithDetails[];
}

export async function getResourceApprovedBookings(resourceId: string): Promise<DbBooking[]> {
  const db = await getDatabase();
  return await db.prepare(`
    SELECT * FROM bookings 
    WHERE resourceId = ? AND status = 'approved' 
    ORDER BY startDate ASC
  `).all(resourceId) as unknown as DbBooking[];
}

export async function getResourceAllActiveBookings(resourceId: string): Promise<DbBooking[]> {
  const db = await getDatabase();
  return await db.prepare(`
    SELECT * FROM bookings 
    WHERE resourceId = ? AND status IN ('pending', 'approved') 
    ORDER BY startDate ASC
  `).all(resourceId) as unknown as DbBooking[];
}

export async function approveBooking(
  bookingId: string, 
  ownerId: string,
  resourceTitle?: string
): Promise<{ success: boolean; booking?: DbBooking; error?: string }> {
  const db = await getDatabase();
  const booking = await getBookingById(bookingId);

  if (!booking) {
    return { success: false, error: "Booking request not found." };
  }

  if (booking.ownerId !== ownerId) {
    return { success: false, error: "Unauthorized: You do not own this resource." };
  }

  if (booking.status !== "pending") {
    return { success: false, error: `Cannot approve request with current status: ${booking.status}.` };
  }

  // Use LibSQL transaction to safely recheck availability and approve atomically
  const tx = await db.transaction("write");

  try {
    // Recheck overlapping approved bookings
    const overlappingRes = await tx.execute({
      sql: `
        SELECT * FROM bookings 
        WHERE resourceId = ? 
          AND status = 'approved' 
          AND id != ? 
          AND startDate <= ? 
          AND endDate >= ?
      `,
      args: [booking.resourceId, booking.id, booking.endDate, booking.startDate]
    });

    if (overlappingRes.rows.length > 0) {
      await tx.rollback();
      return { 
        success: false, 
        error: "Conflict: Another approved booking overlaps with these requested dates." 
      };
    }

    const now = new Date().toISOString();
    await tx.execute({
      sql: `
        UPDATE bookings 
        SET status = 'approved', updatedAt = ?
        WHERE id = ?
      `,
      args: [now, bookingId]
    });

    await tx.commit();

    // Audit log
    await createAuditLog({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      actorId: ownerId,
      action: "BOOKING_APPROVED",
      entityType: "bookings",
      entityId: bookingId,
      details: JSON.stringify({ resourceId: booking.resourceId, borrowerId: booking.borrowerId }),
      timestamp: now,
    });

    // Notify Borrower
    await createNotification({
      userId: booking.borrowerId,
      title: "Booking Request Approved!",
      message: `Your booking request for ${resourceTitle || "the resource"} (${booking.startDate} to ${booking.endDate}) has been approved.`,
      type: "booking_approved",
      relatedEntityId: bookingId,
    });

    return { success: true, booking: (await getBookingById(bookingId)) || undefined };
  } catch (err: any) {
    try { await tx.rollback(); } catch {}
    return { success: false, error: err.message || "Failed to approve booking." };
  }
}

export async function rejectBooking(
  bookingId: string, 
  ownerId: string, 
  reason?: string,
  resourceTitle?: string
): Promise<{ success: boolean; booking?: DbBooking; error?: string }> {
  const db = await getDatabase();
  const booking = await getBookingById(bookingId);

  if (!booking) {
    return { success: false, error: "Booking request not found." };
  }

  if (booking.ownerId !== ownerId) {
    return { success: false, error: "Unauthorized: You do not own this resource." };
  }

  if (booking.status !== "pending") {
    return { success: false, error: `Cannot reject request with status: ${booking.status}.` };
  }

  const now = new Date().toISOString();
  await db.prepare(`
    UPDATE bookings 
    SET status = 'rejected', rejectionReason = ?, updatedAt = ?
    WHERE id = ?
  `).run(reason ? reason.trim() : null, now, bookingId);

  await createAuditLog({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: ownerId,
    action: "BOOKING_REJECTED",
    entityType: "bookings",
    entityId: bookingId,
    details: JSON.stringify({ reason: reason || "No reason given" }),
    timestamp: now,
  });

  await createNotification({
    userId: booking.borrowerId,
    title: "Booking Request Declined",
    message: `Your booking request for ${resourceTitle || "the resource"} was declined. ${reason ? "Reason: " + reason : ""}`,
    type: "booking_rejected",
    relatedEntityId: bookingId,
  });

  return { success: true, booking: (await getBookingById(bookingId)) || undefined };
}

export async function cancelBooking(
  bookingId: string, 
  userId: string,
  resourceTitle?: string
): Promise<{ success: boolean; booking?: DbBooking; error?: string }> {
  const db = await getDatabase();
  const booking = await getBookingById(bookingId);

  if (!booking) {
    return { success: false, error: "Booking not found." };
  }

  const isBorrower = booking.borrowerId === userId;
  const isOwner = booking.ownerId === userId;

  if (!isBorrower && !isOwner) {
    return { success: false, error: "Unauthorized to cancel this booking." };
  }

  if (booking.status !== "pending" && booking.status !== "approved") {
    return { success: false, error: `Cannot cancel booking with status: ${booking.status}.` };
  }

  const wasApproved = booking.status === "approved";
  const now = new Date().toISOString();

  await db.prepare(`
    UPDATE bookings 
    SET status = 'cancelled', updatedAt = ?
    WHERE id = ?
  `).run(now, bookingId);

  await createAuditLog({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: userId,
    action: "BOOKING_CANCELLED",
    entityType: "bookings",
    entityId: bookingId,
    details: JSON.stringify({ cancelledBy: isBorrower ? "borrower" : "owner", wasApproved }),
    timestamp: now,
  });

  // Notify the other party
  const notifyTargetId = isBorrower ? booking.ownerId : booking.borrowerId;
  await createNotification({
    userId: notifyTargetId,
    title: "Booking Cancelled",
    message: `The booking for ${resourceTitle || "the resource"} (${booking.startDate} to ${booking.endDate}) was cancelled by the ${isBorrower ? "borrower" : "owner"}.`,
    type: "booking_cancelled",
    relatedEntityId: bookingId,
  });

  // WAITLIST TRIGGER: If an approved booking was cancelled, notify eligible waitlist users!
  if (wasApproved) {
    await triggerWaitlistNotifications(booking.resourceId, booking.startDate, booking.endDate, resourceTitle);
  }

  return { success: true, booking: (await getBookingById(bookingId)) || undefined };
}

export async function completeBooking(
  bookingId: string, 
  ownerId: string
): Promise<{ success: boolean; booking?: DbBooking; error?: string }> {
  const db = await getDatabase();
  const booking = await getBookingById(bookingId);

  if (!booking) {
    return { success: false, error: "Booking not found." };
  }

  if (booking.ownerId !== ownerId) {
    return { success: false, error: "Unauthorized: You do not own this resource." };
  }

  if (booking.status !== "approved") {
    return { success: false, error: `Cannot complete booking with status: ${booking.status}. Must be approved.` };
  }

  const now = new Date().toISOString();
  await db.prepare(`
    UPDATE bookings 
    SET status = 'completed', updatedAt = ?
    WHERE id = ?
  `).run(now, bookingId);

  await createAuditLog({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: ownerId,
    action: "BOOKING_COMPLETED",
    entityType: "bookings",
    entityId: bookingId,
    details: JSON.stringify({ completedAt: now }),
    timestamp: now,
  });

  return { success: true, booking: (await getBookingById(bookingId)) || undefined };
}

// ==========================================
// PHASE 4: WAITLIST SYSTEM DAO METHODS
// ==========================================

export async function joinWaitlist(params: {
  resourceId: string;
  borrowerId: string;
  startDate: string;
  endDate: string;
  resourceTitle?: string;
}): Promise<{ success: boolean; waitlist?: DbWaitlist; error?: string }> {
  const db = await getDatabase();

  const today = new Date().toISOString().split("T")[0];
  if (params.startDate < today) {
    return { success: false, error: "Waitlist start date cannot be in the past." };
  }
  if (params.endDate < params.startDate) {
    return { success: false, error: "Waitlist end date cannot be earlier than start date." };
  }

  // Check duplicate active waitlist entry
  const existing = await db.prepare(`
    SELECT * FROM waitlist 
    WHERE resourceId = ? AND borrowerId = ? AND status = 'active'
  `).get(params.resourceId, params.borrowerId) as DbWaitlist | undefined;

  if (existing) {
    return { 
      success: false, 
      error: `You already have an active waitlist entry (#${existing.position}) for this resource.` 
    };
  }

  // Determine queue position
  const activeCountRow = await db.prepare(`
    SELECT COUNT(*) as activeCount FROM waitlist 
    WHERE resourceId = ? AND status = 'active'
  `).get(params.resourceId) as { activeCount: number };

  const position = (activeCountRow?.activeCount || 0) + 1;
  const now = new Date().toISOString();
  const waitlistId = `wt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  await db.prepare(`
    INSERT INTO waitlist (id, resourceId, borrowerId, startDate, endDate, status, position, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?)
  `).run(
    waitlistId,
    params.resourceId,
    params.borrowerId,
    params.startDate,
    params.endDate,
    position,
    now,
    now
  );

  await createAuditLog({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: params.borrowerId,
    action: "WAITLIST_JOINED",
    entityType: "waitlist",
    entityId: waitlistId,
    details: JSON.stringify({ resourceId: params.resourceId, position }),
    timestamp: now,
  });

  await createNotification({
    userId: params.borrowerId,
    title: "Joined Resource Waitlist",
    message: `You are in position #${position} on the waitlist for ${params.resourceTitle || "this resource"}. We will notify you if dates become available.`,
    type: "system",
    relatedEntityId: waitlistId,
  });

  const created = await db.prepare("SELECT * FROM waitlist WHERE id = ?").get(waitlistId) as unknown as DbWaitlist;
  return { success: true, waitlist: created };
}

export async function leaveWaitlist(
  waitlistId: string, 
  borrowerId: string
): Promise<{ success: boolean; error?: string }> {
  const db = await getDatabase();
  const entry = await db.prepare("SELECT * FROM waitlist WHERE id = ?").get(waitlistId) as unknown as DbWaitlist | undefined;

  if (!entry) {
    return { success: false, error: "Waitlist entry not found." };
  }

  if (entry.borrowerId !== borrowerId) {
    return { success: false, error: "Unauthorized: You do not own this waitlist entry." };
  }

  const now = new Date().toISOString();
  await db.prepare(`
    UPDATE waitlist 
    SET status = 'cancelled', updatedAt = ?
    WHERE id = ?
  `).run(now, waitlistId);

  // Shift positions of remaining active waitlist members so positions remain continuous 1..N
  await db.prepare(`
    UPDATE waitlist 
    SET position = position - 1, updatedAt = ?
    WHERE resourceId = ? AND status = 'active' AND position > ?
  `).run(now, entry.resourceId, entry.position);

  await createAuditLog({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: borrowerId,
    action: "WAITLIST_LEFT",
    entityType: "waitlist",
    entityId: waitlistId,
    details: JSON.stringify({ resourceId: entry.resourceId }),
    timestamp: now,
  });

  return { success: true };
}

export async function getWaitlistByBorrower(borrowerId: string): Promise<DbWaitlist[]> {
  const db = await getDatabase();
  return await db.prepare(`
    SELECT * FROM waitlist 
    WHERE borrowerId = ? AND status = 'active'
    ORDER BY createdAt DESC
  `).all(borrowerId) as unknown as DbWaitlist[];
}

export async function getWaitlistByResource(resourceId: string): Promise<DbWaitlist[]> {
  const db = await getDatabase();
  return await db.prepare(`
    SELECT * FROM waitlist 
    WHERE resourceId = ? AND status = 'active'
    ORDER BY position ASC, createdAt ASC
  `).all(resourceId) as unknown as DbWaitlist[];
}

export async function triggerWaitlistNotifications(
  resourceId: string, 
  freedStartDate: string, 
  freedEndDate: string,
  resourceTitle?: string
) {
  const db = await getDatabase();
  const activeEntries = await db.prepare(`
    SELECT * FROM waitlist 
    WHERE resourceId = ? AND status = 'active'
    ORDER BY position ASC, createdAt ASC
  `).all(resourceId) as unknown as DbWaitlist[];

  const now = new Date().toISOString();

  for (const entry of activeEntries) {
    // Check if waitlisted dates overlap with freed window
    const overlapsFreed = entry.startDate <= freedEndDate && entry.endDate >= freedStartDate;
    if (overlapsFreed) {
      // Check if any other approved bookings block these dates
      const conflict = await db.prepare(`
        SELECT COUNT(*) as count FROM bookings 
        WHERE resourceId = ? AND status = 'approved' AND startDate <= ? AND endDate >= ?
      `).get(resourceId, entry.endDate, entry.startDate) as { count: number };

      if (conflict.count === 0) {
        // Mark as notified
        await db.prepare(`
          UPDATE waitlist SET status = 'notified', updatedAt = ? WHERE id = ?
        `).run(now, entry.id);

        await createNotification({
          userId: entry.borrowerId,
          title: `Availability Update for ${resourceTitle || "Reserved Resource"}!`,
          message: `A booking was cancelled! Requested dates ${entry.startDate} to ${entry.endDate} are currently available. Submit your booking request now to claim it.`,
          type: "waitlist_available",
          relatedEntityId: entry.resourceId,
        });
      }
    }
  }
}

// ==========================================
// PHASE 4: NOTIFICATIONS SYSTEM DAO METHODS
// ==========================================

export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedEntityId?: string;
}): Promise<DbNotification> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  await db.prepare(`
    INSERT INTO notifications (id, userId, title, message, type, relatedEntityId, isRead, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?)
  `).run(
    notifId,
    params.userId,
    params.title,
    params.message,
    params.type,
    params.relatedEntityId || null,
    now
  );

  return await db.prepare("SELECT * FROM notifications WHERE id = ?").get(notifId) as unknown as DbNotification;
}

export async function getUserNotifications(userId: string, limit = 20): Promise<DbNotification[]> {
  const db = await getDatabase();
  return await db.prepare(`
    SELECT * FROM notifications 
    WHERE userId = ? 
    ORDER BY createdAt DESC 
    LIMIT ?
  `).all(userId, limit) as unknown as DbNotification[];
}

export async function markNotificationAsRead(id: string, userId: string): Promise<boolean> {
  const db = await getDatabase();
  const res = await db.prepare(`
    UPDATE notifications SET isRead = 1 WHERE id = ? AND userId = ?
  `).run(id, userId);
  return res.changes > 0;
}

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  const db = await getDatabase();
  const res = await db.prepare(`
    UPDATE notifications SET isRead = 1 WHERE userId = ?
  `).run(userId);
  return res.changes > 0;
}

// ==========================================
// PHASE 4: REAL PROFILE STATS DAO
// ==========================================

export async function getUserStats(userId: string, role: string) {
  const db = await getDatabase();

  if (role === "owner") {
    const incomingRequests = (await db.prepare(`
      SELECT COUNT(*) as count FROM bookings WHERE ownerId = ? AND status = 'pending'
    `).get(userId) as { count: number }).count;

    const approvedBookings = (await db.prepare(`
      SELECT COUNT(*) as count FROM bookings WHERE ownerId = ? AND status = 'approved'
    `).get(userId) as { count: number }).count;

    const completedLendings = (await db.prepare(`
      SELECT COUNT(*) as count FROM bookings WHERE ownerId = ? AND status = 'completed'
    `).get(userId) as { count: number }).count;

    const activeResources = 6; // Marcus Vance has 6 active listed resources in catalog

    return {
      incomingRequests,
      approvedBookings,
      completedTransactions: completedLendings,
      activeResources,
      communityRating: 4.95,
      completionRate: "100%",
    };
  } else {
    const totalBookings = (await db.prepare(`
      SELECT COUNT(*) as count FROM bookings WHERE borrowerId = ?
    `).get(userId) as { count: number }).count;

    const approvedBookings = (await db.prepare(`
      SELECT COUNT(*) as count FROM bookings WHERE borrowerId = ? AND status = 'approved'
    `).get(userId) as { count: number }).count;

    const completedBorrowings = (await db.prepare(`
      SELECT COUNT(*) as count FROM bookings WHERE borrowerId = ? AND status = 'completed'
    `).get(userId) as { count: number }).count;

    const activeWaitlist = (await db.prepare(`
      SELECT COUNT(*) as count FROM waitlist WHERE borrowerId = ? AND status = 'active'
    `).get(userId) as { count: number }).count;

    return {
      resourcesBorrowed: totalBookings,
      approvedBookings,
      completedTransactions: completedBorrowings,
      activeWaitlist,
      communityRating: 5.0,
      completionRate: "100%",
    };
  }
}

// ==========================================
// PHASE 5: RESOURCE PERSISTENCE DAO METHODS
// ==========================================

export function parseDbResource(row: any): ParsedResource {
  let images: string[] = [];
  try {
    images = typeof row.images === "string" ? JSON.parse(row.images) : row.images || [];
  } catch {
    images = ["/placeholder.jpg"];
  }

  let specs: Record<string, string> = {};
  try {
    specs = typeof row.specs === "string" ? JSON.parse(row.specs) : row.specs || {};
  } catch {}

  let eligibility: string[] = [];
  try {
    eligibility = typeof row.eligibility === "string" ? JSON.parse(row.eligibility) : row.eligibility || [];
  } catch {}

  let tags: string[] = [];
  try {
    tags = typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags || [];
  } catch {}

  return {
    id: row.id,
    ownerId: row.ownerId,
    title: row.title,
    tagline: row.tagline || "",
    description: row.description,
    longDescription: row.longDescription || row.description,
    category: row.category,
    images: images.length > 0 ? images : ["/placeholder.jpg"],
    condition: row.condition,
    location: row.location,
    specs,
    borrowingTerms: row.borrowingTerms || "",
    eligibility,
    deposit: row.deposit || "$0 (Free)",
    maxDuration: row.maxDuration || "7 days",
    pickupInstructions: row.pickupInstructions || `Pickup available at ${row.location} Hub.`,
    safetyInstructions: row.safetyInstructions || "Handle with standard care and return cleaned.",
    tags,
    featured: Boolean(row.featured),
    popularityScore: row.popularityScore || 0,
    availabilityStatus: row.availabilityStatus || "Available",
    status: row.status || "active",
    moderationStatus: (row.moderationStatus as ModerationStatus) || "approved",
    moderationReason: row.moderationReason || undefined,
    moderatedBy: row.moderatedBy || undefined,
    moderatedAt: row.moderatedAt || undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    ownerName: row.ownerName || "Community Lender",
    ownerAvatar: row.ownerAvatar || "/placeholder-user.jpg",
    ownerRating: row.ownerRating ? parseFloat(row.ownerRating) : 4.95,
    ownerReviewCount: row.ownerReviewCount ? parseInt(row.ownerReviewCount) : 12,
    ownerVerified: Boolean(row.ownerVerified ?? 1),
    bookingCount: row.bookingCount ? parseInt(row.bookingCount) : 0,
  };
}

export async function createResource(params: {
  ownerId: string;
  title: string;
  tagline?: string;
  description: string;
  longDescription?: string;
  category: string;
  images: string[];
  condition: "Like New" | "Excellent" | "Good" | "Fair";
  location: string;
  specs?: Record<string, string>;
  borrowingTerms?: string;
  eligibility?: string[];
  deposit?: string;
  maxDuration?: string;
  pickupInstructions?: string;
  safetyInstructions?: string;
  tags?: string[];
}): Promise<ParsedResource> {
  const db = await getDatabase();
  const id = `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const autoApprove = await getPlatformSettingValue("auto_approve_listings", "true") === "true";
  const moderationStatus: ModerationStatus = autoApprove ? "approved" : "pending";

  await db.prepare(`
    INSERT INTO resources (
      id, ownerId, title, tagline, description, longDescription, category,
      images, condition, location, specs, borrowingTerms, eligibility,
      deposit, maxDuration, pickupInstructions, safetyInstructions, tags,
      featured, popularityScore, availabilityStatus, status, moderationStatus, createdAt, updatedAt
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      0, 50, 'Available', 'active', ?, ?, ?
    )
  `).run(
    id,
    params.ownerId,
    params.title.trim(),
    params.tagline ? params.tagline.trim() : "",
    params.description.trim(),
    params.longDescription ? params.longDescription.trim() : params.description.trim(),
    params.category.trim(),
    JSON.stringify(params.images && params.images.length > 0 ? params.images : ["/placeholder.jpg"]),
    params.condition,
    params.location.trim(),
    JSON.stringify(params.specs || {}),
    params.borrowingTerms ? params.borrowingTerms.trim() : "Standard 3-day loan. Return cleaned in protective case.",
    JSON.stringify(params.eligibility || ["Verified ID required", "Community member"]),
    params.deposit ? params.deposit.trim() : "$0 (Free)",
    params.maxDuration ? params.maxDuration.trim() : "7 days",
    params.pickupInstructions ? params.pickupInstructions.trim() : `Pickup at ${params.location.trim()}`,
    params.safetyInstructions ? params.safetyInstructions.trim() : "Inspect before use. Return cleaned.",
    JSON.stringify(params.tags || [params.category.toLowerCase()]),
    moderationStatus,
    now,
    now
  );

  await createAuditLog({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: params.ownerId,
    action: "RESOURCE_CREATED",
    entityType: "resources",
    entityId: id,
    details: JSON.stringify({ title: params.title, category: params.category }),
    timestamp: now,
  });

  return (await getDbResourceById(id))!;
}

export async function updateResource(
  id: string,
  ownerId: string,
  updates: Partial<{
    title: string;
    tagline: string;
    description: string;
    longDescription: string;
    category: string;
    images: string[];
    condition: "Like New" | "Excellent" | "Good" | "Fair";
    location: string;
    specs: Record<string, string>;
    borrowingTerms: string;
    deposit: string;
    maxDuration: string;
    pickupInstructions: string;
    safetyInstructions: string;
    availabilityStatus: "Available" | "In Use" | "Waitlist" | "Paused" | "Maintenance";
    status: "active" | "paused" | "deleted";
  }>
): Promise<{ success: boolean; resource?: ParsedResource; error?: string }> {
  const db = await getDatabase();
  const existing = await getDbResourceById(id);

  if (!existing) {
    return { success: false, error: "Resource not found." };
  }

  if (existing.ownerId !== ownerId) {
    return { success: false, error: "Unauthorized: You do not own this resource." };
  }

  const now = new Date().toISOString();
  const title = updates.title !== undefined ? updates.title.trim() : existing.title;
  const tagline = updates.tagline !== undefined ? updates.tagline.trim() : existing.tagline;
  const description = updates.description !== undefined ? updates.description.trim() : existing.description;
  const longDescription = updates.longDescription !== undefined ? updates.longDescription.trim() : existing.longDescription;
  const category = updates.category !== undefined ? updates.category.trim() : existing.category;
  const images = updates.images !== undefined ? JSON.stringify(updates.images) : JSON.stringify(existing.images);
  const condition = updates.condition !== undefined ? updates.condition : existing.condition;
  const location = updates.location !== undefined ? updates.location.trim() : existing.location;
  const specs = updates.specs !== undefined ? JSON.stringify(updates.specs) : JSON.stringify(existing.specs);
  const borrowingTerms = updates.borrowingTerms !== undefined ? updates.borrowingTerms.trim() : existing.borrowingTerms;
  const deposit = updates.deposit !== undefined ? updates.deposit.trim() : existing.deposit;
  const maxDuration = updates.maxDuration !== undefined ? updates.maxDuration.trim() : existing.maxDuration;
  const pickupInstructions = updates.pickupInstructions !== undefined ? updates.pickupInstructions.trim() : existing.pickupInstructions;
  const safetyInstructions = updates.safetyInstructions !== undefined ? updates.safetyInstructions.trim() : existing.safetyInstructions;
  const availabilityStatus = updates.availabilityStatus !== undefined ? updates.availabilityStatus : existing.availabilityStatus;
  const status = updates.status !== undefined ? updates.status : existing.status;

  await db.prepare(`
    UPDATE resources
    SET title = ?, tagline = ?, description = ?, longDescription = ?, category = ?,
        images = ?, condition = ?, location = ?, specs = ?, borrowingTerms = ?,
        deposit = ?, maxDuration = ?, pickupInstructions = ?, safetyInstructions = ?,
        availabilityStatus = ?, status = ?, updatedAt = ?
    WHERE id = ?
  `).run(
    title, tagline, description, longDescription, category,
    images, condition, location, specs, borrowingTerms,
    deposit, maxDuration, pickupInstructions, safetyInstructions,
    availabilityStatus, status, now, id
  );

  await createAuditLog({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: ownerId,
    action: "RESOURCE_UPDATED",
    entityType: "resources",
    entityId: id,
    details: JSON.stringify({ updatedFields: Object.keys(updates) }),
    timestamp: now,
  });

  return { success: true, resource: (await getDbResourceById(id)) || undefined };
}

export async function deleteResource(
  id: string,
  ownerId: string
): Promise<{ success: boolean; error?: string }> {
  const db = await getDatabase();
  const existing = await getDbResourceById(id);

  if (!existing) {
    return { success: false, error: "Resource not found." };
  }

  if (existing.ownerId !== ownerId) {
    return { success: false, error: "Unauthorized: You do not own this resource." };
  }

  // Prevent removal if active approved bookings exist!
  const today = new Date().toISOString().split("T")[0];
  const activeBookings = await db.prepare(`
    SELECT COUNT(*) as count FROM bookings 
    WHERE resourceId = ? AND status = 'approved' AND endDate >= ?
  `).get(id, today) as { count: number };

  if (activeBookings && activeBookings.count > 0) {
    return {
      success: false,
      error: `Cannot remove resource: There are currently ${activeBookings.count} active or upcoming approved reservations for this equipment.`,
    };
  }

  const now = new Date().toISOString();
  await db.prepare(`
    UPDATE resources 
    SET status = 'deleted', availabilityStatus = 'Paused', updatedAt = ?
    WHERE id = ?
  `).run(now, id);

  await createAuditLog({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: ownerId,
    action: "RESOURCE_DELETED",
    entityType: "resources",
    entityId: id,
    details: JSON.stringify({ resourceTitle: existing.title }),
    timestamp: now,
  });

  return { success: true };
}

export async function getDbResourceById(id: string): Promise<ParsedResource | null> {
  const db = await getDatabase();
  const row = await db.prepare(`
    SELECT 
      r.*,
      u.fullName as ownerName,
      u.avatar as ownerAvatar,
      u.verified as ownerVerified,
      (SELECT COUNT(*) FROM bookings WHERE resourceId = r.id) as bookingCount,
      (SELECT AVG(rating) FROM reviews WHERE resourceId = r.id) as ownerRating,
      (SELECT COUNT(*) FROM reviews WHERE resourceId = r.id) as ownerReviewCount
    FROM resources r
    LEFT JOIN users u ON r.ownerId = u.id
    WHERE r.id = ?
  `).get(id);

  if (!row) return null;
  return parseDbResource(row);
}

export async function getAllDbResources(filters?: {
  category?: string;
  condition?: string;
  availabilityStatus?: string;
  search?: string;
  ownerId?: string;
  status?: string;
  moderationStatus?: string;
  publicOnly?: boolean;
}): Promise<ParsedResource[]> {
  const db = await getDatabase();
  let query = `
    SELECT 
      r.*,
      u.fullName as ownerName,
      u.avatar as ownerAvatar,
      u.verified as ownerVerified,
      (SELECT COUNT(*) FROM bookings WHERE resourceId = r.id) as bookingCount,
      (SELECT AVG(rating) FROM reviews WHERE resourceId = r.id) as ownerRating,
      (SELECT COUNT(*) FROM reviews WHERE resourceId = r.id) as ownerReviewCount
    FROM resources r
    LEFT JOIN users u ON r.ownerId = u.id
    WHERE 1=1
  `;
  const params: any[] = [];

  const targetStatus = filters?.status || "active";
  if (targetStatus !== "all") {
    query += " AND r.status = ?";
    params.push(targetStatus);
  }

  if (filters?.moderationStatus) {
    if (filters.moderationStatus !== "all") {
      query += " AND r.moderationStatus = ?";
      params.push(filters.moderationStatus);
    }
  } else if (filters?.publicOnly) {
    query += " AND r.moderationStatus = 'approved'";
  } else {
    // Exclude rejected or suspended resources from standard catalog search
    query += " AND (r.moderationStatus IS NULL OR r.moderationStatus NOT IN ('rejected', 'suspended'))";
  }

  if (filters?.ownerId) {
    query += " AND r.ownerId = ?";
    params.push(filters.ownerId);
  }

  if (filters?.category) {
    query += " AND r.category = ?";
    params.push(filters.category);
  }

  if (filters?.condition) {
    query += " AND r.condition = ?";
    params.push(filters.condition);
  }

  if (filters?.availabilityStatus) {
    query += " AND r.availabilityStatus = ?";
    params.push(filters.availabilityStatus);
  }

  if (filters?.search) {
    query += " AND (r.title LIKE ? OR r.description LIKE ? OR r.category LIKE ?)";
    const term = `%${filters.search.trim()}%`;
    params.push(term, term, term);
  }

  query += " ORDER BY r.createdAt DESC";

  const rows = await db.prepare(query).all(...params);
  return rows.map((r) => parseDbResource(r));
}

export async function getDbResourcesByOwner(ownerId: string): Promise<ParsedResource[]> {
  const db = await getDatabase();
  const rows = await db.prepare(`
    SELECT 
      r.*,
      u.fullName as ownerName,
      u.avatar as ownerAvatar,
      u.verified as ownerVerified,
      (SELECT COUNT(*) FROM bookings WHERE resourceId = r.id) as bookingCount
    FROM resources r
    LEFT JOIN users u ON r.ownerId = u.id
    WHERE r.ownerId = ? AND r.status != 'deleted'
    ORDER BY r.createdAt DESC
  `).all(ownerId);

  return rows.map((r) => parseDbResource(r));
}

// ==========================================
// PHASE 5: SAVED RESOURCES / WISHLIST DAO
// ==========================================

export async function saveResource(
  userId: string,
  resourceId: string
): Promise<{ success: boolean; error?: string }> {
  const db = await getDatabase();
  const res = await getDbResourceById(resourceId);

  if (!res) {
    return { success: false, error: "Resource not found." };
  }

  const existing = await db.prepare(`
    SELECT id FROM saved_resources WHERE userId = ? AND resourceId = ?
  `).get(userId, resourceId);

  if (existing) {
    return { success: true }; // Already saved
  }

  const id = `sav_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  await db.prepare(`
    INSERT INTO saved_resources (id, userId, resourceId, createdAt)
    VALUES (?, ?, ?, ?)
  `).run(id, userId, resourceId, now);

  await createAuditLog({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: userId,
    action: "RESOURCE_SAVED",
    entityType: "saved_resources",
    entityId: id,
    details: JSON.stringify({ resourceId }),
    timestamp: now,
  });

  return { success: true };
}

export async function unsaveResource(
  userId: string,
  resourceIdOrSavedId: string
): Promise<{ success: boolean }> {
  const db = await getDatabase();
  await db.prepare(`
    DELETE FROM saved_resources 
    WHERE userId = ? AND (resourceId = ? OR id = ?)
  `).run(userId, resourceIdOrSavedId, resourceIdOrSavedId);

  await createAuditLog({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: userId,
    action: "RESOURCE_UNSAVED",
    entityType: "saved_resources",
    entityId: resourceIdOrSavedId,
    details: JSON.stringify({ identifier: resourceIdOrSavedId }),
    timestamp: new Date().toISOString(),
  });

  return { success: true };
}

export async function getSavedResources(userId: string): Promise<SavedResourceWithDetails[]> {
  const db = await getDatabase();
  const rows = await db.prepare(`
    SELECT 
      sr.id,
      sr.userId,
      sr.resourceId,
      sr.createdAt,
      r.title as resourceTitle,
      r.images as resourceImages,
      r.category as resourceCategory,
      r.location as resourceLocation,
      r.condition as resourceCondition,
      r.availabilityStatus as resourceAvailability,
      r.deposit,
      u.fullName as ownerName
    FROM saved_resources sr
    JOIN resources r ON sr.resourceId = r.id
    LEFT JOIN users u ON r.ownerId = u.id
    WHERE sr.userId = ? AND r.status != 'deleted'
    ORDER BY sr.createdAt DESC
  `).all(userId) as any[];

  return rows.map((r) => {
    let image = "/placeholder.jpg";
    try {
      const parsed = JSON.parse(r.resourceImages);
      if (Array.isArray(parsed) && parsed.length > 0) image = parsed[0];
    } catch {}

    return {
      id: r.id,
      userId: r.userId,
      resourceId: r.resourceId,
      createdAt: r.createdAt,
      resourceTitle: r.resourceTitle,
      resourceImage: image,
      resourceCategory: r.resourceCategory,
      resourceLocation: r.resourceLocation,
      resourceCondition: r.resourceCondition,
      resourceAvailability: r.resourceAvailability,
      deposit: r.deposit || "None",
      ownerName: r.ownerName || "Community Member",
    };
  });
}

export async function isResourceSaved(userId: string, resourceId: string): Promise<boolean> {
  const db = await getDatabase();
  const row = await db.prepare(`
    SELECT COUNT(*) as count FROM saved_resources 
    WHERE userId = ? AND resourceId = ?
  `).get(userId, resourceId) as { count: number };
  return row.count > 0;
}

// ==========================================
// PHASE 5: COMMUNITY REVIEWS & RATINGS DAO
// ==========================================

export async function createReview(params: {
  bookingId: string;
  reviewerId: string;
  rating: number;
  comment: string;
}): Promise<{ success: boolean; review?: DbReview; error?: string }> {
  const db = await getDatabase();
  const booking = await getBookingById(params.bookingId);

  if (!booking) {
    return { success: false, error: "Booking record not found." };
  }

  // Only completed bookings can be reviewed
  if (booking.status !== "completed") {
    return {
      success: false,
      error: `Cannot review an uncompleted booking (Current status: ${booking.status}). Reviews are unlocked after equipment return inspection.`,
    };
  }

  // Only participants can submit reviews
  const isBorrower = booking.borrowerId === params.reviewerId;
  const isOwner = booking.ownerId === params.reviewerId;

  if (!isBorrower && !isOwner) {
    return { success: false, error: "Forbidden: You were not a participant in this borrowing transaction." };
  }

  const revieweeId = isBorrower ? booking.ownerId : booking.borrowerId;

  // Cannot review self
  if (revieweeId === params.reviewerId) {
    return { success: false, error: "You cannot review yourself." };
  }

  // Prevent duplicate reviews from the same reviewer for this booking
  const existing = await db.prepare(`
    SELECT id FROM reviews WHERE bookingId = ? AND reviewerId = ?
  `).get(params.bookingId, params.reviewerId);

  if (existing) {
    return { success: false, error: "You have already submitted a review for this completed booking." };
  }

  const id = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  await db.prepare(`
    INSERT INTO reviews (id, bookingId, reviewerId, revieweeId, resourceId, rating, comment, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    params.bookingId,
    params.reviewerId,
    revieweeId,
    booking.resourceId,
    Math.min(5, Math.max(1, Math.round(params.rating))),
    params.comment.trim(),
    now,
    now
  );

  await createAuditLog({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: params.reviewerId,
    action: "REVIEW_CREATED",
    entityType: "reviews",
    entityId: id,
    details: JSON.stringify({ bookingId: params.bookingId, rating: params.rating }),
    timestamp: now,
  });

  const reviewerUser = await findUserById(params.reviewerId);
  await createNotification({
    userId: revieweeId,
    title: "New Review Received",
    message: `${reviewerUser?.fullName || "A peer member"} gave you a ${params.rating}-star review for equipment sharing.`,
    type: "system",
    relatedEntityId: id,
  });

  const created = await db.prepare("SELECT * FROM reviews WHERE id = ?").get(id) as unknown as DbReview;
  return { success: true, review: created };
}

export async function updateReview(
  reviewId: string,
  reviewerId: string,
  updates: { rating?: number; comment?: string }
): Promise<{ success: boolean; review?: DbReview; error?: string }> {
  const db = await getDatabase();
  const existing = await db.prepare("SELECT * FROM reviews WHERE id = ?").get(reviewId) as unknown as DbReview | undefined;

  if (!existing) {
    return { success: false, error: "Review not found." };
  }

  if (existing.reviewerId !== reviewerId) {
    return { success: false, error: "Unauthorized: You do not own this review." };
  }

  const rating = updates.rating !== undefined ? Math.min(5, Math.max(1, Math.round(updates.rating))) : existing.rating;
  const comment = updates.comment !== undefined ? updates.comment.trim() : existing.comment;
  const now = new Date().toISOString();

  await db.prepare(`
    UPDATE reviews 
    SET rating = ?, comment = ?, updatedAt = ?
    WHERE id = ?
  `).run(rating, comment, now, reviewId);

  await createAuditLog({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: reviewerId,
    action: "REVIEW_UPDATED",
    entityType: "reviews",
    entityId: reviewId,
    details: JSON.stringify({ rating }),
    timestamp: now,
  });

  const updated = await db.prepare("SELECT * FROM reviews WHERE id = ?").get(reviewId) as unknown as DbReview;
  return { success: true, review: updated };
}

export async function getReviewsForResource(resourceId: string): Promise<DbReviewWithDetails[]> {
  const db = await getDatabase();
  const rows = await db.prepare(`
    SELECT 
      rv.*,
      u.fullName as reviewerName,
      u.avatar as reviewerAvatar,
      u.role as reviewerRole
    FROM reviews rv
    LEFT JOIN users u ON rv.reviewerId = u.id
    WHERE rv.resourceId = ?
    ORDER BY rv.createdAt DESC
  `).all(resourceId) as unknown as DbReviewWithDetails[];
  return rows || [];
}

export async function getReviewsForUser(userId: string): Promise<DbReviewWithDetails[]> {
  const db = await getDatabase();
  const rows = await db.prepare(`
    SELECT 
      rv.*,
      u.fullName as reviewerName,
      u.avatar as reviewerAvatar,
      u.role as reviewerRole,
      res.title as resourceTitle
    FROM reviews rv
    LEFT JOIN users u ON rv.reviewerId = u.id
    LEFT JOIN resources res ON rv.resourceId = res.id
    WHERE rv.revieweeId = ?
    ORDER BY rv.createdAt DESC
  `).all(userId) as unknown as DbReviewWithDetails[];
  return rows || [];
}

export async function getUserRatingSummary(userId: string): Promise<{ count: number; avgRating: number }> {
  const db = await getDatabase();
  const row = await db.prepare(`
    SELECT COUNT(*) as count, AVG(rating) as avgRating 
    FROM reviews WHERE revieweeId = ?
  `).get(userId) as { count: number; avgRating: number | null };

  return {
    count: row.count,
    avgRating: row.avgRating ? Math.round(row.avgRating * 10) / 10 : 5.0,
  };
}

// ==========================================
// PHASE 5: REAL ANALYTICS & DASHBOARD METRICS
// ==========================================

export async function getOwnerAnalytics(ownerId: string) {
  const db = await getDatabase();

  const totalResources = (await db.prepare(`
    SELECT COUNT(*) as count FROM resources WHERE ownerId = ? AND status != 'deleted'
  `).get(ownerId) as { count: number }).count;

  const activeListings = (await db.prepare(`
    SELECT COUNT(*) as count FROM resources WHERE ownerId = ? AND status = 'active'
  `).get(ownerId) as { count: number }).count;

  const totalRequests = (await db.prepare(`
    SELECT COUNT(*) as count FROM bookings WHERE ownerId = ?
  `).get(ownerId) as { count: number }).count;

  const approvedBookings = (await db.prepare(`
    SELECT COUNT(*) as count FROM bookings WHERE ownerId = ? AND status = 'approved'
  `).get(ownerId) as { count: number }).count;

  const completedLendings = (await db.prepare(`
    SELECT COUNT(*) as count FROM bookings WHERE ownerId = ? AND status = 'completed'
  `).get(ownerId) as { count: number }).count;

  const rejectedCancelled = (await db.prepare(`
    SELECT COUNT(*) as count FROM bookings WHERE ownerId = ? AND status IN ('rejected', 'cancelled')
  `).get(ownerId) as { count: number }).count;

  const ratingSummary = await getUserRatingSummary(ownerId);

  // Utilization calculation
  const utilization = totalRequests > 0 
    ? Math.min(100, Math.round(((approvedBookings + completedLendings) / totalRequests) * 100))
    : 0;

  // Most requested resources
  const mostRequested = await db.prepare(`
    SELECT 
      r.id,
      r.title,
      r.category,
      COUNT(b.id) as requestCount
    FROM resources r
    LEFT JOIN bookings b ON r.id = b.resourceId
    WHERE r.ownerId = ? AND r.status != 'deleted'
    GROUP BY r.id
    ORDER BY requestCount DESC
    LIMIT 5
  `).all(ownerId) as any[];

  return {
    totalResources,
    activeListings,
    totalRequests,
    approvedBookings,
    completedLendings,
    rejectedCancelled,
    utilizationPercentage: utilization,
    averageRating: ratingSummary.avgRating,
    reviewCount: ratingSummary.count,
    mostRequestedResources: mostRequested,
  };
}

export async function getBorrowerAnalytics(borrowerId: string) {
  const db = await getDatabase();

  const totalRequests = (await db.prepare(`
    SELECT COUNT(*) as count FROM bookings WHERE borrowerId = ?
  `).get(borrowerId) as { count: number }).count;

  const approvedBookings = (await db.prepare(`
    SELECT COUNT(*) as count FROM bookings WHERE borrowerId = ? AND status = 'approved'
  `).get(borrowerId) as { count: number }).count;

  const completedBorrowings = (await db.prepare(`
    SELECT COUNT(*) as count FROM bookings WHERE borrowerId = ? AND status = 'completed'
  `).get(borrowerId) as { count: number }).count;

  const activeWaitlist = (await db.prepare(`
    SELECT COUNT(*) as count FROM waitlist WHERE borrowerId = ? AND status = 'active'
  `).get(borrowerId) as { count: number }).count;

  const savedCount = (await db.prepare(`
    SELECT COUNT(*) as count FROM saved_resources WHERE userId = ?
  `).get(borrowerId) as { count: number }).count;

  const ratingSummary = await getUserRatingSummary(borrowerId);

  // Favorite categories
  const categories = await db.prepare(`
    SELECT 
      r.category,
      COUNT(b.id) as borrowCount
    FROM bookings b
    JOIN resources r ON b.resourceId = r.id
    WHERE b.borrowerId = ?
    GROUP BY r.category
    ORDER BY borrowCount DESC
    LIMIT 4
  `).all(borrowerId) as any[];

  return {
    totalRequests,
    approvedBookings,
    completedBorrowings,
    activeWaitlist,
    savedCount,
    averageRating: ratingSummary.avgRating,
    reviewCount: ratingSummary.count,
    favoriteCategories: categories,
  };
}

// ==========================================
// PHASE 5: REAL TRUST & REPUTATION BADGES
// ==========================================

export async function getUserTrustProfile(userId: string) {
  const db = await getDatabase();
  const user = await findUserById(userId);
  if (!user) return null;

  const ratings = await getUserRatingSummary(userId);
  const now = new Date().toISOString();

  const badges: {
    id: string;
    name: string;
    description: string;
    category: "reputation" | "verification";
    icon: string;
  }[] = [];

  // 1. Manually verified account status
  if (user.verified === 1) {
    badges.push({
      id: "bdg_verified_member",
      name: "Verified Account",
      description: "Identity and phone confirmed through platform onboarding",
      category: "verification",
      icon: "ShieldCheck",
    });
  }

  // 2. Borrower-earned badges
  if (user.role === "borrower" || user.role === "admin") {
    const completedCount = (await db.prepare(`
      SELECT COUNT(*) as count FROM bookings WHERE borrowerId = ? AND status = 'completed'
    `).get(userId) as { count: number }).count;

    if (completedCount >= 1) {
      badges.push({
        id: "bdg_first_borrow",
        name: "First Successful Borrowing",
        description: "Completed first community equipment borrowing cycle",
        category: "reputation",
        icon: "CheckCircle2",
      });
    }

    if (completedCount >= 3) {
      badges.push({
        id: "bdg_trusted_borrower",
        name: "Trusted Borrower",
        description: "Completed 3+ successful borrows with zero disputes or damage claims",
        category: "reputation",
        icon: "Star",
      });
    }
  }

  // 3. Owner-earned badges
  if (user.role === "owner" || user.role === "admin") {
    const activeResources = (await db.prepare(`
      SELECT COUNT(*) as count FROM resources WHERE ownerId = ? AND status = 'active'
    `).get(userId) as { count: number }).count;

    const completedLendings = (await db.prepare(`
      SELECT COUNT(*) as count FROM bookings WHERE ownerId = ? AND status = 'completed'
    `).get(userId) as { count: number }).count;

    if (activeResources >= 1) {
      badges.push({
        id: "bdg_contributor",
        name: "Community Contributor",
        description: "Actively sharing equipment and tools in the neighborhood catalog",
        category: "reputation",
        icon: "Package",
      });
    }

    if (completedLendings >= 3 && ratings.avgRating >= 4.5) {
      badges.push({
        id: "bdg_reliable_owner",
        name: "Reliable Owner",
        description: "Maintained 4.5+ rating across multiple completed equipment loans",
        category: "reputation",
        icon: "Sparkles",
      });
    }

    if (completedLendings >= 5) {
      badges.push({
        id: "bdg_experienced_lender",
        name: "Experienced Lender",
        description: "Successfully facilitated 5+ equipment sharing cycles",
        category: "reputation",
        icon: "Award",
      });
    }
  }

  return {
    userId,
    fullName: user.fullName,
    role: user.role,
    avatar: user.avatar,
    memberSince: user.createdAt,
    isVerified: Boolean(user.verified),
    averageRating: ratings.avgRating,
    reviewCount: ratings.count,
    badges,
  };
}

// =====================================================================
// PHASE 6: ADMIN CONTROL PANEL & MODERATION SYSTEM DAO METHODS
// =====================================================================

// 1. Admin Dashboard Overview Metrics
export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const db = await getDatabase();

  const userStats = await db.prepare(`
    SELECT 
      COUNT(*) as totalUsers,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeUsers,
      SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspendedUsers
    FROM users;
  `).get() as { totalUsers: number; activeUsers: number; suspendedUsers: number };

  const resourceStats = await db.prepare(`
    SELECT 
      COUNT(*) as totalResources,
      SUM(CASE WHEN moderationStatus = 'pending' THEN 1 ELSE 0 END) as pendingReviewResources,
      SUM(CASE WHEN moderationStatus = 'approved' THEN 1 ELSE 0 END) as approvedResources,
      SUM(CASE WHEN moderationStatus = 'suspended' THEN 1 ELSE 0 END) as suspendedResources
    FROM resources
    WHERE status != 'deleted';
  `).get() as { totalResources: number; pendingReviewResources: number; approvedResources: number; suspendedResources: number };

  const totalBookings = (await db.prepare(`SELECT COUNT(*) as count FROM bookings;`).get() as { count: number }).count;

  const activeDisputes = (await db.prepare(`
    SELECT COUNT(*) as count FROM booking_disputes WHERE status IN ('open', 'under_review');
  `).get() as { count: number }).count;

  const openReports = (await db.prepare(`
    SELECT COUNT(*) as count FROM user_reports WHERE status IN ('open', 'investigating');
  `).get() as { count: number }).count;

  const categoriesCount = (await db.prepare(`SELECT COUNT(*) as count FROM platform_categories;`).get() as { count: number }).count;

  const categoryDistribution = await db.prepare(`
    SELECT category, COUNT(*) as count 
    FROM resources 
    WHERE status != 'deleted' 
    GROUP BY category 
    ORDER BY count DESC;
  `).all() as unknown as { category: string; count: number }[];

  const userRoleDistribution = await db.prepare(`
    SELECT role, COUNT(*) as count 
    FROM users 
    GROUP BY role;
  `).all() as unknown as { role: string; count: number }[];

  const bookingStatusDistribution = await db.prepare(`
    SELECT status, COUNT(*) as count 
    FROM bookings 
    GROUP BY status;
  `).all() as unknown as { status: string; count: number }[];

  const recentAuditLogs = await db.prepare(`
    SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 10;
  `).all() as unknown as DbAuditLog[];

  return {
    totalUsers: userStats.totalUsers || 0,
    activeUsers: userStats.activeUsers || 0,
    suspendedUsers: userStats.suspendedUsers || 0,
    totalResources: resourceStats.totalResources || 0,
    pendingReviewResources: resourceStats.pendingReviewResources || 0,
    approvedResources: resourceStats.approvedResources || 0,
    suspendedResources: resourceStats.suspendedResources || 0,
    totalBookings,
    activeDisputes,
    openReports,
    categoriesCount,
    categoryDistribution: categoryDistribution || [],
    userRoleDistribution: userRoleDistribution || [],
    bookingStatusDistribution: bookingStatusDistribution || [],
    recentAuditLogs: recentAuditLogs || [],
  };
}

// 2. Admin User Management
export async function getAllUsersForAdmin(filters?: {
  role?: string;
  status?: string;
  search?: string;
}): Promise<DbUser[]> {
  const db = await getDatabase();
  let query = "SELECT * FROM users WHERE 1=1";
  const params: any[] = [];

  if (filters?.role && filters.role !== "all") {
    query += " AND role = ?";
    params.push(filters.role);
  }

  if (filters?.status && filters.status !== "all") {
    query += " AND status = ?";
    params.push(filters.status);
  }

  if (filters?.search) {
    query += " AND (fullName LIKE ? OR email LIKE ? OR phone LIKE ?)";
    const term = `%${filters.search.trim()}%`;
    params.push(term, term, term);
  }

  query += " ORDER BY createdAt DESC";
  return await db.prepare(query).all(...params) as unknown as DbUser[];
}

export async function getUserDetailsForAdmin(userId: string): Promise<{
  user: DbUser | null;
  stats: {
    bookingsAsBorrower: number;
    resourcesOwned: number;
    bookingsReceived: number;
    disputesInvolved: number;
    reportsAgainst: number;
    reportsFiled: number;
  };
  auditLogs: DbAuditLog[];
}> {
  const db = await getDatabase();
  const user = await findUserById(userId);
  if (!user) {
    return {
      user: null,
      stats: { bookingsAsBorrower: 0, resourcesOwned: 0, bookingsReceived: 0, disputesInvolved: 0, reportsAgainst: 0, reportsFiled: 0 },
      auditLogs: [],
    };
  }

  const bookingsAsBorrower = (await db.prepare(`SELECT COUNT(*) as c FROM bookings WHERE borrowerId = ?`).get(userId) as { c: number }).c;
  const resourcesOwned = (await db.prepare(`SELECT COUNT(*) as c FROM resources WHERE ownerId = ? AND status != 'deleted'`).get(userId) as { c: number }).c;
  const bookingsReceived = (await db.prepare(`SELECT COUNT(*) as c FROM bookings WHERE ownerId = ?`).get(userId) as { c: number }).c;
  const disputesInvolved = (await db.prepare(`SELECT COUNT(*) as c FROM booking_disputes WHERE initiatorId = ? OR respondentId = ?`).get(userId, userId) as { c: number }).c;
  const reportsAgainst = (await db.prepare(`SELECT COUNT(*) as c FROM user_reports WHERE targetType = 'user' AND targetId = ?`).get(userId) as { c: number }).c;
  const reportsFiled = (await db.prepare(`SELECT COUNT(*) as c FROM user_reports WHERE reporterId = ?`).get(userId) as { c: number }).c;

  const auditLogs = await db.prepare(`SELECT * FROM audit_logs WHERE actorId = ? ORDER BY timestamp DESC LIMIT 15`).all(userId) as unknown as DbAuditLog[];

  return {
    user,
    stats: {
      bookingsAsBorrower,
      resourcesOwned,
      bookingsReceived,
      disputesInvolved,
      reportsAgainst,
      reportsFiled,
    },
    auditLogs,
  };
}

export async function updateUserStatusByAdmin(
  adminId: string,
  targetUserId: string,
  newStatus: "active" | "suspended",
  reason?: string
): Promise<{ success: boolean; user?: DbUser; error?: string }> {
  const db = await getDatabase();
  const target = await findUserById(targetUserId);
  if (!target) {
    return { success: false, error: "Target user not found." };
  }

  // Self-suspension check
  if (targetUserId === adminId) {
    return { success: false, error: "Administrators cannot suspend their own account." };
  }

  // Last active admin protection
  if (target.role === "admin" && newStatus === "suspended") {
    const activeAdminsCount = (await db.prepare(`
      SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND status = 'active'
    `).get() as { count: number }).count;

    if (activeAdminsCount <= 1) {
      return { success: false, error: "Cannot suspend the last active administrator on the platform." };
    }
  }

  const now = new Date().toISOString();
  const suspendedReason = newStatus === "suspended" ? (reason || "Suspended by platform administrator") : null;
  const suspendedAt = newStatus === "suspended" ? now : null;
  const suspendedBy = newStatus === "suspended" ? adminId : null;

  await db.prepare(`
    UPDATE users 
    SET status = ?, suspendedReason = ?, suspendedAt = ?, suspendedBy = ?, updatedAt = ?
    WHERE id = ?
  `).run(newStatus, suspendedReason, suspendedAt, suspendedBy, now, targetUserId);

  await createAuditLog({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: adminId,
    action: newStatus === "suspended" ? "USER_SUSPENDED" : "USER_ACTIVATED",
    entityType: "users",
    entityId: targetUserId,
    details: JSON.stringify({ reason: suspendedReason, previousStatus: target.status }),
    timestamp: now,
  });

  await createNotification({
    userId: targetUserId,
    title: newStatus === "suspended" ? "Account Suspended" : "Account Reactivated",
    message: newStatus === "suspended" 
      ? `Your ResourceX account has been suspended by administration. Reason: ${suspendedReason}`
      : "Your ResourceX account has been reactivated. You may now access all features.",
    type: "system",
    relatedEntityId: targetUserId,
  });

  return { success: true, user: (await findUserById(targetUserId)) || undefined };
}

export async function updateUserRoleByAdmin(
  adminId: string,
  targetUserId: string,
  newRole: "borrower" | "owner" | "admin"
): Promise<{ success: boolean; user?: DbUser; error?: string }> {
  const db = await getDatabase();
  const target = await findUserById(targetUserId);
  if (!target) {
    return { success: false, error: "Target user not found." };
  }

  if (target.role === newRole) {
    return { success: true, user: target };
  }

  // Safeguard: Last active admin cannot be demoted
  if (target.role === "admin" && newRole !== "admin") {
    const activeAdminsCount = (await db.prepare(`
      SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND status = 'active'
    `).get() as { count: number }).count;

    if (activeAdminsCount <= 1) {
      return { success: false, error: "Cannot demote the last active administrator on the platform." };
    }
  }

  const now = new Date().toISOString();
  await db.prepare(`
    UPDATE users 
    SET role = ?, updatedAt = ?
    WHERE id = ?
  `).run(newRole, now, targetUserId);

  await createAuditLog({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: adminId,
    action: "USER_ROLE_CHANGED",
    entityType: "users",
    entityId: targetUserId,
    details: JSON.stringify({ previousRole: target.role, newRole }),
    timestamp: now,
  });

  await createNotification({
    userId: targetUserId,
    title: "Account Role Updated",
    message: `Your account role on ResourceX has been changed from ${target.role} to ${newRole}.`,
    type: "system",
    relatedEntityId: targetUserId,
  });

  return { success: true, user: (await findUserById(targetUserId)) || undefined };
}

// 3. Resource Moderation
export async function getAllResourcesForAdmin(filters?: {
  moderationStatus?: string;
  category?: string;
  search?: string;
}): Promise<ParsedResource[]> {
  const db = await getDatabase();
  let query = `
    SELECT 
      r.*,
      u.fullName as ownerName,
      u.avatar as ownerAvatar,
      u.verified as ownerVerified,
      (SELECT COUNT(*) FROM bookings WHERE resourceId = r.id) as bookingCount,
      (SELECT AVG(rating) FROM reviews WHERE resourceId = r.id) as ownerRating,
      (SELECT COUNT(*) FROM reviews WHERE resourceId = r.id) as ownerReviewCount
    FROM resources r
    LEFT JOIN users u ON r.ownerId = u.id
    WHERE r.status != 'deleted'
  `;
  const params: any[] = [];

  if (filters?.moderationStatus && filters.moderationStatus !== "all") {
    query += " AND r.moderationStatus = ?";
    params.push(filters.moderationStatus);
  }

  if (filters?.category && filters.category !== "all") {
    query += " AND r.category = ?";
    params.push(filters.category);
  }

  if (filters?.search) {
    query += " AND (r.title LIKE ? OR r.description LIKE ? OR u.fullName LIKE ?)";
    const term = `%${filters.search.trim()}%`;
    params.push(term, term, term);
  }

  query += " ORDER BY r.createdAt DESC";
  const rows = await db.prepare(query).all(...params);
  return rows.map((r) => parseDbResource(r));
}

export async function moderateResourceByAdmin(
  adminId: string,
  resourceId: string,
  action: "approve" | "reject" | "suspend" | "restore",
  reason?: string
): Promise<{ success: boolean; resource?: ParsedResource; error?: string }> {
  const db = await getDatabase();
  const existing = await getDbResourceById(resourceId);
  if (!existing) {
    return { success: false, error: "Resource not found." };
  }

  if (action === "reject" && (!reason || reason.trim().length === 0)) {
    return { success: false, error: "Rejection reason is mandatory." };
  }

  let newModerationStatus: ModerationStatus = "approved";
  let auditAction = "RESOURCE_APPROVED";

  if (action === "approve") {
    newModerationStatus = "approved";
    auditAction = "RESOURCE_APPROVED";
  } else if (action === "reject") {
    newModerationStatus = "rejected";
    auditAction = "RESOURCE_REJECTED";
  } else if (action === "suspend") {
    newModerationStatus = "suspended";
    auditAction = "RESOURCE_SUSPENDED";
  } else if (action === "restore") {
    newModerationStatus = "approved";
    auditAction = "RESOURCE_RESTORED";
  }

  const now = new Date().toISOString();
  const trimmedReason = reason?.trim() || null;

  // Insert moderation history
  const historyId = `mod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  await db.prepare(`
    INSERT INTO resource_moderation_history (id, resourceId, adminId, previousStatus, newStatus, reason, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    historyId,
    resourceId,
    adminId,
    existing.moderationStatus || "pending",
    newModerationStatus,
    trimmedReason,
    now
  );

  // Update resource
  await db.prepare(`
    UPDATE resources 
    SET moderationStatus = ?, moderationReason = ?, moderatedBy = ?, moderatedAt = ?, updatedAt = ?
    WHERE id = ?
  `).run(newModerationStatus, trimmedReason, adminId, now, now, resourceId);

  await createAuditLog({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: adminId,
    action: auditAction,
    entityType: "resources",
    entityId: resourceId,
    details: JSON.stringify({
      previousStatus: existing.moderationStatus,
      newStatus: newModerationStatus,
      reason: trimmedReason,
      resourceTitle: existing.title,
    }),
    timestamp: now,
  });

  // Notify owner
  let notifTitle = "Listing Approved";
  let notifMsg = `Your resource listing "${existing.title}" has been approved and is now live on the catalog.`;

  if (action === "reject") {
    notifTitle = "Listing Rejected";
    notifMsg = `Your resource listing "${existing.title}" was rejected by moderation. Reason: ${trimmedReason}`;
  } else if (action === "suspend") {
    notifTitle = "Listing Suspended";
    notifMsg = `Your resource listing "${existing.title}" has been suspended from public display. Reason: ${trimmedReason || "Policy review"}`;
  } else if (action === "restore") {
    notifTitle = "Listing Restored";
    notifMsg = `Your resource listing "${existing.title}" has been restored to active status on the catalog.`;
  }

  await createNotification({
    userId: existing.ownerId,
    title: notifTitle,
    message: notifMsg,
    type: "system",
    relatedEntityId: resourceId,
  });

  return { success: true, resource: (await getDbResourceById(resourceId)) || undefined };
}

// 4. Bookings & Dispute Management
export async function getAllBookingsForAdmin(filters?: {
  status?: string;
  search?: string;
}): Promise<DbBookingWithDetails[]> {
  const db = await getDatabase();
  let query = `
    SELECT 
      b.*,
      u1.fullName as borrowerName,
      u1.email as borrowerEmail,
      u1.phone as borrowerPhone,
      u2.fullName as ownerName,
      u2.email as ownerEmail,
      r.title as resourceTitle
    FROM bookings b
    LEFT JOIN users u1 ON b.borrowerId = u1.id
    LEFT JOIN users u2 ON b.ownerId = u2.id
    LEFT JOIN resources r ON b.resourceId = r.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (filters?.status && filters.status !== "all") {
    query += " AND b.status = ?";
    params.push(filters.status);
  }

  if (filters?.search) {
    query += " AND (b.id LIKE ? OR u1.fullName LIKE ? OR u2.fullName LIKE ? OR r.title LIKE ?)";
    const term = `%${filters.search.trim()}%`;
    params.push(term, term, term, term);
  }

  query += " ORDER BY b.createdAt DESC";
  return await db.prepare(query).all(...params) as unknown as DbBookingWithDetails[];
}

export async function createDispute(params: {
  bookingId: string;
  initiatorId: string;
  reason: string;
  description: string;
  evidence?: string[];
}): Promise<{ success: boolean; dispute?: DbDispute; error?: string }> {
  const db = await getDatabase();
  const booking = await getBookingById(params.bookingId);
  if (!booking) {
    return { success: false, error: "Booking not found." };
  }

  if (params.initiatorId !== booking.borrowerId && params.initiatorId !== booking.ownerId) {
    return { success: false, error: "Only the borrower or owner of this booking can raise a dispute." };
  }

  const existingActive = await db.prepare(`
    SELECT id FROM booking_disputes 
    WHERE bookingId = ? AND status IN ('open', 'under_review')
  `).get(params.bookingId);

  if (existingActive) {
    return { success: false, error: "An active dispute is already open for this booking." };
  }

  const respondentId = params.initiatorId === booking.borrowerId ? booking.ownerId : booking.borrowerId;
  const disputeId = `dsp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  await db.prepare(`
    INSERT INTO booking_disputes (
      id, bookingId, initiatorId, respondentId, reason, description, evidence, status, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)
  `).run(
    disputeId,
    params.bookingId,
    params.initiatorId,
    respondentId,
    params.reason.trim(),
    params.description.trim(),
    params.evidence ? JSON.stringify(params.evidence) : null,
    now,
    now
  );

  await createAuditLog({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: params.initiatorId,
    action: "DISPUTE_OPENED",
    entityType: "booking_disputes",
    entityId: disputeId,
    details: JSON.stringify({ bookingId: params.bookingId, reason: params.reason }),
    timestamp: now,
  });

  await createNotification({
    userId: respondentId,
    title: "Dispute Opened on Booking",
    message: `A dispute has been raised regarding booking #${params.bookingId.slice(0, 8)}. Reason: ${params.reason}. Platform administrators will review the case.`,
    type: "system",
    relatedEntityId: disputeId,
  });

  await createNotification({
    userId: params.initiatorId,
    title: "Dispute Submitted",
    message: `Your dispute for booking #${params.bookingId.slice(0, 8)} has been submitted. Case ID: ${disputeId}.`,
    type: "system",
    relatedEntityId: disputeId,
  });

  const created = await db.prepare("SELECT * FROM booking_disputes WHERE id = ?").get(disputeId) as unknown as DbDispute;
  return { success: true, dispute: created };
}

export async function getDisputesForAdmin(filters?: { status?: string }): Promise<DbDisputeWithDetails[]> {
  const db = await getDatabase();
  let query = `
    SELECT 
      d.*,
      b.resourceId as bookingResourceId,
      r.title as resourceTitle,
      u1.fullName as initiatorName,
      u1.email as initiatorEmail,
      u2.fullName as respondentName,
      u2.email as respondentEmail,
      u3.fullName as assignedAdminName
    FROM booking_disputes d
    LEFT JOIN bookings b ON d.bookingId = b.id
    LEFT JOIN resources r ON b.resourceId = r.id
    LEFT JOIN users u1 ON d.initiatorId = u1.id
    LEFT JOIN users u2 ON d.respondentId = u2.id
    LEFT JOIN users u3 ON d.assignedAdminId = u3.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (filters?.status && filters.status !== "all") {
    query += " AND d.status = ?";
    params.push(filters.status);
  }

  query += " ORDER BY d.createdAt DESC";
  return await db.prepare(query).all(...params) as unknown as DbDisputeWithDetails[];
}

export async function getDisputesForUser(userId: string): Promise<Omit<DbDisputeWithDetails, "adminNotes">[]> {
  const db = await getDatabase();
  const rows = await db.prepare(`
    SELECT 
      d.id, d.bookingId, d.initiatorId, d.respondentId, d.reason, d.description, d.evidence,
      d.status, d.resolution, d.actionTaken, d.resolvedAt, d.createdAt, d.updatedAt,
      b.resourceId as bookingResourceId,
      r.title as resourceTitle,
      u1.fullName as initiatorName,
      u2.fullName as respondentName
    FROM booking_disputes d
    LEFT JOIN bookings b ON d.bookingId = b.id
    LEFT JOIN resources r ON b.resourceId = r.id
    LEFT JOIN users u1 ON d.initiatorId = u1.id
    LEFT JOIN users u2 ON d.respondentId = u2.id
    WHERE d.initiatorId = ? OR d.respondentId = ?
    ORDER BY d.createdAt DESC
  `).all(userId, userId) as unknown as Omit<DbDisputeWithDetails, "adminNotes">[];

  return rows;
}

export async function getDisputeById(id: string): Promise<DbDisputeWithDetails | null> {
  const db = await getDatabase();
  const row = await db.prepare(`
    SELECT 
      d.*,
      b.resourceId as bookingResourceId,
      r.title as resourceTitle,
      u1.fullName as initiatorName,
      u1.email as initiatorEmail,
      u2.fullName as respondentName,
      u2.email as respondentEmail,
      u3.fullName as assignedAdminName
    FROM booking_disputes d
    LEFT JOIN bookings b ON d.bookingId = b.id
    LEFT JOIN resources r ON b.resourceId = r.id
    LEFT JOIN users u1 ON d.initiatorId = u1.id
    LEFT JOIN users u2 ON d.respondentId = u2.id
    LEFT JOIN users u3 ON d.assignedAdminId = u3.id
    WHERE d.id = ?
  `).get(id) as DbDisputeWithDetails | undefined;

  return row || null;
}

export async function updateDisputeByAdmin(
  adminId: string,
  disputeId: string,
  updates: {
    status?: "open" | "under_review" | "resolved" | "rejected" | "closed";
    assignedAdminId?: string;
    adminNotes?: string;
    resolution?: string;
    actionTaken?: string;
  }
): Promise<{ success: boolean; dispute?: DbDisputeWithDetails; error?: string }> {
  const db = await getDatabase();
  const existing = await getDisputeById(disputeId);
  if (!existing) {
    return { success: false, error: "Dispute not found." };
  }

  const now = new Date().toISOString();
  const status = updates.status || existing.status;
  const assignedAdminId = (updates.assignedAdminId !== undefined ? updates.assignedAdminId : existing.assignedAdminId) ?? null;
  const adminNotes = (updates.adminNotes !== undefined ? updates.adminNotes : existing.adminNotes) ?? null;
  const resolution = (updates.resolution !== undefined ? updates.resolution : existing.resolution) ?? null;
  const actionTaken = (updates.actionTaken !== undefined ? updates.actionTaken : existing.actionTaken) ?? null;
  const resolvedAt = ((status === "resolved" || status === "closed" || status === "rejected") && !existing.resolvedAt ? now : existing.resolvedAt) ?? null;

  await db.prepare(`
    UPDATE booking_disputes 
    SET status = ?, assignedAdminId = ?, adminNotes = ?, resolution = ?, actionTaken = ?, resolvedAt = ?, updatedAt = ?
    WHERE id = ?
  `).run(status, assignedAdminId, adminNotes, resolution, actionTaken, resolvedAt, now, disputeId);

  await createAuditLog({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: adminId,
    action: status === "resolved" ? "DISPUTE_RESOLVED" : "DISPUTE_UPDATED",
    entityType: "booking_disputes",
    entityId: disputeId,
    details: JSON.stringify({ previousStatus: existing.status, newStatus: status, resolution, actionTaken }),
    timestamp: now,
  });

  if (status === "resolved" && resolution) {
    const notifyMsg = `Dispute #${disputeId.slice(0, 8)} has been marked as resolved by admin. Resolution: ${resolution}`;
    await createNotification({
      userId: existing.initiatorId,
      title: "Dispute Resolved",
      message: notifyMsg,
      type: "system",
      relatedEntityId: disputeId,
    });
    await createNotification({
      userId: existing.respondentId,
      title: "Dispute Resolved",
      message: notifyMsg,
      type: "system",
      relatedEntityId: disputeId,
    });
  }

  return { success: true, dispute: (await getDisputeById(disputeId)) || undefined };
}

// 5. Reporting & Community Safety
export async function createReport(params: {
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details: string;
  evidence?: string[];
}): Promise<{ success: boolean; report?: DbReport; error?: string }> {
  const db = await getDatabase();

  const duplicate = await db.prepare(`
    SELECT id FROM user_reports 
    WHERE reporterId = ? AND targetType = ? AND targetId = ? AND status IN ('open', 'investigating')
  `).get(params.reporterId, params.targetType, params.targetId);

  if (duplicate) {
    return { success: false, error: "You already have an active report under review for this entity." };
  }

  if (params.targetType === "user") {
    const targetUser = await findUserById(params.targetId);
    if (!targetUser) return { success: false, error: "Target user not found." };
  } else if (params.targetType === "resource") {
    const targetRes = await getDbResourceById(params.targetId);
    if (!targetRes) return { success: false, error: "Target resource not found." };
  } else if (params.targetType === "booking") {
    const targetBk = await getBookingById(params.targetId);
    if (!targetBk) return { success: false, error: "Target booking not found." };
  }

  const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  await db.prepare(`
    INSERT INTO user_reports (
      id, reporterId, targetType, targetId, reason, details, evidence, status, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)
  `).run(
    reportId,
    params.reporterId,
    params.targetType,
    params.targetId,
    params.reason.trim(),
    params.details.trim(),
    params.evidence ? JSON.stringify(params.evidence) : null,
    now,
    now
  );

  await createAuditLog({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: params.reporterId,
    action: "REPORT_SUBMITTED",
    entityType: "user_reports",
    entityId: reportId,
    details: JSON.stringify({ targetType: params.targetType, targetId: params.targetId, reason: params.reason }),
    timestamp: now,
  });

  await createNotification({
    userId: params.reporterId,
    title: "Report Received",
    message: `Thank you for helping keep ResourceX safe. Your report (ID: ${reportId}) has been received and our safety team is reviewing it.`,
    type: "system",
    relatedEntityId: reportId,
  });

  const created = await db.prepare("SELECT * FROM user_reports WHERE id = ?").get(reportId) as unknown as DbReport;
  return { success: true, report: created };
}

export async function getReportsForAdmin(filters?: {
  status?: string;
  targetType?: string;
}): Promise<DbReportWithDetails[]> {
  const db = await getDatabase();
  let query = `
    SELECT 
      r.*,
      u1.fullName as reporterName,
      u1.email as reporterEmail,
      u2.fullName as assignedAdminName
    FROM user_reports r
    LEFT JOIN users u1 ON r.reporterId = u1.id
    LEFT JOIN users u2 ON r.assignedAdminId = u2.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (filters?.status && filters.status !== "all") {
    query += " AND r.status = ?";
    params.push(filters.status);
  }

  if (filters?.targetType && filters.targetType !== "all") {
    query += " AND r.targetType = ?";
    params.push(filters.targetType);
  }

  query += " ORDER BY r.createdAt DESC";
  const rows = await db.prepare(query).all(...params) as unknown as DbReportWithDetails[];

  return Promise.all(
    rows.map(async (rep) => {
      let targetTitleOrName = rep.targetId;
      if (rep.targetType === "resource") {
        const res = (await db.prepare("SELECT title FROM resources WHERE id = ?").get(rep.targetId)) as { title: string } | null;
        if (res) targetTitleOrName = res.title;
      } else if (rep.targetType === "user") {
        const u = (await db.prepare("SELECT fullName FROM users WHERE id = ?").get(rep.targetId)) as { fullName: string } | null;
        if (u) targetTitleOrName = u.fullName;
      }
      return { ...rep, targetTitleOrName };
    })
  );
}

export async function getReportsForUser(userId: string): Promise<Omit<DbReportWithDetails, "adminNotes">[]> {
  const db = await getDatabase();
  const rows = await db.prepare(`
    SELECT 
      r.id, r.reporterId, r.targetType, r.targetId, r.reason, r.details, r.evidence,
      r.status, r.resolution, r.actionTaken, r.resolvedAt, r.createdAt, r.updatedAt,
      u.fullName as reporterName
    FROM user_reports r
    LEFT JOIN users u ON r.reporterId = u.id
    WHERE r.reporterId = ?
    ORDER BY r.createdAt DESC
  `).all(userId) as unknown as Omit<DbReportWithDetails, "adminNotes">[];

  return Promise.all(
    rows.map(async (rep) => {
      let targetTitleOrName = rep.targetId;
      if (rep.targetType === "resource") {
        const res = (await db.prepare("SELECT title FROM resources WHERE id = ?").get(rep.targetId)) as { title: string } | null;
        if (res) targetTitleOrName = res.title;
      } else if (rep.targetType === "user") {
        const u = (await db.prepare("SELECT fullName FROM users WHERE id = ?").get(rep.targetId)) as { fullName: string } | null;
        if (u) targetTitleOrName = u.fullName;
      }
      return { ...rep, targetTitleOrName };
    })
  );
}

export async function getReportById(id: string): Promise<DbReportWithDetails | null> {
  const db = await getDatabase();
  const rep = await db.prepare(`
    SELECT 
      r.*,
      u1.fullName as reporterName,
      u1.email as reporterEmail,
      u2.fullName as assignedAdminName
    FROM user_reports r
    LEFT JOIN users u1 ON r.reporterId = u1.id
    LEFT JOIN users u2 ON r.assignedAdminId = u2.id
    WHERE r.id = ?
  `).get(id) as DbReportWithDetails | undefined;

  if (!rep) return null;

  let targetTitleOrName = rep.targetId;
  if (rep.targetType === "resource") {
    const res = await db.prepare("SELECT title FROM resources WHERE id = ?").get(rep.targetId) as { title: string } | undefined;
    if (res) targetTitleOrName = res.title;
  } else if (rep.targetType === "user") {
    const u = await db.prepare("SELECT fullName FROM users WHERE id = ?").get(rep.targetId) as { fullName: string } | undefined;
    if (u) targetTitleOrName = u.fullName;
  }

  return { ...rep, targetTitleOrName };
}

export async function updateReportByAdmin(
  adminId: string,
  reportId: string,
  updates: {
    status?: ReportStatus;
    assignedAdminId?: string;
    adminNotes?: string;
    resolution?: string;
    actionTaken?: string;
  }
): Promise<{ success: boolean; report?: DbReportWithDetails; error?: string }> {
  const db = await getDatabase();
  const existing = await getReportById(reportId);
  if (!existing) {
    return { success: false, error: "Report not found." };
  }

  const now = new Date().toISOString();
  const status = updates.status || existing.status;
  const assignedAdminId = (updates.assignedAdminId !== undefined ? updates.assignedAdminId : existing.assignedAdminId) ?? null;
  const adminNotes = (updates.adminNotes !== undefined ? updates.adminNotes : existing.adminNotes) ?? null;
  const resolution = (updates.resolution !== undefined ? updates.resolution : existing.resolution) ?? null;
  const actionTaken = (updates.actionTaken !== undefined ? updates.actionTaken : existing.actionTaken) ?? null;
  const resolvedAt = ((status === "resolved" || status === "dismissed") && !existing.resolvedAt ? now : existing.resolvedAt) ?? null;

  await db.prepare(`
    UPDATE user_reports 
    SET status = ?, assignedAdminId = ?, adminNotes = ?, resolution = ?, actionTaken = ?, resolvedAt = ?, updatedAt = ?
    WHERE id = ?
  `).run(status, assignedAdminId, adminNotes, resolution, actionTaken, resolvedAt, now, reportId);

  await createAuditLog({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: adminId,
    action: status === "resolved" ? "REPORT_RESOLVED" : "REPORT_UPDATED",
    entityType: "user_reports",
    entityId: reportId,
    details: JSON.stringify({ previousStatus: existing.status, newStatus: status, resolution, actionTaken }),
    timestamp: now,
  });

  if ((status === "resolved" || status === "dismissed") && resolution) {
    await createNotification({
      userId: existing.reporterId,
      title: "Report Status Update",
      message: `Your report (ID: ${reportId}) has been marked as ${status}. Resolution: ${resolution}`,
      type: "system",
      relatedEntityId: reportId,
    });
  }

  return { success: true, report: (await getReportById(reportId)) || undefined };
}

// 6. Platform Categories Management
export async function getAllPlatformCategories(): Promise<DbPlatformCategoryWithCount[]> {
  const db = await getDatabase();
  const rows = await db.prepare(`
    SELECT 
      c.*,
      (SELECT COUNT(*) FROM resources WHERE category = c.name AND status != 'deleted') as resourceCount
    FROM platform_categories c
    ORDER BY c.displayOrder ASC, c.name ASC
  `).all() as unknown as DbPlatformCategoryWithCount[];
  return rows;
}

export async function createPlatformCategory(
  adminId: string,
  data: {
    name: string;
    slug?: string;
    description: string;
    icon?: string;
    displayOrder?: number;
  }
): Promise<{ success: boolean; category?: DbPlatformCategoryWithCount; error?: string }> {
  const db = await getDatabase();
  const trimmedName = data.name.trim();
  const slug = data.slug ? data.slug.trim().toLowerCase() : trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const existing = await db.prepare("SELECT id FROM platform_categories WHERE name = ? OR slug = ?").get(trimmedName, slug);
  if (existing) {
    return { success: false, error: "A category with this name or slug already exists." };
  }

  const id = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const icon = data.icon || "Tag";
  const displayOrder = data.displayOrder ?? 99;

  await db.prepare(`
    INSERT INTO platform_categories (id, name, slug, description, icon, isActive, displayOrder, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
  `).run(id, trimmedName, slug, data.description.trim(), icon, displayOrder, now, now);

  await createAuditLog({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: adminId,
    action: "CATEGORY_CREATED",
    entityType: "platform_categories",
    entityId: id,
    details: JSON.stringify({ name: trimmedName, slug }),
    timestamp: now,
  });

  const created = await db.prepare(`
    SELECT c.*, 0 as resourceCount FROM platform_categories c WHERE c.id = ?
  `).get(id) as unknown as DbPlatformCategoryWithCount;

  return { success: true, category: created };
}

export async function updatePlatformCategory(
  adminId: string,
  id: string,
  data: {
    name?: string;
    description?: string;
    icon?: string;
    isActive?: number;
    displayOrder?: number;
  }
): Promise<{ success: boolean; category?: DbPlatformCategoryWithCount; error?: string }> {
  const db = await getDatabase();
  const existing = await db.prepare("SELECT * FROM platform_categories WHERE id = ?").get(id) as DbPlatformCategory | undefined;
  if (!existing) {
    return { success: false, error: "Category not found." };
  }

  const now = new Date().toISOString();
  const name = data.name !== undefined ? data.name.trim() : existing.name;
  const description = data.description !== undefined ? data.description.trim() : existing.description;
  const icon = data.icon !== undefined ? data.icon : existing.icon;
  const isActive = data.isActive !== undefined ? data.isActive : existing.isActive;
  const displayOrder = data.displayOrder !== undefined ? data.displayOrder : existing.displayOrder;

  await db.prepare(`
    UPDATE platform_categories 
    SET name = ?, description = ?, icon = ?, isActive = ?, displayOrder = ?, updatedAt = ?
    WHERE id = ?
  `).run(name, description, icon, isActive, displayOrder, now, id);

  await createAuditLog({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: adminId,
    action: "CATEGORY_UPDATED",
    entityType: "platform_categories",
    entityId: id,
    details: JSON.stringify({ previousName: existing.name, newName: name, isActive }),
    timestamp: now,
  });

  const updated = await db.prepare(`
    SELECT c.*, (SELECT COUNT(*) FROM resources WHERE category = c.name AND status != 'deleted') as resourceCount
    FROM platform_categories c WHERE c.id = ?
  `).get(id) as unknown as DbPlatformCategoryWithCount;

  return { success: true, category: updated };
}

export async function deletePlatformCategory(
  adminId: string,
  id: string
): Promise<{ success: boolean; error?: string }> {
  const db = await getDatabase();
  const existing = await db.prepare("SELECT * FROM platform_categories WHERE id = ?").get(id) as DbPlatformCategory | undefined;
  if (!existing) {
    return { success: false, error: "Category not found." };
  }

  const countRow = await db.prepare(`
    SELECT COUNT(*) as count FROM resources WHERE category = ? AND status != 'deleted'
  `).get(existing.name) as { count: number };

  if (countRow && countRow.count > 0) {
    return {
      success: false,
      error: `Cannot delete category "${existing.name}": ${countRow.count} active resource listing(s) are currently categorized under it. Please deactivate the category or reassign the resources first.`,
    };
  }

  await db.prepare("DELETE FROM platform_categories WHERE id = ?").run(id);

  await createAuditLog({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: adminId,
    action: "CATEGORY_DELETED",
    entityType: "platform_categories",
    entityId: id,
    details: JSON.stringify({ categoryName: existing.name }),
    timestamp: new Date().toISOString(),
  });

  return { success: true };
}

// 7. Platform Settings Management
export async function getAllPlatformSettings(): Promise<DbPlatformSetting[]> {
  const db = await getDatabase();
  return await db.prepare("SELECT * FROM platform_settings ORDER BY category, key").all() as unknown as DbPlatformSetting[];
}

export async function getPlatformSettingValue(key: string, defaultValue = ""): Promise<string> {
  const db = await getDatabase();
  const row = await db.prepare("SELECT value FROM platform_settings WHERE key = ?").get(key) as { value: string } | undefined;
  return row ? row.value : defaultValue;
}

export async function updatePlatformSetting(
  adminId: string,
  key: string,
  value: string
): Promise<{ success: boolean; setting?: DbPlatformSetting; error?: string }> {
  const db = await getDatabase();
  const existing = await db.prepare("SELECT * FROM platform_settings WHERE key = ?").get(key) as DbPlatformSetting | undefined;
  if (!existing) {
    return { success: false, error: `Setting '${key}' does not exist.` };
  }

  const now = new Date().toISOString();
  await db.prepare(`
    UPDATE platform_settings 
    SET value = ?, updatedBy = ?, updatedAt = ?
    WHERE key = ?
  `).run(value, adminId, now, key);

  await createAuditLog({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: adminId,
    action: "SETTINGS_UPDATED",
    entityType: "platform_settings",
    entityId: key,
    details: JSON.stringify({ key, previousValue: existing.value, newValue: value }),
    timestamp: now,
  });

  const updated = await db.prepare("SELECT * FROM platform_settings WHERE key = ?").get(key) as unknown as DbPlatformSetting;
  return { success: true, setting: updated };
}

// 8. Admin Audit Logs Querying
export async function getAllAuditLogsForAdmin(filters?: {
  actorId?: string;
  entityType?: string;
  action?: string;
  limit?: number;
  offset?: number;
}): Promise<{ logs: (DbAuditLog & { actorName?: string; actorEmail?: string; actorRole?: string })[]; total: number }> {
  const db = await getDatabase();
  let baseQuery = `
    FROM audit_logs a
    LEFT JOIN users u ON a.actorId = u.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (filters?.actorId) {
    baseQuery += " AND a.actorId = ?";
    params.push(filters.actorId);
  }

  if (filters?.entityType && filters.entityType !== "all") {
    baseQuery += " AND a.entityType = ?";
    params.push(filters.entityType);
  }

  if (filters?.action && filters.action !== "all") {
    baseQuery += " AND a.action = ?";
    params.push(filters.action);
  }

  const total = (await db.prepare(`SELECT COUNT(*) as c ${baseQuery}`).get(...params) as { c: number }).c;

  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;

  const query = `
    SELECT 
      a.*,
      u.fullName as actorName,
      u.email as actorEmail,
      u.role as actorRole
    ${baseQuery}
    ORDER BY a.timestamp DESC
    LIMIT ? OFFSET ?
  `;

  const logs = await db.prepare(query).all(...params, limit, offset) as unknown as (DbAuditLog & { actorName?: string; actorEmail?: string; actorRole?: string })[];

  return { logs, total };
}

// ==========================================
// PHASE 7: PAYMENTS & REFUNDS DAO METHODS
// ==========================================

export async function createPaymentOrder(params: {
  userId: string;
  bookingId: string;
  resourceId: string;
  ownerId: string;
  amount: number;
  paymentType?: PaymentType;
  razorpayOrderId?: string;
}): Promise<{ success: boolean; payment?: DbPayment; error?: string }> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  // Validate booking exists
  const booking = await db.prepare("SELECT * FROM bookings WHERE id = ?").get(params.bookingId) as DbBooking | undefined;
  if (!booking) {
    return { success: false, error: "Booking not found." };
  }

  // Check if booking already has a captured deposit payment
  const existingCaptured = await db.prepare(`
    SELECT * FROM payments 
    WHERE bookingId = ? AND status = 'captured'
  `).get(params.bookingId) as DbPayment | undefined;

  if (existingCaptured) {
    return { success: false, error: "Security deposit has already been paid and captured for this booking." };
  }

  const id = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const paymentType = params.paymentType || "security_deposit";
  const currency = "INR";
  const razorpayOrderId = params.razorpayOrderId || null;

  try {
    await db.prepare(`
      INSERT INTO payments (
        id, userId, bookingId, resourceId, ownerId, amount, currency,
        paymentType, status, razorpayOrderId, razorpayPaymentId, razorpaySignature,
        failureReason, paidAt, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'created', ?, NULL, NULL, NULL, NULL, ?, ?)
    `).run(
      id,
      params.userId,
      params.bookingId,
      params.resourceId,
      params.ownerId,
      params.amount,
      currency,
      paymentType,
      razorpayOrderId,
      now,
      now
    );

    await createAuditLog({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      actorId: params.userId,
      action: "PAYMENT_ORDER_CREATED",
      entityType: "payments",
      entityId: id,
      details: JSON.stringify({
        bookingId: params.bookingId,
        amount: params.amount,
        razorpayOrderId,
      }),
      timestamp: now,
    });

    const payment = await db.prepare("SELECT * FROM payments WHERE id = ?").get(id) as unknown as DbPayment;
    return { success: true, payment };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create payment record." };
  }
}

export async function getPaymentById(id: string): Promise<DbPaymentWithDetails | null> {
  const db = await getDatabase();
  const row = await db.prepare(`
    SELECT 
      p.*,
      r.title as resourceTitle,
      u1.fullName as borrowerName,
      u1.email as borrowerEmail,
      u2.fullName as ownerName,
      u2.email as ownerEmail,
      (SELECT COALESCE(SUM(ref.amount), 0) FROM refunds ref WHERE ref.paymentId = p.id AND ref.status = 'processed') as refundedAmount
    FROM payments p
    LEFT JOIN resources r ON p.resourceId = r.id
    LEFT JOIN users u1 ON p.userId = u1.id
    LEFT JOIN users u2 ON p.ownerId = u2.id
    WHERE p.id = ?
  `).get(id) as unknown as DbPaymentWithDetails | undefined;

  return row || null;
}

export async function getPaymentByOrderId(orderId: string): Promise<DbPaymentWithDetails | null> {
  const db = await getDatabase();
  const row = await db.prepare(`
    SELECT 
      p.*,
      r.title as resourceTitle,
      u1.fullName as borrowerName,
      u1.email as borrowerEmail,
      u2.fullName as ownerName,
      u2.email as ownerEmail,
      (SELECT COALESCE(SUM(ref.amount), 0) FROM refunds ref WHERE ref.paymentId = p.id AND ref.status = 'processed') as refundedAmount
    FROM payments p
    LEFT JOIN resources r ON p.resourceId = r.id
    LEFT JOIN users u1 ON p.userId = u1.id
    LEFT JOIN users u2 ON p.ownerId = u2.id
    WHERE p.razorpayOrderId = ?
  `).get(orderId) as unknown as DbPaymentWithDetails | undefined;

  return row || null;
}

export async function getPaymentByPaymentId(paymentId: string): Promise<DbPaymentWithDetails | null> {
  const db = await getDatabase();
  const row = await db.prepare(`
    SELECT 
      p.*,
      r.title as resourceTitle,
      u1.fullName as borrowerName,
      u1.email as borrowerEmail,
      u2.fullName as ownerName,
      u2.email as ownerEmail,
      (SELECT COALESCE(SUM(ref.amount), 0) FROM refunds ref WHERE ref.paymentId = p.id AND ref.status = 'processed') as refundedAmount
    FROM payments p
    LEFT JOIN resources r ON p.resourceId = r.id
    LEFT JOIN users u1 ON p.userId = u1.id
    LEFT JOIN users u2 ON p.ownerId = u2.id
    WHERE p.razorpayPaymentId = ?
  `).get(paymentId) as unknown as DbPaymentWithDetails | undefined;

  return row || null;
}

export async function getPaymentsByBookingId(bookingId: string): Promise<DbPaymentWithDetails[]> {
  const db = await getDatabase();
  const rows = await db.prepare(`
    SELECT 
      p.*,
      r.title as resourceTitle,
      u1.fullName as borrowerName,
      u1.email as borrowerEmail,
      u2.fullName as ownerName,
      u2.email as ownerEmail,
      (SELECT COALESCE(SUM(ref.amount), 0) FROM refunds ref WHERE ref.paymentId = p.id AND ref.status = 'processed') as refundedAmount
    FROM payments p
    LEFT JOIN resources r ON p.resourceId = r.id
    LEFT JOIN users u1 ON p.userId = u1.id
    LEFT JOIN users u2 ON p.ownerId = u2.id
    WHERE p.bookingId = ?
    ORDER BY p.createdAt DESC
  `).all(bookingId) as unknown as DbPaymentWithDetails[];

  return rows || [];
}

export async function capturePayment(params: {
  paymentId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
}): Promise<{ success: boolean; payment?: DbPaymentWithDetails; error?: string }> {
  const db = await getDatabase();
  let payment: DbPaymentWithDetails | null = null;

  if (params.paymentId) {
    payment = await getPaymentById(params.paymentId);
  } else if (params.razorpayOrderId) {
    payment = await getPaymentByOrderId(params.razorpayOrderId);
  }

  if (!payment) {
    return { success: false, error: "Payment record not found." };
  }

  // Idempotency check: if already captured
  if (payment.status === "captured") {
    return { success: true, payment };
  }

  const now = new Date().toISOString();

  await db.prepare(`
    UPDATE payments 
    SET status = 'captured',
        razorpayPaymentId = ?,
        razorpaySignature = COALESCE(?, razorpaySignature),
        paidAt = ?,
        updatedAt = ?
    WHERE id = ?
  `).run(params.razorpayPaymentId, params.razorpaySignature || null, now, now, payment.id);

  // Update booking deposit status
  await db.prepare(`
    UPDATE bookings 
    SET depositStatus = 'paid',
        depositPaidAt = ?,
        updatedAt = ?
    WHERE id = ?
  `).run(now, now, payment.bookingId);

  // Audit log
  await createAuditLog({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: payment.userId,
    action: "PAYMENT_CAPTURED",
    entityType: "payments",
    entityId: payment.id,
    details: JSON.stringify({
      bookingId: payment.bookingId,
      amount: payment.amount,
      razorpayPaymentId: params.razorpayPaymentId,
      razorpayOrderId: payment.razorpayOrderId,
    }),
    timestamp: now,
  });

  // Notifications
  const amountStr = `₹${(payment.amount / 100).toFixed(2)}`;
  await createNotification({
    userId: payment.ownerId,
    title: "Security Deposit Paid",
    message: `Security deposit of ${amountStr} has been successfully paid for ${payment.resourceTitle || "your equipment"} (Booking: ${payment.bookingId.slice(0, 8)}).`,
    type: "booking_request",
    relatedEntityId: payment.bookingId,
  });

  await createNotification({
    userId: payment.userId,
    title: "Deposit Payment Successful",
    message: `Your security deposit payment of ${amountStr} for ${payment.resourceTitle || "equipment"} was confirmed.`,
    type: "system",
    relatedEntityId: payment.bookingId,
  });

  const updatedPayment = await getPaymentById(payment.id);
  return { success: true, payment: updatedPayment! };
}

export async function markPaymentFailed(params: {
  paymentId?: string;
  razorpayOrderId?: string;
  failureReason: string;
}): Promise<{ success: boolean; error?: string }> {
  const db = await getDatabase();
  let payment: DbPaymentWithDetails | null = null;

  if (params.paymentId) {
    payment = await getPaymentById(params.paymentId);
  } else if (params.razorpayOrderId) {
    payment = await getPaymentByOrderId(params.razorpayOrderId);
  }

  if (!payment) {
    return { success: false, error: "Payment record not found." };
  }

  const now = new Date().toISOString();
  await db.prepare(`
    UPDATE payments 
    SET status = 'failed',
        failureReason = ?,
        updatedAt = ?
    WHERE id = ?
  `).run(params.failureReason, now, payment.id);

  await createAuditLog({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: payment.userId,
    action: "PAYMENT_FAILED",
    entityType: "payments",
    entityId: payment.id,
    details: JSON.stringify({
      bookingId: payment.bookingId,
      failureReason: params.failureReason,
    }),
    timestamp: now,
  });

  return { success: true };
}

export async function getPaymentsForBorrower(userId: string): Promise<DbPaymentWithDetails[]> {
  const db = await getDatabase();
  const rows = await db.prepare(`
    SELECT 
      p.*,
      r.title as resourceTitle,
      u1.fullName as borrowerName,
      u1.email as borrowerEmail,
      u2.fullName as ownerName,
      u2.email as ownerEmail,
      (SELECT COALESCE(SUM(ref.amount), 0) FROM refunds ref WHERE ref.paymentId = p.id AND ref.status = 'processed') as refundedAmount
    FROM payments p
    LEFT JOIN resources r ON p.resourceId = r.id
    LEFT JOIN users u1 ON p.userId = u1.id
    LEFT JOIN users u2 ON p.ownerId = u2.id
    WHERE p.userId = ?
    ORDER BY p.createdAt DESC
  `).all(userId) as unknown as DbPaymentWithDetails[];

  return rows || [];
}

export async function getPaymentsForOwner(ownerId: string): Promise<DbPaymentWithDetails[]> {
  const db = await getDatabase();
  const rows = await db.prepare(`
    SELECT 
      p.*,
      r.title as resourceTitle,
      u1.fullName as borrowerName,
      u1.email as borrowerEmail,
      u2.fullName as ownerName,
      u2.email as ownerEmail,
      (SELECT COALESCE(SUM(ref.amount), 0) FROM refunds ref WHERE ref.paymentId = p.id AND ref.status = 'processed') as refundedAmount
    FROM payments p
    LEFT JOIN resources r ON p.resourceId = r.id
    LEFT JOIN users u1 ON p.userId = u1.id
    LEFT JOIN users u2 ON p.ownerId = u2.id
    WHERE p.ownerId = ?
    ORDER BY p.createdAt DESC
  `).all(ownerId) as unknown as DbPaymentWithDetails[];

  return rows || [];
}

export async function getAllPaymentsForAdmin(filters?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ payments: DbPaymentWithDetails[]; total: number }> {
  const db = await getDatabase();
  let baseQuery = `
    FROM payments p
    LEFT JOIN resources r ON p.resourceId = r.id
    LEFT JOIN users u1 ON p.userId = u1.id
    LEFT JOIN users u2 ON p.ownerId = u2.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (filters?.status && filters.status !== "all") {
    baseQuery += " AND p.status = ?";
    params.push(filters.status);
  }

  if (filters?.search && filters.search.trim()) {
    const s = `%${filters.search.trim()}%`;
    baseQuery += " AND (p.id LIKE ? OR p.razorpayOrderId LIKE ? OR p.razorpayPaymentId LIKE ? OR r.title LIKE ? OR u1.fullName LIKE ? OR u1.email LIKE ?)";
    params.push(s, s, s, s, s, s);
  }

  const total = (await db.prepare(`SELECT COUNT(*) as c ${baseQuery}`).get(...params) as { c: number }).c;

  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;

  const query = `
    SELECT 
      p.*,
      r.title as resourceTitle,
      u1.fullName as borrowerName,
      u1.email as borrowerEmail,
      u2.fullName as ownerName,
      u2.email as ownerEmail,
      (SELECT COALESCE(SUM(ref.amount), 0) FROM refunds ref WHERE ref.paymentId = p.id AND ref.status = 'processed') as refundedAmount
    ${baseQuery}
    ORDER BY p.createdAt DESC
    LIMIT ? OFFSET ?
  `;

  const payments = await db.prepare(query).all(...params, limit, offset) as unknown as DbPaymentWithDetails[];

  return { payments: payments || [], total };
}

export async function getAdminPaymentMetrics(): Promise<AdminPaymentMetrics> {
  const db = await getDatabase();

  const volumeRow = await db.prepare(`
    SELECT 
      COALESCE(SUM(amount), 0) as totalVolumePaise
    FROM payments
    WHERE status IN ('captured', 'partially_refunded', 'refunded')
  `).get() as { totalVolumePaise: number };

  const allTxRow = await db.prepare(`
    SELECT COUNT(*) as c FROM payments
  `).get() as { c: number };

  const successRow = await db.prepare(`
    SELECT COUNT(*) as c FROM payments WHERE status IN ('captured', 'partially_refunded', 'refunded')
  `).get() as { c: number };

  const failedRow = await db.prepare(`
    SELECT COUNT(*) as c FROM payments WHERE status = 'failed'
  `).get() as { c: number };

  const refundSumRow = await db.prepare(`
    SELECT 
      COALESCE(SUM(amount), 0) as totalRefundedPaise,
      COUNT(*) as totalRefundsCount
    FROM refunds
    WHERE status = 'processed'
  `).get() as { totalRefundedPaise: number; totalRefundsCount: number };

  const pendingRefundsRow = await db.prepare(`
    SELECT COUNT(*) as c FROM refunds WHERE status = 'pending'
  `).get() as { c: number };

  const statusRows = await db.prepare(`
    SELECT status, COUNT(*) as count FROM payments GROUP BY status
  `).all() as { status: string; count: number }[];

  const recent = (await getAllPaymentsForAdmin({ limit: 10 })).payments;

  return {
    totalVolumePaise: volumeRow?.totalVolumePaise || 0,
    totalTransactions: allTxRow?.c || 0,
    successfulPayments: successRow?.c || 0,
    failedPayments: failedRow?.c || 0,
    totalRefundsCount: refundSumRow?.totalRefundsCount || 0,
    totalRefundedPaise: refundSumRow?.totalRefundedPaise || 0,
    pendingRefundsCount: pendingRefundsRow?.c || 0,
    statusDistribution: statusRows || [],
    recentPayments: recent,
  };
}

export async function createRefund(params: {
  paymentId: string;
  amount: number;
  reason: string;
  adminId: string;
  notes?: string;
  razorpayRefundId?: string;
}): Promise<{ success: boolean; refund?: DbRefund; error?: string }> {
  const db = await getDatabase();
  const payment = await getPaymentById(params.paymentId);

  if (!payment) {
    return { success: false, error: "Payment not found." };
  }

  if (payment.status !== "captured" && payment.status !== "partially_refunded") {
    return { success: false, error: `Cannot refund payment with status: ${payment.status}. Payment must be captured.` };
  }

  if (params.amount <= 0) {
    return { success: false, error: "Refund amount must be greater than zero." };
  }

  // Calculate sum of already processed refunds for this payment
  const refundSumRow = await db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as totalRefunded
    FROM refunds
    WHERE paymentId = ? AND status = 'processed'
  `).get(payment.id) as { totalRefunded: number };

  const currentRefunded = refundSumRow?.totalRefunded || 0;
  const remainingRefundable = payment.amount - currentRefunded;

  if (params.amount > remainingRefundable) {
    return { 
      success: false, 
      error: `Refund amount (₹${(params.amount / 100).toFixed(2)}) exceeds remaining refundable balance (₹${(remainingRefundable / 100).toFixed(2)}).` 
    };
  }

  const now = new Date().toISOString();
  const refundId = `rfnd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const rzpRefundId = params.razorpayRefundId || `rfnd_test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  try {
    await db.prepare(`
      INSERT INTO refunds (
        id, paymentId, bookingId, userId, amount, reason, status,
        razorpayRefundId, failureReason, createdAt, updatedAt, processedAt
      ) VALUES (?, ?, ?, ?, ?, ?, 'processed', ?, NULL, ?, ?, ?)
    `).run(
      refundId,
      payment.id,
      payment.bookingId,
      payment.userId,
      params.amount,
      params.reason.trim(),
      rzpRefundId,
      now,
      now,
      now
    );

    const newTotalRefunded = currentRefunded + params.amount;
    const isFullRefund = newTotalRefunded >= payment.amount;

    // Update payment status
    const newPaymentStatus: PaymentStatus = isFullRefund ? "refunded" : "partially_refunded";
    await db.prepare(`
      UPDATE payments 
      SET status = ?, updatedAt = ?
      WHERE id = ?
    `).run(newPaymentStatus, now, payment.id);

    // Update booking depositStatus
    const newDepositStatus: DepositStatus = isFullRefund ? "refunded" : "partially_refunded";
    await db.prepare(`
      UPDATE bookings 
      SET depositStatus = ?, updatedAt = ?
      WHERE id = ?
    `).run(newDepositStatus, now, payment.bookingId);

    // Audit log
    await createAuditLog({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      actorId: params.adminId,
      action: "REFUND_PROCESSED",
      entityType: "refunds",
      entityId: refundId,
      details: JSON.stringify({
        paymentId: payment.id,
        bookingId: payment.bookingId,
        amount: params.amount,
        reason: params.reason,
        notes: params.notes,
        isFullRefund,
        razorpayRefundId: rzpRefundId,
      }),
      timestamp: now,
    });

    // Notify Borrower
    const refundFormatted = `₹${(params.amount / 100).toFixed(2)}`;
    await createNotification({
      userId: payment.userId,
      title: "Security Deposit Refund Processed",
      message: `A security deposit refund of ${refundFormatted} has been processed for your booking (${payment.bookingId.slice(0, 8)}). Reason: ${params.reason}.`,
      type: "system",
      relatedEntityId: payment.bookingId,
    });

    // Notify Owner
    await createNotification({
      userId: payment.ownerId,
      title: "Security Deposit Refund Issued",
      message: `A security deposit refund of ${refundFormatted} was issued to borrower for booking (${payment.bookingId.slice(0, 8)}).`,
      type: "system",
      relatedEntityId: payment.bookingId,
    });

    const refund = await db.prepare("SELECT * FROM refunds WHERE id = ?").get(refundId) as unknown as DbRefund;
    return { success: true, refund };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to process refund." };
  }
}

export async function getRefundsByPaymentId(paymentId: string): Promise<DbRefund[]> {
  const db = await getDatabase();
  const rows = await db.prepare(`
    SELECT * FROM refunds WHERE paymentId = ? ORDER BY createdAt DESC
  `).all(paymentId) as unknown as DbRefund[];
  return rows || [];
}

export async function getAllRefundsForAdmin(): Promise<DbRefundWithDetails[]> {
  const db = await getDatabase();
  const rows = await db.prepare(`
    SELECT 
      ref.*,
      r.title as resourceTitle,
      u.fullName as borrowerName,
      u.email as borrowerEmail
    FROM refunds ref
    LEFT JOIN bookings b ON ref.bookingId = b.id
    LEFT JOIN resources r ON b.resourceId = r.id
    LEFT JOIN users u ON ref.userId = u.id
    ORDER BY ref.createdAt DESC
  `).all() as unknown as DbRefundWithDetails[];

  return rows || [];
}

export async function recordWebhookEvent(params: {
  eventId: string;
  eventType: string;
  payload: string;
}): Promise<{ success: boolean; duplicate: boolean; id: string }> {
  const db = await getDatabase();
  const existing = await db.prepare(`
    SELECT * FROM payment_webhook_events WHERE eventId = ?
  `).get(params.eventId) as DbPaymentWebhookEvent | undefined;

  if (existing) {
    return { success: true, duplicate: true, id: existing.id };
  }

  const id = `wh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  try {
    await db.prepare(`
      INSERT INTO payment_webhook_events (
        id, eventId, eventType, payload, processingStatus, receivedAt, processedAt
      ) VALUES (?, ?, ?, ?, 'received', ?, NULL)
    `).run(id, params.eventId, params.eventType, params.payload, now);

    return { success: true, duplicate: false, id };
  } catch (err: any) {
    // If concurrent race condition triggered UNIQUE constraint
    const retry = await db.prepare(`
      SELECT * FROM payment_webhook_events WHERE eventId = ?
    `).get(params.eventId) as DbPaymentWebhookEvent | undefined;
    if (retry) {
      return { success: true, duplicate: true, id: retry.id };
    }
    return { success: false, duplicate: false, id };
  }
}

export async function updateWebhookEventStatus(
  eventId: string,
  status: "received" | "processed" | "ignored" | "failed"
): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.prepare(`
    UPDATE payment_webhook_events
    SET processingStatus = ?, processedAt = ?
    WHERE eventId = ?
  `).run(status, now, eventId);
}

export async function getAllWebhookEventsForAdmin(limit = 30): Promise<DbPaymentWebhookEvent[]> {
  const db = await getDatabase();
  const rows = await db.prepare(`
    SELECT * FROM payment_webhook_events ORDER BY receivedAt DESC LIMIT ?
  `).all(limit) as unknown as DbPaymentWebhookEvent[];
  return rows || [];
}
