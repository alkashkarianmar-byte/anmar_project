
import React, { useState, useEffect, useCallback } from 'react';
import { AchievementSection, StudentData, TeacherComment, UploadedFile, SectionId, Skill, Subject } from './types';
import { GoalIcon, PlanIcon, ProgressIcon, LearnIcon, PresentIcon, SunIcon, MoonIcon, EditIcon, UploadIcon, ImageFileIcon, DocumentFileIcon, SendIcon, GameIcon, SparklesIcon, TimelineIcon, PlusIcon, SkillsIcon, LockIcon, UnlockIcon, TrashIcon, LoginIcon, BookIcon } from './components/icons';
import Modal from './components/Modal';
import AchievementGame from './components/AchievementGame';
import ProfileEditForm from './components/ProfileEditForm';
import PasswordModalContent from './components/PasswordModalContent';
import { GoogleGenAI } from "@google/genai";
import AnimatedHeader from './components/AnimatedHeader';

const initialData: StudentData = {
  name: 'أنمار أحمد الكاشقري',
  grade: 'الصف الأول المتوسط',
  date: '١٢ مارس ٢٠١٤',
  school: 'مدارس الأندلس الأهلية',
  location: 'جدة، المملكة العربية السعودية',
  profileImageUrl: 'https://picsum.photos/id/1062/150/150',
  bio: 'أسعى دائمًا للتعلم والتطور، وأتمنى أن يكون هذا الموقع مصدر إلهام للجميع.',
  achievements: [
    { id: 'initial-goals', type: 'goals', title: 'تحديد الأهداف', content: 'هدفي هذا العام هو تحسين مهاراتي في الرياضيات واللغة الإنجليزية، والمشاركة في مسابقة العلوم المدرسية.', file: undefined, comments: [], lastUpdated: new Date('2014-09-05T10:00:00Z').toISOString() },
    { id: 'initial-planning', type: 'planning', title: 'تخطيط العمل', content: 'قمت بإنشاء جدول زمني أسبوعي يتضمن ساعات محددة للمذاكرة، وحل الواجبات، والتحضير لمسابقة العلوم.', file: undefined, comments: [], lastUpdated: new Date('2014-09-15T11:30:00Z').toISOString() },
    { id: 'initial-progress', type: 'progress', title: 'تتبع التقدم', content: 'أقوم بمراجعة تقدمي كل أسبوع. لقد لاحظت تحسنًا في درجاتي في الاختبارات القصيرة للرياضيات.', file: undefined, comments: [], lastUpdated: new Date('2014-10-01T15:00:00Z').toISOString() },
    { id: 'initial-learning', type: 'learning', title: 'التعلم من التجارب', content: 'واجهت صعوبة في فهم بعض المفاهيم الهندسية، ولكن بعد طلب المساعدة من المعلم واستخدام مصادر تعليمية عبر الإنترنت، تمكنت من فهمها بشكل أفضل.', file: undefined, comments: [], lastUpdated: new Date('2014-10-20T16:45:00Z').toISOString() },
    { id: 'initial-presentation', type: 'presentation', title: 'عرض الإنجازات', content: 'حصلت على المركز الثاني في مسابقة العلوم المدرسية عن مشروعي حول الطاقة المتجددة.', file: {name: 'شهادة تقدير.jpg', url: 'https://picsum.photos/id/239/400/300', type: 'image/jpeg'}, comments: [
      { id: '1', teacherName: 'أ. محمد', comment: 'عمل رائع يا أنمار! مشروعك كان مميزًا جدًا.', timestamp: new Date('2014-11-05T09:00:00Z').toISOString() }
    ], lastUpdated: new Date('2014-11-05T09:00:00Z').toISOString()},
  ],
  skills: [],
  subjects: [
      { id: 'subject-1', name: 'الرياضيات', reason: 'أحب حل المسائل الصعبة واكتشاف الأنماط في الأرقام والأشكال.' },
      { id: 'subject-2', name: 'العلوم', reason: 'أستمتع بإجراء التجارب في المختبر وتعلم كيف يعمل العالم من حولنا.' },
      { id: 'subject-3', name: 'اللغة الإنجليزية', reason: 'أحب تعلم كلمات جديدة والتحدث مع أشخاص من ثقافات مختلفة.' },
  ]
};

