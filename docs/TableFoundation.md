# TableFoundation クラス仕様書

## 概要

`TableFoundation`は、汎用的なテーブル表示とCRUD操作を提供するTypeScriptクラスです。Google Apps Scriptのモーダルダイアログ内で使用され、データの一覧表示、新規作成、編集、削除、フィルタリング、ページネーション、ソート機能を提供します。

**ファイルパス**: `src/client/common/TableFoundation.ts`

## クラス定義

```typescript
export class TableFoundation<T extends Record<string, any>>
```

### ジェネリック型パラメータ

- `T`: テーブルに表示するデータの型。`Record<string, any>`を継承する必要があります。

## コンストラクタ

```typescript
constructor(tableId: string, config: TableConfig<T>)
```

### パラメータ

- `tableId` (string): テーブル要素のID。HTML内に存在する`<table>`要素のIDを指定します。
- `config` (TableConfig<T>): テーブルの設定オブジェクト。詳細は後述の「設定インターフェース」を参照してください。

### エラー

- `Table element with id '{tableId}' not found`: 指定されたIDの要素が見つからない場合
- `Element with id '{tableId}' is not a table element`: 指定された要素が`<table>`要素でない場合

## パブリックメソッド

### refresh()

データを再読み込みします。

```typescript
public refresh(): void
```

**説明**: `loadData()`を呼び出して、サーバーから最新のデータを取得し、テーブルを更新します。

**使用例**:
```typescript
tableFoundation.refresh();
```

---

### clearFilters()

すべてのフィルターをクリアします。

```typescript
public clearFilters(): void
```

**説明**: 適用されているすべてのカラムフィルターをクリアし、テーブルを再描画します。

**使用例**:
```typescript
tableFoundation.clearFilters();
```

---

### setLoadParams(params)

データ読み込み時のパラメータを設定します。

```typescript
public setLoadParams(params: any): void
```

**パラメータ**:
- `params` (any): APIの`list`エンドポイントに送信するパラメータ

**説明**: パラメータを設定するだけで、データの再読み込みは行いません。データを再読み込みする場合は`reloadWithParams()`を使用してください。

**使用例**:
```typescript
tableFoundation.setLoadParams([2024, 1]); // 年と月をパラメータとして設定
```

---

### getLoadParams()

現在設定されているデータ読み込み時のパラメータを取得します。

```typescript
public getLoadParams(): any
```

**戻り値**: 現在設定されているパラメータ

**使用例**:
```typescript
const currentParams = tableFoundation.getLoadParams();
```

---

### reloadWithParams(params)

パラメータを設定してデータを再読み込みします。

```typescript
public reloadWithParams(params: any): void
```

**パラメータ**:
- `params` (any): APIの`list`エンドポイントに送信するパラメータ

**説明**: `setLoadParams()`と`refresh()`を組み合わせたメソッドです。

**使用例**:
```typescript
tableFoundation.reloadWithParams([2024, 1]); // 年と月をパラメータとして設定して再読み込み
```

---

### setOptions(key, options)

フォームフィールドのオプションを動的に設定します。

```typescript
public setOptions(key: string, options: {key: string, value: string}[]): void
```

**パラメータ**:
- `key` (string): フォームフィールドのキー
- `options` (Array<{key: string, value: string}>): 選択肢の配列

**説明**: `custom-dropdown`または`select`タイプのフォームフィールドの選択肢を動的に更新します。

**使用例**:
```typescript
tableFoundation.setOptions('userNumber', [
  { key: '001', value: '001: 田中太郎' },
  { key: '002', value: '002: 佐藤花子' }
]);
```

---

### enableAddButton()

新規作成ボタンを有効化します。

```typescript
public enableAddButton(): void
```

**説明**: 無効化されている新規作成ボタンを有効化します。

---

### disableAddButton()

新規作成ボタンを無効化します。

```typescript
public disableAddButton(): void
```

**説明**: 新規作成ボタンを無効化します。

## 設定インターフェース

### TableConfig<T>

テーブルの全体設定を定義するインターフェースです。

