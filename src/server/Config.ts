import { getOnlyDate } from "ws-framework/utility";

type ConfigValues = {
  readonly xxx: string;
};

export class Config {
  private static instance: Config | undefined;
  private config: ConfigValues;

  private constructor(overrides?: ConfigValues) {

    const defaultConfig: ConfigValues = {
      xxx: this.getScriptProperty('XXX'),
    };

    this.config = overrides || defaultConfig;
  }

  public static getInstance(overrides?: ConfigValues): Config {
    if (!Config.instance) {
      Config.instance = new Config(overrides);
    }
    return Config.instance;
  }

  private getScriptProperty(key: string): string {
    const value = PropertiesService.getScriptProperties().getProperty(key);
    if (value === null) {
      throw new Error(`Missing script property: ${key}`);
    }
    return value;
  }

  get(key: keyof ConfigValues): any {
    return this.config[key];
  }
}