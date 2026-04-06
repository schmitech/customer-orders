import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Charts from './components/Charts';
import CustomersTable from './components/CustomersTable';
import OrdersTable from './components/OrdersTable';
import { TrendingUp } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'charts':
        return <Charts />;
      case 'customers':
        return <CustomersTable />;
      case 'orders':
        return <OrdersTable />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-soft border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center group">
                <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-lg group-hover:shadow-glow transition-all duration-300">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h1 className="ml-3 text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  Customer Order Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-secondary-600 font-medium">
                Real-time data
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in">
        <div className="animate-slide-up">
          {renderContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto">
        <div className="bg-gradient-to-r from-secondary-900 to-secondary-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">Dashboard</h3>
                <p className="text-secondary-300 text-sm">
                  Real-time analytics and insights for your business
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Technology</h3>
                <p className="text-secondary-300 text-sm">
                  Built with React, Node.js, PostgreSQL, and Tailwind CSS
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">© 2025</h3>
                <p className="text-secondary-300 text-sm">
                  Schmitech Inc. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
