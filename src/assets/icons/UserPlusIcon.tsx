import React from 'react';
import Svg, {Path, Circle} from 'react-native-svg';
import {theme} from '../../theme';

interface IconProps {
  size?: number;
  color?: string;
}

export const UserPlusIcon: React.FC<IconProps> = ({
  size = 24,
  color = theme.colors.accentCyan,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* User outline */}
      <Path
        d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx="8.5"
        cy="7"
        r="4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Plus sign */}
      <Path
        d="M20 8v6M23 11h-6"
        stroke={theme.colors.success}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
