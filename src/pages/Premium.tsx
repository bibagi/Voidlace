import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { PremiumBadge } from '../components/common/PremiumBadge';
import {
  StarIcon,
  SparklesIcon,
  BoltIcon,
  ShieldCheckIcon,
  PhotoIcon,
  PaintBrushIcon,
  CheckIcon,
} from '@heroicons/react/24/solid';

export const Premium: React.FC = () => {
  const { user } = useAuthStore();

  const features = [
    {
      icon: PhotoIcon,
      title: 'Эксклюзивные аватары',
      description: 'Доступ к премиальной галерее аватаров высокого качества',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: PaintBrushIcon,
      title: 'Анимированные рамки',
      description: 'Настраиваемые анимированные рамки для вашего аватара',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: SparklesIcon,
      title: 'Премиум бейдж',
      description: 'Уникальный значок Premium рядом с вашим именем',
      color: 'from-yellow-400 to-orange-500',
    },
    {
      icon: BoltIcon,
      title: 'Ранний доступ',
      description: 'Читайте новые главы раньше всех',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Без рекламы',
      description: 'Наслаждайтесь чтением без отвлекающей рекламы',
      color: 'from-red-500 to-pink-500',
    },
    {
      icon: StarIcon,
      title: 'Приоритетная поддержка',
      description: 'Быстрые ответы на ваши вопросы',
      color: 'from-indigo-500 to-purple-500',
    },
  ];

  const plans = [
    {
      name: 'Месяц',
      price: '199',
      period: 'месяц',
      savings: null,
    },
    {
      name: '3 месяца',
      price: '499',
      period: '3 месяца',
      savings: '15%',
      popular: true,
    },
    {
      name: 'Год',
      price: '1499',
      period: 'год',
      savings: '37%',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-12"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="inline-block mb-6"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <StarIcon className="w-14 h-14 text-white" />
            </div>
          </motion.div>

          <h1 className="text-5xl font-bold mb-4 gradient-text">
            Voidlace Premium
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Улучшите свой опыт чтения с эксклюзивными функциями и преимуществами
          </p>

          {user?.isPremium && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 inline-block"
            >
              <div className="glass rounded-2xl px-6 py-4">
                <div className="flex items-center space-x-3">
                  <CheckIcon className="w-6 h-6 text-green-500" />
                  <span className="font-semibold">У вас уже есть Premium!</span>
                  <PremiumBadge size="sm" />
                </div>
                {user.premiumUntil && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Действует до: {new Date(user.premiumUntil).toLocaleDateString('ru-RU')}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="glass rounded-2xl p-6"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Pricing */}
        {!user?.isPremium && (
          <>
            <h2 className="text-3xl font-bold text-center mb-8">Выберите план</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className={`glass rounded-2xl p-8 relative ${
                    plan.popular ? 'ring-4 ring-primary-500' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 bg-primary-500 text-white text-sm font-bold rounded-full shadow-lg">
                        Популярный
                      </span>
                    </div>
                  )}

                  {plan.savings && (
                    <div className="absolute -top-4 -right-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-xs font-bold">-{plan.savings}</span>
                      </div>
                    </div>
                  )}

                  <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}₽</span>
                    <span className="text-gray-600 dark:text-gray-400">/{plan.period}</span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => alert('Функция оплаты в разработке')}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                        : 'glass hover:bg-white/50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    Выбрать план
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* FAQ */}
        <div className="glass rounded-3xl p-8">
          <h2 className="text-3xl font-bold mb-6">Часто задаваемые вопросы</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-2">Как активировать Premium?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Выберите подходящий план и следуйте инструкциям по оплате. Premium активируется автоматически после успешной оплаты.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Можно ли отменить подписку?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Да, вы можете отменить подписку в любое время. Premium будет действовать до конца оплаченного периода.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Что происходит после окончания Premium?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                После окончания подписки вы сохраните доступ к основным функциям, но потеряете премиум-преимущества.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
