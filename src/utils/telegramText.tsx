import React from 'react';

/**
 * Safely parses Telegram preview markdown (bold **, strike ~~) into React elements
 * without ANY dangerouslySetInnerHTML, completely eliminating Stored XSS vulnerabilities.
 */
export function renderSafeTelegramText(
  rawText: string,
  maxLines?: number,
  maxLinkLength: number = 32
): React.ReactNode {
  if (!rawText) return null;
  const lines = maxLines ? rawText.split('\n').slice(0, maxLines).join('\n') : rawText;

  // Split by URL
  const parts = lines.split(/(https?:\/\/\S+)/g);

  return parts.map((part, i) => {
    if (/^https?:\/\//.test(part)) {
      const display = maxLinkLength && part.length > maxLinkLength ? part.slice(0, maxLinkLength) + '…' : part;
      return (
        <a key={i} href={part} className="tg-bubble-link" target="_blank" rel="noopener noreferrer">
          {display}
        </a>
      );
    }

    // Tokenize on **...** or ~~...~~
    const tokens = part.split(/(\*\*.*?\*\*|~~.*?~~)/g);
    return (
      <span key={i}>
        {tokens.map((token, j) => {
          if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
            return (
              <strong key={j} style={{ color: '#fff', fontWeight: 600 }}>
                {token.slice(2, -2)}
              </strong>
            );
          }
          if (token.startsWith('~~') && token.endsWith('~~') && token.length >= 4) {
            return (
              <del key={j} style={{ opacity: 0.7 }}>
                {token.slice(2, -2)}
              </del>
            );
          }
          // React string interpolation automatically escapes all HTML entities
          return token;
        })}
      </span>
    );
  });
}
