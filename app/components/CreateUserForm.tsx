"use client";

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

type Role = 'USER' | 'SUPERVISOR' | 'ADMIN';

interface NewUser {
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
}

export function CreateUserForm() {
  const [newUser, setNewUser] = useState<NewUser>({ email: '', role: 'USER', firstName: '', lastName: '' });
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

  return (
    <div>
      {message && <p className="mb-4 text-blue-500">{message}</p>}
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
          <select
            id="newRole"
            value={newUser.role}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewUser({ ...newUser, role: e.target.value as Role })}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="USER">User</option>
            <option value="SUPERVISOR">Supervisor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <Button type="submit">Create User</Button>
      </form>
    </div>
  );
}
