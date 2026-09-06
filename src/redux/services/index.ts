import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  BaseQueryApi,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { clearUser } from '../slices/authSlice';
import type { AuthResponse } from '../types';
import {
  clearTokens,
  expiryFromTtl,
  getAccessToken,
  getRefreshToken,
  storeTokens,
} from '../../utils/token';

export const BASE_URL = 'https://api.tambo-app.com';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${BASE_URL}/api/`,
  timeout: 30000,
  prepareHeaders: async headers => {
    const token = await getAccessToken();
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * Access tokens live ~15 minutes, so a 401 mid-session is routine rather than
 * a sign-out. One refresh is attempted and the original request replayed; only
 * if that fails is the session torn down. Concurrent 401s share a single
 * in-flight refresh — the backend rotates refresh tokens and burns the whole
 * family on replay, so a second parallel refresh would sign the user out
 * everywhere.
 */
let refreshPromise: Promise<boolean> | null = null;

const runRefresh = async (
  apiContext: BaseQueryApi,
  extraOptions: {},
): Promise<boolean> => {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  const result = await rawBaseQuery(
    { url: 'auth/refresh', method: 'POST', body: { refreshToken } },
    apiContext,
    extraOptions,
  );

  const data = result.data as AuthResponse | undefined;
  if (!data?.tokens) {
    return false;
  }

  await storeTokens({
    accessToken: data.tokens.accessToken,
    refreshToken: data.tokens.refreshToken,
    expiresAt: expiryFromTtl(data.tokens.expiresIn),
  });
  return true;
};

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, apiContext, extraOptions) => {
  let result = await rawBaseQuery(args, apiContext, extraOptions);

  const url = typeof args === 'string' ? args : args.url;

  if (result.error?.status === 401 && url !== 'auth/refresh') {
    const pending = (refreshPromise ??= runRefresh(apiContext, extraOptions));
    let refreshed = false;
    try {
      refreshed = await pending;
    } finally {
      if (refreshPromise === pending) {
        refreshPromise = null;
      }
    }

    if (refreshed) {
      result = await rawBaseQuery(args, apiContext, extraOptions);
    } else {
      await clearTokens();
      apiContext.dispatch(clearUser());
      apiContext.dispatch(api.util.resetApiState());
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'Sessions'],
  endpoints: () => ({}),
});
