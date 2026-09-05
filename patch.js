const fs = require('fs');
const path = './src/lib/firebase.ts';
let code = fs.readFileSync(path, 'utf8');

// Remove import block
code = code.replace(/import\s*\{\s*samplePosts[^}]+\}\s*from\s*'..\/data';/g, "import { currentUserProfile } from '../data';");

// Remove seedInitialFirestoreData completely
code = code.replace(/let isSeedingInProgress[\s\S]*?console\.error\('Firestore seeding warning:', e\);\n  \} finally \{\n    isSeedingInProgress = false;\n  \}\n\}/g, '');

fs.writeFileSync(path, code);
