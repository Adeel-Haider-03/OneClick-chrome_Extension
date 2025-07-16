import { summarizeText, explainCode } from "./api.js";


function highlightComments(code) {
  return code.replace(/(\/\/.*)/g, '<span class="comment">$1</span>');
}

// Output area
const output = document.getElementById("output");
function showOnlyCopyButton() {
  document.getElementById("summarizeBtn").style.display = "none";
  document.getElementById("explainBtn").style.display = "none";
  document.getElementById("copyBtn").style.display = "block";
}


// Copy to clipboard functionality
document.getElementById("copyBtn").addEventListener("click", () => {
  const rawText = output.innerText;
  navigator.clipboard.writeText(rawText).then(() => {
    const btn = document.getElementById("copyBtn");
    btn.innerText = "✅ Copied!";
    setTimeout(() => (btn.innerText = "📋 Copy Output"), 1500);
  });
});

// Loading + rendering logic
async function handleLoading(callbackFn) {
  output.innerText = "⏳ Processing, please wait...";
  try {
    const result = await callbackFn();
    const highlighted = highlightComments(result);
    output.innerHTML = `<pre>${highlighted}</pre>`;
  
     showOnlyCopyButton();
  } catch (err) {
    console.error(err);
    output.innerText = "❌ Error: Could not complete the request.";
    document.getElementById("copyBtn").style.display = "none";
  }
}

// Summarize page content
document.getElementById("summarizeBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: () => document.body.innerText,
    },
    async (results) => {
      const text = results[0]?.result?.slice(0, 8000) || "";
      if (!text) {
        output.innerText = "⚠️ Could not extract page content.";
        return;
      }
      await handleLoading(() => summarizeText(text));
    }
  );
});

// Check if a right-click "Explain" action stored code in chrome.storage
document.addEventListener("DOMContentLoaded", async () => {
  const result = await chrome.storage.local.get("explainSelectedCode");
  const code = result.explainSelectedCode;

  if (code) {
    // Clear it so it doesn't auto-run next time
    await chrome.storage.local.remove("explainSelectedCode");

    // Handle and display explanation
    if (code.trim()) {
      await handleLoading(() => explainCode(code));
      
    }
  }
});

document.getElementById("explainBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: () => window.getSelection().toString(),
    },
    async (results) => {
      const code = results[0]?.result?.slice(0, 3000) || "";
      if (!code.trim()) {
        output.innerText = "⚠️ Please select some code first.";
        return;
      }
      await handleLoading(() => explainCode(code));
    }
  );
});


