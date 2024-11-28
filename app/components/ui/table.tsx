'use client';

import React from 'react';
import type { FC, ReactNode } from 'react';

export const Table: FC<{ children: ReactNode }> = ({
  children,
}) => (
  <table className="min-w-full border-collapse border border-gray-300">
    {children}
  </table>
);

export const TableHeader: FC<{ children: ReactNode }> = ({
  children,
}) => <thead className="bg-gray-100">{children}</thead>;

export const TableRow: FC<{ children: ReactNode }> = ({
  children,
}) => <tr className="border-b border-gray-300">{children}</tr>;

export const TableHead: FC<{ children: ReactNode }> = ({
  children,
}) => (
  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
    {children}
  </th>
);

export const TableBody: FC<{ children: ReactNode }> = ({
  children,
}) => <tbody>{children}</tbody>;

export const TableCell: FC<{ children: ReactNode }> = ({
  children,
}) => <td className="px-4 py-2 text-sm text-gray-600">{children}</td>;
