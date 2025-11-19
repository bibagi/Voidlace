import { motion } from 'framer-motion';

interface ReaderProgressProps {
  progress: number;
}

export const ReaderProgress: React.FC<ReaderProgressProps> = ({ progress }) => {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      className="fixed top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 z-50"
    >
      <motion.div
        className="h-full bg-gradient-to-r from-primary-500 to-purple-500"
        style={{ width: `${progress}%` }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};
