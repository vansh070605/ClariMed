/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Bell, Shield, User, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
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
      className="max-w-4xl mx-auto space-y-8 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">Settings</h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-2">Manage your account preferences and application settings.</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="rounded-[32px] shadow-sm border-0 ring-1 ring-gray-200 dark:ring-zinc-800 overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-20 w-20 bg-blue-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
              <Settings className="h-10 w-10 text-blue-300 dark:text-blue-500/50 animate-[spin_6s_linear_infinite]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">Settings Module In Development</h3>
            <p className="mt-2 text-gray-500 dark:text-zinc-400 max-w-sm">
              We are currently building out the settings and preferences center for the ClariMed platform. Check back soon!
            </p>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="rounded-[24px] shadow-sm border-0 ring-1 ring-gray-200 dark:ring-zinc-800 cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors" onClick={() => alert("The settings module is currently in development. Please check back later.")}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center"><User className="w-5 h-5 mr-2" /> Profile Information</CardTitle>
            <CardDescription>Update your personal details and clinical identifiers</CardDescription>
          </CardHeader>
        </Card>
        <Card className="rounded-[24px] shadow-sm border-0 ring-1 ring-gray-200 dark:ring-zinc-800 cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors" onClick={() => alert("The settings module is currently in development. Please check back later.")}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center"><Shield className="w-5 h-5 mr-2" /> Security & Privacy</CardTitle>
            <CardDescription>Manage passwords and data sharing preferences</CardDescription>
          </CardHeader>
        </Card>
        <Card className="rounded-[24px] shadow-sm border-0 ring-1 ring-gray-200 dark:ring-zinc-800 cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors" onClick={() => alert("The settings module is currently in development. Please check back later.")}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center"><Bell className="w-5 h-5 mr-2" /> Notifications</CardTitle>
            <CardDescription>Configure email alerts for new reports and findings</CardDescription>
          </CardHeader>
        </Card>
        <Card className="rounded-[24px] shadow-sm border-0 ring-1 ring-gray-200 dark:ring-zinc-800 cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors" onClick={() => alert("The settings module is currently in development. Please check back later.")}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center"><CreditCard className="w-5 h-5 mr-2" /> Billing & Subscription</CardTitle>
            <CardDescription>Manage your premium subscription plan</CardDescription>
          </CardHeader>
        </Card>
      </motion.div>
    </motion.div>
  );
}
