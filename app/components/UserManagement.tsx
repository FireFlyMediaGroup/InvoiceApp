import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type Role = 'USER' | 'SUPERVISOR' | 'ADMIN';

interface NewUser {
  email: string;
  password: string;
  role: Role;
}

interface ModifyUser {
  email: string;
  newRole: Role;
}

export function UserManagement() {
  const [newUser, setNewUser] = useState<NewUser>({ email: '', password: '', role: 'USER' });
  const [modifyUser, setModifyUser] = useState<ModifyUser>({ email: '', newRole: 'USER' });

  const handleCreateUser = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement API call to create user
    console.log('Creating user:', newUser);
    setNewUser({ email: '', password: '', role: 'USER' });
  };

  const handleModifyRole = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement API call to modify user role
    console.log('Modifying user role:', modifyUser);
    setModifyUser({ email: '', newRole: 'USER' });
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
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
              <Label htmlFor="newPassword">Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newUser.password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewUser({ ...newUser, password: e.target.value })}
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
              <Label htmlFor="modifyEmail">User Email</Label>
              <Input
                id="modifyEmail"
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
      </div>
    </div>
  );
}

export default UserManagement;
