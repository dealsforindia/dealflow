import React from 'react';

/**
 * Safely parses Telegram preview markdown (bold **, strike ~~, italic _, code `, markdown [links](url)) into React elements
 * without ANY dangerouslySetInnerHTML, completely eliminating Stored XSS vulnerabilities.
 * Sanitizes template placeholders ({TITLE}) and aggregator leaks (DesiDime/Telegram).
 */
export function renderSafeTelegramText(
  rawText: string,
  maxLines?: number,
  maxLinkLength: number = 32
): React.ReactNode {
  if (!rawText) return null;

  // 1. Sanitize template placeholders and competitor preview bridges
  let cleanText = rawText
    .replace(/\[\s*\]\(https?:\/\/ambhedeal[^\)]+\)/gi, '')
    .replace(/https?:\/\/ambhedeal\.in\.net\S*/gi, '')
    .replace(/\{TITLE\}\s*[-:|–—]?\s*/gi, '')
    .replace(/\{product\}\s*[-:|–—]?\s*/gi, '')
    .replace(/\{name\}\s*[-:|–—]?\s*/gi, '');

  // 2. Sanitize aggregator leak: "Available on: DesiDime" or "Telegram"
  if (/Available on:\s*(?:DesiDime|Telegram|ddime)/i.test(cleanText)) {
    const lower = cleanText.toLowerCase();
    let realStore = '';
    if (/flipkart|fkrt|flixcart/i.test(lower)) realStore = 'Flipkart';
    else if (/amazon|amzn/i.test(lower)) realStore = 'Amazon';
    else if (/myntra|myntr/i.test(lower)) realStore = 'Myntra';
    else if (/ajio|ajiio/i.test(lower)) realStore = 'Ajio';
    else if (/swiggy|instamart/i.test(lower)) realStore = 'Swiggy';
    else if (/blinkit/i.test(lower)) realStore = 'Blinkit';
    else if (/zepto/i.test(lower)) realStore = 'Zepto';

    if (realStore) {
      cleanText = cleanText.replace(/Available on:\s*(?:DesiDime|Telegram|ddime)[^\n]*/gi, `Available on: ${realStore}`);
    } else {
      cleanText = cleanText.replace(/\n*Available on:\s*(?:DesiDime|Telegram|ddime)[^\n]*/gi, '');
    }
  }

  // 3. Normalize redundant markdown links like [https://fkrt.cc/xyz](https://fkrt.cc/xyz) -> https://fkrt.cc/xyz
  cleanText = cleanText.replace(/\[(https?:\/\/[^\s\]]+)\]\(\1\)/g, '$1');

  const lines = maxLines ? cleanText.split('\n').slice(0, maxLines).join('\n') : cleanText;

  // 4. Tokenize on links: markdown [label](url) OR bare URLs
  const LINK_REGEX = /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)|(https?:\/\/[^\s\)\]\>\"\' ]+)/g;

  const parseInlineMarkdown = (text: string, baseKey: string): React.ReactNode => {
    if (!text) return null;
    const tokens = text.split(/(\*\*.*?\*\*|~~.*?~~|`.*?`|\*.*?\*|_.*?_)/g);
    return tokens.map((token, j) => {
      const key = `${baseKey}-${j}`;
      if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
        return (
          <strong key={key} style={{ color: '#fff', fontWeight: 600 }}>
            {token.slice(2, -2)}
          </strong>
        );
      }
      if (token.startsWith('~~') && token.endsWith('~~') && token.length >= 4) {
        return (
          <del key={key} style={{ opacity: 0.7 }}>
            {token.slice(2, -2)}
          </del>
        );
      }
      if (token.startsWith('`') && token.endsWith('`') && token.length >= 3) {
        return (
          <code
            key={key}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              padding: '1px 5px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              color: '#FFD166',
              fontSize: '0.9em'
            }}
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      if (token.startsWith('*') && token.endsWith('*') && token.length >= 3 && !token.startsWith('**')) {
        return (
          <strong key={key} style={{ color: '#fff', fontWeight: 600 }}>
            {token.slice(1, -1)}
          </strong>
        );
      }
      if (token.startsWith('_') && token.endsWith('_') && token.length >= 3) {
        return (
          <em key={key} style={{ fontStyle: 'italic', opacity: 0.9 }}>
            {token.slice(1, -1)}
          </em>
        );
      }
      return token;
    });
  };

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let tokenIdx = 0;

  while ((match = LINK_REGEX.exec(lines)) !== null) {
    if (match.index > lastIndex) {
      const textChunk = lines.slice(lastIndex, match.index);
      elements.push(
        <span key={`text-${tokenIdx++}`}>
          {parseInlineMarkdown(textChunk, `inline-${tokenIdx}`)}
        </span>
      );
    }

    if (match[1] && match[2]) {
      const label = match[1];
      const url = match[2];
      const isUrlLabel = /^https?:\/\//i.test(label);
      const display = isUrlLabel && maxLinkLength && label.length > maxLinkLength
        ? label.slice(0, maxLinkLength) + '…'
        : label;

      elements.push(
        <a
          key={`link-${tokenIdx++}`}
          href={url}
          className="tg-bubble-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {display}
        </a>
      );
    } else if (match[3]) {
      let url = match[3];
      let trailingPunct = '';
      const punctMatch = url.match(/([.,!?;:]+)$/);
      if (punctMatch) {
        trailingPunct = punctMatch[1];
        url = url.slice(0, -trailingPunct.length);
      }
      const display = maxLinkLength && url.length > maxLinkLength
        ? url.slice(0, maxLinkLength) + '…'
        : url;

      elements.push(
        <a
          key={`link-${tokenIdx++}`}
          href={url}
          className="tg-bubble-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {display}
        </a>
      );
      if (trailingPunct) {
        elements.push(<span key={`punct-${tokenIdx++}`}>{trailingPunct}</span>);
      }
    }

    lastIndex = LINK_REGEX.lastIndex;
  }

  if (lastIndex < lines.length) {
    const trailingChunk = lines.slice(lastIndex);
    elements.push(
      <span key={`text-${tokenIdx++}`}>
        {parseInlineMarkdown(trailingChunk, `inline-${tokenIdx}`)}
      </span>
    );
  }

  return <>{elements}</>;
}
