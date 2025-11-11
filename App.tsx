
import React, { useState, useEffect, useCallback } from 'react';
import { AchievementSection, StudentData, TeacherComment, UploadedFile, SectionId } from './types';
import { GoalIcon, PlanIcon, ProgressIcon, LearnIcon, PresentIcon, SunIcon, MoonIcon, EditIcon, UploadIcon, ImageFileIcon, DocumentFileIcon, SendIcon } from './components/icons';
import Modal from './components/Modal';

const initialData: StudentData = {
  name: 'أنمار أحمد الكاشقري',
  grade: 'الصف الأول المتوسط',
  date: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }),
  school: 'مدرسة المعرفة الأهلية',
  location: 'جدة، المملكة العربية السعودية',
  achievements: [
    { id: 'goals', title: 'تحديد الأهداف', content: 'هدفي هذا العام هو تحسين مهاراتي في الرياضيات واللغة الإنجليزية، والمشاركة في مسابقة العلوم المدرسية.', file: undefined, comments: [] },
    { id: 'planning', title: 'تخطيط العمل', content: 'قمت بإنشاء جدول زمني أسبوعي يتضمن ساعات محددة للمذاكرة، وحل الواجبات، والتحضير لمسابقة العلوم.', file: undefined, comments: [] },
    { id: 'progress', title: 'تتبع التقدم', content: 'أقوم بمراجعة تقدمي كل أسبوع. لقد لاحظت تحسنًا في درجاتي في الاختبارات القصيرة للرياضيات.', file: undefined, comments: [] },
    { id: 'learning', title: 'التعلم من التجارب', content: 'واجهت صعوبة في فهم بعض المفاهيم الهندسية، ولكن بعد طلب المساعدة من المعلم واستخدام مصادر تعليمية عبر الإنترنت، تمكنت من فهمها بشكل أفضل.', file: undefined, comments: [] },
    { id: 'presentation', title: 'عرض الإنجازات', content: 'حصلت على المركز الثاني في مسابقة العلوم المدرسية عن مشروعي حول الطاقة المتجددة.', file: {name: 'شهادة تقدير.jpg', url: 'https://picsum.photos/400/300', type: 'image/jpeg'}, comments: [
      { id: '1', teacherName: 'أ. محمد', comment: 'عمل رائع يا أنمار! مشروعك كان مميزًا جدًا.', timestamp: new Date().toISOString() }
    ]},
  ]
};

