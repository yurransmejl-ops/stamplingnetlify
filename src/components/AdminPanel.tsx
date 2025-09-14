'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Save, X } from 'lucide-react';

interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'employee' | 'admin';
  created_at: string;
}

interface AdminPanelProps {
  onLogout: () => void;
}

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditingInPopup, setIsEditingInPopup] = useState(false);
  
  // Formulär för ny/redigerad användare
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'employee' as 'employee' | 'admin'
  });

  // Ladda användare vid komponentmount - ENDAST FRÅN SUPABASE
  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Use working API endpoint with forced refresh
        const response = await fetch('/api/users-working?' + new Date().getTime(), {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        const usersList = await response.json();
        console.log('🔍 AdminPanel loaded users:', usersList);
        setUsers(usersList);
      } catch (error) {
        console.error('Error loading users:', error);
        // If API fails, show empty list instead of fallback
        setUsers([]);
      }
    };
    loadUsers();
  }, []);

  // Hantera formulärändringar
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Hantera lägg till användare
  const handleAddUser = async () => {
    console.log('🚀 handleAddUser called with:', formData);
    
    if (!formData.username || !formData.password || !formData.name) {
      console.log('❌ Missing required fields');
      alert('Alla fält måste fyllas i');
      return;
    }

    console.log('💾 Adding user to database...');
    try {
      const response = await fetch('/api/users-working', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, role: 'employee' }),
      });
      
      if (response.ok) {
        console.log('✅ User added successfully, refreshing list...');
        const usersResponse = await fetch('/api/users-working');
        const usersList = await usersResponse.json();
        console.log('📋 Updated users list:', usersList);
        setUsers(usersList);
        setIsAddingUser(false);
        setFormData({ username: '', password: '', name: '', role: 'employee' });
      } else {
        const error = await response.json();
        console.log('❌ Failed to add user:', error);
        alert(error.error || 'Ett fel uppstod vid skapande av användare');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Ett fel uppstod vid skapande av användare');
    }
  };

  // Hantera ta bort användare
  const handleDeleteUser = async (userId: string, username: string) => {
    if (username === 'admin') {
      alert('Du kan inte ta bort admin-användaren');
      return;
    }

    if (confirm(`Är du säker på att du vill ta bort användaren ${username}?`)) {
      try {
        const response = await fetch(`/api/users-working?id=${userId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          const usersResponse = await fetch('/api/users-working');
          const usersList = await usersResponse.json();
          setUsers(usersList);
        } else {
          const error = await response.json();
          alert(error.error || 'Ett fel uppstod vid borttagning av användare');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Ett fel uppstod vid borttagning av användare');
      }
    }
  };

  // Avbryt redigering
  const handleCancelEdit = () => {
    setIsAddingUser(false);
    setSelectedUser(null);
    setFormData({ username: '', password: '', name: '', role: 'employee' });
  };

  // Hantera användarval
  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsEditingInPopup(true); // Börja redigera direkt
    setFormData({
      username: user.username,
      password: user.password,
      name: user.name,
      role: user.role
    });
  };

  // Stäng användar-popup
  const handleCloseUserPopup = () => {
    setSelectedUser(null);
    setIsEditingInPopup(false);
    setFormData({ username: '', password: '', name: '', role: 'employee' });
  };

  // Spara redigering i popup
  const handleSaveEditInPopup = async () => {
    if (!selectedUser) return;

    if (!formData.username || !formData.password || !formData.name) {
      alert('Alla fält måste fyllas i');
      return;
    }

    try {
      const response = await fetch('/api/users-working', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: selectedUser.id, 
          ...formData, 
          role: selectedUser.role 
        }),
      });
      
      if (response.ok) {
        const usersResponse = await fetch('/api/users-working');
        const usersList = await usersResponse.json();
        setUsers(usersList);
        setIsEditingInPopup(false);
        handleCloseUserPopup();
      } else {
        const error = await response.json();
        alert(error.error || 'Ett fel uppstod vid uppdatering av användare');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Ett fel uppstod vid uppdatering av användare');
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#737a5f' }}>
      {/* Header - längst upp */}
      <div className="container mx-auto px-4 pt-1">
        <div className="relative">
          {/* Logga ut knapp - högra hörnet */}
          <button
            onClick={onLogout}
            className="absolute top-4 right-8 px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg bg-red-500 text-white hover:bg-red-600"
          >
            <X size={16} />
            Logga ut
          </button>
          
          <div className="text-center">
            {/* Städspecialisten logga - längst upp */}
            <div className="mb-0">
              <Image
                src="/logo.svg"
                alt="Städspecialisten Göteborg Logga"
                width={192}
                height={192}
                className="w-48 h-48 mx-auto object-contain"
              />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Admin Panel
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-start justify-center -mt-8 pt-4">
        <div className="max-w-6xl mx-auto px-4 w-full">
          {/* Lägg till användare knapp */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 max-w-2xl mx-auto">
            <button
              onClick={() => {
                console.log('🔥 "Lägg till anställd" button clicked!');
                setIsAddingUser(true);
              }}
              className="w-full px-4 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg bg-yellow-400 text-black hover:bg-yellow-500"
            >
              <Plus size={16} />
              Lägg till anställd
            </button>
          </div>

          {/* Användarlista */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Användare ({users.length})</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Namn</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Roll</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr 
                      key={user.id} 
                      className="border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleUserClick(user)}
                    >
                      <td className="py-2 px-3">
                        <span className="text-gray-900 font-medium">{user.name}</span>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : 'Anställd'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

        {/* Lägg till användare modal */}
        {isAddingUser && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4 shadow-2xl border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Lägg till ny anställd</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Visningsnamn
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    placeholder="Ange visningsnamn"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Användarnamn
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleFormChange('username', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    placeholder="Ange användarnamn"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Lösenord
                  </label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => handleFormChange('password', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    placeholder="Lösenord"
                  />
                </div>
                
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    console.log('🔥 "Lägg till" button in modal clicked!');
                    alert('Button clicked! Check console for more details.');
                    handleAddUser();
                  }}
                  className="flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                >
                  Lägg till
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg bg-gray-500 text-white hover:bg-gray-600"
                >
                  Avbryt
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Användaråtgärder popup */}
        {selectedUser && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4 shadow-2xl border border-gray-200">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Åtgärder för {selectedUser.name}
                </h3>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Visningsnamn
                  </label>
                  {isEditingInPopup ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-400/30 focus:border-yellow-400 text-gray-900 placeholder-gray-500 transition-all duration-200 hover:border-gray-300"
                      placeholder="Ange visningsnamn"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
                      <p className="font-medium text-gray-900">{selectedUser.name}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Användarnamn
                  </label>
                  {isEditingInPopup ? (
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleFormChange('username', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-400/30 focus:border-yellow-400 text-gray-900 placeholder-gray-500 transition-all duration-200 hover:border-gray-300"
                      placeholder="Ange användarnamn"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
                      <p className="font-medium text-gray-900">{selectedUser.username}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Lösenord
                  </label>
                  {isEditingInPopup ? (
                    <input
                      type="text"
                      value={formData.password}
                      onChange={(e) => handleFormChange('password', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-400/30 focus:border-yellow-400 text-gray-900 placeholder-gray-500 transition-all duration-200 hover:border-gray-300"
                      placeholder="Ange lösenord"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
                      <p className="font-medium text-gray-900">••••••••</p>
                    </div>
                  )}
                </div>
                
              </div>
              
              <div className="flex flex-col gap-3 mt-8">
                <button
                  onClick={handleSaveEditInPopup}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  <Save size={18} />
                  Spara ändringar
                </button>
                
                {selectedUser.username !== 'admin' && (
                  <button
                    onClick={() => {
                      if (confirm(`Är du säker på att du vill ta bort användaren ${selectedUser.username}?`)) {
                        handleDeleteUser(selectedUser.id, selectedUser.username);
                        handleCloseUserPopup();
                      }
                    }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                  >
                    <Trash2 size={18} />
                    Ta bort
                  </button>
                )}
                
                <button
                  onClick={handleCloseUserPopup}
                  className="w-full px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  <X size={18} />
                  Avbryt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}