/**
 * Mock Authentication API Service
 * Simulates a full backend authentication system with localStorage persistence
 * Features: JWT tokens, user management, orders, subscriptions, invoices
 */

import { v4 as uuidv4 } from 'uuid';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'customer' | 'admin';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  profile: {
    company?: string;
    phone?: string;
    address?: string;
    avatar?: string;
  };
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  service: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  price: number;
  currency: string;
  features: string[];
}

export interface Invoice {
  id: string;
  userId: string;
  invoiceNumber: string;
  orderId: string | null;
  subscriptionId: string | null;
  amount: number;
  tax: number;
  total: number;
  currency: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  issuedAt: string;
  dueDate: string;
  paidAt: string | null;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface Database {
  users: User[];
  emailVerifications: { email: string; token: string; expiresAt: number }[];
  passwordResets: { email: string; token: string; expiresAt: number }[];
  orders: Order[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  sessions: { token: string; userId: string; expiresAt: number }[];
}

// Constants
const DB_KEY = 'sovereon_auth_db';
const SESSION_KEY = 'sovereon_session';
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

// Hash password (simple hash for demo)
const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `hash_${Math.abs(hash).toString(16)}_${password.length}`;
};

// Generate JWT-like token
const generateToken = (userId: string, type: 'access' | 'refresh'): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: userId,
    type,
    iat: Date.now(),
    exp: Date.now() + (type === 'access' ? TOKEN_EXPIRY : REFRESH_TOKEN_EXPIRY),
    jti: uuidv4()
  }));
  const signature = btoa(`${header}.${payload}.${Math.random().toString(36)}`);
  return `${header}.${payload}.${signature}`;
};

// Initialize database
const initDatabase = (): Database => {
  const stored = localStorage.getItem(DB_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    users: [],
    emailVerifications: [],
    passwordResets: [],
    orders: [],
    subscriptions: [],
    invoices: [],
    sessions: []
  };
};

// Save database
const saveDatabase = (db: Database): void => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

// Get database instance
const getDB = (): Database => initDatabase();

// Rate limiting simulation
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const checkRateLimit = (key: string, maxRequests: number = 5, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (entry.count >= maxRequests) {
    return false;
  }
  
  entry.count++;
  return true;
};

