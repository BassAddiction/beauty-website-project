// API Configuration - централизованное управление URL
const API_BASE = 'https://functions.poehali.dev';
const CDN_BASE = 'https://cdn.poehali.dev';

// Маппинг функций (соответствует backend/func2url.json)
export const API_ENDPOINTS = {
  // Auth & Security
  AUTH_CHECK: `${API_BASE}/833bc0dd-ad44-4b38-b1ac-2ff2f5b265e5`,
  
  // User Management
  GET_SUBSCRIPTION: `${API_BASE}/c56efe3d-0219-4eab-a894-5d98f0549ef0`,
  ADMIN_USERS: `${API_BASE}/e99b698b-6c6b-46cc-9206-1d6dac7e8575`,
  UPDATE_ALL_USERS: `${API_BASE}/058e87bb-5d15-4a90-8f78-2ab58eeaf5c8`,
  RESTORE_USERS: `${API_BASE}/dc4e5bd5-cc26-454f-8fbf-eec2ba7b3554`,
  
  // Payment & Plans
  PAYMENT: `${API_BASE}/1cd4e8c8-3e41-470f-a824-9c8dd42b6c9c`,
  CHECK_PAYMENT_STATUS: `${API_BASE}/e9deb528-c2f6-4c74-b99c-04112d649dcf`,
  PLANS: `${API_BASE}/fbbbfbaf-a8c7-4eec-8f61-5976ed535592`,
  GET_RECEIPTS: `${API_BASE}/2eb021b7-8d70-47e2-b4ca-6e113a73d436`,
  
  // VPN Management
  REMNAWAVE: `${API_BASE}/4e61ec57-0f83-4c68-83fb-8b3049f711ab`,
  LOCATIONS: `${API_BASE}/3271c5a0-f0f4-42e8-b230-c35b772c0024`,
  SYNC_LOCATIONS: `${API_BASE}/a93c29cf-6f89-4fe3-a7e6-717e7d5a8112`,
  
  // Referral System
  REFERRAL: `${API_BASE}/c2ba3181-8d0f-4bb5-b0fb-06f7770e8037`,
  ACTIVATE_REFERRAL: `${API_BASE}/358b9593-075d-4262-9190-984599107ece`,
  MANUAL_EXTEND_REFERRER: `${API_BASE}/538e5f5a-c872-4fdb-a6fe-69bd507b9b1b`,
  
  // Content & Settings
  NEWS: `${API_BASE}/3b70872b-40db-4e8a-81e6-228e407e152b`,
  SITE_SETTINGS: `${API_BASE}/2237e0c8-e783-4bda-9d28-69c441521c66`,
  SETTINGS_MANAGER: `${API_BASE}/5375b8f5-5979-4f46-b106-9c9ca07e2da6`,
  TRACKING_CODES: `${API_BASE}/7a6acadf-d332-41e0-a309-e41e647fedae`,
  
  // Communication
  SEND_EMAIL: `${API_BASE}/b7df3121-2214-4658-b0d1-8af63a4ce471`,
  RESTORE_ACCESS: `${API_BASE}/e1fb7940-e783-4ca2-930a-c1f4504b0921`,
  
  // Utilities
  FIX_12MES: `${API_BASE}/545e1c84-e3bc-47ab-9c56-55ffa01ffca5`,
  FIX_MISTER: `${API_BASE}/0e777ae2-2f60-42e6-a96c-aa949fb114f3`,
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