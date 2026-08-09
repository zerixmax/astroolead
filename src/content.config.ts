import { defineCollection, z } from 'astro:content';

const CMS_URL = process.env.CMS_URL || 'http://localhost:3005';

const postSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  content: z.any(),
  seo: z.object({
    metaTitle: z.string().nullable().optional(),
    metaDescription: z.string().nullable().optional(),
  }).nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

function createPayloadLoader(locale: string) {
  return async () => {
    try {
      const response = await fetch(`${CMS_URL}/api/posts?limit=100&locale=${locale}&fallback-locale=hr`);
      if (!response.ok) {
        console.warn(`Failed to fetch from Payload CMS: ${response.statusText}`);
        return [];
      }
      const data = await response.json();
      return data.docs.map((post: any) => ({
        ...post,
        id: post.slug, // Required by Astro Collections
      }));
    } catch (error) {
      console.warn("Could not connect to Payload CMS. Ensure it's running on port 3005 during build.");
      return [];
    }
  };
}

const blogHr = defineCollection({
  loader: createPayloadLoader('hr'),
  schema: postSchema,
});

const blogEn = defineCollection({
  loader: createPayloadLoader('en'),
  schema: postSchema,
});

export const collections = {
  'blog-hr': blogHr,
  'blog-en': blogEn,
};