| プロパティ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| `columns` | `TableColumnConfig[]` | 必須 | - | カラム設定の配列 |
| `formFields` | `FormFieldConfig[]` | 必須 | - | フォームフィールド設定の配列 |
| `apiEndpoints` | `{ list: string, create: string, update: string, delete: string }` | 必須 | - | APIエンドポイントの設定 |
| `apiEndpoints.list` | `string` | 必須 | - | 一覧取得APIの関数名 |
| `apiEndpoints.create` | `string` | 必須 | - | 新規作成APIの関数名 |
| `apiEndpoints.update` | `string` | 必須 | - | 更新APIの関数名 |
| `apiEndpoints.delete` | `string` | 必須 | - | 削除APIの関数名 |
| `primaryKey` | `(keyof T)[]` | 必須 | - | プライマリキー（配列形式、複合主キーも可） |
| `title` | `string` | 必須 | - | テーブルタイトル（モーダルフォームのタイトルにも使用） |
| `enableSearch` | `boolean` | オプション | - | 検索機能を有効にするか（廃止予定） |
| `enablePagination` | `boolean` | オプション | `false` | ページネーション機能を有効にするか |
| `pageSize` | `number` | オプション | `10` | ページサイズ（`enablePagination: true`の場合） |
| `modalSize` | `ModalSize` | オプション | `'medium'` | モーダルダイアログのサイズ（`'small'` \| `'medium'` \| `'large'`） |
| `enableColumnFilters` | `boolean` | オプション | `false` | カラムフィルタ機能を有効にするか |
| `loadDataParams` | `any` | オプション | - | `loadData`メソッドに送るデフォルトパラメータ（配列形式で指定） |
| `enableCreate` | `boolean` | オプション | `true` | 新規作成機能を有効にするか |
| `enableUpdate` | `boolean` | オプション | `true` | 編集機能を有効にするか |
| `enableDelete` | `boolean` | オプション | `true` | 削除機能を有効にするか |

### TableColumnConfig

カラムの表示設定を定義するインターフェースです。

| プロパティ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| `key` | `string` | 必須 | - | データのプロパティキー |
| `header` | `string` | 必須 | - | テーブルヘッダーに表示するテキスト |
| `width` | `string` | オプション | - | カラム幅（CSS形式、例: `'100px'`, `'20%'`） |
| `sortable` | `boolean` | オプション | `false` | ソート可能かどうか（`true`の場合、ヘッダークリックでソート） |
| `searchable` | `boolean` | オプション | - | 検索対象かどうか（現在未使用） |
| `visible` | `boolean` | オプション | `true` | 表示/非表示 |
| `formatter` | `(value: any) => string` | オプション | - | 値のフォーマット関数（単一の値を受け取り、フォーマットされた文字列を返す）<br>**注意**: `computed`と排他的。両方指定した場合、`computed`が優先される |
| `computed` | `{ format: (row: any) => string }` | オプション | - | 複数プロパティを組み合わせて表示する設定<br>`format`関数は行全体を受け取り、表示用の文字列を返す<br>**注意**: `formatter`と排他的。両方指定した場合、`computed`が優先される |
| `filterable` | `boolean` | オプション | `false` | フィルタ可能かどうか（`enableColumnFilters: true`の場合に有効） |
| `filterType` | `FilterType` | オプション | 推測される | フィルタの種類（`'text'` \| `'number'` \| `'date'` \| `'checkbox'` \| `'custom-dropdown'`）<br>未指定の場合は`formFields`の`type`から推測される |
| `filterOptions` | `Array<{key: string, value: string}>` | オプション | - | フィルタの選択肢（`checkbox`や`custom-dropdown`フィルタで使用） |

### FormFieldConfig

フォームフィールドの設定を定義するインターフェースです。

