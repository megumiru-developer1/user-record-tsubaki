/**
 * gas-webpack-plugin は global.xxx = fn で GAS グローバル関数を公開する。
 * 任意のプロパティ代入を型チェック上許可する。
 */
declare var global: {
  [key: string]: any;
};
