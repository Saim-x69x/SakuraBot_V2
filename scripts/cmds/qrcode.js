const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "qrcode",
    aliases: ["qr"],
    version: "2.0",
    author: "Saimx69x",
    countDown: 5,
    role: 0,
    shortDescription: "Make or scan QR code",
    longDescription: "Generate QR code from text or scan QR from image (reply or link)",
    category: "tools",
    guide: {
      en: "{pn} make <text>\n{pn} scan <image_url or reply image>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;
    const action = args[0];

    if (!action)
      return api.sendMessage(
        "🌀 Usage:\n• qrcode make <text>\n• qrcode scan <image_url or reply image>",
        threadID,
        messageID
      );

    // === MAKE QR ===
    if (action === "make") {
      const text = args.slice(1).join(" ");
      if (!text)
        return api.sendMessage("❌ Please provide text to generate QR.", threadID, messageID);

      try {
        const url = `https://xsaim8x-xxx-api.onrender.com/api/qrmake?text=${encodeURIComponent(text)}`;
        const imgPath = path.join(__dirname, "cache", `qr_${Date.now()}.png`);
        const img = (await axios.get(url, { responseType: "arraybuffer" })).data;
        await fs.outputFile(imgPath, img);

        api.sendMessage(
          {
            body: `✅ QR generated successfully!\n📄 Text: ${text}`,
            attachment: fs.createReadStream(imgPath),
          },
          threadID,
          () => fs.unlinkSync(imgPath),
          messageID
        );
      } catch (err) {
        console.error(err);
        api.sendMessage("❌ Failed to generate QR code.", threadID, messageID);
      }
    }

    // === SCAN QR ===
    else if (action === "scan") {
      let imageUrl = args.slice(1).join(" ");
      if (messageReply?.attachments?.length > 0 && messageReply.attachments[0].type === "photo") {
        imageUrl = messageReply.attachments[0].url;
      }

      if (!imageUrl)
        return api.sendMessage("📸 Please provide an image URL or reply to an image with QR.", threadID, messageID);

      const url = `https://xsaim8x-xxx-api.onrender.com/api/qrscan?url=${encodeURIComponent(imageUrl)}`;

      try {
        const res = await axios.get(url);
        if (res.data?.decoded)
          return api.sendMessage(`🔍 QR Scan Result:\n${res.data.decoded}`, threadID, messageID);
        else
          return api.sendMessage("⚠️ No valid QR code found.", threadID, messageID);
      } catch (err) {
        console.error(err);
        api.sendMessage("❌ Failed to scan QR code.", threadID, messageID);
      }
    }

    // === INVALID OPTION ===
    else {
      api.sendMessage(
        "❌ Invalid option.\nUse:\n• qrcode make <text>\n• qrcode scan <image_url or reply image>",
        threadID,
        messageID
      );
    }
  },
};
