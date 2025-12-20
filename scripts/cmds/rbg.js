const axios = require("axios");

module.exports = {
  config: {
    name: "rbg",
    version: "1.0",
    author: "Saimx69x (Api by Fahim)",
    category: "image",
    shortDescription: "Remove background from image",
    longDescription: "Removes background from replied or attached image",
    guide: "{pn} (reply to image)"
  },

  onStart: async function ({ api, event }) {
    try {
      let imageUrl = "";

      if (
        event.type === "message_reply" &&
        event.messageReply &&
        event.messageReply.attachments &&
        event.messageReply.attachments.length
      ) {
        imageUrl = event.messageReply.attachments[0].url;
      } 
      else if (event.attachments && event.attachments.length) {
        imageUrl = event.attachments[0].url;
      } 
      else {
        return api.sendMessage("❌ Please reply to or attach an image.", event.threadID, event.messageID);
      }

      const processingMsg = await api.sendMessage(
        "⏳ Processing your image, please wait...",
        event.threadID,
        null,
        event.messageID
      );

      const apiUrl = `https://free-goat-api.onrender.com/rbg?url=${encodeURIComponent(imageUrl)}`;
      const response = await axios({
        method: "GET",
        url: apiUrl,
        responseType: "stream"
      });

      await api.sendMessage(
        {
          body: "✅ Background removed successfully!",
          attachment: response.data
        },
        event.threadID,
        null,
        event.messageID
      );

      if (processingMsg && processingMsg.messageID) {
        api.unsendMessage(processingMsg.messageID);
      }

    } catch (error) {
      console.error("rbg command error:", error);

      if (processingMsg && processingMsg.messageID) {
        api.unsendMessage(processingMsg.messageID);
      }

      return api.sendMessage("❌ Failed to remove background. Please try again later.", event.threadID, event.messageID);
    }
  }
};
