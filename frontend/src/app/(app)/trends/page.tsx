'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTrends, getTrendsHistory } from '@/services/trends';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function TrendsPage() {
  const [selectedBiomarker, setSelectedBiomarker] = useState<string>('hba1c');

  const { data: trendsData, isLoading: trendsLoading } = useQuery({
    queryKey: ['trends'],
    queryFn: getTrends
  });

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['trendsHistory'],
    queryFn: getTrendsHistory
  });

  const renderClassificationBadge = (classification: string) => {
    switch (classification) {
      case 'IMPROVING':
        return <Badge className="bg-green-100 text-green-800" variant="outline"><TrendingUp className="w-3 h-3 mr-1"/> Improving</Badge>;
      case 'DECLINING':
        return <Badge className="bg-red-100 text-red-800" variant="outline"><TrendingDown className="w-3 h-3 mr-1"/> Declining</Badge>;
      case 'STABLE':
        return <Badge className="bg-blue-100 text-blue-800" variant="outline"><Minus className="w-3 h-3 mr-1"/> Stable</Badge>;
      default:
        return <Badge variant="secondary">Insufficient Data</Badge>;
    }
  };

  const currentChartData = historyData && historyData[selectedBiomarker] 
    ? historyData[selectedBiomarker].map(d => ({
        ...d,
        displayDate: new Date(d.date).toLocaleDateString()
      }))
    : [];

  // Filter trends to only show the ones we want to highlight in MVP
  const supportedBiomarkers = ['hba1c', 'hemoglobin', 'ldl_cholesterol', 'hdl_cholesterol', 'glucose'];
  
  const displayTrends = trendsData?.trends.filter(t => supportedBiomarkers.includes(t.biomarker)) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Longitudinal Trends</h1>
        <p className="text-gray-500 mt-2">Track how your key biomarkers change over time.</p>
      </div>

      {(trendsLoading || historyLoading) ? (
        <div className="text-gray-500 p-8">Loading trend analysis...</div>
      ) : (!trendsData || trendsData.trends.length === 0) ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No trend data available</h3>
            <p className="mt-1 text-sm text-gray-500">Upload multiple reports to begin tracking your health over time.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Chart Section */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2">
              <div>
                <CardTitle>Historical Progression</CardTitle>
                <CardDescription>Visualize the timeline of your selected biomarker.</CardDescription>
              </div>
              <div className="mt-4 sm:mt-0">
                <Select value={selectedBiomarker} onValueChange={(val) => { if(val) setSelectedBiomarker(val); }}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Biomarker" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedBiomarkers.map((bm) => (
                      <SelectItem key={bm} value={bm} className="capitalize">
                        {bm.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full mt-4">
                {currentChartData.length > 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="displayDate" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#2563eb" 
                        strokeWidth={3}
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 border border-dashed rounded-md">
                    Not enough data points to chart {selectedBiomarker.replace('_', ' ')}. Need at least 2 reports.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Table Section */}
          <Card>
            <CardHeader>
              <CardTitle>Trend Classifications</CardTitle>
              <CardDescription>Deterministic analysis comparing your earliest and latest results.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Biomarker</TableHead>
                    <TableHead>Classification</TableHead>
                    <TableHead className="text-right">Change %</TableHead>
                    <TableHead className="text-right">Baseline</TableHead>
                    <TableHead className="text-right">Latest</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayTrends.map((trend) => (
                    <TableRow key={trend.biomarker}>
                      <TableCell className="font-medium capitalize">{trend.biomarker.replace('_', ' ')}</TableCell>
                      <TableCell>{renderClassificationBadge(trend.classification)}</TableCell>
                      <TableCell className="text-right font-mono">
                        {trend.change_percent > 0 ? '+' : ''}{trend.change_percent.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right text-gray-500">{trend.first_value}</TableCell>
                      <TableCell className="text-right font-bold">{trend.latest_value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
