import React, { useEffect, useRef, useState } from 'react';
import { BarChart3, Users, ShoppingCart, Home } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'charts', label: 'Analytics', icon: BarChart3 },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
  ];

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollState, setScrollState] = useState({ canScrollLeft: false, canScrollRight: false });

  useEffect(() => {
    const element = scrollRef.current;

    const updateScrollState = () => {
      if (!element) return;
      const { scrollLeft, scrollWidth, clientWidth } = element;
      setScrollState({
        canScrollLeft: scrollLeft > 0,
        canScrollRight: scrollLeft + clientWidth < scrollWidth - 1,
      });
    };

    if (element) {
      element.addEventListener('scroll', updateScrollState);
    }

    updateScrollState();

    const handleResize = () => updateScrollState();
    window.addEventListener('resize', handleResize);

    return () => {
      if (element) {
        element.removeEventListener('scroll', updateScrollState);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleKeyNavigation = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex === -1) return;
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
    onTabChange(tabs[nextIndex].id);
    const buttons = scrollRef.current?.querySelectorAll('button[role="tab"]');
    const nextButton = buttons?.[nextIndex] as HTMLButtonElement | undefined;
    nextButton?.focus();
  };

  return (
    <nav className="bg-white/70 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div 
          ref={scrollRef}
          className="flex space-x-1 overflow-x-auto focus:outline-none"
          role="tablist"
          aria-label="Primary navigation"
          onKeyDown={handleKeyNavigation}
          tabIndex={0}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`group relative flex items-center px-4 py-4 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:rounded-xl ${
                  isActive
                    ? 'text-primary-600'
                    : 'text-secondary-600 hover:text-primary-600'
                }`}
                role="tab"
                aria-selected={isActive}
              >
                <Icon className={`w-4 h-4 mr-2 transition-transform duration-200 ${
                  isActive ? 'scale-110' : 'group-hover:scale-110'
                }`} />
                <span className="relative">
                  {tab.label}
                  {isActive && (
                    <span className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full" />
                  )}
                </span>
                {!isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary-200 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                )}
              </button>
            );
          })}
        </div>
        {scrollState.canScrollLeft && (
          <div className="pointer-events-none absolute left-4 top-0 bottom-0 bg-gradient-to-r from-white via-white/70 to-transparent w-8" />
        )}
        {scrollState.canScrollRight && (
          <div className="pointer-events-none absolute right-4 top-0 bottom-0 bg-gradient-to-l from-white via-white/70 to-transparent w-8" />
        )}
      </div>
    </nav>
  );
};

export default Navigation;
