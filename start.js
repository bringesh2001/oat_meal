const concurrently = require('concurrently');
const path = require('path');

// Define the commands to run
const commands = [
  {
    command: 'cd Agent-Backend-main/Agent-Backend-main/backend && python manage.py runserver 0.0.0.0:8000',
    name: 'DJANGO',
    prefixColor: 'blue'
  },
  {
    command: 'cd my-app && npm start',
    name: 'REACT',
    prefixColor: 'green'
  }
];

// Options for concurrently
const options = {
  prefix: 'name',
  killOthers: ['failure', 'success'],
  restartTries: 3,
  restartDelay: 1000,
};

console.log('Starting the application...');
console.log('Django backend will be available at: http://localhost:8000');
console.log('React frontend will be available at: http://localhost:3000');
console.log('Please wait while the services start up...');

// Run the commands
concurrently(commands, options).then(
  () => console.log('All processes complete!'),
  (error) => console.error('Error occurred:', error)
);