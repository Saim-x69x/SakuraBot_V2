module.exports = {
    config: {
        name: "imgbb",
        aliases: [],
        version: "1.0",
        author: "Saimx69x",
        category: "utility",
        countDown: 5,
        role: 0,
        shortDescription: "Upload image/gif/png and get URL",
        longDescription: "Reply to an image/gif/png will upload it to Imgbb and return a URL."
    },

    onStart: async function ({ api, event }) {
        try {
            if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
                return api.sendMessage("❌ Please reply to an image, gif, or png to upload.", event.threadID, event.messageID);
            }

            const attachment = event.messageReply.attachments[0];
            const mediaUrl = attachment.url;

            const axios = require("axios");
            const res = await axios.get(`https://xsaim8x-xxx-api.onrender.com/api/imgbb?url=${encodeURIComponent(mediaUrl)}`);
            const data = res.data;

            if (!data.status) 
                return api.sendMessage("❌ Failed to upload image. Please try again later.", event.threadID, event.messageID);

            return api.sendMessage(`${data.image.display_url}`, event.threadID, event.messageID);

        } catch (err) {
            console.error(err);
            return api.sendMessage("❌ Something went wrong. Please try again later.", event.threadID, event.messageID);
        }
    }
};
