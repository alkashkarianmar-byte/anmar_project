

import React, { useState, useEffect, useCallback } from 'react';
import { AchievementSection, StudentData, TeacherComment, UploadedFile, SectionId, Skill, Subject } from './types';
import { initialData } from './data';
import { db, storage } from './firebase';
import { GoalIcon, PlanIcon, ProgressIcon, LearnIcon, PresentIcon, SunIcon, MoonIcon, EditIcon, UploadIcon, DocumentFileIcon, SendIcon, GameIcon, SparklesIcon, TimelineIcon, PlusIcon, SkillsIcon, LockIcon, UnlockIcon, TrashIcon, BookIcon, MenuIcon, CloseIcon } from './components/icons';
import Modal from './components/Modal';
import AchievementGame from './components/AchievementGame';
import ProfileEditForm from './components/ProfileEditForm';
import PasswordModalContent from './components/PasswordModalContent';
import { GoogleGenAI } from "@google/genai";
import AnimatedHeader from './components/AnimatedHeader';

const sectionTypeTitles: { [key in SectionId]: string } = {
  goals: 'تحديد الأهداف',
  planning: 'تخطيط العمل',
  progress: 'تتبع التقدم',
  learning: 'التعلم من التجارب',
  presentation: 'عرض الإنجازات',
};

