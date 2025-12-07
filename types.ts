export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  followedUserIds: string[];
  followedBookIds: string[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  description?: string;
}

export interface Post {
  id: string;
  userId: string;
  bookId: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: number; // timestamp
  likes: string[]; // array of userIds
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentId?: string; // If present, it's a reply
  createdAt: number;
}

export interface DataStore {
  users: User[];
  books: Book[];
  posts: Post[];
  comments: Comment[];
  currentUser: User | null;
}