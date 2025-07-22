import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen, Eye, Clock } from "lucide-react";
import { StoriesFeed } from "@/components/stories-feed";
import { CreateStoryModal } from "@/components/create-story-modal";
import { useTranslation } from "@/lib/translations";

export function Stories() {
  const { t } = useTranslation();
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-900 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2E5A87] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">{t('stories')}</h1>
                <p className="text-sm text-muted-foreground">{t('share_moments_contacts')}</p>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-[#2E5A87] hover:bg-[#1e3a5f]"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('create_story')}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Stories Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stories Feed - Main Focus */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border mb-6">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">{t('recent_activity')}</h2>
            <p className="text-muted-foreground mt-1">
              {t('blue_ring_new_content')}
            </p>
          </div>
          
          <StoriesFeed />
        </div>

        {/* Feature Info - Secondary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-[#2E5A87]" />
                <span className="text-sm font-medium">Stories Feature</span>
              </div>
              <div className="text-lg font-semibold text-[#2E5A87]">Active</div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">View Tracking</span>
              </div>
              <div className="text-lg font-semibold text-green-600">Enabled</div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Auto-Expire</span>
              </div>
              <div className="text-lg font-semibold text-orange-600">Active</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Story Modal */}
      <CreateStoryModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />
    </div>
  );
}