import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '../types';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** Unix seconds at which the stored access token stops being usable. */
  expiresAt: number | null;
  /** False until the stored session has been checked on app start. */
  bootstrapped: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  expiresAt: null,
  bootstrapped: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ user: AuthUser; expiresAt?: number | null }>,
    ) => {
      state.user = action.payload.user;
      state.isAuthenticated = !!action.payload.user;
      if (action.payload.expiresAt != null) {
        state.expiresAt = action.payload.expiresAt;
      }
      state.bootstrapped = true;
    },
    clearUser: state => {
      state.user = null;
      state.isAuthenticated = false;
      state.expiresAt = null;
      state.bootstrapped = true;
    },
    setBootstrapped: (state, action: PayloadAction<boolean>) => {
      state.bootstrapped = action.payload;
    },
  },
});

export const { setUser, clearUser, setBootstrapped } = authSlice.actions;
export default authSlice.reducer;
