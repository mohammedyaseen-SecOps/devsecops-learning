// Mock API for demo/preview mode
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;

  // Mock current user
  if (path?.[0] === 'auth' && path?.[1] === 'me') {
    return res.status(200).json({
      id: 'user-1',
      email: 'demo@grc-platform.local',
      firstName: 'Demo',
      lastName: 'User',
      role: 'admin',
      tenantId: 'tenant-1',
    });
  }

  // Mock users list
  if (path?.[0] === 'users') {
    return res.status(200).json({
      data: [
        { id: '1', email: 'admin@grc.local', firstName: 'Admin', lastName: 'User', role: 'admin' },
        { id: '2', email: 'user@grc.local', firstName: 'User', lastName: 'Two', role: 'user' },
      ],
      pagination: { total: 2, page: 1, pageSize: 10 },
    });
  }

  // Mock roles list
  if (path?.[0] === 'roles') {
    return res.status(200).json({
      data: [
        { id: '1', name: 'Admin', description: 'Administrator', permissions: [] },
        { id: '2', name: 'User', description: 'Regular User', permissions: [] },
      ],
      pagination: { total: 2, page: 1, pageSize: 10 },
    });
  }

  // Mock tenants list
  if (path?.[0] === 'tenants') {
    return res.status(200).json({
      data: [
        { id: '1', name: 'Demo Tenant', status: 'active', users: 5, modules: 8 },
      ],
      pagination: { total: 1, page: 1, pageSize: 10 },
    });
  }

  // Mock compliance frameworks
  if (path?.[0] === 'compliance') {
    return res.status(200).json({
      data: [
        { id: '1', name: 'ISO 27001', status: 'in_progress', compliance: 75 },
        { id: '2', name: 'SOC 2', status: 'active', compliance: 90 },
      ],
      pagination: { total: 2, page: 1, pageSize: 10 },
    });
  }

  // Mock incidents
  if (path?.[0] === 'incidents') {
    return res.status(200).json({
      data: [
        { id: '1', title: 'Demo Incident', severity: 'high', status: 'open' },
      ],
      pagination: { total: 1, page: 1, pageSize: 10 },
    });
  }

  // Mock risks
  if (path?.[0] === 'risks') {
    return res.status(200).json({
      data: [
        { id: '1', title: 'Demo Risk', severity: 'medium', probability: 'high' },
      ],
      pagination: { total: 1, page: 1, pageSize: 10 },
    });
  }

  res.status(404).json({ error: 'Not found' });
}
