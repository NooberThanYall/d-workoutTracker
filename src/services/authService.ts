import TelegramBot from "node-telegram-bot-api";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Repository } from "typeorm";

class AuthService {
  private bot: TelegramBot;
  private chatId: string;
  private userRepo: Repository<User>;

  constructor(bot: TelegramBot, chatId: string) {
    this.bot = bot;
    this.chatId = chatId;
    this.userRepo = AppDataSource.getRepository(User);
  }

  async checkAuthentication(tgId: string) {
    const user = await this.userRepo.findOne({ where: { tgId } });

    if (!user) {
      await this.bot.sendMessage(this.chatId, "You gotta sign in with /start", {
        reply_markup: {
          keyboard: [[{ text: "/start" }]], // Fix: Proper typing
        },
      });
      return null;
    }

    return user;
  }

  async signUpUser(tgId: string, firstName: string) {
    const userAlrExists = await this.userRepo.findOne({ where: { tgId } });

    if (userAlrExists) {
      await this.bot.sendMessage(
        this.chatId,
        "You're already registered! Use:\n/addrecord [exercise] [reps] [weight]\n/progress [exercise]"
      );
      return null;
    }

    const newUser = await this.userRepo.save({ tgId, firstName });
    await this.bot.sendMessage(this.chatId, "Welcome, you're registered! 🎉");

    return newUser;
  }
}

export default AuthService;