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
  const [viewMode, setViewMode] = useState<'paged' | 'all'>('paged');

  const fetchVets = async (page: number = 0) => {
    try {
      setLoading(true);
      const data = await vetApi.getAll(page, 6);
      setVets(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch vets');
      console.error('Error fetching vets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllVets = async () => {
    try {
      setLoading(true);
      const data = await vetApi.getAllVets();
      setAllVets(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch all vets');
      console.error('Error fetching all vets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'paged') {
      fetchVets(currentPage);
    } else {
      fetchAllVets();
    }
  }, [currentPage, viewMode]);

  const displayVets = viewMode === 'paged' ? vets?.content || [] : allVets || [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Veterinary <span className="text-facets-purple">Specialists</span>
          </h1>
          <p className="text-lg text-muted-foreground">Meet our qualified veterinary team</p>
        </div>

        {/* View Controls */}
        <Card className="mb-6 border-l-4 border-l-facets-purple">
          <CardHeader>
            <CardTitle className="text-facets-purple flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              View Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'paged' ? 'default' : 'outline'}
                  onClick={() => {
                    setViewMode('paged');
                    setCurrentPage(0);
                  }}
                  className={viewMode === 'paged' ? "bg-facets-purple hover:bg-facets-purple/90 text-white" : "border-facets-purple text-facets-purple hover:bg-facets-purple hover:text-white"}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Paged View
                </Button>
                <Button
                  variant={viewMode === 'all' ? 'default' : 'outline'}
                  onClick={() => setViewMode('all')}
                  className={viewMode === 'all' ? "bg-facets-teal hover:bg-facets-teal/90 text-white" : "border-facets-teal text-facets-teal hover:bg-facets-teal hover:text-white"}
                >
                  <Award className="h-4 w-4 mr-2" />
                  All Specialists
                </Button>
              </div>
              
              {viewMode === 'paged' && vets && (
                <div className="text-sm text-muted-foreground">
                  Showing {vets.content.length} of {vets.totalElements} vets
                </div>
              )}
              
              {viewMode === 'all' && allVets && (
                <div className="text-sm text-muted-foreground">
                  Showing all {allVets.length} veterinary specialists
                </div>
              )}
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-facets-purple"></div>
                <p className="ml-4 text-lg">Loading veterinarians...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Vets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {displayVets.map((vet, index) => (
                <Card key={vet.id} className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 ${index % 2 === 0 ? 'border-l-facets-purple' : 'border-l-facets-teal'}`}>
                  <CardHeader>
                    <CardTitle className={`text-lg ${index % 2 === 0 ? 'text-facets-purple' : 'text-facets-teal'}`}>
                      Dr. {vet.firstName} {vet.lastName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {vet.specialties && vet.specialties.length > 0 ? (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Specialties:</p>
                          <div className="flex flex-wrap gap-2">
                            {vet.specialties.map((specialty, idx) => (
                              <Badge 
                                key={specialty.id} 
                                variant="secondary"
                                className={`${
                                  idx % 2 === 0 
                                    ? 'bg-facets-purple/10 text-facets-purple border-facets-purple/20' 
                                    : 'bg-facets-teal/10 text-facets-teal border-facets-teal/20'
                                } border`}
                              >
                                {specialty.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground italic">
                          General Practice
                        </div>
                      )}
                      
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Vet ID: {vet.id}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            index % 2 === 0 
                              ? 'bg-facets-purple/10 text-facets-purple' 
                              : 'bg-facets-teal/10 text-facets-teal'
                          }`}>
                            Available
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination for Paged View */}
            {viewMode === 'paged' && vets && vets.totalPages > 1 && (
              <Card className="border-l-4 border-l-facets-purple">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      Page {vets.number + 1} of {vets.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={vets.first}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="border-facets-purple text-facets-purple hover:bg-facets-purple hover:text-white"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={vets.last}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="border-facets-purple text-facets-purple hover:bg-facets-purple hover:text-white"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Results */}
            {displayVets.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">No veterinarians found.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Please check back later or contact administration.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary Stats */}
            {displayVets.length > 0 && (
              <Card className="mt-6 gradient-facets/5 border-0">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-facets-purple">{displayVets.length}</div>
                      <div className="text-sm text-muted-foreground">Total Veterinarians</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-facets-teal">
                        {displayVets.reduce((acc, vet) => acc + (vet.specialties?.length || 0), 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Specialties</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-facets-purple">
                        {new Set(displayVets.flatMap(vet => vet.specialties?.map(s => s.name) || [])).size}
                      </div>
                      <div className="text-sm text-muted-foreground">Unique Specialties</div>
                    </div>
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
