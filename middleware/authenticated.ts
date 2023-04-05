export default defineNuxtRouteMiddleware(() => {
  const auth = useAuth();
  if(!auth.value.isAuthenticated) {
    useMessage()({ type: 'danger', message: '你还未登录' });
    return navigateTo('/login', { replace: true });
  }
});