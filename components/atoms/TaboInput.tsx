import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { TaboIcon, type IconName } from './TaboIcon';
import { dark, radii, spacing } from '../../src/theme';

interface TaboInputProps extends Omit<TextInputProps, 'style'> {
  leftIcon?: IconName;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
  error?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
}

export function TaboInput({
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  error,
  containerStyle,
  inputStyle,
  ...rest
}: TaboInputProps) {
  const [isSecure, setIsSecure] = useState(secureTextEntry ?? false);
  const [focused, setFocused] = useState(false);

  const effectiveRightIcon: IconName | undefined = secureTextEntry
    ? isSecure
      ? 'Eye'
      : 'EyeOff'
    : rightIcon;

  return (
    <View
      style={[
        styles.container,
        error && styles.error,
        focused && styles.focused,
        containerStyle,
      ]}>
      {leftIcon ? (
        <View style={styles.icon}>
          <TaboIcon name={leftIcon} size={20} color={dark.text2} />
        </View>
      ) : null}
      <TextInput
        style={[styles.input, inputStyle]}
        placeholderTextColor={dark.text3}
        secureTextEntry={isSecure}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...rest}
      />
      {effectiveRightIcon ? (
        <View style={styles.icon}>
          <TaboIcon
            name={effectiveRightIcon}
            size={20}
            color={dark.text2}
            onPress={() => {
              if (secureTextEntry) {
                setIsSecure(prev => !prev);
              } else {
                onRightIconPress?.();
              }
            }}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: dark.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: dark.border,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  input: {
    flex: 1,
    color: dark.text,
    fontSize: 15,
    lineHeight: 20,
    paddingVertical: spacing.md,
  },
  icon: {
    marginHorizontal: spacing.sm,
  },
  error: {
    borderColor: dark.alertFg,
    backgroundColor: dark.alertWash,
  },
  focused: {
    borderColor: dark.brand,
  },
});
