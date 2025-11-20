import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, BookOpenIcon, HomeIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { ThemeToggle } from './ThemeToggle';
import { ProfileMenu } from './ProfileMenu';
import { SyncIndicator } from './SyncIndicator';
import { useAuthStore } from '../../store/useAuthStore';
import { cn } from '../../utils/helpers';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  
  const navItems = [
    { path: '/', label: 'Главная', icon: HomeIcon },
    { path: '/catalog', label: 'Каталог', icon: Squares2X2Icon },
    { path: '/library', label: 'Библиотека', icon: BookOpenIcon },
  ];
  
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 glass border-b border-white/10"
    >
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          {/* Logo */}
          <Link to="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpenIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold gradient-text hidden xs:block">
                Voidlace
              </span>
            </motion.div>
          </Link>
          
          {/* Navigation */}
          <nav className="flex items-center space-x-0.5 sm:space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'px-2 sm:px-4 py-2 rounded-xl flex items-center space-x-2 transition-all',
                      isActive
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden lg:block font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>
          
          {/* Right side */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Sync Indicator */}
            {isAuthenticated && <SyncIndicator />}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300 hidden sm:block"
            >
              <MagnifyingGlassIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>
            
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            
            {/* Premium Button */}
            {isAuthenticated && !user?.isPremium && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/premium')}
                className="px-2 sm:px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-1 sm:space-x-2"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="hidden md:block">Premium</span>
              </motion.button>
            )}

            {/* Profile Menu */}
            {isAuthenticated ? (
              <ProfileMenu />
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm sm:text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Войти
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};
