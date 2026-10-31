import Svg, { Circle, Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

// Ícones de traço (24x24). Decorativos: ocultos para leitores de tela (o campo/botão já tem rótulo).
const stroke = { fill: 'none', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const UserIcon = ({ size = 20, color = '#1F3D36' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    <Circle cx={12} cy={8} r={4} stroke={color} {...stroke} />
    <Path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" stroke={color} {...stroke} />
  </Svg>
);

export const MailIcon = ({ size = 20, color = '#1F3D36' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    <Path d="M3 6h18v12H3z" stroke={color} {...stroke} />
    <Path d="M3 7l9 6.5L21 7" stroke={color} {...stroke} />
  </Svg>
);

export const LockIcon = ({ size = 20, color = '#1F3D36' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    <Path d="M5 11h14v10H5z" stroke={color} {...stroke} />
    <Path d="M8 11V8a4 4 0 0 1 8 0v3" stroke={color} {...stroke} />
  </Svg>
);

export const EyeIcon = ({ size = 24, color = '#1F3D36', off = false }: IconProps & { off?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    <Path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" stroke={color} {...stroke} />
    <Circle cx={12} cy={12} r={3} stroke={color} {...stroke} />
    {off ? <Path d="M4 4l16 16" stroke={color} {...stroke} /> : null}
  </Svg>
);

export const ArrowRightIcon = ({ size = 26, color = '#FFFFFF' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    <Path d="M4 12h16M14 6l6 6-6 6" stroke={color} {...stroke} />
  </Svg>
);

export const GoogleIcon = ({ size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </Svg>
);

export const FacebookIcon = ({ size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    <Circle cx={12} cy={12} r={12} fill="#1877F2" />
    <Path fill="#FFFFFF" d="M16.67 15.47l.53-3.47h-3.33V9.75c0-.95.47-1.88 1.96-1.88h1.52V4.92s-1.38-.24-2.7-.24c-2.75 0-4.55 1.67-4.55 4.69V12H6.54v3.47h3.02v8.4a12 12 0 0 0 3.7 0v-8.4h2.41z" />
  </Svg>
);
