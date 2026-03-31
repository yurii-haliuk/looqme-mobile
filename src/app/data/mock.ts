import { addDays, subDays, subHours, subMinutes } from 'date-fns';

export type UserRole = 'Admin' | 'User';
export type UserStatus = 'Invited' | 'Active' | 'Suspended' | 'Removed';
export type SubscriptionStatus = 'active' | 'trial' | 'past_due' | 'canceled';
export type DocumentType = 'Contract' | 'Invoice' | 'Act' | 'Other';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  last_seen_at?: string;
  invited_at: string;
  activated_at?: string;
  suspended_at?: string;
  two_fa_enabled: boolean;
  avatar_url?: string;
}

export interface Organization {
  id: string;
  name: string;
  plan_id: string;
  plan_name: string;
  subscription_status: 'active' | 'trial' | 'past_due' | 'canceled';
  renewal_date: string;
  limits: {
    mentions: number;
    ai_coding: number;
    ai_assistants: number;
    pages: number;
    keywords: number;
  };
  usage: {
    mentions_used: number;
    ai_coding_used: number;
    ai_assistants_used: number;
    pages_used: number;
    keywords_count: number;
  };
  seats: {
    total: number;
    used: number;
  };
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void';
  date: string;
  pdf_url: string;
}

export interface Document {
  id: string;
  type: DocumentType;
  title: string;
  date: string;
  period?: string;
  status: 'signed' | 'pending' | 'archived';
  url: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor_user_id: string;
  actor_name: string;
  actor_email: string;
  action_type: string;
  category: string;
  object_type: string;
  summary: string;
  ip: string;
}

// Mock Data
export const MOCK_ORG: Organization = {
  id: 'org_12345',
  name: 'Acme Corp',
  plan_id: 'plan_pro',
  plan_name: 'Pro Plan',
  subscription_status: 'active',
  renewal_date: '2026-03-27',
  limits: {
    mentions: 5000,
    ai_coding: 1000,
    ai_assistants: 5,
    pages: 50,
    keywords: 500,
  },
  usage: {
    mentions_used: 2340,
    ai_coding_used: 450,
    ai_assistants_used: 2,
    pages_used: 12,
    keywords_count: 320,
  },
  seats: {
    total: 10,
    used: 4,
  },
};

export const MOCK_USERS: User[] = [
  {
    id: 'u_1',
    email: 'alice@acme.com',
    full_name: 'Alice Admin',
    role: 'Admin',
    status: 'Active',
    last_seen_at: subMinutes(new Date(), 5).toISOString(),
    invited_at: subDays(new Date(), 30).toISOString(),
    activated_at: subDays(new Date(), 29).toISOString(),
    two_fa_enabled: true,
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'u_2',
    email: 'bob@acme.com',
    full_name: 'Bob Builder',
    role: 'User',
    status: 'Active',
    last_seen_at: subHours(new Date(), 2).toISOString(),
    invited_at: subDays(new Date(), 20).toISOString(),
    activated_at: subDays(new Date(), 19).toISOString(),
    two_fa_enabled: false,
    avatar_url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'u_3',
    email: 'charlie@acme.com',
    full_name: 'Charlie Checker',
    role: 'User',
    status: 'Invited',
    invited_at: subDays(new Date(), 1).toISOString(),
    two_fa_enabled: false,
  },
  {
    id: 'u_4',
    email: 'dave@acme.com',
    full_name: 'Dave Developer',
    role: 'User',
    status: 'Suspended',
    last_seen_at: subDays(new Date(), 5).toISOString(),
    invited_at: subDays(new Date(), 60).toISOString(),
    activated_at: subDays(new Date(), 59).toISOString(),
    suspended_at: subDays(new Date(), 2).toISOString(),
    two_fa_enabled: true,
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  },
];

export const MOCK_INVOICES: Invoice[] = [
  { id: 'inv_001', amount: 299.00, currency: 'USD', status: 'paid', date: subDays(new Date(), 30).toISOString(), pdf_url: '#' },
  { id: 'inv_002', amount: 299.00, currency: 'USD', status: 'paid', date: subDays(new Date(), 60).toISOString(), pdf_url: '#' },
  { id: 'inv_003', amount: 299.00, currency: 'USD', status: 'paid', date: subDays(new Date(), 90).toISOString(), pdf_url: '#' },
];

export const MOCK_DOCUMENTS: Document[] = [
  { id: 'doc_1', type: 'Contract', title: 'Service Agreement 2024', date: '2024-01-01', status: 'signed', url: '#' },
  { id: 'doc_2', type: 'Act', title: 'Act of Acceptance Q1', date: '2024-04-01', period: 'Q1 2024', status: 'signed', url: '#' },
  { id: 'doc_3', type: 'Invoice', title: 'Invoice #001', date: '2024-02-01', status: 'signed', url: '#' },
];

