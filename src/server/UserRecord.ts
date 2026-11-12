import { Domains } from 'ws-framework/server';
import { Store } from "common-data-access-tsubaki-type-a/types";

const TEMPLATE_SHEET_NAME = "XXX氏名";
const NOT_CREATE_SHEET_NAMES_RANGE_NAMES = '未作成シートリスト';
const DATE_CELL_MAP_RANGE_NAME = "日付_セル番地マップ";

// 利用者番号 セル番地
const USER_ID_RANGE = "A2";

// シート作成時のバインディングデータ
interface SheetBindingData extends Domains.BindingData {
  userNumber: string;
};

// 日付_セル番地マップの型
type DateCellMap = {
  date: Date;
  cellAddress: string;
}

// 利用者番号、gidマップの型
type UserNumberGidMap = {
  userNumber: string;
  gid: number;
}

type UserSheetUrlMap = {
  year: number;
  month: number;
  store: Store;
  userNumber: string;
  url: string;
}

type DateCellUrlMap = {
  store: Store;
  userNumber: string;
  date: Date;
  url: string;
}

interface IUserSheetName {
  get sheetName(): string;
  userNumber: string;
  userName: string;
  isValid(): boolean;
}

interface IUserSheet {
  get userNumber(): string;
  get userName(): string;
  get gid(): number;
}

/**
 * 利用者シート名を管理するクラス
 */
export class UserRecordSheetName implements IUserSheetName {
  public static readonly sheetNameRegex: RegExp = /^([0-9]+)([^0-9]+)$/;

  constructor(private _sheetName: string) {}

  // シート名
  get sheetName(): string {
    return this._sheetName;
  }

  // 利用者番号
  get userNumber(): string {
    const userNumber = this._sheetName.match(UserRecordSheetName.sheetNameRegex)?.[1] as string;
    if (!userNumber) {
      throw new Error(`シート名${this._sheetName}の利用者番号が見つかりません。`);
    }
    return userNumber;
  }

  // 氏名
  get userName(): string {
    const userName = this._sheetName.match(UserRecordSheetName.sheetNameRegex)?.[2] as string;
    if (!userName) {
      throw new Error(`シート名${this._sheetName}の氏名が見つかりません。`);
    }
    return userName;
  }

  // シート名が有効かどうか
  isValid(): boolean {
    return UserRecordSheetName.sheetNameRegex.test(this._sheetName);
  }
}

/**
 * 利用者シートを管理するクラス
 */
export class UserRecordSheet implements IUserSheet {
  constructor(private sheet: GoogleAppsScript.Spreadsheet.Sheet) {}

  // 利用者番号
  get userNumber(): string {
    const sheetName = this.sheet.getName();
    const userSheetNameParser = new UserRecordSheetName(sheetName);
    return userSheetNameParser.userNumber;
  }

  // 氏名
  get userName(): string {
    const sheetName = this.sheet.getName();
    const userSheetNameParser = new UserRecordSheetName(sheetName);
    return userSheetNameParser.userName;
  }

  // シートのgid
  get gid(): number {
    return this.sheet.getSheetId();
  }
}

const CONFIG_YEAR_RANGE_NAME = "設定_年";
const CONFIG_MONTH_RANGE_NAME = "設定_月";
const CONFIG_STORE_RANGE_NAME = "設定_店舗";

export class UserRecord{
  private spreadSheet: GoogleAppsScript.Spreadsheet.Spreadsheet;
  // 設定された年月店舗 ※未設定の場合はnull
  private year: number | null;
  private month: number | null;
  private store: Store | null;

  createUserSheet(userNumber: string, userName: string) {
    const sheetCreator = this.buildSheetCreator();
    sheetCreator.createSheet({ userNumber }, userNumber + userName);
  }

  constructor(public spreadSheetId:string) {
    this.spreadSheet = SpreadsheetApp.openById(spreadSheetId);
    this.year = this.spreadSheet.getRangeByName(CONFIG_YEAR_RANGE_NAME)?.getValue() as number;
    this.month = this.spreadSheet.getRangeByName(CONFIG_MONTH_RANGE_NAME)?.getValue() as number;
    this.store = this.spreadSheet.getRangeByName(CONFIG_STORE_RANGE_NAME)?.getValue() as Store;
  }

  getConfigYear(): number | null {
    return this.year;
  }

  getConfigMonth(): number | null {
    return this.month;
  }

  getConfigStore(): Store | null {
    return this.store;
  }

  setConfigYear(year: number) {
    const configYearRange = this.spreadSheet.getRangeByName(CONFIG_YEAR_RANGE_NAME);
    if (!configYearRange) {
      throw new Error("設定_年が見つかりません。");
    }
    configYearRange.setValue(year);
    this.year = year;
  }

  setConfigMonth(month: number) {
    const configMonthRange = this.spreadSheet.getRangeByName(CONFIG_MONTH_RANGE_NAME);
    if (!configMonthRange) {
      throw new Error("設定_月が見つかりません。");
    }
    configMonthRange.setValue(month);
    this.month = month;
  }

