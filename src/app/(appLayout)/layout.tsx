'use client'
import { useEffect, useState, useCallback } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import Sidebar from '@/components/shared/Sidebar';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebaseConfig';
import { getUserProfile } from '@/lib/firebaseService';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import MobileBottomNav from '@/components/features/MobileBottomNav';
import Link from 'next/link';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import LayoutSkeleton from '@/components/skeleton/LayoutSkeleton';
import IntroductionModal from '@/components/features/IntroductionModal';
import Image from 'next/image';
import { generateUserBgColor, userDisplayName } from '@/helper/generateUserBgColor';
import useStore from '@/utils/useStore';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt?: any;
  lastLogin?: any;
  provider?: string;
  hasCompletedIntroduction?: boolean;
}

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname() as string;
  const [isOpen, setIsOpen] = useState(true);
  const [isIntroductionModalOpen, setIsIntroductionModalOpen] = useState(false);
  const { setUser: setUserStore } = useStore();
  const userNavigation = [
    { name: 'Profile', href: '/my-profile' },
    {
      name: 'Logout', href: '#', action: () => {
        auth.signOut();
        router.push('/login');
      }
    },
  ];

  const getPageTitle = useCallback(() => {
    const pathSegments = pathname.split('/').filter(Boolean);

    // Check if we're on a service detail page
    if (pathSegments.length >= 2 && pathSegments[0] === 'services' && pathSegments[1]) {
      // Map service slugs to their display names
      const serviceNames: { [key: string]: string } = {
        'ato-registration': 'ATO Registration',
        'business-registration': 'Business Registration',
        'company-registration': 'Company Registration',
        'trust-registration': 'Trust Registration',
        'notice-assessment': 'Notice Assessment',
        'tax-return-copy': 'Tax Return Copy',
        'bas-lodgement-copy': 'BAS Lodgement Copy',
        'ato-portal-copy': 'ATO Portal Copy',
        'payment-plan': 'Payment Plan',
        'update-address': 'Update Address'
      };

      return serviceNames[pathSegments[1]] || 'Service Details';
    }

    const lastSegment = pathSegments[pathSegments.length - 1] || '';

    const titles = {
      'dashboard': 'Dashboard',
      'services': 'Services',
      'appointments': 'Appointments',
      'my-requests': 'My Requests',
      'my-bookings': 'My Bookings',
      'my-profile': 'My Profile',
      'settings': 'Settings',
    };

    return titles[lastSegment as keyof typeof titles] || 'Proven Accountants';
  }, [pathname]);

  const getInitials = useCallback(() => {

    if (!user?.displayName) return 'U';
    return user.displayName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }, [user?.displayName]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const userProfileResult = await getUserProfile(authUser.uid);
          if (userProfileResult.success) {
            setUserStore(userProfileResult.data);
            setUser({
              uid: authUser.uid,
              email: authUser.email,
              displayName: authUser.displayName || userProfileResult.data?.displayName || 'User',
              photoURL: authUser.photoURL || userProfileResult.data?.photoURL,
              ...userProfileResult.data
            });
            if (!userProfileResult.data?.hasCompletedIntroduction) {
              setIsIntroductionModalOpen(true);
            }
          } else {
            setUser({
              uid: authUser.uid,
              email: authUser.email,
              displayName: authUser.displayName || 'User',
              photoURL: authUser.photoURL
            });
            setIsIntroductionModalOpen(true);
          }
        } catch (error) {
          setUser({
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName || 'User',
            photoURL: authUser.photoURL
          });
          setIsIntroductionModalOpen(true);
        }
      } else {
        setUser(null);
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Add effect to simulate page loading
  useEffect(() => {
    setPageLoading(true);
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [pathname]);

  const handleMenuItemClick = (item: any) => {
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  if (loading) {
    return (
      <LayoutSkeleton />
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      {isIntroductionModalOpen ? (
        <IntroductionModal isOpen={isOpen} setIsOpen={setIsOpen} userData={user} setIsIntroductionModalOpen={setIsIntroductionModalOpen} />
      ) : (
        <div className="min-h-screen bg-gray-50">
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <div className="lg:pl-72">
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8"
            >
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="-m-2.5 p-2.5 text-gray-700 lg:hidden hover:bg-gray-100 rounded-md transition-colors"
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon aria-hidden="true" className="size-6" />
              </button>

              {/* Separator */}
              <div aria-hidden="true" className="h-6 w-px bg-gray-900/10 lg:hidden" />

              <div className="flex justify-between items-center w-full">
                {/* Page Title with subtle animation */}
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center"
                >
                  <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                    {getPageTitle()}
                  </h1>

                  {/* Optional: Breadcrumb for deeper navigation */}
                  {pathname !== '/dashboard' && pathname !== '/' && (
                    <div className="hidden sm:flex items-center ml-4 text-sm text-gray-500">
                      <span className="mx-2 text-gray-300">/</span>
                      {pathname.startsWith('/services/') ? (
                        <>
                          <Link href="/services" className="text-sky-600 hover:text-sky-700">Services</Link>
                          <span className="mx-2 text-gray-300">/</span>
                          <span>{getPageTitle()}</span>
                        </>
                      ) : (
                        <span>{getPageTitle()}</span>
                      )}
                    </div>
                  )}
                </motion.div>

                <div className="flex items-center">
                  {/* Profile dropdown */}
                  <Menu as="div" className="relative">
                    <MenuButton className="-m-1.5 flex items-center p-1.5 hover:bg-gray-50 rounded-full transition-colors">
                      <span className="sr-only">Open user menu</span>
                      {user?.photoURL ? (
                        <Image
                          alt={user.displayName || 'User profile'}
                          src={user.photoURL}
                          className="size-8 rounded-full bg-gray-50 object-cover ring-2 ring-white"
                          width={100}
                          height={100}
                        />
                      ) : (
                        <div className={`size-8 rounded-full flex items-center justify-center text-white font-medium ${generateUserBgColor(user?.email || '')}`}>
                          {getInitials()}
                        </div>
                      )}
                      <span className="hidden lg:flex lg:items-center">
                        <span aria-hidden="true" className="ml-4 text-sm/6 font-semibold text-gray-900">
                          {userDisplayName(user)}
                        </span>
                        <ChevronDownIcon aria-hidden="true" className="ml-2 size-5 text-gray-400" />
                      </span>
                    </MenuButton>
                    <MenuItems
                      transition
                      className="absolute right-0 z-10 mt-2.5 w-56 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                    >
                      {user && (
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.displayName}</p>
                          <p className="text-xs text-gray-500 truncate mt-1">{user.email}</p>
                        </div>
                      )}

                      {userNavigation.map((item) => (
                        <MenuItem key={item.name}>
                          {({ active }) => (
                            <button
                              onClick={() => handleMenuItemClick(item)}
                              className={`block w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-50 text-sky-600' : 'text-gray-700'
                                }`}
                            >
                              {item.name}
                            </button>
                          )}
                        </MenuItem>
                      ))}
                    </MenuItems>
                  </Menu>
                </div>
              </div>
            </motion.div>

            <main className="pb-16 md:pb-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="px-2 md:px-4 sm:px-6 lg:px-8"
              >
                {pageLoading ? <SkeletonLoader /> : children}
              </motion.div>
            </main>
          </div>

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />
        </div>
      )}
    </>
  )
}

export default AppLayout