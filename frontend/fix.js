const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'dashboard', 'Workflows', 'ConfigPanel.tsx');
let content = fs.readFileSync(file, 'utf8');

// The issue is around line 258. I deleted:
// {(node.tool === 'delay' || node.config?.accountId) && (
//   <>

// Let's find:
/*
                    </div>
                  )}

                {node.tool === "Apollo" && (
*/

content = content.replace(
                      </div>\r\n                  )}\r\n\r\n                {node.tool === "Apollo" && (,
                      </div>\r\n                  )}\r\n\r\n            {(node.tool === 'delay' || node.config?.accountId) ? (\r\n              <React.Fragment>\r\n                {node.tool === "Apollo" && (
);

content = content.replace(
                      </div>\n                  )}\n\n                {node.tool === "Apollo" && (,
                      </div>\n                  )}\n\n            {(node.tool === 'delay' || node.config?.accountId) ? (\n              <React.Fragment>\n                {node.tool === "Apollo" && (
);

fs.writeFileSync(file, content);
console.log('Fixed fragment start.');
