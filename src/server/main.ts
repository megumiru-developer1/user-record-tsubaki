import { MonthlyReportUserSheetRepository, MonthlyReportDateCellRepository, IdListNendoRepository } from 'common-data-access-tsubaki-type-a/repositories/sheetsAPIRepositories'
import { MonthlyReportUserSheet, MonthlyReportDateCell } from 'common-data-access-tsubaki-type-a/models'
import { Config } from "./Config";
import { UserRecord, UserRecordSheetName } from "./UserRecord";

const INPUTTED_USER_NO_RANGE_NAME = "利用者シート作成_利用者番号";
const INPUTTED_USER_NAME_RANGE_NAME = "利用者シート作成_氏名";

//プロセスを終了させるか判断するための時間
const TIMEOUT_SECOND = 5 * 60;

global.test = function() {
  const userRecord = new UserRecord(SpreadsheetApp.getActiveSpreadsheet().getId());
  const userSheetUrlMaps = userRecord.generateUserSheetUrl();
  const dateCellUrlMaps = userRecord.generateDateCellUrl();
  Logger.log(userSheetUrlMaps);
  Logger.log(dateCellUrlMaps);
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

    const userRecord = new UserRecord(ss.getId());

    userRecord.createUserSheet(userNo, userName);

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

    const userRecord = new UserRecord(activeSpreadSheet.getId());

    const notCreatedSheetNames = userRecord.getNotCreatedUserSheetNames();

    for (let targetSheetName of notCreatedSheetNames) {

      const userSheetName = new UserRecordSheetName(targetSheetName);
      const userNumber = userSheetName.userNumber;
      const userName = userSheetName.userName;

      userRecord.createUserSheet(userNumber, userName);
      
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

/**
 * 利用者シートの情報を年度別の集計テーブルに同期します。
 */
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

/**
 * 存在するシートのシートIDを取得し、利用者シートIDテーブルに同期します。
 */
function syncMonthlyReportUserSheet(nendoAggregateTblId: string) {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  const config = Config.getInstance();
  const year = config.get("year");
  const month = config.get("month");
  const store = config.get("store");

  const userRecord = new UserRecord(activeSpreadsheet.getId());

  const userSheetUrlMaps = userRecord.generateUserSheetUrl();

  const monthlyReportUserSheetRepository = new MonthlyReportUserSheetRepository(nendoAggregateTblId, "利用者記録_利用者シート");

  const insertUserSheetData: MonthlyReportUserSheet[] = [];

  for (const userSheetUrlMap of userSheetUrlMaps) {

    const { year, month, store, userNumber, url } = userSheetUrlMap;

    // insertUserSheetData.push(new MonthlyReportUserSheet(year, month, store, userNumber, url));
  }

  monthlyReportUserSheetRepository.insertOrUpdate(insertUserSheetData);
}

/**
 * 利用者シートの日付セル番地を取得し、利用者記録_日付セルテーブルに同期します。
 */
function syncMonthlyReportDateCell(nendoAggregateTblId: string) {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const store = Config.getInstance().get("store");

  const monthlyReportDateCellRepository = new MonthlyReportDateCellRepository(nendoAggregateTblId, "利用者記録_日付セル");

  const dateCellUrlMaps = new UserRecord(activeSpreadsheet.getId()).generateDateCellUrl();
  const insertDateCellData: MonthlyReportDateCell[] = [];

  for (const dateCellUrlMap of dateCellUrlMaps) {
    const { store, userNumber, date, url } = dateCellUrlMap;

    insertDateCellData.push(new MonthlyReportDateCell(store, date, url));
  }

  monthlyReportDateCellRepository.insertOrUpdate(insertDateCellData);
}



