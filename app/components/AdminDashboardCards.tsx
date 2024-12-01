import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import Link from 'next/link';
import { Users, FileText, Settings } from 'lucide-react';
import type { ReactNode } from 'react';

interface CardWrapperProps {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
}

export function AdminDashboardCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <CardWrapper
        href="/dashboard/users"
        title="User Management"
        description="Manage user accounts and permissions"
        icon={<Users className="h-6 w-6" />}
      />
      <CardWrapper
        href="/dashboard/powra"
        title="POWRA Management"
        description="Manage POWRA forms and submissions"
        icon={<FileText className="h-6 w-6" />}
      />
      <CardWrapper
        href="/dashboard/settings"
        title="System Settings"
        description="Configure system-wide settings"
        icon={<Settings className="h-6 w-6" />}
      />
    </div>
  );
}

function CardWrapper({ href, title, description, icon }: CardWrapperProps) {
  return (
    <Link href={href} className="block">
      <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center space-x-4">
          <div className="rounded-full bg-primary p-2 text-primary-foreground">
            {icon}
          </div>
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <span className="text-blue-500 hover:underline">
            Go to {title}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
