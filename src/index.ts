import * as Discord from "discord.js";
import * as Factory from "discord-tsx-factory";

type Writeable<T> = { -readonly [P in keyof T]: T[P] };
type RemoveMethodsAndMakeNameAndDescriptionRequired<T> = Partial<
  Pick<
    T,
    {
      [K in keyof T]: T[K] extends Function ? never : K;
    }[keyof T]
  >
> & {
  name: string;
  description: string;
};
interface IterableCommandData {
  name: string;
  type: Discord.ApplicationCommandOptionType;
  options?: IterableCommandData[];
}

declare module "discord-tsx-factory" {
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
        | Discord.SlashCommandUserOption
        | Discord.SlashCommandBuilder;
      group: Discord.SlashCommandBuilder;
      integer: Discord.ApplicationCommandOptionChoiceData<number>;
      number: Discord.ApplicationCommandOptionChoiceData<number>;
      string: Discord.ApplicationCommandOptionChoiceData<string>;
    }
    interface IntrinsicElements {
      slash: RemoveMethodsAndMakeNameAndDescriptionRequired<
        Omit<
          Discord.SlashCommandBuilder,
          "dm_permission" | "default_member_permissions"
        > & {
          dmPermission: Discord.SlashCommandBuilder["dm_permission"];
          defaultMemberPermissions: Discord.SlashCommandBuilder["default_member_permissions"];
        }
      > & { onExecute?: Factory.CommandInteractionHandler };
      group: RemoveMethodsAndMakeNameAndDescriptionRequired<Discord.SlashCommandSubcommandGroupBuilder>;
      choice: Partial<Discord.ApplicationCommandOptionChoiceData> & {
        name: string;
        value?: string | number;
        children?: (string | number)[];
      };

      attachment: RemoveMethodsAndMakeNameAndDescriptionRequired<Discord.SlashCommandAttachmentOption>;
      boolean: RemoveMethodsAndMakeNameAndDescriptionRequired<Discord.SlashCommandBooleanOption>;
      channel: RemoveMethodsAndMakeNameAndDescriptionRequired<Discord.SlashCommandChannelOption>;
      integer: RemoveMethodsAndMakeNameAndDescriptionRequired<
        Writeable<Discord.SlashCommandIntegerOption>
      >;
      mentionable: RemoveMethodsAndMakeNameAndDescriptionRequired<Discord.SlashCommandMentionableOption>;
      number: RemoveMethodsAndMakeNameAndDescriptionRequired<
        Writeable<Discord.SlashCommandNumberOption>
      >;
      role: RemoveMethodsAndMakeNameAndDescriptionRequired<Discord.SlashCommandRoleOption>;
      string: RemoveMethodsAndMakeNameAndDescriptionRequired<
        Writeable<Discord.SlashCommandStringOption>
      >;
      user: RemoveMethodsAndMakeNameAndDescriptionRequired<Discord.SlashCommandUserOption>;
    }
  }
}

