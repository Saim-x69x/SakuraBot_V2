const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "groupinfo",
    aliases: ["boxinfo"],
    version: "1.0",
    author: "Saimx69x",
    countDown: 5,
    role: 0,
    shortDescription: "View all info about this group",
    longDescription: "Get the full details of your group such as name, ID, member count, gender stats, and admin list.",
    category: "group",
  },

  onStart: async function ({ api, event }) {
    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const memCount = threadInfo.participantIDs.length;
      const genderMale = [];
      const genderFemale = [];
      const genderUnknown = [];
      const adminList = [];

      for (const user of threadInfo.userInfo) {
        const gender = user.gender;
        if (gender === "MALE") genderMale.push(user);
        else if (gender === "FEMALE") genderFemale.push(user);
        else genderUnknown.push(user.name);
      }

      for (const admin of threadInfo.adminIDs) {
        const info = await api.getUserInfo(admin.id);
        adminList.push(info[admin.id].name);
      }

      const approvalMode = threadInfo.approvalMode ? "✅ On" : "❌ Off";
      const emoji = threadInfo.emoji || "👍";
      const imageURL = threadInfo.imageSrc || null;
      const msg = 
`✨ 𝐆𝐑𝐎𝐔𝐏 𝐈𝐍𝐅𝐎 ✨
━━━━━━━━━━━━━━━
🏷️ 𝗡𝗮𝗺𝗲: ${threadInfo.threadName || "Unnamed Group"}
🆔 𝗜𝗗: ${threadInfo.threadID}
💬 𝗘𝗺𝗼𝗷𝗶: ${emoji}
💭 𝗠𝗲𝘀𝘀𝗮𝗴𝗲𝘀: ${threadInfo.messageCount.toLocaleString()}
👥 𝗠𝗲𝗺𝗯𝗲𝗿𝘀: ${memCount}
👨 𝗠𝗮𝗹𝗲𝘀: ${genderMale.length}
👩 𝗙𝗲𝗺𝗮𝗹𝗲𝘀: ${genderFemale.length}
❔ 𝗨𝗻𝗸𝗻𝗼𝘄𝗻: ${genderUnknown.length}
🛡️ 𝗔𝗱𝗺𝗶𝗻 𝗖𝗼𝘂𝗻𝘁: ${threadInfo.adminIDs.length}
🔒 𝗔𝗽𝗽𝗿𝗼𝘃𝗮𝗹 𝗠𝗼𝗱𝗲: ${approvalMode}
━━━━━━━━━━━━━━━
👑 𝗔𝗱𝗺𝗶𝗻𝘀:
${adminList.map(name => `• ${name}`).join("\n")}
━━━━━━━━━━━━━━━
🧠 𝗠𝗮𝗱𝗲 𝗯𝘆 𝐒𝐚𝐢𝐦𝐱𝟔𝟗𝐱 💙`;

      const cachePath = path.join(__dirname, "cache", "groupinfo.jpg");
      fs.ensureDirSync(path.join(__dirname, "cache"));

      if (imageURL) {
        const response = await axios.get(imageURL, { responseType: "arraybuffer" });
        fs.writeFileSync(cachePath, Buffer.from(response.data, "binary"));

        await api.sendMessage(
          {
            body: msg,
            attachment: fs.createReadStream(cachePath),
          },
          event.threadID,
          () => fs.unlinkSync(cachePath),
          event.messageID
        );
      } else {
        await api.sendMessage(msg, event.threadID, event.messageID);
      }

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ An error occurred while fetching group info.", event.threadID, event.messageID);
    }
  },
};
