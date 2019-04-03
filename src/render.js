const fs = require('fs');
const path = require('path')

function readFile(path) {
  return fs.readFileSync(path);
}

function htmlEncode(str) {
  let s = '';
  if (str.length == 0) return '';
  s = str.replace(/&/g, '&amp;');
  s = s.replace(/</g, '&lt;');
  s = s.replace(/>/g, '&gt;');
  s = s.replace(/ /g, '&nbsp;');
  s = s.replace(/\'/g, '&#39;');
  s = s.replace(/\"/g, '&quot;');
  return s;
}

function renderHTML (expression) {
  let lib = readFile(path.resolve(__dirname, './index.js'));
  return `
  <!DOCTYPE html>
  <meta charset="utf-8">
  <link href="https://cdn.bootcss.com/highlight.js/9.12.0/styles/github.min.css" rel="stylesheet">
  <style>
    #error {
      background: #b3151a;
      color: #fff;
      padding: 0.5em;
      white-space: pre;
      font-family: monospace;
      font-weight: bold;
      display: none;
      overflow-x: auto;
    }

    .progress {
      width: 50%;
      height: 0.75em;
      border: 1px solid #8ca440;
      overflow: hidden;
      margin: 1.5em auto;
    }

    .progress div {
      background: #bada55;
      background: linear-gradient(135deg, #bada55 25%, #cbe380 25%, #cbe380 50%, #bada55 50%, #bada55 75%, #cbe380 75%, #cbe380 100%);
      background-size: 3em 3em;
      background-repeat: repeat-x;
      height: 100%;
      animation: progress 1s infinite linear;
    }

    #regexp-render {
      background: #fff;
      width: 100%;
      overflow: auto;
      text-align: center;
    }

    svg {
      background-color: #fff;
    }

    .root text,
    .root tspan {
      font: 12px Arial;
    }

    .root path {
      fill-opacity: 0;
      stroke-width: 2px;
      stroke: #000;
    }

    .root circle {
      fill: #6b6659;
      stroke-width: 2px;
      stroke: #000;
    }

    .anchor text,
    .any-character text {
      fill: #fff;
    }

    .anchor rect,
    .any-character rect {
      fill: #6b6659;
    }

    .escape text,
    .charset-escape text,
    .literal text {
      fill: #000;
    }

    .escape rect,
    .charset-escape rect {
      fill: #bada55;
    }

    .literal rect {
      fill: #dae9e5;
    }

    .charset .charset-box {
      fill: #cbcbba;
    }

    .subexp .subexp-label tspan,
    .charset .charset-label tspan,
    .match-fragment .repeat-label tspan {
      font-size: 10px;
    }

    .repeat-label {
      cursor: help;
    }

    .subexp .subexp-box {
      stroke: #908c83;
      stroke-dasharray: 6, 2;
      stroke-width: 2px;
      fill-opacity: 0;
    }

    code {
      font-size: 18px;
    }
  </style>
  <pre><code class="js">${htmlEncode(expression)}</code></pre>
  <input id="expression" type="hidden" value="${encodeURI(expression)}" />
  <div id="regexp-render"></div>
  <div id="error"></div>
  <script type="text/html" id="svg-container-base">
    <div class="svg">
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:cc="http://creativecommons.org/ns#"
        xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" version="1.1">
        <defs>
          <style type="text/css">
            svg {
              background-color: #fff;
            }

            .root text,
            .root tspan {
              font: 12px Arial;
            }

            .root path {
              fill-opacity: 0;
              stroke-width: 2px;
              stroke: #000;
            }

            .root circle {
              fill: #6b6659;
              stroke-width: 2px;
              stroke: #000;
            }

            .anchor text,
            .any-character text {
              fill: #fff;
            }

            .anchor rect,
            .any-character rect {
              fill: #6b6659;
            }

            .escape text,
            .charset-escape text,
            .literal text {
              fill: #000;
            }

            .escape rect,
            .charset-escape rect {
              fill: #bada55;
            }

            .literal rect {
              fill: #dae9e5;
            }

            .charset .charset-box {
              fill: #cbcbba;
            }

            .subexp .subexp-label tspan,
            .charset .charset-label tspan,
            .match-fragment .repeat-label tspan {
              font-size: 10px;
            }

            .repeat-label {
              cursor: help;
            }

            .subexp .subexp-label tspan,
            .charset .charset-label tspan {
              dominant-baseline: text-after-edge;
            }

            .subexp .subexp-box {
              stroke: #908c83;
              stroke-dasharray: 6, 2;
              stroke-width: 2px;
              fill-opacity: 0;
            }

            .quote {
              fill: #908c83;
            }
          </style>
        </defs>
      </svg>
    </div>
    <div class="progress">
      <div style="width:0;"></div>
    </div>
  </script>
  <script>${lib}</script>
  <!-- 高亮代码 -->
  <script src="https://cdn.bootcss.com/highlight.js/9.12.0/highlight.min.js"></script>
  <script>
    hljs.initHighlightingOnLoad();
  </script>
  `;
}

module.exports = {
  renderHTML,
}