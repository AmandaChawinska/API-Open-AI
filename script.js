import dotenv from "dotenv";
// import fetch from "node-fetch";
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

function generateTemplate() {
  const template = `<!DOCTYPE html>
  <html lang="pl">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Szablon</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      <style>
          .article-container {
              max-width: 800px;
          }
          h1 { font-size: 2.5rem; margin-bottom: 1.5rem; }
          h2 { font-size: 2rem; margin: 2rem 0 1rem; }
          h3 { font-size: 1.75rem; margin: 1.5rem 0 1rem; }
          p { margin-bottom: 1rem; line-height: 1.6; }
          img { max-width: 100%; height: auto; margin: 1.5rem 0; }
          figure { margin: 2rem 0; }
          figcaption { text-align: center; font-style: italic; margin-top: 0.5rem; }
          ul, ol { margin: 1rem 0; padding-left: 2rem; }
          li { margin-bottom: 0.5rem; }
      </style>
  </head>
  <body class="bg-gray-50">
      <main class="article-container bg-white shadow-lg rounded-lg my-5 mx-auto p-8 max-w-[800px]">
          <!-- Tutaj wklej zawartość artykułu -->
      </main>
  </body>
  </html>`;

  return template;
}

function generatePreview(articleContent) {
  const template = generateTemplate();
  return template.replace(
    "<!-- Tutaj wklej zawartość artykułu -->",
    articleContent
  );
}

async function main() {
  try {
    console.log("Rozpoczynam pobieranie artykułu...");
    const articleText = await fetchArticleContent();

    console.log("Przetwarzam artykuł przez OpenAI...");
    const generatedHtml = await processArticleWithAI(articleText);

    console.log("Zapisuję wygenerowany HTML...");
    saveHtmlToFile(generatedHtml);

    console.log("Generuję szablon...");
    const template = generateTemplate();
    fs.writeFileSync("szablon.html", template, "utf8");
    console.log("Pomyślnie zapisano plik szablon.html");

    console.log("Generuję podgląd...");
    const preview = generatePreview(generatedHtml);
    fs.writeFileSync("podglad.html", preview, "utf8");
    console.log("Pomyślnie zapisano plik podglad.html");

    console.log("Zadanie wykonane pomyślnie!");
  } catch (error) {
    console.error("Wystąpił błąd podczas wykonywania programu:", error.message);
    process.exit(1);
  }
}

main();
