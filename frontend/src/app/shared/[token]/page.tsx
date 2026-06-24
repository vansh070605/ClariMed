'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getSharedData, SharedDataResponse } from '@/services/share';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, User, Activity, Calendar } from 'lucide-react';

export default function SharedClinicalPortal() {
  const params = useParams();
  const token = params.token as string;
  
  const [data, setData] = useState<SharedDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSharedData(token)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center text-gray-500">Loading Clinical Data...</div>;
  }

  if (error || !data) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-50">Link Invalid or Expired</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-sm">{error || "This secure medical link is no longer active."}</p>
      </div>
    );
  }

  const getSeverityBadge = (severity: string | null, abnormal: boolean | null) => {
    if (!severity && !abnormal) return <Badge variant="outline" className="bg-green-50 text-green-700">NORMAL</Badge>;
    if (!severity && abnormal) return <Badge variant="outline" className="bg-orange-50 text-orange-700">ABNORMAL</Badge>;
    
    switch (severity?.toUpperCase()) {
      case 'NORMAL': return <Badge variant="outline" className="bg-green-50 text-green-700">NORMAL</Badge>;
      case 'MILD': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">MILD</Badge>;
      case 'MODERATE': return <Badge variant="outline" className="bg-orange-50 text-orange-700 font-bold">MODERATE</Badge>;
      case 'SEVERE': return <Badge variant="outline" className="bg-red-50 text-red-700 font-bold border-red-300">SEVERE</Badge>;
      default: return <Badge variant="outline">{severity}</Badge>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 space-y-8">
      <div className="flex items-center justify-between border-b pb-6 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-50 flex items-center">
            <User className="mr-3 h-8 w-8 text-blue-600" />
            Patient: {data.patient_name}
          </h1>
          <p className="text-gray-500 mt-2 flex items-center">
            <Activity className="h-4 w-4 mr-1" /> Longitudinal Clinical Summary
          </p>
        </div>
      </div>

      {data.reports.map((report) => (
        <Card key={report.id} className="border-0 ring-1 ring-gray-200 dark:ring-zinc-800 p-0 gap-0 mb-8">
          <CardHeader className="bg-gray-50/50 dark:bg-zinc-900/50 px-6 py-5 border-b dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-gray-500" />
                  Report: {new Date(report.created_at).toLocaleDateString()}
                </CardTitle>
              </div>
              <Badge variant="outline" className="bg-white dark:bg-black font-mono">
                {report.measurements.filter(m => m.abnormal_flag).length} Abnormal Findings
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {report.measurements.length === 0 ? (
              <div className="p-6 text-gray-500">No structured biomarkers extracted for this report.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6 h-12">Biomarker</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Reference Range</TableHead>
                    <TableHead>Clinical Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.measurements.map((m) => (
                    <TableRow key={m.id} className={m.abnormal_flag ? "bg-red-50/30 dark:bg-red-900/10" : ""}>
                      <TableCell className="font-semibold text-gray-900 dark:text-zinc-100 px-6 py-3 capitalize">{m.biomarker_name}</TableCell>
                      <TableCell className="text-right font-mono font-medium">{m.value}</TableCell>
                      <TableCell className="text-gray-500 dark:text-zinc-400">{m.unit || '-'}</TableCell>
                      <TableCell className="text-gray-500 dark:text-zinc-400 text-sm font-mono">
                        {m.reference_low !== null && m.reference_high !== null 
                          ? `[${m.reference_low} - ${m.reference_high}]` 
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {getSeverityBadge(m.severity, m.abnormal_flag)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ))}

      {data.reports.length === 0 && (
        <div className="text-center py-12 text-gray-500">No reports available to display.</div>
      )}
    </div>
  );
}
