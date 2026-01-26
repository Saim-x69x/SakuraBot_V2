const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const apiUrl = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";

async function getApiUrl() {
  const res = await axios.get(apiUrl);
  return res.data.apiv3;
}

async function urlToBase64(url) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(res.data).toString("base64");
}

module.exports = {
  config: {
    name: "edit",
    version: "1.0",
    author: "Saimx69x (Api by Kay)",
    countDown: 5,
    role: 0,
    shortDescription: "Edit an image using text prompt",
    longDescription: "Only edits an existing image. Must reply to an image.",
    category: "ai",
    guide: "{p}edit <prompt> (reply to an image)"
  },

  onStart: async function ({ api, event, args, message }) {
    const repliedImage = event.messageReply?.attachments?.[0];
    const prompt = args.join(" ").trim();

    if (!repliedImage || repliedImage.type !== "photo") {
      return message.reply(
        "❌ Please reply to an image to edit it.\n\nExample:\n/edit make it anime style"
      );
    }

    if (!prompt) {
      return message.reply("❌ Please provide an edit prompt.");
    }

    const processingMsg = await message.reply("🖌️ Editing image...");

    const imgPath = path.join(
      __dirname,
      "cache",
      `${Date.now()}_edit.jpg`
    );

    try {
      const API_URL = await getApiUrl();

      const payload = {
        prompt: `Edit the given image based on this description:\n${prompt}`,
        images: [await urlToBase64(repliedImage.url)],
        format: "jpg"
      };

      const res = await axios.post(API_URL, payload, {
        responseType: "arraybuffer",
        timeout: 180000
      });

      await fs.ensureDir(path.dirname(imgPath));
      await fs.writeFile(imgPath, Buffer.from(res.data));

      await api.unsendMessage(processingMsg.messageID);

      await message.reply({
        body: `✅ Image edited successfully\nPrompt: ${prompt}`,
        attachment: fs.createReadStream(imgPath)
      });

    } catch (error) {
      console.error("EDIT Error:", error?.response?.data || error.message);
      await api.unsendMessage(processingMsg.messageID);
      message.reply("❌ Failed to edit image. Try again later.");
    } finally {
      if (fs.existsSync(imgPath)) {
        await fs.remove(imgPath);
      }
    }
  }
};
