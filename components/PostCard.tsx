import React from 'react';
import { Link } from 'react-router-dom';
import { Post, User, Book } from '../types';
import { storage } from '../services/storage';
import { MessageSquare, Heart } from 'lucide-react';

interface PostCardProps {
  post: Post;
  showAuthor?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, showAuthor = true }) => {
  const author = storage.getUser(post.userId);
  const book = storage.getBook(post.bookId);
  const commentsCount = storage.getComments(post.id).length;

  if (!book) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow mb-6">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {showAuthor && author && (
              <div className="flex items-center space-x-2 mb-3">
                <Link to={`/user/${author.id}`}>
                   <img 
                     src={author.avatarUrl || 'https://picsum.photos/50'} 
                     alt={author.name} 
                     className="w-8 h-8 rounded-full object-cover"
                   />
                </Link>
                <div className="text-sm">
                  <Link to={`/user/${author.id}`} className="font-medium text-slate-900 hover:underline">
                    {author.name}
                  </Link>
                  <span className="text-slate-400 mx-1">on</span>
                  <Link to={`/book/${book.id}`} className="font-medium text-indigo-600 hover:underline">
                    {book.title}
                  </Link>
                </div>
              </div>
            )}
            
            <Link to={`/post/${post.id}`} className="block group">
              <h2 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                {post.title}
              </h2>
              <p className="text-slate-600 line-clamp-3 leading-relaxed">
                {post.content}
              </p>
            </Link>
          </div>
          
          {post.imageUrl && (
            <Link to={`/post/${post.id}`} className="ml-4 shrink-0">
              <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg bg-slate-100"
              />
            </Link>
          )}
        </div>

        <div className="mt-4 flex items-center space-x-6 text-sm text-slate-500">
           <span className="flex items-center space-x-1">
             <Heart size={16} className={post.likes.length > 0 ? "fill-red-500 text-red-500" : ""} />
             <span>{post.likes.length}</span>
           </span>
           <span className="flex items-center space-x-1">
             <MessageSquare size={16} />
             <span>{commentsCount}</span>
           </span>
           <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;