const sectionTypeTitles: { [key in SectionId]: string } = {
  goals: 'تحديد الأهداف',
  planning: 'تخطيط العمل',
  progress: 'تتبع التقدم',
  learning: 'التعلم من التجارب',
  presentation: 'عرض الإنجازات',
};

const localStorageKey = 'studentPortfolioData';

const loadStudentData = (): StudentData => {
    try {
        const savedDataString = window.localStorage.getItem(localStorageKey);
        if (savedDataString) {
            const savedData = JSON.parse(savedDataString);
            
            // Merge with initialData to gracefully handle schema changes over time.
            const mergedData = {
                ...initialData,
                ...savedData,
                achievements: savedData.achievements || initialData.achievements,
                skills: savedData.skills || initialData.skills,
                subjects: savedData.subjects || initialData.subjects,
            };
            
            // Ensure nested structures like comments array exist to prevent crashes
            mergedData.achievements = mergedData.achievements.map((ach: AchievementSection) => ({
                ...ach,
                comments: ach.comments || []
            }));

            return mergedData;
        }
    } catch (error) {
        console.error("Failed to load or parse data from localStorage. Resetting to initial data to prevent app corruption.", error);
        // If parsing fails, the saved data is corrupted. Remove it.
        window.localStorage.removeItem(localStorageKey);
    }
    // Return initial data if nothing is saved or if there was an error
    return initialData;
};

const SectionIcon: React.FC<{ sectionType: SectionId, className?: string }> = ({ sectionType, className }) => {
  switch (sectionType) {
    case 'goals': return <GoalIcon className={className} />;
    case 'planning': return <PlanIcon className={className} />;
    case 'progress': return <ProgressIcon className={className} />;
    case 'learning': return <LearnIcon className={className} />;
    case 'presentation': return <PresentIcon className={className} />;
    default: return null;
  }
};

const AchievementForm: React.FC<{
  section: AchievementSection;
  onSave: (updatedSection: AchievementSection) => void;
  onClose: () => void;
}> = ({ section, onSave, onClose }) => {
  const [title, setTitle] = useState(section.title);
  const [content, setContent] = useState(section.content);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<{url: string; name: string; type: string;} | null>(section.file ? section.file : null);
  const [fileRemoved, setFileRemoved] = useState(false);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFilePreview({
          url: URL.createObjectURL(selectedFile),
          name: selectedFile.name,
          type: selectedFile.type,
      });
      setFileRemoved(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null);
    setFileRemoved(true);
    // Also reset the file input visually
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSection = { ...section, title, content, lastUpdated: new Date().toISOString() };
    
    if (file) { // A new file was uploaded
        const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
        updatedSection.file = {
            name: file.name,
            url: dataUrl,
            type: file.type,
        };
    } else if (fileRemoved) { // File was explicitly removed
        updatedSection.file = undefined;
    } else { // No change to file, keep original
        updatedSection.file = section.file;
    }

    onSave(updatedSection);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
       <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">العنوان</label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الوصف</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          className="w-full p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label htmlFor="file" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">رفع ملف (صورة أو مستند)</label>
        {filePreview && (
          <div className="flex items-center justify-between gap-4 p-3 border border-slate-200 dark:border-slate-700 rounded-lg my-2 bg-slate-50 dark:bg-slate-700/50">
            <div className="flex items-center gap-3 overflow-hidden">
              {filePreview.type.startsWith('image/') ?
                <img src={filePreview.url} alt="preview" className="w-12 h-12 object-cover rounded-md" /> :
                <DocumentFileIcon className="w-10 h-10 text-slate-500" />
              }
              <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{filePreview.name}</p>
            </div>
            <button 
              type="button" 
              onClick={handleRemoveFile}
              className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors flex-shrink-0"
              aria-label="Remove file"
            >
              <TrashIcon />
            </button>
          </div>
        )}
        <input
          type="file"
          id="file"
          onChange={handleFileChange}
          className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/50 dark:file:text-blue-300 dark:hover:file:bg-blue-900"
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500 transition-colors">إلغاء</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">حفظ التغييرات</button>
      </div>
    </form>
  );
};

