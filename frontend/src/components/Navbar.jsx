import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Movie Review</Link>
        <div className="space-x-4">
          <Link to="/movies">Movies</Link>
          <Link to="/reviews">Reviews</Link>
          {user && <Link to="/favorites">Favorites</Link>}
          {user && <Link to="/blog-posts">Blog Posts</Link>}
          {user && <Link to="/saved-blog-posts">Saved Posts</Link>}
          {user && <Link to="/blog-posts/create">Create Post</Link>}
          {!user && <Link to="/login">Login</Link>}
          {!user && <Link to="/register">Register</Link>}
          {user && (
            <button onClick={handleLogout} className="hover:underline">
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;