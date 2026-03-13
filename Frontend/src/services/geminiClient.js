import { GoogleGenerativeAI } from "@google/generative-ai";

// For development purposes, we use the key from .env if available, 
// but in a real web app, this should be handled via a secure proxy or narrow-scoped token.
const API_KEY = "AIzaSyCDo8RDMnYWJHKVpaHjHaus0G5lAsnwU-U"; 

const genAI = new GoogleGenerativeAI(API_KEY);
export const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

export default genAI;
