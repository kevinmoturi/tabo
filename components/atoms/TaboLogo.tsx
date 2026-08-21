import { Image, StyleSheet, View, type ViewStyle } from 'react-native';

interface TaboLogoProps {
  variant?: 'png' | 'horizontal-light' | 'stacked-light' | 'mark' | 'wordmark-light';
  width?: number;
  height?: number;
  style?: ViewStyle;
}

const sources = {
  png: require('../../assets/logo.png'),
  'horizontal-light': require('../../assets/icons/tabo-lockup-horizontal-light.svg'),
  'stacked-light': require('../../assets/icons/tabo-lockup-stacked-light.svg'),
  mark: require('../../assets/icons/tabo-mark.svg'),
  'wordmark-light': require('../../assets/icons/tabo-wordmark-light.svg'),
};

export function TaboLogo({
  variant = 'png',
  width = 200,
  height = 200,
  style,
}: TaboLogoProps) {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={sources[variant]}
        style={{ width, height }}
        resizeMode="contain"
        accessibilityLabel="Tabo logo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
