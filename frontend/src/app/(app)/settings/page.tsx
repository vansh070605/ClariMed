/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, User, Key, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/features/auth/AuthProvider';
import { useMutation } from '@tanstack/react-query';
import { updateProfile, updatePassword } from '@/services/auth';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

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
    animate: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
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
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">Settings</h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-2 text-lg">Manage your account preferences, security, and profile.</p>
      </motion.div>
      
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Modern Navigation Sidebar */}
        <motion.div variants={itemVariants} className="md:w-64 shrink-0 space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center justify-start px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'profile' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200'
            }`}
          >
            <User className={`mr-3 h-5 w-5 ${activeTab === 'profile' ? 'text-blue-200' : 'text-gray-400 dark:text-zinc-500'}`} /> 
            Personal Profile
          </button>
          
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center justify-start px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'security' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200'
            }`}
          >
            <Shield className={`mr-3 h-5 w-5 ${activeTab === 'security' ? 'text-blue-200' : 'text-gray-400 dark:text-zinc-500'}`} /> 
            Security & Login
          </button>
        </motion.div>

        {/* Animated Form Area */}
        <motion.div variants={itemVariants} className="flex-1">
          <AnimatePresence mode="wait">
            
            {activeTab === 'profile' && (
              <motion.div key="profile" variants={formVariants} initial="initial" animate="animate" exit="exit">
                <Card className="border-0 ring-1 ring-gray-200 dark:ring-zinc-800 overflow-hidden p-0 gap-0">
                  <form onSubmit={handleProfileSubmit}>
                    <CardHeader className="px-8 pt-8 pb-6 border-b border-gray-100 dark:border-zinc-800/50 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-zinc-900/20">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <CardTitle className="text-2xl">Profile Information</CardTitle>
                      </div>
                      <CardDescription className="text-base ml-12">Update your personal details and clinical identifiers.</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="px-8 py-8 space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-zinc-300">Email Address</Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <Input 
                            id="email" 
                            type="email" 
                            value={user?.email || ''} 
                            disabled 
                            className="pl-11 h-12 rounded-xl bg-gray-50/50 dark:bg-zinc-900/30 border-gray-200 dark:border-zinc-800 text-gray-500 cursor-not-allowed" 
                          />
                        </div>
                        <p className="text-xs text-gray-500 font-medium pl-1">Your email address is your unique identifier and cannot be changed.</p>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-zinc-300">Full Name</Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <Input 
                            id="name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="Enter your full name" 
                            className="pl-11 h-12 rounded-xl border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white dark:bg-zinc-950"
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
                                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-900/50' 
                                : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-900/50'
                            }`}
                          >
                            {profileMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            {profileMsg.text}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                    
                    <CardFooter className="bg-gray-50/80 dark:bg-zinc-900/30 px-8 py-5 rounded-b-[32px] border-t border-gray-100 dark:border-zinc-800/80 flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={profileMutation.isPending || !name || name === user?.name}
                        className="h-11 px-6 rounded-full font-semibold shadow-sm hover:shadow transition-all"
                      >
                        {profileMutation.isPending ? 'Saving Changes...' : 'Save Changes'}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div key="security" variants={formVariants} initial="initial" animate="animate" exit="exit">
                <Card className="border-0 ring-1 ring-gray-200 dark:ring-zinc-800 overflow-hidden p-0 gap-0">
                  <form onSubmit={handlePasswordSubmit}>
                    <CardHeader className="px-8 pt-8 pb-6 border-b border-gray-100 dark:border-zinc-800/50 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-zinc-900/20">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                          <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <CardTitle className="text-2xl">Security & Login</CardTitle>
                      </div>
                      <CardDescription className="text-base ml-12">Update your password to ensure your medical data remains secure.</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="px-8 py-8 space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="current_password" className="text-sm font-semibold text-gray-700 dark:text-zinc-300">Current Password</Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Key className="h-5 w-5 text-gray-400" />
                          </div>
                          <Input 
                            id="current_password" 
                            type="password" 
                            value={currentPassword} 
                            onChange={(e) => setCurrentPassword(e.target.value)} 
                            className="pl-11 h-12 rounded-xl border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white dark:bg-zinc-950"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="new_password" className="text-sm font-semibold text-gray-700 dark:text-zinc-300">New Password</Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Key className="h-5 w-5 text-gray-400" />
                          </div>
                          <Input 
                            id="new_password" 
                            type="password" 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            className="pl-11 h-12 rounded-xl border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white dark:bg-zinc-950"
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
                                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-900/50' 
                                : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-900/50'
                            }`}
                          >
                            {passwordMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            {passwordMsg.text}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                    
                    <CardFooter className="bg-gray-50/80 dark:bg-zinc-900/30 px-8 py-5 rounded-b-[32px] border-t border-gray-100 dark:border-zinc-800/80 flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={passwordMutation.isPending || !currentPassword || !newPassword}
                        className="h-11 px-6 rounded-full font-semibold shadow-sm hover:shadow transition-all bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        {passwordMutation.isPending ? 'Updating...' : 'Update Password'}
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
