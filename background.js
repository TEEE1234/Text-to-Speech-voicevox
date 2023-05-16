chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "play") {
    fetch(
      `https://api.tts.quest/v1/voicevox/?text=${message.answer}&speaker=1`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.retryAfter) {
          console.log(data.retryAfter);
        }
        const mp3Url = data.mp3DownloadUrl;
        if (sender && sender.tab) {
          chrome.tabs.sendMessage(sender.tab.id, {
            action: "audio",
            mp3Url: mp3Url,
          });
        }
      })
      .catch((error) => {
        console.error("エラー:", error);
      });
  }
});
