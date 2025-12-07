import React, { useContext, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import { BookOpen, Search, User as UserIcon, LogOut, PlusSquare, Menu, X } from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const active = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <Icon size={20} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
        <div className="p-6 border-b border-slate-100">
          <Link to="/" className="flex items-center space-x-2 text-indigo-600">
            <BookOpen size={28} />
            <span className="text-xl font-bold tracking-tight">BiblioShare</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem to="/" icon={BookOpen} label="Home" />
          <NavItem to="/explore" icon={Search} label="Explore" />
          
          {user && (
            <>
              <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Me
              </div>
              <NavItem to="/create" icon={PlusSquare} label="New Post" />
              <NavItem to={`/user/${user.id}`} icon={UserIcon} label="Profile" />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-100">
          {user ? (
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 w-full text-slate-600 hover:text-red-600 transition-colors"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          ) : (
            <Link 
              to="/login" 
              className="block w-full py-2 px-4 bg-indigo-600 text-white text-center rounded-lg hover:bg-indigo-700 font-medium"
            >
              Log In
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-50">
        <Link to="/" className="flex items-center space-x-2 text-indigo-600">
          <BookOpen size={24} />
          <span className="text-lg font-bold">BiblioShare</span>
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-white z-40 p-4 space-y-2">
           <NavItem to="/" icon={BookOpen} label="Home" />
           <NavItem to="/explore" icon={Search} label="Explore" />
           {user ? (
             <>
               <NavItem to="/create" icon={PlusSquare} label="New Post" />
               <NavItem to={`/user/${user.id}`} icon={UserIcon} label="Profile" />
               <button onClick={handleLogout} className="flex w-full items-center space-x-2 px-4 py-3 text-red-600">
                 <LogOut size={20} />
                 <span>Sign Out</span>
               </button>
             </>
           ) : (
             <Link to="/login" className="block w-full text-center bg-indigo-600 text-white py-3 rounded-lg mt-4" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
           )}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;