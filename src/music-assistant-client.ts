import executeApiCommand from "./api-command";
import { Player, PlayerState } from "./interfaces";
import { MusicAssistantApi } from "./music-assistant-api";

export class MusicAssistantClient {
  async next(playerId: string) {
    await executeApiCommand(async (api) => {
      await api.playerCommandNext(playerId);
    });
  }
  async togglePlayPause(playerId: string) {
    await executeApiCommand(async (api) => {
      await api.playerCommandPlayPause(playerId);
    });
  }
  async getActivePlayers() {
    return await executeApiCommand(async (api) => {
      const players = await api.getPlayers();
      const activePlayers = await Promise.all(
        players
          .filter((p) => p.state !== PlayerState.IDLE)
          .map(
            async (p): Promise<Player & { menuBarText: string }> => ({
              ...p,
              menuBarText: await this.getMenuBarText(api, p),
            }),
          ),
      );
      return activePlayers;
    });
  }

  private async getMenuBarText(api: MusicAssistantApi, player: Player) {
    let title = "";
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
    return title;
  }
}
