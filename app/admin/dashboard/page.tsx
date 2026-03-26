'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [articles, setArticles] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('articles');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const articlesRes = await fetch('/api/articles', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const destinationsRes = await fetch('/api/destinations', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (articlesRes.ok) {
        setArticles(await articlesRes.json());
      }
      if (destinationsRes.ok) {
        setDestinations(await destinationsRes.json());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/admin/login');
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setArticles(articles.filter((a: any) => a._id !== id));
      }
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const handleDeleteDestination = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/destinations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setDestinations(destinations.filter((d: any) => d._id !== id));
      }
    } catch (error) {
      console.error('Error deleting destination:', error);
    }
  };

  return (
    <div className="min-h-screen bg-cloud-dancer">
      <nav className="bg-mahogany text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-serif font-bold">Heldonica Admin</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        >
          Logout
        </button>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTab('articles')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              tab === 'articles'
                ? 'bg-eucalyptus text-white'
                : 'bg-white text-charcoal hover:bg-gray-100'
            }`}
          >
            Articles
          </button>
          <button
            onClick={() => setTab('destinations')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              tab === 'destinations'
                ? 'bg-eucalyptus text-white'
                : 'bg-white text-charcoal hover:bg-gray-100'
            }`}
          >
            Destinations
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <>
            {tab === 'articles' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-serif font-bold text-mahogany mb-4">Articles</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Title</th>
                        <th className="text-left py-2">Category</th>
                        <th className="text-left py-2">Status</th>
                        <th className="text-left py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {articles.map((article: any) => (
                        <tr key={article._id} className="border-b hover:bg-gray-50">
                          <td className="py-3">{article.title}</td>
                          <td className="py-3">{article.category}</td>
                          <td className="py-3">{article.status}</td>
                          <td className="py-3">
                            <button
                              onClick={() => handleDeleteArticle(article._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {articles.length === 0 && (
                    <p className="text-center py-4 text-gray-500">No articles yet</p>
                  )}
                </div>
              </div>
            )}

            {tab === 'destinations' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-serif font-bold text-mahogany mb-4">Destinations</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Name</th>
                        <th className="text-left py-2">Difficulty</th>
                        <th className="text-left py-2">Published</th>
                        <th className="text-left py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {destinations.map((destination: any) => (
                        <tr key={destination._id} className="border-b hover:bg-gray-50">
                          <td className="py-3">{destination.name}</td>
                          <td className="py-3">{destination.difficulty}</td>
                          <td className="py-3">{destination.published ? 'Yes' : 'No'}</td>
                          <td className="py-3">
                            <button
                              onClick={() => handleDeleteDestination(destination._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {destinations.length === 0 && (
                    <p className="text-center py-4 text-gray-500">No destinations yet</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
