/* eslint-disable @typescript-eslint/no-explicit-any */

import { getPreferenceValues, Icon, MenuBarExtra } from "@raycast/api";
import WS from "isomorphic-ws"; // polyfill for isomorphic ws
globalThis.WebSocket = globalThis.WebSocket || WS; // set global WebSocket to the polyfill

import { useEffect, useRef, useState } from "react";
import { MusicAssistantApi } from "./music-assistant-api";
import { EventType } from "./interfaces";
import { Prefs } from "./preferences";

export default function Command() {
  const { host, playerId, debug } = getPreferenceValues<Prefs>();

  const [isLoading, setIsLoading] = useState(true);
  const [songTitle, setSongTitle] = useState<string>("");
  const api = useRef<MusicAssistantApi | null>(null);

  function log(...args: any[]) {
    if (debug) {
      console.log("[Menu Bar]", ...args);
    }
  }

  useEffect(() => {
    const initApi = async () => {
      api.current = new MusicAssistantApi(debug);
      await api.current.initialize(host);

      api.current.subscribe(EventType.CONNECTED, async () => {
        log("Connected, let's get the player details..");
        setIsLoading(false);
        const player = await api.current!.getPlayer(playerId);
        const label = `${player.current_media?.artist} - ${player.current_media?.title}`;
        setSongTitle(label);
      });
      api.current.subscribe(
        EventType.QUEUE_UPDATED,
        async (data: { data: { queue_id: string; current_item: { name: string } } }) => {
          log("Queue updated", data);
          if (data.data.queue_id.toLowerCase() !== playerId.toLowerCase()) {
            log("other player, do nothing..", data.data.queue_id);
            return;
          } else log("Player matched, updating title to", data.data.current_item.name);
          setSongTitle(data.data.current_item.name);
        },
      );
    };
    initApi();
    return () => api.current?.close();
  }, [host, playerId, debug]);

  return <MenuBarExtra icon={Icon.SpeakerOn} isLoading={isLoading} title={songTitle}></MenuBarExtra>;
}
