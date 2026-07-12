'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Badge, Modal, Input } from '@/components';
import toast from 'react-hot-toast';

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'closed';
  discoveredAt: string;
  resolvedAt?: string;
  assignee: string;
  affectedSystems: string[];
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium' as const,
    assignee: '',
    affectedSystems: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    setIncidents([
      {
        id: '1',
        title: 'Suspicious Login Attempts',
        description: 'Multiple failed login attempts from unknown IP addresses',
        severity: 'high',
        status: 'investigating',
        discoveredAt: '2026-03-24T14:30:00Z',
        assignee: 'John Doe',
        affectedSystems: ['Authentication Service', 'Web Portal'],
      },
      {
        id: '2',
        title: 'Data Exfiltration Detected',
        description: 'Large data transfer detected to external cloud storage',
        severity: 'critical',
        status: 'investigating',
        discoveredAt: '2026-03-25T08:15:00Z',
        assignee: 'Jane Smith',
        affectedSystems: ['Database Server', 'Network'],
      },
      {
        id: '3',
        title: 'Malware Signature Detected',
        description: 'Antivirus detected known malware on workstation',
        severity: 'high',
        status: 'acknowledged',
        discoveredAt: '2026-03-23T16:45:00Z',
        assignee: 'Bob Johnson',
        affectedSystems: ['Workstation-045'],
      },
      {
        id: '4',
        title: 'Phishing Email Campaign',
        description: 'Coordinated phishing emails targeting finance department',
        severity: 'medium',
        status: 'resolved',
        discoveredAt: '2026-03-20T09:00:00Z',
        resolvedAt: '2026-03-20T18:30:00Z',
        assignee: 'Alice Brown',
        affectedSystems: ['Email System'],
      },
      {
        id: '5',
        title: 'DDoS Attack',
        description: 'Distributed denial of service attack on public API',
        severity: 'critical',
        status: 'resolved',
        discoveredAt: '2026-03-19T12:00:00Z',
        resolvedAt: '2026-03-19T14:15:00Z',
        assignee: 'Charlie Wilson',
        affectedSystems: ['API Gateway', 'Load Balancer'],
      },
    ]);
    setLoading(false);
  }, []);

  const handleCreateIncident = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      severity: 'medium',
      assignee: '',
      affectedSystems: '',
    });
    setIsModalOpen(true);
  };

  const handleEditIncident = (incident: Incident) => {
    setEditingId(incident.id);
    setFormData({
      title: incident.title,
      description: incident.description,
      severity: incident.severity,
      assignee: incident.assignee,
      affectedSystems: incident.affectedSystems.join(', '),
    });
    setIsModalOpen(true);
  };

  const handleViewDetails = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsDetailModalOpen(true);
  };

  const handleSaveIncident = async () => {
    if (!formData.title || !formData.description || !formData.assignee) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingId) {
        toast.success('Incident updated successfully');
      } else {
        toast.success('Incident reported successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save incident');
    }
  };

  const handleDeleteIncident = (id: string) => {
    if (confirm('Are you sure you want to delete this incident?')) {
      setIncidents(incidents.filter((i) => i.id !== id));
      toast.success('Incident deleted successfully');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setIncidents(
        incidents.map((i) =>
          i.id === id ? { ...i, status: newStatus as any } : i
        )
      );
      toast.success('Incident status updated');
    } catch (error) {
      toast.error('Failed to update status');
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
      new: 'danger',
      acknowledged: 'warning',
      investigating: 'warning',
      resolved: 'success',
      closed: 'secondary',
    };
    return variants[status] || 'secondary';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300',
      acknowledged:
        'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
      investigating:
        'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
      resolved:
        'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
      closed: 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300',
    };
    return colors[status] || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin">⏳</div>
      </div>
    );
  }

  const activeIncidents = incidents.filter(
    (i) => i.status !== 'resolved' && i.status !== 'closed'
  );
  const criticalIncidents = incidents.filter((i) => i.severity === 'critical');
  const resolvedIncidents = incidents.filter((i) => i.status === 'resolved');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">
            Security Incidents
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Report and track security incidents and response activities
          </p>
        </div>
        <Button onClick={handleCreateIncident} size="lg">
          🚨 Report Incident
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="elevated">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              Total Incidents
            </p>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {incidents.length}
            </p>
          </div>
        </Card>
        <Card variant="elevated">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              Active
            </p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {activeIncidents.length}
            </p>
          </div>
        </Card>
        <Card variant="elevated">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              Critical
            </p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {criticalIncidents.length}
            </p>
          </div>
        </Card>
        <Card variant="elevated">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              Resolved
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {resolvedIncidents.length}
            </p>
          </div>
        </Card>
      </div>

      {/* Incidents List */}
      <div className="space-y-3">
        {incidents.map((incident) => (
          <Card
            key={incident.id}
            variant="elevated"
            className={getStatusColor(incident.status)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold">{incident.title}</h3>
                  <Badge variant={getSeverityBadgeVariant(incident.severity)}>
                    {incident.severity}
                  </Badge>
                  <Badge variant={getStatusBadgeVariant(incident.status)}>
                    {incident.status}
                  </Badge>
                </div>
                <p className="text-sm opacity-90 mb-3">{incident.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="opacity-75">Assignee</p>
                    <p className="font-semibold">{incident.assignee}</p>
                  </div>
                  <div>
                    <p className="opacity-75">Discovered</p>
                    <p className="font-semibold">
                      {new Date(incident.discoveredAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="opacity-75">Affected Systems</p>
                    <p className="font-semibold">
                      {incident.affectedSystems.length} system(s)
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleViewDetails(incident)}
                >
                  View
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEditIncident(incident)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteIncident(incident.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Incident Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Incident' : 'Report Security Incident'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Incident Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Brief description of incident"
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
              placeholder="Detailed information about the incident"
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
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
            <Input
              label="Assigned To"
              value={formData.assignee}
              onChange={(e) =>
                setFormData({ ...formData, assignee: e.target.value })
              }
              placeholder="Team member name"
            />
          </div>

          <Input
            label="Affected Systems"
            value={formData.affectedSystems}
            onChange={(e) =>
              setFormData({ ...formData, affectedSystems: e.target.value })
            }
            placeholder="System names (comma-separated)"
            helperText="e.g., Database Server, Web Portal, Mail Server"
            fullWidth
          />

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveIncident} fullWidth>
              {editingId ? 'Update Incident' : 'Report Incident'}
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

      {/* Detail Modal */}
      {selectedIncident && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={selectedIncident.title}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Severity
                </p>
                <Badge variant={getSeverityBadgeVariant(selectedIncident.severity)}>
                  {selectedIncident.severity}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Status
                </p>
                <Badge variant={getStatusBadgeVariant(selectedIncident.status)}>
                  {selectedIncident.status}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-dark-900 dark:text-white mb-2">
                Description
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedIncident.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-dark-900 dark:text-white">
                  Assignee
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedIncident.assignee}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-dark-900 dark:text-white">
                  Discovered
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {new Date(selectedIncident.discoveredAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-dark-900 dark:text-white mb-2">
                Affected Systems
              </p>
              <div className="space-y-1">
                {selectedIncident.affectedSystems.map((system) => (
                  <p key={system} className="text-sm text-gray-600 dark:text-gray-400">
                    • {system}
                  </p>
                ))}
              </div>
            </div>

            {selectedIncident.status !== 'resolved' &&
              selectedIncident.status !== 'closed' && (
                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-dark-700">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      handleStatusChange(
                        selectedIncident.id,
                        'acknowledged'
                      )
                    }
                    fullWidth
                  >
                    Acknowledge
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      handleStatusChange(selectedIncident.id, 'investigating')
                    }
                    fullWidth
                  >
                    Investigate
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      handleStatusChange(selectedIncident.id, 'resolved')
                    }
                    fullWidth
                  >
                    Resolve
                  </Button>
                </div>
              )}

            <Button
              variant="secondary"
              onClick={() => setIsDetailModalOpen(false)}
              fullWidth
            >
              Close
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
