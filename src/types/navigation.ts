import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { OtpChallenge } from '../redux/types';

/**
 * Why a code is being collected. The server's challenge purpose is not
 * enough on its own: registration and a later email verification both open a
 * `signup` challenge but should land in different places afterwards.
 */
export type OtpIntent = 'register' | 'verify_email' | 'change_password';

export type VerifyOtpParams = {
  challenge: OtpChallenge;
  intent: OtpIntent;
  /** Where the code was sent, for the screen copy. */
  email?: string;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Events: undefined;
  Settings: undefined;
  Plans: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Welcome: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Alert: { eventId?: string } | undefined;
  Permissions: undefined;
  Account: undefined;
  ChangePassword: undefined;
  VerifyOtp: VerifyOtpParams;
};

export type RootStackProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type MainTabProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;

export type AllScreens =
  | keyof RootStackParamList
  | keyof AuthStackParamList
  | keyof MainTabParamList;
