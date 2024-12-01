"use client";

import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { CreateUserForm } from '../../components/CreateUserForm';
import { ModifyUserRoleForm } from '../../components/ModifyUserRoleForm';
import { DeactivateUserForm } from '../../components/DeactivateUserForm';
import { Users, UserPlus, UserMinus } from 'lucide-react';

interface CardWrapperProps {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}

function CardWrapper({ title, description, icon, children }: CardWrapperProps) {
  return (
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
        {children}
      </CardContent>
    </Card>
  );
}

export default function UserManagementPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <CardWrapper
          title="Create New User"
          description="Add a new user to the system"
          icon={<UserPlus className="h-6 w-6" />}
        >
          <CreateUserForm />
        </CardWrapper>
        <CardWrapper
          title="Modify User Role"
          description="Change a user's role in the system"
          icon={<Users className="h-6 w-6" />}
        >
          <ModifyUserRoleForm />
        </CardWrapper>
        <CardWrapper
          title="Deactivate User"
          description="Remove a user from the system"
          icon={<UserMinus className="h-6 w-6" />}
        >
          <DeactivateUserForm />
        </CardWrapper>
      </div>
    </div>
  );
}