const SectionIcon: React.FC<{ sectionId: SectionId, className?: string }> = ({ sectionId, className }) => {
  switch (sectionId) {
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
  const [content, setContent] = useState(section.content);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSection = { ...section, content };
    if (file) {
      updatedSection.file = {
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
      };
    }
    onSave(updatedSection);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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


const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [view, setView] = useState<'home' | 'dashboard'>('home');
  const [studentData, setStudentData] = useState<StudentData>(initialData);
  const [editingSection, setEditingSection] = useState<AchievementSection | null>(null);
  const [newComment, setNewComment] = useState<{ [key in SectionId]: string }>({ goals: '', planning: '', progress: '', learning: '', presentation: '' });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleUpdateSection = (updatedSection: AchievementSection) => {
    setStudentData(prevData => ({
      ...prevData,
      achievements: prevData.achievements.map(s => s.id === updatedSection.id ? updatedSection : s)
    }));
  };
  
  const handleAddComment = (sectionId: SectionId) => {
    const commentText = newComment[sectionId].trim();
    if (!commentText) return;
    
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

  const handleCommentChange = (sectionId: SectionId, text: string) => {
    setNewComment(prev => ({...prev, [sectionId]: text}));
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
                </div>
                <nav className="flex items-center gap-4">
                    <button onClick={() => setView('home')} className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${view === 'home' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>الرئيسية</button>
                    <button onClick={() => setView('dashboard')} className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${view === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>لوحة الإنجازات</button>
                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        {theme === 'light' ? <MoonIcon className="w-5 h-5 text-slate-600" /> : <SunIcon className="w-5 h-5 text-yellow-400" />}
                    </button>
                </nav>
            </div>
        </div>
    </header>
  ), [theme, view, toggleTheme]);
  
  const Home = () => (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center animate-fade-in">
        <div className="relative inline-block">
            <img src="https://picsum.photos/id/1062/150/150" alt="صورة الطالب" className="w-40 h-40 rounded-full mx-auto mb-6 shadow-lg border-4 border-white dark:border-slate-800"/>
            <span className="absolute bottom-4 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">متصل</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-2">{studentData.name}</h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">{studentData.grade}</p>
        <p className="max-w-3xl mx-auto text-lg text-slate-700 dark:text-slate-400 leading-relaxed">
            مرحباً بكم في موقع إنجازاتي الشخصي. هذا الموقع هو بمثابة سجل لرحلتي التعليمية، حيث أشارك أهدافي، وخططي، وتقدمي، وأهم الإنجازات التي حققتها. أسعى دائمًا للتعلم والتطور، وأتمنى أن يكون هذا الموقع مصدر إلهام للجميع.
        </p>
        <button 
            onClick={() => setView('dashboard')} 
            className="mt-10 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transform hover:scale-105 transition-all duration-300"
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
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg mb-10 border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">معلومات الطالب</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-700 dark:text-slate-300">
                <div><strong className="block text-slate-500 dark:text-slate-400">الاسم:</strong> {studentData.name}</div>
                <div><strong className="block text-slate-500 dark:text-slate-400">الصف:</strong> {studentData.grade}</div>
                <div><strong className="block text-slate-500 dark:text-slate-400">المدرسة:</strong> {studentData.school}</div>
                <div><strong className="block text-slate-500 dark:text-slate-400">التاريخ:</strong> {studentData.date}</div>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {studentData.achievements.map((section, index) => (
                <div key={section.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 flex flex-col transition-transform duration-300 hover:-translate-y-2 border border-slate-200 dark:border-slate-700" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
                            <SectionIcon sectionId={section.id} className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">{section.title}</h3>
                      </div>
                       <button onClick={() => setEditingSection(section)} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                           <EditIcon />
                       </button>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 flex-grow mb-4">{section.content}</p>
                    
                    {section.file && renderFilePreview(section.file)}

                    <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
                        <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">تعليقات المعلمين</h4>
                        <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                           {section.comments.length > 0 ? section.comments.map(comment => (
                               <div key={comment.id} className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                                   <p className="text-sm text-slate-600 dark:text-slate-300">{comment.comment}</p>
                                   <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-left">{comment.teacherName} - {new Date(comment.timestamp).toLocaleDateString('ar')}</p>
                               </div>
                           )) : <p className="text-sm text-slate-400 italic">لا توجد تعليقات بعد.</p>}
                        </div>
                        <div className="mt-4 flex gap-2">
                            <input 
                                type="text"
                                placeholder="أضف تعليقًا..."
                                value={newComment[section.id]}
                                onChange={(e) => handleCommentChange(section.id, e.target.value)}
                                className="flex-grow p-2 text-sm border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button onClick={() => handleAddComment(section.id)} className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                                <SendIcon />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-500">
      <Header />
      <main>
        {view === 'home' ? <Home /> : <Dashboard />}
      </main>
      <footer className="text-center py-6 border-t border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">&copy; {new Date().getFullYear()} إنجازاتي - {studentData.name}. جميع الحقوق محفوظة.</p>
      </footer>
      <Modal isOpen={!!editingSection} onClose={() => setEditingSection(null)} title={`تعديل: ${editingSection?.title}`}>
        {editingSection && (
          <AchievementForm 
            section={editingSection} 
            onSave={handleUpdateSection} 
            onClose={() => setEditingSection(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default App;
