import { api } from "./client";

interface CreateCustomerResponse {
  message: string;
  customer: any;
}

interface MeResponse {
  customer: any;
}

export const authApi = {
  createCustomer: (data: { displayName: string; email: string; photoURL?: string }) =>
    api.post<CreateCustomerResponse>("/api/auth/customer", data),

  getMe: () => api.get<MeResponse>("/api/auth/me"),
};
