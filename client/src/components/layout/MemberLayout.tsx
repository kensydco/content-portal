import { ReactNode } from 'react';

interface MemberLayoutProps {
  children: ReactNode;
}

export default function MemberLayout({ children }: MemberLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">Content Upload</h1>
          <p className="text-neutral-600 mt-2">Share your content with us</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
