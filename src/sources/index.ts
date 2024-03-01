import { type Browser } from "puppeteer";
import optionCarrierProvider from "./optionCarrier";

export type ApplicationsProvider = (browser: Browser) => Promise<
  {
    id: string;
    link: string;
    date: Date;
    description: string;
  }[]
>;

const sources: ApplicationsProvider[] = [optionCarrierProvider];

export default sources;
