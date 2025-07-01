import { getPreferenceValues, Icon, MenuBarExtra } from "@raycast/api";
import { Prefs } from "./preferences";
import executeApiCommand from "./api-command";
import { useLocalStorage, usePromise } from "@raycast/utils";
import { Player, PlayerState } from "./interfaces";
import { MusicAssistantApi } from "./music-assistant-api";

export default function Command() {
  const { host } = getPreferenceValues<Prefs>();
  const {
    value: selectedPlayerID,
    setValue: setSelectedPlayerID,
    isLoading: isLoadingPlayerId,
  } = useLocalStorage("selectedPlayerID", "");

  const getCurrentMedia = async (api: MusicAssistantApi, player: Player) => {
    let title = "";
    if (player.state === PlayerState.PLAYING) {
      const artist = player.current_media?.artist;
      const song = player.current_media?.title == "Music Assistant" ? undefined : player.current_media?.title;
      if (!artist || !song) {
        const queue = await api.getPlayerQueue(player.player_id);
        if (queue.current_item) {
          title = queue.current_item?.name;
        }
      } else {
        title = `${artist} - ${song}`;
      }
    }
    return {
      player,
      title,
    };
  };

  const {
    isLoading: isLoadingPlayers,
    data: players,
    revalidate,
  } = usePromise(
    async (host: string) =>
      await executeApiCommand(host, async (api): Promise<{ player: Player; title: string }[]> => {
        const players = await api.getPlayers();
        const media = await Promise.all(players.map(async (player) => await getCurrentMedia(api, player)));
        return media || [];
      }),
    [host],
  );

  const next = async (playerId: string) =>
    await executeApiCommand(host, async (api) => {
      await api.playerCommandNext(playerId);
      await revalidate();
    });

  const pause = async (playerId: string) =>
    await executeApiCommand(host, async (api) => {
      await api.playerCommandPlayPause(playerId);
      await revalidate();
    });

  const getMenuBarText = (
    players: { player: Player; title: string }[] | undefined,
    playerId: string | undefined,
  ): string => players?.filter((p) => p.player.player_id === playerId)[0].title ?? "";

  if (!selectedPlayerID && players && players.length > 0) {
    setSelectedPlayerID(players[0].player.player_id);
  }

  return (
    <MenuBarExtra
      icon="logo.png"
      isLoading={isLoadingPlayers && isLoadingPlayerId}
      title={getMenuBarText(players, selectedPlayerID)}
    >
      {players &&
        players
          .filter((p) => p.title)
          .map(({ player, title }) => (
            <MenuBarExtra.Section title={player.name} key={player.player_id}>
              <MenuBarExtra.Item
                title={title}
                onAction={() => setSelectedPlayerID(player.player_id)}
              ></MenuBarExtra.Item>
              <MenuBarExtra.Item
                title="Next"
                icon={Icon.ArrowRight}
                onAction={() => next(player.player_id)}
              ></MenuBarExtra.Item>
              <MenuBarExtra.Item
                title={player.state == PlayerState.PLAYING ? "Pause" : "Play"}
                icon={player.state == PlayerState.PLAYING ? Icon.Pause : Icon.Play}
                onAction={() => pause(player.player_id)}
              ></MenuBarExtra.Item>
            </MenuBarExtra.Section>
          ))}
    </MenuBarExtra>
  );
}
