import React, { useState } from 'react';

const CORRECT_PASSWORD = '1234'; // Simple hardcoded password

interface PasswordModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

const PasswordModalContent: React.FC<PasswordModalProps> = ({ onSuccess, onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setError('');
      onSuccess();
    } else {
      setError('كلمة المرور غير صحيحة. حاول مرة أخرى.');
      setPassword('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          الرجاء إدخال كلمة المرور للمتابعة
        </label>
        <input
          type="password"
          id="password-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center tracking-widest"
          autoFocus
        />
        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500 transition-colors">
          إلغاء
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          دخول
        </button>
      </div>
    </form>
  );
};

export default PasswordModalContent;