const sectionStyles: { [key in SectionId]: { border: string; bg: string; text: string; } } = {
  goals: { border: 'border-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-400' },
  planning: { border: 'border-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-600 dark:text-purple-400' },
  progress: { border: 'border-green-500', bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-600 dark:text-green-400' },
  learning: { border: 'border-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-600 dark:text-yellow-400' },
  presentation: { border: 'border-red-500', bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-600 dark:text-red-400' },
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

// --- Forms ---
const AchievementForm: React.FC<{
  section: AchievementSection;
  onSave: (updatedSection: AchievementSection, newFile: File | null, fileRemoved: boolean) => void;
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
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSectionData = { ...section, title, content, lastUpdated: new Date().toISOString() };
    onSave(updatedSectionData, file, fileRemoved);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
       <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">العنوان</label>
        <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الوصف</label>
        <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={5} className="w-full p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
      </div>
      <div>
        <label htmlFor="file" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">رفع ملف (صورة أو مستند)</label>
        {filePreview && (
          <div className="flex items-center justify-between gap-4 p-3 border border-slate-200 dark:border-slate-700 rounded-lg my-2 bg-slate-50 dark:bg-slate-700/50">
            <div className="flex items-center gap-3 overflow-hidden">
              {filePreview.type.startsWith('image/') ? <img src={filePreview.url} alt="preview" className="w-12 h-12 object-cover rounded-md" /> : <DocumentFileIcon className="w-10 h-10 text-slate-500" />}
              <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{filePreview.name}</p>
            </div>
            <button type="button" onClick={handleRemoveFile} className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors flex-shrink-0" aria-label="Remove file"><TrashIcon /></button>
          </div>
        )}
        <input type="file" id="file" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/50 dark:file:text-blue-300 dark:hover:file:bg-blue-900" />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500 transition-colors">إلغاء</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">حفظ التغييرات</button>
      </div>
    </form>
  );
};

const AchievementAddForm: React.FC<{
  onSave: (newSection: Omit<AchievementSection, 'id' | 'lastUpdated' | 'comments' | 'file'>, file: File | null) => void;
  onClose: () => void;
}> = ({ onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<SectionId>('goals');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { alert("الرجاء إدخال العنوان والوصف."); return; }
    onSave({ title, content, type }, file);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
       <div>
        <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">فئة الإنجاز</label>
        <select id="type" value={type} onChange={(e) => setType(e.target.value as SectionId)} className="w-full p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            {Object.entries(sectionTypeTitles).map(([key, value]) => (<option key={key} value={key}>{value}</option>))}
        </select>
      </div>
       <div>
        <label htmlFor="title-add" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">عنوان الإنجاز</label>
        <input id="title-add" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: الفوز في مسابقة الرياضيات" className="w-full p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
      </div>
      <div>
        <label htmlFor="content-add" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الوصف</label>
        <textarea id="content-add" value={content} onChange={(e) => setContent(e.target.value)} rows={5} placeholder="اشرح تفاصيل هذا الإنجاز..." className="w-full p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
      </div>
      <div>
        <label htmlFor="file-add" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">رفع ملف (اختياري)</label>
        <input type="file" id="file-add" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/50 dark:file:text-blue-300 dark:hover:file:bg-blue-900" />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500 transition-colors">إلغاء</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">إضافة الإنجاز</button>
      </div>
    </form>
  );
};
// --- End Forms ---


const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [view, setView] = useState<'home' | 'dashboard' | 'timeline' | 'skills' | 'subjects'>('home');
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [editingSection, setEditingSection] = useState<AchievementSection | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [playingGame, setPlayingGame] = useState<AchievementSection | null>(null);
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [isAiLoading, setIsAiLoading] = useState<{ [key: string]: boolean }>({});
  
  const [mode, setMode] = useState<'visitor' | 'admin'>('visitor');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [viewingCommentsFor, setViewingCommentsFor] = useState<AchievementSection | null>(null);
 
  // Fetch data from Firestore on initial load
  useEffect(() => {
    const fetchData = async () => {
        // FIX: Use Firebase v8 namespaced API
        const docRef = db.collection('studentData').doc('main');
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            setStudentData(docSnap.data() as StudentData);
        } else {
            console.log("No such document! Creating initial data.");
            // FIX: Use Firebase v8 namespaced API
            await docRef.set(initialData);
            setStudentData(initialData);
        }
        setLoading(false);
    };

    fetchData().catch(error => {
        console.error("Error fetching data:", error);
        setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);
  
  const handleAdminLogin = () => setIsPasswordModalOpen(true);
  const handleAdminLogout = () => setMode('visitor');
  const handlePasswordSuccess = () => { setMode('admin'); setIsPasswordModalOpen(false); };
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const uploadFile = async (file: File, path: string): Promise<UploadedFile> => {
    // FIX: Use Firebase v8 namespaced API
    const storageRef = storage.ref(path);
    await storageRef.put(file);
    const downloadURL = await storageRef.getDownloadURL();
    return { name: file.name, url: downloadURL, type: file.type };
  };

  const deleteFileByUrl = async (fileUrl: string) => {
      try {
          // FIX: Use Firebase v8 namespaced API
          const fileRef = storage.refFromURL(fileUrl);
          await fileRef.delete();
      } catch (error) {
          console.error("Could not delete file from storage. It might have been already deleted or the URL is incorrect.", error);
      }
  };
  
  const handleUpdateSection = async (updatedSection: AchievementSection, newFile: File | null, fileRemoved: boolean) => {
    if (!studentData) return;
    try {
        // FIX: Use Firebase v8 namespaced API
        const docRef = db.collection('studentData').doc('main');
        let finalSection = { ...updatedSection };

        // Handle file deletion
        const oldFile = studentData.achievements.find(s => s.id === updatedSection.id)?.file;
        if (oldFile && (fileRemoved || newFile)) {
            await deleteFileByUrl(oldFile.url);
        }

        // Handle file upload
        if (newFile) {
            finalSection.file = await uploadFile(newFile, `achievements/${Date.now()}-${newFile.name}`);
        } else if (fileRemoved) {
            delete (finalSection as Partial<AchievementSection>).file;
        }

        const updatedAchievements = studentData.achievements.map(s => s.id === finalSection.id ? finalSection : s);
        // FIX: Use Firebase v8 namespaced API
        await docRef.update({ achievements: updatedAchievements });
        setStudentData(prev => prev ? { ...prev, achievements: updatedAchievements } : null);
    } catch (error) { console.error("Error updating section:", error); }
  };
  
  const handleDeleteAchievement = async (sectionId: string) => {
    if (!studentData || !window.confirm('هل أنت متأكد من حذف هذا الإنجاز؟ سيتم حذفه نهائيًا.')) return;
    try {
        const achievementToDelete = studentData.achievements.find(s => s.id === sectionId);
        if (achievementToDelete?.file) {
            await deleteFileByUrl(achievementToDelete.file.url);
        }
        
        const updatedAchievements = studentData.achievements.filter(s => s.id !== sectionId);
        // FIX: Use Firebase v8 namespaced API
        await db.collection('studentData').doc('main').update({ achievements: updatedAchievements });
        setStudentData(prev => prev ? { ...prev, achievements: updatedAchievements } : null);
    } catch (error) { console.error("Error deleting achievement:", error); }
  };
  
  const handleSaveNewAchievement = async (newSectionData: Omit<AchievementSection, 'id'|'lastUpdated'|'comments'|'file'>, file: File | null) => {
    if (!studentData) return;
    try {
        
        const newAchievement: AchievementSection = {
            ...newSectionData,
            id: `custom-${Date.now()}`,
            lastUpdated: new Date().toISOString(),
            comments: [],
        };
        
        if (file) {
           newAchievement.file = await uploadFile(file, `achievements/${Date.now()}-${file.name}`);
        }

        const updatedAchievements = [...studentData.achievements, newAchievement];
        // FIX: Use Firebase v8 namespaced API
        await db.collection('studentData').doc('main').update({ achievements: updatedAchievements });
        setStudentData(prev => prev ? { ...prev, achievements: updatedAchievements } : null);
        setIsAddModalOpen(false);
    } catch (error) { console.error("Error saving new achievement:", error); }
  };

  const handleProfileUpdate = async (updatedData: { name: string; bio: string; }, newImageFile: File | null) => {
    if (!studentData) return;
    try {
        let profileImageUrl = studentData.profileImageUrl;
        if (newImageFile) {
            // Delete old profile picture if it's a firebase storage URL
            if (profileImageUrl.includes('firebasestorage')) {
                await deleteFileByUrl(profileImageUrl);
            }
            const newUrlData = await uploadFile(newImageFile, `profile/${Date.now()}-${newImageFile.name}`);
            profileImageUrl = newUrlData.url;
        }

        const finalData = { ...updatedData, profileImageUrl };
        // FIX: Use Firebase v8 namespaced API
        await db.collection('studentData').doc('main').update(finalData);
        setStudentData(prev => prev ? { ...prev, ...finalData } : null);
        setIsProfileModalOpen(false);
    } catch (error) { 
        console.error("Error updating profile:", error);
        throw error;
    }
  };

  const handleAddComment = async (sectionId: string) => {
      const commentText = newComment[sectionId]?.trim();
      if (!commentText || mode !== 'admin' || !studentData) return;

      const comment: TeacherComment = {
          id: new Date().toISOString(),
          teacherName: 'أ. معلم',
          comment: commentText,
          timestamp: new Date().toISOString(),
      };
      
      const updatedAchievements = studentData.achievements.map(s => 
          s.id === sectionId ? { ...s, comments: [...s.comments, comment] } : s
      );
      
      // FIX: Use Firebase v8 namespaced API
      await db.collection('studentData').doc('main').update({ achievements: updatedAchievements });
      
      if (viewingCommentsFor?.id === sectionId) {
          setViewingCommentsFor(prev => prev ? { ...prev, comments: [...prev.comments, comment] } : null);
      }
      setStudentData(prev => prev ? { ...prev, achievements: updatedAchievements } : null);
      setNewComment(prev => ({ ...prev, [sectionId]: '' }));
  };

  const handleDeleteComment = async (sectionId: string, commentId: string) => {
    if (!studentData || mode !== 'admin' || !window.confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;

    try {
      const updatedAchievements = studentData.achievements.map(section => {
        if (section.id === sectionId) {
          const updatedComments = section.comments.filter(comment => comment.id !== commentId);
          return { ...section, comments: updatedComments };
        }
        return section;
      });

      // Update Firestore
      await db.collection('studentData').doc('main').update({ achievements: updatedAchievements });

      // Update local state
      setStudentData(prev => prev ? { ...prev, achievements: updatedAchievements } : null);

      // Update the state for the currently open modal if it matches
      if (viewingCommentsFor?.id === sectionId) {
        setViewingCommentsFor(prev => {
          if (!prev) return null;
          const updatedComments = prev.comments.filter(c => c.id !== commentId);
          return { ...prev, comments: updatedComments };
        });
      }

    } catch (error) {
      console.error("Error deleting comment:", error);
      alert('حدث خطأ أثناء حذف التعليق.');
    }
  };
  
  const handleGetAiFeedback = async (section: AchievementSection) => {
    if (mode !== 'admin' || !studentData) return;
    setIsAiLoading(prev => ({...prev, [section.id]: true}));
    try {
        const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
        const prompt = `أنت مرشد تعليمي داعم. قدم ملاحظات بناءة وإيجابية حول هذا الإنجاز لطالب في المرحلة المتوسطة. كن مشجعًا وقدم اقتراحًا واحدًا للخطوة التالية. اجعل ردك قصيرًا وفي فقرة واحدة. الإنجاز هو: "${section.title} - ${section.content}"`; 
        
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        
        const aiCommentText = response.text;
        
        const aiComment: TeacherComment = { id: new Date().toISOString(), teacherName: 'مرشد الذكاء الاصطناعي', comment: aiCommentText, timestamp: new Date().toISOString() };
        
        const updatedAchievements = studentData.achievements.map(s => s.id === section.id ? { ...s, comments: [...s.comments, aiComment] } : s);
        // FIX: Use Firebase v8 namespaced API
        await db.collection('studentData').doc('main').update({ achievements: updatedAchievements });
        if (viewingCommentsFor?.id === section.id) {
            setViewingCommentsFor(prev => prev ? { ...prev, comments: [...prev.comments, aiComment] } : null);
        }
        setStudentData(prev => prev ? { ...prev, achievements: updatedAchievements } : null);
    } catch (error) { console.error("Error getting AI feedback:", error); } 
    finally { setIsAiLoading(prev => ({...prev, [section.id]: false})); }
  };

  const createCrudHandlers = <T extends {id: string}>(dataType: 'skills' | 'subjects') => {
      return {
          handleSave: async (newItemData: Omit<T, 'id'>) => {
              if (!studentData) return;
              const newItem = { ...newItemData, id: `${dataType}-${Date.now()}` } as T;
              const updatedData = [...studentData[dataType], newItem];
              // FIX: Use Firebase v8 namespaced API
              await db.collection('studentData').doc('main').update({ [dataType]: updatedData });
              setStudentData(prev => prev ? { ...prev, [dataType]: updatedData } : null);
          },
          handleDelete: async (itemId: string) => {
              if (!studentData || !window.confirm(`هل أنت متأكد من الحذف؟`)) return;
              const updatedData = studentData[dataType].filter(item => item.id !== itemId);
              // FIX: Use Firebase v8 namespaced API
              await db.collection('studentData').doc('main').update({ [dataType]: updatedData });
              setStudentData(prev => prev ? { ...prev, [dataType]: updatedData } : null);
          }
      }
  };
  const skillHandlers = createCrudHandlers<Skill>('skills');
  const subjectHandlers = createCrudHandlers<Subject>('subjects');

  // --- Render methods ---
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!studentData) return <div className="min-h-screen flex items-center justify-center"><p>لم يتم العثور على البيانات. الرجاء المحاولة مرة أخرى.</p></div>;
  
  const Header = () => (
    <header className="sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-slate-900/10 dark:border-slate-50/[0.06] bg-white/95 supports-backdrop-blur:bg-white/60 dark:bg-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white">إنجازاتي</h1>
                     {mode === 'admin' && <span className="text-xs font-bold text-green-500 bg-green-100 dark:bg-green-900/50 dark:text-green-400 px-2 py-1 rounded-full">وضع المدير</span>}
                </div>
                <div className="flex items-center">
                    <nav className="hidden md:flex items-center gap-1">
                        <button onClick={() => setView('home')} className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${view === 'home' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>الرئيسية</button>
                        <button onClick={() => setView('dashboard')} className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${view === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>الإنجازات</button>
                        <button onClick={() => setView('skills')} className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${view === 'skills' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><SkillsIcon className="w-4 h-4" /> مهاراتي</button>
                        <button onClick={() => setView('subjects')} className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${view === 'subjects' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><BookIcon className="w-4 h-4" /> موادي المفضلة</button>
                        <button onClick={() => setView('timeline')} className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${view === 'timeline' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><TimelineIcon className="w-4 h-4" /> الخط الزمني</button>
                    </nav>
                    <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 ml-2 pl-2">
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            {theme === 'light' ? <MoonIcon className="w-5 h-5 text-slate-600" /> : <SunIcon className="w-5 h-5 text-yellow-400" />}
                        </button>
                        {mode === 'admin' ? <button onClick={handleAdminLogout} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="الخروج من وضع المدير"><UnlockIcon className="w-5 h-5 text-green-500" /></button> : <button onClick={handleAdminLogin} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="دخول المدير"><LockIcon className="w-5 h-5 text-slate-500" /></button>}
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(prev => !prev)} className="md:hidden p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ml-2">
                        {isMobileMenuOpen ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
        {isMobileMenuOpen && (
             <nav className="md:hidden flex flex-col p-4 gap-3 border-t border-slate-200 dark:border-slate-700">
                <button onClick={() => { setView('home'); setIsMobileMenuOpen(false); }} className={`block px-3 py-2 text-base font-semibold rounded-md transition-colors ${view === 'home' ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-slate-800' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>الرئيسية</button>
                <button onClick={() => { setView('dashboard'); setIsMobileMenuOpen(false); }} className={`block px-3 py-2 text-base font-semibold rounded-md transition-colors ${view === 'dashboard' ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-slate-800' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>الإنجازات</button>
                <button onClick={() => { setView('skills'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 text-base font-semibold rounded-md transition-colors ${view === 'skills' ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-slate-800' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><SkillsIcon className="w-4 h-4" /> مهاراتي</button>
                <button onClick={() => { setView('subjects'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 text-base font-semibold rounded-md transition-colors ${view === 'subjects' ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-slate-800' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><BookIcon className="w-4 h-4" /> موادي المفضلة</button>
                <button onClick={() => { setView('timeline'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2 text-base font-semibold rounded-md transition-colors ${view === 'timeline' ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-slate-800' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><TimelineIcon className="w-4 h-4" /> الخط الزمني</button>
            </nav>
        )}
    </header>
  );

  const HomeView = () => (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 text-center sticky top-24">
                    <img src={studentData.profileImageUrl} alt={studentData.name} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-slate-200 dark:border-slate-700 object-cover" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{studentData.name}</h2>
                    <p className="text-slate-500 dark:text-slate-400">{studentData.grade}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{studentData.school}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{studentData.location}</p>
                    <p className="mt-4 text-slate-600 dark:text-slate-300 text-sm">{studentData.bio}</p>
                    {mode === 'admin' && (
                        <button onClick={() => setIsProfileModalOpen(true)} className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors text-sm font-semibold">
                            <EditIcon />
                            تعديل الملف الشخصي
                        </button>
                    )}
                </div>
            </div>
            <div className="md:col-span-2">
                 <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-right">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">أهلاً بك في ملف إنجازاتي</h2>
                            <p className="text-slate-600 dark:text-slate-300 mt-2">هنا أوثق رحلتي التعليمية، إنجازاتي، ومهاراتي التي أكتسبها.</p>
                        </div>
                        <AnimatedHeader page="home" />
                    </div>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <button onClick={() => setView('dashboard')} className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center">
                        <GoalIcon className="mx-auto w-8 h-8 text-blue-500 mb-2" />
                        <h3 className="font-semibold">الإنجازات</h3>
                    </button>
                    <button onClick={() => setView('skills')} className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center">
                        <SkillsIcon className="mx-auto w-8 h-8 text-purple-500 mb-2" />
                        <h3 className="font-semibold">مهاراتي</h3>
                    </button>
                    <button onClick={() => setView('subjects')} className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center">
                        <BookIcon className="mx-auto w-8 h-8 text-green-500 mb-2" />
                        <h3 className="font-semibold">موادي المفضلة</h3>
                    </button>
                </div>
            </div>
        </div>
    </div>
  );

  const AchievementCard: React.FC<{ achievement: AchievementSection }> = ({ achievement }) => (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="p-4">
            <h4 className="font-bold text-slate-800 dark:text-slate-100">{achievement.title}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 whitespace-pre-wrap">{achievement.content}</p>
            {achievement.file && (
                <a href={achievement.file.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    {achievement.file.type.startsWith('image/') ? <UploadIcon className="w-4 h-4" /> : <DocumentFileIcon className="w-4 h-4" />}
                    {achievement.file.name}
                </a>
            )}
             <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">آخر تحديث: {new Date(achievement.lastUpdated).toLocaleDateString('ar-SA')}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 flex items-center justify-between gap-2">
             <div className="flex items-center gap-1">
                 <button onClick={() => setViewingCommentsFor(achievement)} className="text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
                    <span>{achievement.comments.length}</span> تعليقات
                </button>
            </div>
            <div className="flex items-center gap-1">
                <button onClick={() => setPlayingGame(achievement)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="العب لعبة"><GameIcon className="w-4 h-4 text-purple-500" /></button>
                {mode === 'admin' && (
                    <>
                        <button onClick={() => handleGetAiFeedback(achievement)} disabled={isAiLoading[achievement.id]} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="اقتراح من الذكاء الاصطناعي">
                           {isAiLoading[achievement.id] ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon className="w-4 h-4 text-yellow-500" />}
                        </button>
                        <button onClick={() => setEditingSection(achievement)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="تعديل"><EditIcon className="w-4 h-4 text-blue-500" /></button>
                         <button onClick={() => handleDeleteAchievement(achievement.id)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="حذف"><TrashIcon className="w-4 h-4 text-red-500" /></button>
                    </>
                )}
            </div>
        </div>
    </div>
  );

  const Dashboard = () => {
    const sections = Object.keys(sectionTypeTitles) as SectionId[];
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
             <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-right">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">لوحة الإنجازات</h2>
                        <p className="text-slate-600 dark:text-slate-300 mt-2">استعراض منظم لجميع الإنجازات حسب الفئة.</p>
                    </div>
                     <AnimatedHeader page="dashboard" />
                </div>
            </div>

            {mode === 'admin' && (
                <div className="mb-6 text-right">
                    <button onClick={() => setIsAddModalOpen(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                        <PlusIcon />
                        إضافة إنجاز جديد
                    </button>
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {sections.map(sectionType => (
                    <div key={sectionType} className={`bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border-2 ${sectionStyles[sectionType].border}`}>
                        <div className={`flex items-center gap-3 mb-3`}>
                            <SectionIcon sectionType={sectionType} className={`w-7 h-7 ${sectionStyles[sectionType].text}`} />
                            <h3 className={`text-xl font-bold ${sectionStyles[sectionType].text}`}>{sectionTypeTitles[sectionType]}</h3>
                        </div>
                        <hr className={`border-t ${sectionStyles[sectionType].border} mb-4`} />
                        <div className="space-y-4">
                            {studentData.achievements.filter(a => a.type === sectionType).map(achievement => (
                                <AchievementCard key={achievement.id} achievement={achievement} />
                            ))}
                            {studentData.achievements.filter(a => a.type === sectionType).length === 0 && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">لا توجد إنجازات في هذا القسم بعد.</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  };

  const SkillsView = () => {
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillLevel, setNewSkillLevel] = useState<Skill['level']>(1);
    
    const handleAddSkill = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newSkillName.trim()) return;
        skillHandlers.handleSave({ name: newSkillName, level: newSkillLevel });
        setNewSkillName('');
        setNewSkillLevel(1);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-right">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">مهاراتي</h2>
                        <p className="text-slate-600 dark:text-slate-300 mt-2">قائمة بالمهارات التي أمتلكها وأعمل على تطويرها.</p>
                    </div>
                     <AnimatedHeader page="skills" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {studentData.skills.map(skill => (
                    <div key={skill.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-5 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{skill.name}</h3>
                            <div className="flex items-center mt-2">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-5 h-5 ${i < skill.level ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                ))}
                            </div>
                        </div>
                        {mode === 'admin' && (
                            <button onClick={() => skillHandlers.handleDelete(skill.id)} className="p-2 text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"><TrashIcon /></button>
                        )}
                    </div>
                ))}
            </div>
            
            {mode === 'admin' && (
                 <form onSubmit={handleAddSkill} className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-4">إضافة مهارة جديدة</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" value={newSkillName} onChange={e => setNewSkillName(e.target.value)} placeholder="اسم المهارة" className="md:col-span-2 w-full p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        <select value={newSkillLevel} onChange={e => setNewSkillLevel(Number(e.target.value) as Skill['level'])} className="w-full p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                            {[1, 2, 3, 4, 5].map(level => <option key={level} value={level}>{level} - {"⭐".repeat(level)}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">إضافة</button>
                </form>
            )}
        </div>
    );
  };

  const SubjectsView = () => {
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectReason, setNewSubjectReason] = useState('');

    const handleAddSubject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubjectName.trim() || !newSubjectReason.trim()) return;
        subjectHandlers.handleSave({ name: newSubjectName, reason: newSubjectReason });
        setNewSubjectName('');
        setNewSubjectReason('');
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-right">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">موادي المفضلة</h2>
                        <p className="text-slate-600 dark:text-slate-300 mt-2">المواد الدراسية التي أستمتع بها ولماذا.</p>
                    </div>
                    <AnimatedHeader page="subjects" />
                </div>
            </div>

            <div className="space-y-4">
                {studentData.subjects.map(subject => (
                     <div key={subject.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-5 flex justify-between items-start">
                        <div className="flex-grow">
                             <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{subject.name}</h3>
                             <p className="text-slate-600 dark:text-slate-300 mt-1">{subject.reason}</p>
                        </div>
                         {mode === 'admin' && (
                             <button onClick={() => subjectHandlers.handleDelete(subject.id)} className="p-2 text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors flex-shrink-0 ml-4"><TrashIcon /></button>
                         )}
                    </div>
                ))}
            </div>

            {mode === 'admin' && (
                <form onSubmit={handleAddSubject} className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-4">إضافة مادة جديدة</h3>
                    <div className="space-y-4">
                        <input type="text" value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} placeholder="اسم المادة" className="w-full p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        <textarea value={newSubjectReason} onChange={e => setNewSubjectReason(e.target.value)} placeholder="لماذا تحب هذه المادة؟" rows={3} className="w-full p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"></textarea>
                    </div>
                    <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">إضافة</button>
                </form>
            )}
        </div>
    );
  };
  
  const AchievementTimelineCard: React.FC<{ achievement: AchievementSection }> = ({ achievement }) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 w-full">
        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">{new Date(achievement.lastUpdated).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <h4 className="font-bold text-slate-800 dark:text-slate-100">{achievement.title}</h4>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{achievement.content}</p>
    </div>
  );

  const TimelineView = () => {
    const sortedAchievements = [...studentData.achievements].sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-right">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">الخط الزمني للإنجازات</h2>
                        <p className="text-slate-600 dark:text-slate-300 mt-2">رحلة إنجازاتي مرتبة من الأحدث إلى الأقدم.</p>
                    </div>
                    <AnimatedHeader page="timeline" />
                </div>
            </div>

            <div className="relative">
                {/* Vertical line */}
                <div 
                    className="absolute h-full border-r-2 border-slate-200 dark:border-slate-700 top-0 left-6 md:left-1/2 md:-translate-x-1/2" 
                    style={{ right: 'auto' }}
                ></div>

                <div className="space-y-12">
                    {sortedAchievements.map((achievement, index) => {
                        const isEven = index % 2 === 0;
                        return (
                            <div key={achievement.id} className={`relative md:flex md:items-center ${!isEven ? 'md:flex-row-reverse' : ''}`}>
                                
                                <div className="absolute z-10 flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full shadow-lg top-0 left-6 transform -translate-x-1/2 md:left-1/2">
                                    <SectionIcon sectionType={achievement.type} className="w-6 h-6 text-white" />
                                </div>

                                <div className="hidden md:block md:w-1/2"></div>
                                
                                <div className="w-full pl-20 md:w-1/2 md:px-8">
                                    <AchievementTimelineCard achievement={achievement} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
  };
  
  const CommentsModal: React.FC<{ 
    section: AchievementSection | null; 
    onClose: () => void; 
  }> = ({ section, onClose }) => {
    if (!section) return null;

    return (
        <Modal isOpen={!!section} onClose={onClose} title={`تعليقات على: ${section.title}`}>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {section.comments.length === 0 ? (
                    <p className="text-slate-500 dark:text-slate-400 text-center py-4">لا توجد تعليقات بعد.</p>
                ) : (
                    section.comments.map(comment => (
                        <div key={comment.id} className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700 flex justify-between items-start gap-2">
                           <div className="flex-grow">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{comment.teacherName}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(comment.timestamp).toLocaleString('ar-SA')}</p>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{comment.comment}</p>
                            </div>
                             {mode === 'admin' && (
                                <button 
                                    onClick={() => handleDeleteComment(section.id, comment.id)} 
                                    className="p-2 text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors flex-shrink-0"
                                    title="حذف التعليق"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
            {mode === 'admin' && (
                <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
                    <h4 className="font-bold mb-2">إضافة تعليق جديد</h4>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newComment[section.id] || ''}
                            onChange={(e) => setNewComment(prev => ({ ...prev, [section.id]: e.target.value }))}
                            placeholder="اكتب تعليقك هنا..."
                            className="flex-grow p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                        <button onClick={() => handleAddComment(section.id)} className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            <SendIcon />
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
  };

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
      {editingSection && (
        <Modal isOpen={!!editingSection} onClose={() => setEditingSection(null)} title={`تعديل: ${editingSection.title}`}>
            <AchievementForm section={editingSection} onSave={handleUpdateSection} onClose={() => setEditingSection(null)} />
        </Modal>
      )}

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="إضافة إنجاز جديد">
        <AchievementAddForm onSave={handleSaveNewAchievement} onClose={() => setIsAddModalOpen(false)} />
      </Modal>
    
      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="تعديل الملف الشخصي">
        <ProfileEditForm student={studentData} onSave={handleProfileUpdate} onClose={() => setIsProfileModalOpen(false)} />
      </Modal>

      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="تسجيل دخول المدير">
        <PasswordModalContent onSuccess={handlePasswordSuccess} onClose={() => setIsPasswordModalOpen(false)} />
      </Modal>

      {playingGame && (
          <Modal isOpen={!!playingGame} onClose={() => setPlayingGame(null)} title={`لعبة: ${playingGame.title}`}>
              <AchievementGame section={playingGame} />
          </Modal>
      )}

      <CommentsModal section={viewingCommentsFor} onClose={() => setViewingCommentsFor(null)} />
    </div>
  );
};

export default App;