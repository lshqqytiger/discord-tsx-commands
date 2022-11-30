<a href="https://www.npmjs.com/package/discord-tsx-commands"><img src="https://img.shields.io/npm/v/discord-tsx-commands.svg?maxAge=3600" alt="npm version" /></a>

# About

Write Discord.js commands in tsx.

`discord-tsx-commands` requires `discord-tsx-factory` and `discord.js`.

`discord-tsx-commands` is compatible with `discord-tsx-factory` version `0.2.13` and `discord.js` version `14.7.0`. (See `peerDependencies`)

```tsx
import { createElement, Fragment, Client } from "discord-tsx-factory";
import * as Discord from "discord.js";
import "discord-tsx-commands"; // this line expands discord-tsx-factory.

const client = new Client(...);
```

# Installation

Using npm

```bash
$ npm install --save discord.js@14.7.0 discord-tsx-factory discord-tsx-commands
```

Using yarn

```bash
$ yarn add discord.js@14.7.0 discord-tsx-factory discord-tsx-commands
```

You need to modify your tsconfig.json to use `discord-tsx-factory`:

```json
{
  "compilerOptions": {
    ...
    "jsx": "react",
    "jsxFactory": "createElement",
    "jsxFragmentFactory": "Fragment",
    ...
  },
  ...
}
```

# Example usage

## Slash Commands

### Without group and subcommand

```tsx
import * as Discord from "discord.js";
import {
  createElement,
  Fragment,
  Client,
  InteractionType,
} from "discord-tsx-factory";
import "discord-tsx-commands";

const client = new Client({
  intents: [Discord.IntentsBitField.Flags.Guilds],
});

client.on("ready", () => {
  const commands: Discord.SlashCommandBuilder[] = [
    <slash
    name="command"
    description="your command"
    onExecute={() => console.log("command executed!")}
    >
      <user name="user" description="your user" required />
      <role name="role" description="your role" required />
    </slash>
  ];
  client.rest.put(Discord.Routes.applicationCommands(client.application!.id!), {
    body: commands.map((command) => command.toJSON()),
  });
});
client.login(...);
```

### With subcommand

There's no special element for subcommand.

Just use `slash`.

```tsx
client.on("ready", () => {
  const commands: Discord.SlashCommandBuilder[] = [
    <slash name="command" description="your command">
      <slash
        name="subcommand1"
        description="your sub command1"
        onExecute={(command) => console.log("sub command1 executed!")}
      >
        <string name="string" description="your string" required />
        <string name="select" description="your string select">
          <choice name="choice1">choice1</choice>
          <choice name="choice2" value="choice2" />
        </string>
      </slash>

      <slash
        name="subcommand2"
        description="your sub command2"
        onExecute={() => console.log("sub command2 executed!")}
      >
        <user name="user" description="your user" required />
        <role name="role" description="your role" required />
      </slash>
    </slash>,
  ];
  client.rest.put(Discord.Routes.applicationCommands(client.application!.id!), {
    body: commands.map((command) => command.toJSON()),
  });
});
```

### With group and subcommand

```tsx
client.on("ready", () => {
  const commands: Discord.SlashCommandBuilder[] = [
    <slash name="command" description="your command">
      <group name="sub1" description="sub1">
        <slash
          name="sub2_1"
          description="sub2_1"
          onExecute={() => console.log("sub2_1 executed")}
        />
        <slash
          name="sub2_2"
          description="sub2_2"
          onExecute={() => console.log("sub2_2 executed")}
        />
      </group>
    </slash>,
  ];
  client.rest.put(Discord.Routes.applicationCommands(client.application!.id!), {
    body: commands.map((command) => command.toJSON()),
  });
});
```

# License

MIT License

Copyright (c) 2022 이승훈
