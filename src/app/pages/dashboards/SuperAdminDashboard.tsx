import React, { useState, useEffect } from "react";
import { Building, TrendingUp, Radio, Activity } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { StatCard } from "../../components/common/CommonUI";
import { supabase } from "../../../lib/supabase";

const SAAS_GROWTH_DATA = [
  { month: "Jan", orgs: 320 },
  { month: "Feb", orgs: 340 },
  { month: "Mar", orgs: 370 },
  { month: "Apr", orgs: 410 },
  { month: "May", orgs: 460 },
  { month: "Jun", orgs: 510 },
];

const ORG_TYPE_COLORS: Record<string, string> = {
  education: "#6366F1",
  business: "#22D3EE",
  unknown: "#8B5CF6",
};

interface OrgRow {
  id: string;
  name: string;
  org_type: string;
  domain?: string;
  created_at: string;
}

export function SuperAdminDashboard({ activeTab }: { activeTab: string }) {
  const [organizations, setOrganizations] = useState<OrgRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("organizations")
          .select("id, name, org_type, domain, created_at")
          .order("created_at", { ascending: false });

        if (!error && data) {
          setOrganizations(data as OrgRow[]);
        }
      } catch (e) {
        console.error("Failed to fetch organizations:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrgs();
  }, []);

  // Derived stats from real org data
  const totalOrgs = organizations.length;
  const eduOrgs = organizations.filter(o => o.org_type === "education").length;
  const bizOrgs = organizations.filter(o => o.org_type === "business").length;
  const unknownOrgs = totalOrgs - eduOrgs - bizOrgs;

  const orgTypeData = [
    { name: "Education Orgs", value: eduOrgs, color: ORG_TYPE_COLORS.education },
    { name: "Business Orgs", value: bizOrgs, color: ORG_TYPE_COLORS.business },
    ...(unknownOrgs > 0 ? [{ name: "Other", value: unknownOrgs, color: ORG_TYPE_COLORS.unknown }] : []),
  ].filter(d => d.value > 0);

  if (activeTab === "overview") {
    return (
      <div className="space-y-6">
        {/* Cards — org count is real; revenue/API are platform-level demo metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Organizations"
            value={isLoading ? "…" : totalOrgs > 0 ? totalOrgs.toString() : "0"}
            change={isLoading ? "Loading…" : "From database"}
            icon={Building}
            gradient="from-indigo-500 to-purple-500"
          />
          <StatCard label="Monthly Recurring Revenue" value="N/A" change="Platform metric" icon={TrendingUp} gradient="from-emerald-500 to-teal-500" />
          <StatCard label="Active Live Sessions" value="N/A" change="Platform metric" icon={Radio} gradient="from-rose-500 to-pink-500" />
          <StatCard label="API Server Load" value="N/A" change="Platform metric" icon={Activity} gradient="from-cyan-500 to-blue-500" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Platform growth chart — illustrative trend */}
          <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6">
            <h3 className="font-bold text-sm mb-1">SaaS Platform Growth</h3>
            <p className="text-[10px] text-muted-foreground mb-4">Illustrative trend — connect a analytics service for real traffic data.</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SAAS_GROWTH_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="orgs" name="Org Target" stroke="#6366F1" fill="rgba(99,102,241,0.2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Org type pie — from real data */}
          <div className="bg-card border border-border rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm mb-4">Organization Types</h3>
              {!isLoading && orgTypeData.length > 0 ? (
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={orgTypeData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                        {orgTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-44 flex items-center justify-center text-xs text-muted-foreground">
                  {isLoading ? "Loading…" : "No organizations yet"}
                </div>
              )}
            </div>
            <div className="space-y-2">
              {orgTypeData.map(item => (
                <div key={item.name} className="flex justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-bold text-foreground">{item.value}</span>
                </div>
              ))}
              {!isLoading && orgTypeData.length === 0 && (
                <p className="text-xs text-muted-foreground text-center">No data</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "organizations") {
    return (
      <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm">Active Organizations Directory</h3>
          <span className="text-[10px] text-muted-foreground">{isLoading ? "Loading…" : `${totalOrgs} total`}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-3">Organisation Name</th>
                <th className="pb-3">Domain</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Created</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">Loading organizations…</td>
                </tr>
              )}
              {!isLoading && organizations.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No organizations found. Organizations are created when users sign up.
                  </td>
                </tr>
              )}
              {!isLoading && organizations.map(org => (
                <tr key={org.id}>
                  <td className="py-3 font-semibold">{org.name || "—"}</td>
                  <td className="py-3 text-muted-foreground">{org.domain || "—"}</td>
                  <td className="py-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                      style={{
                        backgroundColor: `${ORG_TYPE_COLORS[org.org_type] || ORG_TYPE_COLORS.unknown}20`,
                        color: ORG_TYPE_COLORS[org.org_type] || ORG_TYPE_COLORS.unknown,
                        borderColor: `${ORG_TYPE_COLORS[org.org_type] || ORG_TYPE_COLORS.unknown}40`,
                      }}
                    >
                      {org.org_type || "unknown"}
                    </span>
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {org.created_at ? new Date(org.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-3">
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 text-[10px]">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 text-center text-muted-foreground border border-border rounded-3xl bg-card">
      <h3 className="font-bold text-base text-foreground mb-1">SaaS Management — {activeTab}</h3>
      <p className="text-xs">Sub-system portal active.</p>
    </div>
  );
}
