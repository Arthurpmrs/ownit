export type Student = {
  id: number;
  name: string;
  email: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type SignupRequest = {
  email: string;
  name: string;
  password: string;
};

export interface ErrorResponse {
  detail?: string;
  message?: string;
  error?: string;
}
