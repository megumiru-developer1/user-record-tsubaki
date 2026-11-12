import { MonthlyReportUserSheetRepository, MonthlyReportDateCellRepository, IdListNendoRepository } from 'common-data-access-tsubaki-type-a/repositories/sheetsAPIRepositories'
import { MonthlyReportUserSheet, MonthlyReportDateCell } from 'common-data-access-tsubaki-type-a/models'
import { Domains } from 'ws-framework/server';
import { Config } from "./Config";

const TEMPLATE_SHEET_NAME = "XXX氏名";
const NOT_CREATE_SHEET_NAMES_RANGE_NAMES = '未作成シートリスト';
const DATE_CELL_MAP_RANGE_NAME = "日付_セル番地マップ";
const INPUTTED_USER_NO_RANGE_NAME = "利用者シート作成_利用者番号";
const INPUTTED_USER_NAME_RANGE_NAME = "利用者シート作成_氏名";

// シート名から利用者番号を取得するための正規表現
const USER_NUMBER_REGEX = /^([0-9]{3})[^0-9]+$/;

//プロセスを終了させるか判断するための時間
const TIMEOUT_SECOND = 5 * 60;

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

class UserRecord{
  private spreadSheet: GoogleAppsScript.Spreadsheet.Spreadsheet;


  
  constructor(public spreadSheetId:string) {
    this.spreadSheet = SpreadsheetApp.openById(spreadSheetId);
  }

  private existsUserSheet()


}

// 利用者シート作成 ⇒「作成」ボタンを押した時の処理
global.clickCreateBtnHandler = function(){
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    const userNo = ss.getRangeByName(INPUTTED_USER_NO_RANGE_NAME)?.getValue();
    const userName = ss.getRangeByName(INPUTTED_USER_NAME_RANGE_NAME)?.getValue();

    if (!userNo || !userName) {
      Browser.msgBox("利用者番号または氏名が入力されていません。");
      return;
    }

    const bindingData: SheetBindingData = {
      userNumber: userNo,
    };

    const sheetCreator = generateSheetCreator();

    sheetCreator.createSheet(bindingData, userNo + userName);

    syncUserSheetInfo();

    Browser.msgBox('シートの作成が完了しました。');
  } catch (error: any) {
    Logger.log('シート作成エラー:', error);
    Logger.log('エラースタック:', error.stack);

    Browser.msgBox('シートの作成中にエラーが発生しました。');
    return;
  }
}

// 未作成シート一覧⇒「シート作成」ボタンを押した時の処理
global.clickBundleCreateBtnHandler = function() {
  try {
    const startTime = new Date();

    const activeSpreadSheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // 未作成のシート名を取得
    const notCreatedSheetNames = activeSpreadSheet.getRangeByName(NOT_CREATE_SHEET_NAMES_RANGE_NAMES)?.getValues().flat();
    
    if (!notCreatedSheetNames) {
      throw new Error("未作成のシート名が取得できませんでした。");
    }
    
    const targetSheetNames = notCreatedSheetNames.filter(sheetName => sheetName !== '');

    const sheetCreator = generateSheetCreator();

    for (let targetSheetName of targetSheetNames) {

      const userNumber = targetSheetName.match(USER_NUMBER_REGEX)?.[1];

      if (!userNumber) {
        throw new Error(`シート${targetSheetName}の利用者番号が見つかりません。`);
      }

      const bindingData: SheetBindingData = {
        userNumber: userNumber,
      };

      sheetCreator.createSheet(bindingData, targetSheetName);
      
      let endTime = new Date();

      let processingSecond = (endTime.getDate() - startTime.getDate()) / 1000;

      // タイムアウトしたら処理を終了
      if (TIMEOUT_SECOND < processingSecond) {
        Browser.msgBox("処理が途中で終了しました。");
        break;
      }
    }

    syncUserSheetInfo();

    Browser.msgBox('シートの作成が完了しました。');
    
  } catch (error: any) {

    Logger.log('ID反映エラー:', error);
    Logger.log('エラースタック:', error.stack);

    Browser.msgBox('シートの作成中にエラーが発生しました。');
    return;
  }
}

function syncUserSheetInfo() {
  const config = Config.getInstance();

  const systemSettingFileId = config.get("systemSettingFileId");
  const year = config.get("year");
  const month = config.get("month");
  const store = config.get("store");

  const idListNendoRepository = new IdListNendoRepository(systemSettingFileId, "年度別集計テーブル_ID一覧");

  const nendoAggregateTblId = idListNendoRepository.getIdByDateAndStore(new Date(year, month - 1, 1), store);

  if (!nendoAggregateTblId) {
    throw new Error("年度が取得できませんでした。");
  }

  syncMonthlyReportUserSheet(nendoAggregateTblId);
  syncMonthlyReportDateCell(nendoAggregateTblId);
}

function generateSheetCreator() {
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
 * 利用者シートのリストを取得します。
 * @param spreadsheet スプレッドシート
 * @returns 利用者シートのリスト
 */
function getUserSheetNames(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet): string[] {
  
  const sheetNames = spreadsheet.getSheets().map(sheet => sheet.getName()).filter(sheetName => USER_NUMBER_REGEX.test(sheetName));
  if (!sheetNames) {
    throw new Error('シート名一覧が見つかりません。');
  }

  // 名前付き範囲に含まれている空欄は除外
  const trimmedSheetNames = sheetNames.filter((sheetName: string) => sheetName !== '');

  return trimmedSheetNames;
}

/**
 * 存在するシートのシートIDを取得し、利用者シートIDテーブルに同期します。
 */
function syncMonthlyReportUserSheet(nendoAggregateTblId: string) {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  const config = Config.getInstance();
  const year = config.get("year");
  const month = config.get("month");
  const store = config.get("store");

  const sheetNames = getUserSheetNames(activeSpreadsheet);

  const monthlyReportUserSheetRepository = new MonthlyReportUserSheetRepository(nendoAggregateTblId, "利用者記録_利用者シート");

  const insertUserSheetData: MonthlyReportUserSheet[] = [];

  for (const sheetName of sheetNames) {
    const targetSheet = activeSpreadsheet.getSheetByName(sheetName);
    if (!targetSheet) {
      throw new Error(`シート${sheetName}が見つかりません。`);
    }

    const userNumber = sheetName.match(USER_NUMBER_REGEX)?.[1];
    if (!userNumber) {
      throw new Error(`シート${sheetName}の利用者番号が見つかりません。`);
    }

    const gid = targetSheet.getSheetId();

    insertUserSheetData.push(new MonthlyReportUserSheet(year, month, store, userNumber, gid));
  }

  monthlyReportUserSheetRepository.insertOrUpdate(insertUserSheetData);
}

function syncMonthlyReportDateCell(nendoAggregateTblId: string) {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const store = Config.getInstance().get("store");

  const monthlyReportDateCellRepository = new MonthlyReportDateCellRepository(nendoAggregateTblId, "利用者記録_日付セル");

  const dateCellMaps = getDateCellMap(activeSpreadsheet);
  const insertDateCellData: MonthlyReportDateCell[] = [];

  for (const dateCellMap of dateCellMaps) {
    const { date, cellAddress } = dateCellMap;

    insertDateCellData.push(new MonthlyReportDateCell(store, date, cellAddress));
  }

  monthlyReportDateCellRepository.insertOrUpdate(insertDateCellData);
}



function getDateCellMap(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet): DateCellMap[] {
  const dateCellMaps = spreadsheet.getRangeByName(DATE_CELL_MAP_RANGE_NAME)?.getValues().flat();

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