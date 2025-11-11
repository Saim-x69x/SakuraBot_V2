const axios = require("axios");
const path = require("path");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "googleimage",
    aliases: ["gimg", "googleimg", "gimage"],
    version: "1.0",
    author: "Saimx69x",
    role: 0,
    countDown: 5,
    description: { en: "Search or get images from Google Images." },
    category: "image",
    guide: { en: "{pn} <search query> - <number of images>\nExample: {pn} Naruto - 10" },
  },

  onStart: async function ({ api, event, args }) {
    try {
      const input = args.join(" ").trim();
      if (!input)
        return api.sendMessage(
          `❌ Please provide a search query.\nExample: /googleimg Sakura Haruka - 10`,
          event.threadID,
          event.messageID
        );

      let query = input;
      let count = 5;

      if (input.includes("-")) {
        const parts = input.split("-");
        query = parts[0].trim();
        count = parseInt(parts[1].trim()) || 5;
      }
      if (count > 25) count = 25;

      const GITHUB_RAW = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
      const rawRes = await axios.get(GITHUB_RAW);
      const apiBase = rawRes.data.apiv1;

      const apiUrl = `${apiBase}/api/googleimage?query=${encodeURIComponent(query)}`;
      const res = await axios.get(apiUrl);
      const data = res.data?.images || [];

      if (data.length === 0)
        return api.sendMessage(
          `❌ No images found for "${query}". Try a different search.`,
          event.threadID,
          event.messageID
        );

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      const validImages = [];
      for (let url of data) {
        if (validImages.length >= count) break;

        try {
          const headRes = await axios.head(url);
          const contentType = headRes.headers["content-type"];
          if (!contentType || !contentType.startsWith("image")) continue;

          const imgRes = await axios.get(url, { responseType: "arraybuffer" });
          const imgPath = path.join(cacheDir, `${validImages.length + 1}.jpg`);
          await fs.writeFile(imgPath, imgRes.data);
          validImages.push(fs.createReadStream(imgPath));
        } catch (err) {
          continue;
        }
      }

      if (validImages.length === 0)
        return api.sendMessage(
          `❌ Couldn't find any valid images for "${query}".`,
          event.threadID,
          event.messageID
        );

      await api.sendMessage(
        { body: `✅ Here are your images for "${query}"`, attachment: validImages },
        event.threadID,
        event.messageID
      );

      if (fs.existsSync(cacheDir)) await fs.remove(cacheDir);

    } catch (error) {
      console.error("GoogleImg Error:", error.message);
      return api.sendMessage(
        "❌ Something went wrong. Please try again later.",
        event.threadID,
        event.messageID
      );
    }
  },
};
