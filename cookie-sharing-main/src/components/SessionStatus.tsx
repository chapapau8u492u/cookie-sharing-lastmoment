
import { SessionCookie } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface SessionStatusProps {
  activeSession: SessionCookie | null;
  currentUser: string;
}

const SessionStatus = ({ activeSession, currentUser }: SessionStatusProps) => {
  if (!activeSession) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-gray-500 text-lg mb-2">No Active Session</div>
        <p className="text-sm text-gray-400">Upload a cookie file to start sharing</p>
      </div>
    );
  }

  // Parse the timestamp correctly - it's already in UTC from Supabase
  const uploadDate = new Date(activeSession.uploaded_at + 'Z'); // Add Z to ensure UTC parsing
  const timeAgo = formatDistanceToNow(uploadDate, { addSuffix: true });
  const isOwnSession = activeSession.uploaded_by === currentUser;

  console.log('Upload date:', activeSession.uploaded_at);
  console.log('Parsed date:', uploadDate);
  console.log('Time ago:', timeAgo);

  return (
    <div className="text-center p-6 bg-green-50 rounded-lg border-2 border-green-200">
      <div className="text-green-600 text-lg font-semibold mb-2">
        ✓ Session Available
      </div>
      <div className="text-sm text-gray-600 space-y-1">
        <p>
          <span className="font-medium">File:</span> {activeSession.file_name}
        </p>
        <p>
          <span className="font-medium">Uploaded by:</span> {activeSession.uploaded_by}
          {isOwnSession && " (You)"}
        </p>
        <p>
          <span className="font-medium">Uploaded:</span> {timeAgo}
        </p>
      </div>
    </div>
  );
};

export default SessionStatus;
