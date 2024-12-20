import { Button } from '@/components/ui/button';
import Logo from '../../public/SkySpecs_Logo_Stacked_vertical.png';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { auth } from '../utils/auth';

interface User {
  role?: string;
}

export async function DashboardNavbar() {
  const session = await auth();
  const user = session?.user as User | undefined;
  const userRole = user?.role;

  const isAdmin = userRole === 'ADMIN';
  const isSupervisor = userRole === 'SUPERVISOR' || isAdmin;

  return (
    <nav className="flex items-center justify-between py-5 px-8 bg-white shadow-md">
      <Link href="/dashboard" className="flex items-center gap-2">
        <Image src={Logo} alt="Logo" className="size-10" />
        <h3 className="text-2xl font-semibold leading-normal py-1">
          Safety<span className="text-blue-500">Docs</span>
        </h3>
      </Link>
      <div className="flex gap-4">
        <Link href="/dashboard">
          <Button variant="ghost">Dashboard</Button>
        </Link>
        {isSupervisor && (
          <Link href="/dashboard/invoices">
            <Button variant="ghost">Invoices</Button>
          </Link>
        )}
        <Link href="/dashboard/powra">
          <Button variant="ghost">POWRA</Button>
        </Link>
        <Link href="/dashboard/fpl-missions/tailboard/list">
          <Button variant="ghost">Tailboard Documents</Button>
        </Link>
        {isAdmin && (
          <Link href="/admin">
            <Button variant="ghost">Admin</Button>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default DashboardNavbar;
