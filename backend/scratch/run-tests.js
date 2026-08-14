const axios = require('axios');
const crypto = require('crypto');
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNhMGNjZDBkLTg0ZDctNDEwZC04ZDczLWI0Yzk3ZTlhZDAwYiIsImVtYWlsIjoiZTJldGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJvcGVyYXRvciIsImlhdCI6MTc4NjcwMTY3OSwiZXhwIjoxNzg2NzQ0ODc5fQ.EpC4muApZHSvMTUdMrn9GXwbdSyJnxNAL5Cd6aNXZhA';
const clientId = 'bfb472fe-9da6-4571-9738-d0ea56c031b2';
const auth = { headers: { Authorization: 'Bearer ' + token } };
const api = 'http://localhost:4000/api/workflows';

function uuid() { return crypto.randomUUID(); }

async function runTest(name, rawNodes, rawEdges) {
  try {
    console.log('\n--- Running:', name, '---');
    
    const idMap = {};
    const nodes = rawNodes.map(n => {
      const newId = uuid();
      idMap[n.id] = newId;
      return { ...n, id: newId, position: { x: 0, y: 0 } };
    });

    const edges = rawEdges.map(e => ({
      id: uuid(),
      source: idMap[e.source],
      target: idMap[e.target],
      conditionJson: e.conditionJson ? { ...e.conditionJson, field: e.conditionJson.field.replace(/1|2|3|4|if|true_node|false_node/g, match => idMap[match] || match) } : {}
    }));

    const { data: createData } = await axios.post(api, { name, clientId, nodes, edges }, auth);
    const wfId = createData.workflow.id;
    
    const { data: testData } = await axios.post(api + '/' + wfId + '/test', {}, auth);
    console.log('TRACE:\n' + (testData.trace ? testData.trace.join('\n') : 'No trace'));
    return testData;
  } catch (err) {
    if (err.response) {
      console.log('FAILED API RESPONSE:', err.response.data);
      return err.response.data;
    }
    console.log('ERROR:', err.message);
  }
}

async function main() {
  await runTest('Test 1', [
    { id: '1', nodeType: 'trigger', tool: 'manual', action: 'manual' },
    { id: '2', nodeType: 'action', tool: 'Apollo', action: 'search_people', configurationJson: { keywords: 'founder' } },
    { id: '3', nodeType: 'action', tool: 'Clay', action: 'email_enrichment', configurationJson: { company: 'apple.com' } },
    { id: '4', nodeType: 'action', tool: 'Smartlead', action: 'add_to_campaign', configurationJson: { campaign_id: '123' } }
  ], [
    { source: '1', target: '2' }, { source: '2', target: '3' }, { source: '3', target: '4' }
  ]);

  await runTest('Test 2', [
    { id: '1', nodeType: 'trigger', tool: 'manual', action: 'manual' },
    { id: '2', nodeType: 'action', tool: 'Apollo', action: 'search_people', configurationJson: { keywords: 'ceo' } },
    { id: '3', nodeType: 'action', tool: 'HeyReach', action: 'send_connection_request', configurationJson: { profile_url: '{{2.output.contacts.0.linkedin_url}}' } },
    { id: '4', nodeType: 'action', tool: 'Calendly', action: 'book_meeting', configurationJson: { invitee: 'test@example.com' } }
  ], [
    { source: '1', target: '2' }, { source: '2', target: '3' }, { source: '3', target: '4' }
  ]);

  await runTest('Test 3 TRUE', [
    { id: '1', nodeType: 'trigger', tool: 'manual', action: 'manual' },
    { id: '2', nodeType: 'action', tool: 'Apollo', action: 'search_people', configurationJson: { keywords: 'founder' } },
    { id: 'if', nodeType: 'action', tool: 'if_else', action: 'if_else', configurationJson: {} },
    { id: 'true_node', nodeType: 'action', tool: 'Clay', action: 'email_enrichment', configurationJson: {} },
    { id: 'false_node', nodeType: 'action', tool: 'HeyReach', action: 'send_connection_request', configurationJson: {} }
  ], [
    { source: '1', target: '2' }, { source: '2', target: 'if' },
    { source: 'if', target: 'true_node', conditionJson: { field: '{{2.output.contacts.0.first_name}}', operator: 'equals', value: 'Test' } },
    { source: 'if', target: 'false_node', conditionJson: { field: '{{2.output.contacts.0.first_name}}', operator: 'not_equals', value: 'Test' } }
  ]);

  await runTest('Test 3 FALSE', [
    { id: '1', nodeType: 'trigger', tool: 'manual', action: 'manual' },
    { id: '2', nodeType: 'action', tool: 'Apollo', action: 'search_people', configurationJson: { keywords: 'founder' } },
    { id: 'if', nodeType: 'action', tool: 'if_else', action: 'if_else', configurationJson: {} },
    { id: 'true_node', nodeType: 'action', tool: 'Clay', action: 'email_enrichment', configurationJson: {} },
    { id: 'false_node', nodeType: 'action', tool: 'HeyReach', action: 'send_connection_request', configurationJson: {} }
  ], [
    { source: '1', target: '2' }, { source: '2', target: 'if' },
    { source: 'if', target: 'true_node', conditionJson: { field: '{{2.output.contacts.0.first_name}}', operator: 'not_equals', value: 'Test' } },
    { source: 'if', target: 'false_node', conditionJson: { field: '{{2.output.contacts.0.first_name}}', operator: 'equals', value: 'Test' } }
  ]);

  await runTest('Test 4 CUSTOM', [
    { id: '1', nodeType: 'trigger', tool: 'manual', action: 'manual' },
    { id: '2', nodeType: 'action', tool: 'Apollo', action: 'search_people', configurationJson: { keywords: 'ceo' } },
    { id: '3', nodeType: 'action', tool: 'BetterContact', action: 'find_email', configurationJson: { first_name: 'test' } }
  ], [
    { source: '1', target: '2' }, { source: '2', target: '3' }
  ]);

  await runTest('Test 5 INVALID', [
    { id: '1', nodeType: 'trigger', tool: 'manual', action: 'manual' },
    { id: '2', nodeType: 'action', tool: 'FakeTool', action: 'search_people', configurationJson: {} }
  ], [
    { source: '1', target: '2' }
  ]);
}
main().catch(console.error);
