import { useState } from 'react';
import roadmapData from '@/data/roadmap.json';

type RoadmapStatus = 'planned' | 'in-progress' | 'completed';
type RoadmapType = 'feature' | 'bug' | 'enhancement';

type RoadmapItem = {
  id: number;
  title: string;
  description: string;
  status: RoadmapStatus;
  type: RoadmapType;
  targetDate?: string;
  completedDate?: string;
};

const STATUS_LABELS: Record<RoadmapStatus, string> = {
  planned: 'Planned',
  'in-progress': 'In Progress',
  completed: 'Completed',
};

const TYPE_LABELS: Record<RoadmapType, string> = {
  feature: 'Feature',
  bug: 'Bug Fix',
  enhancement: 'Enhancement',
};

const STATUS_BADGE: Record<RoadmapStatus, string> = {
  planned: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  'in-progress': 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200',
  completed: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200',
};

const TYPE_BADGE: Record<RoadmapType, string> = {
  feature: 'bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400',
  bug: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  enhancement: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
};

export default function AdminRoadmap() {
  const items: RoadmapItem[] = roadmapData as RoadmapItem[];
  const [filter, setFilter] = useState<RoadmapStatus | 'all'>('all');

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);

  return (
    <div className="min-h-screen bg-gold-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Roadmap Admin</h1>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'planned', 'in-progress', 'completed'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === s
                    ? 'bg-gold-500 text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {s === 'all' ? 'All' : STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Admin editing is not available in this build. To update the roadmap, edit <code>src/data/roadmap.json</code> directly.
          </p>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">No items.</p>
          )}
          {filtered.map(item => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100
                dark:border-gray-700 shadow-sm p-4 flex flex-col sm:flex-row
                sm:items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {item.title}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[item.status]}`}>
                    {STATUS_LABELS[item.status]}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGE[item.type]}`}>
                    {TYPE_LABELS[item.type]}
                  </span>
                </div>
                {item.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                )}
                <div className="flex gap-4 mt-1">
                  {item.targetDate && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Target: {item.targetDate}
                    </span>
                  )}
                  {item.completedDate && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Done: {item.completedDate}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
