const createHomePage = ({ name }) => {
  return `
        <html>
        <head><title>${name}</title></head>
        <body>
            <h1>The ${name} API</h1>
        </body>
        </html>
    `;
};

module.exports = { createHomePage };
