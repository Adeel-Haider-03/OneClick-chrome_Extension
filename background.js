chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "explain-code",
    title: "🧠 Explain this code with AI",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "explain-code") {
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: () => window.getSelection().toString(),
      },
      async (results) => {
        const code = results[0].result.slice(0, 3000);
        chrome.storage.local.set({ explainSelectedCode: code });
        chrome.action.openPopup(); // or open popup.html manually if needed
      }
    );
  }
});
