import { useState, useEffect } from 'react';
import { Novel } from '../types';
import { novelDB } from '../db/database';

export const useNovels = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNovels = async () => {
      try {
        const data = await novelDB.getAll();
        setNovels(data);
      } catch (error) {
        console.error('Error loading novels:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNovels();
  }, []);

  return { novels, loading };
};

export const useNovel = (id: string) => {
  const [novel, setNovel] = useState<Novel | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNovel = async () => {
      try {
        const data = await novelDB.getById(id);
        setNovel(data);
      } catch (error) {
        console.error('Error loading novel:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNovel();
  }, [id]);

  return { novel, loading };
};
