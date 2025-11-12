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
  id: string;
  type: SectionId;
  title: string;
  content: string;
  file?: UploadedFile;
  comments: TeacherComment[];
  lastUpdated: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 1 | 2 | 3 | 4 | 5;
}

export interface StudentData {
  name: string;
  grade: string;
  date: string;
  school: string;
  location: string;
  profileImageUrl: string;
  bio: string;
  achievements: AchievementSection[];
  skills: Skill[];
}
