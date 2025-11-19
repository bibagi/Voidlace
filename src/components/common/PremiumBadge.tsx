import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';

interface PremiumBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  animated?: boolean;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({
  size = 'md',
  showText = true,
  animated = true,
}) => {
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const Badge = animated ? motion.span : 'span';

  return (
    <Badge
      {...(animated && {
        whileHover: { scale: 1.05 },
        animate: {
          boxShadow: [
            '0 0 20px rgba(251, 191, 36, 0.3)',
            '0 0 30px rgba(251, 191, 36, 0.5)',
            '0 0 20px rgba(251, 191, 36, 0.3)',
          ],
        },
        transition: {
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        },
      })}
      className={`inline-flex items-center space-x-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white font-bold rounded-full shadow-lg ${sizes[size]}`}
    >
      <StarIcon className={iconSizes[size]} />
      {showText && <span>Premium</span>}
    </Badge>
  );
};
