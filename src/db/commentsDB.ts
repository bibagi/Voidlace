import Dexie, { Table } from 'dexie';
import { Comment, Review } from '../types/comments';

export class CommentsDB extends Dexie {
  comments!: Table<Comment, string>;
  reviews!: Table<Review, string>;

  constructor() {
    super('CommentsDB');
    this.version(1).stores({
      comments: 'id, novelId, userId, createdAt',
      reviews: 'id, novelId, userId, rating, createdAt',
    });
  }
}

const commentsDb = new CommentsDB();

// CRUD для комментариев
export const commentDB = {
  getByNovelId: async (novelId: string): Promise<Comment[]> => {
    return await commentsDb.comments
      .where('novelId')
      .equals(novelId)
      .reverse()
      .sortBy('createdAt');
  },

  add: async (comment: Comment): Promise<void> => {
    await commentsDb.comments.add(comment);
  },

  update: async (comment: Comment): Promise<void> => {
    await commentsDb.comments.put(comment);
  },

  delete: async (id: string): Promise<void> => {
    await commentsDb.comments.delete(id);
  },

  toggleLike: async (commentId: string, userId: string): Promise<void> => {
    const comment = await commentsDb.comments.get(commentId);
    if (comment) {
      const likedBy = comment.likedBy || [];
      const index = likedBy.indexOf(userId);
      
      if (index > -1) {
        likedBy.splice(index, 1);
        comment.likes = Math.max(0, comment.likes - 1);
      } else {
        likedBy.push(userId);
        comment.likes += 1;
      }
      
      comment.likedBy = likedBy;
      await commentsDb.comments.put(comment);
    }
  },
};

// CRUD для рецензий
export const reviewDB = {
  getByNovelId: async (novelId: string): Promise<Review[]> => {
    return await commentsDb.reviews
      .where('novelId')
      .equals(novelId)
      .reverse()
      .sortBy('createdAt');
  },

  add: async (review: Review): Promise<void> => {
    await commentsDb.reviews.add(review);
  },

  update: async (review: Review): Promise<void> => {
    await commentsDb.reviews.put(review);
  },

  delete: async (id: string): Promise<void> => {
    await commentsDb.reviews.delete(id);
  },

  toggleLike: async (reviewId: string, userId: string): Promise<void> => {
    const review = await commentsDb.reviews.get(reviewId);
    if (review) {
      const likedBy = review.likedBy || [];
      const index = likedBy.indexOf(userId);
      
      if (index > -1) {
        likedBy.splice(index, 1);
        review.likes = Math.max(0, review.likes - 1);
      } else {
        likedBy.push(userId);
        review.likes += 1;
      }
      
      review.likedBy = likedBy;
      await commentsDb.reviews.put(review);
    }
  },
};

export default commentsDb;
