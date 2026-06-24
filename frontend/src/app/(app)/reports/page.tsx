'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReportsList, deleteReport } from '@/services/reports';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText, Trash2, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

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
      setDeleteConfirm(null);
    }
  });

  if (isLoading) return <div className="p-8 text-gray-500">Loading reports history...</div>;
  if (error) return <div className="p-8 text-red-500">Failed to load reports.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports History</h1>
          <p className="text-gray-500 text-sm">View and manage your uploaded clinical reports</p>
        </div>
        <Button onClick={() => router.push('/reports/upload')}>Upload New</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {!reports || reports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No reports found</h3>
              <p className="mt-1 text-sm text-gray-500">You haven&apos;t uploaded any medical reports yet.</p>
              <div className="mt-6">
                <Button onClick={() => router.push('/reports/upload')}>Upload Report</Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Pages</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
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
                      {deleteConfirm === report.id ? (
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => deleteMutation.mutate(report.id)}
                            disabled={deleteMutation.isPending}
                          >
                            Confirm
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/reports/${report.id}`)}>
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => setDeleteConfirm(report.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
