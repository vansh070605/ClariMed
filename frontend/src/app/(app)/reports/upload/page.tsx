'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadReport, analyzeReport, summarizeReport } from '@/services/reports';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, File as FileIcon, CheckCircle2, AlertCircle } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'summarizing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const handleUploadAndProcess = async (selectedFile: File) => {
    try {
      // 1. Upload
      setStatus('uploading');
      setProgress(25);
      const metadata = await uploadReport(selectedFile);
      
      // 2. Analyze
      setStatus('analyzing');
      setProgress(60);
      await analyzeReport(metadata.id);
      
      // 3. Summarize
      setStatus('summarizing');
      setProgress(85);
      await summarizeReport(metadata.id);
      
      // 4. Success
      setStatus('success');
      setProgress(100);
      
      // Invalidate caches so dashboard and trends update
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['recentReports'] });
      queryClient.invalidateQueries({ queryKey: ['reportsList'] });
      queryClient.invalidateQueries({ queryKey: ['trendsData'] });
      
      // Redirect
      setTimeout(() => {
        router.push(`/reports/${metadata.id}`);
      }, 1000);
      
    } catch (err: unknown) {
      console.error(err);
      setStatus('error');
      if (err instanceof Error) {
        // @ts-expect-error - Expected API error
        setErrorMsg(err.response?.data?.detail || 'An error occurred during processing.');
      } else {
        setErrorMsg('An error occurred during processing.');
      }
      setProgress(0);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      if (selected.type !== 'application/pdf') {
        setErrorMsg('Only PDF files are supported.');
        return;
      }
      setErrorMsg('');
      handleUploadAndProcess(selected);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload Report</h1>
        <p className="mt-2 text-sm text-gray-600">Upload your PDF medical report for ClariMed intelligence extraction.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {status === 'idle' || status === 'error' ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-sm font-medium text-gray-900">
                {isDragActive ? 'Drop the PDF here' : 'Drag & drop a PDF here, or click to select'}
              </p>
              <p className="mt-1 text-xs text-gray-500">Maximum file size 10MB</p>
            </div>
          ) : (
            <div className="py-8">
              <div className="flex items-center justify-center mb-6">
                {status === 'success' ? (
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                ) : (
                  <FileIcon className="h-16 w-16 text-blue-500 animate-pulse" />
                )}
              </div>
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {status === 'uploading' && 'Uploading document...'}
                  {status === 'analyzing' && 'Extracting clinical measurements...'}
                  {status === 'summarizing' && 'Generating evidence-backed summary...'}
                  {status === 'success' && 'Processing complete! Redirecting...'}
                </h3>
              </div>
              <div className="max-w-md mx-auto">
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
