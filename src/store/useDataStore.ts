import { create } from 'zustand';
import { Student, Lecturer, Course, Employee, Session } from '../app/types';
import { supabase } from '../lib/supabase';

interface DataState {
  students: Student[];
  lecturers: Lecturer[];
  courses: Course[];
  employees: Employee[];
  sessions: Session[];
  
  // Basic mutators
  setStudents: (students: Student[] | ((prev: Student[]) => Student[])) => void;
  setLecturers: (lecturers: Lecturer[] | ((prev: Lecturer[]) => Lecturer[])) => void;
  setCourses: (courses: Course[] | ((prev: Course[]) => Course[])) => void;
  setEmployees: (employees: Employee[] | ((prev: Employee[]) => Employee[])) => void;
  setSessions: (sessions: Session[] | ((prev: Session[]) => Session[])) => void;

  // Real Database Fetching
  fetchData: (orgId: string | null) => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  students: [],
  lecturers: [],
  courses: [],
  employees: [],
  sessions: [],

  setStudents: (students) => set((state) => ({ 
    students: typeof students === 'function' ? students(state.students) : students 
  })),
  setLecturers: (lecturers) => set((state) => ({ 
    lecturers: typeof lecturers === 'function' ? lecturers(state.lecturers) : lecturers 
  })),
  setCourses: (courses) => set((state) => ({ 
    courses: typeof courses === 'function' ? courses(state.courses) : courses 
  })),
  setEmployees: (employees) => set((state) => ({ 
    employees: typeof employees === 'function' ? employees(state.employees) : employees 
  })),
  setSessions: (sessions) => set((state) => ({ 
    sessions: typeof sessions === 'function' ? (sessions as any)(state.sessions) : sessions 
  })),

  fetchData: async (orgId) => {
    try {
      // 1. Fetch Students & Lecturers (from profiles table)
      const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
      if (!pError && profiles) {
        const students: Student[] = profiles
          .filter(p => p.role === 'participant')
          .map(p => ({
            id: p.id,
            name: p.full_name || 'Unknown',
            email: p.email,
            status: 'active',
            course: 'Unassigned',
            lecturer: 'Unassigned',
            attendance: 0,
            engagement: 0,
            participation: 0,
            questionsCount: 0,
            report: ''
          }));

        const lecturers: Lecturer[] = profiles
          .filter(p => p.role === 'presenter')
          .map(p => ({
            id: p.id,
            name: p.full_name || 'Unknown',
            courses: [],
            subjects: [],
            attendance: 0,
            rating: 0,
            coachingReport: ''
          }));
          
        set({ students, lecturers });
      }

      // 2. Fetch Sessions
      const { data: meetings, error: mError } = await supabase.from('meetings').select('*');
      
      let combinedSessions: Session[] = [];
      
      if (!mError && meetings) {
        combinedSessions = meetings.map(m => ({
          id: m.id,
          name: m.title,
          description: m.description || '',
          course: m.course || 'Unassigned',
          subject: m.subject || 'Unassigned',
          date: m.created_at ? m.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          time: m.time || '10:00 AM',
          platform: m.platform || 'MeetPulse Live',
          link: m.link || '',
          slidesCount: m.slides_count || 0,
          meetingId: m.meeting_id || m.id.substring(0, 8),
          allowGuest: m.allow_guest ?? true,
          slides: [],
          presentationFile: '',
          materials: m.materials || [],
          status: m.status || 'scheduled',
          analytics: m.analytics || {}
        }));
      }

      // Load locally saved sessions that failed to upload due to RLS
      try {
        const localSessionsStr = localStorage.getItem('meetpulse_local_sessions');
        if (localSessionsStr) {
          const localSessions = JSON.parse(localSessionsStr) as Session[];
          // Only add local sessions that aren't already in the DB
          localSessions.forEach(ls => {
            if (!combinedSessions.find(cs => cs.id === ls.id)) {
              combinedSessions.push(ls);
            }
          });
        }
      } catch (e) {
        console.error("Failed to parse local sessions", e);
      }
      
      set({ sessions: combinedSessions.length > 0 ? combinedSessions : get().sessions });
    } catch (err) {
      console.error("Database tables might not exist yet:", err);
    }
  }
}));
