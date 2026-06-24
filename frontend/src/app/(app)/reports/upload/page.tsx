'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadReport, analyzeReport, summarizeReport } from '@/services/reports';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, File as FileIcon, CheckCircle2, AlertCircle, FileText, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'summarizing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [fileName, setFileName] = useState('');

  const handleUploadAndProcess = useCallback(async (selectedFile: File) => {
    try {
      setFileName(selectedFile.name);
      
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
      
    } catch (error) {
      setStatus('error');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setErrorMsg((error as any).response?.data?.detail || (error as any).message || 'An error occurred during processing');
    }
  }, [queryClient, router]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleUploadAndProcess(acceptedFiles[0]);
    }
  }, [handleUploadAndProcess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: status !== 'idle' && status !== 'error'
  });

  const stateMessages = {
    idle: 'Ready to upload',
    uploading: 'Securely uploading your document...',
    analyzing: 'Extracting clinical biomarkers...',
    summarizing: 'Generating patient summary...',
    success: 'Analysis complete! Redirecting...',
    error: 'Upload failed'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">Upload Medical Report</h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-3 text-lg max-w-2xl mx-auto">
          Securely upload your lab results or clinical documents. Our AI intelligence engine will extract biomarkers, analyze trends, and generate a clear clinical summary.
        </p>
      </div>

      <Card className="rounded-[32px] shadow-sm border-0 ring-1 ring-gray-200 dark:ring-zinc-800 overflow-hidden">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2">
            
            {/* Left side: Premium Illustration / Info Area */}
            <div className="bg-blue-600 dark:bg-blue-900/50 p-10 flex flex-col justify-center text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-white/10">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Precision Intelligence</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-blue-200 mt-0.5 mr-3 shrink-0" />
                    <span className="text-blue-50 font-medium">Automated biomarker extraction and normalization</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-blue-200 mt-0.5 mr-3 shrink-0" />
                    <span className="text-blue-50 font-medium">Longitudinal tracking across multiple reports</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-blue-200 mt-0.5 mr-3 shrink-0" />
                    <span className="text-blue-50 font-medium">Patient-friendly summaries built on clinical evidence</span>
                  </li>
                </ul>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute right-0 bottom-0 translate-x-1/3 translate-y-1/3 opacity-10">
                <FileText className="w-96 h-96" />
              </div>
            </div>

            {/* Right side: Dropzone */}
            <div className="p-10 flex flex-col justify-center items-center bg-gray-50 dark:bg-zinc-950/50">
              
              <AnimatePresence mode="wait">
                {(status === 'idle' || status === 'error') ? (
                  <motion.div 
                    key="dropzone"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full"
                  >
                    <div 
                      {...getRootProps()} 
                      className={`
                        w-full border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[320px]
                        ${isDragActive 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' 
                          : 'border-gray-300 dark:border-zinc-700 hover:border-blue-400 hover:bg-gray-100 dark:hover:bg-zinc-900'}
                      `}
                    >
                      <input {...getInputProps()} />
                      <div className="bg-white dark:bg-zinc-800 p-4 rounded-full shadow-sm mb-6">
                        <UploadCloud className={`h-10 w-10 ${isDragActive ? 'text-blue-600' : 'text-gray-400 dark:text-zinc-500'}`} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">
                        {isDragActive ? 'Drop your report here' : 'Drag & drop your medical report'}
                      </h3>
                      <p className="text-gray-500 dark:text-zinc-400 mt-2 max-w-xs mx-auto">
                        Supports PDF files only. Maximum file size is 10MB.
                      </p>
                    </div>

                    {status === 'error' && (
                      <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl flex items-start border border-red-100 dark:border-red-900/50">
                        <AlertCircle className="h-5 w-5 mr-3 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Upload Failed</p>
                          <p className="text-sm mt-1">{errorMsg}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="progress"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full flex flex-col items-center justify-center min-h-[320px] p-8"
                  >
                    <div className="h-20 w-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-8 relative">
                      {status === 'success' ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                          <CheckCircle2 className="h-10 w-10 text-green-500" />
                        </motion.div>
                      ) : (
                        <>
                          <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900/30"></div>
                          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                          <FileIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </>
                      )}
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 text-center">{stateMessages[status]}</h3>
                    {fileName && <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2 font-medium">{fileName}</p>}
                    
                    <div className="w-full max-w-xs mt-8 space-y-2">
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-zinc-400 font-medium">
                        <span>{progress}%</span>
                        <span>{status === 'success' ? 'Done' : 'Processing...'}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
