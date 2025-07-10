// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  useBackend: true, // Usando el backend real
  apiUrl: 'http://localhost:3000', // URL del JSON Server
  backendUrl: 'http://localhost:8080/api', // URL del backend real (sin /api)
  appName: 'VitaMeet',
  version: '1.0.0'
};
