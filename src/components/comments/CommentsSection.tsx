import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { commentDB } from '../../db/commentsDB';
import { Comment } from '../../types/comments';
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

interface CommentsSectionProps {
  novelId: string;
  authorId?: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ novelId, authorId }) => {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadComments();
  }, [novelId]);

  const loadComments = async () => {
    const data = await commentDB.getByNovelId(novelId);
    setComments(data);
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      novelId,
      userId: user.id,
      userName: user.username,
      userAvatar: user.avatar,
      isAuthor: user.id === authorId,
      content: newComment,
      likes: 0,
      likedBy: [],
      replies: [],
      createdAt: new Date().toISOString(),
    };

    await commentDB.add(comment);
    setNewComment('');
    loadComments();
  };

  const handleLike = async (commentId: string) => {
    if (!user) return;
    await commentDB.toggleLike(commentId, user.id);
    loadComments();
  };

  return (
    <div className="glass rounded-3xl p-8">
      <h2 className="text-3xl font-bold mb-6">Комментарии ({comments.length})</h2>

      {user && (
        <div className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Напишите комментарий..."
            className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={3}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddComment}
            className="mt-2 px-6 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600"
          >
            Отправить
          </motion.button>
        </div>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            onLike={() => handleLike(comment.id)}
            isLiked={user ? comment.likedBy.includes(user.id) : false}
          />
        ))}
      </div>
    </div>
  );
};

const CommentCard: React.FC<{
  comment: Comment;
  onLike: () => void;
  isLiked: boolean;
}> = ({ comment, onLike, isLiked }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
  >
    <div className="flex items-start space-x-3">
      <img
        src={comment.userAvatar || 'https://ui-avatars.com/api/?name=User'}
        alt={comment.userName}
        className="w-10 h-10 rounded-full"
      />
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <span className="font-semibold">{comment.userName}</span>
          {comment.isAuthor && (
            <span className="px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
              Автор
            </span>
          )}
          <span className="text-sm text-gray-500">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="mb-3">{comment.content}</p>
        <div className="flex items-center space-x-4">
          <button
            onClick={onLike}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-500"
          >
            {isLiked ? (
              <HeartSolid className="w-4 h-4 text-red-500" />
            ) : (
              <HeartIcon className="w-4 h-4" />
            )}
            <span>{comment.likes}</span>
          </button>
        </div>
      </div>
    </div>
  </motion.div>
);