export const MOCK_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'evt_1',
    timestamp: subMinutes(new Date(), 10).toISOString(),
    actor_user_id: 'u_1',
    actor_name: 'Alice Admin',
    actor_email: 'alice@acme.com',
    action_type: 'Вхід успішний',
    category: 'Вхід',
    object_type: 'auth',
    summary: 'Вхід успішний',
    ip: '192.168.1.1',
  },
  {
    id: 'evt_2',
    timestamp: subHours(new Date(), 4).toISOString(),
    actor_user_id: 'u_2',
    actor_name: 'Bob Builder',
    actor_email: 'bob@acme.com',
    action_type: 'Вхід успішний',
    category: 'Вхід',
    object_type: 'auth',
    summary: 'Вхід успішний',
    ip: '10.0.0.5',
  },
  {
    id: 'evt_3',
    timestamp: subDays(new Date(), 1).toISOString(),
    actor_user_id: 'u_1',
    actor_name: 'Alice Admin',
    actor_email: 'alice@acme.com',
    action_type: 'Вхід успішний',
    category: 'Вхід',
    object_type: 'auth',
    summary: 'Вхід успішний',
    ip: '192.168.1.1',
  },
  {
    id: 'evt_4',
    timestamp: subDays(new Date(), 1).toISOString(),
    actor_user_id: 'u_2',
    actor_name: 'Bob Builder',
    actor_email: 'bob@acme.com',
    action_type: 'Вхід успішний',
    category: 'Вхід',
    object_type: 'auth',
    summary: 'Вхід успішний',
    ip: '10.0.0.5',
  },
  {
    id: 'evt_5',
    timestamp: subDays(new Date(), 2).toISOString(),
    actor_user_id: 'u_1',
    actor_name: 'Alice Admin',
    actor_email: 'alice@acme.com',
    action_type: 'Користувач доданий',
    category: 'Події безпеки',
    object_type: 'user',
    summary: 'Користувач доданий',
    ip: '192.168.1.1',
  },
  {
    id: 'evt_6',
    timestamp: subDays(new Date(), 3).toISOString(),
    actor_user_id: 'u_1',
    actor_name: 'Alice Admin',
    actor_email: 'alice@acme.com',
    action_type: 'Пароль змінено',
    category: 'Події безпеки',
    object_type: 'settings',
    summary: 'Пароль змінено',
    ip: '192.168.1.1',
  },
  {
    id: 'evt_7',
    timestamp: subDays(new Date(), 4).toISOString(),
    actor_user_id: 'u_2',
    actor_name: 'Bob Builder',
    actor_email: 'bob@acme.com',
    action_type: 'Вхід успішний',
    category: 'Вхід',
    object_type: 'auth',
    summary: 'Вхід успішний',
    ip: '10.0.0.5',
  },
  {
    id: 'evt_8',
    timestamp: subDays(new Date(), 5).toISOString(),
    actor_user_id: 'u_1',
    actor_name: 'Alice Admin',
    actor_email: 'alice@acme.com',
    action_type: 'Налаштування змінено',
    category: 'Налаштування',
    object_type: 'settings',
    summary: 'Налаштування змінено',
    ip: '192.168.1.1',
  },
  {
    id: 'evt_9',
    timestamp: subDays(new Date(), 5).toISOString(),
    actor_user_id: 'support_1',
    actor_name: 'Acme Support',
    actor_email: 'support@acme.com',
    action_type: 'Користувач доданий',
    category: 'Події безпеки',
    object_type: 'user',
    summary: 'Користувач доданий',
    ip: '172.16.0.1',
  },
  {
    id: 'evt_10',
    timestamp: subDays(new Date(), 6).toISOString(),
    actor_user_id: 'u_4',
    actor_name: 'Dave Developer',
    actor_email: 'dave@acme.com',
    action_type: 'Вхід успішний',
    category: 'Вхід',
    object_type: 'auth',
    summary: 'Вхід успішний',
    ip: '10.0.0.12',
  },
  {
    id: 'evt_11',
    timestamp: subDays(new Date(), 7).toISOString(),
    actor_user_id: 'u_1',
    actor_name: 'Alice Admin',
    actor_email: 'alice@acme.com',
    action_type: 'Роль змінено',
    category: 'Події безпеки',
    object_type: 'user',
    summary: 'Роль змінено',
    ip: '192.168.1.1',
  },
  {
    id: 'evt_12',
    timestamp: subDays(new Date(), 8).toISOString(),
    actor_user_id: 'u_2',
    actor_name: 'Bob Builder',
    actor_email: 'bob@acme.com',
    action_type: 'Експорт даних',
    category: 'Дані',
    object_type: 'export',
    summary: 'Експорт даних',
    ip: '10.0.0.5',
  },
  {
    id: 'evt_13',
    timestamp: subDays(new Date(), 10).toISOString(),
    actor_user_id: 'u_1',
    actor_name: 'Alice Admin',
    actor_email: 'alice@acme.com',
    action_type: 'Користувач призупинений',
    category: 'Події безпеки',
    object_type: 'user',
    summary: 'Користувач призупинений',
    ip: '192.168.1.1',
  },
  {
    id: 'evt_14',
    timestamp: subDays(new Date(), 12).toISOString(),
    actor_user_id: 'u_3',
    actor_name: 'Charlie Checker',
    actor_email: 'charlie@acme.com',
    action_type: 'Вхід успішний',
    category: 'Вхід',
    object_type: 'auth',
    summary: 'Вхід успішний',
    ip: '10.0.0.20',
  },
  {
    id: 'evt_15',
    timestamp: subDays(new Date(), 15).toISOString(),
    actor_user_id: 'u_1',
    actor_name: 'Alice Admin',
    actor_email: 'alice@acme.com',
    action_type: 'Інтеграцію підключено',
    category: 'Налаштування',
    object_type: 'integration',
    summary: 'Інтеграцію підключено',
    ip: '192.168.1.1',
  },
];