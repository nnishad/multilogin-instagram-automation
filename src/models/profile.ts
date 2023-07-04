import mongoose, { Schema, Document } from "mongoose";
import { IAccount } from "./account";

interface INavigator {
  userAgent: string;
  resolution: string;
  language: string;
  platform: string;
  doNotTrack: number;
  hardwareConcurrency: number;
}

interface INetworkProxy {
  type: string;
  host: string;
  port: string;
  username: string;
  password: string;
}

interface INetwork {
  proxy: INetworkProxy;
  // dns: string[];
}

interface IPlugins {
  enableVulnerable: boolean;
  enableFlash: boolean;
}

interface ITimezone {
  mode: string;
  fillBasedOnExternalIp: boolean;
  zoneId: string | null;
}

interface IGeolocation {
  mode: string;
  fillBasedOnExternalIp: boolean;
}

interface IAudioContext {
  mode: string;
}

interface ICanvas {
  mode: string;
}

interface IFonts {
  mode: string;
  maskGlyphs: boolean;
  families: string[];
}

interface IMediaDevices {
  mode: string;
  videoInputs: number;
  audioInputs: number;
  audioOutputs: number;
}

interface IWebRTC {
  mode: string;
  fillBasedOnExternalIp: boolean;
  publicIp: string;
  localIps: string[];
}

interface IWebGL {
  mode: string;
}

interface IWebGLMetadata {
  mode: string;
  vendor: string;
  renderer: string;
}

interface IExtensions {
  enable: boolean;
  names: string[];
}

interface IPorts {
  mode: string;
  localPortsExclude: number[];
}

export interface IProfile extends Document {
  uuid: string;
  name: string;
  notes: string;
  googleServices: boolean;
  navigator: INavigator;
  storage: {
    local: boolean;
    extensions: boolean;
    bookmarks: boolean;
    history: boolean;
    passwords: boolean;
  };
  network: INetwork;
  plugins: IPlugins;
  timezone: ITimezone;
  geolocation: IGeolocation;
  audioContext: IAudioContext;
  canvas: ICanvas;
  fonts: IFonts;
  mediaDevices: IMediaDevices;
  webRTC: IWebRTC;
  webGL: IWebGL;
  webGLMetadata: IWebGLMetadata;
  extensions: IExtensions;
  ports: IPorts;
  browser: string;
  os: string;
  accounts: IAccount[];
}

const defaultNavigator: INavigator = {
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
  resolution: "1920x1080",
  language: "en-US",
  platform: "Windows",
  doNotTrack: 0,
  hardwareConcurrency: 4,
};

const defaultStorage = {
  local: true,
  extensions: true,
  bookmarks: true,
  history: true,
  passwords: true,
};

const defaultPlugins: IPlugins = {
  enableVulnerable: false,
  enableFlash: false,
};

const defaultTimezone: ITimezone = {
  mode: "FAKE",
  fillBasedOnExternalIp: true,
  zoneId: null,
};

const defaultGeolocation: IGeolocation = {
  mode: "PROMPT",
  fillBasedOnExternalIp: true,
};

const defaultAudioContext: IAudioContext = {
  mode: "NOISE",
};

const defaultCanvas: ICanvas = {
  mode: "NOISE",
};

const defaultFonts: IFonts = {
  mode: "FAKE",
  maskGlyphs: true,
  families: ["MS Serif", "Segoe UI"],
};

const defaultMediaDevices: IMediaDevices = {
  mode: "FAKE",
  videoInputs: 3,
  audioInputs: 2,
  audioOutputs: 2,
};

const defaultWebGL: IWebGL = {
  mode: "NOISE",
};

const defaultAccounts: IAccount[] = [];

const profileSchema = new Schema<IProfile>({
  uuid: { type: String },
  name: { type: String, required: true },
  notes: { type: String, default: "Default Notes" },
  googleServices: { type: Boolean, default: true },
  navigator: { type: Object, required: true, default: defaultNavigator },
  storage: { type: Object, default: defaultStorage },
  network: { type: Object, required: true },
  plugins: { type: Object, default: defaultPlugins },
  timezone: { type: Object, default: defaultTimezone },
  geolocation: { type: Object, default: defaultGeolocation },
  audioContext: { type: Object, default: defaultAudioContext },
  canvas: { type: Object, default: defaultCanvas },
  fonts: { type: Object, default: defaultFonts },
  mediaDevices: { type: Object, default: defaultMediaDevices },
  webGL: { type: Object, default: defaultWebGL },
  browser: { type: String, required: true, default: "mimic" },
  os: { type: String, required: true, default: "win" },
  accounts: { type: [Object], default: defaultAccounts },
});

const Profile = mongoose.model<IProfile>("Profile", profileSchema);

export default Profile;
