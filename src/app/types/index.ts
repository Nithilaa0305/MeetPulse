export type View = "landing" | "login" | "register" | "forgot-password" | "org" | "role" | "details" | "app";
export type AuthMode = "login" | "register";
export type OrgType = "education" | "business";
export type Role = "superadmin" | "admin" | "presenter" | "participant";

export interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  lecturer: string;
  attendance: number;
  engagement: number;
  participation: number;
  questionsCount: number;
  report: string;
  status: "active" | "suspended";
}

export interface Lecturer {
  id: string;
  name: string;
  courses: string[];
  subjects: string[];
  attendance: number;
  rating: number;
  coachingReport: string;
}

export interface Course {
  id: string;
  name: string;
  studentsCount: number;
  lecturer: string;
  subjects: string[];
  sessionsCount: number;
  attendance: number;
  engagement: number;
}

export interface Session {
  id: string;
  name: string;
  description: string;
  course: string;
  subject: string;
  date: string;
  time: string;
  platform: string;
  link: string;
  slidesCount: number;
  meetingId: string;
  allowGuest?: boolean;
  slides?: string[];
  presentationFile?: string;
  materials?: { name: string; size: string; type: string; url?: string; fileObject?: File; textContents?: string; slidesText?: string[][] }[];
}

export interface LiveQuestion {
  id: string;
  text: string;
  slide: number;
  votes: number;
  isAnonymous: boolean;
  author: string;
  isAnswered: boolean;
}

export interface LivePoll {
  question: string;
  options: string[];
  votes: number[];
  isActive: boolean;
}

export interface Employee {
  name: string;
  dept: string;
  meetings: number;
  eng: number;
  tasks: number;
  manager: string;
  status: string;
}

export interface TranscriptSegment {
  id: string;
  speaker: string;
  text: string;
  timestamp: string;
  confidence: number;
  slide: number;
}

