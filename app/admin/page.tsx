import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const cookieName = process.env.COOKIE_NAME || 'admin_session';
  const isLoggedIn = cookieStore.has(cookieName);

  if (!isLoggedIn) {
    redirect('/admin/login');
  }

  return <DashboardClient />;
}