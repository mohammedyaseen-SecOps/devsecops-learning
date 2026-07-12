'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Badge, Modal, Input } from '@/components';
import toast from 'react-hot-toast';

interface Role {
  id: string;
  name: string;
  description: string;
  permissionCount: number;
  userCount: number;
  isSystem: boolean;
  createdAt: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Mock data - in real app, fetch from API
  useEffect(() => {
    setRoles([
      {
        id: '1',
        name: 'Admin',
        description: 'Full system access and control',
        permissionCount: 24,
        userCount: 2,
        isSystem: true,
        createdAt: '2024-01-01',
      },
      {
        id: '2',
        name: 'Analyst',
        description: 'Can create and edit risk assessments',
        permissionCount: 16,
        userCount: 5,
        isSystem: true,
        createdAt: '2024-01-01',
      },
      {
        id: '3',
        name: 'Viewer',
        description: 'Read-only access to all modules',
        permissionCount: 8,
        userCount: 12,
        isSystem: true,
        createdAt: '2024-01-01',
      },
    ]);
    setLoading(false);
  }, []);

  const handleCreateRole = () => {
    setEditingId(null);
    setFormData({ name: '', description: '' });
    setIsModalOpen(true);
  };

  const handleEditRole = (role: Role) => {
    if (role.isSystem) {
      toast.error('Cannot edit system roles');
      return;
    }
    setEditingId(role.id);
    setFormData({ name: role.name, description: role.description });
    setIsModalOpen(true);
  };

  const handleSaveRole = async () => {
    if (!formData.name || !formData.description) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      if (editingId) {
        // Update role
        toast.success('Role updated successfully');
      } else {
        // Create role
        toast.success('Role created successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save role');
    }
  };

  const handleDeleteRole = (role: Role) => {
    if (role.isSystem) {
      toast.error('Cannot delete system roles');
      return;
    }
    if (confirm('Are you sure you want to delete this role?')) {
      setRoles(roles.filter((r) => r.id !== role.id));
      toast.success('Role deleted successfully');
    }
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
            Roles
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage user roles and permissions
          </p>
        </div>
        <Button onClick={handleCreateRole} size="lg">
          ➕ Create Role
        </Button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <Card key={role.id} variant="elevated">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-dark-900 dark:text-white">
                    {role.name}
                  </h3>
                  {role.isSystem && (
                    <Badge variant="secondary" size="sm" className="mt-2">
                      System Role
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {role.description}
              </p>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-200 dark:border-dark-700">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Permissions
                  </p>
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {role.permissionCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Users
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {role.userCount}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEditRole(role)}
                  disabled={role.isSystem}
                  fullWidth
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteRole(role)}
                  disabled={role.isSystem}
                  fullWidth
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Role Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Role' : 'Create New Role'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Role Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter role name"
            fullWidth
          />
          <div>
            <label className="block text-sm font-medium text-dark-900 dark:text-white mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe the purpose of this role"
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveRole} fullWidth>
              {editingId ? 'Update Role' : 'Create Role'}
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
