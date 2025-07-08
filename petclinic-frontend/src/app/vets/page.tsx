'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { apiService } from '@/services/api';
import { Vet, VetsResponse } from '@/types/api';

export default function VetsPage() {
  const [vetsData, setVetsData] = useState<VetsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVets();
  }, []);

  const fetchVets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAllVets();
      setVetsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vets');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading vets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertDescription>Error: {error}</AlertDescription>
        </Alert>
        <Button onClick={fetchVets} className="mt-4">Try Again</Button>
      </div>
    );
  }

  if (!vetsData) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">No data available</div>
      </div>
    );
  }

  const { vets, dataSource } = vetsData;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Veterinarians</h1>
          <p className="text-muted-foreground mt-2">
            Manage veterinarian information and data sources
          </p>
        </div>
        <Button onClick={fetchVets} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Data Source Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Data Source Information
            <Badge variant="secondary">{dataSource.type.toUpperCase()}</Badge>
          </CardTitle>
          <CardDescription>
            {dataSource.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{dataSource.counts.database}</div>
              <div className="text-sm text-muted-foreground">Database Vets</div>
              <Badge variant={dataSource.sources.database ? "default" : "secondary"} className="mt-1">
                {dataSource.sources.database ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{dataSource.counts.additional}</div>
              <div className="text-sm text-muted-foreground">JSON File Vets</div>
              <Badge variant={dataSource.sources.additionalJson ? "default" : "secondary"} className="mt-1">
                {dataSource.sources.additionalJson ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{dataSource.counts.merged}</div>
              <div className="text-sm text-muted-foreground">Merged Total</div>
              <Badge variant="default" className="mt-1">Active</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{dataSource.counts.total}</div>
              <div className="text-sm text-muted-foreground">Total Displayed</div>
            </div>
          </div>
          
          {dataSource.sources.additionalJson && (
            <Alert className="mt-4">
              <AlertDescription>
                📄 Additional vets loaded from JSON file (additional-vets.json). 
                These are merged with database vets, with database taking priority for duplicate IDs.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Vets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Veterinarians ({vets.length})</CardTitle>
          <CardDescription>
            Complete list of veterinarians from all sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No veterinarians found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Specialties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vets.map((vet: Vet) => (
                    <TableRow key={vet.id}>
                      <TableCell className="font-mono">{vet.id}</TableCell>
                      <TableCell className="font-medium">
                        {vet.firstName} {vet.lastName}
                      </TableCell>
                      <TableCell>
                        {vet.specialties && vet.specialties.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {vet.specialties.map((specialty) => (
                              <Badge key={specialty.id} variant="outline">
                                {specialty.name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
