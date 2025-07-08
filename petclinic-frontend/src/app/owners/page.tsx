'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';
import { Owner, PagedResponse } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Users, RefreshCw, Plus } from 'lucide-react';

export default function OwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<{ type: 'success' | 'error'; message: string }[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const addAlert = useCallback((type: 'success' | 'error', message: string) => {
    const newAlert = { type, message };
    setAlerts(prev => [...prev, newAlert]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert !== newAlert));
    }, 5000);
  }, []);

  const fetchOwners = useCallback(async (page = 0) => {
    try {
      setLoading(true);
      const data: PagedResponse<Owner> = await apiService.getOwners(page, 10);
      setOwners(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      setCurrentPage(page);
    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || 'Unknown error';
      addAlert('error', `Failed to load owners: ${errorMessage}`);
      console.error('Error fetching owners:', error);
    } finally {
      setLoading(false);
    }
  }, [addAlert]);

  useEffect(() => {
    fetchOwners();
  }, [fetchOwners]);

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchOwners(newPage);
    }
  }, [totalPages, fetchOwners]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading owners...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Users className="h-8 w-8 mr-2 text-blue-600" />
          Pet Owners
        </h1>
        <div className="flex space-x-2">
          <Button 
            onClick={() => fetchOwners(currentPage)}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Owner
          </Button>
        </div>
      </div>

      {alerts.map((alert, index) => (
        <Alert key={index} className={`mb-4 ${alert.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className={alert.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {alert.message}
          </AlertDescription>
        </Alert>
      ))}

      {/* Owners List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {owners.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No owners found</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          owners.map((owner) => (
            <Card key={owner.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-blue-600 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  {owner.firstName} {owner.lastName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Address:</span> {owner.address}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">City:</span> {owner.city}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Phone:</span> {owner.telephone}
                    </p>
                  </div>
                  
                  {owner.pets && owner.pets.length > 0 ? (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Pets:</p>
                      <div className="space-y-1">
                        {owner.pets.map((pet) => (
                          <div key={pet.id} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{pet.name}</span>
                            <Badge 
                              variant="secondary"
                              className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                            >
                              {pet.type.name}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No pets registered</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-6">
          <Button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            variant="outline"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage + 1} of {totalPages} ({totalElements} total)
          </span>
          <Button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}

      {/* Summary */}
      {owners.length > 0 && (
        <Card className="mt-6 border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Total Owners: <span className="font-semibold text-gray-900">{totalElements}</span>
              </p>
              <p className="text-sm text-gray-600">
                Total Pets: <span className="font-semibold text-gray-900">
                  {owners.reduce((sum, owner) => sum + (owner.pets?.length || 0), 0)}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
