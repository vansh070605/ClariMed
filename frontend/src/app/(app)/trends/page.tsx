/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTrends, getTrendsHistory } from '@/services/trends';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Minus, Activity, ArrowRight, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TrendsPage() {
  const [selectedBiomarker, setSelectedBiomarker] = useState<string>('hba1c');
  const [timeRange, setTimeRange] = useState<string>('All Time');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');

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
        return <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900" variant="outline"><TrendingUp className="w-3 h-3 mr-1"/> Improving</Badge>;
      case 'DECLINING':
        return <Badge className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900" variant="outline"><TrendingDown className="w-3 h-3 mr-1"/> Declining</Badge>;
      case 'STABLE':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900" variant="outline"><Minus className="w-3 h-3 mr-1"/> Stable</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700">Insufficient Data</Badge>;
    }
  };

  const getFilteredData = (data: any[]) => {
    if (!data) return [];
    if (timeRange === 'All Time') return data;
    
    const now = new Date();
    const limit = new Date();
    if (timeRange === 'Last 3 Months') limit.setMonth(now.getMonth() - 3);
    if (timeRange === 'Last 6 Months') limit.setMonth(now.getMonth() - 6);
    if (timeRange === 'Last Year') limit.setFullYear(now.getFullYear() - 1);
    
    return data.filter(d => new Date(d.date) >= limit);
  };

  const rawHistoryData = historyData && historyData[selectedBiomarker] ? historyData[selectedBiomarker].history : [];
  const currentChartData = getFilteredData(rawHistoryData).map(d => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  }));

  const allCategories = useMemo(() => {
    if (!historyData) return ['All Categories'];
    const cats = new Set(Object.values(historyData).map((v: any) => v.category));
    return ['All Categories', ...Array.from(cats)] as string[];
  }, [historyData]);

  const displayTrends = useMemo(() => {
    if (!trendsData) return [];
    return trendsData.trends.filter((t: any) => {
      const cat = historyData && historyData[t.biomarker] ? historyData[t.biomarker].category : 'Uncategorized';
      return selectedCategory === 'All Categories' || cat === selectedCategory;
    });
  }, [trendsData, historyData, selectedCategory]);

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
      className="space-y-8 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">Health Trends</h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-2">Track biomarker progression across your clinical history.</p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-3 bg-white dark:bg-zinc-950 p-1.5 rounded-2xl border dark:border-zinc-800 shadow-sm">
          <div className="flex items-center pl-3 text-gray-400 border-r dark:border-zinc-800 pr-3">
            <Filter className="w-4 h-4" />
          </div>
          <Select value={timeRange} onValueChange={(val) => val && setTimeRange(val)}>
            <SelectTrigger className="w-[140px] border-0 shadow-none focus:ring-0 bg-transparent text-sm font-medium">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {['All Time', 'Last Year', 'Last 6 Months', 'Last 3 Months'].map(r => (
                <SelectItem key={r} value={r} className="cursor-pointer">{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="w-px h-6 bg-gray-200 dark:bg-zinc-800" />
          <Select value={selectedCategory} onValueChange={(val) => val && setSelectedCategory(val)}>
            <SelectTrigger className="w-[160px] border-0 shadow-none focus:ring-0 bg-transparent text-sm font-medium">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {allCategories.map(c => (
                <SelectItem key={c} value={c} className="cursor-pointer capitalize">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {(trendsLoading || historyLoading) ? (
        <div className="flex items-center justify-center min-h-[40vh] text-gray-500">Loading trend analysis...</div>
      ) : (!trendsData || trendsData.trends.length === 0) ? (
        <motion.div variants={itemVariants}>
          <Card className="border-0 ring-1 ring-gray-200 dark:ring-zinc-800">
            <CardContent className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-20 w-20 bg-blue-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                <TrendingUp className="h-10 w-10 text-blue-300 dark:text-blue-500/50" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">Insufficient Data for Trends</h3>
              <p className="mt-2 text-gray-500 dark:text-zinc-400 max-w-sm">Upload at least two medical reports to unlock longitudinal tracking and AI trend analysis.</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['IMPROVING', 'STABLE', 'DECLINING'].map((classification) => {
              const count = displayTrends.filter((t: any) => t.classification === classification).length;
              const isImproving = classification === 'IMPROVING';
              const isDeclining = classification === 'DECLINING';
              
              return (
                <Card key={classification} className={`border-0 ring-1 ${isImproving ? 'ring-green-100 dark:ring-green-900/30 bg-green-50/30 dark:bg-green-900/10' : isDeclining ? 'ring-red-100 dark:ring-red-900/30 bg-red-50/30 dark:bg-red-900/10' : 'ring-gray-200 dark:ring-zinc-800 bg-white/50 dark:bg-zinc-950/50'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 capitalize">{classification.toLowerCase()} Biomarkers</p>
                      {isImproving ? <TrendingUp className="h-5 w-5 text-green-500" /> : isDeclining ? <TrendingDown className="h-5 w-5 text-red-500" /> : <Minus className="h-5 w-5 text-blue-500" />}
                    </div>
                    <p className={`text-3xl font-bold mt-2 ${isImproving ? 'text-green-700 dark:text-green-400' : isDeclining ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-zinc-50'}`}>{count}</p>
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-0 ring-1 ring-gray-200 dark:ring-zinc-800">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50/50 dark:bg-zinc-900/50 px-8 py-6 border-b dark:border-zinc-800">
                <div>
                  <CardTitle className="text-xl">Progression Analysis</CardTitle>
                  <CardDescription className="mt-1">Visualize your health trajectory</CardDescription>
                </div>
                <div className="mt-4 sm:mt-0 bg-white dark:bg-zinc-950 rounded-xl p-1 shadow-sm border dark:border-zinc-800">
                  <Select value={selectedBiomarker} onValueChange={(val) => { if(val) setSelectedBiomarker(val); }}>
                    <SelectTrigger className="w-[200px] border-0 ring-0 focus:ring-0 shadow-none bg-transparent">
                      <SelectValue placeholder="Select Biomarker" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-200 dark:border-zinc-800 shadow-xl max-h-60">
                      {displayTrends.map((bm: any) => (
                        <SelectItem key={bm.biomarker} value={bm.biomarker} className="capitalize rounded-lg focus:bg-blue-50 dark:focus:bg-zinc-800 cursor-pointer">
                          {bm.biomarker.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="h-[400px] w-full">
                  {currentChartData.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-zinc-800" />
                        <XAxis 
                          dataKey="displayDate" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#6b7280', fontSize: 12 }} 
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#6b7280', fontSize: 12 }} 
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--background)' }}
                          itemStyle={{ color: '#2563eb', fontWeight: 600 }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#2563eb" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorValue)" 
                          activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-zinc-600 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl bg-gray-50/50 dark:bg-zinc-900/30">
                      <Activity className="h-8 w-8 mb-3 opacity-50" />
                      <p>Insufficient data points in this time range to map {selectedBiomarker.replace('_', ' ')} trajectory.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-0 ring-1 ring-gray-200 dark:ring-zinc-800">
              <CardHeader className="bg-gray-50/50 dark:bg-zinc-900/50 px-8 py-6 border-b dark:border-zinc-800">
                <CardTitle className="text-xl">Trend Overview</CardTitle>
                <CardDescription className="mt-1">Deterministic intelligence comparing baseline to latest results.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50/80 dark:bg-zinc-900/80">
                      <TableRow className="border-b-gray-200 dark:border-b-zinc-800">
                        <TableHead className="px-8 h-12">Biomarker</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Classification</TableHead>
                        <TableHead className="text-right">Change</TableHead>
                        <TableHead className="text-right">Baseline</TableHead>
                        <TableHead className="text-right px-8">Latest</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayTrends.map((trend: any) => (
                        <TableRow key={trend.biomarker} className="border-b-gray-100 dark:border-b-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-900/50 cursor-pointer" onClick={() => setSelectedBiomarker(trend.biomarker)}>
                          <TableCell className="font-semibold text-gray-900 dark:text-zinc-100 px-8 py-5 capitalize">{trend.biomarker.replace('_', ' ')}</TableCell>
                          <TableCell className="text-gray-500 dark:text-zinc-400 capitalize">
                            {historyData && historyData[trend.biomarker] ? historyData[trend.biomarker].category : 'Uncategorized'}
                          </TableCell>
                          <TableCell>{renderClassificationBadge(trend.classification)}</TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            <span className={trend.change_percent > 0 ? (trend.classification === 'IMPROVING' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400') : (trend.classification === 'IMPROVING' ? 'text-green-600 dark:text-green-400' : trend.classification === 'STABLE' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400')}>
                              {trend.change_percent > 0 ? '+' : ''}{trend.change_percent.toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-gray-500 dark:text-zinc-400">{trend.first_value}</TableCell>
                          <TableCell className="text-right font-bold text-gray-900 dark:text-zinc-100 px-8 flex items-center justify-end">
                            {trend.latest_value}
                            <ArrowRight className="h-4 w-4 ml-3 text-gray-300 dark:text-zinc-600" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
