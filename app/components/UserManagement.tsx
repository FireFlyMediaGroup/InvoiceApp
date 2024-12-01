"use client";

import { useState } from 'react';
import type { ReactNode, FormEvent, ChangeEvent } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DeactivateUserForm } from './DeactivateUserForm';
import { Users, UserPlus, UserMinus } from 'lucide-react';

type Role = 'USER' | 'SUPERVISOR' | 'ADMIN';

interface NewUser {
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
}

interface ModifyUser {
  email: string;
  newRole: Role;
}

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

export function UserManagement() {
  const [newUser, setNewUser] = useState<NewUser>({ email: '', role: 'USER', firstName: '', lastName: '' });
  const [modifyUser, setModifyUser] = useState<ModifyUser>({ email: '', newRole: 'USER' });
  const [message, setMessage] = useState<string>('');

  const handleCreateUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(`User created successfully: ${data.user.email}`);
        setNewUser({ email: '', role: 'USER', firstName: '', lastName: '' });
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('An error occurred while creating the user');
    }
  };

  const handleModifyRole = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modifyUser),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(`User role updated successfully: ${data.user.email}`);
        setModifyUser({ email: '', newRole: 'USER' });
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('An error occurred while updating the user role');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      {message && <p className="mb-4 text-blue-500">{message}</p>}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <CardWrapper
          title="Create New User"
          description="Add a new user to the system"
          icon={<UserPlus className="h-6 w-6" />}
        >
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <Label htmlFor="newEmail">Email</Label>
              <Input
                id="newEmail"
                type="email"
                value={newUser.email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="newFirstName">First Name</Label>
              <Input
                id="newFirstName"
                type="text"
                value={newUser.firstName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewUser({ ...newUser, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="newLastName">Last Name</Label>
              <Input
                id="newLastName"
                type="text"
                value={newUser.lastName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewUser({ ...newUser, lastName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="newRole">Role</Label>
              <Select
                value={newUser.role}
                onValueChange={(value: Role) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">Create User</Button>
          </form>
        </CardWrapper>

        <CardWrapper
          title="Modify User Role"
          description="Change a user's role in the system"
          icon={<Users className="h-6 w-6" />}
        >
          <form onSubmit={handleModifyRole} className="space-y-4">
            <div>
              <Label htmlFor="modifyUserEmail">User Email</Label>
              <Input
                id="modifyUserEmail"
                type="email"
                value={modifyUser.email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setModifyUser({ ...modifyUser, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="newRole">New Role</Label>
              <Select
                value={modifyUser.newRole}
                onValueChange={(value: Role) => setModifyUser({ ...modifyUser, newRole: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a new role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">Modify Role</Button>
          </form>
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

export default UserManagement;
