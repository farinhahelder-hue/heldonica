'use client';

import { useState } from 'react';
import { openBufferComposer } from '@/lib/buffer';

interface InstagramPostFormProps {
  onSuccess?: () => void;
}

export default function InstagramPublisher({ onSuccess }: InstagramPostFormProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleBufferShare = () => {
    // Opens Buffer Composer - user adds image there
    openBufferComposer();
    setSuccess('✅ Buffer opened! Add your image, write caption, and click Publish.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/instagram/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl, caption }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to post to Instagram');
        return;
      }

      setSuccess(`Posted successfully! View at: ${data.post?.permalink || 'N/A'}`);
      setImageUrl('');
      setCaption('');
      onSuccess?.();
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">📸 Publish to Instagram</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Image URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            required
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Caption <span className="text-red-500">*</span>
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write your caption..."
            required
            rows={4}
            maxLength={2200}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">{caption.length}/2200</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !imageUrl || !caption}
          className="w-full px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Publishing...' : '📸 Publish to Instagram'}
        </button>

        <button
          type="button"
          onClick={handleBufferShare}
          className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 flex items-center justify-center gap-2"
        >
          <span>📱</span>
          <span>Prepare on Buffer (easier)</span>
        </button>
      </form>
    </div>
  );
}