import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { storage } from '../services/storage';
import { Book } from '../types';
import { AuthContext } from '../App';
import { checkContentWithGemini } from '../services/geminiService';
import { Loader2, Wand2, Image as ImageIcon } from 'lucide-react';

const CreatePostPage: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id: editPostId } = useParams<{ id: string }>();

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedBookId, setSelectedBookId] = useState(searchParams.get('bookId') || '');
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  
  // Book Creation State (if book doesn't exist)
  const [isNewBook, setIsNewBook] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookCover, setNewBookCover] = useState<string | undefined>(undefined);

  // UI State
  const [books, setBooks] = useState<Book[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    setBooks(storage.getBooks());
    
    // Load existing post if editing
    if (editPostId) {
      const post = storage.getPost(editPostId);
      if (post && post.userId === user?.id) {
        setTitle(post.title);
        setContent(post.content);
        setSelectedBookId(post.bookId);
        setImageBase64(post.imageUrl);
      } else {
        navigate('/'); // Not allowed
      }
    }
  }, [editPostId, user, navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 2) { // 2MB limit
         alert("File too large. Max 2MB.");
         return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAIHelp = async (type: 'proofread' | 'expand') => {
    if (!content.trim()) return;
    setLoadingAI(true);
    const newContent = await checkContentWithGemini(content, type);
    setContent(newContent);
    setLoadingAI(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    let finalBookId = selectedBookId;

    // Handle new book creation
    if (isNewBook) {
      if (!newBookTitle || !newBookAuthor) {
        alert("Please fill in book details");
        return;
      }
      const newBook = {
        id: `b${Date.now()}`,
        title: newBookTitle,
        author: newBookAuthor,
        coverUrl: newBookCover,
      };
      storage.addBook(newBook);
      finalBookId = newBook.id;
    }

    if (!finalBookId) {
       alert("Please select a book.");
       return;
    }

    if (editPostId) {
      // Update
      const existing = storage.getPost(editPostId);
      if (existing) {
        storage.updatePost({
          ...existing,
          title,
          content,
          imageUrl: imageBase64
        });
        navigate(`/post/${existing.id}`);
      }
    } else {
      // Create
      const newId = `p${Date.now()}`;
      storage.addPost({
        id: newId,
        userId: user.id,
        bookId: finalBookId,
        title,
        content,
        imageUrl: imageBase64,
        likes: [],
        createdAt: Date.now()
      });
      navigate(`/post/${newId}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">{editPostId ? 'Edit Post' : 'Write a Review'}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Book Selection */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          {!editPostId && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Which book are you discussing?</label>
              {!isNewBook ? (
                <div className="flex gap-2">
                  <select 
                    value={selectedBookId} 
                    onChange={e => setSelectedBookId(e.target.value)}
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select a book...</option>
                    {books.map(b => <option key={b.id} value={b.id}>{b.title} by {b.author}</option>)}
                  </select>
                  <button 
                    type="button" 
                    onClick={() => setIsNewBook(true)}
                    className="px-4 py-2 text-sm bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200"
                  >
                    Add New
                  </button>
                </div>
              ) : (
                <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-bold">New Book Details</h4>
                    <button type="button" onClick={() => setIsNewBook(false)} className="text-xs text-red-600 hover:underline">Cancel</button>
                  </div>
                  <input type="text" placeholder="Book Title" className="w-full p-2 rounded border" value={newBookTitle} onChange={e => setNewBookTitle(e.target.value)} />
                  <input type="text" placeholder="Author Name" className="w-full p-2 rounded border" value={newBookAuthor} onChange={e => setNewBookAuthor(e.target.value)} />
                  <div>
                    <span className="text-xs text-slate-500 mb-1 block">Book Cover</span>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setNewBookCover)} className="text-sm" />
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="Give your review a catchy title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Post Image (Optional)</label>
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer flex items-center space-x-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 text-sm font-medium">
                  <ImageIcon size={18} />
                  <span>Upload Image</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, setImageBase64)} />
                </label>
                {imageBase64 && <span className="text-xs text-green-600 font-medium">Image selected</span>}
              </div>
              {imageBase64 && (
                <img src={imageBase64} alt="Preview" className="mt-2 h-32 w-auto object-cover rounded-md border border-slate-200" />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Essay Content</label>
              <textarea 
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={10}
                className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-y"
                placeholder="Write your thoughts..."
                required
              />
              
              {/* AI Tools */}
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide flex items-center gap-1">
                  <Wand2 size={12} /> AI Tools
                </span>
                <button 
                  type="button" 
                  onClick={() => handleAIHelp('proofread')}
                  disabled={loadingAI || !content}
                  className="px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 disabled:opacity-50"
                >
                  {loadingAI ? <Loader2 size={12} className="animate-spin" /> : 'Fix Grammar'}
                </button>
                <button 
                  type="button" 
                  onClick={() => handleAIHelp('expand')}
                  disabled={loadingAI || !content}
                  className="px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 disabled:opacity-50"
                >
                  {loadingAI ? <Loader2 size={12} className="animate-spin" /> : 'Expand Idea'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            className="px-6 py-2 text-slate-600 font-medium hover:text-slate-900"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md transition-transform active:scale-95"
          >
            {editPostId ? 'Save Changes' : 'Publish Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePostPage;