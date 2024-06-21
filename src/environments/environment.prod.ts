import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,
  apiUrl: 'http://16.171.129.7:4000',
  countryApiUrl : 'https://restcountries.com/v3.1/all',
};