// Mock Auth API
export const mockAuthApi = {
  // Register new user
  register: async (name: string, email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    
    if (!checkRateLimit(`register_${email}`, 3, 60000)) {
      return { success: false, message: 'Too many registration attempts. Please try again later.' };
    }
    
    const db = getDB();
    
    // Check if email already exists
    if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    
    // Validate password strength
    if (password.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters long.' };
    }
    
    const newUser: User = {
      id: uuidv4(),
      name,
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      role: 'customer',
      emailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: null,
      profile: {}
    };
    
    db.users.push(newUser);
    
    // Create email verification token
    const verificationToken = uuidv4();
    db.emailVerifications.push({
      email: newUser.email,
      token: verificationToken,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });
    
    // Create sample data for the new user
    createSampleData(newUser.id, db);
    
    saveDatabase(db);
    
    // Store verification token in sessionStorage for demo purposes
    sessionStorage.setItem(`verify_${newUser.email}`, verificationToken);
    
    return { 
      success: true, 
      message: 'Registration successful! Please check your email to verify your account.',
      user: { ...newUser, passwordHash: '' }
    };
  },
  
  // Login user
  login: async (email: string, password: string): Promise<{ success: boolean; message: string; tokens?: AuthTokens; user?: User }> => {
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay
    
    if (!checkRateLimit(`login_${email}`, 5, 60000)) {
      return { success: false, message: 'Too many login attempts. Please try again later.' };
    }
    
    const db = getDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return { success: false, message: 'Invalid email or password.' };
    }
    
    if (user.passwordHash !== hashPassword(password)) {
      return { success: false, message: 'Invalid email or password.' };
    }
    
    // Update last login
    user.lastLoginAt = new Date().toISOString();
    
    // Generate tokens
    const tokens: AuthTokens = {
      accessToken: generateToken(user.id, 'access'),
      refreshToken: generateToken(user.id, 'refresh'),
      expiresAt: Date.now() + TOKEN_EXPIRY
    };
    
    // Store session
    db.sessions.push({
      token: tokens.accessToken,
      userId: user.id,
      expiresAt: tokens.expiresAt
    });
    
    saveDatabase(db);
    
    // Store session in localStorage
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      userId: user.id,
      tokens
    }));
    
    return {
      success: true,
      message: 'Login successful!',
      tokens,
      user: { ...user, passwordHash: '' }
    };
  },
  
  // Logout user
  logout: async (): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      const { tokens } = JSON.parse(session);
      const db = getDB();
      db.sessions = db.sessions.filter(s => s.token !== tokens.accessToken);
      saveDatabase(db);
    }
    
    localStorage.removeItem(SESSION_KEY);
    return { success: true, message: 'Logged out successfully.' };
  },
  
  // Verify email
  verifyEmail: async (token: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const db = getDB();
    const verification = db.emailVerifications.find(v => v.token === token);
    
    if (!verification) {
      return { success: false, message: 'Invalid or expired verification token.' };
    }
    
    if (Date.now() > verification.expiresAt) {
      return { success: false, message: 'Verification token has expired.' };
    }
    
    const user = db.users.find(u => u.email === verification.email);
    if (user) {
      user.emailVerified = true;
      user.updatedAt = new Date().toISOString();
    }
    
    db.emailVerifications = db.emailVerifications.filter(v => v.token !== token);
    saveDatabase(db);
    
    return { success: true, message: 'Email verified successfully! You can now log in.' };
  },
  
  // Request password reset
  requestPasswordReset: async (email: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    if (!checkRateLimit(`reset_${email}`, 3, 60000)) {
      return { success: false, message: 'Too many reset attempts. Please try again later.' };
    }
    
    const db = getDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      // Return success even if user not found (security best practice)
      return { success: true, message: 'If an account exists with this email, you will receive a password reset link.' };
    }
    
    const resetToken = uuidv4();
    db.passwordResets.push({
      email: user.email,
      token: resetToken,
      expiresAt: Date.now() + 60 * 60 * 1000 // 1 hour
    });
    
    saveDatabase(db);
    
    // Store reset token in sessionStorage for demo
    sessionStorage.setItem(`reset_${user.email}`, resetToken);
    
    return { success: true, message: 'If an account exists with this email, you will receive a password reset link.' };
  },
  
  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const db = getDB();
    const reset = db.passwordResets.find(r => r.token === token);
    
    if (!reset || Date.now() > reset.expiresAt) {
      return { success: false, message: 'Invalid or expired reset token.' };
    }
    
    if (newPassword.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters long.' };
    }
    
    const user = db.users.find(u => u.email === reset.email);
    if (user) {
      user.passwordHash = hashPassword(newPassword);
      user.updatedAt = new Date().toISOString();
    }
    
    db.passwordResets = db.passwordResets.filter(r => r.token !== token);
    saveDatabase(db);
    
    return { success: true, message: 'Password reset successfully! You can now log in with your new password.' };
  },
  
  // Refresh token
  refreshToken: async (refreshToken: string): Promise<{ success: boolean; tokens?: AuthTokens; message?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const db = getDB();
    const session = db.sessions.find(s => s.token === refreshToken);
    
    if (!session || Date.now() > session.expiresAt) {
      return { success: false, message: 'Invalid or expired refresh token.' };
    }
    
    const tokens: AuthTokens = {
      accessToken: generateToken(session.userId, 'access'),
      refreshToken: generateToken(session.userId, 'refresh'),
      expiresAt: Date.now() + TOKEN_EXPIRY
    };
    
    session.token = tokens.accessToken;
    session.expiresAt = tokens.expiresAt;
    saveDatabase(db);
    
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      userId: session.userId,
      tokens
    }));
    
    return { success: true, tokens };
  },
  
  // Get current user
  getCurrentUser: async (): Promise<{ success: boolean; user?: User; message?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) {
      return { success: false, message: 'Not authenticated.' };
    }
    
    const { userId, tokens } = JSON.parse(session);
    
    if (Date.now() > tokens.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return { success: false, message: 'Session expired.' };
    }
    
    const db = getDB();
    const user = db.users.find(u => u.id === userId);
    
    if (!user) {
      localStorage.removeItem(SESSION_KEY);
      return { success: false, message: 'User not found.' };
    }
    
    return { success: true, user: { ...user, passwordHash: '' } };
  },
  
  // Update user profile
  updateProfile: async (userId: string, updates: Partial<User['profile']>): Promise<{ success: boolean; user?: User; message?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const db = getDB();
    const user = db.users.find(u => u.id === userId);
    
    if (!user) {
      return { success: false, message: 'User not found.' };
    }
    
    user.profile = { ...user.profile, ...updates };
    user.updatedAt = new Date().toISOString();
    saveDatabase(db);
    
    return { success: true, user: { ...user, passwordHash: '' } };
  },
  
  // Change password
  changePassword: async (userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const db = getDB();
    const user = db.users.find(u => u.id === userId);
    
    if (!user) {
      return { success: false, message: 'User not found.' };
    }
    
    if (user.passwordHash !== hashPassword(currentPassword)) {
      return { success: false, message: 'Current password is incorrect.' };
    }
    
    if (newPassword.length < 8) {
      return { success: false, message: 'New password must be at least 8 characters long.' };
    }
    
    user.passwordHash = hashPassword(newPassword);
    user.updatedAt = new Date().toISOString();
    saveDatabase(db);
    
    return { success: true, message: 'Password changed successfully.' };
  },
  
  // Get user's orders
  getOrders: async (userId: string): Promise<{ success: boolean; orders?: Order[]; message?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const db = getDB();
    const orders = db.orders.filter(o => o.userId === userId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return { success: true, orders };
  },
  
  // Get user's subscriptions
  getSubscriptions: async (userId: string): Promise<{ success: boolean; subscriptions?: Subscription[]; message?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const db = getDB();
    const subscriptions = db.subscriptions.filter(s => s.userId === userId).sort((a, b) =>
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
    
    return { success: true, subscriptions };
  },
  
  // Get user's invoices
  getInvoices: async (userId: string): Promise<{ success: boolean; invoices?: Invoice[]; message?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const db = getDB();
    const invoices = db.invoices.filter(i => i.userId === userId).sort((a, b) =>
      new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
    );
    
    return { success: true, invoices };
  },
  
  // Get dashboard stats
  getDashboardStats: async (userId: string): Promise<{ 
    success: boolean; 
    stats?: {
      totalOrders: number;
      activeOrders: number;
      completedOrders: number;
      activeSubscriptions: number;
      totalSpent: number;
      pendingInvoices: number;
      recentOrders: Order[];
      recentInvoices: Invoice[];
    };
    message?: string;
  }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const db = getDB();
    const orders = db.orders.filter(o => o.userId === userId);
    const subscriptions = db.subscriptions.filter(s => s.userId === userId);
    const invoices = db.invoices.filter(i => i.userId === userId);
    
    const totalSpent = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.total, 0);
    
    const stats = {
      totalOrders: orders.length,
      activeOrders: orders.filter(o => o.status === 'in_progress').length,
      completedOrders: orders.filter(o => o.status === 'completed').length,
      activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
      totalSpent,
      pendingInvoices: invoices.filter(i => i.status === 'pending').length,
      recentOrders: orders.slice(0, 5),
      recentInvoices: invoices.slice(0, 5)
    };
    
    return { success: true, stats };
  },
  
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return false;
    
    try {
      const { tokens } = JSON.parse(session);
      return Date.now() < tokens.expiresAt;
    } catch {
      return false;
    }
  },
  
  // Clear all data (for testing)
  clearAllData: (): void => {
    localStorage.removeItem(DB_KEY);
    localStorage.removeItem(SESSION_KEY);
    rateLimitMap.clear();
  }
};

