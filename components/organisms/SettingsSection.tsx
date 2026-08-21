import { StyleSheet, View } from 'react-native';
import { TaboText } from '../atoms/TaboText';
import { type SettingRowProps } from '../molecules/SettingRow';
import { dark, spacing } from '../../src/theme';
import { SettingRow } from '../molecules/SettingRow';

interface SettingsSectionProps {
  title?: string;
  rows: SettingRowProps[];
}

export function SettingsSection({ title, rows }: SettingsSectionProps) {
  return (
    <View style={styles.container}>
      {title ? (
        <TaboText variant="label" color={dark.text3} style={styles.title}>
          {title.toUpperCase()}
        </TaboText>
      ) : null}
      <View style={styles.card}>
        {rows.map((row, index) => (
          <SettingRow key={index} {...row} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: dark.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
