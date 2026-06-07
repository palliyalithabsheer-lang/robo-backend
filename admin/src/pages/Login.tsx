import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import './Login.css';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@tutorrobot.ai');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🤖</div>
          <h1>Tutor Robot Admin</h1>
          <p>Sign in to manage your platform</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}
          
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" disabled={isSubmitting} className="btn-login">
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="login-hints">
          <p>Demo Credentials:</p>
          <code>admin@tutorrobot.ai / password</code>
        </div>
      </div>
    </div>
  );
};

export default Login;
