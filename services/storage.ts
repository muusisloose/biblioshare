import { User, Book, Post, Comment, DataStore } from '../types';

const STORAGE_KEY = 'biblioshare_data_v1';

// Seed data to make the app look alive initially
const SEED_DATA: Omit<DataStore, 'currentUser'> = {
  users: [
    {
      id: 'u1',
      name: 'Alice Reader',
      email: 'alice@example.com',
      avatarUrl: 'https://picsum.photos/seed/alice/200/200',
      bio: 'Lover of sci-fi and philosophy.',
      followedUserIds: ['u2'],
      followedBookIds: ['b1']
    },
    {
      id: 'u2',
      name: 'Bob Critic',
      email: 'bob@example.com',
      avatarUrl: 'https://picsum.photos/seed/bob/200/200',
      bio: 'I write harsh but fair reviews.',
      followedUserIds: [],
      followedBookIds: []
    }
  ],
  books: [
    {
      id: 'b1',
      title: 'Dune',
      author: 'Frank Herbert',
      coverUrl: 'https://picsum.photos/seed/dune/300/450',
      description: 'A mythic and emotionally charged hero\'s journey.'
    },
    {
      id: 'b2',
      title: '1984',
      author: 'George Orwell',
      coverUrl: 'https://picsum.photos/seed/1984/300/450',
      description: 'A dystopian social science fiction novel.'
    }
  ],
  posts: [
    {
      id: 'p1',
      userId: 'u1',
      bookId: 'b1',
      title: 'Why Paul Atreides is a Warning, Not a Hero',
      content: 'Everyone thinks Dune is a typical hero journey, but reading deeper into the subtext reveals Herbert\'s warning about charismatic leaders...',
      imageUrl: 'https://picsum.photos/seed/dunepost/800/400',
      createdAt: Date.now() - 10000000,
      likes: ['u2']
    },
    {
      id: 'p2',
      userId: 'u2',
      bookId: 'b2',
      title: 'The Relevance of Newspeak Today',
      content: 'Language controls thought. In 1984, the reduction of vocabulary meant the reduction of the range of thought. We see this today in...',
      createdAt: Date.now() - 5000000,
      likes: []
    }
  ],
  comments: [
    {
      id: 'c1',
      postId: 'p1',
      userId: 'u2',
      content: 'Great insight! I missed that on my first read.',
      createdAt: Date.now() - 9000000
    },
    {
      id: 'c2',
      postId: 'p1',
      userId: 'u1',
      parentId: 'c1',
      content: 'Thanks Bob! Messiah really drives the point home.',
      createdAt: Date.now() - 8000000
    }
  ]
};

class StorageService {
  private data: DataStore;

  constructor() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      this.data = JSON.parse(stored);
      // Ensure currentUser is null on fresh load to simulate session need, 
      // or keep it if we want persistent login. Let's keep persistent.
    } else {
      this.data = { ...SEED_DATA, currentUser: null };
      this.save();
    }
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  // --- User Auth ---
  login(email: string): User | null {
    const user = this.data.users.find(u => u.email === email);
    if (user) {
      this.data.currentUser = user;
      this.save();
      return user;
    }
    return null;
  }

  register(name: string, email: string): User {
    const newUser: User = {
      id: `u${Date.now()}`,
      name,
      email,
      followedBookIds: [],
      followedUserIds: []
    };
    this.data.users.push(newUser);
    this.data.currentUser = newUser;
    this.save();
    return newUser;
  }

  logout() {
    this.data.currentUser = null;
    this.save();
  }

  getCurrentUser(): User | null {
    return this.data.currentUser;
  }

  updateUser(updatedUser: User) {
    this.data.users = this.data.users.map(u => u.id === updatedUser.id ? updatedUser : u);
    if (this.data.currentUser?.id === updatedUser.id) {
      this.data.currentUser = updatedUser;
    }
    this.save();
  }

  // --- Data Access ---
  getUsers() { return this.data.users; }
  getUser(id: string) { return this.data.users.find(u => u.id === id); }
  
  getBooks() { return this.data.books; }
  getBook(id: string) { return this.data.books.find(b => b.id === id); }
  addBook(book: Book) { 
    this.data.books.push(book); 
    this.save();
  }

  getPosts() { return this.data.posts.sort((a, b) => b.createdAt - a.createdAt); }
  getPost(id: string) { return this.data.posts.find(p => p.id === id); }
  addPost(post: Post) {
    this.data.posts.unshift(post);
    this.save();
  }
  updatePost(post: Post) {
    this.data.posts = this.data.posts.map(p => p.id === post.id ? post : p);
    this.save();
  }

  getComments(postId: string) {
    return this.data.comments.filter(c => c.postId === postId).sort((a, b) => a.createdAt - b.createdAt);
  }
  addComment(comment: Comment) {
    this.data.comments.push(comment);
    this.save();
  }
  deleteComment(commentId: string) {
    this.data.comments = this.data.comments.filter(c => c.id !== commentId && c.parentId !== commentId);
    this.save();
  }

  // --- Actions ---
  toggleFollowUser(followerId: string, targetId: string) {
    const user = this.getUser(followerId);
    if (!user) return;
    if (user.followedUserIds.includes(targetId)) {
      user.followedUserIds = user.followedUserIds.filter(id => id !== targetId);
    } else {
      user.followedUserIds.push(targetId);
    }
    this.updateUser(user);
  }

  toggleFollowBook(userId: string, bookId: string) {
    const user = this.getUser(userId);
    if (!user) return;
    if (user.followedBookIds.includes(bookId)) {
      user.followedBookIds = user.followedBookIds.filter(id => id !== bookId);
    } else {
      user.followedBookIds.push(bookId);
    }
    this.updateUser(user);
  }

  toggleLikePost(userId: string, postId: string) {
    const post = this.getPost(postId);
    if (!post) return;
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id !== userId);
    } else {
      post.likes.push(userId);
    }
    this.updatePost(post);
  }
}

export const storage = new StorageService();