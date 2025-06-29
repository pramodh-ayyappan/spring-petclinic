'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { s3Api } from '@/services/api';
import { AdminInfo } from '@/types/api';

interface AdminAuthProps {
  children: (credentials: { username: string; password: string } | null, showLogin: () => void) => React.ReactNode;
}

export default function AdminAuth({ children }: AdminAuthProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);
  const [, setAdminInfo] = useState<AdminInfo | null>(null);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load admin info on component mount
  useEffect(() => {
    const loadAdminInfo = async () => {
      try {
        const info = await s3Api.getAdminInfo();
        setAdminInfo(info);
        setFormData(prev => ({ ...prev, username: info.username }));
      } catch (error) {
        console.error('Failed to load admin info:', error);
      }
    };
    loadAdminInfo();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Test the credentials by making a simple authenticated request
      await s3Api.uploadVets('test-auth', 'merged', formData.username, formData.password);
      
      // If we get here, credentials are valid
      setCredentials(formData);
      setIsLoginOpen(false);
      setFormData(prev => ({ ...prev, password: '' })); // Clear password from form
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number } };
        if (axiosError.response?.status === 401) {
          setError('Invalid username or password');
        } else {
          setError('Authentication failed. Please try again.');
        }
      } else {
        setError('Authentication failed. Please try again.');
      }
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCredentials(null);
    setFormData(prev => ({ ...prev, password: '' }));
  };

  const showLogin = () => {
    setIsLoginOpen(true);
    setError(null);
  };

  return (
    <>
      {children(credentials, showLogin)}
      
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-facets-teal">Admin Authentication</DialogTitle>
            <DialogDescription>
              Enter your admin credentials to access S3 export and management features.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                required
                placeholder="Admin username"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                placeholder="Admin password"
                disabled={loading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsLoginOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-facets-teal hover:bg-facets-teal/90"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Login'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Show logout option when authenticated */}
      {credentials && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-background border rounded-lg p-3 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Admin:</span>{' '}
                <span className="font-medium text-facets-teal">{credentials.username}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-xs"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 
