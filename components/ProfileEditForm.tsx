
import React, { useState } from 'react';
import { StudentData } from '../types';
import { UploadIcon } from './icons';

interface ProfileEditFormProps {
  student: Pick<StudentData, 'name' | 'bio' | 'profileImageUrl'>;
  onSave: (updatedData: { name: string; bio: string; }, newImageFile: File | null) => void;
  onClose: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ student, onSave, onClose }) => {
  const [name, setName] = useState(student.name);
  const [bio, setBio] = useState(student.bio);
  const [imagePreview, setImagePreview] = useState<string>(student.profileImageUrl);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, bio }, imageFile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        <img src={imagePreview} alt="Profile Preview" className="w-36 h-36 rounded-full object-cover border-4 border-slate-200 dark:border-slate-600" />
        <label htmlFor="profile-image-upload" className="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
            <UploadIcon className="w-4 h-4" />
            تغيير الصورة
        </label>
        <input 
            id="profile-image-upload" 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange}
            className="hidden"
        />
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الاسم الكامل</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">نبذة تعريفية قصيرة</label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500 transition-colors">إلغاء</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">حفظ التغييرات</button>
      </div>
    </form>
  );
};

export default ProfileEditForm;
