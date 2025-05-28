import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import WatchList from './pages/WatchList';
import Blogs from './pages/Blogs';
import BlogCreate from './components/BlogCreate';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import MovieDetails from './pages/MovieDetails';
import Reviews from './pages/Reviews';
import CategoryMovies from './pages/CategoryMovies';
import BlogDetails from './pages/BlogDetails';
import Search from './pages/Search'

function App() {
  return (
    <div div className="bg-[#1A1C29] min-h-screen">
      <Header />
        <Routes>
  
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/watchlist" element={<WatchList />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/create" element={<BlogCreate />} />
          <Route path="/blogs/:id" element={<BlogDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/movies/:id" element={<MovieDetails />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/category/:categoryId" element={<CategoryMovies />} />
        </Routes>
    
    </div>
  );
}

export default App;