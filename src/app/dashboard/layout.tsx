import { Metadata } from 'next';
import StudentLayoutClient from './StudentLayoutClient';

export const metadata: Metadata = {
  title: 'Mi Dashboard | Prototyp3D',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <StudentLayoutClient>{children}</StudentLayoutClient>;
}
