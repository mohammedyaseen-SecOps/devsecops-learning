'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Badge, Modal, Input } from '@/components';
import toast from 'react-hot-toast';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'trial';
  userCount: number;
  subscriptionPlan: string;
  createdAt: string;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    subscriptionPlan: 'starter',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Mock data - in real app, fetch from API
  useEffect(() => {
    setTenants([
      {
        id: '1',
        name: 'Acme Corporation',
        slug: 'acme-corp',
        status: 'active',
        userCount: 45,
        subscriptionPlan: 'Enterprise',
        createdAt: '2024-01-01',
      },
      {
        id: '2',
        name: 'Tech Innovations Inc',
        slug: 'tech-innovations',
        status: 'active',
        userCount: 28,
        subscriptionPlan: 'Professional',
        createdAt: '2024-01-15',
      },
      {
        id: '3',
        name: 'StartupXYZ',
        slug: 'startupxyz',
        status: 'trial',
        userCount: 8,
        subscriptionPlan: 'Starter',
        createdAt: '2024-03-01',
      },
    ]);
    setLoading(false);
  }, []);

  const handleCreateTenant = () => {
    setEditingId(null);
    setFormData({ name: '', slug: '', subscriptionPlan: 'starter' });
    setIsModalOpen(true);
  };

  const handleEditTenant = (tenant: Tenant) => {
    setEditingId(tenant.id);
    setFormData({
      name: tenant.name,
      slug: tenant.slug,
      subscriptionPlan: tenant.subscriptionPlan.toLowerCase(),
    });
    setIsModalOpen(true);
  };

  const handleSaveTenant = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      if (editingId) {
        // Update tenant
        toast.success('Tenant updated successfully');
      } else {
        // Create tenant
        toast.success('Tenant created successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save tenant');
    }
  };

  const handleDeleteTenant = (id: string) => {
    if (confirm('Are you sure you want to delete this tenant?')) {
      setTenants(tenants.filter((t) => t.id !== id));
      toast.success('Tenant deleted successfully');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, any> = {
      active: 'success',
      suspended: 'danger',
      trial: 'warning',
    };
    return variants[status] || 'secondary';
  };

  const getPlanBadgeVariant = (plan: string) => {
    const variants: Record<string, any> = {
      starter: 'secondary',
      professional: 'primary',
      enterprise: 'danger',
    };
    return variants[plan.toLowerCase()] || 'secondary';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin">⏳</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">
            Tenants
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage SaaS tenant accounts and subscriptions
          </p>
        </div>
        <Button onClick={handleCreateTenant} size="lg">
          ➕ New Tenant
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="elevated">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              Total Tenants
            </p>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {tenants.length}
            </p>
          </div>
        </Card>
        <Card variant="elevated">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              Active Tenants
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {tenants.filter((t) => t.status === 'active').length}
            </p>
          </div>
        </Card>
        <Card variant="elevated">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              Total Users
            </p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {tenants.reduce((sum, t) => sum + t.userCount, 0)}
            </p>
          </div>
        </Card>
      </div>

      {/* Tenants Table */}
      <Card variant="elevated">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-700">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr
                  key={tenant.id}
                  className="border-b border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {tenant.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {tenant.slug}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={getPlanBadgeVariant(tenant.subscriptionPlan)}
                    >
                      {tenant.subscriptionPlan}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusBadgeVariant(tenant.status)}>
                      {tenant.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {tenant.userCount}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditTenant(tenant)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteTenant(tenant.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Tenant Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Tenant' : 'Create New Tenant'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Tenant Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter tenant name"
            fullWidth
          />
          <Input
            label="Tenant Slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="tenant-slug"
            fullWidth
          />
          <div>
            <label className="block text-sm font-medium text-dark-900 dark:text-white mb-2">
              Subscription Plan
            </label>
            <select
              value={formData.subscriptionPlan}
              onChange={(e) =>
                setFormData({ ...formData, subscriptionPlan: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveTenant} fullWidth>
              {editingId ? 'Update Tenant' : 'Create Tenant'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