| プロパティ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| `key` | `string` | 必須 | - | データのプロパティキー |
| `label` | `string` | 必須 | - | フォームラベル |
| `type` | `InputType` | 必須 | - | 入力フィールドのタイプ（詳細は後述の`InputType`を参照） |
| `required` | `boolean` | オプション | `false` | 必須項目かどうか（`true`の場合、ラベルに`*`が表示される） |
| `placeholder` | `string` | オプション | - | プレースホルダーテキスト |
| `options` | `Array<{key: string, value: string}>` | オプション | - | 選択肢の配列（`select`、`radio`、`checkbox`、`custom-dropdown`で使用） |
| `datalistOptions` | `Array<{key: string, value: string}>` | オプション | - | datalistの選択肢（`datalist`タイプで使用） |
| `validation` | `(value: any) => string \| null` | オプション | - | バリデーション関数（エラーメッセージを返す場合は文字列、正常な場合は`null`） |
| `defaultValue` | `any` | オプション | - | デフォルト値（新規作成時に使用） |
| `readonly` | `boolean` | オプション | `false` | 読み取り専用かどうか |
| `visible` | `boolean` | オプション | `true` | 表示/非表示 |

### InputType

入力フィールドのタイプを定義する型エイリアスです。

```typescript
type InputType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'datetime-local' 
  | 'time' 
  | 'email' 
  | 'tel' 
  | 'textarea' 
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'hidden' 
  | 'datalist' 
  | 'custom-dropdown';
```

### FilterType

フィルタの種類を定義する型エイリアスです。

```typescript
type FilterType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'checkbox' 
  | 'custom-dropdown';
```

### ModalSize

モーダルダイアログのサイズを定義する型エイリアスです。

```typescript
type ModalSize = 'small' | 'medium' | 'large';
```

### ColumnFilter

フィルタ条件を定義するインターフェースです。内部で使用されるインターフェースで、通常は直接操作する必要はありません。

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `type` | `FilterType` | 必須 | フィルタの種類 |
| `value` | `any` | オプション | テキストフィルタ用の検索値 |
| `dateFrom` | `string` | オプション | 日付フィルタ用の開始日（`yyyy-MM-dd`形式） |
| `dateTo` | `string` | オプション | 日付フィルタ用の終了日（`yyyy-MM-dd`形式） |
| `numberMin` | `number` | オプション | 数値フィルタ用の最小値 |
| `numberMax` | `number` | オプション | 数値フィルタ用の最大値 |
| `selectedValues` | `string[]` | オプション | チェックボックスフィルタ用の選択された値の配列 |
| `selectedKey` | `string` | オプション | カスタムドロップダウンフィルタ用の選択されたキー |

## 主要機能

### 1. データの一覧表示

テーブル形式でデータを表示します。カラム設定に基づいて自動的にヘッダーとデータ行を生成します。

### 2. CRUD操作

- **新規作成**: ツールバーの「新規作成」ボタンからモーダルフォームを表示
- **編集**: 各行の「編集」ボタンからモーダルフォームを表示
- **削除**: 各行の「削除」ボタンから削除確認ダイアログを表示

### 3. カラムフィルタリング

各カラムヘッダーにフィルターボタン（▼）を表示し、クリックするとフィルターポップアップが表示されます。フィルタタイプに応じて以下のUIが提供されます：

- **text**: テキスト検索入力
- **number**: 最小値・最大値の範囲指定
- **date**: 開始日・終了日の範囲指定
- **checkbox**: 複数選択チェックボックス
- **custom-dropdown**: 検索機能付きドロップダウン

### 4. ページネーション

`enablePagination: true`を設定すると、ページネーション機能が有効になります。デフォルトのページサイズは10件です。

### 5. ソート

`sortable: true`を設定したカラムのヘッダーをクリックすると、そのカラムでソートされます。

### 6. 値のフォーマット

カラム設定で`formatter`または`computed`を指定することで、表示値をカスタマイズできます。

- `formatter`: 単一の値を受け取り、フォーマットされた文字列を返す関数
- `computed`: 行全体を受け取り、複数のプロパティを組み合わせて表示値を生成する関数

## 使用例

### 基本的な使用例

