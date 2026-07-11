import { useMemo } from 'react';

/**
 * TelegramPreview — shows how the post will look in @dealsforindiachannel.
 * Used in EditDrawer for live preview.
 */
function TelegramPreview({ text, imageUrl, channelName = '@dealsforindiachannel' }) {
  const charCount = (text || '').length;
  const limit = imageUrl ? 1024 : 4096;
  const pct = charCount / limit;
  const countClass = pct > 1 ? 'danger' : pct > 0.9 ? 'warning' : '';

  return (
    <div className="tg-preview-card">
      <div className="tg-preview-header">
        <div className="channel-avatar-sm">D</div>
        {channelName}
      </div>
      {imageUrl && (
        <img src={imageUrl} alt="" className="tg-preview-image" onError={(e) => e.target.style.display = 'none'} />
      )}
      <div className="tg-preview-text">
        {text || '(Empty post)'}
      </div>
      <div className={`tg-preview-charcount ${countClass}`}>
        {charCount} / {limit}
      </div>
    </div>
  );
}

export default TelegramPreview;
