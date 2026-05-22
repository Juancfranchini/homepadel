// Middleware desactivado temporalmente — acceso libre al backoffice sin login
import { NextResponse } from 'next/server';

export function middleware() {
  return NextResponse.next();
}
