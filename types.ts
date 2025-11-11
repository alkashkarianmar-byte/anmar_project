
export type SectionId = 'goals' | 'planning' | 'progress' | 'learning' | 'presentation';

export interface TeacherComment {
  id: string;
  teacherName: string;
  comment: string;
  timestamp: string;
}

export interface UploadedFile {
  name: string;
  url: string;
  type: string;
}

export interface AchievementSection {
  id: SectionId;
  title: string;
  content: string;
  file?: UploadedFile;
  comments: TeacherComment[];
}

export interface StudentData {
  name: string;
  grade: string;
  date: string;
  school: string;
  location: string;
  achievements: AchievementSection[];
}
