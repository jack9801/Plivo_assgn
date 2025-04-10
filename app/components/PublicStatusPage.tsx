'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';

interface Service {
  id: string;
  name: string;
  status: string;
  description?: string;
}

interface Incident {
  id: string;
  title: string;
  status: string;
  severity: string;
  createdAt: string;
  serviceId: string;
  service: {
    name: string;
  };
}

export default function PublicStatusPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch services
        const servicesRes = await fetch('/api/public/services');
        if (!servicesRes.ok) throw new Error('Failed to fetch services');
        const servicesData = await servicesRes.json();
        setServices(servicesData);

        // For demo purposes, we'll use mock incidents
        // In a real app, you'd fetch from an API
        setIncidents([
          {
            id: 'inc-1',
            title: 'API Service Degraded Performance',
            status: 'INVESTIGATING',
            severity: 'MEDIUM',
            createdAt: new Date().toISOString(),
            serviceId: 'svc-1',
            service: { name: 'API Service' }
          },
          {
            id: 'inc-2',
            title: 'Website Login Issues',
            status: 'RESOLVED',
            severity: 'LOW',
            createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            serviceId: 'svc-2',
            service: { name: 'Website' }
          }
        ]);

        setError(null);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusIndicator = (status: string) => {
    switch(status) {
      case 'OPERATIONAL': return 'bg-green-500';
      case 'DEGRADED': return 'bg-yellow-500';
      case 'OUTAGE': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'OPERATIONAL': return 'Operational';
      case 'DEGRADED': return 'Degraded Performance';
      case 'OUTAGE': return 'Major Outage';
      default: return status;
    }
  };

  const getIncidentStatusColor = (status: string) => {
    switch(status) {
      case 'RESOLVED': return 'text-green-600';
      case 'MONITORING': return 'text-blue-600';
      case 'IDENTIFIED': return 'text-yellow-600';
      case 'INVESTIGATING': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="container py-8 max-w-4xl mx-auto">
        <div className="text-center">
          <p className="text-lg">Loading status...</p>
        </div>
      </div>
    );
  }

  const activeIncidents = incidents.filter(
    incident => incident.status !== 'RESOLVED'
  );

  const allOperational = services.every(
    service => service.status === 'OPERATIONAL'
  );

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">System Status</h1>
        {allOperational ? (
          <div className="text-green-500 text-xl font-medium">
            All Systems Operational
          </div>
        ) : (
          <div className="text-yellow-500 text-xl font-medium">
            Some Systems Are Experiencing Issues
          </div>
        )}
      </div>

      {activeIncidents.length > 0 && (
        <Card className="mb-8 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle>Active Incidents</CardTitle>
            <CardDescription>Ongoing incidents affecting our services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeIncidents.map((incident) => (
                <div key={incident.id} className="border-b border-yellow-200 pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium">{incident.title}</div>
                    <div className={`text-sm ${getIncidentStatusColor(incident.status)}`}>
                      {incident.status}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {incident.service.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(incident.createdAt).toLocaleString()} 
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>Current status of all services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.length === 0 ? (
              <p className="text-muted-foreground">No services available.</p>
            ) : (
              services.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{service.name}</div>
                    {service.description && (
                      <div className="text-sm text-muted-foreground">
                        {service.description}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${getStatusIndicator(service.status)} mr-2`}></div>
                    <div className="text-sm font-medium">
                      {getStatusText(service.status)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Past Incidents</CardTitle>
          <CardDescription>Recently resolved incidents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {incidents.filter(i => i.status === 'RESOLVED').length === 0 ? (
              <p className="text-muted-foreground">No resolved incidents.</p>
            ) : (
              incidents.filter(i => i.status === 'RESOLVED').map((incident) => (
                <div key={incident.id} className="border-b pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium">{incident.title}</div>
                    <div className={`text-sm ${getIncidentStatusColor(incident.status)}`}>
                      {incident.status}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {incident.service.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(incident.createdAt).toLocaleString()} 
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 