'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { s3Api } from '@/services/api';
import { 
  S3FilesResponse, 
  S3DetailedFilesResponse, 
  LocalFilesResponse,
  S3FileInfo
} from '@/types/api';
import AdminAuth from '@/components/AdminAuth';

function S3ManagementPageContent({
  credentials,
  showLogin,
}: {
  credentials: { username: string; password: string } | null;
  showLogin: () => void;
}) {
  // State management
  const [s3Files, setS3Files] = useState<S3FilesResponse | null>(null);
  const [s3DetailedFiles, setS3DetailedFiles] = useState<S3DetailedFilesResponse | null>(null);
  const [localFiles, setLocalFiles] = useState<LocalFilesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<{ type: 'success' | 'error', message: string }[]>([]);
  
  // Form state
  const [exportForms, setExportForms] = useState({
    vetsFilename: 'vets',
    vetsSource: 'merged',
    vetsUploadToS3: false,
    ownersFilename: 'owners',
    ownersUploadToS3: false,
    uploadVetsFilename: 'vets',
    uploadVetsSource: 'merged',
    uploadOwnersFilename: 'owners',
  });

  // Utility functions
  const addAlert = useCallback((type: 'success' | 'error', message: string) => {
    setAlerts(prev => [...prev, { type, message }]);
    setTimeout(() => {
      setAlerts(prev => prev.slice(1));
    }, 5000);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  // Data loading functions
  const loadS3Files = useCallback(async () => {
    try {
      setLoading(true);
      const response = await s3Api.listFiles();
      setS3Files(response);
    } catch (error) {
      addAlert('error', 'Failed to load S3 files');
      console.error('Error loading S3 files:', error);
    } finally {
      setLoading(false);
    }
  }, [addAlert]);

  const loadS3DetailedFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await s3Api.listFilesDetailed();
      setS3DetailedFiles(response);
    } catch (error) {
      addAlert('error', 'Failed to load detailed S3 files');
      console.error('Error loading detailed S3 files:', error);
    } finally {
      setLoading(false);
    }
  }, [addAlert]);

  const loadLocalFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await s3Api.listLocalFiles();
      setLocalFiles(response);
    } catch (error) {
      addAlert('error', 'Failed to load local files');
      console.error('Error loading local files:', error);
    } finally {
      setLoading(false);
    }
  }, [addAlert]);

  // Action functions
  const handleDeleteS3File = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}" from S3?`)) return;
    
    try {
      const response = await s3Api.deleteFile(filename, credentials!.username, credentials!.password);
      if (response.success) {
        addAlert('success', response.message);
        loadS3Files();
        loadS3DetailedFiles();
      } else {
        addAlert('error', response.message);
      }
    } catch (error) {
      addAlert('error', 'Failed to delete S3 file');
      console.error('Error deleting S3 file:', error);
    }
  };

  const handleDeleteLocalFile = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}" from local storage?`)) return;
    
    try {
      const response = await s3Api.deleteLocalFile(filename, credentials!.username, credentials!.password);
      if (response.success) {
        addAlert('success', response.message);
        loadLocalFiles();
      } else {
        addAlert('error', response.message);
      }
    } catch (error) {
      addAlert('error', 'Failed to delete local file');
      console.error('Error deleting local file:', error);
    }
  };

  const handleDownloadFile = async (filename: string) => {
    try {
      const blob = await s3Api.downloadFile(filename);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      addAlert('success', `File "${filename}" downloaded successfully`);
    } catch (error) {
      addAlert('error', 'Failed to download file');
      console.error('Error downloading file:', error);
    }
  };

  const handleExportVets = async () => {
    try {
      const response = await s3Api.exportVets(
        exportForms.vetsFilename,
        exportForms.vetsSource,
        exportForms.vetsUploadToS3,
        credentials!.username,
        credentials!.password
      );
      if (response.success) {
        addAlert('success', response.message);
        loadLocalFiles();
        if (exportForms.vetsUploadToS3) {
          loadS3Files();
          loadS3DetailedFiles();
        }
      } else {
        addAlert('error', response.message);
      }
    } catch (error) {
      addAlert('error', 'Failed to export vets data');
      console.error('Error exporting vets:', error);
    }
  };

  const handleExportOwners = async () => {
    try {
      const response = await s3Api.exportOwners(
        exportForms.ownersFilename,
        exportForms.ownersUploadToS3,
        credentials!.username,
        credentials!.password
      );
      if (response.success) {
        addAlert('success', response.message);
        loadLocalFiles();
        if (exportForms.ownersUploadToS3) {
          loadS3Files();
          loadS3DetailedFiles();
        }
      } else {
        addAlert('error', response.message);
      }
    } catch (error) {
      addAlert('error', 'Failed to export owners data');
      console.error('Error exporting owners:', error);
    }
  };

  const handleUploadVets = async () => {
    try {
      const response = await s3Api.uploadVets(
        exportForms.uploadVetsFilename,
        exportForms.uploadVetsSource,
        credentials!.username,
        credentials!.password
      );
      if (response.success) {
        addAlert('success', response.message);
        loadS3Files();
        loadS3DetailedFiles();
      } else {
        addAlert('error', response.message);
      }
    } catch (error) {
      addAlert('error', 'Failed to upload vets data');
      console.error('Error uploading vets:', error);
    }
  };

  const handleUploadOwners = async () => {
    try {
      const response = await s3Api.uploadOwners(
        exportForms.uploadOwnersFilename,
        credentials!.username,
        credentials!.password
      );
      if (response.success) {
        addAlert('success', response.message);
        loadS3Files();
        loadS3DetailedFiles();
      } else {
        addAlert('error', response.message);
      }
    } catch (error) {
      addAlert('error', 'Failed to upload owners data');
      console.error('Error uploading owners:', error);
    }
  };

  // Load data on component mount - only if authenticated
  useEffect(() => {
    if (credentials) {
      loadS3Files();
      loadS3DetailedFiles();
      loadLocalFiles();
    }
  }, [credentials, loadS3Files, loadS3DetailedFiles, loadLocalFiles]);

  // Show login prompt if not authenticated
  if (!credentials) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="mb-8 text-center">
          <h1 className="gradient-text text-4xl font-bold mb-4">
            S3 & Export Management
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Admin authentication required to access S3 management features
          </p>
          
          <div className="max-w-md mx-auto bg-card border rounded-lg p-6 shadow-sm">
            <div className="mb-6">
              <div className="w-16 h-16 bg-facets-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-facets-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Admin Access Required</h3>
              <p className="text-gray-600 text-sm">
                Please log in with your admin credentials to access S3 export and file management features.
              </p>
            </div>
            
            <Button 
              onClick={showLogin} 
              className="w-full bg-facets-teal hover:bg-facets-teal/90"
            >
              Login as Admin
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="gradient-text text-4xl font-bold mb-4">
          S3 & Export Management
        </h1>
        <p className="text-xl text-gray-600">
          Manage S3 uploads, local exports, and file operations for PetClinic data
        </p>
      </div>

      {/* Alerts */}
      {alerts.map((alert, index) => (
        <Alert key={index} className={alert.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
          <AlertDescription className={alert.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {alert.message}
          </AlertDescription>
        </Alert>
      ))}

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export to Local */}
        <Card>
          <CardHeader>
            <CardTitle className="text-facets-teal">Export to Local Files</CardTitle>
            <CardDescription>
              Export data to local JSON files with optional S3 backup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Vets Export */}
            <div className="space-y-2">
              <Label htmlFor="vets-filename">Vets Export</Label>
              <div className="flex space-x-2">
                <Input
                  id="vets-filename"
                  placeholder="Filename"
                  value={exportForms.vetsFilename}
                  onChange={(e) => setExportForms({...exportForms, vetsFilename: e.target.value})}
                />
                <select
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={exportForms.vetsSource}
                  onChange={(e) => setExportForms({...exportForms, vetsSource: e.target.value})}
                >
                  <option value="merged">Merged</option>
                  <option value="database">Database Only</option>
                  <option value="additional">Additional Only</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="vets-upload-s3"
                  checked={exportForms.vetsUploadToS3}
                  onChange={(e) => setExportForms({...exportForms, vetsUploadToS3: e.target.checked})}
                />
                <Label htmlFor="vets-upload-s3">Also upload to S3</Label>
              </div>
              <Button onClick={handleExportVets} className="w-full bg-facets-teal hover:bg-facets-teal/90">
                Export Vets
              </Button>
            </div>

            {/* Owners Export */}
            <div className="space-y-2">
              <Label htmlFor="owners-filename">Owners Export</Label>
              <Input
                id="owners-filename"
                placeholder="Filename"
                value={exportForms.ownersFilename}
                onChange={(e) => setExportForms({...exportForms, ownersFilename: e.target.value})}
              />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="owners-upload-s3"
                  checked={exportForms.ownersUploadToS3}
                  onChange={(e) => setExportForms({...exportForms, ownersUploadToS3: e.target.checked})}
                />
                <Label htmlFor="owners-upload-s3">Also upload to S3</Label>
              </div>
              <Button onClick={handleExportOwners} className="w-full bg-facets-purple hover:bg-facets-purple/90">
                Export Owners
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upload to S3 Only */}
        <Card>
          <CardHeader>
            <CardTitle className="text-facets-purple">Upload to S3</CardTitle>
            <CardDescription>
              Upload data directly to S3 without local files
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Vets Upload */}
            <div className="space-y-2">
              <Label htmlFor="upload-vets-filename">Vets Upload</Label>
              <div className="flex space-x-2">
                <Input
                  id="upload-vets-filename"
                  placeholder="Filename"
                  value={exportForms.uploadVetsFilename}
                  onChange={(e) => setExportForms({...exportForms, uploadVetsFilename: e.target.value})}
                />
                <select
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={exportForms.uploadVetsSource}
                  onChange={(e) => setExportForms({...exportForms, uploadVetsSource: e.target.value})}
                >
                  <option value="merged">Merged</option>
                  <option value="database">Database Only</option>
                  <option value="additional">Additional Only</option>
                </select>
              </div>
              <Button onClick={handleUploadVets} className="w-full bg-facets-teal hover:bg-facets-teal/90">
                Upload Vets to S3
              </Button>
            </div>

            {/* Owners Upload */}
            <div className="space-y-2">
              <Label htmlFor="upload-owners-filename">Owners Upload</Label>
              <Input
                id="upload-owners-filename"
                placeholder="Filename"
                value={exportForms.uploadOwnersFilename}
                onChange={(e) => setExportForms({...exportForms, uploadOwnersFilename: e.target.value})}
              />
              <Button onClick={handleUploadOwners} className="w-full bg-facets-purple hover:bg-facets-purple/90">
                Upload Owners to S3
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File Management Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* S3 Files */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-facets-teal">S3 Files</CardTitle>
              <CardDescription>
                Files stored in S3 bucket
                {s3Files?.bucketName && (
                  <span className="ml-2">
                    <Badge variant="outline" className="text-facets-teal border-facets-teal">
                      {s3Files.bucketName}
                    </Badge>
                  </span>
                )}
                {s3Files && !s3Files.credentialsValid && (
                  <span className="ml-2">
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      Simulated
                    </Badge>
                  </span>
                )}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                loadS3Files();
                loadS3DetailedFiles();
              }}
              disabled={loading}
            >
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {s3DetailedFiles && s3DetailedFiles.files.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Modified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {s3DetailedFiles.files.map((file: S3FileInfo) => (
                    <TableRow key={file.key}>
                      <TableCell className="font-medium">{file.key}</TableCell>
                      <TableCell>{formatFileSize(file.size)}</TableCell>
                      <TableCell>{formatDate(file.lastModified)}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteS3File(file.key)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-500 text-center py-4">
                {loading ? 'Loading...' : 'No S3 files found'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Local Files */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-facets-purple">Local Files</CardTitle>
              <CardDescription>
                Exported files in local directory
                {localFiles?.directory && (
                  <span className="block text-xs mt-1 font-mono text-gray-600">
                    {localFiles.directory}
                  </span>
                )}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadLocalFiles}
              disabled={loading}
            >
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {localFiles && localFiles.files.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {localFiles.files.map((filename: string) => (
                    <TableRow key={filename}>
                      <TableCell className="font-medium">{filename}</TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadFile(filename)}
                        >
                          Download
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteLocalFile(filename)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-500 text-center py-4">
                {loading ? 'Loading...' : 'No local files found'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-facets-teal">
                {s3Files?.count || 0}
              </div>
              <div className="text-sm text-gray-600">S3 Files</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-facets-purple">
                {localFiles?.count || 0}
              </div>
              <div className="text-sm text-gray-600">Local Files</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {s3DetailedFiles?.files.reduce((acc, file) => acc + file.size, 0) 
                  ? formatFileSize(s3DetailedFiles.files.reduce((acc, file) => acc + file.size, 0))
                  : '0 Bytes'
                }
              </div>
              <div className="text-sm text-gray-600">S3 Storage Used</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function S3ManagementPage() {
  return (
    <AdminAuth>
      {(credentials, showLogin) => (
        <S3ManagementPageContent credentials={credentials} showLogin={showLogin} />
      )}
    </AdminAuth>
  );
} 
