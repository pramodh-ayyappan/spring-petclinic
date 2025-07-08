'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';
import { S3FilesResponse, LocalFilesResponse, AdminInfo } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Upload, Download, Trash2, RefreshCw, Cloud, HardDrive, FileText } from 'lucide-react';

export default function S3Page() {
  // State management
  const [s3Files, setS3Files] = useState<S3FilesResponse | null>(null);
  const [localFiles, setLocalFiles] = useState<LocalFilesResponse | null>(null);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<{ type: 'success' | 'error'; message: string }[]>([]);

  // Authentication state
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Operation state
  const [operations, setOperations] = useState({
    filename: 'export',
    source: 'merged',
    uploadToS3: false
  });

  const addAlert = useCallback((type: 'success' | 'error', message: string) => {
    const newAlert = { type, message };
    setAlerts(prev => [...prev, newAlert]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert !== newAlert));
    }, 5000);
  }, []);

  const getAuthHeader = useCallback(() => {
    return `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`;
  }, [credentials.username, credentials.password]);

  // Data fetching functions
  const fetchS3Files = useCallback(async () => {
    try {
      const data = await apiService.getS3Files();
      setS3Files(data);
    } catch (error) {
      console.error('Error fetching S3 files:', error);
      addAlert('error', 'Failed to fetch S3 files');
    }
  }, [addAlert]);

  const fetchLocalFiles = useCallback(async () => {
    try {
      const data = await apiService.getLocalFiles();
      setLocalFiles(data);
    } catch (error) {
      console.error('Error fetching local files:', error);
      addAlert('error', 'Failed to fetch local files');
    }
  }, [addAlert]);

  const fetchAdminInfo = useCallback(async () => {
    try {
      const data = await apiService.getAdminInfo();
      setAdminInfo(data);
    } catch (error) {
      console.error('Error fetching admin info:', error);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchS3Files(), fetchLocalFiles(), fetchAdminInfo()]);
    setLoading(false);
  }, [fetchS3Files, fetchLocalFiles, fetchAdminInfo]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Authentication functions
  const handleLogin = useCallback((username: string, password: string) => {
    setCredentials({ username, password });
    setIsAuthenticated(true);
    addAlert('success', `Authenticated as ${username}`);
  }, [addAlert]);

  const handleLogout = useCallback(() => {
    setCredentials({ username: '', password: '' });
    setIsAuthenticated(false);
    addAlert('success', 'Logged out successfully');
  }, [addAlert]);

  // File operations
  const handleDeleteS3File = useCallback(async (filename: string) => {
    if (!isAuthenticated) {
      addAlert('error', 'Authentication required');
      return;
    }

    try {
      const result = await apiService.deleteS3File(filename, getAuthHeader());
      if (result.success) {
        addAlert('success', result.message);
        await fetchS3Files();
      } else {
        addAlert('error', result.message);
      }
    } catch (error) {
      addAlert('error', `Failed to delete S3 file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [isAuthenticated, getAuthHeader, addAlert, fetchS3Files]);

  const handleDeleteLocalFile = useCallback(async (filename: string) => {
    if (!isAuthenticated) {
      addAlert('error', 'Authentication required');
      return;
    }

    try {
      const result = await apiService.deleteLocalFile(filename, getAuthHeader());
      if (result.success) {
        addAlert('success', result.message);
        await fetchLocalFiles();
      } else {
        addAlert('error', result.message);
      }
    } catch (error) {
      addAlert('error', `Failed to delete local file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [isAuthenticated, getAuthHeader, addAlert, fetchLocalFiles]);

  const handleDownloadFile = useCallback(async (filename: string) => {
    try {
      const blob = await apiService.downloadFile(filename);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      addAlert('success', `Downloaded ${filename}`);
    } catch (error) {
      addAlert('error', `Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [addAlert]);

  const handleExportVets = useCallback(async () => {
    if (!isAuthenticated) {
      addAlert('error', 'Authentication required');
      return;
    }

    try {
      const result = await apiService.exportVets(
        operations.filename,
        operations.source,
        operations.uploadToS3,
        getAuthHeader()
      );
      
      if (result.success) {
        addAlert('success', result.message);
        await fetchAllData();
      } else {
        addAlert('error', result.message);
      }
    } catch (error) {
      addAlert('error', `Failed to export vets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [isAuthenticated, operations, getAuthHeader, addAlert, fetchAllData]);

  const handleExportOwners = useCallback(async () => {
    if (!isAuthenticated) {
      addAlert('error', 'Authentication required');
      return;
    }

    try {
      const result = await apiService.exportOwners(
        operations.filename,
        operations.uploadToS3,
        getAuthHeader()
      );
      
      if (result.success) {
        addAlert('success', result.message);
        await fetchAllData();
      } else {
        addAlert('error', result.message);
      }
    } catch (error) {
      addAlert('error', `Failed to export owners: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [isAuthenticated, operations, getAuthHeader, addAlert, fetchAllData]);

  const handleUploadVets = useCallback(async () => {
    if (!isAuthenticated) {
      addAlert('error', 'Authentication required');
      return;
    }

    try {
      const result = await apiService.uploadVets(
        operations.filename,
        operations.source,
        getAuthHeader()
      );
      
      if (result.success) {
        addAlert('success', result.message);
        await fetchS3Files();
      } else {
        addAlert('error', result.message);
      }
    } catch (error) {
      addAlert('error', `Failed to upload vets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [isAuthenticated, operations, getAuthHeader, addAlert, fetchS3Files]);

  const handleUploadOwners = useCallback(async () => {
    if (!isAuthenticated) {
      addAlert('error', 'Authentication required');
      return;
    }

    try {
      const result = await apiService.uploadOwners(operations.filename, getAuthHeader());
      
      if (result.success) {
        addAlert('success', result.message);
        await fetchS3Files();
      } else {
        addAlert('error', result.message);
      }
    } catch (error) {
      addAlert('error', `Failed to upload owners: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [isAuthenticated, operations, getAuthHeader, addAlert, fetchS3Files]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading S3 data...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Cloud className="h-8 w-8 mr-2 text-blue-600" />
            S3 & Export Management
          </h1>
          <p className="text-gray-600 mt-2">Manage file exports and S3 uploads</p>
        </div>
        <Button onClick={fetchAllData} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh All
        </Button>
      </div>

      {/* Alerts */}
      {alerts.map((alert, index) => (
        <Alert key={index} className={`${alert.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className={alert.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {alert.message}
          </AlertDescription>
        </Alert>
      ))}

      {/* Authentication Section */}
      {adminInfo && (
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="text-orange-600">Admin Authentication</CardTitle>
            <CardDescription>
              Authentication required for admin operations. Expected user: {adminInfo.username}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isAuthenticated ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter username"
                      value={credentials.username}
                      onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={() => handleLogin(credentials.username, credentials.password)}
                      disabled={!credentials.username || !credentials.password}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      Login
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Authenticated as {credentials.username}
                  </Badge>
                </div>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  Logout
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Export Operations */}
      {isAuthenticated && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="text-green-600 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Export Operations
            </CardTitle>
            <CardDescription>Export data to local files and optionally upload to S3</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="filename">Filename (base)</Label>
                  <Input
                    id="filename"
                    value={operations.filename}
                    onChange={(e) => setOperations({ ...operations, filename: e.target.value })}
                    placeholder="export"
                  />
                </div>
                <div>
                  <Label htmlFor="source">Vets Source</Label>
                  <select
                    id="source"
                    value={operations.source}
                    onChange={(e) => setOperations({ ...operations, source: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="merged">Merged (DB + JSON)</option>
                    <option value="database">Database Only</option>
                    <option value="additional">JSON File Only</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="uploadToS3"
                    checked={operations.uploadToS3}
                    onChange={(e) => setOperations({ ...operations, uploadToS3: e.target.checked })}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="uploadToS3">Also upload to S3</Label>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleExportVets} className="bg-green-600 hover:bg-green-700">
                  <FileText className="h-4 w-4 mr-2" />
                  Export Vets
                </Button>
                <Button onClick={handleExportOwners} className="bg-blue-600 hover:bg-blue-700">
                  <FileText className="h-4 w-4 mr-2" />
                  Export Owners
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* S3 Upload Operations */}
      {isAuthenticated && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-blue-600 flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              S3 Upload Operations
            </CardTitle>
            <CardDescription>Direct upload to S3 without local file creation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Button onClick={handleUploadVets} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                <Upload className="h-4 w-4 mr-2" />
                Upload Vets to S3
              </Button>
              <Button onClick={handleUploadOwners} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                <Upload className="h-4 w-4 mr-2" />
                Upload Owners to S3
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* S3 Files */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Cloud className="h-5 w-5 mr-2 text-blue-600" />
                S3 Files
              </span>
              <Button onClick={fetchS3Files} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              {s3Files ? (
                <>
                  {s3Files.credentialsValid ? (
                    `${s3Files.count} files in bucket: ${s3Files.bucketName}`
                  ) : (
                    'S3 credentials not configured'
                  )}
                </>
              ) : (
                'Loading...'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {s3Files?.error ? (
              <Alert className="border-red-500 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700">{s3Files.error}</AlertDescription>
              </Alert>
            ) : s3Files?.files.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No files found in S3 bucket
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {s3Files?.files.map((filename) => (
                  <div key={filename} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium truncate flex-1">{filename}</span>
                    <div className="flex space-x-2 ml-2">
                      <Button
                        onClick={() => handleDeleteS3File(filename)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-800"
                        disabled={!isAuthenticated}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Local Files */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <HardDrive className="h-5 w-5 mr-2 text-green-600" />
                Local Export Files
              </span>
              <Button onClick={fetchLocalFiles} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              {localFiles ? (
                `${localFiles.count} files in: ${localFiles.directory}`
              ) : (
                'Loading...'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {localFiles?.error ? (
              <Alert className="border-red-500 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700">{localFiles.error}</AlertDescription>
              </Alert>
            ) : localFiles?.files.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No local export files found
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {localFiles?.files.map((filename) => (
                  <div key={filename} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium truncate flex-1">{filename}</span>
                    <div className="flex space-x-2 ml-2">
                      <Button
                        onClick={() => handleDownloadFile(filename)}
                        size="sm"
                        variant="outline"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteLocalFile(filename)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-800"
                        disabled={!isAuthenticated}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
