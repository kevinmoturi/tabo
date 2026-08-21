import type { ComponentProps } from 'react';
import * as LucideIcons from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { dark } from '../../src/theme';

export type IconName = keyof typeof LucideIcons;

interface TaboIconProps extends Omit<ComponentProps<LucideIcon>, 'color'> {
  name: IconName;
  size?: number;
  color?: string;
}

export function TaboIcon({
  name,
  size = 24,
  color = dark.text,
  ...rest
}: TaboIconProps) {
  const Icon = LucideIcons[name] as LucideIcon | undefined;

  if (!Icon) {
    return null;
  }

  return <Icon size={size} color={color} {...rest} />;
}
