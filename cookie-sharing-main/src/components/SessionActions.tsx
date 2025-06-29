
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Trash2, ExternalLink } from 'lucide-react';
import { SessionCookie, deleteCookie } from '@/lib/supabase';
import { downloadJSONFile } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface SessionActionsProps {
  activeSession: SessionCookie;
  currentUser: string;
  onSessionDeleted: () => void;
}

const SessionActions = ({ activeSession, currentUser, onSessionDeleted }: SessionActionsProps) => {
  const { toast } = useToast();
  const isOwnSession = activeSession.uploaded_by === currentUser;

  const handleDownload = () => {
    try {
      downloadJSONFile(activeSession.cookie_data, 'apna_college_cookies.json');
      toast({
        title: "Download started",
        description: "Cookie file has been downloaded successfully."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "Failed to download cookie file."
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to end this session? This action cannot be undone.')) {
      return;
    }

    try {
      const success = await deleteCookie(activeSession.id);
      if (success) {
        toast({
          title: "Session ended",
          description: "The active session has been deleted."
        });
        onSessionDeleted();
      } else {
        toast({
          variant: "destructive",
          title: "Delete failed",
          description: "Failed to delete session. Please try again."
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong while deleting the session."
      });
    }
  };

  const openApnaCollege = () => {
    window.open('https://www.apnacollege.in', '_blank');
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-3">
          <Button
            onClick={handleDownload}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Cookie
          </Button>
          
          <Button
            onClick={openApnaCollege}
            variant="outline"
            className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
            size="lg"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Apna College
          </Button>
          
          {isOwnSession && (
            <Button
              onClick={handleDelete}
              variant="destructive"
              className="w-full"
              size="lg"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              End Session
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionActions;
