# Aplication with API OpenAI

The application retrieves a text article from an external URL and then processes it using OpenAI (model GPT-3.5) to convert it into HTML code. The generated HTML code is saved to the file artykul.html, and the application then creates a basic HTML template that contains the appropriate headings, CSS styles (using Tailwind CSS) and space to insert the article content. This template is saved to the szablon.html file. The next step is to generate a preview of the article, which inserts the generated HTML into the template, and the resulting file is saved as podglad.html. Finally, the application displays success or error messages during these operations. The purpose of the application is to automatically retrieve articles, convert them into semantic HTML and generate templates and previews of the finished documents.

Technologies used:

- JavaScript
- NodeJS
- TailwindCSS
- CSS

How to use the project:

- Clone the repository or download the Zip
- Install dependencies: npm install
- Launch "node.script.js"
