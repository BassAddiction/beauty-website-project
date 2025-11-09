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
import { TrackingCodesTab } from "@/components/admin/TrackingCodesTab";
import { ProjectSettingsTab } from "@/components/admin/ProjectSettingsTab";
import { ReviewsTab } from "@/components/admin/ReviewsTab";
import { useAdminAuth } from "@/components/admin/useAdminAuth";
import { usePlansManagement } from "@/components/admin/usePlansManagement";
import { useLocationsManagement } from "@/components/admin/useLocationsManagement";
import { useClientsManagement } from "@/components/admin/useClientsManagement";
import { useNewsManagement } from "@/components/admin/useNewsManagement";
import API_ENDPOINTS from '@/config/api';

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'plans' | 'clients' | 'users' | 'locations' | 'settings' | 'receipts' | 'news' | 'tracking' | 'project' | 'reviews'>('plans');

  const auth = useAdminAuth(API_ENDPOINTS.GET_SUBSCRIPTION);
  const plansManagement = usePlansManagement(API_ENDPOINTS.GET_SUBSCRIPTION, auth.password, async () => {
    const result = await auth.handleLogin(auth.password);
    if (result.success) {
      plansManagement.setPlans(result.plans);
    }
  });
  const locationsManagement = useLocationsManagement(API_ENDPOINTS.LOCATIONS, API_ENDPOINTS.SYNC_LOCATIONS, auth.password);
  const clientsManagement = useClientsManagement(API_ENDPOINTS.GET_SUBSCRIPTION, auth.password);
  const newsManagement = useNewsManagement(API_ENDPOINTS.NEWS, auth.password);

  useEffect(() => {
    const loadInitialPlans = async () => {
      const result = await auth.handleLogin(auth.password);
      console.log('Login result:', result);
      if (result && result.success && result.plans) {
        console.log('Setting plans:', result.plans);
        console.log('Plans array:', result.plans.map((p: any, i: number) => ({ index: i, plan_id: p?.plan_id, name: p?.name, hasData: !!p })));
        plansManagement.setPlans(result.plans);
      } else {
        console.error('Failed to load plans:', result);
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

        {activeTab === 'tracking' && (
          <TrackingCodesTab adminPassword={auth.password} />
        )}

        {activeTab === 'project' && (
          <ProjectSettingsTab adminPassword={auth.password} />
        )}

        {activeTab === 'reviews' && (
          <ReviewsTab adminPassword={auth.password} />
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
          editingLocation={locationsManagement.editingLocation}
          setEditingLocation={locationsManagement.setEditingLocation}
          handleSaveLocation={locationsManagement.handleSaveLocation}
          loading={locationsManagement.loading}
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