import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { Command } from "./ping";
import { getAllUserSettings } from "../../../redis/redisUtils";

const techsCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("techs")
    .setDescription("List the technologies each user have"),
  async execute(interaction: CommandInteraction) {
    const usersSettings = getAllUserSettings();
    await interaction.reply(
      JSON.stringify(
        Object.fromEntries(
          Object.entries(usersSettings).map(([key, value]) => [
            key,
            value.technologies,
          ]),
        ),
      ),
    );
  },
};

export default techsCommand;
