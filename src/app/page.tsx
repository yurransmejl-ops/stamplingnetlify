'use client';

import { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, XCircle } from 'lucide-react';
import Image from 'next/image';
import LoginForm from '@/components/LoginForm';
import AdminPanel from '@/components/AdminPanel';

// Interfaces for stamp records
interface StampRecord {
  id: string;
  type: 'in' | 'out';
  timestamp: string;
  date: string;
  location?: string;
}

interface ErrorRecord {
  id: string;
  type: 'error';
  message: string;
  timestamp: string;
  date: string;
}

type HistoryItem = StampRecord | ErrorRecord;

// Function to format date in Swedish
const formatSwedishDate = (dateString: string) => {
  const months = [
    'januari', 'februari', 'mars', 'april', 'maj', 'juni',
    'juli', 'augusti', 'september', 'oktober', 'november', 'december'
  ];
  
  const date = new Date(dateString);
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
};

export default function Home() {
  const [isStampedIn, setIsStampedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [currentStampId, setCurrentStampId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'employee' | 'admin' | null>(null);

  // Check stamp status
  const checkStampStatus = async (username: string) => {
    try {
      const response = await fetch('/api/stamp/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsStampedIn(data.isStampedIn);
        setCurrentStampId(data.stampId);
      }
    } catch (error) {
      console.error('Error checking stamp status:', error);
    }
  };

  // Handle login
  const handleLogin = (name: string, role: 'employee' | 'admin', username?: string) => {
    setCurrentUser(name);
    setUserRole(role);
    localStorage.setItem('currentUser', name);
    localStorage.setItem('userRole', role);
    
    if (role === 'employee' && username) {
      localStorage.setItem('currentUsername', username);
      checkStampStatus(username);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    setUserRole(null);
    setIsStampedIn(false);
    setCurrentStampId(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUsername');
  };

  // Handle stamp in/out
  const handleStamp = async () => {
    if (!currentUser || userRole !== 'employee') return;

    setIsLoading(true);
    const username = localStorage.getItem('currentUsername');
    
    if (!username) {
      console.error('No username found in localStorage');
      setIsLoading(false);
      return;
    }

    console.log('🎯 Attempting to stamp with username:', username);

    try {
      const response = await fetch('/api/stamp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username,
          type: isStampedIn ? 'out' : 'in'
        })
      });

      console.log('📡 Stamp API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Stamp successful:', data);
        
        setIsStampedIn(!isStampedIn);
        setCurrentStampId(data.stampId);
        
        // Add to history
        const newItem: StampRecord = {
          id: data.stampId,
          type: isStampedIn ? 'out' : 'in',
          timestamp: new Date().toISOString(),
          date: new Date().toISOString().split('T')[0]
        };
        setHistoryItems(prev => [newItem, ...prev]);
      } else {
        const error = await response.json();
        console.error('❌ Stamp error:', error);
        alert('Fel vid stämpling: ' + (error.error || 'Okänt fel'));
      }
    } catch (error) {
      console.error('❌ Error stamping:', error);
      alert('Nätverksfel vid stämpling');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize app
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedRole = localStorage.getItem('userRole') as 'employee' | 'admin' | null;
    
    if (savedUser && savedRole) {
      setCurrentUser(savedUser);
      setUserRole(savedRole);
      
      if (savedRole === 'employee') {
        const username = localStorage.getItem('currentUsername') || savedUser.toLowerCase().replace(' ', '');
        checkStampStatus(username);
      }
    }
  }, []);

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  if (userRole === 'admin') {
    return <AdminPanel onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#737a5f' }}>
      {/* Header */}
      <div className="container mx-auto px-4 pt-1">
        <div className="relative">
          <button
            onClick={handleLogout}
            className="absolute top-4 right-8 px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg bg-red-500 text-white hover:bg-red-600"
          >
            <XCircle size={16} />
            Logga ut
          </button>
          
          <div className="text-center">
            <div className="mb-0">
              <Image
                src="/logo.svg"
                alt="Städspecialisten Göteborg Logga"
                width={192}
                height={192}
                className="w-48 h-48 mx-auto object-contain"
              />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Städspecialisten
            </h1>
            <h2 className="text-xl font-medium text-white mb-4">
              Göteborg
            </h2>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center -mt-8">
        <div className="max-w-md mx-auto px-4 w-full">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {currentUser} - Stämpling
              </h3>
              
              <button
                onClick={handleStamp}
                disabled={isLoading}
                className={`
                  w-full px-6 py-3 rounded-lg font-semibold text-lg
                  flex items-center justify-center gap-3
                  transition-all duration-200 transform hover:scale-105 active:scale-95
                  shadow-lg hover:shadow-xl mb-6
                  ${isStampedIn 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-yellow-400 text-black hover:bg-yellow-500'
                  }
                  ${isLoading ? 'opacity-50 cursor-not-allowed transform-none' : 'cursor-pointer'}
                `}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
                ) : (
                  <>
                    <Clock size={20} />
                    <span>Stämpla In</span>
                  </>
                )}
              </button>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={20} className="text-gray-600" />
                <h4 className="text-lg font-semibold text-gray-900">Stämplingshistorik</h4>
              </div>
              <p className="text-gray-600 text-sm">
                {historyItems.length > 0 ? `${historyItems.length} stämplingar` : 'Inga stämplingar än'}
              </p>
              
              {historyItems.length > 0 && (
                <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                  {historyItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">
                        {item.type === 'in' ? 'Stämplat in' : 'Stämplat ut'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatSwedishDate(item.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}