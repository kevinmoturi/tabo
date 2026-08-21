import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as LucideIcons from 'lucide-react-native';
import { TaboIcon } from './components/atoms/TaboIcon';
import { useUnlockListener } from './src/hooks/useUnlockListener';
import { dark } from './src/theme';
import type {
  AuthStackParamList,
  MainTabParamList,
  RootStackParamList,
} from './src/types/navigation';

// Screens
import { SplashScreen } from './screens/SplashScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
import { HomeScreen } from './screens/HomeScreen';
import { EventsScreen } from './screens/EventsScreen';
import { AlertScreen } from './screens/AlertScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { PlansScreen } from './screens/PlansScreen';
import { PermissionsScreen } from './screens/PermissionsScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

type IconName = keyof typeof LucideIcons;

const ROOT_SCREENS: Array<{
  name: keyof RootStackParamList;
  component: React.ComponentType<any>;
  options?: object;
}> = [
  { name: 'Splash', component: SplashScreen },
  { name: 'Onboarding', component: OnboardingScreen },
  { name: 'Welcome', component: WelcomeScreen },
  { name: 'Auth', component: AuthNavigator },
  { name: 'Main', component: MainTabs },
  { name: 'Alert', component: AlertScreen },
  { name: 'Permissions', component: PermissionsScreen },
];

const AUTH_SCREENS: Array<{
  name: keyof AuthStackParamList;
  component: React.ComponentType<any>;
}> = [
  { name: 'Login', component: LoginScreen },
  { name: 'SignUp', component: SignUpScreen },
  { name: 'ForgotPassword', component: ForgotPasswordScreen },
];

function makeTabBarIcon(icon: IconName) {
  return function TabBarIcon({
    color,
    size,
  }: {
    focused: boolean;
    color: string;
    size: number;
  }) {
    return <TaboIcon name={icon} size={size} color={color} />;
  };
}

type TabBarIconProps = { focused: boolean; color: string; size: number };

const TAB_BAR_ICONS: Record<
  keyof MainTabParamList,
  (props: TabBarIconProps) => React.ReactNode
> = {
  Home: makeTabBarIcon('Home'),
  Events: makeTabBarIcon('FileClock'),
  Plans: makeTabBarIcon('CreditCard'),
  Settings: makeTabBarIcon('Settings'),
};

const TAB_SCREENS: Array<{
  name: keyof MainTabParamList;
  component: React.ComponentType<any>;
}> = [
  { name: 'Home', component: HomeScreen },
  { name: 'Events', component: EventsScreen },
  { name: 'Plans', component: PlansScreen },
  { name: 'Settings', component: SettingsScreen },
];

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      {AUTH_SCREENS.map(screen => (
        <AuthStack.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
        />
      ))}
    </AuthStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: dark.surface,
          borderTopColor: dark.border,
        },
        tabBarActiveTintColor: dark.brand,
        tabBarInactiveTintColor: dark.text3,
        tabBarIcon: TAB_BAR_ICONS[route.name],
      })}>
      {TAB_SCREENS.map(screen => (
        <Tab.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
        />
      ))}
    </Tab.Navigator>
  );
}

function RootNavigator() {
  return (
    <RootStack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {ROOT_SCREENS.map(screen => (
        <RootStack.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={screen.options}
        />
      ))}
    </RootStack.Navigator>
  );
}

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';
  useUnlockListener();

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
