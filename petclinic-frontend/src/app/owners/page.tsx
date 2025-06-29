'use client';

import React, { useState, useEffect } from 'react';
import { ownerApi } from '@/services/api';
import { Owner, PagedResponse, CreateOwnerRequest } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';

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
      const data = await ownerApi.getAll(page, 10, search);
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
    <div className="min-h-screen bg-neo-gray p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neo-primary mb-4">Pet Owners</h1>
          <p className="text-lg text-neo-dark-gray">Manage pet owners and their information</p>
        </div>

        {/* Search and Create */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search & Manage Owners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <Input
                  type="text"
                  placeholder="Search by last name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="blue">
                  Search
                </Button>
              </form>
              <Button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                variant="success"
              >
                {showCreateForm ? 'Cancel' : 'Add New Owner'}
              </Button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
              <Card variant="green" className="mt-4">
                <CardHeader>
                  <CardTitle>Create New Owner</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateOwner} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      value={newOwner.firstName}
                      onChange={(e) => setNewOwner({...newOwner, firstName: e.target.value})}
                      required
                    />
                    <Input
                      label="Last Name"
                      value={newOwner.lastName}
                      onChange={(e) => setNewOwner({...newOwner, lastName: e.target.value})}
                      required
                    />
                    <Input
                      label="Address"
                      value={newOwner.address}
                      onChange={(e) => setNewOwner({...newOwner, address: e.target.value})}
                      required
                    />
                    <Input
                      label="City"
                      value={newOwner.city}
                      onChange={(e) => setNewOwner({...newOwner, city: e.target.value})}
                      required
                    />
                    <Input
                      label="Telephone"
                      value={newOwner.telephone}
                      onChange={(e) => setNewOwner({...newOwner, telephone: e.target.value})}
                      required
                    />
                    <div className="flex gap-2">
                      <Button type="submit" variant="success">Create Owner</Button>
                      <Button type="button" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
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
              <p className="text-center text-xl font-bold">Loading owners...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Owners List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {owners?.content.map((owner) => (
                <Card key={owner.id} variant="default">
                  <CardHeader>
                    <CardTitle>{owner.firstName} {owner.lastName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editingOwner?.id === owner.id ? (
                      <form onSubmit={handleUpdateOwner} className="space-y-3">
                        <Input
                          value={editingOwner.firstName}
                          onChange={(e) => setEditingOwner({...editingOwner, firstName: e.target.value})}
                          placeholder="First Name"
                        />
                        <Input
                          value={editingOwner.lastName}
                          onChange={(e) => setEditingOwner({...editingOwner, lastName: e.target.value})}
                          placeholder="Last Name"
                        />
                        <Input
                          value={editingOwner.address}
                          onChange={(e) => setEditingOwner({...editingOwner, address: e.target.value})}
                          placeholder="Address"
                        />
                        <Input
                          value={editingOwner.city}
                          onChange={(e) => setEditingOwner({...editingOwner, city: e.target.value})}
                          placeholder="City"
                        />
                        <Input
                          value={editingOwner.telephone}
                          onChange={(e) => setEditingOwner({...editingOwner, telephone: e.target.value})}
                          placeholder="Telephone"
                        />
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" variant="success">Save</Button>
                          <Button type="button" size="sm" onClick={() => setEditingOwner(null)}>Cancel</Button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-2">
                        <p><strong>Address:</strong> {owner.address}</p>
                        <p><strong>City:</strong> {owner.city}</p>
                        <p><strong>Phone:</strong> {owner.telephone}</p>
                        {owner.pets && owner.pets.length > 0 && (
                          <div>
                            <strong>Pets:</strong>
                            <ul className="ml-4 mt-1">
                              {owner.pets.map((pet) => (
                                <li key={pet.id}>• {pet.name} ({pet.type.name})</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                  {editingOwner?.id !== owner.id && (
                    <CardFooter>
                      <Button 
                        size="sm" 
                        variant="blue"
                        onClick={() => setEditingOwner(owner)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteOwner(owner.id)}
                      >
                        Delete
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {owners && owners.totalPages > 1 && (
              <Card>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-neo-dark-gray">
                      Showing {owners.content.length} of {owners.totalElements} owners
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={owners.first}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </Button>
                      <span className="px-4 py-2 font-bold">
                        Page {owners.page + 1} of {owners.totalPages}
                      </span>
                      <Button
                        size="sm"
                        disabled={owners.last}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </Button>
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
