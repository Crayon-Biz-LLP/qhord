"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignCompiler = void 0;
exports.runCampaignCompiler = runCampaignCompiler;
const langgraph_1 = require("@langchain/langgraph");
const parser_node_1 = require("./nodes/parser-node");
const architect_node_1 = require("./nodes/architect-node");
const validator_node_1 = require("./nodes/validator-node");
const executor_node_1 = require("./nodes/executor-node");
const CampaignState = langgraph_1.Annotation.Root({
    userInput: (0, langgraph_1.Annotation)(),
    activeTools: (0, langgraph_1.Annotation)(),
    operatorId: (0, langgraph_1.Annotation)(),
    clientId: (0, langgraph_1.Annotation)(),
    intent: (0, langgraph_1.Annotation)(),
    manifest: (0, langgraph_1.Annotation)(),
    validatedPlan: (0, langgraph_1.Annotation)(),
    validationErrors: (0, langgraph_1.Annotation)(),
    warnings: (0, langgraph_1.Annotation)(),
    campaignId: (0, langgraph_1.Annotation)(),
    executionStatus: (0, langgraph_1.Annotation)(),
    error: (0, langgraph_1.Annotation)()
});
// Create the nodes
const parserNode = new parser_node_1.ParserNode();
const architectNode = new architect_node_1.ArchitectNode();
const validatorNode = new validator_node_1.ValidatorNode();
const executorNode = new executor_node_1.ExecutorNode();
// Create the state graph
const graph = new langgraph_1.StateGraph(CampaignState)
    .addNode("parser", async (state) => {
    const result = await parserNode.invoke(state);
    return { ...state, ...result };
})
    .addNode("architect", async (state) => {
    const result = await architectNode.invoke(state);
    return { ...state, ...result };
})
    .addNode("validator", async (state) => {
    const result = await validatorNode.invoke(state);
    return { ...state, ...result };
})
    .addNode("executor", async (state) => {
    const result = await executorNode.invoke(state);
    return { ...state, ...result };
})
    .addEdge("parser", "architect")
    .addEdge("architect", "validator")
    .addEdge("validator", "executor")
    .setEntryPoint("parser")
    .setFinishPoint("executor");
// Compile the graph
exports.campaignCompiler = graph.compile();
// Helper function to run the compiler with proper error handling
async function runCampaignCompiler(userInput, activeTools, operatorId, clientId) {
    try {
        const initialState = {
            userInput,
            activeTools,
            operatorId,
            clientId
        };
        const result = await exports.campaignCompiler.invoke(initialState);
        return result;
    }
    catch (error) {
        console.error('Campaign compiler error:', error);
        return {
            userInput,
            activeTools,
            operatorId,
            clientId,
            error: `Compiler failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}
