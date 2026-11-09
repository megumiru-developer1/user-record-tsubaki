// server/api内のtsファイルをwebpackでバンドル

const path = require('path');
const fs = require('fs');
const GasPlugin = require('gas-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// apiディレクトリ内の.tsファイルを自動検出してエントリーポイントを生成
function getApiEntries() {
    const apiDir = path.join(__dirname, 'src', 'server', 'api');
    const entries = {};
    
    // main.tsは固定で追加
    entries.main = path.join(__dirname, 'src', 'server', 'main.ts');
    
    // apiディレクトリ内の.tsファイルを検出
    if (fs.existsSync(apiDir)) {
        const files = fs.readdirSync(apiDir);
        files.forEach(file => {
            if (file.endsWith('.ts')) {
                // ファイル名から拡張子を除く（例: UserMasterAPI.ts → UserMasterAPI）
                 const baseName = path.basename(file, '.ts');

                entries[baseName] = path.join(apiDir, file);
            }
        });
    }
    
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
        new GasPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                { 
                    from: 'src/client', 
                    to: 'client',
                    globOptions: {
                        ignore: ['**/*.ts']
                    }
                }
            ]
        })
    ]
};