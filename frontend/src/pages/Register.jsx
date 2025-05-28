import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (form) => {
    try {
      await register(form.email, form.password, form.username);
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return <AuthForm isRegister onSubmit={handleRegister} />;
}

export default Register;