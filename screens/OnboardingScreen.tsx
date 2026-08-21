import { useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TaboButton } from '../components/atoms/TaboButton';
import { OnboardingSlide } from '../components/organisms/OnboardingSlide';
import { dark, spacing } from '../src/theme';
import type { RootStackParamList } from '../src/types/navigation';

type OnboardingNav = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const SLIDES = [
  {
    title: 'Discreet protection',
    body: 'Tabo watches your device without drawing attention. One blue thing per screen — the thing you touch.',
  },
  {
    title: 'Know every unlock',
    body: 'Each unlock is logged with time and location. Review events in seconds, not hours.',
  },
  {
    title: 'Alert when it matters',
    body: 'If something feels wrong, Tabo highlights intrusions so you can act fast.',
  },
];

export function OnboardingScreen() {
  const navigation = useNavigation<OnboardingNav>();
  const { width: screenWidth } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index?: number | null }> }) => {
      if (viewableItems[0]?.index != null) {
        setIndex(viewableItems[0].index);
      }
    },
  ).current;

  const handleNext = () => {
    if (index < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      navigation.replace('Welcome');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={{ width: screenWidth }}>
            <OnboardingSlide title={item.title} body={item.body} />
          </View>
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />
      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === index && styles.activeDot]}
            />
          ))}
        </View>
        <TaboButton onPress={handleNext}>
          {index === SLIDES.length - 1 ? 'Get started' : 'Next'}
        </TaboButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: dark.bg,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: dark.surface2,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: dark.brand,
    width: 24,
  },
});
