const API_BASE = process.env.NEXT_PUBLIC_API_URL!;
const BASE_URL = `${API_BASE}/organizations/bookings`;

export class BookingsApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  let data;
  try {
    const text = await response.text();
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    const errorMessage =
      data && typeof data === "object" && "message" in data
        ? (data as { message?: string }).message || `Request failed with status ${response.status}`
        : `Request failed with status ${response.status}`;

    throw new BookingsApiError(errorMessage, response.status);
  }

  return data as T;
}

function getAccessToken(): string {
  if (typeof window === "undefined") {
    throw new BookingsApiError("Storage only available in the browser", 500);
  }
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    throw new BookingsApiError("No access token available", 401);
  }
  return accessToken;
}

export async function getOrganizationBookingsApi(status?: string): Promise<any> {
  const token = getAccessToken();
  const url = status ? `${BASE_URL}?status=${status}` : BASE_URL;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<any>(response);
}

export async function getBookingDetailsApi(bookingId: string): Promise<any> {
  const token = getAccessToken();
  const response = await fetch(`${BASE_URL}/${bookingId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<any>(response);
}

export async function cancelBookingApi(bookingId: string): Promise<any> {
  const token = getAccessToken();
  const response = await fetch(`${BASE_URL}/${bookingId}/cancel`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<any>(response);
}

export async function acceptBookingApi(bookingId: string): Promise<any> {
  const token = getAccessToken();
  const response = await fetch(`${BASE_URL}/${bookingId}/accept`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<any>(response);
}

export async function rejectBookingApi(bookingId: string, reason?: string): Promise<any> {
  const token = getAccessToken();
  const response = await fetch(`${BASE_URL}/${bookingId}/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });
  return handleResponse<any>(response);
}

export async function rescheduleBookingApi(
  bookingId: string,
  payload: { scheduledDate: string; expertId?: string }
): Promise<any> {
  const token = getAccessToken();
  const response = await fetch(`${BASE_URL}/${bookingId}/reschedule`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<any>(response);
}

export async function reassignBookingApi(bookingId: string, expertId: string): Promise<any> {
  const token = getAccessToken();
  const response = await fetch(`${BASE_URL}/${bookingId}/reassign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ expertId }),
  });
  return handleResponse<any>(response);
}

export async function getOrganizationDashboardApi(startDate?: string, endDate?: string): Promise<any> {
  const token = getAccessToken();
  let url = `${API_BASE}/organizations/dashboard`;
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<any>(response);
}

export async function createRefundRequestApi(payload: {
  bookingId: string;
  amount: string;
  reason: string;
  refundType: string;
}): Promise<any> {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE}/organizations/refunds`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<any>(response);
}

export async function getOrganizationRefundRequestsApi(status?: string): Promise<any> {
  const token = getAccessToken();
  const url = status ? `${API_BASE}/organizations/refunds?status=${status}` : `${API_BASE}/organizations/refunds`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<any>(response);
}

export async function approveRefundRequestApi(refundId: string): Promise<any> {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE}/organizations/refunds/${refundId}/approve`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<any>(response);
}

export async function rejectRefundRequestApi(refundId: string, reason?: string): Promise<any> {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE}/organizations/refunds/${refundId}/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });
  return handleResponse<any>(response);
}
