import { type Browser } from "puppeteer";
import optionCarrierProvider from "./optionCarrier";

export type Application = {
  id: string;
  title: string | null;
  link: string;
  location: string | null;
  companyName: string | null;
  date: string | null;
  details: string | null;
  execlude: boolean;
};

export type ApplicationsProvider = (browser: Browser) => Promise<{
  name: string;
  apps: Application[];
}>;

const sources: ApplicationsProvider[] = [optionCarrierProvider];

export default sources;
