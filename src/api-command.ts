import { getPreferenceValues } from "@raycast/api";
import { EventType } from "./interfaces";
import { MusicAssistantApi } from "./music-assistant-api";

import WS from "isomorphic-ws"; // polyfill for isomorphic ws
import { Prefs } from "./preferences";
globalThis.WebSocket = globalThis.WebSocket || WS; // set global WebSocket to the polyfill

const { host } = getPreferenceValues<Prefs>();

export default function executeApiCommand<T>(command: (api: MusicAssistantApi) => Promise<T>) {
  const api = new MusicAssistantApi();
  return new Promise<T>((res, rej) => {
    api.subscribe(EventType.CONNECTED, async () => {
      try {
        const result = await command(api);
        res(result);
      } catch (error) {
        rej(error);
      } finally {
        api.close();
      }
    });
    api.initialize(host);
  });
}