// Create sample data for new users
const createSampleData = (userId: string, db: Database): void => {
  // Sample orders
  const sampleOrders: Order[] = [
    {
      id: uuidv4(),
      userId,
      orderNumber: `ORD-${Date.now().toString(36).toUpperCase()}`,
      service: 'AI Strategy Consultation',
      description: 'Initial AI readiness assessment and strategy roadmap',
      status: 'completed',
      amount: 2500,
      currency: 'USD',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      userId,
      orderNumber: `ORD-${(Date.now() + 1).toString(36).toUpperCase()}`,
      service: 'Custom AI Model Development',
      description: 'Machine learning model for predictive analytics',
      status: 'in_progress',
      amount: 15000,
      currency: 'USD',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: null
    },
    {
      id: uuidv4(),
      userId,
      orderNumber: `ORD-${(Date.now() + 2).toString(36).toUpperCase()}`,
      service: 'Data Pipeline Setup',
      description: 'ETL pipeline configuration and data warehouse setup',
      status: 'pending',
      amount: 8000,
      currency: 'USD',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: null
    }
  ];
  
  // Sample subscription
  const sampleSubscription: Subscription = {
    id: uuidv4(),
    userId,
    plan: 'professional',
    status: 'active',
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 305 * 24 * 60 * 60 * 1000).toISOString(),
    autoRenew: true,
    price: 499,
    currency: 'USD',
    features: [
      'Priority Support',
      'Monthly AI Reports',
      'API Access',
      '5 Team Members',
      'Custom Integrations'
    ]
  };
  
  // Sample invoices
  const sampleInvoices: Invoice[] = [
    {
      id: uuidv4(),
      userId,
      invoiceNumber: `INV-${Date.now().toString(36).toUpperCase()}`,
      orderId: sampleOrders[0].id,
      subscriptionId: null,
      amount: 2500,
      tax: 250,
      total: 2750,
      currency: 'USD',
      status: 'paid',
      issuedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      paidAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
      items: [
        { description: 'AI Strategy Consultation', quantity: 1, unitPrice: 2500, total: 2500 }
      ]
    },
    {
      id: uuidv4(),
      userId,
      invoiceNumber: `INV-${(Date.now() + 1).toString(36).toUpperCase()}`,
      orderId: null,
      subscriptionId: sampleSubscription.id,
      amount: 499,
      tax: 49.9,
      total: 548.9,
      currency: 'USD',
      status: 'paid',
      issuedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      paidAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
      items: [
        { description: 'Professional Plan - Monthly', quantity: 1, unitPrice: 499, total: 499 }
      ]
    },
    {
      id: uuidv4(),
      userId,
      invoiceNumber: `INV-${(Date.now() + 2).toString(36).toUpperCase()}`,
      orderId: sampleOrders[1].id,
      subscriptionId: null,
      amount: 7500,
      tax: 750,
      total: 8250,
      currency: 'USD',
      status: 'pending',
      issuedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      paidAt: null,
      items: [
        { description: 'Custom AI Model Development - Phase 1 (50%)', quantity: 1, unitPrice: 7500, total: 7500 }
      ]
    }
  ];
  
  db.orders.push(...sampleOrders);
  db.subscriptions.push(sampleSubscription);
  db.invoices.push(...sampleInvoices);
};

export default mockAuthApi;
