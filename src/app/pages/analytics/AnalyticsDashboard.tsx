import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart, Users, Zap, Brain, Presentation, PieChart, MessageSquare, 
  UserCheck, Lightbulb, Clock, Download, Filter, Building2
} from "lucide-react";

// Types
import { OrgType, Role } from "../../types";

// Import Tabs (we will create these next)
import { AttendanceTab } from "./tabs/AttendanceTab";
import { EngagementTab } from "./tabs/EngagementTab";
import { UnderstandingTab } from "./tabs/UnderstandingTab";
import { SlideAnalyticsTab } from "./tabs/SlideAnalyticsTab";
import { PollAnalyticsTab } from "./tabs/PollAnalyticsTab";
import { QuestionAnalyticsTab } from "./tabs/QuestionAnalyticsTab";
import { PresenterAnalyticsTab } from "./tabs/PresenterAnalyticsTab";
import { AIInsightsTab } from "./tabs/AIInsightsTab";
import { MeetingPerformanceTab } from "./tabs/MeetingPerformanceTab";
import { OrganizationAnalyticsTab } from "./tabs/OrganizationAnalyticsTab";

interface AnalyticsDashboardProps {
  role: Role;
  org: OrgType;
}

export function AnalyticsDashboard({ role, org }: AnalyticsDashboardProps) {
  // Determine which tabs to show based on org/role.
  const allTabs = [
    { id: "organization", label: "Organization", icon: Building2 },
    { id: "meeting", label: "Meeting Perf", icon: Clock },
    { id: "attendance", label: "Attendance", icon: Users },
    { id: "engagement", label: "Engagement", icon: Zap },
    { id: "understanding", label: "Understanding", icon: Brain },
    { id: "slides", label: "Slide Analytics", icon: Presentation },
    { id: "polls", label: "Polls", icon: PieChart },
    { id: "questions", label: "Questions", icon: MessageSquare },
    { id: "presenter", label: "Presenter", icon: UserCheck },
    { id: "ai", label: "AI Insights", icon: Lightbulb },
  ];

  const [activeTab, setActiveTab] = useState(allTabs[0].id);
  const [dateFilter, setDateFilter] = useState("Monthly");
  const [classFilter, setClassFilter] = useState("All Classes");
  const [studentFilter, setStudentFilter] = useState("All Students");

  const exportPDF = () => alert("Exporting PDF Report...");
  const exportCSV = () => alert("Exporting CSV Data...");

  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-4 max-w-lg">
        <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-foreground">Analytics Unavailable</h3>
        <p className="text-muted-foreground text-sm">
          Not enough data has been collected yet. As users interact with the platform, comprehensive real-time analytics and insights will appear here.
        </p>
      </div>
    </div>
  );
}
