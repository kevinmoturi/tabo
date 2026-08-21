import { StyleSheet, View } from 'react-native';
import { TaboLogo } from '../atoms/TaboLogo';
import { TaboText } from '../atoms/TaboText';
import { dark, spacing } from '../../src/theme';

interface OnboardingSlideProps {
  title: string;
  body: string;
  showMark?: boolean;
}

export function OnboardingSlide({
  title,
  body,
  showMark = true,
}: OnboardingSlideProps) {
  return (
    <View style={styles.container}>
      {showMark ? (
        <TaboLogo width={140} height={140} style={styles.mark} />
      ) : null}
      <TaboText variant="h1" color={dark.text} align="center" style={styles.title}>
        {title}
      </TaboText>
      <TaboText variant="body" color={dark.text2} align="center" style={styles.body}>
        {body}
      </TaboText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  mark: {
    marginBottom: spacing.xxl,
  },
  title: {
    width: '100%',
    marginBottom: spacing.md,
  },
  body: {
    width: '100%',
  },
});
