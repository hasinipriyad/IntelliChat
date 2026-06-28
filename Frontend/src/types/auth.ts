//User Object that backend returns
export interface User {
  id: string;
  username: string;
  email: string;
}

// What we send to POST /auth/register
export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

// What we send to POST /auth/login
export interface LoginPayload {
  email: string;
  password: string;
}

// Shape of the login/register success response
export interface AuthResponse {
  message: string;
  user: User;
}

// Shape of the GET /auth/get-me response
export interface GetMeResponse {
  user: User;
}
