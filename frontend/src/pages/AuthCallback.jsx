import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.jsx';

const AuthCallback = () => {
  const navigate  = useNavigate();
  const { setUserAndToken } = useAuth();

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const hash   = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);

      const access_token  = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (!access_token) {
        toast.error('Google login failed — no token received');
        navigate('/login');
        return;
      }

      const { data } = await api.post('/auth/google/callback', {
        access_token,
        refresh_token,
      });

      localStorage.setItem('hh-token', data.token);
      setUserAndToken(data.user);
      toast.success(`Welcome, ${data.user.name}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      toast.error('Google login failed');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: 'var(--bg)' }}>
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center">
        <Flame size={26} className="text-brand-950" />
      </motion.div>
      <p className="font-syne font-bold text-lg" style={{ color: 'var(--text)' }}>
        Signing you in with Google...
      </p>
    </div>
  );
};

export default AuthCallback;