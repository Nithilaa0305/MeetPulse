export const attendanceTimeline = [
  { time: "09:00", attendance: 45 },
  { time: "09:15", attendance: 85 },
  { time: "09:30", attendance: 92 },
  { time: "09:45", attendance: 94 },
  { time: "10:00", attendance: 95 },
  { time: "10:15", attendance: 91 },
  { time: "10:30", attendance: 88 },
];

export const engagementTrends = [
  { date: "Mon", questions: 12, polls: 45, reactions: 120 },
  { date: "Tue", questions: 18, polls: 50, reactions: 150 },
  { date: "Wed", questions: 8, polls: 35, reactions: 90 },
  { date: "Thu", questions: 24, polls: 60, reactions: 210 },
  { date: "Fri", questions: 15, polls: 40, reactions: 130 },
];

export const understandingRadar = [
  { subject: "Concepts", score: 85, fullMark: 100 },
  { subject: "Syntax", score: 92, fullMark: 100 },
  { subject: "Architecture", score: 65, fullMark: 100 },
  { subject: "Optimization", score: 70, fullMark: 100 },
  { subject: "Debugging", score: 88, fullMark: 100 },
];

export const slideHeatmap = [
  { slide: "Slide 1", timeSpent: 45, dropoff: 0, confusion: 2 },
  { slide: "Slide 2", timeSpent: 120, dropoff: 2, confusion: 5 },
  { slide: "Slide 3", timeSpent: 300, dropoff: 15, confusion: 45 },
  { slide: "Slide 4", timeSpent: 90, dropoff: 1, confusion: 10 },
  { slide: "Slide 5", timeSpent: 210, dropoff: 5, confusion: 25 },
];

export const pollDistribution = [
  { name: "Option A", value: 400 },
  { name: "Option B", value: 300 },
  { name: "Option C", value: 300 },
  { name: "Option D", value: 200 },
];

export const questionTimeline = [
  { slide: "1", named: 2, anon: 0 },
  { slide: "2", named: 5, anon: 2 },
  { slide: "3", named: 8, anon: 15 },
  { slide: "4", named: 3, anon: 4 },
  { slide: "5", named: 6, anon: 8 },
];

export const presenterMetrics = [
  { name: "Pace (wpm)", value: 145, optimal: 150 },
  { name: "Clarity", value: 92, optimal: 90 },
  { name: "Interaction", value: 78, optimal: 85 },
  { name: "Energy", value: 88, optimal: 80 },
];

export const organizationUsage = [
  { month: "Jan", engineering: 400, sales: 240, marketing: 200 },
  { month: "Feb", engineering: 450, sales: 280, marketing: 220 },
  { month: "Mar", engineering: 520, sales: 310, marketing: 250 },
  { month: "Apr", engineering: 600, sales: 350, marketing: 280 },
];

export const aiRecommendations = [
  "Slide 3 caused a 45% spike in confusion. Consider breaking it down into two slides.",
  "Your speaking pace increased to 170 WPM during the Architecture section.",
  "Anonymous questions increased by 300% when discussing performance reviews.",
  "Poll participation drops by 20% if left open for longer than 60 seconds."
];
