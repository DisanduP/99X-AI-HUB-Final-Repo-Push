import { Team } from '@/app/pages/Team';

export default function TeamPage() {
  try {
    return (
      <div className="flex-1 overflow-auto">
        <div className="px-8 py-6">
          <Team />
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="px-8 py-6">
          <p className="text-red-500">Error loading team component: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }
}
