import { Icon, MenuBarExtra } from "@raycast/api";
import executeApiCommand from "./api-command";
import { useCachedPromise, useLocalStorage, usePromise } from "@raycast/utils";
import { Player, PlayerState } from "./interfaces";
import { MusicAssistantApi } from "./music-assistant-api";

export default function Command() {
  const {
    value: selectedPlayerID,
    setValue: setSelectedPlayerID,
    isLoading: isLoadingPlayerId,
  } = useLocalStorage("selectedPlayerID", "");

  const getCurrentMedia = async (api: MusicAssistantApi, player: Player) => {
    let title = "";
    if (player.state !== PlayerState.IDLE) {
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
    revalidate: revalidatePlayers,
  } = useCachedPromise(
    async () => await executeApiCommand(async (api): Promise<Player[]> => await api.getPlayers()),
    [],
    { initialData: [], keepPreviousData: true },
  );

  const {
    isLoading: isLoadingMedia,
    data: media,
    revalidate: revalidateMedia,
  } = usePromise(
    async (players: Player[]) =>
      await executeApiCommand(
        async (api) => await Promise.all(players.map(async (player) => await getCurrentMedia(api, player))),
      ),
    [players],
    { execute: !isLoadingPlayers },
  );

  const next = async (playerId: string) =>
    await executeApiCommand(async (api) => {
      await api.playerCommandNext(playerId);
      revalidateMedia();
    });

  const pause = async (playerId: string) =>
    await executeApiCommand(async (api) => {
      await api.playerCommandPlayPause(playerId);
      revalidateMedia();
    });

  const getMenuBarText = (
    players: { player: Player; title: string }[] | undefined,
    playerId: string | undefined,
  ): string => players?.filter((p) => p.player.player_id === playerId)[0].title ?? "";

  if (!selectedPlayerID && media && media.length > 0) {
    setSelectedPlayerID(media[0].player.player_id);
  }

  return (
    <MenuBarExtra
      icon="logo.png"
      isLoading={isLoadingPlayers && isLoadingPlayerId && isLoadingMedia}
      title={getMenuBarText(media, selectedPlayerID)}
    >
      {media &&
        media
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
