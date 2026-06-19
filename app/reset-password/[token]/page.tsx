'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { api } from '@/lib/api';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match!', type: 'error' });
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters!', type: 'error' });
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.auth.resetPassword({ 
        token, 
        new_password: newPassword 
      });
      setMessage({ 
        text: data.message || 'Password reset successfully! Redirecting to login...', 
        type: 'success' 
      });
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setMessage({ 
        text: err.message || 'An error occurred. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-950">
      <div className="w-full max-w-md">
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white">Reset Password</CardTitle>
                <CardDescription className="text-slate-400">
                  Enter your new password below
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="new-password" className="text-sm font-medium text-slate-300">
                  New Password
                </label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-sm font-medium text-slate-300">
                  Confirm New Password
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500"
                />
              </div>

              {message && (
                <div 
                  className={`p-4 rounded-lg text-sm ${
                    message.type === 'success' 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
