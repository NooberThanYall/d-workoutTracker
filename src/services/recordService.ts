import TelegramBot from "node-telegram-bot-api";
import AuthService from "./authService";
import { Repository } from "typeorm";
import { Record } from "../entity/Record";
import { AppDataSource } from "../data-source";

class RecordService {
  private tgId: string;
  private chatId: string;
  private bot: TelegramBot;
  private recordRepo: Repository<Record>;

  constructor(tgId: string, chatId: string, bot: TelegramBot) {
    this.tgId = tgId;
    this.chatId = chatId;
    this.bot = bot;
    this.recordRepo = AppDataSource.getRepository(Record);
  }

  async newRecord(exercise: string, reps: number, weight: number) {
    try {
      if (!exercise || !reps || !weight || reps <= 0 || weight <= 0) {
        await this.bot.sendMessage(
          this.chatId,
          "Yo, gotta fill in all fields with valid numbers! (e.g., /addRecord bench 10 100)"
        );
        return;
      }

      const as = new AuthService(this.bot, this.chatId);
      const user = await as.checkAuthentication(this.tgId);

      if (!user) {
        return;
      }

      await this.recordRepo.save({
        user,
        exercise: exercise.toLowerCase(),
        reps,
        weight,
      });

      const prevRecords = await this.recordRepo.find({
        where: { user: { id: user.id }, exercise: exercise.toLowerCase() },
        order: { createdAt: "DESC" },
        take: 3,
      });

      await this.bot.sendMessage(
        this.chatId,
        `Record added! 🏋️‍♂️\n\nLast 3 for ${exercise}:\n${
          prevRecords.length
            ? prevRecords
                .map(
                  (r) =>
                    `${r.reps} x ${r.weight}kg on ${r.createdAt.toLocaleString(
                      "fa-IR"
                    )}`
                )
                .join("\n")
            : "No previous records."
        }`
      );
    } catch (error) {
      await this.bot.sendMessage(this.chatId, "Error adding record!");
      console.error("Error in newRecord:", error);
    }
  }

  async progress(exercise?: string) {
    try {
      const as = new AuthService(this.bot, this.chatId);
      const user = await as.checkAuthentication(this.tgId);

      if (!user) {
        return;
      }

      const where: { user: { id: string }; exercise?: string } = {
        user: { id: user.id },
      };
      if (exercise) {
        where.exercise = exercise.toLowerCase();
      }

      const records = await this.recordRepo.find({ where });

      const volume = records.reduce((sum, r) => sum + r.weight * r.reps, 0);

      await this.bot.sendMessage(
        this.chatId,
        `Total volume for ${exercise || "all exercises"}: ${volume} kg 💪`
      );

      return volume;
    } catch (error) {
      await this.bot.sendMessage(this.chatId, "Error calculating progress!");
      console.error("Error in progress:", error);
    }
  }
}

export default RecordService;
