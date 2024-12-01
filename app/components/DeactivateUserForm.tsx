import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSession, SessionProvider } from 'next-auth/react';

function DeactivateUserFormContent() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { data: session } = useSession();

  const handleDeactivate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users/deactivate', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Info': JSON.stringify(session),
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('User deactivated successfully');
        setEmail('');
      } else {
        if (response.status === 401) {
          setMessage('Error: You are not authorized to perform this action. Please log in with an admin account.');
        } else {
          setMessage(`Error: ${data.error}`);
        }
      }
    } catch (error) {
      setMessage('An error occurred while deactivating the user');
    }
  };

  return (
    <form onSubmit={handleDeactivate} className="space-y-4">
      <div>
        <Label htmlFor="email">User Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <Button type="submit">Deactivate User</Button>
      {message && <p className="mt-2 text-sm text-blue-500">{message}</p>}
    </form>
  );
}

export function DeactivateUserForm() {
  return (
    <SessionProvider>
      <DeactivateUserFormContent />
    </SessionProvider>
  );
}
