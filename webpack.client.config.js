// clientフォルダ内のmain.tsをmain.js.htmlにトランスパイル

const path = require('path');
const SimpleTsToHtmlPlugin = require('./webpack-plugins/simple-ts-to-html-plugin');
const fs = require('fs');

// clientディレクトリ内のエントリーポイントを自動検出
function getClientEntries() {
  const clientDir = path.join(__dirname, 'src', 'client');
  const entries = {};
  
  if (!fs.existsSync(clientDir)) {
      return entries;
  }
  
  const dirs = fs.readdirSync(clientDir, { withFileTypes: true });
  
  dirs.forEach(dirent => {
      if (dirent.isDirectory()) {
          const dirPath = path.join(clientDir, dirent.name);
          const dirName = dirent.name;
          
          // commonディレクトリの場合はcommon.tsを検出
          if (dirName === 'common') {
              const commonTsPath = path.join(dirPath, 'common.ts');
              if (fs.existsSync(commonTsPath)) {
                  entries[`${dirName}/common`] = commonTsPath;
              }
          } else {
              // その他のディレクトリの場合はmain.tsを検出
              const mainTsPath = path.join(dirPath, 'main.ts');
              if (fs.existsSync(mainTsPath)) {
                  entries[`${dirName}/main`] = mainTsPath;
              }
          }
      }
  });
  
  return entries;
}

module.exports = {
  mode: 'production',
  entry: getClientEntries(),
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'src/client/')
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  plugins: [
    new SimpleTsToHtmlPlugin()
  ],
  resolve: {
    extensions: ['.ts', '.js']
  }
};