import io
with open('src/components/Preview/MascotEngine.jsx', 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# Fix the duplicate block
start_idx = content.find(');  {/* Stem / Body */}')
if start_idx != -1:
    end_idx = content.find(');', start_idx + 2)
    if end_idx != -1:
        content = content[:start_idx + 2] + content[end_idx + 2:]
        print('Fixed duplicate block successfully!')

# Write it back cleanly as standard UTF-8
with open('src/components/Preview/MascotEngine.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Rewrite complete!')
