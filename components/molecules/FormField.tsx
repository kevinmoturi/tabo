import { StyleSheet, View } from 'react-native';
import { TaboInput } from '../atoms/TaboInput';
import { TaboText } from '../atoms/TaboText';
import { dark, spacing } from '../../src/theme';

interface FormFieldProps extends React.ComponentProps<typeof TaboInput> {
  label?: string;
  helper?: string;
  errorMessage?: string;
}

export function FormField({
  label,
  helper,
  errorMessage,
  containerStyle,
  ...inputProps
}: FormFieldProps) {
  return (
    <View style={containerStyle}>
      {label ? (
        <TaboText variant="label" color={dark.text2} style={styles.label}>
          {label}
        </TaboText>
      ) : null}
      <TaboInput error={!!errorMessage} {...inputProps} />
      {errorMessage ? (
        <TaboText variant="body-sm" color={dark.alertFg} style={styles.message}>
          {errorMessage}
        </TaboText>
      ) : helper ? (
        <TaboText variant="body-sm" color={dark.text3} style={styles.message}>
          {helper}
        </TaboText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.xs,
  },
  message: {
    marginTop: spacing.xs,
  },
});
