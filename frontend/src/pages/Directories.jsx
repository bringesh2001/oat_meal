import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Directories.css';

// Import your logo image
import logo from '../images/OatmealaLogoi (1).png';
import heroImage from '../images/Image 92.jpg';

// Import all directory images
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

function Directories() {
  // Enhanced useEffect with logging
  useEffect(() => {
    console.log('Directories component mounted - adding directories-body class');
    
    // Force removal first to ensure clean state
    document.body.classList.remove('directories-body');
    
    // Add class with timeout to ensure it happens after render
    setTimeout(() => {
      document.body.classList.add('directories-body');
      console.log('directories-body class added to body');
    }, 100);
    
    // Cleanup function
    return () => {
      console.log('Directories component unmounting - removing directories-body class');
      document.body.classList.remove('directories-body');
    };
  }, []);

  // Directory data to make the JSX cleaner
  const directories = [
    { img: agriAssociaImg, title: "Agricultural Associations", desc: "Farmers unite for shared resources", path: "/directory/agricultural-associations" },
    { img: artisianImg, title: "Artisan Producers", desc: "Crafting unique goods with natural ingredients", path: "/directory/artisan-producers" },
    { img: brImg, title: "Business Resources", desc: "Tools support growth, efficiency in farming", path: "/directory/business-resources" },
    { img: crafOrgImg, title: "Crafter Organizations", desc: "Network, learn skills, enhance creativity here", path: "/directory/crafter-organizations" },
    { img: farmersMarketImg, title: "Farmers Markets", desc: "Fresh produce sold directly by growers", path: "/directory/farmers-markets" },
    { img: farmsRanchesImg, title: "Farms/Ranches", desc: "Cultivate land, raise livestock", path: "/directory/farms-ranches" },
    { img: fiberImg, title: "Fiber Cooperatives", desc: "Collaborate for sustainable textile production", path: "/directory/fiber-cooperatives" },
    { img: fiberMillsImg, title: "Fiber Mills", desc: "Process fibers into usable materials", path: "/directory/fiber-mills" },
    { img: fisheriesImg, title: "Fisheries", desc: "Manage aquatic resources sustainably today", path: "/directory/fisheries" },
    { img: fishermenImg, title: "Fishermen", desc: "Harvest fish, support marine ecosystems", path: "/directory/fishermen" },
    { img: foodCopImg, title: "Food Cooperatives", desc: "Community-owned, fair trade sourcing", path: "/directory/food-cooperatives" },
    { img: foodHubImg, title: "Food Hubs", desc: "Centralize distribution, connect producers", path: "/directory/food-hubs" },
    { img: groceryStoreImg, title: "Grocery Stores", desc: "Shop fresh, local produce easily", path: "/directory/grocery-stores" },
    { img: manfacImg, title: "Manufacturers", desc: "Produce goods, support supply chains", path: "/directory/manufacturers" },
    { img: marinasImg, title: "Marinas", desc: "Dock boats, enjoy water activities here", path: "/directory/marinas" },
    { img: meatImg, title: "Meat Wholesalers", desc: "Supply high-quality, fresh meats", path: "/directory/meat-wholesalers" },
    { img: realEstateImg, title: "Real Estate Agents", desc: "Find properties, assist buyers", path: "/directory/real-estate-agents" },
    { img: restaurantsImg, title: "Restaurants", desc: "Enjoy meals, support local chefs", path: "/directory/restaurants" },
    { img: retailersImg, title: "Retailers", desc: "Shop diverse products, convenient access", path: "/directory/retailers" },
    { img: serviceProvidersImg, title: "Service Providers", desc: "Offer expertise, enhance operations", path: "/directory/service-providers" },
    { img: universitiesImg, title: "Universities", desc: "Educate minds, foster research growth", path: "/directory/universities" },
    { img: vetImg, title: "Veterinarians", desc: "Care for animals, ensure health", path: "/directory/veterinarians" },
    { img: vineyardsImg, title: "Vineyards", desc: "Cultivate grapes, produce fine wines", path: "/directory/vineyards" },
    { img: wineriesImg, title: "Wineries", desc: "Craft wine, offer tasting experiences", path: "/directory/wineries" },
    { img: othersImg, title: "Others", desc: "Explore diverse, miscellaneous resources", path: "/directory/others" }
  ];

  return (
    <div className="directories-page">
      {/* Inline styles to force correct display */}
      <style>
        {`
          /* Force proper card and image display */
          .directory-card {
            position: relative !important;
            height: 350px !important;
            width: 267px !important;
            margin: 120px auto 20px !important;
            padding: 120px 15px 20px !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: space-between !important;
            text-align: center !important;
            overflow: visible !important;
            background: white !important;
            border-radius: 16px !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
          }
          
          .directory-card img {
            position: absolute !important;
            top: -110px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: 219px !important;
            height: 219px !important;
            border-radius: 110px !important;
            object-fit: cover !important;
            z-index: 1 !important;
          }
          
          .directory-grid {
            display: grid !important;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
            gap: 40px !important;
            max-width: 1200px !important;
            margin: 0 auto !important;
            padding: 20px !important;
          }
          
          .explore-btn {
            display: inline-block !important;
            background-color: #333 !important;
            color: white !important;
            border: none !important;
            border-radius: 30px !important;
            padding: 10px 24px !important;
            margin-top: 10px !important;
            margin-bottom: 15px !important;
            text-decoration: none !important;
            width: auto !important;
          }
        `}
      </style>

      <div className="hero">
        <img src={heroImage} alt="" className="hero-image" />
      </div>

      <main>
        <h1>Farm to Table Directories</h1>
        
        <div className="directory-grid">
          {directories.map((dir, index) => (
            <div 
              className="directory-card" 
              key={index}
            >
              <img 
                src={dir.img} 
                alt={dir.title} 
              />
              <h3>
                {dir.title}
              </h3>
              <p>
                {dir.desc}
              </p>
              <Link 
                to={dir.path} 
                className="explore-btn"
              >
                Explore
              </Link>
            </div>
        ))}
      </div>
      </main>
    </div>
  );
}

export default Directories; 