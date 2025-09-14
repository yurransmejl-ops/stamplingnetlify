'use client';

import { useState } from 'react';
import Image from 'next/image';
import { LogIn } from 'lucide-react';

interface LoginFormProps {
  onLogin: (name: string, role: 'employee' | 'admin', username?: string) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulera lite loading tid
    await new Promise(resolve => setTimeout(resolve, 500));

    // Kontrollera inloggningsuppgifter via API
    try {
      const response = await fetch('/api/users-working');
      const users = await response.json();
      const user = users.find((u: { username: string; password: string; name: string; role: 'employee' | 'admin' }) => u.username === name && u.password === password);

      if (user) {
        onLogin(user.name, user.role, user.username);
      } else {
        setError('Fel användarnamn eller lösenord');
      }
    } catch {
      setError('Fel vid inloggning');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#737a5f' }}>
      {/* Header - längst upp */}
      <div className="container mx-auto px-4 pt-1">
        <div className="text-center">
          {/* Städspecialisten logga - längst upp */}
          <div className="mb-0">
            <Image
              src="/logo.svg"
              alt="Städspecialisten Göteborg Logga"
              width={256}
              height={256}
              className="w-64 h-64 mx-auto object-contain"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Stämpelapp
          </h1>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex-1 flex items-start justify-center -mt-14 pt-10">
        <div className="max-w-md mx-auto px-4 w-full">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center flex items-center justify-center gap-2">
              <LogIn size={24} />
              Logga in
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Namn
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="Användarnamn"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Lösenord
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="Lösenord"
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`
                  w-full px-4 py-3 rounded-lg font-medium text-sm
                  flex items-center justify-center gap-2
                  transition-all duration-200 transform hover:scale-105 active:scale-95
                  shadow-md hover:shadow-lg
                  bg-yellow-400 text-gray-900 hover:bg-yellow-500
                  ${isLoading 
                    ? 'opacity-50 cursor-not-allowed transform-none' 
                    : 'cursor-pointer'
                  }
                `}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>Logga in</span>
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}