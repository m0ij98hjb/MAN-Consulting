'use client';
import { useState, useEffect } from 'react';
import { subscribeProjects, subscribeFeaturedProjects, getProjectBySlug } from '@/lib/projectsRepo';

// Admin: realtime full-collection list (relies on the super-admin rule branch).
export function useAdminProjects({ includeArchived = false } = {}) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  useEffect(() => {
    const unsub = subscribeProjects((items) => {
      setProjects(items);
      setLoading(false);
    }, { includeArchived });
    return unsub;
  }, [includeArchived]);
  return { projects, loading };
}

// Public: realtime featured-projects list for the homepage grid.
export function useFeaturedProjects(max = 12) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  useEffect(() => {
    const unsub = subscribeFeaturedProjects((items) => {
      setProjects(items);
      setLoading(false);
    }, { max });
    return unsub;
  }, [max]);
  return { projects, loading };
}

export function useProject(slug) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    let active = true;
    setLoading(true);
    getProjectBySlug(slug).then((p) => {
      if (active) { setProject(p); setLoading(false); }
    });
    return () => { active = false; };
  }, [slug]);
  return { project, loading };
}
