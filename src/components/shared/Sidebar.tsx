'use client'

import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CalendarIcon, Cog6ToothIcon, DocumentDuplicateIcon, FolderIcon, HomeIcon, UsersIcon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { auth } from '@/lib/firebaseConfig'
import { useRouter } from 'next/navigation';
import logo from '@/assets/PROVEN-LOGO-1.png';
import Image from 'next/image'

const classNames = (...classes: any) => {
    return classes.filter(Boolean).join(' ')
}

const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Services', href: '/services', icon: UsersIcon },
    { name: 'Appointments', href: '#', icon: CalendarIcon },
    { name: 'My Requests', href: '#', icon: FolderIcon },
    { name: 'My Bookings', href: '#', icon: DocumentDuplicateIcon },
    { name: 'My Profile', href: '#', icon: UserCircleIcon },
    { name: 'Settings', href: '#', icon: Cog6ToothIcon },
]

const Sidebar = ({ sidebarOpen, setSidebarOpen }: any) => {
    const pathname = usePathname()
    const router = useRouter()
    const [showSidebar, setShowSidebar] = useState(false)

    useEffect(() => {
        if (sidebarOpen) {
            setShowSidebar(true)
        } else {
            setShowSidebar(false)
        }
    }, [sidebarOpen])
    
    useEffect(() => {
        handleClose()
    }, [pathname]);
    

    const handleClose = () => {
        setSidebarOpen(false)
    }
    
    const handleLogout = async () => {
        try {
            await auth.signOut()
            router.push('/login')
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    return (
        <>
            <Transition.Root show={showSidebar} as={Fragment}>
                <Dialog as="div" className="relative z-50 lg:hidden" onClose={handleClose} static>
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        
                    >
                        <div className="fixed inset-0 bg-gray-900/80" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex">
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-in-out duration-200"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="ease-in-out duration-150"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                                        <button type="button" className="-m-2.5 p-2.5" onClick={handleClose}>
                                            <span className="sr-only">Close sidebar</span>
                                            <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                        </button>
                                    </div>
                                </Transition.Child>
                                
                                {/* Sidebar component for mobile */}
                                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-sky-700 to-sky-900 px-6 pb-4 shadow-lg">
                                    <div className="flex h-16 shrink-0 items-center space-x-3">
                                        <div className="bg-white p-1.5 rounded-md shadow-md">
                                            <Image
                                                className="h-8 w-auto"
                                                src={logo.src}
                                                alt="Proven Accountants Logo"
                                                width={100}
                                                height={100}
                                            />
                                        </div>
                                        <p className="text-white text-base font-semibold">Proven Accountants</p>
                                    </div>
                                    
                                    <nav className="flex flex-1 flex-col">
                                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                            <li>
                                                <ul role="list" className="-mx-2 space-y-1">
                                                    {navigation.map((item) => {
                                                        const isActive = pathname === item.href
                                                        return (
                                                            <li key={item.name}>
                                                                <Link
                                                                    href={item.href}
                                                                    className={classNames(
                                                                        isActive
                                                                            ? 'bg-sky-700 text-white'
                                                                            : 'text-sky-100 hover:bg-sky-700 hover:text-white',
                                                                        'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                                                                    )}
                                                                >
                                                                    <item.icon
                                                                        className={classNames(
                                                                            isActive ? 'text-white' : 'text-sky-200 group-hover:text-white',
                                                                            'h-6 w-6 shrink-0',
                                                                        )}
                                                                        aria-hidden="true"
                                                                    />
                                                                    {item.name}
                                                                </Link>
                                                            </li>
                                                        )
                                                    })}
                                                </ul>
                                            </li>
                                            
                                            <li className="mt-auto">
                                                <button
                                                    onClick={handleLogout}
                                                    className="group -mx-2 flex w-full gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-sky-100 hover:bg-sky-700 hover:text-white"
                                                >
                                                    <Cog6ToothIcon
                                                        className="h-6 w-6 shrink-0 text-sky-200 group-hover:text-white"
                                                        aria-hidden="true"
                                                    />
                                                    Logout
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Static sidebar for desktop */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-sky-700 to-sky-900 px-6 pb-4 shadow-lg">
                    <div className="flex h-16 shrink-0 items-center space-x-3">
                        <div className="bg-white p-1.5 rounded-md shadow-md">
                            <Image
                                className="h-8 w-auto"
                                src={logo.src}
                                alt="Proven Accountants"
                                width={100}
                                height={100}
                            />
                        </div>
                        <p className="text-white text-base font-semibold">Proven Accountants</p>
                    </div>
                    
                    <nav className="flex flex-1 flex-col">
                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                            <li>
                                <ul role="list" className="-mx-2 space-y-1">
                                    {navigation.map((item) => {
                                        const isActive = pathname === item.href
                                        return (
                                            <li key={item.name}>
                                                <Link
                                                    href={item.href}
                                                    className={classNames(
                                                        isActive
                                                            ? 'bg-sky-700 text-white'
                                                            : 'text-sky-100 hover:bg-sky-700 hover:text-white',
                                                        'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                                                    )}
                                                >
                                                    <item.icon
                                                        className={classNames(
                                                            isActive ? 'text-white' : 'text-sky-200 group-hover:text-white',
                                                            'h-6 w-6 shrink-0',
                                                        )}
                                                        aria-hidden="true"
                                                    />
                                                    {item.name}
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </li>
                            
                            <li className="mt-auto">
                                <button
                                    onClick={handleLogout}
                                    className="group -mx-2 flex w-full gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-sky-100 hover:bg-sky-700 hover:text-white"
                                >
                                    <Cog6ToothIcon
                                        className="h-6 w-6 shrink-0 text-sky-200 group-hover:text-white"
                                        aria-hidden="true"
                                    />
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </>
    )
}

export default Sidebar