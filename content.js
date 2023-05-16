var startReading = false;
var words = [];
var index = 0;
var isPlaying = false;

document.addEventListener("click", handleClick);

function handleClick(event) {
  if (startReading && !isPlaying) {
    const clickedElement = event.target;
    let textToRead = clickedElement.textContent.trim();
    textToRead = textToRead.replace(/\n/g, ""); // 改行文字を削除
    textToRead = textToRead.replace(/https?:\/\/\S+\b/g, ""); // httpsから始まる英語を削除
    playTextWithDelay(textToRead);
  }
}

function playTextWithDelay(textToPlay) {
  words = textToPlay.split("。"); // "。"（句点）で分割
  index = 0;
  playNextWord();
}

function playNextWord() {
  if (!startReading) {
    pauseVoice();
    return;
  }
  if (index < words.length) {
    const word = words[index].trim();
    if (word.length > 0) {
      toBackground(word);
    } else {
      index++;
      playNextWord();
    }
  } else {
    setTimeout(function () {
      isPlaying = false;
    }, 500);
  }
}

function toBackground(answer) {
  chrome.runtime.sendMessage({ action: "play", answer: answer });
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "toggleReading") {
    startReading = message.startReading;
    if (!startReading) {
      pauseVoice();
    }
  }
});

function playVoice(mp3Url) {
  if (isPlaying) {
    audio.pause();
    audio = null;
  }
  isPlaying = true;
  audio = new Audio(mp3Url);
  audio.playbackRate = 1;

  audio.addEventListener("loadedmetadata", function () {
    const duration = audio.duration;
    console.log(duration);
    audio.play().catch((error) => {
      console.error("音声再生中にエラーが発生しました:", error);
      setTimeout(function () {
        isPlaying = false;
      }, duration * 1000 + 2000);
    });

    setTimeout(function () {
      isPlaying = false;
      index++;
      playNextWord();
    }, duration * 1000 + 500);
  });

  audio.addEventListener("error", function (event) {
    console.error("音声ファイルが見つかりませんでした。再試行します...");
    setTimeout(function () {
      playVoice(mp3Url);
    }, 3000);
  });
}

function pauseVoice() {
  if (audio) {
    audio.pause();
    audio = null;
    isPlaying = false;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "audio") {
    const mp3Url = message.mp3Url;
    if (mp3Url) {
      playVoice(mp3Url);
    }
  }
});

let highlightedElement = null; // ハイライトされている要素を追跡
let hoverTimeout = null; // カーソルが要素の上にあるタイマー

document.addEventListener("mouseover", function (event) {
  clearTimeout(hoverTimeout); // 既存のタイマーをクリア

  const hoveredElement = event.target;

  hoverTimeout = setTimeout(function () {
    // 1秒後にハイライトを適用
    if (highlightedElement !== hoveredElement) {
      // ハイライトされている要素が変更された場合、前の要素のハイライトを削除
      if (highlightedElement) {
        highlightedElement.style.boxShadow = "";
      }

      // 新しい要素をハイライト
      hoveredElement.style.boxShadow = "0 0 5px 2px rgba(0, 255, 255, 0.5)";
      highlightedElement = hoveredElement;
    }
  }, 500);
});

document.addEventListener("mouseout", function () {
  clearTimeout(hoverTimeout); // タイマーをクリア

  if (highlightedElement) {
    // マウスが要素から離れた場合、ハイライトスタイルを削除
    highlightedElement.style.boxShadow = "";
    highlightedElement = null;
  }
});