```typescript
import { TableFoundation, TableConfig } from '../common/TableFoundation';

interface UserData {
  id: string;
  name: string;
  email: string;
  age: number;
}

const config: TableConfig<UserData> = {
  title: 'ユーザー一覧',
  primaryKey: ['id'],
  enablePagination: true,
  pageSize: 20,
  enableColumnFilters: true,
  modalSize: 'medium',
  
  columns: [
    {
      key: 'id',
      header: 'ID',
      width: '100px',
      sortable: true,
      filterable: true,
      filterType: 'text'
    },
    {
      key: 'name',
      header: '名前',
      width: '150px',
      sortable: true,
      filterable: true,
      filterType: 'text'
    },
    {
      key: 'email',
      header: 'メールアドレス',
      width: '200px',
      filterable: true,
      filterType: 'text'
    },
    {
      key: 'age',
      header: '年齢',
      width: '80px',
      sortable: true,
      filterable: true,
      filterType: 'number'
    }
  ],
  
  formFields: [
    {
      key: 'id',
      label: 'ID',
      type: 'text',
      required: true,
      readonly: true
    },
    {
      key: 'name',
      label: '名前',
      type: 'text',
      required: true,
      placeholder: '名前を入力'
    },
    {
      key: 'email',
      label: 'メールアドレス',
      type: 'email',
      required: true,
      placeholder: 'example@domain.com'
    },
    {
      key: 'age',
      label: '年齢',
      type: 'number',
      required: true,
      validation: (value) => {
        const num = Number(value);
        if (isNaN(num) || num < 0 || num > 150) {
          return '年齢は0から150の間で入力してください';
        }
        return null;
      }
    }
  ],
  
  apiEndpoints: {
    list: 'getUserList',
    create: 'createUser',
    update: 'updateUser',
    delete: 'deleteUser'
  }
};

const table = new TableFoundation<UserData>('userTable', config);
```

### computedを使用した例

```typescript
columns: [
  {
    key: 'fullName',
    header: 'フルネーム',
    computed: {
      format: (row) => `${row.lastName} ${row.firstName}`
    }
  }
]
```

### custom-dropdownフィルタの使用例

```typescript
columns: [
  {
    key: 'userNumber',
    header: '利用者番号',
    filterable: true,
    filterType: 'custom-dropdown',
    filterOptions: [
      { key: '001', value: '001: 田中太郎' },
      { key: '002', value: '002: 佐藤花子' }
    ],
    computed: {
      format: (row) => {
        const user = userOptions.find(u => u.key === row.userNumber);
        return user?.value || row.userNumber;
      }
    }
  }
]
```

### パラメータ付きデータ読み込みの例

```typescript
const config: TableConfig<Data> = {
  // ... 他の設定
  loadDataParams: [2024, 1] // 年と月をデフォルトパラメータとして設定
};

const table = new TableFoundation('tableId', config);

// パラメータを変更して再読み込み
table.reloadWithParams([2024, 2]); // 2月のデータを読み込み
```

## イベント

`TableFoundation`は内部的に以下のカスタムイベントを使用します：

- `filterChange`: フィルターが変更されたときに発火
- `filterButtonClick`: フィルターボタンがクリックされたときに発火
- `formSubmit`: フォームが送信されたときに発火（`create`または`update`モード）

これらのイベントは内部で処理されるため、通常は直接操作する必要はありません。

## エラーハンドリング

API呼び出しでエラーが発生した場合、エラーメッセージに`USER_ERROR:`プレフィックスが含まれている場合は、そのメッセージがそのままユーザーに表示されます。プレフィックスがない場合は、デフォルトのエラーメッセージが表示されます。

```typescript
// サーバー側でのエラー処理例
throw new Error('USER_ERROR:利用者番号が既に存在します');
```

## セキュリティ

- すべての動的な値は`escapeHtml()`関数でエスケープされており、XSS攻撃を防いでいます。
- セル内容、フォームフィールド、フィルター値など、すべてのユーザー入力は適切にエスケープされます。

## 関連クラス

- `TableFilter<T>`: フィルター機能を提供するクラス
- `TableForm<T>`: フォーム機能を提供するクラス
- `CustomDropdown`: 検索機能付きドロップダウンコンポーネント

## 注意事項

1. **プライマリキー**: `primaryKey`は配列で指定する必要があります。複合主キーもサポートされています。
2. **データ型**: `Date`型は`google.script.run`で直接送信できないため、APIでは文字列（`yyyy-MM-dd`形式