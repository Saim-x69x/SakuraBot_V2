const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

module.exports = {
  config: {
    name: "v2a",
    aliases: ["video2audio"],
    version: "2.0",
    author: "Saimx69x",
    countDown: 15,
    role: 0,
    description: "Convert replied video to MP3 audio file",
    category: "media",
    guide: {
      en: "{pn} — reply to a video to extract MP3 audio"
    }
  },

  onStart: async function ({ api, event, message }) {
    try {
     
      if (!event.messageReply || !event.messageReply.attachments?.length)
        return message.reply("🎥 Please reply to a video to convert it into MP3 audio.");

      const attachment = event.messageReply.attachments[0];
      if (attachment.type !== "video")
        return message.reply("⚠️ The replied content must be a video file!");

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const videoPath = path.join(cacheDir, `v2a_${Date.now()}.mp4`);
      const audioPath = path.join(cacheDir, `v2a_${Date.now()}.mp3`);

      const convertingMsg = await message.reply("🎧 Converting video to audio... Please wait a moment ⏳");

      const { data } = await axios.get(attachment.url, { responseType: "arraybuffer" });
      await fs.writeFile(videoPath, Buffer.from(data));

      await new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .noVideo()
          .audioCodec("libmp3lame")
          .audioBitrate("192k")
          .on("end", resolve)
          .on("error", reject)
          .save(audioPath);
      });

      await api.sendMessage(
        {
          body: "✅ Conversion complete!\n🎵 Here's your audio:",
          attachment: fs.createReadStream(audioPath)
        },
        event.threadID,
        async (err) => {
          if (err) console.error(err);
          await fs.remove(videoPath);
          await fs.remove(audioPath);

          if (convertingMsg?.messageID) {
            setTimeout(() => {
              api.unsendMessage(convertingMsg.messageID);
            }, 1500);
          }
        },
        event.messageID
      );

    } catch (err) {
      console.error(err);
      message.reply("❌ Error: Failed to convert video to MP3.\nPlease try again later.");
    }
  }
};
