import { ChatOpenAI } from "@langchain/openai";
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { create_S3_bucket } from './../tools/create-S3-bucket.js'
import {
  ToolMessage
} from "@langchain/core/messages";
import { config } from "dotenv";
import { delete_S3_bucket } from "../tools/delete-S3-bucket.js";
import { ChatGroq } from "@langchain/groq";
import { upload_object_to_bucket } from "../tools/upload-object-to-bucket.js";
config()

async function llmCall(state: { messages: any; }) {
  const result = await llmWithTools.invoke([
    {
      role: "system",
      content: "You are a Expert AWS assistant tasked with performing operations related to AWS services and answering similar type of questions. If anything asked not related to AWS or cloud services, do not answer the question."
    },
    ...state.messages
  ]);

  return {
    messages: [result]
  };
}

async function toolNode(state: { messages: any; }) {
  const results = [];
  const lastMessage = state.messages.at(-1);

  if (lastMessage?.tool_calls?.length) {
    for (const toolCall of lastMessage.tool_calls) {
      const tool = toolsByName[toolCall.name];
      const observation = await tool.invoke(toolCall.args);
      results.push(
        new ToolMessage({
          content: observation,
          tool_call_id: toolCall.id,
        })
      );
    }
  }

  return { messages: results };
}

function shouldContinue(state: { messages: any; }) {
  const messages = state.messages;
  const lastMessage = messages.at(-1);

  if (lastMessage?.tool_calls?.length) {
    return "Action";
  }
  return "__end__";
}

const llm = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4o-mini",
});

// const llm = new ChatGroq({
//   model: "gemma2-9b-it",
//   apiKey: process.env.GROQ_API_KEY,
//   maxRetries: 2
// });


const tools = [create_S3_bucket, delete_S3_bucket, upload_object_to_bucket];
const toolsByName = Object.fromEntries(tools.map((tool) => [tool.name, tool]));
const llmWithTools = llm.bindTools(tools);

const agentBuilder = new StateGraph(MessagesAnnotation)
  .addNode("llmCall", llmCall)
  .addNode("tools", toolNode)
  .addEdge("__start__", "llmCall")
  .addConditionalEdges(
    "llmCall",
    shouldContinue,
    {
      "Action": "tools",
      "__end__": "__end__",
    }
  )
  .addEdge("tools", "llmCall")
  .compile();

const messages: {
  role: "user" | "assistant",
  content: string
}[] = [];


export async function generate_response (input: string) {
  
  // const messages = [{
  //   role: "user",
  //   content: input
  // }]

  messages.push({
    role: "user",
    content: input
  })

  const result = await agentBuilder.invoke({ messages });

  messages.push({
    role: "assistant",
    content: `${result.messages[result.messages.length - 1].content}`
  })

  return `${result.messages[result.messages.length - 1].content}`

}