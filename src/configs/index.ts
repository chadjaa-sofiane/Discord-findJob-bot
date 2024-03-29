import { z } from "zod";

type EnvConfig = {};

const commonConfigs = {
  discordToken: Bun.env.DISCORD_TOKEN,
  discordGulId: Bun.env.DISCORD_GUILD,
  discordClientId: Bun.env.DISCORD_CLIENT_ID,
};

const configsValidation = z.object({
  discordToken: z.string(),
  discordGulId: z.string(),
  discordClientId: z.string(),
});

type Configs = z.infer<typeof configsValidation>;

const developmentConfigs = {};
const productionConfigs = {};
const testConfigs = {};

const APP_ENV = process.env.BUN_ENV as "development" | "production" | "test";

const envConfigs: Record<typeof APP_ENV, EnvConfig> = {
  development: developmentConfigs,
  production: productionConfigs,
  test: testConfigs,
};

const config = {
  ...(commonConfigs as Configs),
  envConfigs: envConfigs[APP_ENV],
};

configsValidation.parse(config);

export default config;
