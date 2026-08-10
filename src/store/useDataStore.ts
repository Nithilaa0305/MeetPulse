import { create } from 'zustand';
import { Student, Lecturer, Course, Employee, Session } from '../app/types';
import { supabase } from '../lib/supabase';

interface DataState {
  students: Student[];
  lecturers: Lecturer[];
  courses: Course[];
  employees: Employee[];
  sessions: Session[];
  departments: { id: string, name: string }[];
  
  // Basic mutators
  setStudents: (students: Student[] | ((prev: Student[]) => Student[])) => void;
  setLecturers: (lecturers: Lecturer[] | ((prev: Lecturer[]) => Lecturer[])) => void;
  setCourses: (courses: Course[] | ((prev: Course[]) => Course[])) => void;
  setEmployees: (employees: Employee[] | ((prev: Employee[]) => Employee[])) => void;
  setSessions: (sessions: Session[] | ((prev: Session[]) => Session[])) => void;
  setDepartments: (departments: { id: string, name: string }[] | ((prev: { id: string, name: string }[]) => { id: string, name: string }[])) => void;

  // Real Database Fetching & Mutations
  fetchData: (orgId: string | null) => Promise<void>;
  updateUserProfile: (userId: string, updates: any, isPending?: boolean) => Promise<void>;
  deleteUserProfile: (userId: string, isPending?: boolean) => Promise<void>;
  createStudent: (name: string, email: string, year: string, semester: string, department: string, course: string, lecturer: string) => Promise<void>;
  createLecturer: (name: string, email: string, emp_id: string, department: string, subject: string) => Promise<void>;
  createCourse: (name: string, code: string, year: string, semester: string, department: string, lecturerId: string, lecturerName: string) => Promise<void>;
  updateCourse: (courseId: string, updates: any) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  createEmployee: (name: string, dept: string, manager: string) => Promise<void>;
  createDepartment: (name: string) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  students: [],
  lecturers: [],
  courses: [],
  employees: [],
  sessions: [],
  departments: [],

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
    sessions: typeof sessions === 'function' ? sessions(state.sessions) : sessions 
  })),
  setDepartments: (departments) => set((state) => ({ 
    departments: typeof departments === 'function' ? departments(state.departments) : departments 
  })),

  fetchData: async (orgId) => {
    try {
      // 1. Fetch Students & Lecturers (from profiles table)
      const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
      if (!pError && profiles) {
        const { data: invData, error: invError } = await supabase.from('invitations').select('*');
        const invitations = invError ? [] : (invData || []);

        const students: Student[] = profiles
          .filter(p => p.role === 'participant')
          .map(p => ({
            id: p.id,
            name: p.full_name || 'Unknown',
            email: p.email,
            year: p.year || '1st Year',
            semester: p.semester || 'Semester 1',
            status: (p.status as 'active' | 'suspended') || 'active',
            course: p.assigned_course || 'Unassigned',
            department: p.department || 'General',
            lecturer: p.assigned_lecturer || 'Unassigned',
            emp_id: p.emp_id || undefined,
            isPending: false,
            attendance: 0,
            engagement: 0,
            participation: 0,
            questionsCount: 0,
            report: ''
          }));

        // Add pending invited students
        invitations.filter(i => i.role === 'participant').forEach(inv => {
          students.push({
            id: inv.id,
            name: inv.full_name || 'Pending User',
            email: inv.email,
            year: inv.year || '1st Year',
            semester: inv.semester || 'Semester 1',
            status: 'active',
            course: inv.assigned_course || 'Unassigned',
            department: inv.department || 'General',
            lecturer: inv.assigned_lecturer || 'Unassigned',
            emp_id: inv.emp_id || undefined,
            isPending: true,
            attendance: 0,
            engagement: 0,
            participation: 0,
            questionsCount: 0,
            report: 'Awaiting registration'
          });
        });

        const lecturers: Lecturer[] = profiles
          .filter(p => p.role === 'presenter')
          .map(p => {
            const courseList = p.assigned_course && p.assigned_course !== 'Unassigned' 
              ? p.assigned_course.split(',').map((c: string) => c.trim()).filter(Boolean)
              : [];
            return {
              id: p.id,
              name: p.full_name || 'Unknown',
              department: p.department || 'General',
              emp_id: p.emp_id || undefined,
              isPending: false,
              courses: courseList.length > 0 ? courseList : ['Unassigned'],
              subjects: courseList.length > 0 ? courseList : ['Unassigned'],
              attendance: 100,
              rating: 5,
              coachingReport: ''
            };
          });

        // Add pending invited lecturers
        invitations.filter(i => i.role === 'presenter').forEach(inv => {
          const courseList = inv.assigned_course && inv.assigned_course !== 'Unassigned'
            ? inv.assigned_course.split(',').map((c: string) => c.trim()).filter(Boolean)
            : [];
          lecturers.push({
            id: inv.id,
            name: inv.full_name || 'Pending Lecturer',
            department: inv.department || 'General',
            emp_id: inv.emp_id || undefined,
            isPending: true,
            courses: courseList.length > 0 ? courseList : ['Unassigned'],
            subjects: courseList.length > 0 ? courseList : ['Unassigned'],
            attendance: 0,
            rating: 0,
            coachingReport: 'Awaiting registration'
          });
        });
          
        set({ students, lecturers });
      }

      // Fetch Courses and Departments from groups table
      const { data: groupsData, error: gError } = await supabase.from('groups').select('*').in('type', ['course', 'department']);
      if (!gError && groupsData) {
        const courses: Course[] = groupsData.filter(g => g.type === 'course').map(g => ({
          id: g.name.split(' ')[0] || g.id.substring(0, 5),
          name: g.name,
          code: g.code || undefined,
          studentsCount: 0,
          lecturer: g.lecturer_name || 'Unassigned',
          lecturer_id: g.lecturer_id || undefined,
          department: g.department || 'General',
          year: g.year || '1st Year',
          semester: g.semester || 'Semester 1',
          subjects: [g.name],
          sessionsCount: 0,
          attendance: 0,
          engagement: 0
        }));

        const departments = groupsData.filter(g => g.type === 'department').map(g => ({
          id: g.id,
          name: g.name
        }));

        set({ courses, departments });
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
  },

  updateUserProfile: async (userId, updates, isPending) => {
    try {
      const table = isPending ? 'invitations' : 'profiles';
      const { error } = await supabase.from(table).update(updates).eq('id', userId);
      if (error) throw error;
      // Optimistically update UI
      set((state) => ({
        students: state.students.map(s => s.id === userId ? { ...s, ...updates } : s),
        employees: state.employees.map(e => e.id === userId ? { ...e, ...updates } : e),
        lecturers: state.lecturers.map(l => l.id === userId ? { ...l, ...updates } : l)
      }));
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  },

  deleteUserProfile: async (userId, isPending) => {
    try {
      const table = isPending ? 'invitations' : 'profiles';
      const { error } = await supabase.from(table).delete().eq('id', userId);
      if (error) throw error;
      
      set((state) => ({
        students: state.students.filter(s => s.id !== userId),
        employees: state.employees.filter(e => e.id !== userId),
        lecturers: state.lecturers.filter(l => l.id !== userId)
      }));
    } catch (err) {
      console.error("Failed to delete profile:", err);
    }
  },

  createStudent: async (name, email, year, semester, department, course, lecturer) => {
    const id = crypto.randomUUID();
    try {
      const { error } = await supabase.from('invitations').insert({
        id,
        email,
        full_name: name,
        role: 'participant',
        year,
        semester,
        department,
        assigned_course: course || 'Unassigned',
        assigned_lecturer: lecturer || 'Unassigned'
      });
      if (error) throw error;
    } catch (err) {
      console.warn("DB insert failed, falling back to local state:", err);
    }
    set(state => ({
      students: [...state.students, {
        id,
        name,
        email,
        year,
        semester,
        department,
        course: course || 'Unassigned',
        lecturer: lecturer || 'Unassigned',
        status: 'active',
        attendance: 0,
        engagement: 0,
        participation: 0,
        questionsCount: 0,
        report: ''
      }]
    }));
  },

  createLecturer: async (name, email, emp_id, department, subject) => {
    const id = crypto.randomUUID();
    const courseList = subject ? subject.split(',').map(s => s.trim()).filter(Boolean) : ['Unassigned'];
    try {
      const { error } = await supabase.from('invitations').insert({
        id,
        email,
        full_name: name,
        emp_id,
        department,
        assigned_course: subject,
        role: 'presenter'
      });
      if (error) throw error;
    } catch (err) {
      console.warn("DB insert failed, falling back to local state:", err);
    }
    set(state => ({
      lecturers: [...state.lecturers, {
        id,
        name,
        emp_id,
        department,
        isPending: true,
        courses: courseList,
        subjects: courseList,
        attendance: 100,
        rating: 5,
        coachingReport: 'New lecturer added.'
      }]
    }));
  },

  createCourse: async (name, code, year, semester, department, lecturerId, lecturerName) => {
    const id = crypto.randomUUID();
    try {
      const { error } = await supabase.from('groups').insert({
        id,
        name,
        code,
        type: 'course',
        year,
        semester,
        department,
        lecturer_id: lecturerId || null,
        lecturer_name: lecturerName || 'Unassigned'
      });
      if (error) throw error;
    } catch (err) {
      console.warn("DB insert failed, falling back to local state:", err);
    }
    set(state => ({
      courses: [...state.courses, {
        id: code || id,
        name,
        code,
        studentsCount: 0,
        lecturer: lecturerName || 'Unassigned',
        lecturer_id: lecturerId,
        year,
        semester,
        department,
        subjects: [name],
        sessionsCount: 0,
        attendance: 100,
        engagement: 100
      }]
    }));
  },

  updateCourse: async (courseId, updates) => {
    try {
      const { error } = await supabase.from('groups').update(updates).eq('id', courseId).eq('type', 'course');
      if (error) throw error;
      set(state => ({
        courses: state.courses.map(c => c.id === courseId ? { ...c, ...updates } : c)
      }));
    } catch (err) {
      console.error("Failed to update course:", err);
    }
  },

  deleteCourse: async (courseId) => {
    try {
      const { error } = await supabase.from('groups').delete().eq('id', courseId).eq('type', 'course');
      if (error) throw error;
      set(state => ({
        courses: state.courses.filter(c => c.id !== courseId)
      }));
    } catch (err) {
      console.error("Failed to delete course:", err);
    }
  },

  createEmployee: async (name, dept, manager) => {
    const id = crypto.randomUUID();
    try {
      const { error } = await supabase.from('profiles').insert({
        id,
        email: `${name.toLowerCase().replace(/\s+/g, '')}@meetpulse.com`,
        full_name: name,
        role: 'participant',
        org_type: 'business',
        status: 'active',
        department: dept
      });
      if (error) throw error;
    } catch (err) {
      console.warn("DB insert failed, falling back to local state:", err);
    }
    set(state => ({
      employees: [...state.employees, {
        id,
        name,
        dept,
        meetings: 0,
        eng: 100,
        tasks: 0,
        manager,
        status: 'active'
      }]
    }));
  },

  createDepartment: async (name: string) => {
    const id = crypto.randomUUID();
    try {
      const { error } = await supabase.from('groups').insert({
        id,
        name,
        type: 'department'
      });
      if (error) throw error;
    } catch (err) {
      console.warn("DB insert failed, falling back to local state:", err);
    }
    set(state => ({
      departments: [...state.departments, { id, name }]
    }));
  },

  deleteDepartment: async (id: string) => {
    try {
      const { error } = await supabase.from('groups').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.warn("DB delete failed, falling back to local state:", err);
    }
    set(state => ({
      departments: state.departments.filter(d => d.id !== id)
    }));
  }
}));
