'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboardMetrics } from '@/services/dashboard';
import { getReportsList } from '@/services/reports';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, AlertTriangle, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: getDashboardMetrics
  });

  const { data: recentReports, isLoading: reportsLoading } = useQuery({
    queryKey: ['recentReports'],
    queryFn: () => getReportsList(0, 5) // fetch only top 5
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome back. Here is the latest intelligence from your clinical reports.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '-' : metrics?.total_reports || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Uploaded and processed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abnormal Findings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metricsLoading ? '-' : metrics?.abnormal_findings || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">In your most recent tests</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improving Trends</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metricsLoading ? '-' : metrics?.improving_trends || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Biomarkers moving in optimal direction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Upload</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {metricsLoading || !metrics?.latest_upload 
                ? '-' 
                : new Date(metrics.latest_upload).toLocaleDateString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Most recent analysis</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Your latest uploaded medical documents.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push('/reports')}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {reportsLoading ? (
              <div className="text-sm text-gray-500">Loading recent reports...</div>
            ) : (!recentReports || recentReports.length === 0) ? (
              <div className="text-center py-6 text-gray-500 border rounded-md border-dashed">
                <p>No reports uploaded yet.</p>
                <Button className="mt-4" onClick={() => router.push('/reports/upload')}>Upload Now</Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Pages</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        {new Date(report.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase">{report.status}</Badge>
                      </TableCell>
                      <TableCell>{report.file_size ? `${(report.file_size / 1024).toFixed(1)} KB` : '-'}</TableCell>
                      <TableCell>{report.page_count || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/reports/${report.id}`)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
