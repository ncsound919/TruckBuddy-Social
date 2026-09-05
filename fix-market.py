import re

with open('src/features/market/MarketplaceSection.tsx', 'r') as f:
    code = f.read()

code = re.sub(r'const \{ data, error \} = throw new Error\("Migrate to Firebase!"\); \/\/ \(\'listings\'\)\.select\(\'\*\'\);', 'throw new Error("Migrate to Firebase!");', code)
code = re.sub(r'await throw new Error\("Migrate to Firebase!"\); \/\/ \(\'listings\'\)\.insert\(newListing\);', 'throw new Error("Migrate to Firebase!");', code)

with open('src/features/market/MarketplaceSection.tsx', 'w') as f:
    f.write(code)
