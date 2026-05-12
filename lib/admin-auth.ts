import { NextRequest } from 'next/server';

export function isAdminRequest(req: NextRequest) {
  return req.headers.get('x-hpfc-admin') === '1';
}
