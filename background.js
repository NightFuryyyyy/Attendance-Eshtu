const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

browserAPI.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
  if (details.frameId !== 0) return;
  if (!details.url.startsWith("https://cue.christuniversity.in/main/attendence")) return;
  await sleep(2000);
  await browserAPI.scripting.executeScript({
    target: { tabId: details.tabId },
    files: ["attendance.js"]
  });
  console.log(`Injected attendance.js into tab ${details.tabId}.`);
});