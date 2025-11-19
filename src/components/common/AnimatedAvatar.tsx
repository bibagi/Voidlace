import { motion } from 'framer-motion';
import { AvatarFrame } from '../../types/user';

interface AnimatedAvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  frame?: AvatarFrame;
  className?: string;
}

export const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({
  src,
  alt,
  size = 'md',
  frame,
  className = '',
}) => {
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const getAnimation = () => {
    if (!frame?.enabled || frame.animation === 'none') return {};

    switch (frame.animation) {
      case 'spin':
        return {
          rotate: 360,
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          },
        };
      case 'pulse':
        return {
          scale: [1, 1.1, 1],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        };
      case 'glow':
        return {
          opacity: [0.5, 1, 0.5],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        };
      default:
        return {};
    }
  };

  return (
    <div className={`relative ${sizes[size]} ${className}`}>
      {/* Анимированная рамка */}
      {frame?.enabled && (
        <motion.div
          animate={getAnimation()}
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${frame.color} p-[${frame.thickness}px]`}
          style={{
            padding: `${frame.thickness}px`,
          }}
        >
          <div className="w-full h-full rounded-full bg-white dark:bg-gray-900" />
        </motion.div>
      )}

      {/* Аватар */}
      <img
        src={src}
        alt={alt}
        className={`relative z-10 ${sizes[size]} rounded-full object-cover ${
          frame?.enabled ? `p-[${frame.thickness + 2}px]` : ''
        }`}
        style={
          frame?.enabled
            ? {
                padding: `${frame.thickness + 2}px`,
              }
            : undefined
        }
      />
    </div>
  );
};
