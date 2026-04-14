import { refreshTokenApi, getAccessToken } from "./auth";

type FetchOptions = RequestInit & {
  skipAuth?: boolean;
};

export class ApiError extends Error {
  statusCode: number;
  data: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.data = data;
  }
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;
  
  const headers = new Headers(fetchOptions.headers || {});
  if (!headers.has("Content-Type") && !(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(endpoint, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401 && !skipAuth) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const { access_token } = await refreshTokenApi();
        isRefreshing = false;
        onTokenRefreshed(access_token);
      } catch (error) {
        isRefreshing = false;
        refreshSubscribers = [];
        throw new ApiError("Session expired", 401);
      }
    }

    return new Promise((resolve, reject) => {
      subscribeTokenRefresh(async (newToken: string) => {
        try {
          headers.set("Authorization", `Bearer ${newToken}`);
          const retryResponse = await fetch(endpoint, {
            ...fetchOptions,
            headers,
          });
          resolve(await handleResponse<T>(retryResponse));
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  return handleResponse<T>(response);
}

async function handleResponse<T>(response: Response): Promise<T> {
  let data;
  const contentType = response.headers.get("content-type");
  
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw new ApiError(
      data.message || data.error || "Request failed",
      response.status,
      data
    );
  }

  return data as T;
}
