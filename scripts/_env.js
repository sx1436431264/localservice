const isProd = process.env['NODE_ENV'] === 'production';

// Major version # of localservice.
// Used for consistent CDN asset locations.
const MAJOR = 1;

module.exports = {
  MAJOR,
  LS_CDN_URL: (isProd ? 'https://prod-cdn' : 'https://localhost:3001') + '/' + MAJOR,
  PWA_SERVER_BASE: isProd ? '1.localservice.host' : 'local.stackblitz.io:3000'
}
