import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/DirectoryDetail.css';
import logo from '../images/OatmealaLogoi (1).png';
import { API_ENDPOINTS } from '../config';
import { testApi, testCountriesApi } from '../test-api';

// Mapping from URL directory types to database BusinessType values
const DIRECTORY_TYPE_TO_BUSINESS_TYPE = {
  'agricultural-associations': 'Agricultural Association',
  'artisan-producers': 'Artisan Food Producer',
  'business-resources': 'Business Resources',
  'crafter-organizations': 'Crafters Organization',
  'farmers-markets': 'Farmers Market',
  'farms-ranches': 'Farm / Ranch',
  'fiber-cooperatives': 'Fiber Cooperative',
  'fiber-mills': 'Fiber Mill',
  'fisheries': 'Fisheries',
  'fishermen': 'Fishermen',
  'food-cooperatives': 'Food Cooperative',
  'food-hubs': 'Food Hub',
  'grocery-stores': 'Grocery Store',
  'manufacturers': 'Manufacturer',
  'marinas': 'Marina',
  'meat-wholesalers': 'Meat Wholesaler',
  'real-estate-agents': 'Real Estate Agent',
  'restaurants': 'Restaurant',
  'retailers': 'Retailer',
  'service-providers': 'Service Provider',
  'universities': 'University',
  'veterinarians': 'Veterinarian',
  'vineyards': 'Vineyard',
  'wineries': 'Winery',
  'others': 'Other',
  'herb-tea-producers': 'Herb & Tea Producer'
};

// Import images with the correct file extensions
import agriAssociaImg from '../images/agri_associa.png';
import artisianImg from '../images/artisian.jpg';
import brImg from '../images/br.jpg';
import crafOrgImg from '../images/craf_org.jpg';
import farmersMarketImg from '../images/farmers_market.jpg';
import farmsRanchesImg from '../images/farms_ranches.jpg';
import fiberImg from '../images/fiber.jpg';
import fiberMillsImg from '../images/fiber_mills.jpg';
import fisheriesImg from '../images/fisheries.jpeg';
import fishermenImg from '../images/fishermen.jpeg';
import foodCopImg from '../images/food_cop.jpg';
import foodHubImg from '../images/food_hub.jpg';
import groceryStoreImg from '../images/grocery_store.jpeg';
import manfacImg from '../images/manfac.jpeg';
import marinasImg from '../images/marinas.jpeg';
import meatImg from '../images/meat.jpg';
import realEstateImg from '../images/real_estate.webp';
import restaurantsImg from '../images/restaurants.jpg';
import retailersImg from '../images/retailers.png';
import serviceProvidersImg from '../images/service_providers.webp';
import universitiesImg from '../images/universities.jpeg';
import vetImg from '../images/vet.webp';
import vineyardsImg from '../images/vineyards.jpeg';
import wineriesImg from '../images/wineries.png';
import othersImg from '../images/others.jpg';

