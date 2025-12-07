import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { storage } from '../services/storage';
import { Book, Post } from '../types';
import PostCard from '../components/PostCard';
import { AuthContext } from '../App';
import { Plus } from 'lucide-react';

const BookDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, refreshUser } = useContext(AuthContext);
  const [book, setBook] = useState<Book | undefined>(undefined);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (id) {
      setBook(storage.getBook(id));
      setPosts(storage.getPosts().filter(p => p.bookId === id));
    }
  }, [id]);

  const toggleFollow = () => {
    if (user && book) {
      storage.toggleFollowBook(user.id, book.id);
      refreshUser();
    }
  };

  if (!book) return <div className="p-8 text-center">Book not found.</div>;

  const isFollowing = user?.followedBookIds.includes(book.id);

  return (
    <div>
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 flex flex-col md:flex-row gap-8 mb-8 shadow-sm">
        <div className="w-full md:w-48 shrink-0">
          <div className="aspect-[2/3] rounded-lg overflow-hidden bg-slate-100 shadow-md">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
            )}
          </div>
        </div>
        
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{book.title}</h1>
          <p className="text-xl text-slate-600 mb-6">{book.author}</p>
          <p className="text-slate-700 leading-relaxed mb-6">{book.description || "No description available."}</p>
          
          <div className="flex items-center gap-4">
             {user ? (
               <>
                 <button 
                   onClick={toggleFollow}
                   className={`px-6 py-2 rounded-lg font-medium transition-colors ${isFollowing ? 'bg-slate-100 text-slate-700 border border-slate-300' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                 >
                   {isFollowing ? 'Unfollow Book' : 'Follow Book'}
                 </button>
                 <Link 
                   to={`/create?bookId=${book.id}`}
                   className="flex items-center space-x-2 px-6 py-2 border border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                 >
                   <Plus size={18} />
                   <span>Write a Review</span>
                 </Link>
               </>
             ) : (
                <div className="text-sm text-slate-500 bg-slate-50 px-4 py-2 rounded-lg">Log in to follow or review this book.</div>
             )}
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-6">Discussions ({posts.length})</h2>
      
      {posts.length > 0 ? (
        posts.map(post => <PostCard key={post.id} post={post} />)
      ) : (
        <div className="text-slate-500 italic">No posts yet. Be the first to write one!</div>
      )}
    </div>
  );
};

export default BookDetailsPage;