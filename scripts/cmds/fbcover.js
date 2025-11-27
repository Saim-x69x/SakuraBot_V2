const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const cacheDir = path.join(__dirname, "cache");

module.exports = {
  config: {
    name: "fbcover",
    version: "1.0",
    author: "Saimx69x",
    countDown: 5,
    role: 0,
    description: "Generate Facebook Cover",
    category: "image",
    guide: { 
        en: "{pn} name - title - address - email - phone - color\nExample: {pn} Saim x69x - Bot Creator - Dhaka,Bangladesh - hrxnobita3@gmail.com - 01729537xxx - green"
    }
  },

  onStart: async function ({ api, event, args, usersData }) {
    try {

      const input = args.join(" ").split("-");

      if (input.length < 6) {
        return api.sendMessage(
`❌ Wrong format!

Use:
/fbcover name - title - address - email - phone - color

Example:
/fbcover Saim x69x - Bot Creator - Dhaka,Bangladesh - hrxnobita3@gmail.com - 01729xxxxxx - green`,
          event.threadID,
          event.messageID
        );
      }

      const [name, title, address, email, phone, color] = input.map(x => x.trim());

      const avatarURL = await usersData.getAvatarUrl(event.senderID);

      const notice = await api.sendMessage("⏳ Generating your FB cover…", event.threadID, event.messageID);

      const githubRaw = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
      const rawRes = await axios.get(githubRaw);
      const baseUrl = rawRes.data.apiv1;

      const apiURL =
        `${baseUrl}/api/fbcover` +
        `?imageUrl=${encodeURIComponent(avatarURL)}` +
        `&name=${encodeURIComponent(name)}` +
        `&title=${encodeURIComponent(title)}` +
        `&address=${encodeURIComponent(address)}` +
        `&email=${encodeURIComponent(email)}` +
        `&phone=${encodeURIComponent(phone)}` +
        `&color=${encodeURIComponent(color)}`;

      const response = await axios.get(apiURL, {
        responseType: "arraybuffer"
      });

      const imgBuffer = Buffer.from(response.data);

      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, `fbcover_${event.senderID}.png`);
      await fs.writeFile(filePath, imgBuffer);

      api.sendMessage(
        {
          body:
`✅ | Here’s your FB Cover!

👤 Name: ${name}
💼 Title: ${title}
📍 Address: ${address}
📧 Email: ${email}
📞 Phone: ${phone}
🎨 Color: ${color}`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => api.unsendMessage(notice.messageID),
        event.messageID
      );

    } catch (err) {
      console.error("FB Cover Error:", err);
      api.sendMessage("❌ | Oops! Something went wrong. Try again later.", event.threadID, event.messageID);
    }
  }
};