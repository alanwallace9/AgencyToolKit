// Tag types and constants - shared between server and client

export type TagColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'gray';

export interface GuidelyTag {
  id: string;
  agency_id: string;
  name: string;
  color: TagColor;
  created_at: string;
}

export interface TagWithUsage extends GuidelyTag {
  usage_count: number;
}

// Color configuration for UI rendering
export const TAG_COLORS: Record<TagColor, { bg: string; text: string; border: string; stripe: string }> = {
  red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', stripe: 'bg-red-500' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', stripe: 'bg-orange-500' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', stripe: 'bg-yellow-500' },
  green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', stripe: 'bg-green-500' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', stripe: 'bg-blue-500' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', stripe: 'bg-purple-500' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300', stripe: 'bg-pink-500' },
  gray: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', stripe: 'bg-gray-500' },
};
