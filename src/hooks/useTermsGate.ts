import { useCallback, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../redux/hooks';
import { useSession } from './useSession';
import { hasAcceptedTerms, markTermsAccepted } from '../utils/terms';
import { showInfo } from '../utils/snackbar';
import type { RootStackParamList } from '../types/navigation';

type RootNav = NativeStackNavigationProp<RootStackParamList>;

/**
 * Shows the terms sheet the first time a signed-in account reaches Home and
 * remembers the answer on the device. Declining signs the account out.
 */
export const useTermsGate = () => {
  const navigation = useNavigation<RootNav>();
  const { user } = useAuth();
  const { signOut } = useSession();
  const userId = user?._id;

  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!userId) {
      setVisible(false);
      return;
    }
    let cancelled = false;
    hasAcceptedTerms(userId).then(accepted => {
      if (!cancelled) {
        setVisible(!accepted);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const agree = useCallback(async () => {
    if (!userId) {
      return;
    }
    setBusy(true);
    await markTermsAccepted(userId);
    setBusy(false);
    setVisible(false);
  }, [userId]);

  const decline = useCallback(async () => {
    setBusy(true);
    await signOut();
    setBusy(false);
    setVisible(false);
    showInfo('You need to accept the terms to use Tabo.');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth', params: { screen: 'Login' } }],
    });
  }, [navigation, signOut]);

  return { visible, busy, agree, decline };
};
