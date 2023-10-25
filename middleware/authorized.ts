export default defineNuxtRouteMiddleware(() => {
  const auth = useAuth();
  const { isAuthenticated, isAuthorized } = auth.value;
  if(!(isAuthenticated && isAuthorized)) {
    useMessage()({ type: 'danger', message: '你还未登录' });
    return navigateTo('/login', { replace: true });
  }
});