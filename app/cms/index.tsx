export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

export default function CmsIndex() {
  redirect('/cms-admin');
}
