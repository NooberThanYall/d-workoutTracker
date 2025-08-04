import "reflect-metadata";
import TelegramBot from "node-telegram-bot-api";
import { configDotenv } from "dotenv";
import { AppDataSource } from "./data-source";
import AuthService from "./services/authService";
import RecordService from "./services/recordService";

class App {
  private bot: TelegramBot;

  constructor() {
    configDotenv();
    const token = process.env.TOKEN;

    if (!token) {
      throw new Error("No TOKEN found in .env");
    }

    this.bot = new TelegramBot(token, { polling: true });
  }

  public async start() {
    await this.bootstrapDatabase();
    this.registerBotHandlers();
    console.log("Bot is running...");
  }

  private async bootstrapDatabase() {
    try {
      await AppDataSource.initialize();
      console.log("✅ Database initialized!");
      await AppDataSource.runMigrations();
    } catch (err) {
      console.error("❌ Failed to connect DB:", err);
      process.exit(1);
    }
  }

  private registerBotHandlers() {
    this.bot.onText(/\/start/, async (msg) => {
      const tgId = String(msg.from?.id);
      const chatId = String(msg.chat.id);
      const firstName = msg.from?.first_name || "Unknown";

      const auth = new AuthService(this.bot, chatId);
      await auth.signUpUser(tgId, firstName);
    });

    this.bot.onText(/\/addrecord (.+)/, async (msg, match) => {
      const tgId = String(msg.from?.id);
      const chatId = String(msg.chat.id);
      const [exercise, reps, weight] = match?.[1]?.split(" ") || [];

      const record = new RecordService(tgId, chatId, this.bot);
      await record.newRecord(exercise, parseInt(reps), parseInt(weight));
    });

    this.bot.onText(/\/progress (.+)/, async (msg, match) => {
      const tgId = String(msg.from?.id);
      const chatId = String(msg.chat.id);
      const exercise = match?.[1];

      const record = new RecordService(tgId, chatId, this.bot);
      await record.progress(exercise);
    });

    this.bot.onText(/\/progress$/, async (msg) => {
      const tgId = String(msg.from?.id);
      const chatId = String(msg.chat.id);

      const record = new RecordService(tgId, chatId, this.bot);
      await record.progress();
    });
  }
}

new App().start();