const AchievementAddForm: React.FC<{
  onSave: (newSection: Omit<AchievementSection, 'id' | 'lastUpdated' | 'comments'>) => void;
  onClose: () => void;
}> = ({ onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<SectionId>('goals');
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
        alert("الرجاء إدخال العنوان والوصف.");
        return;
    }

    const newSection: Omit<AchievementSection, 'id' | 'lastUpdated' | 'comments'> = {
        title,
        content,
        type,
    };
    if (file) {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      newSection.file = {
        name: file.name,
        url: dataUrl,
        type: file.type,
      };
    }
    onSave(newSection);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
       <div>
        <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">فئة الإنجاز</label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as SectionId)}
          className="w-full p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
            {Object.entries(sectionTypeTitles).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
            ))}
        </select>
      </div>
       <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">عنوان الإنجاز</label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثال: الفوز في مسابقة الرياضيات"
          className="w-full p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الوصف</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          placeholder="اشرح تفاصيل هذا الإنجاز..."
          className="w-full p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label htmlFor="file-add" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">رفع ملف (اختياري)</label>
        <input
          type="file"
          id="file-add"
          onChange={handleFileChange}
          className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/50 dark:file:text-blue-300 dark:hover:file:bg-blue-900"
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500 transition-colors">إلغاء</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">إضافة الإنجاز</button>
      </div>
    </form>
  );
};

const SkillAddForm: React.FC<{
  onSave: (newSkill: Omit<Skill, 'id'>) => void;
  onClose: () => void;
}> = ({ onSave, onClose }) => {
    const [name, setName] = useState('');
    const [level, setLevel] = useState<Skill['level']>(3);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert("الرجاء إدخال اسم المهارة.");
            return;
        }
        onSave({ name, level });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="skill-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">اسم المهارة</label>
                <input
                    id="skill-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: البرمجة"
                    className="w-full p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">مستوى الإتقان</label>
                <div className="flex justify-center gap-2" dir="ltr">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            type="button"
                            key={star}
                            onClick={() => setLevel(star as Skill['level'])}
                            className="text-4xl transition-transform hover:scale-125"
                            aria-label={`Set level to ${star}`}
                        >
                            {star <= level ? <span className="text-yellow-400">★</span> : <span className="text-slate-300 dark:text-slate-600">☆</span>}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500 transition-colors">إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">إضافة المهارة</button>
            </div>
        </form>
    );
};

const SubjectAddForm: React.FC<{
  onSave: (newSubject: Omit<Subject, 'id'>) => void;
  onClose: () => void;
}> = ({ onSave, onClose }) => {
    const [name, setName] = useState('');
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !reason.trim()) {
            alert("الرجاء إدخال اسم المادة وسبب تفضيلك لها.");
            return;
        }
        onSave({ name, reason });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="subject-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">اسم المادة</label>
                <input
                    id="subject-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: التاريخ"
                    className="w-full p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
             <div>
                <label htmlFor="subject-reason" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">لماذا أحب هذه المادة؟</label>
                <textarea
                    id="subject-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    placeholder="اشرح لماذا تستمتع بدراسة هذه المادة..."
                    className="w-full p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500 transition-colors">إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">إضافة المادة</button>
            </div>
        </form>
    );
};


