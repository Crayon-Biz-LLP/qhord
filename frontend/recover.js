const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logFile = 'C:\\Users\\Vasantha Kumar R\\.gemini\\antigravity-ide\\brain\\fbceb541-9b71-4253-8f60-d5aaea0f57ce\\.system_generated\\logs\\transcript_full.jsonl';

async function processLineByLine() {
  const fileStream = fs.createReadStream(logFile);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let bestContent = null;
  let maxLines = 0;

  for await (const line of rl) {
    if (line.includes('ConfigPanel.tsx') && line.includes('replace_file_content')) {
      try {
        const entry = JSON.parse(line);
        if (entry.tool_calls) {
          for (const tc of entry.tool_calls) {
            if (tc.name === 'default_api:write_to_file' && tc.arguments.TargetFile.includes('ConfigPanel.tsx')) {
               const lines = tc.arguments.CodeContent.split('\n').length;
               if (lines > maxLines) {
                 maxLines = lines;
                 bestContent = tc.arguments.CodeContent;
               }
            }
          }
        }
      } catch (e) {}
    }
  }

  if (bestContent) {
    fs.writeFileSync('restored_ConfigPanel.tsx', bestContent);
    console.log('Restored from write_to_file: ' + maxLines + ' lines');
  } else {
    console.log('Could not find write_to_file. Trying to find view_file output...');
    // We can just find the largest view_file output for ConfigPanel.tsx
    let bestView = null;
    let viewLines = 0;
    
    // Have to reopen stream
    const fileStream2 = fs.createReadStream(logFile);
    const rl2 = readline.createInterface({ input: fileStream2, crlfDelay: Infinity });
    for await (const line of rl2) {
      if (line.includes('ConfigPanel.tsx') && line.includes('The following code has been modified')) {
        try {
          const entry = JSON.parse(line);
          const text = entry.content;
          if (text && text.includes('File Path: ile:///c:/Users/Vasantha%20Kumar%20R/Vasanth/Crayon/Qhord/qhord/frontend/src/components/dashboard/Workflows/ConfigPanel.tsx')) {
            const matches = text.match(/Showing lines 1 to (\d+)/);
            if (matches && parseInt(matches[1]) > viewLines) {
               viewLines = parseInt(matches[1]);
               // Clean up the line numbers
               const contentMatches = text.match(/<line_number>: <original_line>\.(.*?)(The above content|$)/s);
               if (contentMatches) {
                 bestView = contentMatches[1].replace(/^\d+:\s/gm, '');
               }
            }
          }
        } catch (e) {}
      }
    }
    if (bestView) {
      fs.writeFileSync('restored_ConfigPanel.tsx', bestView);
      console.log('Restored from view_file: ' + viewLines + ' lines');
    } else {
      console.log('No backup found.');
    }
  }
}
processLineByLine();
