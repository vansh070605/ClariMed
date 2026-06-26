/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, User, Key, Mail, CheckCircle2, AlertCircle, Bell, Activity, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/features/auth/AuthProvider';
import { useMutation } from '@tanstack/react-query';
import { updateProfile, updatePassword } from '@/services/auth';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'clinical'>('profile');
  
  // Profile settings
  const [name, setName] = useState(user?.name || '');
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Password settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  // Notifications settings
  const [wsEnabled, setWsEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('moderate');
  const [notifMsg, setNotifMsg] = useState({ type: '', text: '' });

  // Clinical settings
  const [units, setUnits] = useState('metric');
  const [summaryLevel, setSummaryLevel] = useState('standard');
  const [autoShare, setAutoShare] = useState(false);
  const [doctorEmail, setDoctorEmail] = useState('');
  const [clinicalMsg, setClinicalMsg] = useState({ type: '', text: '' });

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWs = localStorage.getItem('pref_ws_notifications');
      const savedEmail = localStorage.getItem('pref_email_alerts');
      const savedSeverity = localStorage.getItem('pref_alert_severity');
      const savedUnits = localStorage.getItem('pref_clinical_units');
      const savedSummary = localStorage.getItem('pref_summary_level');
      const savedAutoShare = localStorage.getItem('pref_auto_share');
      const savedDocEmail = localStorage.getItem('pref_doctor_email');

      if (savedWs !== null) setWsEnabled(savedWs === 'true');
      if (savedEmail !== null) setEmailAlerts(savedEmail === 'true');
      if (savedSeverity !== null) setAlertSeverity(savedSeverity);
      if (savedUnits !== null) setUnits(savedUnits);
      if (savedSummary !== null) setSummaryLevel(savedSummary);
      if (savedAutoShare !== null) setAutoShare(savedAutoShare === 'true');
      if (savedDocEmail !== null) setDoctorEmail(savedDocEmail);
    }
  }, []);

  const profileMutation = useMutation({
    mutationFn: (newName: string) => updateProfile(newName),
    onSuccess: () => {
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
      setTimeout(() => setProfileMsg({ type: '', text: '' }), 4000);
    },
    onError: (err: any) => {
      setProfileMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to update profile.' });
    }
  });

  const passwordMutation = useMutation({
    mutationFn: () => updatePassword(currentPassword, newPassword),
    onSuccess: () => {
      setPasswordMsg({ type: 'success', text: 'Password secured and updated.' });
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordMsg({ type: '', text: '' }), 4000);
    },
    onError: (err: any) => {
      setPasswordMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to update password.' });
    }
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    profileMutation.mutate(name);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    passwordMutation.mutate();
  };

  const handleNotificationsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('pref_ws_notifications', String(wsEnabled));
    localStorage.setItem('pref_email_alerts', String(emailAlerts));
    localStorage.setItem('pref_alert_severity', alertSeverity);
    
    setNotifMsg({ type: 'success', text: 'Notification preferences saved.' });
    setTimeout(() => setNotifMsg({ type: '', text: '' }), 4000);
  };

  const handleClinicalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('pref_clinical_units', units);
    localStorage.setItem('pref_summary_level', summaryLevel);
    localStorage.setItem('pref_auto_share', String(autoShare));
    localStorage.setItem('pref_doctor_email', doctorEmail);

    setClinicalMsg({ type: 'success', text: 'Clinical preferences saved.' });
    setTimeout(() => setClinicalMsg({ type: '', text: '' }), 4000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as any, stiffness: 400, damping: 30 } }
  };

  const formVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 30 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  return (
    <motion.div 
      className="max-w-5xl mx-auto space-y-10 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Settings</h1>
        <p className="text-on-surface-variant mt-2 text-lg">Manage your account preferences, security, notifications, and clinical guidelines.</p>
      </motion.div>
      
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Navigation Sidebar */}
        <motion.div variants={itemVariants} className="md:w-64 shrink-0 space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center justify-start px-4 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'profile' 
                ? 'bg-primary text-on-primary shadow-md' 
                : 'text-on-surface hover:bg-surface-container hover:text-primary dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200'
            }`}
          >
            <User className={`mr-3 h-5 w-5 ${activeTab === 'profile' ? 'text-white' : 'text-on-surface-variant'}`} /> 
            Personal Profile
          </button>
          
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center justify-start px-4 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'security' 
                ? 'bg-primary text-on-primary shadow-md' 
                : 'text-on-surface hover:bg-surface-container hover:text-primary dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200'
            }`}
          >
            <Shield className={`mr-3 h-5 w-5 ${activeTab === 'security' ? 'text-white' : 'text-on-surface-variant'}`} /> 
            Security & Login
          </button>

          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center justify-start px-4 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'notifications' 
                ? 'bg-primary text-on-primary shadow-md' 
                : 'text-on-surface hover:bg-surface-container hover:text-primary dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200'
            }`}
          >
            <Bell className={`mr-3 h-5 w-5 ${activeTab === 'notifications' ? 'text-white' : 'text-on-surface-variant'}`} /> 
            Notifications
          </button>

          <button 
            onClick={() => setActiveTab('clinical')}
            className={`w-full flex items-center justify-start px-4 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'clinical' 
                ? 'bg-primary text-on-primary shadow-md' 
                : 'text-on-surface hover:bg-surface-container hover:text-primary dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200'
            }`}
          >
            <Activity className={`mr-3 h-5 w-5 ${activeTab === 'clinical' ? 'text-white' : 'text-on-surface-variant'}`} /> 
            Clinical Settings
          </button>
        </motion.div>

        {/* Animated Settings Tabs */}
        <motion.div variants={itemVariants} className="flex-1">
          <AnimatePresence mode="wait">
            
            {/* TAB: PROFILE */}
            {activeTab === 'profile' && (
              <motion.div key="profile" variants={formVariants} initial="initial" animate="animate" exit="exit">
                <Card className="border-0 ring-1 ring-border shadow-soft overflow-hidden p-0 gap-0">
                  <form onSubmit={handleProfileSubmit}>
                    <CardHeader className="px-8 pt-8 pb-6 border-b border-border bg-gradient-to-b from-slate-50/50 to-transparent dark:from-zinc-900/10">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-2xl text-on-surface">Profile Information</CardTitle>
                      </div>
                      <CardDescription className="text-base ml-12 text-on-surface-variant">Update your personal details and clinical identifiers.</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="px-8 py-8 space-y-6 bg-card">
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-sm font-semibold text-on-surface">Email Address</Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-on-surface-variant" />
                          </div>
                          <Input 
                            id="email" 
                            type="email" 
                            value={user?.email || ''} 
                            disabled 
                            className="pl-11 h-12 rounded-xl bg-slate-50/50 dark:bg-[#1b1b24] border-border text-on-surface-variant cursor-not-allowed" 
                          />
                        </div>
                        <p className="text-xs text-on-surface-variant font-medium pl-1">Your email address is your unique identifier and cannot be changed.</p>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="name" className="text-sm font-semibold text-on-surface">Full Name</Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-on-surface-variant" />
                          </div>
                          <Input 
                            id="name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="Enter your full name" 
                            className="pl-11 h-12 rounded-xl border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-card text-on-surface placeholder:text-on-surface-variant/40"
                          />
                        </div>
                      </div>

                      <AnimatePresence>
                        {profileMsg.text && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }} 
                            exit={{ opacity: 0, height: 0 }}
                            className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${
                              profileMsg.type === 'success' 
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50' 
                                : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/50'
                            }`}
                          >
                            {profileMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            {profileMsg.text}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                    
                    <CardFooter className="bg-slate-50/50 dark:bg-[#1b1b24]/40 px-8 py-5 rounded-b-3xl border-t border-border flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={profileMutation.isPending || !name || name === user?.name}
                        className="h-11 px-6 rounded-full font-semibold shadow-sm hover:shadow transition-all cursor-pointer bg-primary text-on-primary hover:opacity-90"
                      >
                        {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </motion.div>
            )}

            {/* TAB: SECURITY */}
            {activeTab === 'security' && (
              <motion.div key="security" variants={formVariants} initial="initial" animate="animate" exit="exit">
                <Card className="border-0 ring-1 ring-border shadow-soft overflow-hidden p-0 gap-0">
                  <form onSubmit={handlePasswordSubmit}>
                    <CardHeader className="px-8 pt-8 pb-6 border-b border-border bg-gradient-to-b from-slate-50/50 to-transparent dark:from-zinc-900/10">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-2xl text-on-surface">Security & Login</CardTitle>
                      </div>
                      <CardDescription className="text-base ml-12 text-on-surface-variant">Update your password to ensure your medical data remains secure.</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="px-8 py-8 space-y-6 bg-card">
                      <div className="space-y-3">
                        <Label htmlFor="current_password" className="text-sm font-semibold text-on-surface">Current Password</Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Key className="h-5 w-5 text-on-surface-variant" />
                          </div>
                          <Input 
                            id="current_password" 
                            type="password" 
                            value={currentPassword} 
                            onChange={(e) => setCurrentPassword(e.target.value)} 
                            className="pl-11 h-12 rounded-xl border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-card text-on-surface placeholder:text-on-surface-variant/40"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="new_password" className="text-sm font-semibold text-on-surface">New Password</Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Key className="h-5 w-5 text-on-surface-variant" />
                          </div>
                          <Input 
                            id="new_password" 
                            type="password" 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            className="pl-11 h-12 rounded-xl border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-card text-on-surface placeholder:text-on-surface-variant/40"
                            placeholder="Must be at least 8 characters"
                          />
                        </div>
                      </div>

                      <AnimatePresence>
                        {passwordMsg.text && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }} 
                            exit={{ opacity: 0, height: 0 }}
                            className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${
                              passwordMsg.type === 'success' 
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50' 
                                : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/50'
                            }`}
                          >
                            {passwordMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            {passwordMsg.text}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                    
                    <CardFooter className="bg-slate-50/50 dark:bg-[#1b1b24]/40 px-8 py-5 rounded-b-3xl border-t border-border flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={passwordMutation.isPending || !currentPassword || !newPassword}
                        className="h-11 px-6 rounded-full font-semibold shadow-sm hover:shadow transition-all cursor-pointer bg-primary text-on-primary hover:opacity-90"
                      >
                        {passwordMutation.isPending ? 'Updating...' : 'Update Password'}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </motion.div>
            )}

            {/* TAB: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <motion.div key="notifications" variants={formVariants} initial="initial" animate="animate" exit="exit">
                <Card className="border-0 ring-1 ring-border shadow-soft overflow-hidden p-0 gap-0">
                  <form onSubmit={handleNotificationsSubmit}>
                    <CardHeader className="px-8 pt-8 pb-6 border-b border-border bg-gradient-to-b from-slate-50/50 to-transparent dark:from-zinc-900/10">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Bell className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-2xl text-on-surface">Notification Preferences</CardTitle>
                      </div>
                      <CardDescription className="text-base ml-12 text-on-surface-variant">Control how and when you want to receive notifications and clinical alerts.</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="px-8 py-8 space-y-6 bg-card">
                      {/* WS Toggle */}
                      <div className="flex items-center justify-between py-2 border-b border-border/20">
                        <div className="space-y-1.5 pr-4">
                          <Label className="text-base font-semibold text-on-surface">Live Toast Notifications</Label>
                          <p className="text-xs text-on-surface-variant leading-relaxed">Show temporary alert popups at the top right of your screen whenever a file finishes analyzing.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setWsEnabled(!wsEnabled)}
                          className={`relative inline-flex h-6.5 w-11.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none shrink-0 ${
                            wsEnabled ? 'bg-primary' : 'bg-slate-200 dark:bg-zinc-800'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              wsEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Email Alerts Toggle */}
                      <div className="flex items-center justify-between py-2 border-b border-border/20">
                        <div className="space-y-1.5 pr-4">
                          <Label className="text-base font-semibold text-on-surface">Critical Finding Email Alerts</Label>
                          <p className="text-xs text-on-surface-variant leading-relaxed">Receive urgent alerts in your email inbox when ClariMed AI detects highly critical lab values.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEmailAlerts(!emailAlerts)}
                          className={`relative inline-flex h-6.5 w-11.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none shrink-0 ${
                            emailAlerts ? 'bg-primary' : 'bg-slate-200 dark:bg-zinc-800'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              emailAlerts ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Severity Select */}
                      <div className="space-y-3">
                        <Label htmlFor="severity" className="text-sm font-semibold text-on-surface">Biomarker Severity Alert Threshold</Label>
                        <Select value={alertSeverity} onValueChange={(val) => val && setAlertSeverity(val)}>
                          <SelectTrigger className="w-full h-12 px-4 rounded-xl border border-border bg-card text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium justify-between text-base">
                            <SelectValue placeholder="Select threshold" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-[#1b1b24] border border-border/80 rounded-xl shadow-lg p-1.5">
                            <SelectItem value="all" className="py-2.5 pl-3 pr-8 rounded-lg cursor-pointer text-base">Trigger for All Findings (Normal & Above)</SelectItem>
                            <SelectItem value="mild" className="py-2.5 pl-3 pr-8 rounded-lg cursor-pointer text-base">Trigger for Mild & Above</SelectItem>
                            <SelectItem value="moderate" className="py-2.5 pl-3 pr-8 rounded-lg cursor-pointer text-base">Trigger for Moderate & Above</SelectItem>
                            <SelectItem value="severe" className="py-2.5 pl-3 pr-8 rounded-lg cursor-pointer text-base">Trigger for Severe Only</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-on-surface-variant pl-1 leading-relaxed">Limits alerts to lab items matching or exceeding your chosen threshold level.</p>
                      </div>

                      <AnimatePresence>
                        {notifMsg.text && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }} 
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 text-sm font-medium"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {notifMsg.text}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                    
                    <CardFooter className="bg-slate-50/50 dark:bg-[#1b1b24]/40 px-8 py-5 rounded-b-3xl border-t border-border flex justify-end">
                      <Button 
                        type="submit" 
                        className="h-11 px-6 rounded-full font-semibold shadow-sm hover:shadow transition-all cursor-pointer bg-primary text-on-primary hover:opacity-90 flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save Preferences
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </motion.div>
            )}

            {/* TAB: CLINICAL */}
            {activeTab === 'clinical' && (
              <motion.div key="clinical" variants={formVariants} initial="initial" animate="animate" exit="exit">
                <Card className="border-0 ring-1 ring-border shadow-soft overflow-hidden p-0 gap-0">
                  <form onSubmit={handleClinicalSubmit}>
                    <CardHeader className="px-8 pt-8 pb-6 border-b border-border bg-gradient-to-b from-slate-50/50 to-transparent dark:from-zinc-900/10">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Activity className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-2xl text-on-surface">Clinical Settings</CardTitle>
                      </div>
                      <CardDescription className="text-base ml-12 text-on-surface-variant">Customize clinical metric units, auto-summarization preferences, and share configurations.</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="px-8 py-8 space-y-6 bg-card">
                      {/* Units */}
                      <div className="space-y-3">
                        <Label htmlFor="units" className="text-sm font-semibold text-on-surface">Clinical Measurement Unit Standard</Label>
                        <Select value={units} onValueChange={(val) => val && setUnits(val)}>
                          <SelectTrigger className="w-full h-12 px-4 rounded-xl border border-border bg-card text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium justify-between text-base">
                            <SelectValue placeholder="Select standard" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-[#1b1b24] border border-border/80 rounded-xl shadow-lg p-1.5">
                            <SelectItem value="metric" className="py-2.5 pl-3 pr-8 rounded-lg cursor-pointer text-base">International Standard (e.g. mmol/L, g/L)</SelectItem>
                            <SelectItem value="us" className="py-2.5 pl-3 pr-8 rounded-lg cursor-pointer text-base">United States Conventional (e.g. mg/dL, g/dL)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-on-surface-variant pl-1 leading-relaxed">Determines the default scale display when charting lab biomarkers.</p>
                      </div>

                      {/* Summarization Level */}
                      <div className="space-y-3">
                        <Label htmlFor="summary" className="text-sm font-semibold text-on-surface">AI Summary Detail Level</Label>
                        <Select value={summaryLevel} onValueChange={(val) => val && setSummaryLevel(val)}>
                          <SelectTrigger className="w-full h-12 px-4 rounded-xl border border-border bg-card text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium justify-between text-base">
                            <SelectValue placeholder="Select detail level" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-[#1b1b24] border border-border/80 rounded-xl shadow-lg p-1.5">
                            <SelectItem value="concise" className="py-2.5 pl-3 pr-8 rounded-lg cursor-pointer text-base">Concise (Key bullet points only)</SelectItem>
                            <SelectItem value="standard" className="py-2.5 pl-3 pr-8 rounded-lg cursor-pointer text-base">Standard (Overview, key ranges, and next steps)</SelectItem>
                            <SelectItem value="detailed" className="py-2.5 pl-3 pr-8 rounded-lg cursor-pointer text-base">Clinically Detailed (Physiology context and citation pathways)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-on-surface-variant pl-1 leading-relaxed">Configures the verbal footprint of the medical analysis output.</p>
                      </div>

                      {/* Auto share Toggle */}
                      <div className="flex items-center justify-between py-2 border-b border-border/20">
                        <div className="space-y-1.5 pr-4">
                          <Label className="text-base font-semibold text-on-surface">Auto-Share Reports with Doctor</Label>
                          <p className="text-xs text-on-surface-variant leading-relaxed">Automatically email a secure, clinical view link to your doctor as soon as a new report is processed.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAutoShare(!autoShare)}
                          className={`relative inline-flex h-6.5 w-11.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none shrink-0 ${
                            autoShare ? 'bg-primary' : 'bg-slate-200 dark:bg-zinc-800'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              autoShare ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Doctor Email Input */}
                      {autoShare && (
                        <div className="space-y-3">
                          <Label htmlFor="doc_email" className="text-sm font-semibold text-on-surface">Doctor's Contact Email</Label>
                          <Input 
                            id="doc_email" 
                            type="email"
                            value={doctorEmail} 
                            onChange={(e) => setDoctorEmail(e.target.value)} 
                            placeholder="doctor@healthclinic.org" 
                            className="h-12 rounded-xl border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-card text-on-surface placeholder:text-on-surface-variant/40"
                          />
                        </div>
                      )}

                      <AnimatePresence>
                        {clinicalMsg.text && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }} 
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 text-sm font-medium"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {clinicalMsg.text}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                    
                    <CardFooter className="bg-slate-50/50 dark:bg-[#1b1b24]/40 px-8 py-5 rounded-b-3xl border-t border-border flex justify-end">
                      <Button 
                        type="submit" 
                        className="h-11 px-6 rounded-full font-semibold shadow-sm hover:shadow transition-all cursor-pointer bg-primary text-on-primary hover:opacity-90 flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save Preferences
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
