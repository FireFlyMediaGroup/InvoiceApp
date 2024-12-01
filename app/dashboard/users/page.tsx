"use client";

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { CreateUserForm } from '../../components/CreateUserForm';
import { ModifyUserRoleForm } from '../../components/ModifyUserRoleForm';
import { DeactivateUserForm } from '../../components/DeactivateUserForm';

export default function UserManagementPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateUserForm />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Modify User Role</CardTitle>
          </CardHeader>
          <CardContent>
            <ModifyUserRoleForm />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Deactivate User</CardTitle>
          </CardHeader>
          <CardContent>
            <DeactivateUserForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
