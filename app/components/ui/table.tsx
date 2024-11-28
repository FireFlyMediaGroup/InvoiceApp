'use client';

import * as React from 'react';

export const Table: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <table className="min-w-full border-collapse border border-gray-300">
    {children}
  </table>
);

export const TableHeader: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <thead className="bg-gray-100">{children}</thead>;

export const TableRow: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <tr className="border-b border-gray-300">{children}</tr>;

export const TableHead: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
    {children}
  </th>
);

export const TableBody: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <tbody>{children}</tbody>;

export const TableCell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <td className="px-4 py-2 text-sm text-gray-600">{children}</td>;
