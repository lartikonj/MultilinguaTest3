// Environment configuration for switching between API and static data

// In development, we'll use static data to ensure consistent behavior
export const isStaticDeployment = true;

export const apiBaseUrl = isStaticDeployment ? '' : '/api';
