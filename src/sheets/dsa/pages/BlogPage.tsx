import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BlogView from '../components/BlogView';
import { hasBlog, loadBlog } from '../content/blogLoader';
import type { DsaBlog } from '../content/blogTypes';
import inventoryData from '../content/topicInventory.json';
import '../styles.css';

type InventoryTopic = { id: string; title: string };

const inventoryTopics = (inventoryData as { topics: InventoryTopic[] }).topics;

function BlogLoader({ id }: { id: string }) {
  const [blog, setBlog] = useState<DsaBlog | null | undefined>(undefined);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setBlog(undefined);
    setError('');
    loadBlog(id)
      .then((data) => {
        if (!cancelled) setBlog(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || 'Failed to load blog');
          setBlog(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (blog === undefined) {
    return <p className="page-status">Loading lesson…</p>;
  }
  if (error) {
    return <p className="page-status">{error}</p>;
  }
  if (!blog) {
    return <p className="page-status">No blog found for this topic.</p>;
  }
  return <BlogView blog={blog} />;
}

export default function BlogPage() {
  const { topicId = '' } = useParams();
  const meta = inventoryTopics.find((t) => t.id === topicId);

  if (!topicId || !hasBlog(topicId)) {
    return (
      <div className="app blog-page">
        <header className="topbar">
          <div className="topbar-copy">
            <Link to="/dsa" className="home-link">
              ← Back to sheet
            </Link>
            <h1>Blog not found</h1>
          </div>
        </header>
        <p className="page-status">
          {meta ? `No blog for “${meta.title}” yet.` : 'Unknown topic.'}
        </p>
      </div>
    );
  }

  return (
    <div className="app blog-page">
      <header className="topbar">
        <div className="topbar-copy">
          <Link to="/dsa" className="home-link">
            ← Back to sheet
          </Link>
          <p className="storage-note">Interview-oriented notes · Python first</p>
        </div>
      </header>
      <BlogLoader id={topicId} />
    </div>
  );
}
