"use client";

import { auth } from "@/lib/firebase";

export class ApiError extends Error {
  public code: string;
  public status: number;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = "ApiError";
  }
}

async function getToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new ApiError(401, "UNAUTHENTICATED", "Not authenticated");
  return user.getIdToken();
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const token = await getToken();
  const res = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(
      res.status,
      data.error?.code || "UNKNOWN_ERROR",
      data.error?.message || "Something went wrong"
    );
  }

  return data as T;
}

async function requestMultipart<T>(path: string, body: FormData): Promise<T> {
  const token = await getToken();
  const res = await fetch(path, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(
      res.status,
      data.error?.code || "UNKNOWN_ERROR",
      data.error?.message || "Something went wrong"
    );
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  postMultipart: <T>(path: string, body: FormData) => requestMultipart<T>(path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  del: <T>(path: string) => request<T>("DELETE", path),
};
