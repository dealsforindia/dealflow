import sys

path = r'rudranil-deals-web/src/App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. activeTab
old_tab = "  const [activeTab, setActiveTab] = useState<NavTab>('home');"
new_tab = """  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    try {
      if (typeof window !== 'undefined') {
        const p = new URLSearchParams(window.location.search).get('tab');
        if (p && ['home', 'saved', 'about', 'how_we_verify', 'wall_of_happiness', 'contact', 'submit_deal', 'profile', 'ending_soon', 'best_worth'].includes(p)) {
          return p as NavTab;
        }
      }
    } catch {}
    return 'home';
  });"""

# 2. tools hub & command palette
old_tools = """  const [isToolsHubOpen, setIsToolsHubOpen] = useState<boolean>(false);
  const [activeToolId, setActiveToolId] = useState<ToolId>('gst');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);"""

new_tools = """  const [isToolsHubOpen, setIsToolsHubOpen] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        return new URLSearchParams(window.location.search).get('modal') === 'tools';
      }
    } catch {}
    return false;
  });
  const [activeToolId, setActiveToolId] = useState<ToolId>(() => {
    try {
      if (typeof window !== 'undefined') {
        const t = new URLSearchParams(window.location.search).get('tool');
        if (t && ['gst', 'bank_offers', 'emi', 'qcommerce', 'unit_price', 'customs', 'subs', 'returns', 'exchange', 'energy', 'warranty', 'budget'].includes(t)) {
          return t as ToolId;
        }
      }
    } catch {}
    return 'gst';
  });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        return new URLSearchParams(window.location.search).get('modal') === 'search';
      }
    } catch {}
    return false;
  });"""

norm_text = text.replace('\r\n', '\n')
norm_text = norm_text.replace(old_tab.replace('\r\n', '\n'), new_tab.replace('\r\n', '\n'))
norm_text = norm_text.replace(old_tools.replace('\r\n', '\n'), new_tools.replace('\r\n', '\n'))

with open(path, 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(norm_text.replace('\n', '\r\n'))

print("App.tsx deep links patched successfully!")

