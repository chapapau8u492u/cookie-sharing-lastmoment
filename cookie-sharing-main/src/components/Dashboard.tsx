import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, LogOut, ExternalLink } from 'lucide-react';
import SessionStatus from './SessionStatus';
import FileUpload from './FileUpload';
import SessionActions from './SessionActions';
import { SessionCookie, fetchActiveSession, cleanupExpiredSessions } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface DashboardProps {
  username: string;
  onLogout: () => void;
}

const Dashboard = ({ username, onLogout }: DashboardProps) => {
  const [activeSession, setActiveSession] = useState<SessionCookie | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadActiveSession = async () => {
    try {
      await cleanupExpiredSessions();
      const session = await fetchActiveSession();
      setActiveSession(session);
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await loadActiveSession();
    toast({
      title: "Refreshed",
      description: "Session status has been updated."
    });
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('apna_college_username');
      onLogout();
    }
  };

  useEffect(() => {
    loadActiveSession();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadActiveSession, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading session status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Apna College Session Manager
                </CardTitle>
                <p className="text-gray-600 mt-1">Welcome back, {username}!</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Session Status */}
        <SessionStatus activeSession={activeSession} currentUser={username} />

        {/* Session Actions (if there's an active session) */}
        {activeSession && (
          <SessionActions
            activeSession={activeSession}
            currentUser={username}
            onSessionDeleted={loadActiveSession}
          />
        )}

        {/* File Upload - Always show this so users can upload new sessions */}
        <FileUpload
          username={username}
          onUploadSuccess={loadActiveSession}
        />

        {/* Open Apna College button - Always show  */}
        <Card>
          <CardContent className="p-6">
            <Button
              onClick={() => window.open('https://www.apnacollege.in', '_blank')}
              variant="outline"
              className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
              size="lg"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Apna College
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