const originalCreateElement = Factory.createElement;
function setNameAndDescription(builder: any, props: any) {
  builder.setName(props.name).setDescription(props.description);
  if (props.name_localizations)
    builder.setNameLocalizations(props.name_localizations);
  if (props.description_localizations)
    builder.setDescriptionLocalizations(props.description_localizations);
  return builder;
}
function addOption(
  element: Discord.SlashCommandBuilder | Discord.SlashCommandSubcommandBuilder,
  option: any
) {
  element.options.push(option);
  return element;
}
require("discord-tsx-factory").createElement = function createElement(
  tag: keyof JSX.IntrinsicElements | Function,
  _props: any,
  ...children: any[]
) {
  const isElementCreated = originalCreateElement(tag, _props, ...children);
  if (isElementCreated) return isElementCreated;
  const props: Exclude<JSX.IntrinsicProps[keyof JSX.IntrinsicProps], string> = {
    ..._props,
    _tag: tag,
    children,
  };
  let element: Discord.SlashCommandBuilder | undefined;
  switch (props._tag) {
    case "slash":
      if (props.onExecute)
        Factory.setListener(
          `command_slash_${props.name}`,
          new Factory.Listener(props.onExecute, Factory.InteractionType.Slash)
        );
      element = new Discord.SlashCommandBuilder();
      setNameAndDescription(element, props);
      if (props.dmPermission) element.setDMPermission(props.dmPermission);
      if (props.defaultMemberPermissions)
        element.setDefaultMemberPermissions(props.defaultMemberPermissions);
      for (const child of props.children.flat(Infinity))
        if (child instanceof Discord.SlashCommandBuilder)
          // slash > slash
          element.addSubcommand((sub) => {
            setNameAndDescription(sub, child);
            const listener = Factory.getListener(`command_slash_${child.name}`);
            if (listener) {
              Factory.deleteListener(`command_slash_${child.name}`);
              Factory.setListener(
                `command_slash_${props.name}_${child.name}`,
                listener
              );
            }
            for (const option of child.options) addOption(sub, option);
            return sub;
          });
        else if (child instanceof Discord.SlashCommandSubcommandGroupBuilder) {
          // slash > group > slash
          for (const option of child.options) {
            const listener = Factory.getListener(
              `command_slash_${child.name}_${option.name}`
            );
            if (listener) {
              Factory.deleteListener(
                `command_slash_${child.name}_${option.name}`
              );
              Factory.setListener(
                `command_slash_${props.name}_${child.name}_${option.name}`,
                listener
              );
            }
          }
          element.addSubcommandGroup(child);
        } else addOption(element, child);
      break;
    case "group":
      const group = new Discord.SlashCommandSubcommandGroupBuilder();
      setNameAndDescription(group, props);
      for (const child of props.children.flat(Infinity))
        group.addSubcommand((sub) => {
          setNameAndDescription(sub, child);
          const listener = Factory.getListener(`command_slash_${child.name}`);
          if (listener) {
            Factory.deleteListener(`command_slash_${child.name}`);
            Factory.setListener(
              `command_slash_${props.name}_${child.name}`,
              listener
            );
          }
          for (const option of child.options) addOption(sub, option);
          return sub;
        });
      return group;
    case "choice":
      props.value ||= props.children.join("");
      return props;
    case "attachment":
      element = setNameAndDescription(
        new Discord.SlashCommandAttachmentOption(),
        props
      );
      break;
    case "boolean":
      element = setNameAndDescription(
        new Discord.SlashCommandBooleanOption(),
        props
      );
      break;
    case "channel":
      element = setNameAndDescription(
        new Discord.SlashCommandChannelOption(),
        props
      );
      break;
    case "mentionable":
      element = setNameAndDescription(
        new Discord.SlashCommandMentionableOption(),
        props
      );
      break;
    case "role":
      element = setNameAndDescription(
        new Discord.SlashCommandRoleOption(),
        props
      );
      break;
    case "user":
      element = setNameAndDescription(
        new Discord.SlashCommandUserOption(),
        props
      );
      break;
    case "integer":
    case "number":
      {
        props.choices ||= props.children.flat(Infinity) || [];
        const option = new Discord.SlashCommandNumberOption();
        if (props.choices.length) option.setChoices(...props.choices);
        element = setNameAndDescription(option, props);
      }
      break;
    case "string":
      {
        props.choices ||= props.children.flat(Infinity) || [];
        const option = new Discord.SlashCommandStringOption();
        if (props.choices.length) option.setChoices(...props.choices);
        element = setNameAndDescription(option, props);
      }
      break;
  }
  return element;
};
class Client extends Discord.Client {
  private _once: Factory.InteractionType[] = [Factory.InteractionType.Modal];
  public readonly defaultInteractionCreateListener = (
    interaction: Discord.Interaction
  ) => {
    if ("customId" in interaction) {
      const interactionListener = Factory.getListener(interaction.customId);
      if (!interactionListener) return;
      interactionListener.listener(interaction, () =>
        Factory.deleteListener(interaction.customId)
      );
      if (
        (this._once.includes(interactionListener.type) &&
          interactionListener.once !== false) ||
        interactionListener.once
      )
        Factory.deleteListener(interaction.customId);
    }
    if (interaction.isCommand()) {
      const data = interaction.options.data[0];
      let id = `command_slash_${interaction.commandName}`;
      function iterateCommandData(sub: IterableCommandData): void {
        if (!sub.options) return;
        id += `_${sub.name}`;
        switch (sub.type) {
          case 1:
            return;
          case 2:
            return iterateCommandData(sub.options[0]);
        }
      }
      iterateCommandData(data);
      const interactionListener = Factory.getListener(id);
      if (!interactionListener) return;
      interactionListener.listener(interaction);
    }
  };
  constructor(
    options: Discord.ClientOptions & { once?: Factory.InteractionType[] }
  ) {
    super(options);

    this.on("interactionCreate", this.defaultInteractionCreateListener);
    if (options.once) this._once = [...this._once, ...options.once];
  }
}
require("discord-tsx-factory").Client = Client;
