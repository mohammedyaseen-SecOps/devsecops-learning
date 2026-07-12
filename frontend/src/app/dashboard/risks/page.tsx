'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Badge, Modal, Input } from '@/components';
import toast from 'react-hot-toast';

interface Risk {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'mitigating' | 'resolved' | 'accepted';
  likelihood: 'rare' | 'unlikely' | 'possible' | 'likely' | 'certain';
  impact: 'insignificant' | 'minor' | 'moderate' | 'major' | 'catastrophic';
  owner: string;
  dueDate: string;
}

export default function RisksPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium' as const,
    likelihood: 'possible' as const,
    impact: 'moderate' as const,
    owner: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setRisks([
      {
        id: '1',
        title: 'Unpatched System Vulnerabilities',
        description: 'Critical security patches not applied to production servers',
        severity: 'critical',
        status: 'mitigating',
        likelihood: 'likely',
        impact: 'catastrophic',
        owner: 'John Doe',
        dueDate: '2026-04-15',
      },
      {
        id: '2',
        title: 'Inadequate Access Controls',
        description: 'Too many users with admin privileges',
        severity: 'high',
        status: 'open',
        likelihood: 'possible',
        impact: 'major',
        owner: 'Jane Smith',
        dueDate: '2026-05-01',
      },
      {
        id: '3',
        title: 'Data Backup Failures',
        description: 'Daily backup jobs failing for 3 weeks',
        severity: 'critical',
        status: 'mitigating',
        likelihood: 'likely',
        impact: 'catastrophic',
        owner: 'Bob Johnson',
        dueDate: '2026-03-30',
      },
      {
        id: '4',
        title: 'Outdated Third-Party Dependencies',
        description: 'Multiple npm packages with known vulnerabilities',
        severity: 'high',
        status: 'open',
        likelihood: 'possible',
        impact: 'major',
        owner: 'Alice Brown',
        dueDate: '2026-04-30',
      },
    ]);
    setLoading(false);
  }, []);

  const handleCreateRisk = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      severity: 'medium',
      likelihood: 'possible',
      impact: 'moderate',
      owner: '',
    });
    setIsModalOpen(true);
  };

  const handleEditRisk = (risk: Risk) => {
    setEditingId(risk.id);
    setFormData({
      title: risk.title,
      description: risk.description,
      severity: risk.severity,
      likelihood: risk.likelihood,
      impact: risk.impact,
      owner: risk.owner,
    });
    setIsModalOpen(true);
  };

  const handleSaveRisk = async () => {
    if (!formData.title || !formData.description || !formData.owner) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingId) {
        toast.success('Risk updated successfully');
      } else {
        toast.success('Risk created successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save risk');
    }
  };

  const handleDeleteRisk = (id: string) => {
    if (confirm('Are you sure you want to delete this risk?')) {
      setRisks(risks.filter((r) => r.id !== id));
      toast.success('Risk deleted successfully');
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    const variants: Record<string, any> = {
      critical: 'danger',
      high: 'danger',
      medium: 'warning',
      low: 'success',
    };
    return variants[severity] || 'secondary';
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, any> = {
      open: 'danger',
      mitigating: 'warning',
      resolved: 'success',
      accepted: 'secondary',
    };
    return variants[status] || 'secondary';
  };

  const calculateRiskScore = (likelihood: string, impact: string): number => {
    const likelihoodScore: Record<string, number> = {
      rare: 1,
      unlikely: 2,
      possible: 3,
      likely: 4,
      certain: 5,
    };
    const impactScore: Record<string, number> = {
      insignificant: 1,
      minor: 2,
      moderate: 3,
      major: 4,
      catastrophic: 5,
    };
    return likelihoodScore[likelihood] * impactScore[impact];
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
            Risk Registry
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage organizational risks and mitigation strategies
          </p>
        </div>
        <Button onClick={handleCreateRisk} size="lg">
          ➕ Register Risk
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="elevated">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              Total Risks
            </p>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {risks.length}
            </p>
          </div>
        </Card>
        <Card variant="elevated">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              Critical
            </p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {risks.filter((r) => r.severity === 'critical').length}
            </p>
          </div>
        </Card>
        <Card variant="elevated">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              Open Issues
            </p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {risks.filter((r) => r.status === 'open').length}
            </p>
          </div>
        </Card>
        <Card variant="elevated">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              Resolved
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {risks.filter((r) => r.status === 'resolved').length}
            </p>
          </div>
        </Card>
      </div>

      {/* Risks Table */}
      <Card variant="elevated">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-700">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Risk
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Likelihood
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {risks.map((risk) => (
                <tr
                  key={risk.id}
                  className="border-b border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {risk.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {risk.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getSeverityBadgeVariant(risk.severity)}>
                      {risk.severity}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {risk.likelihood}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusBadgeVariant(risk.status)}>
                      {risk.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br from-red-500 to-orange-600">
                      {calculateRiskScore(risk.likelihood, risk.impact)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {risk.owner}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditRisk(risk)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteRisk(risk.id)}
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

      {/* Risk Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Risk' : 'Register New Risk'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Risk Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter risk title"
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
              placeholder="Describe the risk"
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-900 dark:text-white mb-2">
                Severity
              </label>
              <select
                value={formData.severity}
                onChange={(e) =>
                  setFormData({ ...formData, severity: e.target.value as any })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-900 dark:text-white mb-2">
                Likelihood
              </label>
              <select
                value={formData.likelihood}
                onChange={(e) =>
                  setFormData({ ...formData, likelihood: e.target.value as any })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="rare">Rare</option>
                <option value="unlikely">Unlikely</option>
                <option value="possible">Possible</option>
                <option value="likely">Likely</option>
                <option value="certain">Certain</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-900 dark:text-white mb-2">
              Impact
            </label>
            <select
              value={formData.impact}
              onChange={(e) =>
                setFormData({ ...formData, impact: e.target.value as any })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="insignificant">Insignificant</option>
              <option value="minor">Minor</option>
              <option value="moderate">Moderate</option>
              <option value="major">Major</option>
              <option value="catastrophic">Catastrophic</option>
            </select>
          </div>

          <Input
            label="Risk Owner"
            value={formData.owner}
            onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
            placeholder="Responsible person"
            fullWidth
          />

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveRisk} fullWidth>
              {editingId ? 'Update Risk' : 'Register Risk'}
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
