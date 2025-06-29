
import { useState, useEffect } from 'react';
import UserSetup from '@/components/UserSetup';
import Dashboard from '@/components/Dashboard';
import { getStoredUsername } from '@/lib/auth';
import { checkUserExists } from '@/lib/supabase';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      const storedUsername = getStoredUsername();
      
      if (storedUsername) {
        // Verify user still exists in database
        const exists = await checkUserExists(storedUsername);
        if (exists) {
          setCurrentUser(storedUsername);
        } else {
          // User was deleted from database, clear local storage
          localStorage.removeItem('apna_college_username');
        }
      }
      
      setLoading(false);
    };

    initializeUser();
  }, []);

  const handleSetupComplete = (username: string) => {
    setCurrentUser(username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <UserSetup onSetupComplete={handleSetupComplete} />;
  }

  return <Dashboard username={currentUser} onLogout={handleLogout} />;
};

export default Index;
