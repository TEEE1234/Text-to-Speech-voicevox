var startReading = false;
var tabId = null;

// 初期化時に chrome.storage から startReading の値を取得する
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  tabId = tabs[0].id;
  chrome.storage.local.get([tabId.toString()], function (result) {
    if (result[tabId] !== undefined) {
      startReading = result[tabId];
      updateButtonText();
      document.getElementById("readButton").checked = startReading; // ボタンの状態を初期化する
    }
  });
});

// ボタンがクリックされた時の処理
var btn = document.getElementById("readButton");
btn.addEventListener("click", function () {
  startReading = !startReading;
  updateButtonText();
  chrome.storage.local.set({ [tabId.toString()]: startReading });
  chrome.tabs.sendMessage(tabId, {
    action: "toggleReading",
    startReading: startReading,
  });
});

// ボタンのテキストを更新する関数
function updateButtonText() {
  btn.textContent = startReading ? "停止" : "開始";
}
