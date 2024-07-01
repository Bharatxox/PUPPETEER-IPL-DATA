const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const selectSeason = async (page, no) => {
  // no start with 2 and end with 5 in a loop
  try {
    // await page.waitForSelector("#battingTAB > table > tbody > tr", {
    //   timeout: 60000,
    // });
    await page.click(
      "body > div.matchCenter.stats-widget.ng-scope > div.smStatsBg > div > section > div > div.np-leader > div.pp > div:nth-child(1) > div > div > div:nth-child(1) > div > div.cSBDisplay.ng-binding"
    );
    await page.waitForSelector("div.cSBList.active");
    const seasonSelector = `div.cSBList.active > div:nth-child(${no})`;
    await Promise.all([
      page.click(seasonSelector),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);
  } catch (error) {
    console.error(`Error selecting season ${no}:`, error);
    throw error;
  }
};

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
  let allPlayerData = [];

  // await page.waitForNavigation({ waitUntil: "networkidle2" });
  await page.waitForSelector("#battingTAB > table > tbody > tr", {
    timeout: 60000,
  });
  let currentSeasonData = await scrapePlayerData(page);
  allPlayerData = allPlayerData.concat(currentSeasonData);

  //now run the loop from 2 to 5 for each page
  for (let i = 2; i <= 5; i++) {
    await selectSeason(page, i);
    let seasonData = await scrapePlayerData(page);
    console.log(seasonData);
    allPlayerData = allPlayerData.concat(seasonData);
  }

  fs.writeFileSync(
    path.join(__dirname, "allPlayerDATA.json"),
    JSON.stringify(allPlayerData, null, 2),
    "utf8"
  );
  await browser.close();
})();
