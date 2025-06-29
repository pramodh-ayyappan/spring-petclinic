'use client';

import React, { useState, useEffect } from 'react';
import { vetApi } from '@/services/api';
import { Vet, PagedResponse } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Users, Award, Stethoscope, Database, FileText, Merge } from 'lucide-react';

type DataSource = 'merged' | 'database' | 'additional';

export default function VetsPage() {
  const [vets, setVets] = useState<PagedResponse<Vet> | null>(null);
  const [allVets, setAllVets] = useState<Vet[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<'paged' | 'all'>('paged');
  const [dataSource, setDataSource] = useState<DataSource>('merged');

  const fetchVets = async (page: number = 0, source: DataSource = 'merged') => {
    try {
      setLoading(true);
      let data: PagedResponse<Vet>;
      
      switch (source) {
        case 'database':
          data = await vetApi.getDatabaseOnly(page, 6);
          break;
        case 'additional':
          // For additional vets, get all and manually paginate
          const additionalVets = await vetApi.getAdditionalOnly();
          const startIndex = page * 6;
          const endIndex = startIndex + 6;
          data = {
            content: additionalVets.slice(startIndex, endIndex),
            page,
            size: 6,
            totalElements: additionalVets.length,
            totalPages: Math.ceil(additionalVets.length / 6),
            first: page === 0,
            last: endIndex >= additionalVets.length,
            number: page
          };
          break;
        case 'merged':
        default:
          data = await vetApi.getAll(page, 6, 'merged');
          break;
      }
      
      setVets(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch vets');
      console.error('Error fetching vets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllVets = async (source: DataSource = 'merged') => {
    try {
      setLoading(true);
      let data: Vet[];
      
      switch (source) {
        case 'database':
          const backendData = await vetApi.getDatabaseOnly(0, 1000);
          data = backendData.content;
          break;
        case 'additional':
          data = await vetApi.getAdditionalOnly();
          break;
        case 'merged':
        default:
          data = await vetApi.getAllVets('merged');
          break;
      }
      
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
      fetchVets(currentPage, dataSource);
    } else {
      fetchAllVets(dataSource);
    }
  }, [currentPage, viewMode, dataSource]);

  const displayVets = viewMode === 'paged' ? vets?.content || [] : allVets || [];

  const getDataSourceInfo = () => {
    switch (dataSource) {
      case 'database':
        return {
          icon: Database,
          label: 'Backend Only',
          description: 'Data from Spring Boot API',
          color: 'text-facets-teal'
        };
      case 'additional':
        return {
          icon: FileText,
          label: 'JSON Only',
          description: 'Data from additional-vets.json',
          color: 'text-facets-purple'
        };
      case 'merged':
      default:
        return {
          icon: Merge,
          label: 'Merged Data',
          description: 'Backend + JSON combined',
          color: 'text-orange-500'
        };
    }
  };

  const sourceInfo = getDataSourceInfo();
  const SourceIcon = sourceInfo.icon;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-facets-teal"></div>
          <span className="ml-2 text-facets-teal">Loading veterinarians...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalVets = viewMode === 'paged' ? vets?.totalElements || 0 : allVets?.length || 0;
  const additionalVetsCount = displayVets.filter(vet => vet.id > 1000).length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-4">
          Veterinarians Directory
        </h1>
        <p className="text-xl text-gray-600">
          Our expert veterinary team providing comprehensive pet care
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-l-facets-teal bg-gradient-to-r from-facets-teal/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-facets-teal mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Veterinarians</p>
                <p className="text-2xl font-bold text-gray-900">{totalVets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-facets-purple bg-gradient-to-r from-facets-purple/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-facets-purple mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">From JSON Data</p>
                <p className="text-2xl font-bold text-gray-900">{additionalVetsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-500/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Specialties</p>
                <p className="text-2xl font-bold text-gray-900">
                  {displayVets.reduce((acc, vet) => acc + (vet.specialties?.length || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <SourceIcon className={`h-5 w-5 mr-2 ${sourceInfo.color}`} />
            Data Source & View Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Data Source Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Data Source</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'merged', label: 'Merged Data', icon: Merge, color: 'text-orange-500' },
                  { value: 'database', label: 'Backend Only', icon: Database, color: 'text-facets-teal' },
                  { value: 'additional', label: 'JSON Only', icon: FileText, color: 'text-facets-purple' }
                ].map((source) => {
                  const Icon = source.icon;
                  return (
                    <Button
                      key={source.value}
                      variant={dataSource === source.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDataSource(source.value as DataSource)}
                      className={dataSource === source.value ? 
                        "bg-facets-teal hover:bg-facets-teal/90" : 
                        "hover:bg-gray-100"
                      }
                    >
                      <Icon className={`h-4 w-4 mr-1 ${source.color}`} />
                      {source.label}
                    </Button>
                  );
                })}
              </div>
              <p className="text-sm text-gray-500 mt-1">{sourceInfo.description}</p>
            </div>

            {/* View Mode Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">View Mode</label>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'paged' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode('paged')}
                  className={viewMode === 'paged' ? 
                    "bg-facets-purple hover:bg-facets-purple/90" : 
                    "hover:bg-gray-100"
                  }
                >
                  Paginated View
                </Button>
                <Button
                  variant={viewMode === 'all' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode('all')}
                  className={viewMode === 'all' ? 
                    "bg-facets-purple hover:bg-facets-purple/90" : 
                    "hover:bg-gray-100"
                  }
                >
                  Show All
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {displayVets.map((vet) => {
          const isFromJson = vet.id > 1000;
          const cardColor = isFromJson ? 'border-facets-purple/20' : 'border-facets-teal/20';
          const nameColor = isFromJson ? 'text-facets-purple' : 'text-facets-teal';
          
          return (
            <Card key={vet.id} className={`hover:shadow-lg transition-shadow duration-200 ${cardColor}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-lg ${nameColor}`}>
                    Dr. {vet.firstName} {vet.lastName}
                  </CardTitle>
                  <Stethoscope className={`h-5 w-5 ${isFromJson ? 'text-facets-purple' : 'text-facets-teal'}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Specialties:</p>
                    <div className="flex flex-wrap gap-1">
                      {vet.specialties && vet.specialties.length > 0 ? (
                        vet.specialties.map((specialty) => (
                          <Badge 
                            key={specialty.id} 
                            variant="secondary"
                            className={`text-xs ${
                              isFromJson 
                                ? 'bg-facets-purple/10 text-facets-purple hover:bg-facets-purple/20' 
                                : 'bg-facets-teal/10 text-facets-teal hover:bg-facets-teal/20'
                            }`}
                          >
                            {specialty.name}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          General Practice
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Vet ID: {vet.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isFromJson 
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
          );
        })}
      </div>

      {/* Pagination for Paged View */}
      {viewMode === 'paged' && vets && vets.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={vets.first}
            className="hover:bg-facets-teal/10 hover:border-facets-teal"
          >
            Previous
          </Button>
          
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {vets.page + 1} of {vets.totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(vets.totalPages - 1, currentPage + 1))}
            disabled={vets.last}
            className="hover:bg-facets-teal/10 hover:border-facets-teal"
          >
            Next
          </Button>
        </div>
      )}

      {/* Info message for merged data */}
      {dataSource === 'merged' && additionalVetsCount > 0 && (
        <div className="mt-8">
          <Alert className="border-orange-200 bg-orange-50">
            <Merge className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
                             Showing merged data: {totalVets - additionalVetsCount} vets from database + {additionalVetsCount} from JSON file. 
               Vets with ID &gt; 1000 are loaded from the JSON file.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
} 
