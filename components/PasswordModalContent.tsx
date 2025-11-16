import React, { useState } from 'react';

const CORRECT_PASSWORD = 'AnmarAdmin2024'; // Simple hardcoded password

interface PasswordModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

const PasswordModalContent: React.FC<PasswordModalProps> = ({ onSuccess, onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setError('');
      onSuccess();
    } else {
      setError('كلمة المرور غير صحيحة. حاول مرة أخرى.');
      setPassword('');
      setShake(true);
      setTimeout(() => setShake(false), 500); // Animation duration
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${shake ? 'animate-shake' : ''}`}>
        <style>{`
            @keyframes shake {
                10%, 90% { transform: translateX(-1px); }
                20%, 80% { transform: translateX(2px); }
                30%, 50%, 70% { transform: translateX(-4px); }
                40%, 60% { transform: translateX(4px); }
            }
            .animate-shake {
                animation: shake 0.5s ease-in-out;
            }
        `}</style>
      <div>
        <label htmlFor="password-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 text-center">
          الرجاء إدخال كلمة المرور للمتابعة
        </label>
        <input
          type="password"
          id="password-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`w-full p-3 border rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent text-center tracking-widest transition ${
            error 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500'
          }`}
          autoFocus
        />
        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
      </div>
      <div className="flex justify-center sm:justify-end gap-4 pt-2">
        <button type="button" onClick={onClose} className="px-6 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white transition-colors">
          إلغاء
        </button>
        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg shadow-blue-500/30 dark:shadow-blue-500/50">
          دخول
        </button>
      </div>
    </form>
  );
};

export default PasswordModalContent;