import type { CollectionType } from "./use-api-types";

export const useAuth = () => useState('auth', () => {
  const isAuthenticated = !!useCookie('access_token').value;
  const isAuthorized = useCookie<boolean>('is_admin').value === true;

  return { isAuthenticated, isAuthorized };
});

export const useCollection = () => useState<CollectionType>('collection', () => 'product');