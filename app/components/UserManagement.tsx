"use client";

import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DeactivateUserForm } from './DeactivateUserForm';

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
      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-semibold mb-2">Create New User</h3>
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
                <option value="USER">User</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="ADMIN">Admin</option>
              </Select>
            </div>
            <Button type="submit">Create User</Button>
          </form>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Modify User Role</h3>
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
                <option value="USER">User</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="ADMIN">Admin</option>
              </Select>
            </div>
            <Button type="submit">Modify Role</Button>
          </form>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Deactivate User</h3>
          <DeactivateUserForm />
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
