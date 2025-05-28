import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (form) => {
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return <AuthForm isRegister={false} onSubmit={handleLogin} />;
}

export default Login;