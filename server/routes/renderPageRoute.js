import { Helmet } from 'react-helmet';
import getLog from '../utils/logger';

const log = getLog();

function renderHTML(helmet) {
    return `
    <!doctype html>
    <html ${helmet.htmlAttributes.toString()}>
      <head>
        <meta charset="utf-8" />
        ${helmet.title.toString()}
        ${helmet.meta.toString()}
        ${helmet.link.toString()}
        <link rel="stylesheet" href="/bundles/index.css">
      </head>
      <body ${helmet.bodyAttributes.toString()} >
        <div id="app"></div>
        <script src="/bundles/index.js"></script>
      </body>
    </html>
  `;
}

export default async function renderPageRoute(req, res) {
    try {
        const helmet = Helmet.renderStatic();
        res.setHeader('Content-Type', 'text/html');
        res.send(renderHTML(helmet));
    } catch (error) {
        log.error(error.stack);
        res.status(500).sendFile('src/server/views/500.html', { root: process.cwd() });
    }
}
