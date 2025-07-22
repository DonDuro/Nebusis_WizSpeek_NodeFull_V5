import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, UserX, BarChart3 } from "lucide-react";
import { AdminUserManagement } from "@/components/admin-user-management";
import { UserBlockingManager } from "@/components/user-blocking-manager";
import { ComplianceCenter } from "@/components/compliance-center";
import { useTranslation } from "@/lib/translations";

export function Admin() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-900 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">{t('admin_dashboard')}</h1>
                <p className="text-sm text-muted-foreground">{t('manage_users_platform_security')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin_features')}</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{t('active')}</div>
              <p className="text-xs text-muted-foreground">
                {t('full_user_management_capabilities')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('user_management')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{t('enabled')}</div>
              <p className="text-xs text-muted-foreground">
                {t('ban_unban_delete_users')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('user_blocking')}</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{t('live')}</div>
              <p className="text-xs text-muted-foreground">
                {t('advanced_user_blocking_system')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('analytics')}</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{t('ready')}</div>
              <p className="text-xs text-muted-foreground">
                {t('user_activity_statistics')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>{t('administrative_tools')}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t('manage_users_handle_violations')}
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="users" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mx-6 mt-6">
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {t('user_management')}
                </TabsTrigger>
                <TabsTrigger value="blocking" className="flex items-center gap-2">
                  <UserX className="w-4 h-4" />
                  {t('user_blocking')}
                </TabsTrigger>
                <TabsTrigger value="compliance" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {t('compliance')}
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  {t('analytics')}
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="users" className="mt-0">
                  <AdminUserManagement />
                </TabsContent>

                <TabsContent value="blocking" className="mt-0">
                  <UserBlockingManager />
                </TabsContent>

                <TabsContent value="compliance" className="mt-0 -m-6">
                  <ComplianceCenter />
                </TabsContent>

                <TabsContent value="analytics" className="mt-0">
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Detailed user analytics and platform statistics will be available here. 
                      This includes user engagement, story views, message statistics, and more.
                    </p>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}