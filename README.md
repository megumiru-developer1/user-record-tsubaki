# めぐみる(A型)システム


## 📋 目次

- [セットアップ](#セットアップ)
- [ビルド・デプロイ](#ビルドデプロイ)
- [プロジェクト構造](#プロジェクト構造)
- [開発ガイド](#開発ガイド)

## 🚀 セットアップ

### 前提条件

- Node.js (v14以上)
- Google Apps Script プロジェクト
- Google スプレッドシート

### 1. 依存関係のインストール

```bash
npm install
```

## 🔨 ビルド・デプロイ

### ビルド

```bash

npm run build

ビルドの内容
clientフォルダ内のmain.tsをmain.js.htmlにトランスパイル
server/api内のtsファイルをwebpackでバンドル

ビルドの内容はルートフォルダの、@webpack.client.config.js、webpack.client.config.jsを参照 


```

### デプロイ

1. ビルド後、`dist/` フォルダの内容を Google Apps Script にアップロード
2. `appsscript.json` を`dist/`の直下に配置
3. デプロイしてウェブアプリとして公開

## 📁 プロジェクト構造

```
src/
├── client/                    # フロントエンド
│   ├── common/               # 共通コンポーネント
│   │   ├── common.ts         # 共通ユーティリティ
│   │   ├── common.css.html   # 共通スタイル
│   │   ├── table-foundation.ts  # テーブル基盤
│   │   ├── table-foundation.css.html  # テーブル基盤スタイル
│   │   └── html/
│   │       └── loading.html  # ローディング画面
│   └── user-master/          # 利用者マスター管理
│       ├── index.html        # メインHTML
│       ├── main.ts           # メインロジック
│       └── styles.css.html   # スタイルシート
└── server/                   # バックエンド (GAS)
    ├── api/                  # API エンドポイント
    │   └── UserMasterAPI.ts   # 利用者マスターAPI
    └── data-access/          # データアクセス層
        ├── models/           # データモデル
        │   └── UserMaster.ts
        └── repositories/     # リポジトリ
            └── UserMasterRepository.ts
```

### 各フォルダの役割

#### `client/`
- **目的**: clientサイドに関連するファイル(css、html、js)を格納する
- **技術**: TypeScript, HTML, CSS
- **機能**: UI

#### `server/api/`
- **目的**: ビジネスロジックとAPI エンドポイント
- **機能**: データ取得、バリデーション、処理

#### `server/data-access/`
- **目的**: データベースアクセス層
- **models/**: データ構造の定義
- **repositories/**: データの CRUD 操作

#### `server/Config.ts`
- **目的**: アプリケーション設定の管理
- **機能**: スクリプトプロパティの読み込み

### 補足
データアクセスの処理は「ws-framework」パッケージのRepository、Modelを使用すること。
ws-frameworkについては下記を参照
https://github.com/megumiru-developer1/ws-framework

## 🛠️ 開発ガイド

### 新しい機能の追加

1. **API エンドポイント**: `server/api/` に追加
2. **データモデル**: `server/data-access/models/` に追加
3. **リポジトリ**: `server/data-access/repositories/` に追加
4. **フロントエンド**: `client/` に追加
