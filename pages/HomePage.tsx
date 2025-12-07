import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../App';
import { storage } from '../services/storage';
import { Post } from '../types';
import PostCard from '../components/PostCard';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedType, setFeedType] = useState<'following' | 'all'>('all');

  useEffect(() => {
    const allPosts = storage.getPosts();
    if (user && feedType === 'following') {
      const filtered = allPosts.filter(p => 
        user.followedUserIds.includes(p.userId) || 
        user.followedBookIds.includes(p.bookId) ||
        p.userId === user.id
      );
      setPosts(filtered);
    } else {
      setPosts(allPosts);
    }
  }, [user, feedType]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {user ? (feedType === 'following' ? 'Your Feed' : 'Community Activity') : 'Explore Ideas'}
          </h1>
          <p className="text-slate-500 mt-1">Discover what people are reading and thinking.</p>
        </div>
        
        {user && (
          <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
            <button 
              onClick={() => setFeedType('all')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${feedType === 'all' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFeedType('following')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${feedType === 'following' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Following
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {posts.length > 0 ? (
          posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <h3 className="text-lg font-medium text-slate-900">No posts found</h3>
            <p className="text-slate-500 mb-4">It looks a bit empty here.</p>
            {user && feedType === 'following' && (
               <Link to="/explore" className="text-indigo-600 font-medium hover:underline">Find people or books to follow</Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;