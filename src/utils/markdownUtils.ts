
export const formatMarkdownToHtml = (markdown: string): string => {
  // Simple markdown to HTML conversion, excluding H2 headings which we handle separately
  let html = markdown
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold my-2">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gm, '<li class="ml-6 list-disc my-1">$1</li>')
    .replace(/^([0-9]+)\. (.*$)/gm, '<li class="ml-6 list-decimal my-1">$2</li>')
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="my-2 max-w-full rounded" />')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>')
    .replace(/\n\n/g, '<br/><br/>');
  
  // Wrap lists in ul tags
  html = html.replace(/<li class="ml-6 list-disc my-1">(.*?)<\/li>/g, (match, content) => {
    return `<ul class="my-2">${match}</ul>`;
  }).replace(/<\/ul><ul class="my-2">/g, '');
  
  // Add audio player for vocabulary words
  html = html.replace(/<strong>(.*?)<\/strong> \((.*?)\) - (.*?)<\/li>/g, 
    '<strong>$1</strong> <span class="text-sm text-muted-foreground">($2)</span> - $3 <button class="text-primary text-xs ml-2 audio-btn" data-word="$1" aria-label="Listen to pronunciation">Listen</button></li>');
  
  return html;
};

export const extractSections = (markdown: string): {id: string, title: string, content: string}[] => {
  const sections: {id: string, title: string, content: string}[] = [];
  const sectionRegex = /## (.*?)\n([\s\S]*?)(?=\n## |$)/g;
  
  let match;
  while ((match = sectionRegex.exec(markdown)) !== null) {
    const title = match[1].trim();
    const content = match[2].trim();
    const id = title.toLowerCase().replace(/[^\w]+/g, '-');
    
    sections.push({
      id,
      title,
      content
    });
  }
  
  return sections;
};
