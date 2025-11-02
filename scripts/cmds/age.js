const axios = require("axios");
const moment = require("moment");

module.exports = {
  config: {
    name: "age",
    aliases: ["agecalc", "agecalculator"],
    version: "1.0",
    author: "Saimx69x",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Calculate age from birth date" },
    longDescription: { en: "Fetches exact age, total time alive, and next birthday." },
    category: "utility",
    guide: { en: "{pn} DD-MM-YYYY" }
  },

  onStart: async function({ message, args }) {
    
    const bold = (text) => text.split('').map(c => {
      if (c >= 'A' && c <= 'Z') return String.fromCodePoint(c.charCodeAt(0) + 0x1D400 - 65);
      if (c >= 'a' && c <= 'z') return String.fromCodePoint(c.charCodeAt(0) + 0x1D41A - 97);
      if (c >= '0' && c <= '9') return String.fromCodePoint(c.charCodeAt(0) + 0x1D7CE - 48);
      return c;
    }).join('');

    try {
      if (!args[0]) {
        return message.reply(`${bold("⚠️ Please provide your birth date!")}\n\n📝 ${bold("Example:")} \n${bold("/age 15-03-2008")}`);
      }

      const inputDate = args[0];
      const birthDate = moment(inputDate, "DD-MM-YYYY", true);

      if (!birthDate.isValid()) {
        return message.reply(`${bold("❌ Invalid date format!")} \n${bold("Please use: DD-MM-YYYY")} \n${bold("Example: /age 15-03-2008")}`);
      }

      const githubRawUrl = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json"; 
      const apiRes = await axios.get(githubRawUrl);
      const baseUrl = apiRes.data.apiv1;
      const apiBirthDate = birthDate.format("YYYY-MM-DD");

      const url = `${baseUrl}/api/age?birthDate=${apiBirthDate}`;
      const res = await axios.get(url);

      if (!res.data || !res.data.message) {
        return message.reply(`${bold("❌ Opps! Something went wrong. Please try again later.")}`);
      }

      return message.reply(res.data.message);

    } catch (err) {
      console.error("❌ /age command error:", err);
      return message.reply(`${bold("❌ Opps! Something went wrong. Please try again later.")}`);
    }
  }
};
