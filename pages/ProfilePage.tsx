import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { storage } from '../services/storage';
import { User, Post } from '../types';
import { AuthContext } from '../App';
import PostCard from '../components/PostCard';
import { Settings, Camera } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, refreshUser } = useContext(AuthContext);
  
  const [profileUser, setProfileUser] = useState<User | undefined>(undefined);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit State
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (id) {
      const u = storage.getUser(id);
      setProfileUser(u);
      if (u) {
        setPosts(storage.getPosts().filter(p => p.userId === u.id));
        setEditName(u.name);
        setEditBio(u.bio || '');
        setEditAvatar(u.avatarUrl);
      }
    }
  }, [id, currentUser]); // Refetch if current user changes (for follow status updates generally)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileUser) return;
    
    const updated = {
      ...profileUser,
      name: editName,
      bio: editBio,
      avatarUrl: editAvatar
    };
    
    storage.updateUser(updated);
    setProfileUser(updated);
    setIsEditing(false);
    refreshUser();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFollow = () => {
    if (currentUser && profileUser) {
      storage.toggleFollowUser(currentUser.id, profileUser.id);
      refreshUser();
    }
  };

  if (!profileUser) return <div className="p-8">User not found</div>;

  const isMe = currentUser?.id === profileUser.id;
  const isFollowing = currentUser?.followedUserIds.includes(profileUser.id);

  return (
    <div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-8">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
        <div className="px-8 pb-8 relative">
          <div className="flex justify-between items-end -mt-12 mb-6">
            <div className="relative">
               <img 
                 src={isEditing ? (editAvatar || 'https://picsum.photos/150') : (profileUser.avatarUrl || 'https://picsum.photos/150')} 
                 alt={profileUser.name} 
                 className="w-32 h-32 rounded-full border-4 border-white object-cover bg-white"
               />
               {isEditing && (
                 <label className="absolute bottom-0 right-0 bg-slate-800 text-white p-2 rounded-full cursor-pointer hover:bg-slate-700">
                   <Camera size={16} />
                   <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                 </label>
               )}
            </div>
            
            <div className="mb-2">
              {isMe ? (
                !isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 font-medium">
                    <Settings size={18} />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-500 hover:text-slate-800">Cancel</button>
                    <button onClick={handleSaveProfile} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Save</button>
                  </div>
                )
              ) : (
                currentUser && (
                  <button 
                    onClick={handleFollow}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${isFollowing ? 'bg-slate-100 text-slate-700 border border-slate-300' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                )
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4 max-w-md">
              <input 
                type="text" 
                value={editName} 
                onChange={e => setEditName(e.target.value)}
                className="w-full text-2xl font-bold border-b border-slate-300 focus:border-indigo-500 outline-none pb-1"
                placeholder="Your Name"
              />
              <textarea 
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{profileUser.name}</h1>
              <p className="text-slate-500 mb-4">{profileUser.email}</p>
              <p className="text-slate-700 max-w-lg">{profileUser.bio || "No bio yet."}</p>
              
              <div className="flex gap-6 mt-4 text-sm font-medium text-slate-600">
                <span>{profileUser.followedUserIds.length} Following</span>
                <span>{posts.length} Posts</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Posts</h2>
      <div className="space-y-6">
        {posts.map(post => <PostCard key={post.id} post={post} showAuthor={false} />)}
        {posts.length === 0 && <div className="text-slate-500">No posts yet.</div>}
      </div>
    </div>
  );
};

export default ProfilePage;