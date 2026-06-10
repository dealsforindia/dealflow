import { useState } from 'react';
import { X } from 'lucide-react';
import useDealStore from '../store/useDealStore';
import TelegramPreview from './ReviewPanes/TelegramPreview';

/**
 * ComposeDrawer — manual deal creation drawer.
 * Two-column: form on left, live TG preview on right.
 */
function ComposeDrawer({ onClose }) {
  const { composeDeal } = useDealStore();
  const [form, setForm] = useState({
    title: '',
    text: '',
    price: '',
    original_price: '',
    category: '🛍️ General',
    deal_type: 'product',
    affiliate_link: '',
    source: 'manual',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim() && !form.text.trim()) return;
    setSubmitting(true);
    await composeDeal({
      prod_name: form.title,
      aff_text: form.text,
      original_text: form.text,
      prices: {
        sale: form.price ? Number(form.price) : null,
        mrp: form.original_price ? Number(form.original_price) : null,
      },
      category: form.category,
      deal_type: form.deal_type,
      affiliate_link: form.affiliate_link,
      source: 'manual',
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <>
      <div className="compose-overlay" onClick={onClose} />
      <div className="compose-drawer">
        <div className="compose-header">
          <h3>✍️ Compose Deal</h3>
          <button className="icon-action" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="compose-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Left: Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="compose-field">
              <label>Deal Type</label>
              <select value={form.deal_type} onChange={(e) => handleChange('deal_type', e.target.value)}>
                <option value="product">🛍️ Product Deal</option>
                <option value="trick">🎯 Trick / Loot</option>
              </select>
            </div>

            <div className="compose-field">
              <label>Title</label>
              <input value={form.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="Deal title..." />
            </div>

            <div className="compose-field">
              <label>Post Text (Full)</label>
              <textarea
                value={form.text}
                onChange={(e) => handleChange('text', e.target.value)}
                placeholder="Full deal text as it would appear in Telegram..."
                rows={8}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="compose-field">
                <label>Sale Price (₹)</label>
                <input value={form.price} onChange={(e) => handleChange('price', e.target.value)} placeholder="299" type="number" />
              </div>
              <div className="compose-field">
                <label>MRP (₹)</label>
                <input value={form.original_price} onChange={(e) => handleChange('original_price', e.target.value)} placeholder="999" type="number" />
              </div>
            </div>

            <div className="compose-field">
              <label>Affiliate Link</label>
              <input value={form.affiliate_link} onChange={(e) => handleChange('affiliate_link', e.target.value)} placeholder="https://..." />
            </div>

            <div className="compose-field">
              <label>Category</label>
              <select value={form.category} onChange={(e) => handleChange('category', e.target.value)}>
                <option>🛍️ General</option>
                <option>📱 Electronics</option>
                <option>👗 Fashion</option>
                <option>🍎 Grocery</option>
                <option>🏠 Home</option>
                <option>💄 Beauty</option>
                <option>🎮 Gaming</option>
                <option>📚 Books</option>
              </select>
            </div>
          </div>

          {/* Right: Live Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-ter)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              📱 Live Telegram Preview
            </label>
            <TelegramPreview text={form.text || form.title} />
          </div>
        </div>

        <div className="compose-footer">
          <button className="compose-btn" onClick={onClose}>Cancel</button>
          <button className="compose-btn primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Deal'}
          </button>
        </div>
      </div>
    </>
  );
}

export default ComposeDrawer;
