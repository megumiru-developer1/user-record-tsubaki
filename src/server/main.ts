// version: v1.0.0

global.include = function(filename: string): string {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

global.onOpen = function() {
  SpreadsheetApp.getUi()
      .createMenu('機能一覧')
      .addItem('機能1', 'openFeature1Modal')
      .addToUi();
}

// 機能1
global.openFeature1Modal = function() {
  const html = HtmlService.createTemplateFromFile('client/feature1/index')
      .evaluate()
      .setWidth(1600)
      .setHeight(1000);
  SpreadsheetApp.getUi().showModalDialog(html, '機能1');
}