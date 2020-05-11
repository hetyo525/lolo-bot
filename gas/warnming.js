/**
 * 以下をコピーして GAS に貼り付け。
 * スケジューラーで 1 分毎に実行する設定をする
 */
function warmUp() {
  const url = 'Your Glitch Application URL';
  const response = UrlFetchApp.fetch(url);
  const content = response.getContentText('UTF-8');
  console.log(content);
}
