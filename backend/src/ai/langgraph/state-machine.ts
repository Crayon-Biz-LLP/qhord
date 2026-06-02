import { Annotation, StateGraph } from "@langchain/langgraph";
import { ParserNode } from "./nodes/parser-node";
import { ArchitectNode } from "./nodes/architect-node";
import { ValidatorNode } from "./nodes/validator-node";
import { ExecutorNode } from "./nodes/executor-node";
import { CampaignIntent, CampaignManifest } from "../utils/manifest-builder";

// Define the complete state that flows through the graph
export interface CampaignCompilerState {
  userInput: string;
  activeTools: string[];
  operatorId: string;
  clientId: string;
  intent?: CampaignIntent;
  manifest?: CampaignManifest;
  validatedPlan?: CampaignManifest;
  validationErrors?: string[];
  warnings?: string[];
  campaignId?: string;
  executionStatus?: string;
  error?: string;
}

const CampaignState = Annotation.Root({
  userInput: Annotation<string>(),
  activeTools: Annotation<string[]>(),
  operatorId: Annotation<string>(),
  clientId: Annotation<string>(),
  intent: Annotation<CampaignIntent | undefined>(),
  manifest: Annotation<CampaignManifest | undefined>(),
  validatedPlan: Annotation<CampaignManifest | undefined>(),
  validationErrors: Annotation<string[] | undefined>(),
  warnings: Annotation<string[] | undefined>(),
  campaignId: Annotation<string | undefined>(),
  executionStatus: Annotation<string | undefined>(),
  error: Annotation<string | undefined>()
});

// Create the nodes
const parserNode = new ParserNode();
const architectNode = new ArchitectNode();
const validatorNode = new ValidatorNode();
const executorNode = new ExecutorNode();

// Create the state graph
const graph = new StateGraph(CampaignState)
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
export const campaignCompiler = graph.compile();

// Helper function to run the compiler with proper error handling
export async function runCampaignCompiler(
  userInput: string,
  activeTools: string[],
  operatorId: string,
  clientId: string
): Promise<CampaignCompilerState> {
  try {
    const initialState: CampaignCompilerState = {
      userInput,
      activeTools,
      operatorId,
      clientId
    };

    const result = await campaignCompiler.invoke(initialState);

    return result;
  } catch (error) {
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