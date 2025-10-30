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
import { NewsTab } from "@/components/admin/NewsTab";
import { NewsEditModal } from "@/components/admin/NewsEditModal";
import { useAdminAuth } from "@/components/admin/useAdminAuth";
import { usePlansManagement } from "@/components/admin/usePlansManagement";
import { useLocationsManagement } from "@/components/admin/useLocationsManagement";
import { useClientsManagement } from "@/components/admin/useClientsManagement";
import { useNewsManagement } from "@/components/admin/useNewsManagement";

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'plans' | 'clients' | 'users' | 'locations' | 'settings' | 'receipts' | 'news'>('plans');

  const API_URL = 'https://functions.poehali.dev/c56efe3d-0219-4eab-a894-5d98f0549ef0';
  const LOCATIONS_API = 'https://functions.poehali.dev/3271c5a0-f0f4-42e8-b230-c35b772c0024';
  const SYNC_LOCATIONS_API = 'https://functions.poehali.dev/a93c29cf-6f89-4fe3-a7e6-717e7d5a8112';
  const NEWS_API = 'https://functions.poehali.dev/3b70872b-40db-4e8a-81e6-228e407e152b';

  const auth = useAdminAuth(API_URL);
  const plansManagement = usePlansManagement(API_URL, auth.password, async () => {
    const result = await auth.handleLogin(auth.password);
    if (result.success) {
      plansManagement.setPlans(result.plans);
    }
  });
  const locationsManagement = useLocationsManagement(LOCATIONS_API, SYNC_LOCATIONS_API, auth.password);
  const clientsManagement = useClientsManagement(API_URL, auth.password);
  const newsManagement = useNewsManagement(NEWS_API, auth.password);

  useEffect(() => {
    const loadInitialPlans = async () => {
      const result = await auth.handleLogin(auth.password);
      if (result.success) {
        plansManagement.setPlans(result.plans);
      }
    };
    
    if (auth.isAuthorized) {
      loadInitialPlans();
    }
  }, [auth.isAuthorized]);

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

  useEffect(() => {
    if (auth.isAuthorized && activeTab === 'news') {
      newsManagement.loadNews();
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
    <div className="min-h-screen bg-black">
      <AdminHeader onLogout={auth.handleLogout} />
      
      <div className="container mx-auto px-4 py-8">
        <AdminTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          plansCount={plansManagement.plans.length}
          clientsCount={clientsManagement.clients.length}
          locationsCount={locationsManagement.locations.length}
          newsCount={newsManagement.news.length}
          loadClients={clientsManagement.loadClients}
          loadLocations={locationsManagement.loadLocations}
          loadNews={newsManagement.loadNews}
        />

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

        {activeTab === 'news' && (
          <NewsTab
            news={newsManagement.news}
            loading={newsManagement.loading}
            onEdit={newsManagement.setEditingNews}
            onDelete={newsManagement.handleDeleteNews}
            onMove={newsManagement.handleMoveNews}
            onCreate={newsManagement.handleCreateNews}
          />
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

      {newsManagement.editingNews && (
        <NewsEditModal
          news={newsManagement.editingNews}
          onSave={newsManagement.handleSaveNews}
          onClose={() => newsManagement.setEditingNews(null)}
          onChange={newsManagement.setEditingNews}
        />
      )}
    </div>
  );
};

export default Admin;