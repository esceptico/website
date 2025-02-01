import { Mode } from '@/types';
import { routes } from '@/constants';

export function getRouteByPath(path: string) {
  return routes.find(route => route.path === path);
}

export function getRoutesByMode(mode: Mode) {
  return routes.filter(route => route.modes.includes(mode));
}

export function getAlternateModePath(currentPath: string, currentMode: Mode, targetMode: Mode) {
  const route = routes.find(r => currentPath.startsWith(r.path));
  if (!route) return '/';
  
  return route.getPath(targetMode);
}

export function isActiveRoute(path: string, currentPath: string, mode: Mode) {
  const route = getRouteByPath(path);
  if (!route) return false;

  const routePath = route.getPath(mode);
  if (currentPath === routePath) return true;
  
  // Handle nested routes
  if (currentPath.startsWith(path + '/')) {
    const currentMode = currentPath.split('/')[2];
    return currentMode === mode;
  }
  
  return false;
}
