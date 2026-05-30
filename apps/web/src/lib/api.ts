import { clearStoredAuthToken, getStoredAuthToken } from "@/lib/auth";

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
  return baseUrl.replace(/\/$/, "");
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  token?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
};

export type ProfileResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
};

type ApiRequestOptions = {
  requireAuth?: boolean;
};

async function extractErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { message?: string };
    return payload.message ?? `Erro ${response.status}`;
  } catch {
    return `Erro ${response.status}`;
  }
}

function buildHeaders(initHeaders: HeadersInit | undefined, token: string | null) {
  const headers = new Headers(initHeaders);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
  options: ApiRequestOptions = {}
): Promise<T> {
  const token = getStoredAuthToken();

  if (options.requireAuth && !token) {
    throw new ApiError("Sessão não encontrada. Faça login para continuar.", 401);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: buildHeaders(init?.headers, token)
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearStoredAuthToken();
    }

    throw new ApiError(await extractErrorMessage(response), response.status);
  }

  return (await response.json()) as T;
}

export function registerUser(payload: RegisterPayload) {
  return apiRequest<RegisterResponse>(
    "/users",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
}

export function loginUser(payload: LoginPayload) {
  return apiRequest<LoginResponse>(
    "/users/sessions",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
}

export function getCurrentUser() {
  return apiRequest<ProfileResponse>("/users/me", undefined, { requireAuth: true });
}

export function getIntegrationStatus<T>() {
  return apiRequest<T>("/integrations/status", undefined, { requireAuth: true });
}

export function getAutomations<T>() {
  return apiRequest<T>("/automations", undefined, { requireAuth: true });
}
