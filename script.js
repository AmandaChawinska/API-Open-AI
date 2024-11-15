import dotenv from "dotenv";
import fetch from "node-fetch";
import fs from "fs";
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

async function processArticleWithAI(articleText) {
  const prompt = `
  Przekształć poniższy artykuł w kod HTML spełniający następujące wymagania:
  1. Użyj odpowiednich tagów HTML do strukturyzacji treści (nagłówki, paragrafy, listy itp.)
  2. W odpowiednich miejscach wstaw tagi <img> z src="image_placeholder.jpg"
  3. Każdy tag <img> musi mieć atrybut alt zawierający dokładny prompt do wygenerowania grafiki
  4. Pod każdą grafiką umieść podpis używając tagu <figcaption> wewnątrz <figure>
  5. BARDZO WAŻNE: Nie dodawaj tagów <!DOCTYPE>, <html>, <head>, <body> ani żadnego kodu CSS/JavaScript. Nie opakowuj treści w żaden dodatkowy <div> tylko <article>
  6. Zwróć TYLKO zawartość, która powinna znaleźć się wewnątrz znacznika <body>
  7. Nie używaj znaczników formatowania markdown (np. \`\`\`html)
  
  Oto artykuł do przetworzenia:
  
  ${articleText}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Jesteś ekspertem w tworzeniu semantycznego kodu HTML5. Tworzysz czytelną i dostępną strukturę dokumentów.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 3000,
      temperature: 0.7,
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error("Brak odpowiedzi z API OpenAI");
    }

    let htmlContent = response.choices[0].message.content.trim();

    htmlContent = htmlContent.replace(/```html\n?/g, "");
    htmlContent = htmlContent.replace(/```\n?/g, "");

    return htmlContent;
  } catch (error) {
    throw new Error(
      `Błąd podczas przetwarzania przez OpenAI: ${error.message}`
    );
  }
}

function saveHtmlToFile(htmlContent) {
  try {
    fs.writeFileSync("artykul.html", htmlContent, "utf8");
    console.log("Pomyślnie zapisano plik artykul.html");
  } catch (error) {
    throw new Error(`Błąd podczas zapisywania pliku: ${error.message}`);
  }
}

async function main() {
  try {
    console.log("Rozpoczynam pobieranie artykułu...");
    const articleText = await fetchArticleContent();

    console.log("Przetwarzam artykuł przez OpenAI...");
    const generatedHtml = await processArticleWithAI(articleText);

    console.log("Zapisuję wygenerowany HTML...");
    saveHtmlToFile(generatedHtml);

    console.log("Zadanie wykonane pomyślnie!");
  } catch (error) {
    console.error("Wystąpił błąd podczas wykonywania programu:", error.message);
    process.exit(1);
  }
}

main();
