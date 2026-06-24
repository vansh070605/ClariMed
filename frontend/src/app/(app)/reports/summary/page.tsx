'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardMetrics } from '@/services/dashboard';
import { getReportsList, getReportDetails } from '@/services/reports';
import { getTrends } from '@/services/trends';
import { useAuth } from '@/features/auth/AuthProvider';
import { HeartPulse, Activity, TrendingUp, TrendingDown, Minus, CheckCircle2, AlertTriangle } from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function HealthSummaryExportPage() {
  const { user } = useAuth();

  const { data: metrics } = useQuery({ queryKey: ['dashboardMetrics'], queryFn: getDashboardMetrics });
  const { data: reportsList } = useQuery({ queryKey: ['allReports'], queryFn: () => getReportsList(0, 100) });
  const { data: trends } = useQuery({ queryKey: ['trends'], queryFn: getTrends });

  // Get full details of the latest report (which has patient_summary)
  const latestReportId = reportsList?.[0]?.id;
  const { data: latestReport } = useQuery({
    queryKey: ['reportDetail', latestReportId],
    queryFn: () => getReportDetails(latestReportId!),
    enabled: !!latestReportId,
  });

  // Auto-trigger print dialog once data is ready
  useEffect(() => {
    if (!metrics || !reportsList) return;
    const timer = setTimeout(() => { window.print(); }, 1500);
    return () => clearTimeout(timer);
  }, [metrics, reportsList]);

  return (
    <div className="print-container bg-white text-gray-900 min-h-screen">

      {/* === PRINT STYLES === */}
      <style>{`
        @media print {
          @page { margin: 20mm 15mm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          .avoid-break { page-break-inside: avoid; }
        }
        @media screen {
          .print-container { max-width: 900px; margin: 0 auto; padding: 40px 24px; }
        }
      `}</style>

      {/* NO-PRINT banner for screen */}
      <div className="no-print mb-8 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-center text-blue-700">
        <strong>Print Preview</strong> — Your browser&apos;s print dialog will open shortly. If not,{' '}
        <button onClick={() => window.print()} className="underline font-semibold hover:text-blue-900">click here</button>.
      </div>

      {/* === HEADER === */}
      <div className="flex items-start justify-between pb-8 border-b-2 border-gray-200 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <HeartPulse className="h-7 w-7 text-blue-600" />
            <span className="text-2xl font-extrabold tracking-tight text-blue-600">ClariMed</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mt-2">Health Intelligence Report</h1>
          <p className="text-gray-500 mt-1 text-lg">Longitudinal Clinical Summary</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p className="font-semibold text-gray-800 text-base">{user?.name || user?.email}</p>
          <p>Generated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="mt-1 text-xs text-gray-400">For clinical review only. Not a diagnosis.</p>
        </div>
      </div>

      {/* === OVERVIEW METRICS === */}
      <div className="avoid-break mb-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Activity className="mr-2 h-5 w-5 text-blue-600" /> Health Overview
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Reports Analyzed', value: metrics?.total_reports ?? '–', color: 'bg-blue-50 border-blue-100', textColor: 'text-blue-700' },
            { label: 'Abnormal Findings', value: metrics?.abnormal_findings ?? '–', color: 'bg-red-50 border-red-100', textColor: 'text-red-700' },
            { label: 'Improving Trends', value: metrics?.improving_trends ?? '–', color: 'bg-green-50 border-green-100', textColor: 'text-green-700' },
          ].map(m => (
            <div key={m.label} className={`${m.color} border rounded-2xl p-5 avoid-break`}>
              <p className="text-sm text-gray-500 font-medium">{m.label}</p>
              <p className={`text-4xl font-extrabold mt-1 ${m.textColor}`}>{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* === CLINICAL SUMMARY FROM LATEST REPORT === */}
      <div className="avoid-break mb-10">
        <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center">
          <CheckCircle2 className="mr-2 h-5 w-5 text-blue-600" /> Latest Report — Clinical Summary
        </h2>
        {latestReport ? (
          <>
            <p className="text-sm text-gray-400 mb-4">
              Report date: {new Date(latestReport.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            {latestReport.patient_summary ? (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-2">Overall Assessment</h3>
                <p className="text-gray-700 leading-relaxed">{latestReport.patient_summary.overall_assessment}</p>
                {latestReport.patient_summary.follow_up_considerations?.length > 0 && (
                  <>
                    <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider mt-5 mb-2">Clinical Next Steps</h3>
                    <ul className="space-y-1 list-disc list-inside">
                      {latestReport.patient_summary.follow_up_considerations.map((c: string, i: number) => (
                        <li key={i} className="text-gray-700 text-sm">{c}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">No AI summary available for this report.</p>
            )}
          </>
        ) : (
          <p className="text-gray-500 italic">{latestReportId ? 'Loading summary...' : 'No reports uploaded yet.'}</p>
        )}
      </div>

      {/* === BIOMARKER TRENDS === */}
      {trends && trends.trends.length > 0 && (
        <div className="page-break avoid-break mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-blue-600" /> Biomarker Trend Analysis
          </h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 px-3 font-semibold text-gray-600">Biomarker</th>
                <th className="text-left py-3 px-3 font-semibold text-gray-600">Category</th>
                <th className="py-3 px-3 font-semibold text-gray-600">Classification</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-600">Baseline</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-600">Latest</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-600">Change</th>
              </tr>
            </thead>
            <tbody>
              {trends.trends.map((trend: any, i: number) => (
                <tr key={trend.biomarker} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                  <td className="py-3 px-3 font-semibold capitalize">{trend.biomarker.replace(/_/g, ' ')}</td>
                  <td className="py-3 px-3 text-gray-500 capitalize">{trend.category || 'Uncategorized'}</td>
                  <td className="py-3 px-3 text-center">
                    {trend.classification === 'IMPROVING' && (
                      <span className="inline-flex items-center gap-1 text-green-700 font-medium">
                        <TrendingUp className="w-3 h-3" /> Improving
                      </span>
                    )}
                    {trend.classification === 'DECLINING' && (
                      <span className="inline-flex items-center gap-1 text-red-700 font-medium">
                        <TrendingDown className="w-3 h-3" /> Declining
                      </span>
                    )}
                    {trend.classification === 'STABLE' && (
                      <span className="inline-flex items-center gap-1 text-blue-700 font-medium">
                        <Minus className="w-3 h-3" /> Stable
                      </span>
                    )}
                    {!['IMPROVING','DECLINING','STABLE'].includes(trend.classification) && (
                      <span className="text-gray-500">Insufficient Data</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-gray-600">{trend.first_value}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold">{trend.latest_value}</td>
                  <td className={`py-3 px-3 text-right font-mono font-semibold ${
                    trend.classification === 'IMPROVING' ? 'text-green-600' :
                    trend.classification === 'DECLINING' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {trend.change_percent > 0 ? '+' : ''}{trend.change_percent.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* === DISCLAIMER === */}
      <div className="mt-12 pt-6 border-t-2 border-gray-200 text-xs text-gray-400 text-center">
        <AlertTriangle className="inline-block w-3 h-3 mr-1 mb-0.5" />
        <strong>Medical Disclaimer:</strong> This report is generated by ClariMed AI for informational purposes only and does not constitute medical advice, diagnosis, or treatment.
        Always consult a qualified healthcare professional regarding your health. Generated on {new Date().toISOString()}.
      </div>
    </div>
  );
}
