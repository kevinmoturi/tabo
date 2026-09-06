import { Snackbar } from 'react-native-snackbar';
import { dark, semantic } from '../theme';

/**
 * Every user-facing alert in the app goes through here so tone and duration
 * stay consistent. Errors linger; confirmations do not.
 */

export const showSuccess = (text: string): void => {
  Snackbar.show({
    text,
    duration: Snackbar.LENGTH_LONG,
    backgroundColor: semantic.ok,
    textColor: dark.bg,
  });
};

export const showError = (text: string): void => {
  Snackbar.show({
    text,
    duration: Snackbar.LENGTH_LONG,
    backgroundColor: semantic.alert,
    textColor: dark.onBrand,
  });
};

export const showInfo = (text: string): void => {
  Snackbar.show({
    text,
    duration: Snackbar.LENGTH_SHORT,
    backgroundColor: dark.surface3,
    textColor: dark.text,
  });
};
