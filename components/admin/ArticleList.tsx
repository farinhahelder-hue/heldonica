'use client';

interface Article {
  _id: string;
  title: string;
  slug: string;
  category: string;
  published: boolean;
  createdAt: string;
}

interface ArticleListProps {
  articles: Article[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ArticleList({ articles, onEdit, onDelete }: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No articles yet. Create your first article!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Title</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Category</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Created</th>
            <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {articles.map((article: Article) => (
            <tr key={article._id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div>
                  <p className="font-medium text-gray-900">{article.title}</p>
                  <p className="text-sm text-gray-500">{article.slug}</p>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {article.category}
                </span>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm ${
                    article.published
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {article.published ? 'Published' : 'Draft'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {new Date(article.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                <button
                  onClick={() => onEdit(article._id)}
                  className="text-[#2E4F4F] hover:underline font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(article._id)}
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
