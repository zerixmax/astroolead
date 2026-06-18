import { CMS_URL } from './payload';

export function renderLexical(node: any): string {
  if (!node) return '';

  if (Array.isArray(node)) {
    return node.map(renderLexical).join('');
  }

  // Handle root
  if (node.type === 'root') {
    return renderLexical(node.children || []);
  }

  // Handle text
  if (node.type === 'text') {
    let text = node.text || '';
    
    // Basic text escaping
    const escapeHtml = (unsafe: string) => {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    text = escapeHtml(text);
    
    // Lexical formatting is bitwise:
    // 1 = bold, 2 = italic, 4 = strikethrough, 8 = underline, 16 = code
    if (node.format & 1) text = `<strong>${text}</strong>`;
    if (node.format & 2) text = `<em>${text}</em>`;
    if (node.format & 4) text = `<del>${text}</del>`;
    if (node.format & 8) text = `<u>${text}</u>`;
    if (node.format & 16) text = `<code>${text}</code>`;
    
    return text;
  }

  // Handle paragraphs
  if (node.type === 'paragraph') {
    return `<p class="mb-4">${renderLexical(node.children || [])}</p>`;
  }

  // Handle headings
  if (node.type === 'heading') {
    const tag = node.tag || 'h2';
    // Add margin classes for headings
    const mt = tag === 'h1' || tag === 'h2' ? 'mt-8' : 'mt-6';
    const mb = 'mb-4';
    return `<${tag} class="${mt} ${mb} font-serif font-bold text-olea-earth">${renderLexical(node.children || [])}</${tag}>`;
  }

  // Handle lists
  if (node.type === 'list') {
    const tag = node.listType === 'number' ? 'ol' : 'ul';
    const listClass = node.listType === 'number' ? 'list-decimal' : 'list-disc';
    return `<${tag} class="${listClass} pl-5 mb-4">${renderLexical(node.children || [])}</${tag}>`;
  }
  
  if (node.type === 'listitem') {
    return `<li class="mb-1">${renderLexical(node.children || [])}</li>`;
  }

  // Handle links
  if (node.type === 'link') {
    const href = node.fields?.url || '#';
    return `<a href="${href}" class="text-olea-olive hover:text-olea-earth transition-colors underline">${renderLexical(node.children || [])}</a>`;
  }

  // Handle upload (images/files from Payload)
  if (node.type === 'upload') {
    const url = node.value?.url ? `${CMS_URL}${node.value.url}` : '#';
    const alt = node.value?.alt || 'Image';
    return `<img src="${url}" alt="${alt}" class="my-6 rounded-lg max-w-full h-auto mx-auto" />`;
  }

  // Handle blockquote
  if (node.type === 'quote') {
    return `<blockquote class="border-l-4 border-olea-olive pl-4 italic text-gray-700 my-4">${renderLexical(node.children || [])}</blockquote>`;
  }

  // Fallback: render children if available
  if (node.children) {
    return renderLexical(node.children);
  }

  return '';
}