function DirectoryDetail() {
  const { directoryType } = useParams();
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [searchName, setSearchName] = useState('');
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedBusinessId, setExpandedBusinessId] = useState(null);
  const [groupedBusinesses, setGroupedBusinesses] = useState({});
  const [showGrouped, setShowGrouped] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showProfileView, setShowProfileView] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  // Define businessType at the component level
  const businessType = DIRECTORY_TYPE_TO_BUSINESS_TYPE[directoryType] || '';

  // Format the directory type for display (convert path slugs to title)
  const formatTitle = (slug) => {
    if (!slug) return '';
    return slug.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const title = formatTitle(directoryType);

  // Map of directory type slugs to their corresponding images
  const directoryImages = {
    'agricultural-associations': agriAssociaImg,
    'artisan-producers': artisianImg,
    'business-resources': brImg,
    'crafter-organizations': crafOrgImg,
    'farmers-markets': farmersMarketImg,
    'farms-ranches': farmsRanchesImg,
    'fiber-cooperatives': fiberImg,
    'fiber-mills': fiberMillsImg,
    'fisheries': fisheriesImg,
    'fishermen': fishermenImg,
    'food-cooperatives': foodCopImg,
    'food-hubs': foodHubImg,
    'grocery-stores': groceryStoreImg,
    'manufacturers': manfacImg,
    'marinas': marinasImg,
    'meat-wholesalers': meatImg,
    'real-estate-agents': realEstateImg,
    'restaurants': restaurantsImg,
    'retailers': retailersImg,
    'service-providers': serviceProvidersImg,
    'universities': universitiesImg,
    'veterinarians': vetImg,
    'vineyards': vineyardsImg,
    'wineries': wineriesImg,
    'others': othersImg
  };

  // Get the correct image for the current directory type
  const getHeaderImage = () => {
    return directoryImages[directoryType] || othersImg; // Default to "others" if not found
  };

  // Function to fetch businesses based on the selected country and state
  const fetchBusinesses = useCallback(async () => {
    if (!selectedCountry || !selectedState) {
      setError('Please select both a country and state');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!businessType) {
        throw new Error(`Unknown directory type: ${directoryType}`);
      }
      
      console.log(`Fetching businesses for ${selectedState}, ${selectedCountry}, business type: ${businessType}`);

      // Create direct URL with proper parameter names matching the backend
      const apiUrl = `${API_ENDPOINTS.directoryBusinesses}?country_name=${encodeURIComponent(selectedCountry)}&state_name=${encodeURIComponent(selectedState)}&BusinessType=${encodeURIComponent(businessType)}`;
      
      console.log(`API URL: ${apiUrl}`);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API response data:', data);

      if (!Array.isArray(data)) {
        console.error('Expected array response but got:', typeof data);
        throw new Error('Received unexpected data format from API');
      }
      
      console.log(`Received ${data.length} businesses from API`);
      
      // Process businesses to ensure they have consistent properties
      const processedBusinesses = data.map((business, index) => {
        return {
          id: business.id || business.ID || index + 1,
          BusinessName: business.BusinessName || business.business_name || 'Unknown Business',
          BusinessType: business.BusinessType || business.business_type || businessType,
          Address: business.Address || business.address || '',
          Phone: business.Phone || business.phone || '',
          Email: business.Email || business.email || '',
          Website: business.Website || business.website || '',
          Country: business.country_name || business.Country || selectedCountry,
          State: business.state_name || business.State || selectedState
        };
      });
      
      // Filter by name if searchName is provided
      const filteredBusinesses = searchName 
        ? processedBusinesses.filter(business => 
            business.BusinessName.toLowerCase().includes(searchName.toLowerCase())
          )
        : processedBusinesses;
      
      // Sort businesses by name
      const sortedBusinesses = filteredBusinesses.sort((a, b) => 
        (a.BusinessName || '').localeCompare(b.BusinessName || '')
      );
      
      setBusinesses(sortedBusinesses);
      setCurrentPage(1); // Reset to first page on new search
      console.log(`Displaying ${sortedBusinesses.length} businesses`);
      
    } catch (err) {
      console.error('Error fetching businesses:', err);
      setError(err.message || 'Failed to fetch businesses');
      setBusinesses([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCountry, selectedState, directoryType, businessType, searchName]);

  // UseEffect to fetch businesses when country and state change
  useEffect(() => {
    if (selectedCountry && selectedState) {
      fetchBusinesses();
    }
  }, [selectedCountry, selectedState, fetchBusinesses]);

  // Load countries from API
  useEffect(() => {
    const loadCountries = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // First, run direct test functions
        await testApi();
        await testCountriesApi();
        
        try {
          const corsTestResponse = await fetch(API_ENDPOINTS.test);
          console.log("CORS test response status:", corsTestResponse.status);
          if (corsTestResponse.ok) {
            const corsTestData = await corsTestResponse.json();
            console.log("CORS test received data:", corsTestData);
          } else {
            console.error("CORS test failed");
          }
        } catch (corsTestError) {
          console.error("CORS test error:", corsTestError);
        }
        
        // Make a direct request to test the countries API
        const testUrl = 'http://localhost:8000/api/countries/';
        console.log("Testing countries API directly:", testUrl);
        
        // First try a direct test
        try {
          const testResponse = await fetch(testUrl);
          console.log("Direct test response status:", testResponse.status);
          if (testResponse.ok) {
            const testData = await testResponse.json();
            console.log("Direct test received data:", testData);
          } else {
            console.error("Direct test failed");
          }
        } catch (testError) {
          console.error("Direct test error:", testError);
        }
        
        // Now try the configured endpoint
        console.log("Fetching countries from API...");
        console.log("Countries API URL:", API_ENDPOINTS.countries);
        
        const response = await fetch(API_ENDPOINTS.countries);
        console.log("Countries API response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response text:", errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Countries data received:", data);
        
        if (Array.isArray(data)) {
          setCountries(data);
        } else {
          console.error("Unexpected countries data format:", data);
          setError("Received invalid data format for countries");
        }
      } catch (error) {
        console.error("Error loading countries:", error);
        setError(`Failed to load countries: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadCountries();
  }, []);

  // Load states when country is selected
  useEffect(() => {
    if (!selectedCountry) {
      setStates([]);
      return;
    }

    const loadStates = async (country) => {
      if (!country) return;
      
      setIsLoading(true);
      setError(null);
      try {
        console.log(`Fetching states for country: ${country}`);
        const url = `${API_ENDPOINTS.states}?country=${encodeURIComponent(country)}`;
        console.log("States API URL:", url);
        
        const response = await fetch(url);
        console.log("States API response status:", response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("States data received:", data);
        
        if (Array.isArray(data)) {
          setStates(data);
        } else {
          console.error("Unexpected states data format:", data);
          setError("Received invalid data format for states");
        }
      } catch (error) {
        console.error(`Error loading states for ${country}:`, error);
        setError(`Failed to load states: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadStates(selectedCountry);
  }, [selectedCountry]);

  // Function to handle clearing filters
  const handleClearFilters = () => {
    console.log('Clearing filters');
    setSelectedCountry('');
    setSelectedState('');
    setSearchName('');
    // After clearing filters, reset businesses to empty
    setBusinesses([]);
  };

  // Function to handle opening a business
  const handleOpenBusiness = (business) => {
    console.log('Opening business:', business);
    
    // If website exists, open it in a new tab
    if (business.Website) {
      const websiteUrl = business.Website.startsWith('http') 
        ? business.Website 
        : `https://${business.Website}`;
      window.open(websiteUrl, '_blank');
    } else {
      // If no website, show an alert
      alert(`No website available for ${business.BusinessName}`);
    }
  };

  // Function to toggle business details
  const toggleBusinessDetails = (business) => {
    console.log('Showing details for business:', business);
    
    // Set the selected business and show profile view
    setSelectedBusiness(business);
    setShowProfileView(true);
  };

  // Handle contact form changes
  const handleContactFormChange = (e) => {
    const { name, value } = e.target;
    setContactFormData({
      ...contactFormData,
      [name]: value
    });
  };

  // Handle contact form submission
  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Contact form submitted:', contactFormData);
    
    // Show a success message
    alert(`Message sent to ${selectedBusiness?.BusinessName}! We'll get back to you soon.`);
    
    // Clear the form
    setContactFormData({
      name: '',
      email: '',
      message: ''
    });
  };

  // Handle going back to the directory list
  const handleBackToList = () => {
    setShowProfileView(false);
    setSelectedBusiness(null);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBusinesses = businesses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(businesses.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="association-pagination">
        {currentPage > 1 && (
          <a 
            href="#!" 
            className="pagination-item" 
            onClick={() => paginate(currentPage - 1)}
          >
            &lt;
          </a>
        )}

        {pageNumbers.map(number => (
          <a
            key={number}
            href="#!"
            className={`pagination-item ${currentPage === number ? 'active' : ''}`}
            onClick={() => paginate(number)}
          >
            {number}
          </a>
        ))}

        {currentPage < totalPages && (
          <a 
            href="#!" 
            className="pagination-item" 
            onClick={() => paginate(currentPage + 1)}
          >
            &gt;
          </a>
        )}
      </div>
    );
  };

  return (
    <div className="directory-detail-container">
      {!showProfileView ? (
        // Regular directory list view
        <>
          {/* Page header */}
          <h1 className="page-header">{title}</h1>

          {/* Main content */}
          <div className="directory-content">
            {/* Search Panel */}
            <div className="search-panel">
              <h3>Search</h3>
              <div className="search-form">
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <select 
                    id="country"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                  >
                    <option value="">Select</option>
                    {countries.map((country, index) => (
                      <option key={index} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <select 
                    id="state"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    disabled={!selectedCountry}
                  >
                    <option value="">Any</option>
                    {states.map((state, index) => (
                      <option key={index} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Business name"
                  />
                </div>

                <button 
                  className="search-button"
                  onClick={fetchBusinesses}
                  disabled={!selectedCountry || !selectedState}
                >
                  Search
                </button>
              </div>
            </div>

            {/* Association List */}
            <div className="association-list">
              {isLoading ? (
                <div className="loading">Loading...</div>
              ) : error ? (
                <div className="error-message">{error}</div>
              ) : businesses.length > 0 ? (
                <>
                  {renderPagination()}
                  
                  {currentBusinesses.map(business => (
                    <div className="association-card" key={business.id}>
                      <div className="association-header">
                        {business.BusinessName}
                      </div>
                      <div className="association-content">
                        <img 
                          src={getHeaderImage()} 
                          alt={business.BusinessName} 
                          className="association-logo" 
                        />
                        <div className="association-info">
                          <div className="association-location">
                            {business.State}, {business.Country}
                          </div>
                          {business.Website && (
                            <div className="association-website">
                              {business.Website}
                            </div>
                          )}
                          <a href={`mailto:${business.Email}`} className="association-contact">
                            Contact
                          </a>
                          <div className="association-social">
                            {/* Facebook */}
                            <a href="#" className="social-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C18.34 21.21 22 17.06 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
                              </svg>
                            </a>
                            {/* Twitter/X */}
                            <a href="#" className="social-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                              </svg>
                            </a>
                            {/* Instagram */}
                            <a href="#" className="social-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                              </svg>
                            </a>
                            {/* YouTube */}
                            <a href="#" className="social-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                              </svg>
                            </a>
                          </div>
                          <button 
                            className="profile-button"
                            onClick={() => toggleBusinessDetails(business)}
                          >
                            Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {renderPagination()}
                </>
              ) : (
                <div className="no-results">
                  {selectedCountry && selectedState ? (
                    <p>No businesses found matching your criteria. Try a different search.</p>
                  ) : (
                    <p>Please select a country and state to search for businesses.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        // Profile View
        <div className="profile-page">
          <div className="profile-header">
            <div className="header-left">
              <img src={logo} alt="Logo" className="business-logo" />
              <h1>{selectedBusiness?.BusinessName}</h1>
            </div>
            <div className="social-links">
              {/* Facebook */}
              <a href="#" className="social-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C18.34 21.21 22 17.06 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
                </svg>
              </a>
              {/* Twitter/X */}
              <a href="#" className="social-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="social-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              {/* YouTube */}
              <a href="#" className="social-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </a>
            </div>
            {selectedBusiness?.Website && (
              <div className="website-link">
                <a href={selectedBusiness.Website.startsWith('http') ? selectedBusiness.Website : `https://${selectedBusiness.Website}`} 
                   target="_blank" 
                   rel="noopener noreferrer">
                  {selectedBusiness.Website}
                </a>
              </div>
            )}
          </div>

          <div className="profile-title-bar">
            <h2>{selectedBusiness?.BusinessType}</h2>
          </div>

          <div className="profile-content">
            <div className="profile-main">
              <div className="info-boxes">
                <div className="info-box">
                  <img src={farmersMarketImg} alt="Who We Are" className="info-image" />
                  <h3>Who We Are</h3>
                  <p>
                    {selectedBusiness?.BusinessName} is located in {selectedBusiness?.State}, {selectedBusiness?.Country}. 
                    We specialize in {selectedBusiness?.BusinessType}. Our organization is dedicated to 
                    sustainable practices and community engagement.
                  </p>
                </div>
                
                <div className="info-box">
                  <img src={foodHubImg} alt="Partnerships & Programs" className="info-image" />
                  <h3>Partnerships & Programs</h3>
                  <p>
                    We're proud to partner with local businesses and organizations to promote 
                    sustainable agriculture. Our programs focus on education, community outreach, 
                    and supporting the next generation of agricultural professionals.
                  </p>
                </div>
                
                <div className="info-box">
                  <img src={farmsRanchesImg} alt="Support" className="info-image" />
                  <h3>Support {selectedBusiness?.BusinessName}</h3>
                  <p>
                    There are many ways to support our mission. Connect with us 
                    through the contact form or visit our website to learn more about 
                    how you can get involved with our organization.
                  </p>
                </div>
              </div>
              {/* Add extra space to accommodate the contact form */}
              <div style={{ height: "350px" }}></div>
            </div>
            
            <div className="contact-section">
              <h3>Contact Us</h3>
              <form onSubmit={handleContactSubmit}>
                <div className="form-field">
                  <input 
                    type="text" 
                    name="name" 
                    value={contactFormData.name}
                    onChange={handleContactFormChange}
                    placeholder="Name" 
                    required 
                  />
                </div>
                <div className="form-field">
                  <input 
                    type="email" 
                    name="email" 
                    value={contactFormData.email}
                    onChange={handleContactFormChange}
                    placeholder="Email" 
                    required 
                  />
                </div>
                <div className="form-field">
                  <textarea 
                    name="message" 
                    value={contactFormData.message}
                    onChange={handleContactFormChange}
                    placeholder="Message" 
                    required
                  ></textarea>
                </div>
                <button type="submit" className="send-button">Send</button>
              </form>
            </div>
          </div>
          
          <div className="profile-footer">
            <button className="back-button" onClick={handleBackToList}>
              Back to Directory
            </button>
            <p className="copyright">Copyright © 2023 - 2025 {selectedBusiness?.BusinessName}. All Rights Reserved.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DirectoryDetail;