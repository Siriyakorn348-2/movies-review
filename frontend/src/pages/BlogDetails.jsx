import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import EditBlogPostForm from '../components/EditBlogPostForm';
import ImageModal from '../components/ImageModal';
import BlogPostHeader from './blogDetailPost/BlogPostHeader';
import BlogPostContent from './blogDetailPost/BlogPostContent';
import BlogPostImages from './blogDetailPost/BlogPostImages';
import BlogPostTags from './blogDetailPost/BlogPostTags';
import BlogPostCommentSection from './blogDetailPost/BlogPostCommentSection';

function BlogDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [blogPost, setBlogPost] = useState(null);
  const [commentForm, setCommentForm] = useState('');
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAllImages, setShowAllImages] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [isSaveLoading, setIsSaveLoading] = useState(true);

  const fetchPost = async () => {
    try {
      const postId = Number(id); 
      if (isNaN(postId)) {
        throw new Error('รหัสโพสต์ไม่ถูกต้อง');
      }
      console.log('Fetching post with ID:', postId);
      const response = await axios.get(`http://localhost:3000/api/blog-posts/${postId}`, {
        headers: user ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {},
      });
      console.log('Fetched blog post:', response.data);
      setBlogPost(response.data);
      setError(null);

      if (user) {
        setIsSaveLoading(true);
        const savedResponse = await axios.get('http://localhost:3000/api/saved-blog-posts', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        console.log('Fetched saved posts:', savedResponse.data);
        const savedPostIds = savedResponse.data.map((savedPost) => savedPost.blogPostId);
        console.log('Saved post IDs:', savedPostIds, 'Current post ID:', postId);
        setIsSaved(savedPostIds.includes(postId));
        setIsSaveLoading(false);
      } else {
        setIsSaveLoading(false);
      }
    } catch (error) {
      console.error('Error fetching post:', error.response?.status, error.message);
      setError(
        error.response?.status === 404
          ? 'ไม่พบโพสต์ที่ต้องการ อาจถูกลบหรือไม่มีอยู่'
          : error.message || 'ไม่สามารถโหลดโพสต์ได้ กรุณาลองใหม่'
      );
      setIsSaveLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleSaveBlog = async () => {
  if (!user) {
    setError('กรุณาเข้าสู่ระบบเพื่อบันทึกโพสต์');
    return;
  }
  try {
    setSaveMessage(null);
    setIsSaveLoading(true);
    const postId = Number(id);
    if (isNaN(postId)) {
      throw new Error('รหัสโพสต์ไม่ถูกต้อง');
    }
    console.log('Sending request with postId:', postId);
    if (isSaved) {
      const response = await axios.delete(`http://localhost:3000/api/saved-blog-posts/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      console.log('ยกเลิกการบันทึกสำเร็จ:', response.data);
      setIsSaved(false);
      setSaveMessage('ยกเลิกบันทึกโพสต์สำเร็จ');
    } else {
      let attempts = 0;
      const maxAttempts = 3;
      while (attempts < maxAttempts) {
        try {
          const response = await axios.post(
            'http://localhost:3000/api/saved-blog-posts',
            { blogPostId: postId },
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );
          console.log('บันทึกโพสต์สำเร็จ:', response.data);
          setIsSaved(true);
          setSaveMessage('บันทึกโพสต์สำเร็จ');
          break;
        } catch (err) {
          attempts++;
          console.warn(`พยายามครั้งที่ ${attempts} ล้มเหลว:`, err.response?.data || err);
          if (err.response?.data?.error === 'โพสต์นี้ถูกบันทึกแล้ว') {
            setIsSaved(true);
            setSaveMessage('โพสต์นี้ถูกบันทึกแล้ว');
            break;
          }
          if (attempts === maxAttempts || err.response?.status !== 404) {
            throw err;
          }
        }
      }
    }
    await fetchPost();
  } catch (error) {
    console.error('ข้อผิดพลาดในการบันทึกโพสต์:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    setError(
      error.response?.data?.error || 'ไม่สามารถบันทึก/ยกเลิกบันทึกได้ กรุณาลองใหม่'
    );
  } finally {
    setIsSaveLoading(false);
  }
};

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('กรุณาเข้าสู่ระบบเพื่อแสดงความคิดเห็น');
      return;
    }
    try {
      await axios.post(
        'http://localhost:3000/api/comments',
        {
          commentableId: Number(id),
          commentableType: 'BlogPost',
          content: commentForm,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setCommentForm('');
      await fetchPost();
      setError(null);
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError('ไม่สามารถแสดงความคิดเห็นได้');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์นี้?')) return;
    try {
      await axios.delete(`http://localhost:3000/api/blog-posts/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      navigate('/blogs');
    } catch (error) {
      console.error('Error deleting blog post:', error);
      setError('ไม่สามารถลบโพสต์ได้');
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setIsMenuOpen(false);
  };

 const handleEditSubmit = async (updatedPost) => {
  try {
    console.log('Updating post with data:', updatedPost); 
    const response = await axios.put(
      `http://localhost:3000/api/blog-posts/${id}`,
      updatedPost,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Update response:', response.data); 
    setBlogPost(response.data);
    setIsEditing(false);
    setError(null);
  } catch (error) {
    console.error('Error updating blog post:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    setError(error.response?.data?.error || 'ไม่สามารถแก้ไขโพสต์ได้ กรุณาลองใหม่');
  }
};

  const handleCommentDelete = () => {
    fetchPost();
  };

  const handleOpenImage = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowAllImages(false);
  };

  const handleOpenAllImages = () => {
    setSelectedImage(blogPost?.images[0]?.imageUrl);
    setShowAllImages(true);
  };

  const handleCloseImageModal = () => {
    setSelectedImage(null);
    setShowAllImages(false);
  };

  if (error) return <div className="text-red-600 text-center py-10">{error}</div>;
  if (!blogPost) return <div className="text-gray-400 text-center py-10">กำลังโหลด...</div>;

  return (
    <div className="max-w-5xl mx-auto bg-black p-8 rounded-xl shadow-2xl font-['Helvetica Neue', 'Sarabun'] text-white mt-10 mb-6">
      {user && !user.img && (
        <div className="text-yellow-500 text-center mb-4">
          <Link to="/edit-profile" className="underline">
            อัปโหลดรูปโปรไฟล์
          </Link>{' '}
          เพื่อปรับปรุงประสบการณ์
        </div>
      )}
      <ImageModal
        images={showAllImages ? blogPost.images : null}
        initialImageUrl={selectedImage}
        isOpen={!!selectedImage}
        onClose={handleCloseImageModal}
      />
      {isEditing ? (
        <EditBlogPostForm
          blogPost={blogPost}
          onSubmit={handleEditSubmit}
          onCancel={handleEditToggle}
        />
      ) : (
        <>
          <BlogPostHeader
            blogPost={blogPost}
            user={user}
            isSaved={isSaved}
            saveMessage={saveMessage}
            error={error}
            isMenuOpen={isMenuOpen}
            onSaveBlog={handleSaveBlog}
            onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
            onEditToggle={handleEditToggle}
            onDelete={handleDelete}
            isSaveLoading={isSaveLoading}
          />
          <BlogPostContent content={blogPost.content} />
          <BlogPostImages
            images={blogPost.images}
            onOpenImage={handleOpenImage}
            onOpenAllImages={handleOpenAllImages}
          />
          <BlogPostTags tags={blogPost.tags} />
          <BlogPostCommentSection
            user={user}
            comments={blogPost.comments || []}
            commentForm={commentForm}
            onCommentChange={(e) => setCommentForm(e.target.value)}
            onCommentSubmit={handleCommentSubmit}
            onCommentDelete={handleCommentDelete}
          />
        </>
      )}
    </div>
  );
}

export default BlogDetails;