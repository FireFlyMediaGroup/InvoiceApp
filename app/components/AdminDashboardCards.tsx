import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import Link from 'next/link';

export function AdminDashboardCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/users" className="text-blue-500 hover:underline">
            Go to User Management
          </Link>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>POWRA Management</CardTitle>
          <CardDescription>Manage POWRA forms and submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/powra" className="text-blue-500 hover:underline">
            Go to POWRA Management
          </Link>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>Configure system-wide settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/settings" className="text-blue-500 hover:underline">
            Go to System Settings
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
