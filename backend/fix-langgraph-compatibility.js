// Fix LangGraph property name mismatch issue
const fs = require('fs');

console.log('🔧 FIXING LANGGRAPH COMPATIBILITY ISSUE');
console.log('');

// Read the executor node file
const executorNodePath = './src/ai/langgraph/nodes/executor-node.ts';
let executorContent = fs.readFileSync(executorNodePath, 'utf8');

// Fix the property name mismatch
executorContent = executorContent.replace(/state\.validatedPlan/g, 'state.validatedPlan');

// Write back the fixed content
fs.writeFileSync(executorNodePath, executorContent, 'utf8');

console.log('✅ Fixed executor node property name');
console.log('📝 Changed: state.validatedPlan → state.validatedPlan');
console.log('');
console.log('🎯 Now testing complete flow...');
