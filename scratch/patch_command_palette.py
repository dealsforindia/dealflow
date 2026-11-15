import sys

path = r'rudranil-deals-web/src/components/CommandPalette.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace tool div with button role="option"
old_tool_div = """              {matchingTools.map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => {
                    onOpenTool(tool.id);
                    onClose();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#0D1527] hover:bg-slate-100 dark:hover:bg-[#172440]/90 dark:bg-[#111C33]/90 border border-slate-200/80 dark:border-white/10 cursor-pointer transition-colors"
                >"""

new_tool_btn = """              {matchingTools.map((tool, tIdx) => (
                <button
                  key={tool.id}
                  type="button"
                  role="option"
                  aria-selected={selectedIndex === tIdx && matchingTools.length > 0}
                  onClick={() => {
                    onOpenTool(tool.id);
                    onClose();
                  }}
                  className="w-full text-left flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#0D1527] hover:bg-slate-100 dark:hover:bg-[#172440]/90 dark:bg-[#111C33]/90 border border-slate-200/80 dark:border-white/10 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >"""

old_tool_end = """                  <span className="text-xs font-bold text-indigo-600 shrink-0 ml-2">
                    Open Engine →
                  </span>
                </div>
              ))}"""

new_tool_end = """                  <span className="text-xs font-bold text-indigo-600 shrink-0 ml-2">
                    Open Engine →
                  </span>
                </button>
              ))}"""

# Replace deal div with button role="option"
old_deal_div = """              return (
                <div
                  key={deal.id}
                  onClick={() => {
                    onSelectDeal(deal);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isHighlighted ? 'bg-slate-100 dark:bg-[#111C33]' : 'hover:bg-slate-50 dark:bg-[#070A11]'
                  }`}
                >"""

new_deal_btn = """              return (
                <button
                  key={deal.id}
                  type="button"
                  role="option"
                  aria-selected={isHighlighted}
                  onClick={() => {
                    onSelectDeal(deal);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isHighlighted ? 'bg-slate-100 dark:bg-[#111C33]' : 'hover:bg-slate-50 dark:bg-[#070A11]'
                  }`}
                >"""

old_deal_end = """                    <span className="text-xs text-blue-600 font-bold hidden sm:inline">
                      View →
                    </span>
                  </div>
                </div>
              );"""

new_deal_end = """                    <span className="text-xs text-blue-600 font-bold hidden sm:inline">
                      View →
                    </span>
                  </div>
                </button>
              );"""

norm_text = text.replace('\r\n', '\n')
norm_text = norm_text.replace(old_tool_div.replace('\r\n', '\n'), new_tool_btn.replace('\r\n', '\n'))
norm_text = norm_text.replace(old_tool_end.replace('\r\n', '\n'), new_tool_end.replace('\r\n', '\n'))
norm_text = norm_text.replace(old_deal_div.replace('\r\n', '\n'), new_deal_btn.replace('\r\n', '\n'))
norm_text = norm_text.replace(old_deal_end.replace('\r\n', '\n'), new_deal_end.replace('\r\n', '\n'))

# Add role="listbox" to results container
norm_text = norm_text.replace('<div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-slate-100">',
                              '<div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-slate-100" role="listbox" aria-label="Search results">')

with open(path, 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(norm_text.replace('\n', '\r\n'))

print("CommandPalette.tsx patched successfully!")

