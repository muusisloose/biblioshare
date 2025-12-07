import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';
import { Post, User, Book, Comment } from '../types';
import { AuthContext } from '../App';
import { Heart, MessageSquare, Trash2, Edit2, Reply } from 'lucide-react';

const PostDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [post, setPost] = useState<Post | undefined>(undefined);
  const [author, setAuthor] = useState<User | undefined>(undefined);
  const [book, setBook] = useState<Book | undefined>(undefined);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null); // Comment ID to reply to

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = () => {
    if (!id) return;
    const p = storage.getPost(id);
    if (p) {
      setPost(p);
      setAuthor(storage.getUser(p.userId));
      setBook(storage.getBook(p.bookId));
      setComments(storage.getComments(p.id));
    }
  };

  const handleLike = () => {
    if (!user || !post) return;
    storage.toggleLikePost(user.id, post.id);
    loadData();
  };

  const handleToggleFollowAuthor = () => {
    if (!user || !author) return;
    storage.toggleFollowUser(user.id, author.id);
    refreshUser();
  };

  const handleSubmitComment = (parentId?: string) => {
    if (!user || !post || !newComment.trim()) return;
    
    storage.addComment({
      id: `c${Date.now()}`,
      postId: post.id,
      userId: user.id,
      content: newComment,
      parentId,
      createdAt: Date.now()
    });
    
    setNewComment('');
    setReplyTo(null);
    loadData();
  };

  const handleDeletePost = () => {
    if (window.confirm("Are you sure?")) {
      // In a real app we'd delete via service
      // storage.deletePost(post.id); 
      navigate('/');
    }
  };

  if (!post || !author || !book) return <div className="p-8">Loading...</div>;

  const isLiked = user ? post.likes.includes(user.id) : false;
  const isFollowingAuthor = user ? user.followedUserIds.includes(author.id) : false;
  const isOwner = user?.id === post.userId;

  // Organize comments (1 level deep)
  const rootComments = comments.filter(c => !c.parentId);
  const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId);

  return (
    <div className="animate-fade-in">
      <Link to={`/book/${book.id}`} className="text-sm font-medium text-indigo-600 hover:underline mb-4 block">
        &larr; Back to {book.title}
      </Link>

      <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-8">
        {post.imageUrl && (
          <img src={post.imageUrl} alt={post.title} className="w-full h-64 md:h-96 object-cover bg-slate-100" />
        )}
        
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">{post.title}</h1>
            {isOwner && (
               <div className="flex space-x-2">
                 <Link to={`/edit/${post.id}`} className="p-2 text-slate-400 hover:text-indigo-600">
                   <Edit2 size={20} />
                 </Link>
               </div>
            )}
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
            <div className="flex items-center space-x-3">
              <Link to={`/user/${author.id}`}>
                <img src={author.avatarUrl || 'https://picsum.photos/50'} alt={author.name} className="w-10 h-10 rounded-full object-cover" />
              </Link>
              <div>
                <div className="flex items-center space-x-2">
                  <Link to={`/user/${author.id}`} className="font-semibold text-slate-900">{author.name}</Link>
                  {user && !isOwner && (
                    <button 
                      onClick={handleToggleFollowAuthor}
                      className="text-xs font-medium text-indigo-600 hover:underline"
                    >
                      {isFollowingAuthor ? 'Unfollow' : 'Follow'}
                    </button>
                  )}
                </div>
                <div className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            
            <button 
              onClick={handleLike}
              disabled={!user}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all ${isLiked ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              <Heart size={18} className={isLiked ? "fill-red-600" : ""} />
              <span>{post.likes.length}</span>
            </button>
          </div>

          <div className="prose prose-slate max-w-none prose-lg text-slate-800">
            {post.content.split('\n').map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <div className="max-w-3xl mx-auto">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <MessageSquare size={20} /> Comments ({comments.length})
        </h3>

        {user ? (
          <div className="bg-white p-6 rounded-xl border border-slate-200 mb-8 shadow-sm">
             <textarea 
               className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none resize-none"
               rows={3}
               placeholder="Share your thoughts..."
               value={!replyTo ? newComment : ''}
               onChange={(e) => !replyTo && setNewComment(e.target.value)}
               disabled={!!replyTo}
             />
             <div className="mt-2 flex justify-end">
               <button 
                 onClick={() => handleSubmitComment()}
                 disabled={!!replyTo || !newComment.trim()}
                 className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 Post Comment
               </button>
             </div>
          </div>
        ) : (
          <div className="bg-slate-50 p-6 rounded-xl text-center mb-8 border border-slate-200">
            <Link to="/login" className="text-indigo-600 font-bold hover:underline">Log in</Link> to join the conversation.
          </div>
        )}

        <div className="space-y-6">
          {rootComments.map(comment => {
             const commentAuthor = storage.getUser(comment.userId);
             const replies = getReplies(comment.id);
             return (
               <div key={comment.id} className="group">
                  <div className="flex space-x-3">
                    <img src={commentAuthor?.avatarUrl || 'https://picsum.photos/40'} className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <div className="bg-white p-4 rounded-xl rounded-tl-none border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-sm">{commentAuthor?.name}</span>
                          <span className="text-xs text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-700 text-sm">{comment.content}</p>
                      </div>
                      <div className="mt-1 ml-2">
                        {user && (
                          <button 
                            onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                            className="text-xs text-slate-500 hover:text-indigo-600 font-medium"
                          >
                            Reply
                          </button>
                        )}
                      </div>
                      
                      {/* Reply Form */}
                      {replyTo === comment.id && (
                        <div className="mt-3 ml-4 animate-fade-in">
                          <textarea 
                            autoFocus
                            className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none"
                            placeholder={`Replying to ${commentAuthor?.name}...`}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => setReplyTo(null)} className="text-xs text-slate-500 px-3 py-1">Cancel</button>
                            <button onClick={() => handleSubmitComment(comment.id)} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-md">Reply</button>
                          </div>
                        </div>
                      )}

                      {/* Nested Replies */}
                      {replies.length > 0 && (
                        <div className="mt-4 space-y-4 pl-4 border-l-2 border-slate-100">
                          {replies.map(reply => {
                            const replyAuthor = storage.getUser(reply.userId);
                            return (
                              <div key={reply.id} className="flex space-x-3">
                                <img src={replyAuthor?.avatarUrl || 'https://picsum.photos/30'} className="w-6 h-6 rounded-full" />
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex-1">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-xs">{replyAuthor?.name}</span>
                                  </div>
                                  <p className="text-slate-600 text-xs">{reply.content}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
               </div>
             );
          })}
        </div>
      </div>
    </div>
  );
};

export default PostDetailsPage;