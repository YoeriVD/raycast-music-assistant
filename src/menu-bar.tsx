import { Icon, MenuBarExtra } from "@raycast/api";
import { useLocalStorage, usePromise } from "@raycast/utils";
import { PlayerState } from "./interfaces";
import { MusicAssistantClient } from "./music-assistant-client";

export default function Command() {
  const client = new MusicAssistantClient();
  const { isLoading, data: players, revalidate: revalidatePlayers } = usePromise(() => client.getActivePlayers(), []);
  const {
    value: selectedPlayerID,
    setValue: setSelectedPlayerID,
    isLoading: isLoadingPlayerId,
  } = useLocalStorage("selectedPlayerID", players && players.length > 0 ? players[0].player_id : "");

  const selectedPlayer = players && players.find((p) => p.player_id === selectedPlayerID);

  return (
    <MenuBarExtra icon="logo.png" isLoading={isLoading && isLoadingPlayerId} title={selectedPlayer?.menuBarText}>
      {players &&
        players.map(({ state, player_id, menuBarText }) => (
          <MenuBarExtra.Section title={menuBarText} key={player_id}>
            <MenuBarExtra.Item title={menuBarText} onAction={() => setSelectedPlayerID(player_id)}></MenuBarExtra.Item>
            <MenuBarExtra.Item
              title="Next"
              icon={Icon.ArrowRight}
              onAction={() => client.next(player_id)}
            ></MenuBarExtra.Item>
            <MenuBarExtra.Item
              title={state == PlayerState.PLAYING ? "Pause" : "Play"}
              icon={state == PlayerState.PLAYING ? Icon.Pause : Icon.Play}
              onAction={() => client.togglePlayPause(player_id)}
            ></MenuBarExtra.Item>
          </MenuBarExtra.Section>
        ))}
      <MenuBarExtra.Section>
        <MenuBarExtra.Item
          title="Refresh"
          icon={Icon.RotateAntiClockwise}
          onAction={revalidatePlayers}
        ></MenuBarExtra.Item>
      </MenuBarExtra.Section>
    </MenuBarExtra>
  );
}
