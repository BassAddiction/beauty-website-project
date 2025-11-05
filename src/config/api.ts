// API Configuration - централизованное управление URL
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://functions.poehali.dev';
const CDN_BASE = import.meta.env.VITE_CDN_BASE_URL || 'https://cdn.poehali.dev';

// Маппинг функций (соответствует backend API)
export const API_ENDPOINTS = {
  // Auth & Security
  AUTH_CHECK: `${API_BASE}/api/auth-check`,
  
  // User Management
  GET_SUBSCRIPTION: `${API_BASE}/api/get-subscription`,
  ADMIN_USERS: `${API_BASE}/api/admin-users`,
  UPDATE_ALL_USERS: `${API_BASE}/api/update-all-users`,
  
  // Payment & Plans
  PAYMENT: `${API_BASE}/api/payment`,
  PLANS: `${API_BASE}/api/plans`,
  GET_RECEIPTS: `${API_BASE}/api/get-receipts`,
  
  // VPN Management
  REMNAWAVE: `${API_BASE}/api/remnawave`,
  LOCATIONS: `${API_BASE}/api/locations`,
  SYNC_LOCATIONS: `${API_BASE}/api/sync-locations`,
  
  // Referral System
  REFERRAL: `${API_BASE}/api/referral`,
  ACTIVATE_REFERRAL: `${API_BASE}/api/activate-referral`,
  MANUAL_EXTEND_REFERRER: `${API_BASE}/api/manual-extend-referrer`,
  
  // Content & Settings
  NEWS: `${API_BASE}/api/news`,
  SETTINGS_MANAGER: `${API_BASE}/api/settings-manager`,
  TRACKING_CODES: `${API_BASE}/api/tracking-codes-api`,
  
  // Communication
  SEND_EMAIL: `${API_BASE}/api/send-email`,
  
  // Utilities
  FIX_12MES: `${API_BASE}/api/fix-12mes`,
  FIX_MISTER: `${API_BASE}/api/fix-mister`,
} as const;

// CDN Assets
export const CDN_ASSETS = {
  LOGO: `${CDN_BASE}/files/299c507f-f10f-4048-a927-9fa71def332e.jpg`,
  CLIENT_ICONS: {
    WINDOWS: `${CDN_BASE}/files/3a0045b1-8f62-461c-946f-ea67286d8040.png`,
    MACOS: `${CDN_BASE}/files/94a03603-e00b-4b48-bedb-8e78efd9f6f5.png`,
    IOS: `${CDN_BASE}/files/3a0045b1-8f62-461c-946f-ea67286d8040.png`,
    ANDROID: `${CDN_BASE}/files/f73c3d53-4f72-4e32-9ec2-03c22c3e0af7.png`,
    LINUX: `${CDN_BASE}/files/efbc1ee1-7ead-4f28-bd0d-3f4a1a13b09f.png`,
  }
} as const;

export default API_ENDPOINTS;