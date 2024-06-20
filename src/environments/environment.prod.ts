import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,
  apiUrl: 'http://localhost:8000',
  countryApiUrl : 'https://restcountries.com/v3.1/all',
};
