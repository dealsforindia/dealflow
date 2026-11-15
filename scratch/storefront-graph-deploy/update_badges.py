import sys

with open('src/components/ExternalSearchResults.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('source_type?: string;', 'source_type?: string;\n  history_badge?: string;\n  verdict?: string;')

target_matrix = '''                            {deal.source_type === 'database_verified' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-100">
                                Directory offer
                              </span>
                            )}
                          </div>'''
replacement_matrix = '''                            {deal.source_type === 'database_verified' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-100">
                                Directory offer
                              </span>
                            )}
                          </div>
                          {deal.verdict && (
                            <p className="mt-1 text-[10px] leading-tight text-slate-500 max-w-xs">
                              {deal.verdict}
                            </p>
                          )}'''

content = content.replace(target_matrix, replacement_matrix)

target_card = '''                    <h3 className="line-clamp-2 min-h-9 text-xs font-bold leading-snug text-slate-900 dark:text-[#F1F5F9]" title={deal.title}>
                      {deal.title}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-2">'''
replacement_card = '''                    <h3 className="line-clamp-2 min-h-9 text-xs font-bold leading-snug text-slate-900 dark:text-[#F1F5F9]" title={deal.title}>
                      {deal.title}
                    </h3>
                    {deal.history_badge && (
                      <p className="mt-1 text-[10px] font-medium text-slate-500 truncate" title={deal.verdict}>
                        {deal.history_badge}
                      </p>
                    )}
                    <div className="mt-2 flex items-baseline gap-2">'''

content = content.replace(target_card, replacement_card)

with open('src/components/ExternalSearchResults.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