  setConfigStore(store: Store) {
    const configStoreRange = this.spreadSheet.getRangeByName(CONFIG_STORE_RANGE_NAME);
    if (!configStoreRange) {
      throw new Error("設定_店舗が見つかりません。");
    }
    configStoreRange.setValue(store);
    this.store = store;
  }

  /**
   * 未作成の利用者シート名を取得します。
   * @returns 未作成の利用者シート名のリスト
   */
  public getNotCreatedUserSheetNames(): string[] {
    const notCreatedSheetNames = this.spreadSheet.getRangeByName(NOT_CREATE_SHEET_NAMES_RANGE_NAMES)?.getValues().flat();
    
    if (!notCreatedSheetNames) {
      throw new Error("未作成のシート名が取得できませんでした。");
    }
    
    const targetSheetNames = notCreatedSheetNames.filter(sheetName => sheetName !== '');

    return targetSheetNames;
  }

  /**
   * 既存の利用者シートを取得します。
   * @returns 利用者シートのリスト
   */
  private getExistedUserSheets(): UserRecordSheet[] {
    const sheets = this.spreadSheet.getSheets().filter(sheet => new UserRecordSheetName(sheet.getName()).isValid()).map(sheet => new UserRecordSheet(sheet));

    return sheets;
  }

  /**
   * シートクリエイターのインスタンスを作成します。
   * @returns シートクリエイターのインスタンス
   */
  private buildSheetCreator() {
    const activeSpreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  
    const createProcedure: Domains.SheetCreateProcedure<SheetBindingData> = function(sheet: GoogleAppsScript.Spreadsheet.Sheet, bindingData: SheetBindingData) {
      
      const userNumber = bindingData.userNumber;
      sheet.getRange(USER_ID_RANGE).setValue(`'${userNumber}`);
  
      // 年月、名前、氏名のプロテクト
      sheet.getRange("A1:D2").protect().setWarningOnly(true);
  
      // 自動で表示される箇所プロテクト
      sheet.getRange("E1:AI7").protect().setWarningOnly(true);
    };
  
    return new Domains.SpreadsheetSheetCreator(activeSpreadSheet, TEMPLATE_SHEET_NAME, createProcedure);
  }

  /**
   * 利用者番号、gidマップを取得します。
   * @returns 利用者番号、gidマップのリスト
   */
  private getUserNumberGidMaps(): UserNumberGidMap[] {
    const existedUserSheets = this.getExistedUserSheets();

    const userNumberGidMap: UserNumberGidMap[] = [];
    for (const userSheet of existedUserSheets) {
      userNumberGidMap.push({ userNumber: userSheet.userNumber, gid: userSheet.gid });
    }

    return userNumberGidMap;
  }

  /**
   * 日付_セル番地マップを取得します。
   * 本マップで利用者シートの日付のセルの番地が記録されています。
   * @returns 日付_セル番地マップのリスト
   */
  private getDateCellMaps(): DateCellMap[] {
    const dateCellMaps = this.spreadSheet.getRangeByName(DATE_CELL_MAP_RANGE_NAME)?.getValues().flat();
  
    if (!dateCellMaps) {
      throw new Error('日付_セル番地マップが見つかりません。');
    }
  
    // 空欄は除外
    const trimmedDateCellMaps = dateCellMaps.filter((dateCellMap) => dateCellMap !== '');
  
    return trimmedDateCellMaps .map((dateCellMap) => {
      const [date, cellAddress] = dateCellMap.split(',');
      return { date: new Date(date), cellAddress };
    });
  }

  /**
   * 存在する全ての利用者シートのURLを生成します。
   * @returns 利用者シートのURLのリスト
   */
  public generateUserSheetUrl(): UserSheetUrlMap[] {
    const userNumberGidMaps = this.getUserNumberGidMaps();

    const year = this.year;
    const month = this.month;
    const store = this.store;

    if (!year || !month || !store) {
      throw new Error("年月店舗が設定されていません。");
    }

    const userSheetUrlMaps: UserSheetUrlMap[] = [];
    for (const userNumberGidMap of userNumberGidMaps) {

      const url = `https://docs.google.com/spreadsheets/d/${this.spreadSheetId}/edit?gid=${userNumberGidMap.gid}#gid=${userNumberGidMap.gid}`;
      userSheetUrlMaps.push({ year, month, store, userNumber: userNumberGidMap.userNumber, url: url });
    }

    return userSheetUrlMaps;
  }

  /**
   * 存在する全ての利用者シートの日付のセルのURLを生成します。
   * @returns 日付のセルのURLのリスト
   */
  public generateDateCellUrl(): DateCellUrlMap[] {
    const userSheetUrlMaps = this.generateUserSheetUrl();
      
    const dateCellMaps = this.getDateCellMaps();
      
    const dateCellUrlMaps: DateCellUrlMap[] = [];

    const store = this.store;

    if (!store) {
      throw new Error("年月店舗が設定されていません。");
    }

    for (const userSheetUrl of userSheetUrlMaps) {
      for (const dateCellMap of dateCellMaps) {

        const url = `${userSheetUrl.url}&range=${dateCellMap.cellAddress}`;
        dateCellUrlMaps.push({ store, userNumber: userSheetUrl.userNumber, date: dateCellMap.date, url: url });
      }
    }

    return dateCellUrlMaps;
  }
}
