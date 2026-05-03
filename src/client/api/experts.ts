const BASE_URL = "https://api.digitaloffices.com.au/organizations/experts";

export type EducationPayload = {
  degree: string;
  institution: string;
  year: number;
};

export type WorkHistoryPayload = {
  company: string;
  position: string;
  period: string;
};

export type AvailabilityPayload = {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
};

export type ServicePayload = {
  name: string;
  price: number;
  duration: number;
};

export type CreateExpertPayload = {
  name: string;
  email: string;
  username: string;
  bio: string;
  specialization: string;
  experience: number;
  consultationFee: number;
  education: EducationPayload[];
  workHistory: WorkHistoryPayload[];
  availability: AvailabilityPayload[];
  languages: string[];
  socialLinks: {
    linkedin?: string;
  };
  tags: string[];
  services: ServicePayload[];
};

export type CreateExpertResponse = {
  id?: number | string;
  message?: string;
  [key: string]: unknown;
};

export type UpdateExpertTimingsPayload = {
  availability: AvailabilityPayload[];
};

export type UpdateExpertTimingsResponse = {
  message?: string;
  [key: string]: unknown;
};

export type DeleteExpertResponse = {
  message?: string;
  [key: string]: unknown;
};

export type UploadAvatarResponse = {
  avatarUrl?: string;
  message?: string;
  [key: string]: unknown;
};

export type UploadVideoResponse = {
  videoUrl?: string;
  message?: string;
  [key: string]: unknown;
};

export class ExpertApiError extends Error {
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

    throw new ExpertApiError(errorMessage, response.status);
  }

  return data as T;
}

export async function createExpertApi(
  payload: CreateExpertPayload
): Promise<CreateExpertResponse> {
  if (typeof window === "undefined") {
    throw new ExpertApiError("Expert creation is only available in the browser", 500);
  }

  const accessToken = localStorage.getItem("access_token");

  if (!accessToken) {
    throw new ExpertApiError("No access token available", 401);
  }

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<CreateExpertResponse>(response);
}

export async function updateExpertTimingsApi(
  expertId: number | string,
  payload: UpdateExpertTimingsPayload
): Promise<UpdateExpertTimingsResponse> {
  if (typeof window === "undefined") {
    throw new ExpertApiError("Expert timing update is only available in the browser", 500);
  }

  const accessToken = localStorage.getItem("access_token");

  if (!accessToken) {
    throw new ExpertApiError("No access token available", 401);
  }

  const response = await fetch(`${BASE_URL}/${expertId}/timings`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<UpdateExpertTimingsResponse>(response);
}

export async function deleteExpertApi(expertId: number | string): Promise<DeleteExpertResponse> {
  if (typeof window === "undefined") {
    throw new ExpertApiError("Expert deletion is only available in the browser", 500);
  }

  const accessToken = localStorage.getItem("access_token");

  if (!accessToken) {
    throw new ExpertApiError("No access token available", 401);
  }

  const response = await fetch(`${BASE_URL}/${expertId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return handleResponse<DeleteExpertResponse>(response);
}

export async function uploadExpertAvatarApi(file: File): Promise<UploadAvatarResponse> {
  if (typeof window === "undefined") {
    throw new ExpertApiError("Avatar upload is only available in the browser", 500);
  }

  const accessToken = localStorage.getItem("access_token");

  if (!accessToken) {
    throw new ExpertApiError("No access token available", 401);
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/upload-avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  return handleResponse<UploadAvatarResponse>(response);
}

export async function uploadExpertVideoApi(file: File): Promise<UploadVideoResponse> {
  if (typeof window === "undefined") {
    throw new ExpertApiError("Video upload is only available in the browser", 500);
  }

  const accessToken = localStorage.getItem("access_token");

  if (!accessToken) {
    throw new ExpertApiError("No access token available", 401);
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/upload-video`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  return handleResponse<UploadVideoResponse>(response);
}