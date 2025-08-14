import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useStudents, Student } from '../context/StudentContext';
import Modal from './Modal';
import AnimatedButton from './AnimatedButton';
import { User, Phone, Hash, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { students, setStudents } = useStudents();
  const [fullName, setFullName] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const studentData = students.find(s => s.id === user.id);
      if (studentData) {
        setFullName(studentData.name || '');
        setBatchNumber(studentData.batchId || '');
        setPhoneNumber(studentData.mobile || '');
        setPhotoPreview(studentData.photo || null);
      }
    }
  }, [user, students]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(user.id);

      const updatedStudent: Partial<Student> = {
        name: fullName,
        batchId: batchNumber,
        mobile: phoneNumber,
        photo: photoPreview || '',
        qrCode: qrCodeDataUrl,
        profileComplete: true,
      };

      setStudents(prevStudents =>
        prevStudents.map(s =>
          s.id === user.id ? { ...s, ...updatedStudent } : s
        )
      );

      toast.success('Profile updated successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to update profile.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Your Profile" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-16 h-16 text-gray-400" />
            )}
          </div>
          <input
            type="file"
            id="photo-upload"
            className="hidden"
            accept="image/*"
            onChange={handlePhotoChange}
          />
          <label
            htmlFor="photo-upload"
            className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition"
          >
            Upload Photo
          </label>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="full-name">
            <User className="w-4 h-4 inline mr-2" />
            Full Name
          </label>
          <input
            type="text"
            id="full-name"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="batch-number">
            <Hash className="w-4 h-4 inline mr-2" />
            Batch Number
          </label>
          <input
            type="text"
            id="batch-number"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="phone-number">
            <Phone className="w-4 h-4 inline mr-2" />
            Phone Number
          </label>
          <input
            type="tel"
            id="phone-number"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end">
          <AnimatedButton
            type="submit"
            label="Save Profile"
            isLoading={isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-6"
          />
        </div>
      </form>
    </Modal>
  );
};

export default StudentProfileModal;