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
};

export type ApplicationsProvider = (browser: Browser) => Promise<Application[]>;

const sources: ApplicationsProvider[] = [optionCarrierProvider];

export default sources;
