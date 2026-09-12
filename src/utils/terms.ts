import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Terms acceptance lives on the device for now — there is no server record
 * of it yet. Keyed per account so a second user signing in on the same phone
 * is asked too, rather than inheriting the first one's answer.
 */

const keyFor = (userId: string) => `@tabo/termsAcceptedAt:${userId}`;

export const hasAcceptedTerms = async (userId: string): Promise<boolean> => {
  try {
    return (await AsyncStorage.getItem(keyFor(userId))) !== null;
  } catch (e) {
    console.log('hasAcceptedTerms', e);
    // Unreadable storage must not lock the user out behind a prompt they
    // may already have answered.
    return true;
  }
};

export const markTermsAccepted = async (userId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(keyFor(userId), new Date().toISOString());
  } catch (e) {
    console.log('markTermsAccepted', e);
  }
};
