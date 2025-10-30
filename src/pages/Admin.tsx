import { useState, useEffect } from 'react';
import UsersManagement from "@/components/UsersManagement";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { PlansTab } from "@/components/admin/PlansTab";
import { ClientsTab } from "@/components/admin/ClientsTab";
import { PlanEditModal } from "@/components/admin/PlanEditModal";
import { LocationsTab } from "@/components/admin/LocationsTab";
import { LocationEditModal } from "@/components/admin/LocationEditModal";
import BuilderButtonSettings from "@/components/admin/BuilderButtonSettings";
import { ReceiptsTab } from "@/components/admin/ReceiptsTab";
import { useAdminAuth } from "@/components/admin/useAdminAuth";
import { usePlansManagement } from "@/components/admin/usePlansManagement";
import { useLocationsManagement } from "@/components/admin/useLocationsManagement";
import { useClientsManagement } from "@/components/admin/useClientsManagement";

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'plans' | 'clients' | 'users' | 'locations' | 'settings' | 'receipts'>('plans');

  const API_URL = 'https://functions.poehali.dev/c56efe3d-0219-4eab-a894-5d98f0549ef0';
  const LOCATIONS_API = 'https://functions.poehali.dev/3271c5a0-f0f4-42e8-b230-c35b772c0024';
  const SYNC_LOCATIONS_API = 'https://functions.poehali.dev/a93c29cf-6f89-4fe3-a7e6-717e7d5a8112';

  const auth = useAdminAuth(API_URL);
  
  const reloadPlans = async () => {
    const result = await auth.handleLogin(auth.password);
    if (result.success) {
      plansManagement.setPlans(result.plans);
    }
  };

  const plansManagement = usePlansManagement(API_URL, auth.password, reloadPlans);
  const locationsManagement = useLocationsManagement(LOCATIONS_API, SYNC_LOCATIONS_API, auth.password);
  const clientsManagement = useClientsManagement(API_URL, auth.password);

  useEffect(() => {
    if (auth.isAuthorized && activeTab === 'clients') {
      clientsManagement.loadClients();
    }
  }, [activeTab, auth.isAuthorized]);

  useEffect(() => {
    if (auth.isAuthorized && activeTab === 'locations') {
      locationsManagement.loadLocations();
    }
  }, [activeTab, auth.isAuthorized]);

  if (!auth.isAuthorized) {
    return (
      <AdminLogin
        password={auth.password}
        setPassword={auth.setPassword}
        onLogin={() => auth.handleLogin()}
        loading={auth.loading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AdminHeader onLogout={auth.handleLogout} />
      
      <div className="container mx-auto px-4 py-8">
        <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'plans' && (
          <PlansTab
            plans={plansManagement.plans}
            loading={plansManagement.loading}
            onEdit={plansManagement.setEditingPlan}
            onDelete={plansManagement.handleDeletePlan}
            onMove={plansManagement.handleMovePlan}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsTab
            clients={clientsManagement.clients}
            loading={clientsManagement.loading}
          />
        )}

        {activeTab === 'users' && (
          <UsersManagement adminPassword={auth.password} />
        )}

        {activeTab === 'locations' && (
          <LocationsTab
            locations={locationsManagement.locations}
            loading={locationsManagement.loading}
            syncing={locationsManagement.syncing}
            onEdit={locationsManagement.setEditingLocation}
            onDelete={locationsManagement.handleDeleteLocation}
            onSync={locationsManagement.handleSyncLocations}
            onMove={locationsManagement.handleMoveLocation}
          />
        )}

        {activeTab === 'settings' && (
          <BuilderButtonSettings adminPassword={auth.password} />
        )}

        {activeTab === 'receipts' && (
          <ReceiptsTab adminPassword={auth.password} />
        )}
      </div>

      {plansManagement.editingPlan && (
        <PlanEditModal
          plan={plansManagement.editingPlan}
          onSave={plansManagement.handleSavePlan}
          onClose={() => plansManagement.setEditingPlan(null)}
          onChange={plansManagement.setEditingPlan}
        />
      )}

      {locationsManagement.editingLocation && (
        <LocationEditModal
          location={locationsManagement.editingLocation}
          onSave={locationsManagement.handleSaveLocation}
          onClose={() => locationsManagement.setEditingLocation(null)}
          onChange={locationsManagement.setEditingLocation}
        />
      )}
    </div>
  );
};

export default Admin;
