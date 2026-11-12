import { Store } from "common-data-access-tsubaki-type-a/types";

type ConfigValues = {
  readonly year: number;
  readonly month: number;
  readonly store: Store;
  readonly systemSettingFileId: string;
};

const NAMED_RANGES: Record<keyof ConfigValues, string> = {
  year: "設定_年",
  month: "設定_月",
  store: "設定_店舗",
  systemSettingFileId: "システム設定ファイルID",
};

export class Config {
  private static instance: Config | undefined;
  private readonly config: ConfigValues;

  private constructor() {

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const year = spreadsheet.getRangeByName(NAMED_RANGES.year)?.getValue() as number;
    const month = spreadsheet.getRangeByName(NAMED_RANGES.month)?.getValue() as number;
    const store = spreadsheet.getRangeByName(NAMED_RANGES.store)?.getValue() as Store;
    const systemSettingFileId = spreadsheet.getRangeByName(NAMED_RANGES.systemSettingFileId)?.getValue() as string;

    if (!year) {
      throw new Error("年月が取得できませんでした。");
    }
    if (!month) {
      throw new Error("年月が取得できませんでした。");
    }
    if (!store) {
      throw new Error("店舗が取得できませんでした。");
    }
    if (!systemSettingFileId) {
      throw new Error("システム設定ファイルIDが取得できませんでした。");
    }

    this.config = {
      year: year,
      month: month,
      store: store,
      systemSettingFileId: systemSettingFileId,
    };
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  get<K extends keyof ConfigValues>(key: K): ConfigValues[K] {
    return this.config[key];
  }
}