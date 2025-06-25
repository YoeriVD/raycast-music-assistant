import { getPreferenceValues } from "@raycast/api";
import { MusicAssistantApi } from "./music-assistant-api";
import { Prefs } from "./preferences";

import WS from "isomorphic-ws"; // polyfill for isomorphic ws
import { EventType } from "./interfaces";
globalThis.WebSocket = globalThis.WebSocket || WS; // set global WebSocket to the polyfill

export default async function main() {
  const { host, playerId, debug } = getPreferenceValues<Prefs>();
  const api = new MusicAssistantApi(debug);

  return new Promise(async (res) => {
    api.subscribe(EventType.CONNECTED, async () => {
      api.playerCommandNext(playerId);
      api.close();
      res(null);
    });
    await api.initialize(host);
  })

}
