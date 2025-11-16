
import { StudentData } from './types';

export const initialData: StudentData = {
  name: 'أنمار أحمد الكاشقري',
  grade: 'الصف الأول المتوسط',
  date: '١٢ مارس ٢٠١٤',
  school: 'مدارس الأندلس الأهلية',
  location: 'جدة، المملكة العربية السعودية',
  profileImageUrl: 'https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png',
  bio: 'أسعى دائمًا للتعلم والتطور، وأتمنى أن يكون هذا الموقع مصدر إلهام للجميع.',
  achievements: [
    { id: 'initial-goals', type: 'goals', title: 'تحديد الأهداف', content: 'هدفي هذا العام هو تحسين مهاراتي في الرياضيات واللغة الإنجليزية، والمشاركة في مسابقة العلوم المدرسية.', comments: [], lastUpdated: new Date('2014-09-05T10:00:00Z').toISOString() },
    { id: 'initial-planning', type: 'planning', title: 'تخطيط العمل', content: 'قمت بإنشاء جدول زمني أسبوعي يتضمن ساعات محددة للمذاكرة، وحل الواجبات، والتحضير لمسابقة العلوم.', comments: [], lastUpdated: new Date('2014-09-15T11:30:00Z').toISOString() },
    { id: 'initial-progress', type: 'progress', title: 'تتبع التقدم', content: 'أقوم بمراجعة تقدمي كل أسبوع. لقد لاحظت تحسنًا في درجاتي في الاختبارات القصيرة للرياضيات.', comments: [], lastUpdated: new Date('2014-10-01T15:00:00Z').toISOString() },
    { id: 'initial-learning', type: 'learning', title: 'التعلم من التجارب', content: 'واجهت صعوبة في فهم بعض المفاهيم الهندسية، ولكن بعد طلب المساعدة من المعلم واستخدام مصادر تعليمية عبر الإنترنت، تمكنت من فهمها بشكل أفضل.', comments: [], lastUpdated: new Date('2014-10-20T16:45:00Z').toISOString() },
    { id: 'initial-presentation', type: 'presentation', title: 'عرض الإنجازات', content: 'حصلت على المركز الثاني في مسابقة العلوم المدرسية عن مشروعي حول الطاقة المتجددة.', comments: [
      { id: '1', teacherName: 'أ. محمد', comment: 'عمل رائع يا أنمار! مشروعك كان مميزًا جدًا.', timestamp: new Date('2014-11-05T09:00:00Z').toISOString() }
    ], lastUpdated: new Date('2014-11-05T09:00:00Z').toISOString()},
  ],
  skills: [
    { id: 'default-skill-1', name: 'البرمجة', level: 3 },
    { id: 'default-skill-2', name: 'البادل', level: 3 },
  ],
  subjects: [
      { id: 'subject-1', name: 'الرياضيات', reason: 'أحب حل المسائل الصعبة واكتشاف الأنماط في الأرقام والأشكال.' },
      { id: 'subject-2', name: 'العلوم', reason: 'أستمتع بإجراء التجارب في المختبر وتعلم كيف يعمل العالم من حولنا.' },
      { id: 'subject-3', name: 'اللغة الإنجليزية', reason: 'أحب تعلم كلمات جديدة والتحدث مع أشخاص من ثقافات مختلفة.' },
  ]
};