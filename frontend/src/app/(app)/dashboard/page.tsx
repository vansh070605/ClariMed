/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboardMetrics } from '@/services/dashboard';
import { getReportsList } from '@/services/reports';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, AlertTriangle, TrendingUp, ArrowRight, HeartPulse, UploadCloud } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/features/auth/AuthProvider';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: getDashboardMetrics
  });

  const { data: recentReports, isLoading: reportsLoading } = useQuery({
    queryKey: ['recentReports'],
    queryFn: () => getReportsList(0, 5) // fetch only top 5
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
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-blue-600 px-8 py-10 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back{user?.email ? `, ${user.email.split('@')[0]}` : ''}</h1>
          <p className="mt-4 text-blue-100 text-lg">
            Track, analyze and understand your health reports with evidence-backed clinical intelligence.
          </p>
          <Button 
            variant="secondary" 
            className="mt-6 font-semibold shadow-sm"
            onClick={() => router.push('/reports/upload')}
          >
            <UploadCloud className="mr-2 h-4 w-4" /> Upload New Report
          </Button>
        </div>
        {/* Subtle Healthcare Visual Background */}
        <div className="absolute right-0 top-0 -mr-20 -mt-20 opacity-10 pointer-events-none">
          <HeartPulse className="h-96 w-96" />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        
        <Card className="rounded-[24px] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <HeartPulse className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <Badge variant="outline" className="bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900">
                Beta
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Health Score</p>
              <h3 className="text-3xl font-bold mt-1 text-gray-900 dark:text-zinc-50">84</h3>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Total Reports</p>
              <h3 className="text-3xl font-bold mt-1 text-gray-900 dark:text-zinc-50">
                {metricsLoading ? '-' : metrics?.total_reports || 0}
              </h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2 font-medium">
              Uploaded and processed
            </p>
          </CardContent>
        </Card>
        
        <Card className="rounded-[24px] shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Abnormal Findings</p>
              <h3 className="text-3xl font-bold mt-1 text-red-600 dark:text-red-400">
                {metricsLoading ? '-' : metrics?.abnormal_findings || 0}
              </h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2 font-medium">
              In your most recent tests
            </p>
          </CardContent>
        </Card>
        
        <Card className="rounded-[24px] shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Improving Trends</p>
              <h3 className="text-3xl font-bold mt-1 text-green-600 dark:text-green-400">
                {metricsLoading ? '-' : metrics?.improving_trends || 0}
              </h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2 font-medium">
              Biomarkers moving in optimal direction
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="rounded-[24px] shadow-sm overflow-hidden border-0 ring-1 ring-gray-200 dark:ring-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between bg-gray-50/50 dark:bg-zinc-900/50 px-6 py-5 border-b dark:border-zinc-800">
            <div>
              <CardTitle className="text-xl">Recent Reports</CardTitle>
              <CardDescription className="mt-1">Your latest uploaded medical documents.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push('/reports')} className="rounded-full">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {reportsLoading ? (
              <div className="text-sm text-gray-500 p-8 text-center">Loading recent reports...</div>
            ) : (!recentReports || recentReports.length === 0) ? (
              <div className="text-center py-16 px-6">
                <div className="mx-auto w-24 h-24 bg-blue-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-10 w-10 text-blue-500 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">No reports uploaded yet</h3>
                <p className="text-gray-500 dark:text-zinc-400 mt-2 max-w-sm mx-auto">
                  Start tracking your health journey by uploading your first lab report or medical document.
                </p>
                <Button className="mt-6 rounded-full" size="lg" onClick={() => router.push('/reports/upload')}>
                  <UploadCloud className="mr-2 h-5 w-5" /> Upload First Report
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-50/50 dark:bg-zinc-900/30">
                  <TableRow className="border-b-gray-200 dark:border-b-zinc-800 hover:bg-transparent">
                    <TableHead className="px-6 h-12">Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Pages</TableHead>
                    <TableHead className="text-right px-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentReports.map((report) => (
                    <TableRow key={report.id} className="group cursor-pointer hover:bg-blue-50/50 dark:hover:bg-zinc-800/50 transition-colors" onClick={() => router.push(`/reports/${report.id}`)}>
                      <TableCell className="font-medium px-6 py-4">
                        {new Date(report.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`uppercase text-xs tracking-wider ${
                            report.status === 'analyzed' 
                              ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900' 
                              : ''
                          }`}
                        >
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500 dark:text-zinc-400">{report.file_size ? `${(report.file_size / 1024).toFixed(1)} KB` : '-'}</TableCell>
                      <TableCell className="text-gray-500 dark:text-zinc-400">{report.page_count || '-'}</TableCell>
                      <TableCell className="text-right px-6">
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          View Details <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
