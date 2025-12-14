const a = require("axios");
const f = require("fs");
const p = require("path");

const nix = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

module.exports = {
  config: {
    name: "4k",
    aliases: ["upscale"],
    version: "1.1",
    role: 0,
    author: "ArYAN",
    countDown: 10,
    longDescription: "Upscale images to 4K resolution.",
    category: "image",
    guide: {
      en: "${pn} reply to an image to upscale it to 4K resolution."
    }
  },

  onStart: async function ({ message, event }) {
    if (
      !event.messageReply ||
      !event.messageReply.attachments ||
      !event.messageReply.attachments[0] ||
      event.messageReply.attachments[0].type !== "photo"
    ) {
      return message.reply("📸 Please reply to an image to upscale it.");
    }

    const i = event.messageReply.attachments[0].url;
    const t = p.join(__dirname, "cache", `upscaled_${Date.now()}.png`);
    let m;
    let baseApi;

    try {
      const configRes = await a.get(nix);
      baseApi = configRes.data && configRes.data.api;
      if (!baseApi) throw new Error("Configuration Error: Missing API in GitHub JSON.");

      const apiUrl = `${baseApi}/4k`;
      
      const r = await message.reply("🔄 Processing your image, please wait...");
      m = r.messageID;

      const d = await a.get(`${apiUrl}?imageUrl=${encodeURIComponent(i)}`);
      if (!d.data.status) throw new Error(d.data.message || "API error");

      const x = await a.get(d.data.enhancedImageUrl, { responseType: "stream" });
      const w = f.createWriteStream(t);
      x.data.pipe(w);

      await new Promise((res, rej) => {
        w.on("finish", res);
        w.on("error", rej);
      });

      await message.reply({
        body: "✅ Your 4K upscaled image is ready!",
        attachment: f.createReadStream(t),
      });
    } catch (e) {
      console.error("Upscale Error:", e);
      if (!baseApi) {
        message.reply("❌ Failed to fetch API configuration from GitHub.");
      } else {
        message.reply("❌ An error occurred while upscaling the image. Please try again later.");
      }
    } finally {
      if (m) message.unsend(m);
      if (f.existsSync(t)) f.unlinkSync(t);
    }
  }
};
