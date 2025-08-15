import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Student } from '../context/StudentContext';

interface User {
  id: string;
  role: 'admin' | 'student';
  name: string;
  profileComplete?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  loading: boolean;
  login: (identifier: string, credential: string, role: 'admin' | 'student') => Promise<User | null>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('vcube_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('AuthContext: Failed to parse user from localStorage', e);
        localStorage.removeItem('vcube_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (identifier: string, credential: string, role: 'admin' | 'student'): Promise<User | null> => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3003/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, credential, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Login failed');
        return null;
      }

      const newUser: User = await response.json();
      setUser(newUser);
      localStorage.setItem('vcube_user', JSON.stringify(newUser));
      toast.success(`Welcome, ${newUser.name}!`);
      
      return newUser;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vcube_user');
    toast.success("Logged out successfully!");
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isAdmin, isStudent, loading, login, logout }}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
