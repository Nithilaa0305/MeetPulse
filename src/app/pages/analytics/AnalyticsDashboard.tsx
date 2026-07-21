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
    <div className="w-full h-full flex flex-col space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/60 backdrop-blur-xl border border-border p-5 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Platform Analytics
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Comprehensive insights and performance metrics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Class Filter */}
          <div className="flex items-center bg-input/50 border border-border rounded-xl p-1">
            <Users className="w-4 h-4 text-muted-foreground mx-2" />
            <select 
              className="bg-transparent text-xs font-medium text-foreground outline-none py-1.5 pr-2 cursor-pointer"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
            >
              <option>All Classes</option>
              <option>CS101 Deep Learning</option>
              <option>CS202 Data Structures</option>
              <option>CS303 Web Development</option>
            </select>
          </div>

          {/* Student Filter */}
          <div className="flex items-center bg-input/50 border border-border rounded-xl p-1">
            <UserCheck className="w-4 h-4 text-muted-foreground mx-2" />
            <select 
              className="bg-transparent text-xs font-medium text-foreground outline-none py-1.5 pr-2 cursor-pointer"
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
            >
              <option>All Students</option>
              <option>John Smith</option>
              <option>Emma Johnson</option>
              <option>Michael Brown</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center bg-input/50 border border-border rounded-xl p-1">
            <Filter className="w-4 h-4 text-muted-foreground mx-2" />
            <select 
              className="bg-transparent text-xs font-medium text-foreground outline-none py-1.5 pr-2 cursor-pointer"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option>Today</option>
              <option>Weekly</option>
              <option>Monthly</option>
              <option>This Quarter</option>
              <option>All Time</option>
            </select>
          </div>

          <button onClick={exportCSV} className="flex items-center gap-2 bg-card hover:bg-muted border border-border text-foreground px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm">
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
          
          <button onClick={exportPDF} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md">
            <Download className="w-3.5 h-3.5" />
            PDF Report
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-card/60 backdrop-blur-xl border border-border rounded-2xl p-2 shadow-sm overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-1 min-w-max">
          {allTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 relative ${
                  isActive 
                    ? "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
                {tab.label}
                {isActive && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 border border-indigo-200 dark:border-indigo-500/30 rounded-xl pointer-events-none"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 bg-card/40 backdrop-blur-md border border-border rounded-3xl p-6 shadow-sm min-h-[500px] relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === "organization" && <OrganizationAnalyticsTab dateFilter={dateFilter} />}
            {activeTab === "meeting" && <MeetingPerformanceTab dateFilter={dateFilter} />}
            {activeTab === "attendance" && <AttendanceTab dateFilter={dateFilter} />}
            {activeTab === "engagement" && <EngagementTab dateFilter={dateFilter} />}
            {activeTab === "understanding" && <UnderstandingTab dateFilter={dateFilter} />}
            {activeTab === "slides" && <SlideAnalyticsTab dateFilter={dateFilter} />}
            {activeTab === "polls" && <PollAnalyticsTab dateFilter={dateFilter} />}
            {activeTab === "questions" && <QuestionAnalyticsTab dateFilter={dateFilter} />}
            {activeTab === "presenter" && <PresenterAnalyticsTab dateFilter={dateFilter} />}
            {activeTab === "ai" && <AIInsightsTab dateFilter={dateFilter} />}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
