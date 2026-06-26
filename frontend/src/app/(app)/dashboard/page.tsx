/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboardMetrics } from '@/services/dashboard';
import { getReportsList } from '@/services/reports';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/features/auth/AuthProvider';
import { ShareWithDoctorModal } from '@/components/ShareWithDoctorModal';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  FileText,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  HeartPulse,
  UploadCloud,
  Activity
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [chartMounted, setChartMounted] = useState(false);

  useEffect(() => {
    setChartMounted(true);
  }, []);

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: getDashboardMetrics
  });

  const { data: recentReports, isLoading: reportsLoading } = useQuery({
    queryKey: ['recentReports'],
    queryFn: () => getReportsList(0, 5) // fetch top 5
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as any, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Overview Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-headline-lg text-on-surface">Welcome Back{user?.name ? `, ${user.name}` : ''}</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Track, analyze and understand your health reports with clinical intelligence.</p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <ShareWithDoctorModal>
            <Button variant="outline" className="rounded-full px-5 py-2.5 font-semibold text-label-md border-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-sm cursor-pointer text-on-surface">
              Share Profile
            </Button>
          </ShareWithDoctorModal>
          <Button
            onClick={() => router.push('/reports/upload')}
            className="bg-primary text-on-primary hover:opacity-90 rounded-full px-5 py-2.5 font-semibold text-label-md flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
          >
            <UploadCloud className="h-4 w-4" />
            Upload Report
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Health Score */}
        <div className="bg-card rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-border hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary-container/50 text-secondary flex items-center justify-center">
              <HeartPulse className="h-6 w-6 text-primary dark:text-primary-fixed-dim" />
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-low dark:bg-surface-variant/10 text-primary dark:text-primary-fixed-dim text-label-sm">
              <TrendingUp className="h-3 w-3 text-primary dark:text-primary-fixed-dim" />
              +2
            </span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant mb-1">Health Score</p>
            <h3 className="text-headline-md text-on-surface">84</h3>
          </div>
        </div>

        {/* Card 2: Total Reports */}
        <div className="bg-card rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-border hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 flex items-center justify-center">
              <FileText className="h-6 w-6 text-emerald-600" />
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-low dark:bg-surface-variant/10 text-primary dark:text-primary-fixed-dim text-label-sm">
              Processed
            </span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant mb-1">Total Reports</p>
            <h3 className="text-headline-md text-on-surface">
              {metricsLoading ? '-' : metrics?.total_reports || 0}
            </h3>
          </div>
        </div>

        {/* Card 3: Abnormal Findings */}
        <div className="bg-card rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-border hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-600 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            {metrics && (metrics.abnormal_findings ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-container/30 text-error text-label-sm">
                Attention Required
              </span>
            )}
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant mb-1">Abnormal Findings</p>
            <h3 className={`text-headline-md font-bold ${(metrics?.abnormal_findings ?? 0) > 0 ? 'text-red-600' : 'text-on-surface'}`}>
              {metricsLoading ? '-' : metrics?.abnormal_findings || 0}
            </h3>
          </div>
        </div>

        {/* Card 4: Improving Trends */}
        <div className="bg-card rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-border hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-low dark:bg-surface-variant/10 text-primary dark:text-primary-fixed-dim text-label-sm">
              Optimal
            </span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant mb-1">Improving Trends</p>
            <h3 className="text-headline-md text-on-surface">
              {metricsLoading ? '-' : metrics?.improving_trends || 0}
            </h3>
          </div>
        </div>
      </motion.div>

      {/* Middle Row: Recharts Area Chart */}
      <motion.div variants={itemVariants} className="bg-card rounded-3xl p-8 shadow-soft border border-slate-100 dark:border-border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-title-lg text-on-surface">Clinical Analytics</h3>
            <p className="text-body-sm text-on-surface-variant mt-1">Biomarker tracking and report activity trends</p>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-label-sm text-on-surface-variant">Processed Reports</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-tertiary-fixed-dim"></div>
              <span className="text-label-sm text-on-surface-variant">Abnormal Biomarkers</span>
            </div>
          </div>
        </div>
        <div className="h-64 w-full relative mt-4">
          {chartMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { name: 'Week 1', processed: 2, abnormal: 0 },
                  { name: 'Week 2', processed: 4, abnormal: 1 },
                  { name: 'Week 3', processed: 3, abnormal: 1 },
                  { name: 'Week 4', processed: metrics?.total_reports || 5, abnormal: metrics?.abnormal_findings || 0 },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorProcessed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAbnormal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--tertiary-fixed-dim)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--tertiary-fixed-dim)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--on-surface-variant)', fontSize: 11, fontWeight: 500 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--on-surface-variant)', fontSize: 11, fontWeight: 500 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    borderColor: 'var(--border)',
                    borderRadius: '16px',
                    color: 'var(--on-surface)',
                    fontSize: '12px',
                    boxShadow: 'var(--shadow-soft)'
                  }}
                  itemStyle={{ color: 'var(--on-surface)' }}
                  labelStyle={{ fontWeight: 'bold', color: 'var(--on-surface)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="processed" 
                  stroke="var(--primary)" 
                  fillOpacity={1} 
                  fill="url(#colorProcessed)" 
                  strokeWidth={3}
                  name="Processed Reports"
                />
                <Area 
                  type="monotone" 
                  dataKey="abnormal" 
                  stroke="var(--tertiary-fixed-dim)" 
                  fillOpacity={1} 
                  fill="url(#colorAbnormal)" 
                  strokeWidth={3}
                  name="Abnormal Biomarkers"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full bg-slate-100/50 dark:bg-zinc-800/20 rounded-2xl animate-pulse" />
          )}
        </div>
      </motion.div>

      {/* Bottom Row: Recent Reports Table */}
      <motion.div variants={itemVariants} className="bg-card rounded-3xl shadow-soft border border-slate-100 dark:border-border overflow-hidden">
        <div className="p-6 border-b border-slate-50 dark:border-border/30 flex justify-between items-center bg-card">
          <h3 className="text-title-lg text-on-surface">Recent Reports</h3>
          <Button variant="ghost" size="sm" onClick={() => router.push('/reports')} className="text-primary hover:underline hover:bg-transparent rounded-full px-4 cursor-pointer font-semibold">
            View All
          </Button>
        </div>
        <div className="w-full overflow-x-auto">
          {reportsLoading ? (
            <div className="text-sm text-on-surface-variant p-8 text-center bg-card">Loading recent reports...</div>
          ) : (!recentReports || recentReports.length === 0) ? (
            <div className="text-center py-16 px-6 bg-card">
              <div className="mx-auto w-20 h-20 bg-primary-container/10 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-on-surface">No reports uploaded yet</h3>
              <p className="text-on-surface-variant mt-2 max-w-sm mx-auto text-body-sm">
                Start tracking your health journey by uploading your first lab report.
              </p>
              <Button className="mt-6 rounded-full px-6 py-2.5 font-semibold bg-primary text-on-primary cursor-pointer" onClick={() => router.push('/reports/upload')}>
                <UploadCloud className="mr-2 h-5 w-5" /> Upload First Report
              </Button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse bg-card">
              <thead>
                <tr className="text-label-sm text-on-surface-variant bg-slate-50/50 dark:bg-[#1b1b24]/40">
                  <th className="px-6 py-4 font-medium border-b border-slate-100 dark:border-border/30">Report Info</th>
                  <th className="px-6 py-4 font-medium border-b border-slate-100 dark:border-border/30">Category</th>
                  <th className="px-6 py-4 font-medium border-b border-slate-100 dark:border-border/30">Status</th>
                  <th className="px-6 py-4 font-medium border-b border-slate-100 dark:border-border/30">File Details</th>
                  <th className="px-6 py-4 font-medium text-right border-b border-slate-100 dark:border-border/30">Actions</th>
                </tr>
              </thead>
              <tbody className="text-body-sm">
                {recentReports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-slate-50 dark:border-border/30 hover:bg-slate-50/50 dark:hover:bg-[#1b1b24]/20 transition-colors group cursor-pointer"
                    onClick={() => router.push(`/reports/${report.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-container/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-on-surface">
                            {new Date(report.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-xs text-on-surface-variant">ID: #{report.id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      Clinical Lab Report
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                        report.status === 'analyzed'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {report.page_count || 1} pages ({report.file_size ? `${(report.file_size / 1024).toFixed(1)} KB` : 'N/A'})
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-slate-100 dark:hover:bg-[#1b1b24] rounded-full transition-colors opacity-0 group-hover:opacity-100 cursor-pointer">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
