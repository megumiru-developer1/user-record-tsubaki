class SimpleTsToHtmlPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('SimpleTsToHtmlPlugin', (compilation, callback) => {
      Object.keys(compilation.assets).forEach(filename => {
        if (filename.endsWith('.js')) {
          const asset = compilation.assets[filename];
          const source = asset.source();
          
          // <script>タグで囲む
          const htmlContent = `<script>\n${source}\n</script>`;
          
          // ファイル名を.js.htmlに変更
          const newFilename = filename.replace('.js', '.js.html');
          
          // 新しいアセットとして追加
          compilation.assets[newFilename] = {
            source: () => htmlContent,
            size: () => htmlContent.length
          };
          
          // 元の.jsファイルを削除
          delete compilation.assets[filename];
        }
      });
      
      callback();
    });
  }
}

module.exports = SimpleTsToHtmlPlugin;
