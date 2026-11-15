import json
import urllib.request
import sys
from pathlib import Path

# Add scratch to sys.path for SimpleWS
sys.path.insert(0, str(Path(__file__).parent))
from cdp_indiadealhunts import SimpleWS

def get_tabs():
    data = json.loads(urllib.request.urlopen("http://127.0.0.1:9222/json").read())
    idh_tab = None
    df_tab = None
    for page in data:
        if page.get("type") == "page":
            url = page.get("url", "")
            if "indiadealhunts.vercel.app" in url and not idh_tab:
                idh_tab = page
            elif "dealflow-topaz-seven.vercel.app" in url and not df_tab:
                df_tab = page
    return idh_tab, df_tab

idh_tab, df_tab = get_tabs()
print("IDH Tab:", idh_tab.get("id") if idh_tab else "None")
print("DF Tab:", df_tab.get("id") if df_tab else "None")

results = {}

# 1. Inspect IndiaDealHunts Showcase Part
if idh_tab:
    ws_idh = SimpleWS(idh_tab["webSocketDebuggerUrl"])
    js_idh = """
    (() => {
        // Collect Hero / Showcase elements
        const hero = document.querySelector('[data-testid="hero-banner"], .hero, header, section');
        const marquee = document.querySelector('.marquee, [data-testid="marquee-ticker"]');
        const stories = document.querySelector('[data-testid="category-stories"], .stories-container, .category-stories');
        
        // Find all headings, badges, and showcase cards
        const heroText = hero ? hero.innerText.trim() : '';
        const marqueeText = marquee ? marquee.innerText.trim() : '';
        
        // Find spotlight / hero deal if any
        const spotlightCards = Array.from(document.querySelectorAll('.spotlight, [data-spotlight="true"], .hero-deal, .featured-deal')).map(el => el.innerText.trim());
        
        // Get all visible section titles
        const sectionTitles = Array.from(document.querySelectorAll('h1, h2, h3')).map(el => ({
            tag: el.tagName,
            text: el.innerText.trim()
        })).filter(h => h.text.length > 0);

        // Get top 8 deals displayed in the feed
        const deals = Array.from(document.querySelectorAll('article, .deal-card, [data-deal-id]')).slice(0, 10).map(card => {
            const titleEl = card.querySelector('h3, h4, .deal-title, a[title]');
            const priceEl = card.querySelector('.price, [class*="price"], strong');
            const storeEl = card.querySelector('.store, [class*="store"], [class*="badge"]');
            return {
                title: titleEl ? titleEl.innerText.trim() : '',
                price: priceEl ? priceEl.innerText.trim() : '',
                store: storeEl ? storeEl.innerText.trim() : '',
                fullText: card.innerText.trim().slice(0, 150)
            };
        });

        // Stories / category pills
        const storyPills = Array.from(document.querySelectorAll('.category-story, button[class*="story"], .cat-pill')).map(el => el.innerText.trim());

        return {
            title: document.title,
            heroPreview: heroText.slice(0, 600),
            marquee: marqueeText.slice(0, 200),
            sectionTitles: sectionTitles.slice(0, 15),
            storyPills: storyPills,
            spotlightCards: spotlightCards,
            topDeals: deals
        };
    })()
    """
    results["indiadealhunts"] = ws_idh.eval_js(js_idh)

# 2. Inspect DealFlow Curation Deck
if df_tab:
    ws_df = SimpleWS(df_tab["webSocketDebuggerUrl"])
    js_df = """
    (() => {
        const header = document.querySelector('header, .topbar, nav');
        const headerText = header ? header.innerText.trim() : '';
        
        // Navigation tabs
        const tabs = Array.from(document.querySelectorAll('[role="tab"], button[class*="tab"], nav button')).map(b => b.innerText.trim()).filter(Boolean);
        
        // Deal cards in curation deck
        const cards = Array.from(document.querySelectorAll('.deal-card, [data-deal-card], article, div[class*="card"]')).filter(el => {
            return el.innerText.includes('₹') || el.innerText.includes('Approve') || el.innerText.includes('Reject') || el.innerText.includes('Score');
        }).slice(0, 8).map(el => {
            return el.innerText.trim().slice(0, 200);
        });

        // Check for stats / metrics badges
        const badges = Array.from(document.querySelectorAll('[class*="badge"], [class*="stat"], [class*="count"]')).map(el => el.innerText.trim()).filter(t => t.length > 0 && t.length < 50);

        return {
            title: document.title,
            header: headerText.slice(0, 300),
            tabs: tabs,
            stats: badges.slice(0, 15),
            pendingCardsCount: cards.length,
            sampleCards: cards
        };
    })()
    """
    results["dealflow"] = ws_df.eval_js(js_df)

print(json.dumps(results, indent=2))
