const concurrently = require('concurrently');
const path = require('path');

// Define the commands to run
const commands = [
  {
    command: 'cd Agent-Backend-main/Agent-Backend-main/backend && python manage.py runserver 8000',
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
};

// Run the commands
concurrently(commands, options).then(
  () => console.log('All processes complete!'),
  (error) => console.error('Error occurred:', error)
);