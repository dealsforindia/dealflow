import sys

path = r'rudranil-deals-web/src/components/DealDetailModal.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
i = 0
replaced = False

while i < len(lines):
    line = lines[i]
    if "const firstWord = item.label.split(' ')[0];" in line:
        # replace the block
        new_lines.append("                    const isStepOrPromo = /^(step|add|buy|get|free|coupon|click|claim|apply|order)/i.test(item.label.trim());\n")
        new_lines.append("                    const buttonLabel = isStepOrPromo\n")
        new_lines.append("                      ? (item.price ? `Shop · ₹${item.price.toLocaleString('en-IN')}` : 'View Offer ↗')\n")
        new_lines.append("                      : (item.price ? `Buy · ₹${item.price.toLocaleString('en-IN')}` : 'Shop Now ↗');\n")
        i += 2 # skip next line: const buttonLabel = ...
        replaced = True
        continue
    elif '<div style={{ fontWeight: 650, fontSize: \'13.5px\', color: \'var(--text-primary)\' }}>' in line and replaced:
        new_lines.append("                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>\n")
        new_lines.append("                            {isStepOrPromo && (\n")
        new_lines.append("                              <span style={{ fontSize: '10px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>\n")
        new_lines.append("                                STEP {idx + 1}\n")
        new_lines.append("                              </span>\n")
        new_lines.append("                            )}\n")
        new_lines.append(line)
        i += 1
        continue
    elif 'Flat {item.discount}% OFF' in line and replaced:
        new_lines.append(line.replace('Flat', 'Listed'))
        i += 1
        continue
    elif '<span>🛍️ {buttonLabel} ↗</span>' in line and replaced:
        new_lines.append(line.replace('<span>🛍️ {buttonLabel} ↗</span>', '<span>🛍️ {buttonLabel}</span>'))
        i += 1
        continue
    elif '</div>' in line and i > 0 and 'item.label' in lines[i-1] and replaced:
        new_lines.append(line)
        new_lines.append("                          </div>\n")
        i += 1
        continue
    new_lines.append(line)
    i += 1

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("PATCH APPLIED SUCCESSFULLY" if replaced else "NOT FOUND")

