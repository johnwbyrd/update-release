'use strict';

const path = require('path');

module.exports = {
  "mode": "development",
  "entry": "./src/main.ts",
  "output": {
    "path": __dirname + '/dist',
    "filename": "[name].js"
  },
  "devtool": "source-map",
  "target": "node",
  "resolve": 
  {
    "alias": {
      "universal-user-agent$": "universal-user-agent/dist-node/index.js"
    },
  },
  "module": {
    "rules": [
      {
        "enforce": "pre",
        "test": /\.(js|jsx)$/,
        "exclude": /node_modules/,
        "use": "eslint-loader"
      },
      {
        "test": /\.tsx?$/,
        "exclude": /node_modules/,
        "use": {
          "loader": "ts-loader",
          "options": {
            "transpileOnly": true
          }
        }
      }
    ]
  }
};