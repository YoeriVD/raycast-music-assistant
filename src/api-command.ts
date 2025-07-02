import { EventType } from "./interfaces";
import { MusicAssistantApi } from "./music-assistant-api";

import "./polyfills";

export default function executeApiCommand<T>(host: string, command: (api: MusicAssistantApi) => Promise<T>) {
  const api = new MusicAssistantApi();

  return new Promise<T>((res, rej) => {
    api.subscribe_multi([EventType.CONNECTED, EventType.Error], async (eventData: any) => {
      try {
        if (eventData.event === EventType.Error) {
          console.log("[API COMMAND]", eventData);
          rej(eventData.data);
        } else {
          const result = await command(api);
          res(result);
        }
      } catch (error: any) {
        rej(error);
      } finally {
        api.close();
      }
    });
    try {
      api.initialize(host);
    } catch (error) {
      rej(error);
    }
  });
}
