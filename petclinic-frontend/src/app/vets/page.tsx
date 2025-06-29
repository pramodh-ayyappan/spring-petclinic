'use client';

import React, { useState, useEffect } from 'react';
import { vetApi } from '@/services/api';
import { Vet, PagedResponse } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Users, Award, Stethoscope } from 'lucide-react';

export default function VetsPage() {
  const [vets, setVets] = useState<PagedResponse<Vet> | null>(null);
  const [allVets, setAllVets] = useState<Vet[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<'paginated' | 'all'>('all');

  const fetchVets = async (page: number = 0) => {
    try {
      setLoading(true);
      if (viewMode === 'all') {
        const data = await vetApi.getAllSimple();
        setAllVets(data);
      } else {
        const data = await vetApi.getAll(page, 6);
        setVets(data);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch veterinarians');
      console.error('Error fetching vets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVets(currentPage);
  }, [currentPage, viewMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const getSpecialtyVariant = (specialty: string) => {
    const variants = {
      radiology: 'default',
      surgery: 'destructive',
      dentistry: 'secondary',
      cardiology: 'outline',
      neurology: 'default',
    };
    return variants[specialty.toLowerCase() as keyof typeof variants] || 'default';
  };

  const displayVets = viewMode === 'all' ? allVets : vets?.content;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Veterinarians</h1>
          <p className="text-lg text-muted-foreground">Meet our expert veterinary team</p>
        </div>

        {/* View Mode Toggle */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <span className="font-medium text-foreground">View Mode:</span>
              <Button
                variant={viewMode === 'all' ? 'default' : 'outline'}
                onClick={() => setViewMode('all')}
              >
                Show All
              </Button>
              <Button
                variant={viewMode === 'paginated' ? 'default' : 'outline'}
                onClick={() => setViewMode('paginated')}
              >
                Paginated View
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading */}
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="ml-4 text-lg">Loading veterinarians...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Vets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {displayVets?.map((vet) => (
                <Card key={vet.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-primary" />
                      Dr. {vet.firstName} {vet.lastName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          Specialties:
                        </h4>
                        {vet.specialties && vet.specialties.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {vet.specialties.map((specialty) => (
                              <Badge
                                key={specialty.id}
                                variant={getSpecialtyVariant(specialty.name) as any}
                              >
                                {specialty.name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <Badge variant="secondary">General Practice</Badge>
                        )}
                      </div>
                      
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">
                          <strong>Vet ID:</strong> {vet.id}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination for paginated view */}
            {viewMode === 'paginated' && vets && vets.totalPages > 1 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      Page {vets.number + 1} of {vets.totalPages} 
                      ({vets.totalElements} total veterinarians)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={vets.first}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={vets.last}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Veterinary Team Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-bold text-primary">
                      {displayVets?.length || 0}
                    </p>
                    <p className="text-muted-foreground">Total Veterinarians</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-bold text-primary">
                      {displayVets?.reduce((acc, vet) => acc + (vet.specialties?.length || 0), 0) || 0}
                    </p>
                    <p className="text-muted-foreground">Total Specialties</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-bold text-primary">
                      {displayVets?.filter(vet => vet.specialties && vet.specialties.length > 0).length || 0}
                    </p>
                    <p className="text-muted-foreground">Specialists</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* No Results */}
            {displayVets && displayVets.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">No veterinarians found.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
} 
