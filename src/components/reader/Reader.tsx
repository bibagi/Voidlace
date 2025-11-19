import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useReaderStore } from '../../store/useReaderStore';
import { useLibraryStore } from '../../store/useLibraryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useNovel } from '../../hooks/useNovels';
import { ReaderSettings } from './ReaderSettings';
import { ReaderNavigation } from './ReaderNavigation';
import { ReaderProgress } from './ReaderProgress';
import { Loading } from '../common/Loading';
import { cn } from '../../utils/helpers';

export const Reader: React.FC = () => {
  const { novelId, chapterId } = useParams<{ novelId: string; chapterId: string }>();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const settings = useReaderStore();
  const { updateProgress } = useLibraryStore();
  const { user } = useAuthStore();

  const { novel, loading } = useNovel(novelId!);
  const allChapters = novel?.volumes.flatMap(v => v.chapters) || [];
  const currentChapter = allChapters.find(c => c.id === chapterId);
  const currentIndex = allChapters.findIndex(c => c.id === chapterId);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : undefined;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : undefined;

  // Автопрокрутка
  useEffect(() => {
    if (!settings.autoScroll) return;

    const interval = setInterval(() => {
      window.scrollBy({
        top: settings.autoScrollSpeed * 2,
        behavior: 'smooth',
      });
    }, 100);

    return () => clearInterval(interval);
  }, [settings.autoScroll, settings.autoScrollSpeed]);

  // Отслеживание прогресса
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const element = contentRef.current;
      const scrollTop = window.scrollY;
      const scrollHeight = element.scrollHeight - window.innerHeight;
      const currentProgress = Math.min(Math.round((scrollTop / scrollHeight) * 100), 100);

      setProgress(currentProgress);

      // Сохраняем прогресс
      if (novelId && chapterId && user) {
        updateProgress({
          userId: user.id,
          novelId,
          chapterId,
          progress: currentProgress,
          lastRead: new Date().toISOString(),
          scrollPosition: scrollTop,
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [novelId, chapterId, updateProgress]);

  // Скрытие/показ контролов при движении мыши
  useEffect(() => {
    let timeout: number;

    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = window.setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  // Навигация клавишами
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && prevChapter) {
        navigate(`/reader/${novelId}/${prevChapter.id}`);
      } else if (e.key === 'ArrowRight' && nextChapter) {
        navigate(`/reader/${novelId}/${nextChapter.id}`);
      } else if (e.key === 'Escape') {
        navigate(`/novel/${novelId}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [novelId, prevChapter, nextChapter, navigate]);

  if (loading) {
    return <Loading />;
  }

  if (!novel || !currentChapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Глава не найдена</p>
      </div>
    );
  }

  const fontFamilyClass = {
    inter: 'font-reader-inter',
    baskerville: 'font-reader-baskerville',
    roboto: 'font-reader-roboto',
    system: 'font-reader-system',
  }[settings.fontFamily];

  const themeClass = {
    white: 'reader-white',
    sepia: 'reader-sepia',
    dark: 'reader-dark',
    black: 'reader-black',
    gradient: 'reader-gradient',
  }[settings.theme];

  return (
    <div className={cn('min-h-screen transition-colors duration-300', themeClass, settings.blueLight && 'blue-light-filter')}>
      <ReaderProgress progress={progress} />

      {showControls && (
        <ReaderNavigation
          novelId={novelId!}
          currentChapter={currentChapter}
          prevChapter={prevChapter}
          nextChapter={nextChapter}
          onClose={() => navigate(`/novel/${novelId}`)}
        />
      )}

      <motion.div
        ref={contentRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-2 sm:px-4 pt-20 sm:pt-24 pb-24 sm:pb-32"
        style={{
          maxWidth: `${Math.min(settings.textWidth, window.innerWidth - 32)}px`,
          padding: `${Math.min(settings.padding, 20)}px`,
          paddingTop: window.innerWidth < 640 ? '5rem' : '6rem',
          paddingBottom: window.innerWidth < 640 ? '6rem' : '8rem',
        }}
      >
        <article
          className={cn('prose prose-sm sm:prose-lg max-w-none', fontFamilyClass)}
          style={{
            fontSize: window.innerWidth < 640 ? `${Math.max(settings.fontSize - 2, 12)}px` : `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
          }}
        >
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">
            Глава {currentChapter.number}: {currentChapter.title}
          </h1>

          <div className="text-xs sm:text-sm opacity-60 mb-6 sm:mb-8">
            {new Date(currentChapter.publishDate).toLocaleDateString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>

          <div
            className="whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: currentChapter.content.replace(/\n/g, '<br/>') }}
          />
        </article>

        {/* Chapter Navigation at Bottom */}
        <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
          {prevChapter ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate(`/reader/${novelId}/${prevChapter.id}`)}
              className="px-4 sm:px-6 py-2 sm:py-3 glass rounded-xl hover:shadow-lg transition-shadow text-sm sm:text-base"
            >
              ← Предыдущая глава
            </motion.button>
          ) : (
            <div />
          )}

          {nextChapter ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate(`/reader/${novelId}/${nextChapter.id}`)}
              className="px-4 sm:px-6 py-2 sm:py-3 glass rounded-xl hover:shadow-lg transition-shadow text-sm sm:text-base"
            >
              Следующая глава →
            </motion.button>
          ) : (
            <div />
          )}
        </div>
      </motion.div>

      <ReaderSettings />
    </div>
  );
};
