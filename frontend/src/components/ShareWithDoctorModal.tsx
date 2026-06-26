import React, { useState } from 'react';
import { generateShareLink } from '@/services/share';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Share2, Link as LinkIcon, Check, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

interface ShareWithDoctorModalProps {
  reportId?: string; // If undefined, shares all reports
  children?: React.ReactNode;
}

export function ShareWithDoctorModal({ reportId, children }: ShareWithDoctorModalProps) {
  const [open, setOpen] = useState(false);
  const [expiresIn, setExpiresIn] = useState('7');
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateShareLink({
        report_id: reportId,
        expires_in_days: parseInt(expiresIn),
      });
      setShareLink(`${window.location.origin}/shared/${res.token}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const reset = () => {
    setShareLink(null);
    setCopied(false);
    setExpiresIn('7');
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) setTimeout(reset, 300); }}>
      <DialogTrigger render={
        (children as any) || (
          <Button variant="outline" size="sm" className="rounded-full shadow-sm">
            <Share2 className="w-4 h-4 mr-2" /> Share with Doctor
          </Button>
        )
      } />
      <DialogContent className="sm:max-w-md bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-gray-200 dark:border-zinc-800 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mr-3">
              <Share2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            Secure Medical Share
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-zinc-400 mt-2">
            Generate a secure, clinical-grade view of your medical data for your healthcare provider. This link will automatically expire.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {!shareLink ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Link Expires In</label>
                <Select value={expiresIn} onValueChange={(val) => val && setExpiresIn(val)}>
                  <SelectTrigger className="w-full bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 rounded-xl h-11">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Day (24 hours)</SelectItem>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleGenerate} 
                disabled={loading}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-white"
              >
                {loading ? 'Generating Secure Link...' : 'Generate Clinical Link'}
              </Button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-2xl">
                <p className="text-sm text-green-800 dark:text-green-300 font-medium mb-2">
                  Your secure link is ready. Anyone with this link can view your data until it expires.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 bg-white dark:bg-black/50 border border-gray-200 dark:border-zinc-800 rounded-lg p-2.5 text-sm truncate font-mono text-gray-600 dark:text-zinc-400 flex items-center">
                    <LinkIcon className="w-4 h-4 mr-2 shrink-0 opacity-50" />
                    {shareLink}
                  </div>
                  <Button 
                    variant={copied ? "default" : "outline"} 
                    className={`h-11 px-4 rounded-lg shrink-0 ${copied ? 'bg-green-600 hover:bg-green-700 text-white border-transparent' : ''}`}
                    onClick={handleCopy}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <Button variant="ghost" onClick={() => setOpen(false)} className="w-full rounded-xl">
                Close
              </Button>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
