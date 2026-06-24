/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReportsList, deleteReport } from '@/services/reports';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText, Trash2, Eye, UploadCloud, Calendar, Database } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function ReportsHistoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['reportsList'],
    queryFn: () => getReportsList(0, 100)
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportsList'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['recentReports'] });
      queryClient.invalidateQueries({ queryKey: ['trendsData'] });
      setDeleteConfirm(null);
    }
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as any, stiffness: 300, damping: 24 } }
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-[50vh] text-gray-500">Loading reports history...</div>;
  
  if (error) return (
    <div className="flex justify-center items-center min-h-[50vh] text-red-500 flex-col">
      <FileText className="h-10 w-10 mb-4 opacity-50" />
      <p>Failed to load reports. Please try again.</p>
    </div>
  );

  return (
    <motion.div 
      className="max-w-6xl mx-auto space-y-8 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">Reports History</h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-2">Manage your uploaded clinical documents and lab results.</p>
        </div>
        <Button onClick={() => router.push('/reports/upload')} className="shadow-sm rounded-full px-6">
          <UploadCloud className="mr-2 h-4 w-4" /> Upload New Report
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="rounded-[32px] shadow-sm border-0 ring-1 ring-gray-200 dark:ring-zinc-800 overflow-hidden">
          <CardHeader className="bg-gray-50/50 dark:bg-zinc-900/50 px-8 py-6 border-b dark:border-zinc-800">
            <CardTitle className="text-xl">Document Archive</CardTitle>
            <CardDescription className="mt-1">All processed reports and intelligence data</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {!reports || reports.length === 0 ? (
              <div className="text-center py-20 px-6">
                <div className="mx-auto w-24 h-24 bg-blue-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-6">
                  <FileText className="h-10 w-10 text-blue-500 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">No reports found</h3>
                <p className="mt-2 text-gray-500 dark:text-zinc-400 max-w-sm mx-auto">Upload your first clinical report to begin tracking your health history and biomarker trends.</p>
                <Button className="mt-8 rounded-full shadow-sm" size="lg" onClick={() => router.push('/reports/upload')}>
                  <UploadCloud className="mr-2 h-5 w-5" /> Start Uploading
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50/80 dark:bg-zinc-900/80">
                    <TableRow className="border-b-gray-200 dark:border-b-zinc-800">
                      <TableHead className="px-8 h-12">Upload Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Pages</TableHead>
                      <TableHead className="text-right px-8">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id} className="border-b-gray-100 dark:border-b-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors group">
                        <TableCell className="font-medium px-8 py-5">
                          <div className="flex items-center text-gray-900 dark:text-zinc-100">
                            <Calendar className="h-4 w-4 mr-3 text-gray-400 dark:text-zinc-500" />
                            {new Date(report.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`uppercase text-xs tracking-wider ${
                              report.status === 'analyzed' 
                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900' 
                                : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                            }`}
                          >
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-500 dark:text-zinc-400">
                          <div className="flex items-center">
                            <Database className="h-3 w-3 mr-2 opacity-50" />
                            {report.file_size ? `${(report.file_size / 1024).toFixed(1)} KB` : '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-500 dark:text-zinc-400">{report.page_count || '-'}</TableCell>
                        <TableCell className="text-right px-8">
                          {deleteConfirm === report.id ? (
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => deleteMutation.mutate(report.id)}
                                disabled={deleteMutation.isPending}
                                className="rounded-full shadow-sm"
                              >
                                {deleteMutation.isPending ? 'Deleting...' : 'Confirm'}
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)} className="rounded-full dark:border-zinc-700 dark:hover:bg-zinc-800">
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => router.push(`/reports/${report.id}`)} className="rounded-full text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                <Eye className="h-4 w-4 mr-2" /> View
                              </Button>
                              <Button variant="ghost" size="sm" className="rounded-full text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100" onClick={() => setDeleteConfirm(report.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
