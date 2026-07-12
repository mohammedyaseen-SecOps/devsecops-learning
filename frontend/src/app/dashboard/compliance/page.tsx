'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Badge, Modal, Input } from '@/components';
import toast from 'react-hot-toast';

interface ComplianceFramework {
  id: string;
  name: string;
  type: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'failed';
  score: number;
  controlsTotal: number;
  controlsCompleted: number;
  dueDate: string;
  owner: string;
}

export default function CompliancePage() {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'ISO 27001',
    owner: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setFrameworks([
      {
        id: '1',
        name: 'Information Security Management',
        type: 'ISO 27001',
        status: 'in-progress',
        score: 72,
        controlsTotal: 114,
        controlsCompleted: 82,
        dueDate: '2026-06-30',
        owner: 'John Doe',
      },
      {
        id: '2',
        name: 'Healthcare Compliance',
        type: 'HIPAA',
        status: 'in-progress',
        score: 85,
        controlsTotal: 90,
        controlsCompleted: 76,
        dueDate: '2026-12-31',
        owner: 'Jane Smith',
      },
      {
        id: '3',
        name: 'Critical Infrastructure Defense',
        type: 'NIST Cybersecurity Framework',
        status: 'completed',
        score: 92,
        controlsTotal: 108,
        controlsCompleted: 108,
        dueDate: '2026-03-15',
        owner: 'Bob Johnson',
      },
      {
        id: '4',
        name: 'Controlled Unclassified Information',
        type: 'CMMC 2.0',
        status: 'not-started',
        score: 0,
        controlsTotal: 110,
        controlsCompleted: 0,
        dueDate: '2027-03-31',
        owner: 'Alice Brown',
      },
      {
        id: '5',
        name: 'General Data Protection',
        type: 'GDPR',
        status: 'completed',
        score: 95,
        controlsTotal: 50,
        controlsCompleted: 50,
        dueDate: '2026-01-01',
        owner: 'Charlie Wilson',
      },
    ]);
    setLoading(false);
  }, []);

  const handleCreateFramework = () => {
    setEditingId(null);
    setFormData({ name: '', type: 'ISO 27001', owner: '' });
    setIsModalOpen(true);
  };

  const handleEditFramework = (framework: ComplianceFramework) => {
    setEditingId(framework.id);
    setFormData({
      name: framework.name,
      type: framework.type,
      owner: framework.owner,
    });
    setIsModalOpen(true);
  };

  const handleSaveFramework = async () => {
    if (!formData.name || !formData.owner) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingId) {
        toast.success('Framework updated successfully');
      } else {
        toast.success('Framework assessment started');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save framework');
    }
  };

  const handleDeleteFramework = (id: string) => {
    if (confirm('Are you sure you want to delete this framework?')) {
      setFrameworks(frameworks.filter((f) => f.id !== id));
      toast.success('Framework deleted successfully');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, any> = {
      'not-started': 'secondary',
      'in-progress': 'warning',
      completed: 'success',
      failed: 'danger',
    };
    return variants[status] || 'secondary';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin">⏳</div>
      </div>
    );
  }

  const avgScore =
    frameworks.length > 0
      ? Math.round(
          frameworks.reduce((sum, f) => sum + f.score, 0) / frameworks.length
        )
      : 0;
  const completedFrameworks = frameworks.filter(
    (f) => f.status === 'completed'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">
            Compliance Frameworks
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage compliance assessments against security frameworks
          </p>
        </div>
        <Button onClick={handleCreateFramework} size="lg">
          ➕ Add Framework
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="elevated">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              Total Frameworks
            </p>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {frameworks.length}
            </p>
          </div>
        </Card>
        <Card variant="elevated">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              Completed
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {completedFrameworks}
            </p>
          </div>
        </Card>
        <Card variant="elevated">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              In Progress
            </p>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {frameworks.filter((f) => f.status === 'in-progress').length}
            </p>
          </div>
        </Card>
        <Card variant="elevated">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              Avg Compliance Score
            </p>
            <p className={`text-3xl font-bold ${getScoreColor(avgScore)}`}>
              {avgScore}%
            </p>
          </div>
        </Card>
      </div>

      {/* Frameworks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {frameworks.map((framework) => (
          <Card key={framework.id} variant="elevated">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-dark-900 dark:text-white">
                    {framework.type}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {framework.name}
                  </p>
                </div>
                <Badge variant={getStatusBadgeVariant(framework.status)}>
                  {framework.status}
                </Badge>
              </div>

              {/* Score Circle */}
              <div className="flex items-center justify-between py-4 border-y border-gray-200 dark:border-dark-700">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Compliance Score
                  </p>
                  <p className={`text-3xl font-bold ${getScoreColor(framework.score)}`}>
                    {framework.score}%
                  </p>
                </div>
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-dark-700 dark:to-dark-600 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Progress
                    </p>
                    <p className="text-lg font-bold text-dark-900 dark:text-white">
                      {framework.controlsCompleted}/{framework.controlsTotal}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Controls Completed
                  </span>
                  <span className="font-semibold text-dark-900 dark:text-white">
                    {Math.round(
                      (framework.controlsCompleted / framework.controlsTotal) *
                        100
                    )}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(framework.controlsCompleted / framework.controlsTotal) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Owner</p>
                  <p className="font-semibold text-dark-900 dark:text-white">
                    {framework.owner}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Due Date</p>
                  <p className="font-semibold text-dark-900 dark:text-white">
                    {new Date(framework.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEditFramework(framework)}
                  fullWidth
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteFramework(framework.id)}
                  fullWidth
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Framework Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Framework' : 'Add Compliance Framework'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Framework Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Information Security Management"
            fullWidth
          />
          <div>
            <label className="block text-sm font-medium text-dark-900 dark:text-white mb-2">
              Framework Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="ISO 27001">ISO 27001</option>
              <option value="HIPAA">HIPAA</option>
              <option value="NIST Cybersecurity Framework">
                NIST Cybersecurity Framework
              </option>
              <option value="CMMC 2.0">CMMC 2.0</option>
              <option value="GDPR">GDPR</option>
              <option value="CIS Controls">CIS Controls</option>
            </select>
          </div>
          <Input
            label="Owner"
            value={formData.owner}
            onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
            placeholder="Responsible person"
            fullWidth
          />

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveFramework} fullWidth>
              {editingId ? 'Update Framework' : 'Start Assessment'}
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
