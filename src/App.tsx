import React, { useState, useEffect, useRef } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Charts from './components/Charts';
import CustomersTable from './components/CustomersTable';
import OrdersTable from './components/OrdersTable';
import { TrendingUp } from 'lucide-react';

const DEFAULT_SUGGESTED_QUESTIONS = [
  {
    text: "How many customers did we get last week?",
    query: "how many customers did we get last week?"
  },
  {
    text: "How are our sales trending?",
    query: "What are the current sales trends and performance indicators?"
  },
  {
    text: "How has our average order value changed?",
    query: "How has our average order value changed?"
  },
  {
    text: "Show me recent order activity",
    query: "What are the most recent orders and their current status?"
  },
  {
    text: "How do sales this quarter compare to last quarter?",
    query: "How do sales this quarter compare to last quarter?"
  },
  {
    text: "Please provide orders valued $500 above in the last 7 days.",
    query: "Please provide orders valued $500 above in the last 7 days."
  }
];

function loadSuggestedQuestions() {
  const questionsStr = import.meta.env.VITE_WIDGET_SUGGESTED_QUESTIONS;
  if (!questionsStr) {
    return DEFAULT_SUGGESTED_QUESTIONS;
  }

  const attempts = [questionsStr.trim()];
  const relaxedJson = attempts[0].replace(/([{{,]\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":');
  if (relaxedJson !== attempts[0]) {
    attempts.push(relaxedJson);
  }

  let lastError: unknown;
  for (const candidate of attempts) {
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    console.warn('Failed to parse VITE_WIDGET_SUGGESTED_QUESTIONS, using defaults:', lastError);
  }

  return DEFAULT_SUGGESTED_QUESTIONS;
}

// Environment variables configuration for customer orders dashboard
const ENV_CONFIG = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  apiKey: import.meta.env.VITE_API_KEY || 'test-api-key',
  
  // Widget Configuration
  widgetSource: import.meta.env.VITE_WIDGET_SOURCE || 'npm',
  widgetDebug: import.meta.env.VITE_WIDGET_DEBUG === 'true' || import.meta.env.DEV,
  npmWidgetVersion: import.meta.env.VITE_NPM_WIDGET_VERSION || '0.4.11',
  
  // Customer Orders Dashboard App Configuration
  orgName: import.meta.env.VITE_ORG_NAME || 'Customer Order Dashboard',
  orgTagline: import.meta.env.VITE_ORG_TAGLINE || 'Real-time analytics and insights for your business operations. Track orders, customers, and performance metrics.',
  orgPhone: import.meta.env.VITE_ORG_PHONE || '(555) 123-4567',
  orgEmail: import.meta.env.VITE_ORG_EMAIL || 'support@customerorders.com',
  
  // Widget Customization
  widgetHeaderTitle: import.meta.env.VITE_WIDGET_HEADER_TITLE || 'Order Dashboard Assistant',
  widgetWelcomeTitle: import.meta.env.VITE_WIDGET_WELCOME_TITLE || 'Welcome to Customer Order Dashboard!',
  widgetWelcomeDescription: import.meta.env.VITE_WIDGET_WELCOME_DESCRIPTION || 'Your AI assistant for order analytics, customer insights, performance metrics, and business intelligence. Get real-time insights and answers about your data.',
  
  widgetSuggestedQuestions: loadSuggestedQuestions(),
  
  // Theme Configuration - Matches dashboard blue theme
  theme: {
    primary: import.meta.env.VITE_WIDGET_PRIMARY_COLOR || '#3b82f6', // Blue-500 to match dashboard
    secondary: import.meta.env.VITE_WIDGET_SECONDARY_COLOR || '#1e40af', // Blue-800 for CTAs
    background: import.meta.env.VITE_WIDGET_BACKGROUND_COLOR || '#ffffff',
    text: {
      primary: import.meta.env.VITE_WIDGET_TEXT_PRIMARY_COLOR || '#0f172a',
      secondary: import.meta.env.VITE_WIDGET_TEXT_SECONDARY_COLOR || '#64748b',
      inverse: import.meta.env.VITE_WIDGET_TEXT_INVERSE_COLOR || '#ffffff'
    },
    input: {
      background: import.meta.env.VITE_WIDGET_INPUT_BACKGROUND_COLOR || '#f8fafc',
      border: import.meta.env.VITE_WIDGET_INPUT_BORDER_COLOR || '#cbd5e1'
    },
    message: {
      user: import.meta.env.VITE_WIDGET_USER_BUBBLE_COLOR || '#3b82f6',
      assistant: import.meta.env.VITE_WIDGET_ASSISTANT_BUBBLE_COLOR || '#f1f5f9',
      userText: import.meta.env.VITE_WIDGET_USER_TEXT_COLOR || '#ffffff'
    },
    suggestedQuestions: {
      background: import.meta.env.VITE_WIDGET_SUGGESTED_BACKGROUND_COLOR || '#f1f5f9',
      hoverBackground: import.meta.env.VITE_WIDGET_SUGGESTED_HOVER_COLOR || '#e2e8f0',
      text: import.meta.env.VITE_WIDGET_SUGGESTED_TEXT_COLOR || '#1e40af'
    },
    chatButton: {
      background: import.meta.env.VITE_WIDGET_BUTTON_BACKGROUND_COLOR || '#3b82f6',
      hoverBackground: import.meta.env.VITE_WIDGET_BUTTON_HOVER_COLOR || '#2563eb',
      iconColor: import.meta.env.VITE_WIDGET_ICON_COLOR || '#ffffff',
      iconBorderColor: import.meta.env.VITE_WIDGET_ICON_BORDER_COLOR || '#3b82f6',
      borderColor: import.meta.env.VITE_WIDGET_BORDER_COLOR || '#3b82f6',
      iconName: import.meta.env.VITE_WIDGET_ICON_NAME || 'BarChart3'
    }
  }
};

// Function to generate a UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Function to get or create session ID
function getSessionId(): string {
  const storageKey = 'customer_orders_session_id';
  let sessionId = sessionStorage.getItem(storageKey);
  
  if (!sessionId) {
    sessionId = generateUUID();
    sessionStorage.setItem(storageKey, sessionId);
  }
  
  return sessionId;
}

declare global {
  interface Window {
    initChatbotWidget?: (config: {
      apiUrl: string,
      apiKey: string,
      sessionId?: string,
      containerSelector?: string,
      widgetConfig?: {
        header?: { title: string },
        welcome?: { title: string, description: string },
        suggestedQuestions?: Array<{ text: string, query: string }>,
        maxSuggestedQuestionLength?: number,
        maxSuggestedQuestionQueryLength?: number,
        theme?: any
      }
    }) => void;
    ChatbotWidget?: {
      updateWidgetConfig: (config: any) => void;
      setApiUrl: (apiUrl: string) => void;
      setApiKey: (apiKey: string) => void;
      getCurrentConfig?: () => any;
    };
    React?: any;
    ReactDOM?: any;
  }
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const widgetInitialized = useRef(false);

  const initializeWidget = () => {
    if (!window.initChatbotWidget) {
      console.error('initChatbotWidget not available');
      return;
    }

    // Create a container div for the widget (required even for floating widget mode)
    const containerId = 'customer-orders-chatbot-widget-container';
    let container = document.getElementById(containerId);
    
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.style.position = 'fixed';
      container.style.bottom = '20px';
      container.style.right = '20px';
      container.style.zIndex = '9999';
      document.body.appendChild(container);
    }
    
    // Configuration with container selector using environment variables
    const config = {
      // Required parameters
      apiUrl: ENV_CONFIG.apiUrl,
      apiKey: ENV_CONFIG.apiKey,
      sessionId: getSessionId(),
      containerSelector: `#${containerId}`,
      
      // Widget configuration from environment variables
      widgetConfig: {
        header: {
          title: ENV_CONFIG.widgetHeaderTitle
        },
        welcome: {
          title: ENV_CONFIG.widgetWelcomeTitle,
          description: ENV_CONFIG.widgetWelcomeDescription
        },
        suggestedQuestions: ENV_CONFIG.widgetSuggestedQuestions,
        theme: ENV_CONFIG.theme
      }
    };
    
    try {
      window.initChatbotWidget(config);
    } catch (error) {
      console.error('Error initializing chatbot widget:', error);
    }
  };

  // Initialize chatbot widget
  useEffect(() => {
    if (!widgetInitialized.current) {
      const checkWidgetLoaded = () => {
        if (typeof window.initChatbotWidget !== 'undefined') {
          if (typeof window.React === 'undefined' || typeof window.ReactDOM === 'undefined') {
            console.error('React or ReactDOM not loaded!');
            setTimeout(checkWidgetLoaded, 100);
            return;
          }
          
          initializeWidget();
          widgetInitialized.current = true;
        } else {
          setTimeout(checkWidgetLoaded, 100);
        }
      };
      
      const timer = setTimeout(checkWidgetLoaded, 100);
      return () => clearTimeout(timer);
    }
  }, []);

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
