import * as Discord from "discord.js";
import "discord-tsx-factory/dist/declarations";

import { OptionToElementProps, Writeable } from "./utils";

declare global {
  type CommandInteractionHandler = (
    interaction: Discord.CommandInteraction
  ) => void;
  namespace JSX {
    interface ChildResolvable {
      slash:
        | Discord.SlashCommandAttachmentOption
        | Discord.SlashCommandBooleanOption
        | Discord.SlashCommandChannelOption
        | Discord.SlashCommandIntegerOption
        | Discord.SlashCommandMentionableOption
        | Discord.SlashCommandNumberOption
        | Discord.SlashCommandRoleOption
        | Discord.SlashCommandStringOption
        | Discord.SlashCommandUserOption
        | Discord.SlashCommandBuilder;
      group: Discord.SlashCommandBuilder;
      choice: never;

      attachment: never;
      boolean: never;
      channel: never;
      integer: Discord.ApplicationCommandOptionChoiceData<number>;
      mentionable: never;
      number: Discord.ApplicationCommandOptionChoiceData<number>;
      role: never;
      string: Discord.ApplicationCommandOptionChoiceData<string>;
      user: never;
    }
    interface IntrinsicProps {
      slash: OptionToElementProps<
        Omit<
          Discord.SlashCommandBuilder,
          "contexts" | "default_member_permissions"
        > & {
          contexts: Discord.SlashCommandBuilder["contexts"];
          defaultMemberPermissions: Discord.SlashCommandBuilder["default_member_permissions"];
        }
      > & { onExecute?: /*Discord.*/ CommandInteractionHandler };
      group: OptionToElementProps<Discord.SlashCommandSubcommandGroupBuilder>;
      choice: Partial<Discord.ApplicationCommandOptionChoiceData> & {
        name: string;
        value?: string | number;
        children?: (string | number)[];
      };

      attachment: OptionToElementProps<Discord.SlashCommandAttachmentOption>;
      boolean: OptionToElementProps<Discord.SlashCommandBooleanOption>;
      channel: OptionToElementProps<Discord.SlashCommandChannelOption>;
      integer: OptionToElementProps<
        Writeable<Discord.SlashCommandIntegerOption>
      >;
      mentionable: OptionToElementProps<Discord.SlashCommandMentionableOption>;
      number: OptionToElementProps<Writeable<Discord.SlashCommandNumberOption>>;
      role: OptionToElementProps<Discord.SlashCommandRoleOption>;
      string: OptionToElementProps<Writeable<Discord.SlashCommandStringOption>>;
      user: OptionToElementProps<Discord.SlashCommandUserOption>;
    }
    interface Rendered {
      slash: Discord.SlashCommandBuilder;
      group: Discord.SlashCommandSubcommandGroupBuilder;
      choice: Discord.ApplicationCommandOptionChoiceData;

      attachment: Discord.SlashCommandAttachmentOption;
      boolean: Discord.SlashCommandBooleanOption;
      channel: Discord.SlashCommandChannelOption;
      integer: Discord.SlashCommandNumberOption;
      mentionable: Discord.SlashCommandMentionableOption;
      number: Discord.SlashCommandNumberOption;
      role: Discord.SlashCommandRoleOption;
      string: Discord.SlashCommandStringOption;
      user: Discord.SlashCommandUserOption;
    }
  }
}

declare module "discord.js" {
  export type CommandInteractionHandler = (
    interaction: Discord.CommandInteraction
  ) => void;
}

declare module "discord-tsx-factory/dist/enums" {
  export enum InteractionType {
    Slash,
  }
}
