'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'citizen' | 'responder' | 'admin'>('citizen');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { 
        full_name: fullName, 
        email, 
        phone, 
        password, 
        role,
      };
      console.log('Register API Payload:', payload);
      const data = await api.auth.register(payload);
      console.log('Register API Response:', data);
      
      // Handle both snake_case and camelCase
      const user = data.user || data.User;
      const accessToken = data.access_token || data.accessToken;
      const refreshToken = data.refresh_token || data.refreshToken;
      
      if (user && accessToken) {
        setAuth(user, accessToken, refreshToken);
        
        const userRole = user.role || user.Role;
        if (userRole === 'admin') {
          router.push('/admin/dashboard');
        } else if (userRole === 'responder') {
          router.push('/responder/dashboard');
        } else {
          router.push('/citizen/dashboard');
        }
      } else {
        console.error('Missing user or access token in response:', data);
        throw new Error('Invalid response from server: missing user or access token');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] via-[#0b1220] to-[#050816] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <span className="font-bold text-2xl text-white">SmartOps</span>
        </div>
        <Card className="bg-[#0b1220] border-slate-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Create account</CardTitle>
            <CardDescription className="text-slate-400">Join our platform today</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-300">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-300">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                  placeholder="+1234567890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-slate-300">I am a</Label>
                <Select value={role} onValueChange={(value: any) => setRole(value)}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-white">
                    <SelectItem value="citizen">Citizen</SelectItem>
                    <SelectItem value="responder">Responder</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                  placeholder="••••••••"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
            <div className="mt-6 text-center text-slate-400 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
