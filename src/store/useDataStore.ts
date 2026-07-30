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

export const useDataStore = create<DataState>((set) => ({
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
            attendance: 0,
            performance: 0,
            engagement: 0
          }));

        const lecturers: Lecturer[] = profiles
          .filter(p => p.role === 'presenter')
          .map(p => ({
            id: p.id,
            name: p.full_name || 'Unknown',
            email: p.email,
            subject: 'Unassigned',
            rating: 5,
            activeCourses: 0,
            totalStudents: 0
          }));
          
        set({ students, lecturers });
      }

      // 2. Fetch Sessions
      const { data: meetings, error: mError } = await supabase.from('meetings').select('*');
      if (!mError && meetings) {
        const sessions: Session[] = meetings.map(m => ({
          id: m.id,
          name: m.title,
          date: m.created_at.split('T')[0],
          attendees: 0,
          engagement: 0,
          duration: m.scheduled_duration ? `${m.scheduled_duration}m` : '0m',
          status: m.status as 'scheduled' | 'live' | 'completed'
        }));
        set({ sessions });
      }
    } catch (err) {
      console.error("Database tables might not exist yet:", err);
    }
  }
}));
