export const CMS_URL = process.env.CMS_URL || 'http://localhost:3005';

export async function fetchPosts() {
  try {
    const res = await fetch(`${CMS_URL}/api/posts?limit=100`);
    if (!res.ok) {
      throw new Error(`Failed to fetch posts: ${res.statusText}`);
    }
    const data = await res.json();
    return data.docs;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}
