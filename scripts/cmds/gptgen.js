const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "gptgen",
    version: "1.0",
    author: "Saimx69x (Api by Renz)",
    countDown: 5,
    role: 0,
    shortDescription: "Generate or edit images using text prompts",
    longDescription:
      "Generate a new image from a text prompt or edit an existing image by replying to it.",
    category: "ai",
    guide:
      "{p}gptgen <prompt>\n" +
      "{p}gptgen <prompt> (reply to an image to edit it)"
  },

  onStart: async function ({ api, event, args, message }) {
    const repliedImage = event.messageReply?.attachments?.[0];
    const prompt = args.join(" ").trim();

    if (!prompt) {
      return message.reply(
        "Please provide a prompt.\n\nExamples:\n/gptgen a cyberpunk city\n/gptgen make me anime (reply to an image)"
      );
    }

    const processingMsg = await message.reply("Processing your image...");

    const imgPath = path.join(
      __dirname,
      "cache",
      `${Date.now()}_gptgen.png`
    );

    try {
      let apiURL = `https://dev.oculux.xyz/api/gptimage?prompt=${encodeURIComponent(
        prompt
      )}`;

      if (repliedImage && repliedImage.type === "photo") {
        const imgWidth = repliedImage.width;
        const imgHeight = repliedImage.height;

        apiURL += `&ref=${encodeURIComponent(repliedImage.url)}`;

        if (imgWidth && imgHeight) {
          apiURL += `&width=${imgWidth}&height=${imgHeight}`;
        }
      } else {
        apiURL += `&width=512&height=512`;
      }

      const res = await axios.get(apiURL, {
        responseType: "arraybuffer"
      });

      await fs.ensureDir(path.dirname(imgPath));
      await fs.writeFile(imgPath, Buffer.from(res.data));

      await api.unsendMessage(processingMsg.messageID);

      await message.reply({
        body: repliedImage
          ? `Image edited successfully.\nPrompt: ${prompt}`
          : `Image generated successfully.\nPrompt: ${prompt}`,
        attachment: fs.createReadStream(imgPath)
      });
    } catch (error) {
      console.error("GPTGEN Error:", error);
      await api.unsendMessage(processingMsg.messageID);
      message.reply("Failed to process the image. Please try again later.");
    } finally {
      if (fs.existsSync(imgPath)) {
        await fs.remove(imgPath);
      }
    }
  }
};
