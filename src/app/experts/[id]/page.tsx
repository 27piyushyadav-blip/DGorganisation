'use client';

import { useParams } from 'next/navigation';

export default function ExpertProfilePage() {
  const params = useParams();
  const expertId = params.id as string;

  return (
    <div className="flex-1 p-8">
      <h1 className="mb-4 text-2xl font-bold">Expert Profile</h1>
      <p>Expert ID: {expertId}</p>
      <p>This is a temporary simplified profile page to test navigation.</p>
    </div>
  );
}
