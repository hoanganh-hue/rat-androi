// Production environment configuration
export const environment = {
  production: true,
  apiUrl: '/api', // Relative URL for production (served behind nginx)
  socketUrl: '', // Same origin for Socket.IO
  appName: 'DogeRat Web Admin',
  version: '2.0.0',
};
