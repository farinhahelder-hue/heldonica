'use client';

interface Destination {
  _id: string;
  name: string;
  slug: string;
  difficulty: string;
  published: boolean;
  createdAt: string;
}

interface DestinationListProps {
  destinations: Destination[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function DestinationList({ destinations, onEdit, onDelete }: DestinationListProps) {
  if (destinations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No destinations yet. Create your first destination!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Difficulty</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Created</th>
            <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {destinations.map((destination: Destination) => (
            <tr key={destination._id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div>
                  <p className="font-medium text-gray-900">{destination.name}</p>
                  <p className="text-sm text-gray-500">{destination.slug}</p>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {destination.difficulty}
                </span>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm ${
                    destination.published
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {destination.published ? 'Published' : 'Draft'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {new Date(destination.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                <button
                  onClick={() => onEdit(destination._id)}
                  className="text-[#2E4F4F] hover:underline font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(destination._id)}
                  className="text-red-600 hover:underline font-medium"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
