import * as Discord from "discord.js";
import * as Factory from "../../discord-tsx-factory";

interface Listenable {
  readonly once?: boolean;
}
class Listener implements Listenable {
  public readonly once?: boolean;
  public readonly listener: Function;
  public readonly type: Factory.InteractionType;
  constructor(
    listener: Function,
    type: Factory.InteractionType,
    once?: boolean
  ) {
    this.listener = listener;
    this.type = type;
    this.once = once;
  }
}

declare module "../../discord-tsx-factory" {
  export enum InteractionType {
    Slash,
  }
  export type CommandInteractionHandler = (
    interaction: Discord.CommandInteraction
  ) => any;
}

declare global {
  namespace JSX {
    interface ChildrenResolvable {
      slash:
        | Discord.SlashCommandAttachmentOption
        | Discord.SlashCommandBooleanOption
        | Discord.SlashCommandChannelOption
        | Discord.SlashCommandIntegerOption
        | Discord.SlashCommandMentionableOption
        | Discord.SlashCommandNumberOption
        | Discord.SlashCommandRoleOption
        | Discord.SlashCommandStringOption
        | Discord.SlashCommandUserOption;
    }
    interface IntrinsicElements {
      slash: {
        name: string;
        discription: string;
        onExecute?: Factory.CommandInteractionHandler;
      };
      attachment: Discord.SlashCommandAttachmentOption;
      boolean: Discord.SlashCommandBooleanOption;
      channel: Discord.SlashCommandChannelOption;
      integer: Discord.SlashCommandIntegerOption;
      mentionable: Discord.SlashCommandMentionableOption;
      number: Discord.SlashCommandNumberOption;
      role: Discord.SlashCommandRoleOption;
      string: Discord.SlashCommandStringOption;
      user: Discord.SlashCommandUserOption;
    }
  }
}

const _ = Factory.ElementBuilder;
function ElementBuilder(
  props: Exclude<JSX.IntrinsicProps[keyof JSX.IntrinsicProps], string>
) {
  let element: Discord.SlashCommandBuilder | undefined;
  switch (props._tag) {
    case "slash":
      if (props.onExecute)
        Factory.setHandler(
          `command_slash_${props.name}`,
          new Listener(props.onExecute, Factory.InteractionType.Slash)
        );
      element = new Discord.SlashCommandBuilder()
        .setName(props.name)
        .setDescription(props.discription);
      for (const child of props.children)
        switch (child.type) {
          case Discord.ApplicationCommandOptionType.Attachment:
            element.addAttachmentOption(child);
            break;
          case Discord.ApplicationCommandOptionType.Boolean:
            element.addBooleanOption(child);
            break;
          case Discord.ApplicationCommandOptionType.Channel:
            element.addChannelOption(child);
            break;
          case Discord.ApplicationCommandOptionType.Integer:
            element.addIntegerOption(child);
            break;
          case Discord.ApplicationCommandOptionType.Mentionable:
            element.addMentionableOption(child);
            break;
          case Discord.ApplicationCommandOptionType.Number:
            element.addNumberOption(child);
            break;
          case Discord.ApplicationCommandOptionType.Role:
            element.addRoleOption(child);
            break;
          case Discord.ApplicationCommandOptionType.String:
            element.addStringOption(child);
            break;
          case Discord.ApplicationCommandOptionType.User:
            element.addUserOption(child);
            break;
        }
      break;
    case "attachment":
    case "boolean":
    case "channel":
    case "integer":
    case "mentionable":
    case "number":
    case "role":
    case "string":
    case "user":
      return props;
    default:
      return _(props);
  }
  return element;
}
Object.assign(Factory.ElementBuilder, ElementBuilder);
