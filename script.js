import dotenv from "dotenv";

import { OpenAI } from "openai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function fetchArticleContent() {
  try {
    const url =
      "https://cdn.oxido.pl/hr/Zadanie%20dla%20JJunior%20AI%20Developera%20-%20tresc%20artykulu.txt";
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    return text;
  } catch (error) {
    throw new Error(`Błąd podczas pobierania artykułu: ${error.message}`);
  }
}

async function main() {
  try {
    console.log("Rozpoczynam pobieranie artykułu...");
    const articleText = await fetchArticleContent();
  } catch (error) {
    console.error("Wystąpił błąd podczas wykonywania programu:", error.message);
    process.exit(1);
  }
}

main();