const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [view, setView] = useState<'home' | 'dashboard' | 'timeline' | 'skills' | 'subjects'>('home');
  const [studentData, setStudentData] = useState<StudentData>(loadStudentData);
  
  const [editingSection, setEditingSection] = useState<AchievementSection | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [playingGame, setPlayingGame] = useState<AchievementSection | null>(null);
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [isAiLoading, setIsAiLoading] = useState<{ [key: string]: boolean }>({});
  
  // New Admin/Visitor Mode State
  const [mode, setMode] = useState<'visitor' | 'admin'>('visitor');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
 
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    try {
        window.localStorage.setItem(localStorageKey, JSON.stringify(studentData));
    } catch (error) {
        console.error("Could not save data to localStorage", error);
    }
  }, [studentData]);
  
  const handleAdminLogin = () => {
    setIsPasswordModalOpen(true);
  };
  
  const handleAdminLogout = () => {
    setMode('visitor');
  }

  const handlePasswordSuccess = () => {
      setMode('admin');
      setIsPasswordModalOpen(false);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleUpdateSection = (updatedSection: AchievementSection) => {
    setStudentData(prevData => ({
      ...prevData,
      achievements: prevData.achievements.map(s => s.id === updatedSection.id ? updatedSection : s)
    }));
  };
  
  const handleDeleteAchievement = (sectionId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الإنجاز؟ سيتم حذفه نهائيًا.')) {
        setStudentData(prev => ({
            ...prev,
            achievements: prev.achievements.filter(s => s.id !== sectionId)
        }));
    }
  };

  const handleDeleteSkill = (skillId: string) => {
      if (window.confirm('هل أنت متأكد من حذف هذه المهارة؟')) {
          setStudentData(prev => ({
              ...prev,
              skills: prev.skills.filter(s => s.id !== skillId)
          }));
      }
  };

  const handleDeleteSubject = (subjectId: string) => {
      if (window.confirm('هل أنت متأكد من حذف هذه المادة؟')) {
          setStudentData(prev => ({
              ...prev,
              subjects: prev.subjects.filter(s => s.id !== subjectId)
          }));
      }
  };

  const handleSaveNewAchievement = (newSectionData: Omit<AchievementSection, 'id' | 'lastUpdated' | 'comments'>) => {
    const newAchievement: AchievementSection = {
      ...newSectionData,
      id: `custom-${Date.now()}`,
      lastUpdated: new Date().toISOString(),
      comments: [],
    };
    setStudentData(prev => ({...prev, achievements: [...prev.achievements, newAchievement]}));
  };
  
    const handleSaveNewSkill = (newSkillData: Omit<Skill, 'id'>) => {
        const newSkill: Skill = {
            ...newSkillData,
            id: `skill-${Date.now()}`,
        };
        setStudentData(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
    };

    const handleSaveNewSubject = (newSubjectData: Omit<Subject, 'id'>) => {
        const newSubject: Subject = {
            ...newSubjectData,
            id: `subject-${Date.now()}`,
        };
        setStudentData(prev => ({ ...prev, subjects: [...prev.subjects, newSubject] }));
    };

  const handleAddComment = (sectionId: string) => {
    const commentText = newComment[sectionId]?.trim();
    if (!commentText || mode !== 'admin') return;
    
    const comment: TeacherComment = {
        id: new Date().toISOString(),
        teacherName: 'أ. معلم',
        comment: commentText,
        timestamp: new Date().toISOString(),
    };

    setStudentData(prevData => ({
        ...prevData,
        achievements: prevData.achievements.map(s => {
            if (s.id === sectionId) {
                return { ...s, comments: [...s.comments, comment] };
            }
            return s;
        })
    }));

    setNewComment(prev => ({...prev, [sectionId]: ''}));
  };

  const handleCommentChange = (sectionId: string, text: string) => {
    setNewComment(prev => ({...prev, [sectionId]: text}));
  };

  const handleGetAiFeedback = async (section: AchievementSection) => {
    if (mode !== 'admin') return;
    setIsAiLoading(prev => ({...prev, [section.id]: true}));
    try {
        const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
        const prompt = `أنت مرشد تعليمي داعم. قم بمراجعة النص التالي الذي كتبه طالب في المرحلة المتوسطة حول إنجازاته. قدم ملاحظات بناءة وإيجابية باللغة العربية في فقرة واحدة. اجعل ملاحظاتك مشجعة وساعد الطالب على التفكير في كيفية تحسين ما كتبه. النص هو: "${section.content}"`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const aiComment: TeacherComment = {
            id: new Date().toISOString(),
            teacherName: 'مرشد الذكاء الاصطناعي',
            comment: response.text,
            timestamp: new Date().toISOString(),
        };

        setStudentData(prevData => ({
            ...prevData,
            achievements: prevData.achievements.map(s => 
                s.id === section.id ? { ...s, comments: [...s.comments, aiComment] } : s
            )
        }));

    } catch (error) {
        console.error("Error getting AI feedback:", error);
        alert("حدث خطأ أثناء الحصول على الملاحظات من الذكاء الاصطناعي. الرجاء المحاولة مرة أخرى.");
    } finally {
        setIsAiLoading(prev => ({...prev, [section.id]: false}));
    }
  };
  
  const handleProfileUpdate = (updatedData: { name: string; bio: string; profileImageUrl: string }) => {
    setStudentData(prev => ({...prev, ...updatedData}));
  };

  const renderFilePreview = (file: UploadedFile) => {
    const isImage = file.type.startsWith('image/');
    return (
        <a href={file.url} target="_blank" rel="noopener noreferrer" className="mt-4 block group">
            <div className="flex items-center gap-4 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                {isImage ? (
                    <img src={file.url} alt={file.name} className="w-16 h-16 object-cover rounded-md" />
                ) : (
                    <div className="flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-md">
                        {file.type.includes('pdf') ? <DocumentFileIcon className="w-8 h-8 text-red-500" /> : <DocumentFileIcon className="w-8 h-8 text-blue-500" />}
                    </div>
                )}
                <div className="flex-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">{file.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{file.type}</p>
                </div>
            </div>
        </a>
    );
  };


  const Header = useCallback(() => (
    <header className="sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-slate-900/10 dark:border-slate-50/[0.06] bg-white/95 supports-backdrop-blur:bg-white/60 dark:bg-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-500 text-white font-bold text-xl rounded-md p-2">إ</div>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white">إنجازاتي</h1>
                     {mode === 'admin' && <span className="text-xs font-bold text-green-500 bg-green-100 dark:bg-green-900/50 dark:text-green-400 px-2 py-1 rounded-full">وضع المدير</span>}
                </div>
                <nav className="flex items-center gap-1 sm:gap-2">
                    <button onClick={() => setView('home')} className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${view === 'home' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>الرئيسية</button>
                    <button onClick={() => setView('dashboard')} className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${view === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>الإنجازات</button>
                    <button onClick={() => setView('skills')} className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${view === 'skills' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><SkillsIcon className="w-4 h-4" /> مهاراتي</button>
                    <button onClick={() => setView('subjects')} className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${view === 'subjects' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><BookIcon className="w-4 h-4" /> موادي المفضلة</button>
                    <button onClick={() => setView('timeline')} className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${view === 'timeline' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><TimelineIcon className="w-4 h-4" /> الخط الزمني</button>
                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        {theme === 'light' ? <MoonIcon className="w-5 h-5 text-slate-600" /> : <SunIcon className="w-5 h-5 text-yellow-400" />}
                    </button>
                    {mode === 'admin' ? (
                        <button onClick={handleAdminLogout} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="الخروج من وضع المدير">
                            <UnlockIcon className="w-5 h-5 text-green-500" />
                        </button>
                    ) : (
                         <button onClick={handleAdminLogin} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="دخول المدير">
                            <LockIcon className="w-5 h-5 text-slate-500" />
                        </button>
                    )}
                </nav>
            </div>
        </div>
    </header>
  ), [theme, view, mode]);
  
  const HomeView = () => (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center animate-fade-in">
        <div className="relative inline-block">
            <img src={studentData.profileImageUrl} alt="صورة الطالب" className="w-40 h-40 rounded-full mx-auto mb-6 shadow-lg border-4 border-white dark:border-slate-800 object-cover"/>
            <span className="absolute bottom-4 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">متصل</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-2">{studentData.name}</h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">{studentData.grade}</p>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
            <p className="flex-1 text-lg text-slate-700 dark:text-slate-400 leading-relaxed text-center md:text-right">
                مرحباً بكم في موقع إنجازاتي الشخصي. {studentData.bio}
            </p>
            <AnimatedHeader page="home" />
        </div>
        <button 
            onClick={() => setView('dashboard')} 
            className="mt-12 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transform hover:scale-105 transition-all duration-300"
        >
            اكتشف إنجازاتي
        </button>
         <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        `}</style>
    </div>
  );

  const Dashboard = () => (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 md:mb-12">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white text-center md:text-right">لوحة الإنجازات</h2>
            <AnimatedHeader page="dashboard" />
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg mb-10 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">معلومات الطالب</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-700 dark:text-slate-300">
                    <div><strong className="block text-slate-500 dark:text-slate-400">الاسم:</strong> {studentData.name}</div>
                    <div><strong className="block text-slate-500 dark:text-slate-400">الصف:</strong> {studentData.grade}</div>
                    <div><strong className="block text-slate-500 dark:text-slate-400">المدرسة:</strong> {studentData.school}</div>
                    <div><strong className="block text-slate-500 dark:text-slate-400">التاريخ:</strong> {studentData.date}</div>
                </div>
              </div>
              {mode === 'admin' && (
                <button onClick={() => setIsProfileModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  <EditIcon className="w-4 h-4"/>
                  تعديل الملف الشخصي
                </button>
              )}
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {studentData.achievements.map((section, index) => (
                <div key={section.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 flex flex-col transition-transform duration-300 hover:-translate-y-2 border border-slate-200 dark:border-slate-700" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
                            <SectionIcon sectionType={section.type} className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">{section.title}</h3>
                      </div>
                       <div className="flex items-center gap-1">
                           <button onClick={() => setPlayingGame(section)} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label={`Play game for ${section.title}`}>
                               <GameIcon />
                           </button>
                           {mode === 'admin' && (
                            <>
                               <button onClick={() => handleGetAiFeedback(section)} disabled={isAiLoading[section.id]} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label={`Get AI feedback for ${section.title}`}>
                                   {isAiLoading[section.id] ? <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon />}
                               </button>
                               <button onClick={() => setEditingSection(section)} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label={`Edit ${section.title}`}>
                                   <EditIcon />
                               </button>
                               <button onClick={() => handleDeleteAchievement(section.id)} className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors" aria-label={`Delete ${section.title}`}>
                                   <TrashIcon />
                               </button>
                            </>
                           )}
                       </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 flex-grow mb-4">{section.content}</p>
                    
                    {section.file && renderFilePreview(section.file)}

                    <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
                        <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">تعليقات المعلمين</h4>
                        <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                           {section.comments.length > 0 ? section.comments.map(comment => (
                               <div key={comment.id} className={`p-3 rounded-lg ${comment.teacherName === 'مرشد الذكاء الاصطناعي' ? 'bg-purple-50 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-800' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                                   <p className="text-sm text-slate-600 dark:text-slate-300">{comment.comment}</p>
                                   <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-left flex items-center gap-1.5 justify-end">
                                        {comment.teacherName === 'مرشد الذكاء الاصطناعي' && <SparklesIcon className="w-3 h-3 text-purple-500" />}
                                        <span>{comment.teacherName} - {new Date(comment.timestamp).toLocaleDateString('ar')}</span>
                                   </div>
                               </div>
                           )) : <p className="text-sm text-slate-400 italic">لا توجد تعليقات بعد.</p>}
                        </div>
                        {mode === 'admin' && (
                            <div className="mt-4 flex gap-2">
                                <input 
                                    type="text"
                                    placeholder="أضف تعليقًا..."
                                    value={newComment[section.id] || ''}
                                    onChange={(e) => handleCommentChange(section.id, e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment(section.id)}
                                    className="flex-grow p-2 text-sm border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button onClick={() => handleAddComment(section.id)} className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                                    <SendIcon />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
            {mode === 'admin' && (
                 <div 
                    className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-300 min-h-[300px] hover:border-blue-500 dark:hover:border-blue-500"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    <div className="text-center">
                        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto flex items-center justify-center mb-4 transition-colors">
                            <PlusIcon className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200">إضافة إنجاز جديد</h3>
                    </div>
                </div>
            )}
        </div>
    </div>
  );

  const SkillsView = () => (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 md:mb-12">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white text-center md:text-right">مهاراتي</h2>
            <AnimatedHeader page="skills" />
        </div>
        {studentData.skills.length === 0 ? (
            <div className="text-center py-16 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <SkillsIcon className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-500 mb-4"/>
                <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-200">لم تقم بإضافة أي مهارات بعد</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">هذا هو المكان المناسب لعرض نقاط قوتك ومواهبك.</p>
                {mode === 'admin' && (
                    <button 
                        onClick={() => setIsSkillModalOpen(true)}
                        className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transform hover:scale-105 transition-all duration-300"
                    >
                        <PlusIcon className="w-5 h-5" /> إضافة مهارتك الأولى
                    </button>
                )}
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {studentData.skills.map(skill => (
                    <div key={skill.id} className="group relative bg-white dark:bg-slate-800 rounded-xl shadow p-5 text-center flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700">
                        {mode === 'admin' && (
                             <button onClick={() => handleDeleteSkill(skill.id)} className="absolute top-2 right-2 p-1.5 rounded-full text-red-500 bg-red-100 dark:bg-red-900/50 transition-opacity" aria-label={`Delete ${skill.name}`}>
                               <TrashIcon className="w-4 h-4" />
                           </button>
                        )}
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">{skill.name}</h3>
                        <div className="flex gap-1" dir="ltr">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className={`text-2xl ${i < skill.level ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}>
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
                {mode === 'admin' && (
                     <div 
                        className="bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-300 min-h-[140px] hover:border-blue-500 dark:hover:border-blue-500"
                        onClick={() => setIsSkillModalOpen(true)}
                    >
                        <div className="text-center">
                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto flex items-center justify-center mb-3 transition-colors">
                                <PlusIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                            </div>
                            <h3 className="font-semibold text-md text-slate-700 dark:text-slate-200">إضافة مهارة</h3>
                        </div>
                    </div>
                )}
            </div>
        )}
    </div>
  );

  const SubjectsView = () => (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 md:mb-12">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white text-center md:text-right">ماداتي المفضلة</h2>
            <AnimatedHeader page="subjects" />
        </div>
        {studentData.subjects.length === 0 ? (
            <div className="text-center py-16 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <BookIcon className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-500 mb-4"/>
                <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-200">لم تقم بإضافة أي مواد مفضلة بعد</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">هذا هو المكان المناسب لعرض المواد التي تستمتع بها.</p>
                {mode === 'admin' && (
                    <button 
                        onClick={() => setIsSubjectModalOpen(true)}
                        className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transform hover:scale-105 transition-all duration-300"
                    >
                        <PlusIcon className="w-5 h-5" /> أضف مادتك المفضلة الأولى
                    </button>
                )}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {studentData.subjects.map(subject => (
                    <div key={subject.id} className="relative bg-white dark:bg-slate-800 rounded-xl shadow p-6 flex flex-col border border-slate-200 dark:border-slate-700">
                        {mode === 'admin' && (
                             <button onClick={() => handleDeleteSubject(subject.id)} className="absolute top-2 right-2 p-1.5 rounded-full text-red-500 bg-red-100 dark:bg-red-900/50" aria-label={`Delete ${subject.name}`}>
                               <TrashIcon className="w-4 h-4" />
                           </button>
                        )}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full">
                                <BookIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{subject.name}</h3>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 flex-grow">{subject.reason}</p>
                    </div>
                ))}
                {mode === 'admin' && (
                     <div 
                        className="bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-300 min-h-[140px] hover:border-blue-500 dark:hover:border-blue-500"
                        onClick={() => setIsSubjectModalOpen(true)}
                    >
                        <div className="text-center">
                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto flex items-center justify-center mb-3 transition-colors">
                                <PlusIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                            </div>
                            <h3 className="font-semibold text-md text-slate-700 dark:text-slate-200">إضافة مادة</h3>
                        </div>
                    </div>
                )}
            </div>
        )}
    </div>
  );

  const TimelineView = () => (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 md:mb-12">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white text-center md:text-right">الخط الزمني للإنجازات</h2>
            <AnimatedHeader page="timeline" />
        </div>
        <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-slate-200 dark:bg-slate-700"></div>
            
            <div className="space-y-12">
            {[...studentData.achievements].sort((a,b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()).map((section, index) => (
                <div key={section.id} className="relative flex items-center" style={{ flexDirection: index % 2 === 0 ? 'row' : 'row-reverse' }}>
                    <div className="w-[calc(50%-2rem)] px-4">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                             <div className="flex items-center gap-3 mb-3">
                                <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
                                    <SectionIcon sectionType={section.type} className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{section.title}</h3>
                             </div>
                             <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">{section.content}</p>
                             <p className="text-xs text-slate-400 dark:text-slate-500">آخر تحديث: {new Date(section.lastUpdated).toLocaleDateString('ar')}</p>
                        </div>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-blue-500 dark:bg-blue-600 border-4 border-slate-50 dark:border-slate-900 flex items-center justify-center text-white z-10">
                        <SectionIcon sectionType={section.type} className="w-8 h-8" />
                    </div>
                    <div className="w-[calc(50%-2rem)]"></div>
                </div>
            ))}
            </div>
        </div>
    </div>
  );


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-500">
      <Header />
      <main>
        {view === 'home' && <HomeView />}
        {view === 'dashboard' && <Dashboard />}
        {view === 'skills' && <SkillsView />}
        {view === 'subjects' && <SubjectsView />}
        {view === 'timeline' && <TimelineView />}
      </main>
      <footer className="text-center py-6 border-t border-slate-200 dark:border-slate-800 mt-12">
        <p className="text-sm text-slate-500 dark:text-slate-400">&copy; {new Date().getFullYear()} إنجازاتي - {studentData.name}. جميع الحقوق محفوظة.</p>
      </footer>

      {/* Modals */}
      <Modal isOpen={!!editingSection} onClose={() => setEditingSection(null)} title={`تعديل: ${editingSection?.title}`}>
        {editingSection && (
          <AchievementForm 
            section={editingSection} 
            onSave={handleUpdateSection} 
            onClose={() => setEditingSection(null)}
          />
        )}
      </Modal>
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="إضافة إنجاز جديد">
          <AchievementAddForm
            onSave={(newSectionData) => {
                handleSaveNewAchievement(newSectionData);
                setIsAddModalOpen(false);
            }}
            onClose={() => setIsAddModalOpen(false)}
          />
      </Modal>
       <Modal isOpen={isSkillModalOpen} onClose={() => setIsSkillModalOpen(false)} title="إضافة مهارة جديدة">
          <SkillAddForm 
            onSave={(newSkillData) => {
                handleSaveNewSkill(newSkillData);
                setIsSkillModalOpen(false);
            }}
            onClose={() => setIsSkillModalOpen(false)}
          />
      </Modal>
      <Modal isOpen={isSubjectModalOpen} onClose={() => setIsSubjectModalOpen(false)} title="إضافة مادة مفضلة جديدة">
          <SubjectAddForm 
            onSave={(newSubjectData) => {
                handleSaveNewSubject(newSubjectData);
                setIsSubjectModalOpen(false);
            }}
            onClose={() => setIsSubjectModalOpen(false)}
          />
      </Modal>
      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="تعديل الملف الشخصي">
        <ProfileEditForm 
            student={studentData}
            onSave={(data) => {
                handleProfileUpdate(data);
                setIsProfileModalOpen(false);
            }}
            onClose={() => setIsProfileModalOpen(false)}
        />
      </Modal>
       <Modal isOpen={!!playingGame} onClose={() => setPlayingGame(null)} title={`لعبة: ${playingGame?.title || ''}`}>
        {playingGame && (
          <AchievementGame section={playingGame} />
        )}
      </Modal>
       <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="دخول المدير">
        <PasswordModalContent 
            onSuccess={handlePasswordSuccess}
            onClose={() => setIsPasswordModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default App;
