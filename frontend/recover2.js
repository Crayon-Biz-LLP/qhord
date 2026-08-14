const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logFile = 'C:\\Users\\Vasantha Kumar R\\.gemini\\antigravity-ide\\brain\\fbceb541-9b71-4253-8f60-d5aaea0f57ce\\.system_generated\\logs\\transcript_full.jsonl';

async function extract() {
  const fileStream = fs.createReadStream(logFile);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let bestContent = null;
  let maxLen = 0;

  for await (const line of rl) {
    if (line.includes('ConfigPanel.tsx') && line.includes('file:///c:/Users/Vasantha%20Kumar%20R/Vasanth/Crayon/Qhord/qhord/frontend/src/components/dashboard/Workflows/ConfigPanel.tsx')) {
      try {
        const entry = JSON.parse(line);
        if (entry.content) {
          const content = entry.content;
          // Look for view_file outputs
          const match = content.match(/Showing lines 1 to (\d+)/);
          if (match && parseInt(match[1]) > 700) {
            const codeMatch = content.match(/<line_number>: <original_line>\.(.*?)(The above content|$)/s);
            if (codeMatch) {
              const code = codeMatch[1].replace(/^\d+:\s/gm, '');
              if (code.length > maxLen) {
                maxLen = code.length;
                bestContent = code;
              }
            }
          }
        }
      } catch (e) {}
    }
    
    // Check write_to_file
    if (line.includes('ConfigPanel.tsx') && line.includes('CodeContent')) {
      try {
        const entry = JSON.parse(line);
        if (entry.tool_calls) {
          for (const tc of entry.tool_calls) {
            if ((tc.name === 'default_api:write_to_file' || tc.name === 'default_api:replace_file_content') && tc.arguments.TargetFile && tc.arguments.TargetFile.includes('ConfigPanel.tsx')) {
               if (tc.arguments.CodeContent && tc.arguments.CodeContent.length > maxLen) {
                 maxLen = tc.arguments.CodeContent.length;
                 bestContent = tc.arguments.CodeContent;
               }
            }
          }
        }
      } catch (e) {}
    }
  }

  if (bestContent) {
    fs.writeFileSync('C:\\Users\\Vasantha Kumar R\\Vasanth\\Crayon\\Qhord\\qhord\\frontend\\restored_ConfigPanel.tsx', bestContent);
    console.log('Successfully recovered ConfigPanel! Length: ' + bestContent.length);
  } else {
    console.log('Could not find full ConfigPanel.tsx in the logs.');
  }
}
extract().catch(console.error);
