import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeroCarousel } from '../components/home/HeroCarousel';
import { ContinueReading } from '../components/home/ContinueReading';
import { StaffPicks } from '../components/home/StaffPicks';
import { CommunityPicks } from '../components/home/CommunityPicks';
import { NewReleases } from '../components/home/NewReleases';
import { TopWeek } from '../components/home/TopWeek';
import { useNovels } from '../hooks/useNovels';
import { useLibraryStore } from '../store/useLibraryStore';
import { Loading } from '../components/common/Loading';

export const Home: React.FC = () => {
  const { novels, loading } = useNovels();
  const loadData = useLibraryStore(state => state.loadData);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return <Loading />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
    >
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <HeroCarousel novels={novels} />
        </div>
        
        <ContinueReading novels={novels} />
        <StaffPicks novels={novels} />
        <CommunityPicks novels={novels} />
        <NewReleases novels={novels} />
        <TopWeek novels={novels} />
      </div>
    </motion.div>
  );
};
