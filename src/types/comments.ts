export interface Comment {
  id: string;
  novelId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  isAuthor: boolean;
  content: string;
  likes: number;
  likedBy: string[];
  replies: Reply[];
  createdAt: string;
  updatedAt?: string;
}

export interface Reply {
  id: string;
  commentId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  isAuthor: boolean;
  content: string;
  likes: number;
  likedBy: string[];
  createdAt: string;
}

export interface Review {
  id: string;
  novelId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  likes: number;
  likedBy: string[];
  createdAt: string;
  updatedAt?: string;
}
