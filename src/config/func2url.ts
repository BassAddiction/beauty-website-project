const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:8000';

export const BACKEND_URLS = {
  'send-apology-email': `${API_BASE}/3c758ff5-54df-4672-94d2-f31215025740`,
  'restore-users': `${API_BASE}/dc4e5bd5-cc26-454f-8fbf-eec2ba7b3554`,
  'check-payment-status': `${API_BASE}/e9deb528-c2f6-4c74-b99c-04112d649dcf`,
  'manual-complete-payment': `${API_BASE}/64349051-38a3-4993-91e2-ad34c054fed4`,
  'payment-callback': `${API_BASE}/dce621ec-99e0-44a9-aa7f-5f5bd6509305`,
  'sync-uuids': `${API_BASE}/a3d63753-bd5e-4c2b-910d-38daf4569579`,
  'manual-extend': `${API_BASE}/47563c2f-3066-4d84-92ca-5d0fa7fe7a1b`,
  'site-settings': `${API_BASE}/2237e0c8-e783-4bda-9d28-69c441521c66`,
  'admin-auth': `${API_BASE}/db63dc28-8b74-4b2c-9566-9744851e40cf`,
  'restore-access': `${API_BASE}/e1fb7940-e783-4ca2-930a-c1f4504b0921`,
  'settings-manager': `${API_BASE}/5375b8f5-5979-4f46-b106-9c9ca07e2da6`,
  'fix-mister': `${API_BASE}/0e777ae2-2f60-42e6-a96c-aa949fb114f3`,
  'manual-extend-referrer': `${API_BASE}/538e5f5a-c872-4fdb-a6fe-69bd507b9b1b`,
  'activate-referral': `${API_BASE}/358b9593-075d-4262-9190-984599107ece`,
  'referral': `${API_BASE}/c2ba3181-8d0f-4bb5-b0fb-06f7770e8037`,
  'tracking-codes-api': `${API_BASE}/7a6acadf-d332-41e0-a309-e41e647fedae`,
  'auth-check': `${API_BASE}/833bc0dd-ad44-4b38-b1ac-2ff2f5b265e5`,
  'news': `${API_BASE}/3b70872b-40db-4e8a-81e6-228e407e152b`,
  'get-receipts': `${API_BASE}/2eb021b7-8d70-47e2-b4ca-6e113a73d436`,
  'sync-locations': `${API_BASE}/a93c29cf-6f89-4fe3-a7e6-717e7d5a8112`,
  'locations': `${API_BASE}/3271c5a0-f0f4-42e8-b230-c35b772c0024`,
  'plans': `${API_BASE}/fbbbfbaf-a8c7-4eec-8f61-5976ed535592`,
  'admin-users': `${API_BASE}/e99b698b-6c6b-46cc-9206-1d6dac7e8575`,
  'remnawave': `${API_BASE}/4e61ec57-0f83-4c68-83fb-8b3049f711ab`,
  'send-email': `${API_BASE}/b7df3121-2214-4658-b0d1-8af63a4ce471`,
  'update-all-users': `${API_BASE}/058e87bb-5d15-4a90-8f78-2ab58eeaf5c8`,
  'get-subscription': `${API_BASE}/c56efe3d-0219-4eab-a894-5d98f0549ef0`,
  'payment': `${API_BASE}/1cd4e8c8-3e41-470f-a824-9c8dd42b6c9c`
} as const;

export type BackendFunction = keyof typeof BACKEND_URLS;

// Helper function to get backend URL
export function getBackendUrl(functionName: BackendFunction): string {
  return BACKEND_URLS[functionName];
}