'use client'
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ClipboardDocumentIcon, 
  BuildingLibraryIcon, 
  BuildingOfficeIcon, 
  ScaleIcon, 
  DocumentTextIcon, 
  DocumentDuplicateIcon, 
  CalculatorIcon, 
  IdentificationIcon, 
  CreditCardIcon, 
  HomeModernIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const services = [
  { 
    id: 1, 
    name: 'ATO Registration', 
    description: 'Complete your Australian Taxation Office registration with expert guidance and ensure compliance with all tax regulations.',
    icon: IdentificationIcon,
    category: 'Registration',
    path: '/services/ato-registration'
  },
  { 
    id: 2, 
    name: 'Business Registration', 
    description: 'Register your business entity properly with all required government bodies and establish your business identity.',
    icon: BuildingOfficeIcon,
    category: 'Registration',
    path: '/services/business-registration'
  },
  { 
    id: 3, 
    name: 'Company Registration', 
    description: 'Set up your company structure with proper legal documentation and ensure compliance with ASIC requirements.',
    icon: BuildingLibraryIcon,
    category: 'Registration',
    path: '/services/company-registration'
  },
  { 
    id: 4, 
    name: 'Trust Registration', 
    description: 'Establish a trust entity with appropriate documentation and ensure it meets all legal and tax requirements.',
    icon: ScaleIcon,
    category: 'Registration',
    path: '/services/trust-registration'
  },
  { 
    id: 5, 
    name: 'Notice Assessment', 
    description: 'Receive professional assistance with your ATO Notice of Assessment and understand your tax position.',
    icon: DocumentTextIcon,
    category: 'Documentation',
    path: '/services/notice-assessment'
  },
  { 
    id: 6, 
    name: 'Tax Return Copy', 
    description: 'Obtain certified copies of your previous tax returns for loan applications, audits, or record-keeping.',
    icon: DocumentDuplicateIcon,
    category: 'Documentation',
    path: '/services/tax-return-copy'
  },
  { 
    id: 7, 
    name: 'BAS Lodgement Copy', 
    description: 'Receive copies of your Business Activity Statements for your records or financial requirements.',
    icon: CalculatorIcon,
    category: 'Documentation',
    path: '/services/bas-lodgement-copy'
  },
  { 
    id: 8, 
    name: 'ATO Portal Copy', 
    description: 'Get official copies of your ATO registration documents for your business records or compliance needs.',
    icon: ClipboardDocumentIcon,
    category: 'Documentation',
    path: '/services/ato-portal-copy'
  },
  { 
    id: 9, 
    name: 'Payment Plan', 
    description: 'Set up a manageable payment arrangement with the ATO to address outstanding tax obligations.',
    icon: CreditCardIcon,
    category: 'Management',
    path: '/services/payment-plan'
  },
  { 
    id: 10, 
    name: 'Update Address', 
    description: 'Update your residential or business address with the ATO to ensure you receive important communications.',
    icon: HomeModernIcon,
    category: 'Management',
    path: '/services/update-address'
  }
];

const Services = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const categories = Array.from(new Set(services.map(service => service.category)));
  
  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory ? service.category === selectedCategory : true;
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          service.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleServiceClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 max-w-6xl">
      <motion.div 
        className="mb-6 md:mb-10 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 md:mb-3">Professional Services</h1>
        <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
          Select from our range of professional accounting and taxation services to meet your business needs
        </p>
      </motion.div>

      {/* Search and Filter */}
      <div className="mb-8 bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full md:w-2/3">
            <label htmlFor="search" className="sr-only">Search services</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="search"
                name="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-sky-500 focus:border-sky-500 text-sm"
                placeholder="Search for services..."
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-1/3">
            <label htmlFor="category" className="sr-only">Filter by category</label>
            <select
              id="category"
              name="category"
              className="block w-full py-2 px-3 border border-gray-200 bg-gray-50 rounded-lg focus:ring-sky-500 focus:border-sky-500 text-sm"
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills - Mobile Friendly Alternative */}
      <div className="mb-6 flex flex-wrap gap-2 justify-center md:justify-start">
        <button
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!selectedCategory ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === category ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
      >
        {filteredServices.map(service => (
          <motion.div 
            key={service.id} 
            className="group bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200 border border-gray-100 hover:border-sky-200 hover:shadow-md cursor-pointer"
            whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
            }}
            onClick={() => handleServiceClick(service.path)}
          >
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-sky-50 flex items-center justify-center text-sky-500 group-hover:bg-sky-100 transition-colors">
                    <service.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-sky-500 mb-1">{service.category}</p>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-sky-600 transition-colors">{service.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3">{service.description}</p>
                </div>
              </div>
            </div>
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm font-medium text-sky-600">View details</span>
              <ArrowRightIcon className="w-4 h-4 text-sky-500 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* No results */}
      {filteredServices.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <ClipboardDocumentIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No services found</h3>
          <p className="text-gray-500 max-w-md mx-auto">Try adjusting your search or filter to find what you're looking for.</p>
          <button 
            onClick={() => {setSearchTerm(''); setSelectedCategory(null);}}
            className="mt-4 px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Services;