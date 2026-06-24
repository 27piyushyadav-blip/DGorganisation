const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrgService = {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  duration?: number;
  category?: string;
  image?: string;
  isActive?: boolean;
};

export type OrgExpert = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  specialization?: string;
  experience?: number;
  consultationFee?: string;
  status?: string;
  rating?: number;
  reviewCount?: number;
  specialties?: string[];
  available?: boolean;
  role?: string;
  services?: any[];
};

export type CreateVoiceCallBookingPayload = {
  orderId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerNotes?: string;
  services: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  expertId?: string | null;
  scheduledDate?: string | null;
  scheduledTime?: string | null;
  totalAmount: number;
  paymentLink?: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

class ServicesApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

async function handleResponse<T>(response: Response): Promise<T> {
  let data: any;
  try {
    const text = await response.text();
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    const msg =
      data && typeof data === 'object' && 'message' in data
        ? data.message
        : `Request failed with status ${response.status}`;
    throw new ServicesApiError(msg, response.status);
  }

  return data as T;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Fetch the authenticated organization's service catalog.
 * GET /organizations/services
 */
export async function getOrganizationServicesApi(): Promise<{
  services: OrgService[];
  total: number;
}> {
  const token = getAccessToken();
  if (!token) throw new ServicesApiError('Not authenticated', 401);

  const response = await fetch(`${API_BASE}/organizations/services`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse(response);
}

/**
 * Fetch the authenticated organization's expert list.
 * GET /organizations/experts
 */
export async function getOrganizationExpertsForOrderApi(): Promise<{
  experts: OrgExpert[];
  total: number;
}> {
  const token = getAccessToken();
  if (!token) throw new ServicesApiError('Not authenticated', 401);

  const response = await fetch(`${API_BASE}/organizations/experts`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse(response);
}

/**
 * Create a voice-call order/booking.
 * POST /organizations/bookings
 */
export async function createVoiceCallBookingApi(
  payload: CreateVoiceCallBookingPayload
): Promise<{ message: string; booking: any }> {
  const token = getAccessToken();
  if (!token) throw new ServicesApiError('Not authenticated', 401);

  const response = await fetch(`${API_BASE}/organizations/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

// ─── Refund Request API Functions ─────────────────────────────────────────────

export async function getRefundRequestsApi(status?: string): Promise<any[]> {
  const token = getAccessToken();
  if (!token) throw new ServicesApiError('Not authenticated', 401);

  const queryParams = status ? `?status=${status}` : '';
  const response = await fetch(`${API_BASE}/organizations/refunds${queryParams}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse(response);
}

export async function approveRefundApi(refundId: string): Promise<any> {
  const token = getAccessToken();
  if (!token) throw new ServicesApiError('Not authenticated', 401);

  const response = await fetch(`${API_BASE}/organizations/refunds/${refundId}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse(response);
}

export async function rejectRefundApi(refundId: string, reason?: string): Promise<any> {
  const token = getAccessToken();
  if (!token) throw new ServicesApiError('Not authenticated', 401);

  const response = await fetch(`${API_BASE}/organizations/refunds/${refundId}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });

  return handleResponse(response);
}

// ─── Edit Service Request API Functions ─────────────────────────────────────

export async function getEditServiceRequestsApi(status?: string): Promise<any[]> {
  const token = getAccessToken();
  if (!token) throw new ServicesApiError('Not authenticated', 401);

  const queryParams = status ? `?status=${status}` : '';
  const response = await fetch(`${API_BASE}/organizations/edit-service-requests${queryParams}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse(response);
}

export async function approveEditServiceRequestApi(requestId: string): Promise<any> {
  const token = getAccessToken();
  if (!token) throw new ServicesApiError('Not authenticated', 401);

  const response = await fetch(`${API_BASE}/organizations/edit-service-requests/${requestId}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse(response);
}

export async function rejectEditServiceRequestApi(requestId: string, reason?: string): Promise<any> {
  const token = getAccessToken();
  if (!token) throw new ServicesApiError('Not authenticated', 401);

  const response = await fetch(`${API_BASE}/organizations/edit-service-requests/${requestId}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });

  return handleResponse(response);
}

/**
 * Send payment link to customer.
 * POST /organizations/bookings/send-payment-link
 */
export async function sendPaymentLinkApi(payload: {
  customerEmail: string;
  customerName: string;
  paymentLink: string;
  totalAmount: number;
}): Promise<{ message: string }> {
  const token = getAccessToken();
  if (!token) throw new ServicesApiError('Not authenticated', 401);

  const response = await fetch(`${API_BASE}/organizations/bookings/send-payment-link`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

// ─── Action Centre API Functions ─────────────────────────────────────────────

export async function getActionCentreRequestsApi(): Promise<{ requests: any[]; metrics: any }> {
  const token = getAccessToken();
  if (!token) throw new ServicesApiError('Not authenticated', 401);

  const response = await fetch(`${API_BASE}/organizations/action-centre/requests`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse(response);
}

export async function getRequestDetailsApi(id: string, type: string): Promise<any> {
  const token = getAccessToken();
  if (!token) throw new ServicesApiError('Not authenticated', 401);

  const response = await fetch(`${API_BASE}/organizations/action-centre/requests/${id}?type=${type}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse(response);
}

export async function getRequestLogsApi(): Promise<any[]> {
  const token = getAccessToken();
  if (!token) throw new ServicesApiError('Not authenticated', 401);

  const response = await fetch(`${API_BASE}/organizations/action-centre/logs`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse(response);
}

