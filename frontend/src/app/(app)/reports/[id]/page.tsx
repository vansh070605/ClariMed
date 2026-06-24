/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getReportDetails } from '@/services/reports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, Database, Activity, Beaker, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';
import { motion } from 'framer-motion';

export default function ReportDetailsPage() {
  const params = useParams();
  const reportId = params.id as string;
  const { user } = useAuth(); // Ensure auth checks

  const { data: report, isLoading, error } = useQuery({
    queryKey: ['report', reportId],
    queryFn: () => getReportDetails(reportId),
    enabled: !!reportId && !!user,
  });

  if (isLoading) {
    return <div className="min-h-[50vh] flex items-center justify-center text-gray-500">Loading clinical intelligence...</div>;
  }

  if (error || !report) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-50">Report Unavailable</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-sm">The requested medical report could not be found or you lack permission to view it.</p>
      </div>
    );
  }

  const getSeverityBadge = (severity: string | null, abnormal: boolean | null) => {
    if (!severity && !abnormal) return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900">NORMAL</Badge>;
    if (!severity && abnormal) return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900">ABNORMAL</Badge>;
    
    switch (severity?.toUpperCase()) {
      case 'NORMAL': 
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900"><CheckCircle2 className="w-3 h-3 mr-1" /> NORMAL</Badge>;
      case 'MILD': 
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900"><Info className="w-3 h-3 mr-1" /> MILD</Badge>;
      case 'MODERATE': 
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900"><AlertTriangle className="w-3 h-3 mr-1" /> MODERATE</Badge>;
      case 'SEVERE': 
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900"><AlertTriangle className="w-3 h-3 mr-1" /> SEVERE</Badge>;
      default: 
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as any, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="max-w-6xl mx-auto space-y-8 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-50">Report Intelligence</h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-2">Comprehensive clinical analysis and biomarker extraction.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1 bg-white dark:bg-zinc-900 text-sm font-medium">
            <Calendar className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
            {new Date(report.created_at).toLocaleDateString()}
          </Badge>
          <Badge variant="outline" className="px-3 py-1 bg-white dark:bg-zinc-900 text-sm font-medium">
            <Activity className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
            {report.status.toUpperCase()}
          </Badge>
        </div>
      </motion.div>

      {/* 1. Overview Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-[24px] shadow-sm border-0 ring-1 ring-gray-200 dark:ring-zinc-800 bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-950">
          <CardContent className="p-6">
            <Calendar className="h-5 w-5 text-gray-400 dark:text-zinc-500 mb-4" />
            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Processed On</p>
            <p className="text-lg font-bold text-gray-900 dark:text-zinc-50 mt-1">{new Date(report.created_at).toLocaleDateString()}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[24px] shadow-sm border-0 ring-1 ring-gray-200 dark:ring-zinc-800 bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-950">
          <CardContent className="p-6">
            <Activity className="h-5 w-5 text-gray-400 dark:text-zinc-500 mb-4" />
            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Analysis Status</p>
            <p className="text-lg font-bold text-gray-900 dark:text-zinc-50 mt-1 capitalize">{report.status}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[24px] shadow-sm border-0 ring-1 ring-gray-200 dark:ring-zinc-800 bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-950">
          <CardContent className="p-6">
            <FileText className="h-5 w-5 text-gray-400 dark:text-zinc-500 mb-4" />
            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Document Length</p>
            <p className="text-lg font-bold text-gray-900 dark:text-zinc-50 mt-1">{report.page_count || 1} Pages</p>
          </CardContent>
        </Card>
        <Card className="rounded-[24px] shadow-sm border-0 ring-1 ring-gray-200 dark:ring-zinc-800 bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-950">
          <CardContent className="p-6">
            <Database className="h-5 w-5 text-gray-400 dark:text-zinc-500 mb-4" />
            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">File Size</p>
            <p className="text-lg font-bold text-gray-900 dark:text-zinc-50 mt-1">{report.file_size ? `${(report.file_size / 1024).toFixed(1)} KB` : 'N/A'}</p>
          </CardContent>
        </Card>
      </motion.div>

      {report.patient_summary && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* 2. Clinical Summary */}
          <motion.div variants={itemVariants} className="md:col-span-2">
            <Card className="rounded-[24px] shadow-sm border-0 ring-1 ring-blue-100 dark:ring-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 h-full">
              <CardHeader className="pb-4 border-b border-blue-100 dark:border-blue-900/30">
                <CardTitle className="text-xl text-blue-900 dark:text-blue-100 flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Clinical Summary
                </CardTitle>
                <CardDescription className="text-blue-700/70 dark:text-blue-300/70">AI-generated evidence-based interpretation</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-blue-900/60 dark:text-blue-300/60 uppercase tracking-wider mb-2">Overall Assessment</h3>
                  <p className="text-gray-800 dark:text-zinc-200 leading-relaxed">{report.patient_summary.overall_assessment}</p>
                </div>
                
                {report.patient_summary.follow_up_considerations?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900/60 dark:text-blue-300/60 uppercase tracking-wider mb-3">Clinical Next Steps</h3>
                    <ul className="space-y-3">
                      {report.patient_summary.follow_up_considerations.map((consideration: string, i: number) => (
                        <li key={i} className="flex items-start">
                          <div className="min-w-6 mt-0.5">
                            <CheckCircle2 className="h-5 w-5 text-blue-500" />
                          </div>
                          <span className="text-gray-700 dark:text-zinc-300">{consideration}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="bg-white/60 dark:bg-black/20 p-4 rounded-2xl text-xs text-gray-500 dark:text-zinc-500 mt-6 flex items-start">
                  <Info className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                  <span><strong>Disclaimer:</strong> {report.patient_summary.disclaimer}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 3. Key Findings */}
          <motion.div variants={itemVariants} className="md:col-span-1">
            <Card className="rounded-[24px] shadow-sm border-0 ring-1 ring-gray-200 dark:ring-zinc-800 h-full">
              <CardHeader className="pb-4 border-b border-gray-100 dark:border-zinc-800/50">
                <CardTitle className="text-xl flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                  Key Findings
                </CardTitle>
                <CardDescription>Primary abnormal indicators</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {report.patient_summary.key_findings?.length > 0 ? (
                  <div className="space-y-4">
                    {report.patient_summary.key_findings.map((finding: any, i: number) => (
                      <div key={i} className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-zinc-100 capitalize">
                            {finding.title || finding.evidence?.biomarker || finding.biomarker || 'Unknown Biomarker'}
                          </h4>
                          {(finding.evidence?.value || finding.value) && (
                            <Badge variant="outline" className="bg-white dark:bg-black text-orange-700 dark:text-orange-400">
                              {finding.evidence?.value || finding.value} {finding.evidence?.unit || finding.unit || ''}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed break-words">
                          {finding.explanation || finding.finding_summary || finding.summary || JSON.stringify(finding)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl">
                    <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                    <p className="text-gray-600 dark:text-zinc-400 font-medium">No critical abnormal findings</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* 4. Measurements Table */}
      <motion.div variants={itemVariants}>
        <Card className="rounded-[24px] shadow-sm border-0 ring-1 ring-gray-200 dark:ring-zinc-800 overflow-hidden">
          <CardHeader className="bg-gray-50/50 dark:bg-zinc-900/50 px-6 py-5 border-b dark:border-zinc-800">
            <CardTitle className="flex items-center text-xl">
              <Beaker className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
              Extracted Biomarkers
            </CardTitle>
            <CardDescription>Comprehensive list of all structured data extracted from the report</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {report.measurements.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No measurements could be extracted from this report.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50/80 dark:bg-zinc-900/80">
                    <TableRow className="border-b-gray-200 dark:border-b-zinc-800">
                      <TableHead className="px-6 h-12">Biomarker</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Severity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.measurements.map((m) => (
                      <TableRow key={m.id} className="border-b-gray-100 dark:border-b-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-900/50">
                        <TableCell className="font-semibold text-gray-900 dark:text-zinc-100 px-6 py-4 capitalize">{m.biomarker_name}</TableCell>
                        <TableCell className="text-gray-500 dark:text-zinc-400 capitalize">{m.category || '-'}</TableCell>
                        <TableCell className="text-right font-medium text-gray-900 dark:text-zinc-100">{m.value}</TableCell>
                        <TableCell className="text-gray-500 dark:text-zinc-400">{m.unit || '-'}</TableCell>
                        <TableCell className="text-gray-500 dark:text-zinc-400 text-sm">
                          {m.reference_low !== null && m.reference_high !== null 
                            ? `${m.reference_low} - ${m.reference_high}` 
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {getSeverityBadge(m.severity, m.abnormal_flag)}
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
