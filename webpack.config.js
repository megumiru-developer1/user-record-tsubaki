// server/api内のtsファイルをwebpackでバンドル
const path = require('path');
const GasPlugin = require('gas-webpack-plugin');

// apiディレクトリ内の.tsファイルを自動検出してエントリーポイントを生成
function getApiEntries() {
    const entries = {};
    
    // main.tsは固定で追加
    entries.main = path.join(__dirname, 'src', 'server', 'main.ts');
    
    return entries;
}

module.exports = {
    mode: 'none',
    entry: getApiEntries(),
    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'ts-loader'
                    }
                ],
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    plugins: [
        new GasPlugin()
    ]
};