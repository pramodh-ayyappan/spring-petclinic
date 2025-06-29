'use client';

import React, { useState, useEffect } from 'react';
import { vetApi } from '@/services/api';
import { Vet, PagedResponse } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

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

  const getSpecialtyColor = (specialty: string) => {
    const colors = {
      radiology: 'bg-neo-blue text-neo-secondary',
      surgery: 'bg-neo-red text-neo-secondary',
      dentistry: 'bg-neo-green text-neo-primary',
      cardiology: 'bg-neo-purple text-neo-secondary',
      neurology: 'bg-neo-yellow text-neo-primary',
      default: 'bg-neo-accent text-neo-secondary'
    };
    return colors[specialty.toLowerCase() as keyof typeof colors] || colors.default;
  };

  const displayVets = viewMode === 'all' ? allVets : vets?.content;

  return (
    <div className="min-h-screen bg-neo-gray p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neo-primary mb-4">Veterinarians</h1>
          <p className="text-lg text-neo-dark-gray">Meet our expert veterinary team</p>
        </div>

        {/* View Mode Toggle */}
        <Card className="mb-6">
          <CardContent>
            <div className="flex gap-4 items-center">
              <span className="font-bold text-neo-primary">View Mode:</span>
              <Button
                variant={viewMode === 'all' ? 'blue' : 'default'}
                onClick={() => setViewMode('all')}
              >
                Show All
              </Button>
              <Button
                variant={viewMode === 'paginated' ? 'blue' : 'default'}
                onClick={() => setViewMode('paginated')}
              >
                Paginated View
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card variant="accent" className="mb-6">
            <CardContent>
              <p className="text-neo-secondary font-bold">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {loading ? (
          <Card>
            <CardContent>
              <p className="text-center text-xl font-bold">Loading veterinarians...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Vets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {displayVets?.map((vet) => (
                <Card key={vet.id} variant="default">
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      Dr. {vet.firstName} {vet.lastName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold text-neo-primary mb-2">Specialties:</h4>
                        {vet.specialties && vet.specialties.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {vet.specialties.map((specialty) => (
                              <span
                                key={specialty.id}
                                className={`px-3 py-1 text-sm font-bold border-2 border-neo-primary ${getSpecialtyColor(specialty.name)}`}
                              >
                                {specialty.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-neo-dark-gray italic">General Practice</span>
                        )}
                      </div>
                      
                      <div className="pt-2 border-t-2 border-neo-primary">
                        <p className="text-sm text-neo-dark-gray">
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
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-neo-dark-gray">
                      Showing {vets.content.length} of {vets.totalElements} veterinarians
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={vets.first}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </Button>
                      <span className="px-4 py-2 font-bold">
                        Page {vets.page + 1} of {vets.totalPages}
                      </span>
                      <Button
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
            <Card variant="blue" className="mt-6">
              <CardHeader>
                <CardTitle>Veterinary Team Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-neo-secondary">
                      {displayVets?.length || 0}
                    </p>
                    <p className="text-neo-secondary">Total Veterinarians</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-neo-secondary">
                      {displayVets?.reduce((acc, vet) => acc + (vet.specialties?.length || 0), 0) || 0}
                    </p>
                    <p className="text-neo-secondary">Total Specialties</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-neo-secondary">
                      {displayVets?.filter(vet => vet.specialties && vet.specialties.length > 0).length || 0}
                    </p>
                    <p className="text-neo-secondary">Specialists</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Specialties */}
            {displayVets && displayVets.length > 0 && (
              <Card variant="green" className="mt-6">
                <CardHeader>
                  <CardTitle>Available Specialties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(
                      new Set(
                        displayVets
                          .flatMap(vet => vet.specialties || [])
                          .map(specialty => specialty.name)
                      )
                    ).map((specialtyName) => (
                      <span
                        key={specialtyName}
                        className={`px-4 py-2 font-bold border-2 border-neo-primary ${getSpecialtyColor(specialtyName)}`}
                      >
                        {specialtyName}
                      </span>
                    ))}
                    {displayVets.some(vet => !vet.specialties || vet.specialties.length === 0) && (
                      <span className="px-4 py-2 font-bold border-2 border-neo-primary bg-neo-secondary text-neo-primary">
                        General Practice
                      </span>
                    )}
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
