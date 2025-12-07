import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { Book } from '../types';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

const ExplorePage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setBooks(storage.getBooks());
  }, []);

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Explore Books</h1>
      
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search by title or author..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {filteredBooks.map(book => (
          <Link key={book.id} to={`/book/${book.id}`} className="group">
            <div className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-slate-200 mb-3 shadow-sm group-hover:shadow-md transition-all">
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">No Cover</div>
              )}
            </div>
            <h3 className="font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{book.title}</h3>
            <p className="text-sm text-slate-500">{book.author}</p>
          </Link>
        ))}
      </div>
      
      {filteredBooks.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No books found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default ExplorePage;