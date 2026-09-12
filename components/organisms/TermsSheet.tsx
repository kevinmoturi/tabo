import { useCallback, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { TaboButton } from '../atoms/TaboButton';
import { TaboIcon } from '../atoms/TaboIcon';
import { TaboText } from '../atoms/TaboText';
import { dark, radii, spacing } from '../../src/theme';

export const TERMS_URL = 'https://tambo-app.com/terms';

interface TermsSheetProps {
  visible: boolean;
  onAgree: () => void;
  onCancel: () => void;
  /** Disables both actions while the caller finishes up. */
  busy?: boolean;
}

const REACHED_END = 'tabo:terms-end';

/**
 * Runs inside the page. Reports once when the reader has scrolled within a
 * few pixels of the bottom; the page-load and resize checks cover a document
 * that is already short enough to need no scrolling at all.
 */
const SCROLL_WATCHER = `
(function () {
  var sent = false;
  function check() {
    if (sent) { return; }
    var doc = document.documentElement;
    var body = document.body;
    var top = window.pageYOffset || doc.scrollTop || body.scrollTop || 0;
    var height = Math.max(doc.scrollHeight, body.scrollHeight);
    if (top + window.innerHeight >= height - 24) {
      sent = true;
      window.ReactNativeWebView.postMessage('${REACHED_END}');
    }
  }
  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check);
  window.addEventListener('load', check);
  setTimeout(check, 500);
  check();
})();
true;
`;

/**
 * Gate between a successful login and the signed-in shell. The full terms
 * page is shown in a web view and "Agree" stays disabled until the reader has
 * scrolled to the bottom, so acceptance means the whole document was at least
 * passed over. Cancelling — including the hardware back button — is treated
 * as declining.
 */
export function TermsSheet({
  visible,
  onAgree,
  onCancel,
  busy = false,
}: TermsSheetProps) {
  const insets = useSafeAreaInsets();
  const [reachedEnd, setReachedEnd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  // Bumped to remount the web view after a failed load.
  const [attempt, setAttempt] = useState(0);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    if (event.nativeEvent.data === REACHED_END) {
      setReachedEnd(true);
    }
  }, []);

  const retry = () => {
    setFailed(false);
    setLoading(true);
    setAttempt(n => n + 1);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={busy ? undefined : onCancel}>
      <View style={styles.scrim}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.grabber} />

          <View style={styles.header}>
            <TaboText variant="h3" color={dark.text}>
              Terms of Service
            </TaboText>
            <TaboText variant="body-sm" color={dark.text3} style={styles.hint}>
              {reachedEnd
                ? 'Thanks for reading. You can continue now.'
                : 'Scroll to the bottom to continue.'}
            </TaboText>
          </View>

          <View style={styles.webviewFrame}>
            {failed ? (
              <View style={styles.fallback}>
                <TaboIcon name="WifiOff" size={32} color={dark.text3} />
                <TaboText
                  variant="body"
                  color={dark.text2}
                  align="center"
                  style={styles.fallbackText}>
                  We couldn't load the terms. Check your connection and try
                  again.
                </TaboText>
                <TaboButton variant="secondary" fullWidth={false} onPress={retry}>
                  Try again
                </TaboButton>
              </View>
            ) : (
              <WebView
                key={attempt}
                source={{ uri: TERMS_URL }}
                style={styles.webview}
                injectedJavaScript={SCROLL_WATCHER}
                onMessage={handleMessage}
                onLoadEnd={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setFailed(true);
                }}
                onHttpError={() => {
                  setLoading(false);
                  setFailed(true);
                }}
                setSupportMultipleWindows={false}
                allowsBackForwardNavigationGestures={false}
              />
            )}
            {loading && !failed ? (
              <View style={styles.loading}>
                <ActivityIndicator color={dark.brandOnSurf} />
              </View>
            ) : null}
          </View>

          <View style={styles.actions}>
            <TaboButton
              variant="secondary"
              fullWidth={false}
              style={styles.action}
              disabled={busy}
              onPress={onCancel}>
              Cancel
            </TaboButton>
            <TaboButton
              fullWidth={false}
              style={styles.action}
              disabled={!reachedEnd || busy}
              onPress={onAgree}>
              Agree & continue
            </TaboButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: dark.scrim,
    justifyContent: 'flex-end',
  },
  sheet: {
    height: '88%',
    backgroundColor: dark.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: dark.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: dark.borderStrong,
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  hint: {
    marginTop: spacing.xs,
  },
  webviewFrame: {
    flex: 1,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: dark.border,
    overflow: 'hidden',
    backgroundColor: dark.bg,
  },
  webview: {
    flex: 1,
    backgroundColor: dark.bg,
  },
  loading: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: dark.bg,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  fallbackText: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  action: {
    flex: 1,
  },
});
