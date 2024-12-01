"use client";

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

type Role = 'USER' | 'SUPERVISOR' | 'ADMIN';

interface ModifyUser {
  id: string;
  newRole: Role;
}

export function ModifyUserRoleForm() {
  const [modifyUser, setModifyUser] = useState<ModifyUser>({ id: '', newRole: 'USER' });
  const [message, setMessage] = useState<string>('');

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
        setModifyUser({ id: '', newRole: 'USER' });
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('An error occurred while updating the user role');
    }
  };

  return (
    <div>
      {message && <p className="mb-4 text-blue-500">{message}</p>}
      <form onSubmit={handleModifyRole} className="space-y-4">
        <div>
          <Label htmlFor="modifyUserId">User ID</Label>
          <Input
            id="modifyUserId"
            type="text"
            value={modifyUser.id}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setModifyUser({ ...modifyUser, id: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="newRole">New Role</Label>
          <select
            id="newRole"
            value={modifyUser.newRole}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setModifyUser({ ...modifyUser, newRole: e.target.value as Role })}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="USER">User</option>
            <option value="SUPERVISOR">Supervisor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <Button type="submit">Modify Role</Button>
      </form>
    </div>
  );
}
