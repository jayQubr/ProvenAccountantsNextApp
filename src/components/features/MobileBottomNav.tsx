'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon, 
  ClipboardDocumentListIcon, 
  CalendarIcon, 
  WrenchScrewdriverIcon 
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid, 
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid, 
  CalendarIcon as CalendarIconSolid, 
  WrenchScrewdriverIcon as WrenchScrewdriverIconSolid 
} from '@heroicons/react/24/solid';
import { useState, useEffect, memo } from 'react';

const navItems = [
  { 
    name: 'Home', 
    href: '/', 
    icon: HomeIcon,
    activeIcon: HomeIconSolid,
    color: 'sky',
    highlight: true 
  },
  { 
    name: 'My Requests', 
    href: '/my-requests', 
    icon: ClipboardDocumentListIcon,
    activeIcon: ClipboardDocumentListIconSolid,
    color: 'indigo'
  },
  { 
    name: 'Appointments', 
    href: '/appointments', 
    icon: CalendarIcon,
    activeIcon: CalendarIconSolid,
    color: 'amber'
  },
  { 
    name: 'Services', 
    href: '/services', 
    icon: WrenchScrewdriverIcon,
    activeIcon: WrenchScrewdriverIconSolid,
    color: 'emerald',
  }
];

const MobileBottomNav = () => {
  const pathname:any = usePathname();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Handle scroll to hide/show the bottom nav
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show nav when scrolling up or at the top, hide when scrolling down
      if (currentScrollY <= 10 || currentScrollY < lastScrollY) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const getColorClasses = (item: typeof navItems[0], isActive: boolean) => {
    const colorMap: Record<string, { bg: string, text: string, activeBg: string }> = {
      sky: { 
        bg: 'bg-sky-500', 
        text: 'text-sky-500',
        activeBg: 'bg-sky-100'
      },
      indigo: { 
        bg: 'bg-indigo-500', 
        text: 'text-indigo-500',
        activeBg: 'bg-indigo-100'
      },
      amber: { 
        bg: 'bg-amber-500', 
        text: 'text-amber-500',
        activeBg: 'bg-amber-100'
      },
      emerald: { 
        bg: 'bg-emerald-500', 
        text: 'text-emerald-500',
        activeBg: 'bg-emerald-100'
      }
    };

    const color = colorMap[item.color] || colorMap.sky;
    
    if (item.highlight) {
      return color.bg;
    }
    
    return isActive ? color.text : 'text-gray-500 hover:text-gray-900';
  };


  const getTextColorClass = (item: typeof navItems[0], isActive: boolean) => {
    const colorMap: Record<string, string> = {
      sky: 'text-sky-500',
      indigo: 'text-indigo-500',
      amber: 'text-amber-500',
      emerald: 'text-emerald-500'
    };
    
    return isActive ? colorMap[item.color] || colorMap.sky : 'text-gray-500';
  };

  // Check if a route is active, including nested routes
  const isRouteActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white border-t border-gray-200 px-2 py-1 shadow-lg">
            <nav className="flex justify-around">
              {navItems.map((item) => {
                const isActive = isRouteActive(item.href);
                const Icon = isActive ? item.activeIcon : item.icon;
                const colorClass = getColorClasses(item, isActive);
                const activeBgClass = item.color ? `bg-${item.color}-100` : 'bg-sky-100';
                
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    onClick={(e) => {
                      if (isActive) {
                        e.preventDefault();
                      }
                    }}
                    className={`flex flex-col items-center py-2 px-3 rounded-lg ${
                      isActive && !item.highlight ? activeBgClass : ''
                    } ${item.highlight ? 'relative' : ''}`}
                  >
                    {item.highlight ? (
                      <motion.div
                        className={`absolute -top-4 w-14 h-14 ${colorClass} rounded-full flex items-center justify-center shadow-lg`}
                        initial={{ y: 0 }}
                        whileTap={{ y: -5 }}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </motion.div>
                    ) : (
                      <motion.div 
                        whileTap={{ scale: 0.9 }}
                        className={isActive ? colorClass : 'text-gray-500'}
                      >
                        <Icon className="w-6 h-6" />
                      </motion.div>
                    )}
                    
                    <span className={`text-xs font-medium mt-1 ${item.highlight ? 'mt-9' : ''} ${
                      isActive ? getTextColorClass(item, isActive) : 'text-gray-500'
                    }`}>
                      {item.name}
                    </span>
                    
                    {isActive && !item.highlight && (
                      <motion.div
                        className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${item.color ? `bg-${item.color}-500` : 'bg-sky-500'}`}
                        layoutId="bottomNavIndicator"
                        transition={{ type: "spring", duration: 0.5 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* Safe area for iOS devices */}
          <div className="h-safe-bottom bg-white" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(MobileBottomNav);