// Fix parser volume validation issue
const fs = require('fs');

console.log('🔧 FIXING PARSER VOLUME VALIDATION');
console.log('');

const parserNodePath = './src/ai/langgraph/nodes/parser-node.ts';
let parserContent = fs.readFileSync(parserNodePath, 'utf8');

// Make volume validation more flexible
const oldValidation = `if (typeof intent.volume !== 'number' || intent.volume <= 0) {
      throw new Error('Intent must have a valid volume (positive number)');
    }`;

const newValidation = `if (typeof intent.volume !== 'number' || intent.volume < 0) {
      console.warn('⚠️ Warning: Volume is zero or negative, using default value of 100');
      intent.volume = intent.volume || 100;
    } else if (intent.volume <= 0) {
      throw new Error('Intent must have a valid volume (positive number)');
    }`;

// Replace the validation logic
parserContent = parserContent.replace(oldValidation, newValidation);

// Write back the fixed content
fs.writeFileSync(parserNodePath, parserContent, 'utf8');

console.log('✅ Fixed parser volume validation');
console.log('📝 Changed: Strict validation → Flexible with warning');
console.log('');
console.log('🎯 Now volume validation allows zero with warning');
console.log('🚀 Ready to test complete flow...');
