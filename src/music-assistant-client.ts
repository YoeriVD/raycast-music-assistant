import executeApiCommand from "./api-command";

export default class MusicAssistantClient {
  async next(playerId: string) {
    await executeApiCommand(async (api) => await api.playerCommandNext(playerId));
  }
  async togglePlayPause(playerId: string) {
    await executeApiCommand(async (api) => await api.playerCommandPlayPause(playerId));
  }

  async getActiveQueues() {
    return await executeApiCommand(async (api) => {
      const queues = await api.getPlayerQueues();
      const activeQueues = queues.filter((q) => q.active && q.current_item);
      return activeQueues;
    });
  }
}
