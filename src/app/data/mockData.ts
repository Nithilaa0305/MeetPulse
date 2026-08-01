import { Student, Lecturer, Course, Employee, Session } from "../types";

export const initialStudents: Student[] = [
  { id: "STU001", name: "Aisha Rahman", email: "aisha@univ.edu", course: "CS401 Deep Learning", lecturer: "Dr. Sarah Chen", attendance: 95, engagement: 88, participation: 90, questionsCount: 14, report: "Highly analytical. Excels in neural architectures. Speaking and poll engagement are outstanding.", status: "active" },
  { id: "STU002", name: "Marcus Chen", email: "marcus@univ.edu", course: "CS401 Deep Learning", lecturer: "Dr. Sarah Chen", attendance: 87, engagement: 92, participation: 85, questionsCount: 8, report: "Grasps mathematical formulas quickly. Active in team discussions.", status: "active" },
  { id: "STU003", name: "Priya Patel", email: "priya@univ.edu", course: "CS301 Operating Systems", lecturer: "Dr. Sarah Chen", attendance: 100, engagement: 76, participation: 80, questionsCount: 5, report: "Consistent attendance. Prefers structured Q&A, writes deep notes.", status: "active" },
  { id: "STU004", name: "James Wilson", email: "james@univ.edu", course: "CS401 Deep Learning", lecturer: "Dr. Patel", attendance: 72, engagement: 65, participation: 55, questionsCount: 2, report: "Needs support in laboratory exercises. Engagement dips during slides.", status: "active" },
  { id: "STU005", name: "Sofia Morales", email: "sofia@univ.edu", course: "CS201 Data Structures", lecturer: "Dr. Sarah Chen", attendance: 98, engagement: 94, participation: 95, questionsCount: 19, report: "Top performer. Frequently asks high-quality conceptual questions.", status: "active" },
];

export const initialLecturers: Lecturer[] = [
  { id: "LEC001", name: "Dr. Sarah Chen", courses: ["CS401 Deep Learning", "CS301 Operating Systems"], subjects: ["Neural Networks", "Memory Management"], attendance: 97, rating: 4.9, coachingReport: "Speaking pace is optimal (120 wpm). Slide transition frequency average is 6.5 minutes. High vocal clarity." },
  { id: "LEC002", name: "Dr. Rajesh Patel", courses: ["CS201 Data Structures"], subjects: ["Binary Trees", "Graphs"], attendance: 94, rating: 4.7, coachingReport: "Great interaction score. Pace can sometimes accelerate during complex code reviews." },
];

export const initialCourses: Course[] = [
  { id: "CS401", name: "CS401 Deep Learning", studentsCount: 84, lecturer: "Dr. Sarah Chen", subjects: ["Neural Networks", "Backpropagation", "CNNs"], sessionsCount: 18, attendance: 91, engagement: 88 },
  { id: "CS301", name: "CS301 Operating Systems", studentsCount: 110, lecturer: "Dr. Sarah Chen", subjects: ["Processes", "Memory Management"], sessionsCount: 14, attendance: 85, engagement: 76 },
  { id: "CS201", name: "CS201 Data Structures", studentsCount: 156, lecturer: "Dr. Rajesh Patel", subjects: ["LinkedLists", "Trees", "Sorting"], sessionsCount: 22, attendance: 89, engagement: 81 },
];

export const initialEmployees: Employee[] = [
  { name: "Alex Thompson", dept: "Engineering", meetings: 24, eng: 91, tasks: 8, manager: "Morgan Davis", status: "Active" },
  { name: "Jamie Lee", dept: "Product", meetings: 18, eng: 85, tasks: 12, manager: "Morgan Davis", status: "Active" },
  { name: "Morgan Davis", dept: "Design", meetings: 15, eng: 78, tasks: 6, manager: "VP Product", status: "Active" },
  { name: "Casey Jordan", dept: "Marketing", meetings: 20, eng: 88, tasks: 10, manager: "CEO", status: "Active" },
  { name: "Riley Singh", dept: "Data Science", meetings: 16, eng: 82, tasks: 9, manager: "Alex Thompson", status: "Active" },
];

export const initialSessions: Session[] = [
  { id: "SESS-101", name: "CS401 - Neural Networks & Backpropagation", description: "Deep dive into loss functions, weights optimization and chain-rule gradient descent.", course: "CS401 Deep Learning", subject: "Backpropagation", date: "2026-07-21", time: "10:00 AM", platform: "MeetPulse Live", link: "https://meetpulse.live/cs401", slidesCount: 12, meetingId: "983-294-811" },
  { id: "SESS-102", name: "CS301 - Virtual Memory Management", description: "Analyzing page tables, translation lookaside buffers (TLB) and page replacement.", course: "CS301 Operating Systems", subject: "Memory Management", date: "2026-07-22", time: "02:00 PM", platform: "Zoom", link: "https://zoom.us/j/301301", slidesCount: 15, meetingId: "847-192-302" },
];

export const attendanceTrendData = [
  { month: "Jan", attendance: 82, engagement: 74 },
  { month: "Feb", attendance: 85, engagement: 78 },
  { month: "Mar", attendance: 89, engagement: 83 },
  { month: "Apr", attendance: 87, engagement: 80 },
  { month: "May", attendance: 91, engagement: 86 },
  { month: "Jun", attendance: 94, engagement: 91 },
];

export const departmentComparisonData = [
  { name: "CS / IT", avgUnderstanding: 86, attendance: 92, engagement: 88 },
  { name: "Electrical Eng", avgUnderstanding: 79, attendance: 85, engagement: 77 },
  { name: "Mechanical Eng", avgUnderstanding: 82, attendance: 88, engagement: 81 },
  { name: "Business School", avgUnderstanding: 91, attendance: 95, engagement: 93 },
];

export const AIConceptBreakdown = [
  { topic: "Backpropagation Derivation", score: 62, diff: "High Difficulty" },
  { topic: "Gradient Descent Optimization", score: 78, diff: "Medium Difficulty" },
  { topic: "Activation Functions (ReLU vs Sigmoid)", score: 92, diff: "Low Difficulty" },
  { topic: "Loss Minimization", score: 81, diff: "Medium Difficulty" },
];

export const SaaSUsageData = [
  { name: "Edu Orgs", value: 340, color: "#6366F1" },
  { name: "Business Orgs", value: 180, color: "#22D3EE" },
  { name: "Trial Orgs", value: 90, color: "#8B5CF6" },
];
