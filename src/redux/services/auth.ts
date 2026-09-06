import { api } from './index';
import type {
  AuthResponse,
  LoginBody,
  MeResponse,
  RegisterBody,
  SessionsResponse,
} from '../types';

const injectedEndpoints = api.injectEndpoints({
  endpoints: build => ({
    register: build.mutation<AuthResponse, { body: RegisterBody }>({
      query: ({ body }) => ({
        url: 'auth/register',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),

    login: build.mutation<AuthResponse, { body: LoginBody }>({
      query: ({ body }) => ({
        url: 'auth/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),

    /** Public endpoint: revokes the session the refresh token belongs to. */
    logout: build.mutation<void, { body: { refreshToken: string } }>({
      query: ({ body }) => ({
        url: 'auth/logout',
        method: 'POST',
        body,
      }),
    }),

    logoutAll: build.mutation<void, void>({
      query: () => ({ url: 'auth/logout-all', method: 'POST' }),
    }),

    me: build.query<MeResponse, void>({
      query: () => 'auth/me',
      providesTags: ['Auth'],
    }),

    sessions: build.query<SessionsResponse, void>({
      query: () => 'auth/sessions',
      providesTags: ['Sessions'],
    }),

    revokeSession: build.mutation<void, { id: string }>({
      query: ({ id }) => ({ url: `auth/sessions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Sessions'],
    }),

    forgotPassword: build.mutation<void, { body: { email: string } }>({
      query: ({ body }) => ({
        url: 'auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useLogoutAllMutation,
  useMeQuery,
  useLazyMeQuery,
  useSessionsQuery,
  useRevokeSessionMutation,
  useForgotPasswordMutation,
} = injectedEndpoints;
