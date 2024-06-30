const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const scrapePlayerData = async (page) => {
  let list = [];

  const productHandles = await page.$$("#battingTAB > table  tbody > tr");

  await page.waitForSelector("#battingTAB > table > tbody > tr");

  for (const productHandle of productHandles) {
    let playerName = "NULL";
    let score = "NULL";
    let teamName = "NULL";
    let highScore = "NULL";
    let strikeRate = "NULL";

    try {
      playerName = await page.evaluate(
        (el) =>
          el.querySelector(" td > div > a > div.st-ply-name.ng-binding")
            ?.textContent || "NULL",
        productHandle
      );
      //   console.log(playerName);
    } catch (error) {
      console.error("Error getting title:", error);
    }

    try {
      teamName = await page.evaluate(
        (el) =>
          el.querySelector(" td > div > a > div.st-ply-tm-name.ng-binding")
            ?.textContent || "NULL",
        productHandle
      );
      //   console.log(teamName);
    } catch (error) {
      console.error("Error getting title:", error);
    }

    try {
      score = await page.evaluate(
        (el) =>
          el.querySelector("td.ng-binding.np-tableruns")?.textContent || "NULL",
        productHandle
      );
      //   console.log(score);
    } catch (error) {
      console.error("Error getting title:", error);
    }

    try {
      highScore = await page.evaluate(
        (el) => el.querySelector("td:nth-child(7)")?.textContent || "NULL",
        productHandle
      );
      //   console.log(score);
    } catch (error) {
      console.error("Error getting title:", error);
    }

    try {
      strikeRate = await page.evaluate(
        (el) => el.querySelector("td:nth-child(10)")?.textContent || "NULL",
        productHandle
      );
      //   console.log(score);
    } catch (error) {
      console.error("Error getting title:", error);
    }

    if (playerName !== "NULL") {
      list.push({ playerName, teamName, score, highScore, strikeRate });
    }
  }
  return list;
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.goto("https://www.iplt20.com/stats/", {
    waitUntil: "load",
  });

  let sessionDATA = await scrapePlayerData(page);

  fs.writeFileSync(
    path.join(__dirname, "playerData.json"),
    JSON.stringify(sessionDATA, null, 2),
    "utf8"
  );
  await browser.close();
})();
