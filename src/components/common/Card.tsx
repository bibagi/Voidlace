import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  glass = false,
  onClick,
}) => {
  const baseStyles = 'rounded-2xl overflow-hidden';
  const glassStyles = glass ? 'glass' : 'bg-white dark:bg-gray-900 shadow-lg';
  const hoverStyles = hover ? 'card-hover cursor-pointer' : '';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(baseStyles, glassStyles, hoverStyles, className)}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};
