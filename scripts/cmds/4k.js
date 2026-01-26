const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const apiurl =
  "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";

async function getApiUrl() {
  const res = await axios.get(apiurl);
  return res.data.apiv4;
}

module.exports = {
  config: {
    name: "4k",
    aliases: ["upscale"],
    version: "1.0",
    author: "Saimx69x (Api by fahim)",
    category: "image",
    shortDescription: "Upscale image to 4K",
    longDescription: "Upscales replied or attached image to 4K quality",
    guide: "{pn} (reply to image)"
  },

  onStart: async function ({ api, event }) {
    let imageUrl = "";
    let processingMsg;

    try {
      if (event.messageReply?.attachments?.length) {
        imageUrl = event.messageReply.attachments[0].url;
      } else if (event.attachments?.length) {
        imageUrl = event.attachments[0].url;
      } else {
        return api.sendMessage(
          "❌ Please reply to or attach an image.",
          event.threadID,
          event.messageID
        );
      }

      processingMsg = await api.sendMessage(
        "⏳ Upscaling image to 4K, please wait...",
        event.threadID,
        null,
        event.messageID
      );

      const BASE_API = await getApiUrl();
      const apiUrl = `${BASE_API}/4k?url=${encodeURIComponent(imageUrl)}`;

      const res = await axios.get(apiUrl);

      if (!res.data?.image) throw new Error("Invalid API response");

      const imgPath = path.join(__dirname, "cache", `${Date.now()}_4k.jpg`);

      const imgRes = await axios.get(res.data.image, {
        responseType: "arraybuffer"
      });

      await fs.ensureDir(path.dirname(imgPath));
      await fs.writeFile(imgPath, imgRes.data);

      await api.sendMessage(
        {
          body: "✅ Image upscaled to 4K successfully!",
          attachment: fs.createReadStream(imgPath)
        },
        event.threadID,
        null,
        event.messageID
      );

      if (processingMsg?.messageID) {
        api.unsendMessage(processingMsg.messageID);
      }

      await fs.remove(imgPath);

    } catch (error) {
      console.error("4k command error:", error);

      if (processingMsg?.messageID) {
        api.unsendMessage(processingMsg.messageID);
      }

      api.sendMessage(
        "❌ Failed to upscale image. Please try again later.",
        event.threadID,
        event.messageID
      );
    }
  }
};
