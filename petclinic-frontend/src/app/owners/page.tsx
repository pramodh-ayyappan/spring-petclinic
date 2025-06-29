'use client';

import React, { useState, useEffect } from 'react';
import { ownerApi } from '@/services/api';
import { Owner, PagedResponse, CreateOwnerRequest } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Search, Plus, Edit, Trash2 } from 'lucide-react';

export default function OwnersPage() {
  const [owners, setOwners] = useState<PagedResponse<Owner> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  
  const [newOwner, setNewOwner] = useState<CreateOwnerRequest>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    telephone: ''
  });

  const fetchOwners = async (page: number = 0, search?: string) => {
    try {
      setLoading(true);
      const data = search 
        ? await ownerApi.search(search, page, 10)
        : await ownerApi.getAll(page, 10);
      setOwners(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch owners');
      console.error('Error fetching owners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners(currentPage, searchTerm || undefined);
  }, [currentPage, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchOwners(0, searchTerm || undefined);
  };

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ownerApi.create(newOwner);
      setNewOwner({ firstName: '', lastName: '', address: '', city: '', telephone: '' });
      setShowCreateForm(false);
      fetchOwners(currentPage, searchTerm || undefined);
    } catch (err) {
      setError('Failed to create owner');
      console.error('Error creating owner:', err);
    }
  };

  const handleUpdateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOwner) return;
    
    try {
      await ownerApi.update(editingOwner.id, {
        firstName: editingOwner.firstName,
        lastName: editingOwner.lastName,
        address: editingOwner.address,
        city: editingOwner.city,
        telephone: editingOwner.telephone
      });
      setEditingOwner(null);
      fetchOwners(currentPage, searchTerm || undefined);
    } catch (err) {
      setError('Failed to update owner');
      console.error('Error updating owner:', err);
    }
  };

  const handleDeleteOwner = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this owner?')) {
      try {
        await ownerApi.delete(id);
        fetchOwners(currentPage, searchTerm || undefined);
      } catch (err) {
        setError('Failed to delete owner');
        console.error('Error deleting owner:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Pet <span className="text-facets-teal">Owners</span>
          </h1>
          <p className="text-lg text-muted-foreground">Manage pet owners and their information</p>
        </div>

        {/* Search and Create */}
        <Card className="mb-6 border-l-4 border-l-facets-teal">
          <CardHeader>
            <CardTitle className="text-facets-teal">Search & Manage Owners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search by last name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 focus:ring-facets-teal focus:border-facets-teal"
                  />
                </div>
                <Button type="submit" className="bg-facets-teal hover:bg-facets-teal/90 text-white">
                  Search
                </Button>
              </form>
              <Button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                variant={showCreateForm ? "outline" : "default"}
                className={showCreateForm ? "border-facets-purple text-facets-purple hover:bg-facets-purple hover:text-white" : "bg-facets-purple hover:bg-facets-purple/90 text-white"}
              >
                <Plus className="h-4 w-4 mr-2" />
                {showCreateForm ? 'Cancel' : 'Add New Owner'}
              </Button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
              <Card className="mt-4 border-2 border-facets-purple/20 bg-facets-purple/5">
                <CardHeader>
                  <CardTitle className="text-facets-purple">Create New Owner</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateOwner} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-facets-purple">First Name</label>
                      <Input
                        value={newOwner.firstName}
                        onChange={(e) => setNewOwner({...newOwner, firstName: e.target.value})}
                        required
                        className="focus:ring-facets-purple focus:border-facets-purple"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-facets-purple">Last Name</label>
                      <Input
                        value={newOwner.lastName}
                        onChange={(e) => setNewOwner({...newOwner, lastName: e.target.value})}
                        required
                        className="focus:ring-facets-purple focus:border-facets-purple"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-facets-purple">Address</label>
                      <Input
                        value={newOwner.address}
                        onChange={(e) => setNewOwner({...newOwner, address: e.target.value})}
                        required
                        className="focus:ring-facets-purple focus:border-facets-purple"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-facets-purple">City</label>
                      <Input
                        value={newOwner.city}
                        onChange={(e) => setNewOwner({...newOwner, city: e.target.value})}
                        required
                        className="focus:ring-facets-purple focus:border-facets-purple"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-facets-purple">Telephone</label>
                      <Input
                        value={newOwner.telephone}
                        onChange={(e) => setNewOwner({...newOwner, telephone: e.target.value})}
                        required
                        className="focus:ring-facets-purple focus:border-facets-purple"
                      />
                    </div>
                    <div className="flex gap-2 md:col-span-2">
                      <Button type="submit" className="bg-facets-purple hover:bg-facets-purple/90 text-white">
                        Create Owner
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} className="border-facets-purple text-facets-purple hover:bg-facets-purple hover:text-white">
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-facets-teal"></div>
                <p className="ml-4 text-lg">Loading owners...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Owners List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {owners?.content?.map((owner) => (
                <Card key={owner.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-facets-teal">
                  {editingOwner?.id === owner.id ? (
                    // Edit Form
                    <form onSubmit={handleUpdateOwner}>
                      <CardHeader>
                        <CardTitle className="text-lg text-facets-teal">Edit Owner</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-facets-teal">First Name</label>
                          <Input
                            value={editingOwner.firstName}
                            onChange={(e) => setEditingOwner({...editingOwner, firstName: e.target.value})}
                            required
                            className="focus:ring-facets-teal focus:border-facets-teal"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-facets-teal">Last Name</label>
                          <Input
                            value={editingOwner.lastName}
                            onChange={(e) => setEditingOwner({...editingOwner, lastName: e.target.value})}
                            required
                            className="focus:ring-facets-teal focus:border-facets-teal"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-facets-teal">Address</label>
                          <Input
                            value={editingOwner.address}
                            onChange={(e) => setEditingOwner({...editingOwner, address: e.target.value})}
                            required
                            className="focus:ring-facets-teal focus:border-facets-teal"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-facets-teal">City</label>
                          <Input
                            value={editingOwner.city}
                            onChange={(e) => setEditingOwner({...editingOwner, city: e.target.value})}
                            required
                            className="focus:ring-facets-teal focus:border-facets-teal"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-facets-teal">Telephone</label>
                          <Input
                            value={editingOwner.telephone}
                            onChange={(e) => setEditingOwner({...editingOwner, telephone: e.target.value})}
                            required
                            className="focus:ring-facets-teal focus:border-facets-teal"
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2">
                        <Button type="submit" size="sm" className="bg-facets-teal hover:bg-facets-teal/90 text-white">
                          Save
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setEditingOwner(null)} className="border-facets-teal text-facets-teal hover:bg-facets-teal hover:text-white">
                          Cancel
                        </Button>
                      </CardFooter>
                    </form>
                  ) : (
                    // Display Mode
                    <>
                      <CardHeader>
                        <CardTitle className="text-lg text-facets-teal">
                          {owner.firstName} {owner.lastName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Address:</span> {owner.address}</p>
                          <p><span className="font-medium">City:</span> {owner.city}</p>
                          <p><span className="font-medium">Phone:</span> {owner.telephone}</p>
                          {owner.pets && owner.pets.length > 0 && (
                            <div>
                              <span className="font-medium">Pets:</span>
                              <ul className="ml-4 mt-1">
                                {owner.pets.map((pet) => (
                                  <li key={pet.id} className="text-muted-foreground">
                                    • {pet.name} ({pet.type?.name})
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingOwner(owner)}
                          className="border-facets-teal text-facets-teal hover:bg-facets-teal hover:text-white"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteOwner(owner.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </CardFooter>
                    </>
                  )}
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {owners && owners.totalPages > 1 && (
              <Card className="border-l-4 border-l-facets-purple">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      Page {owners.number + 1} of {owners.totalPages} 
                      ({owners.totalElements} total owners)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={owners.first}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="border-facets-purple text-facets-purple hover:bg-facets-purple hover:text-white"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={owners.last}
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
            {owners && owners.content.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-lg text-muted-foreground">No owners found.</p>
                    {searchTerm && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Try adjusting your search terms or add a new owner.
                      </p>
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
