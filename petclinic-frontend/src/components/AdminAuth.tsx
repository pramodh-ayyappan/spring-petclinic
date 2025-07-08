'use client';

import React, { useState } from 'react';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

interface AdminAuthProps {
  onAuthSuccess: (username: string, password: string) => void;
  initialUsername?: string;
}

export default function AdminAuth({ onAuthSuccess, initialUsername = '' }: AdminAuthProps) {
  const [credentials, setCredentials] = useState({
    username: initialUsername,
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Test the credentials by calling admin info endpoint
      await apiService.getAdminInfo();
      onAuthSuccess(credentials.username, credentials.password);
    } catch {
      setError('Invalid credentials or authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Admin Authentication</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert className="border-red-500 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}
          
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !credentials.username || !credentials.password}
          >
            {loading ? 'Authenticating...' : 'Login'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 
