const axios = require("axios");

module.exports = {
  config: {
    name: "narutovideo",
    aliases: ["naruvid", "narutovid", "naruvideo"],
    version: "1.0",
    author: "Saimx69x",
    role: 0,
    countDown: 5,
    description: "Sends a random naruto video.",
    category: "anime",
  },

  onStart: async function ({ api, event }) {
    try {
      const processingMessage = await api.sendMessage(
        "⏳ Please wait few seconds...",
        event.threadID,
        event.messageID
      );

      const GITHUB_RAW = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
      const rawRes = await axios.get(GITHUB_RAW);
      const apiBase = rawRes.data.apiv1;

      const res = await axios.get(`${apiBase}/api/narutovideo`);

      if (!res.data || !res.data.url) {
        await api.unsendMessage(processingMessage.messageID);
        return api.sendMessage(
          "❌ Oops! Something went wrong, please try again later.",
          event.threadID,
          event.messageID
        );
      }

      const videoUrl = res.data.url;

      const msg = {
        body: "🎬 Here's a random naruto video for you! 😊💖",
        attachment: await global.utils.getStreamFromURL(videoUrl),
      };
      await api.sendMessage(msg, event.threadID, event.messageID);

      await api.unsendMessage(processingMessage.messageID);

    } catch (error) {
      console.error(error);
      await api.sendMessage(
        "❌ Oops! Something went wrong, please try again later.",
        event.threadID,
        event.messageID
      );
    }
  },
};
