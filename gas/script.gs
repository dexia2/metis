// テーブルデータの取得
function getTableArr(sheetName){
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);
  var arr2D = sheet.getRange(1,
                             1,
                             sheet.getLastRow(),
                             sheet.getLastColumn()).getValues();
  return arr2D;
}

// テーブルデータをjsonに変換
function toJSObj(arr2D) {
  var titles = arr2D[0];
  return arr2D.slice(1).map(function(arr) {
    var obj = {};
    for(var i = 0; i < arr.length; i++){
      obj[titles[i]] = arr[i];
    }
    return obj;      
  }); 
}

// シリーズ一覧を取得
function getSeries() {
  var series2D = getTableArr('series');
  var series = toJSObj(series2D);
  return series;
}

// おすすめを取得
function getRecommendedSeries(){
  var series = getSeries();
  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var recommended = series.filter(function(s) {
    if(!s.subscribe) return false;    
    var limit = new Date(s.published.valueOf());
    limit.setMonth(limit.getMonth() + s.period);
    return limit.getTime() <= today.getTime();
  });
  return recommended;
}

// mailを送信
function sendMail(recommeded) {
 
  var to = 'my-email@gmail.com';
  var from = 'my-email@gmail.com';
  var sender = 'my-name';
 
  var subject = '推薦書籍の紹介';
  var body = '以下の書籍の購入はお済ですか？\n';
  for(var i = 0; i< recommeded.length; i++){
    body += recommeded[i].name + '\n';
  }
  
  GmailApp.sendEmail(
    to,
    subject,
    body,
    {
      from: from,
      name: sender
    }
  );
}

// 定期通知する
function notifyBooks(){
  var recommeded = getRecommendedSeries();
  if(recommeded.length) {
    sendMail(recommeded);
  }
}