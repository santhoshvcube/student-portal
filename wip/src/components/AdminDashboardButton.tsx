import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import AnimatedButton from './AnimatedButton';

interface AdminDashboardButtonProps {
  className?: string;
}

const AdminDashboardButton: React.FC<AdminDashboardButtonProps> = ({ className = '' }) => {
  const navigate = useNavigate();

  return (
    <div className={`absolute top-4 right-4 z-10 ${className}`}>
      <AnimatedButton
        onClick={() => navigate('/dashboard-admin')}
        label="Go to Admin Dashboard"
        icon={LayoutDashboard}
        className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 text-sm font-semibold rounded-lg shadow-md"
      />
    </div>
  );
};

export default AdminDashboardButton;