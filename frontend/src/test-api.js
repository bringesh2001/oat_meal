// Simple test script to check API connectivity

async function testApi() {
  try {
    console.log('Testing API connectivity...');
    
    // Test the basic endpoint
    const testUrl = 'http://localhost:8000/test-api/';
    console.log('Fetching:', testUrl);
    const response = await fetch(testUrl);
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Data received:', data);
    } else {
      console.error('Failed to fetch. Status:', response.status);
    }
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

async function testCountriesApi() {
  try {
    console.log('Testing Countries API...');
    
    // Test the countries endpoint
    const countriesUrl = 'http://localhost:8000/api/countries/';
    console.log('Fetching countries:', countriesUrl);
    const response = await fetch(countriesUrl);
    console.log('Countries response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Countries data received:', data);
    } else {
      console.error('Failed to fetch countries. Status:', response.status);
    }
  } catch (error) {
    console.error('Error testing Countries API:', error);
  }
}

// Export the test functions
export { testApi, testCountriesApi }; 