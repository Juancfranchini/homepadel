export function isNavActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  if (href === '/catalogo') {
    return pathname.startsWith('/catalogo') || pathname.startsWith('/producto/');
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
