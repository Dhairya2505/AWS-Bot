import { ChatGroq } from "@langchain/groq";
import { ChatOpenAI } from "@langchain/openai";
import { config } from 'dotenv'
config()

const llm = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4o-mini",
});

// const llm = new ChatGroq({
//   model: "gemma2-9b-it",
//   apiKey: process.env.GROQ_API_KEY,
//   maxRetries: 2
// });

export async function get_error(input: string) {

    const response = await llm.invoke(`Convert this error message into short and understandable error for the user in string format. Error -> ${input}`);
    return `${response}`;

} 