import * as Discord from "discord.js";
import * as Factory from "discord-tsx-factory";
import { Listener } from "discord-tsx-factory/dist/interaction-listener";
import { FunctionComponent } from "discord-tsx-factory/dist/function-component";
import { InteractionType } from "discord-tsx-factory/dist/enums";

import "./declarations";

interface IterableCommandData {
  name: string;
  type: Discord.ApplicationCommandOptionType;
  options?: IterableCommandData[];
}

const originalCreateElement = Factory.createElement;
function setBuilderProperties(builder: any, props: any) {
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
function ElementBuilder(
  props: JSX.IntrinsicInternalElements[JSX.IntrinsicKeys]
): JSX.Element | undefined {
  switch (props._tag) {
    case "slash": {
      if (props.onExecute)
        Factory.setListener(
          `command_slash_${props.name}`,
          new Listener(props.onExecute, InteractionType.Slash)
        );
      const $ = new Discord.SlashCommandBuilder();
      setBuilderProperties($, props);
      if (props.dmPermission) $.setDMPermission(props.dmPermission);
      if (props.defaultMemberPermissions)
        $.setDefaultMemberPermissions(props.defaultMemberPermissions);
      for (const child of props.children.flat(Infinity))
        if (child instanceof Discord.SlashCommandBuilder)
          // slash > slash
          $.addSubcommand((sub) => {
            setBuilderProperties(sub, child);
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
          $.addSubcommandGroup(child);
        } else addOption($, child);
      return $;
    }
    case "group": {
      const $ = new Discord.SlashCommandSubcommandGroupBuilder();
      setBuilderProperties($, props);
      for (const child of props.children.flat(Infinity))
        $.addSubcommand((sub) => {
          setBuilderProperties(sub, child);
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
      return $;
    }
    case "choice":
      props.value ||= props.children?.join("");
      return props as Discord.ApplicationCommandOptionChoiceData;
    case "attachment":
      return setBuilderProperties(
        new Discord.SlashCommandAttachmentOption(),
        props
      );
    case "boolean":
      return setBuilderProperties(
        new Discord.SlashCommandBooleanOption(),
        props
      );
    case "channel":
      return setBuilderProperties(
        new Discord.SlashCommandChannelOption(),
        props
      );
    case "mentionable":
      return setBuilderProperties(
        new Discord.SlashCommandMentionableOption(),
        props
      );
    case "role":
      return setBuilderProperties(new Discord.SlashCommandRoleOption(), props);
    case "user":
      return setBuilderProperties(new Discord.SlashCommandUserOption(), props);
    case "integer":
    case "number": {
      props.choices ||= props.children.flat(Infinity);
      const $ = new Discord.SlashCommandNumberOption();
      if (props.choices.length) $.setChoices(...props.choices);
      return setBuilderProperties($, props);
    }
    case "string": {
      props.choices ||= props.children.flat(Infinity);
      const $ = new Discord.SlashCommandStringOption();
      if (props.choices.length) $.setChoices(...props.choices);
      return setBuilderProperties($, props);
    }
  }
}
require("discord-tsx-factory").createElement = function createElement<
  T extends JSX.IntrinsicKeys
>(
  tag:
    | T
    | typeof Factory.Component
    | FunctionComponent<JSX.IntrinsicElement<T>>,
  props: JSX.IntrinsicElement<T>,
  ...children: JSX.ChildResolvable[T][]
): JSX.Element | Factory.Component | undefined {
  if (!props || !props.children) props = { ...props, children };
  const isElementCreated = originalCreateElement(tag, props, ...children);
  if (isElementCreated) return isElementCreated;
  return ElementBuilder({
    ...props,
    _tag: tag,
  } as JSX.IntrinsicInternalElements[T]);
};
require("discord-tsx-factory").Client = class Client extends Discord.Client {
  private _once: InteractionType[] = [InteractionType.Modal];
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
      function iterateCommandData(sub?: IterableCommandData): void {
        if (!sub || !sub.options) return;
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
  constructor(options: Discord.ClientOptions & { once?: InteractionType[] }) {
    super(options);

    this.on("interactionCreate", this.defaultInteractionCreateListener);
    if (options.once) this._once = [...this._once, ...options.once];
  }
};
