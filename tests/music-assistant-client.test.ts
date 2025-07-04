import MusicAssistantClient from "../src/music-assistant-client";
import executeApiCommand from "../src/api-command";

// Mock the api-command module
jest.mock("../src/api-command");

const mockExecuteApiCommand = executeApiCommand as jest.MockedFunction<typeof executeApiCommand>;

describe("MusicAssistantClient", () => {
  let client: MusicAssistantClient;

  beforeEach(() => {
    client = new MusicAssistantClient();
    mockExecuteApiCommand.mockReset();
  });

  describe("next", () => {
    it("should call playerCommandNext with correct playerId", async () => {
      const playerId = "test-player-123";
      const mockApi = {
        playerCommandNext: jest.fn().mockResolvedValue(undefined),
      };

      mockExecuteApiCommand.mockImplementation(async (command) => {
        return command(mockApi as any);
      });

      await client.next(playerId);

      expect(mockExecuteApiCommand).toHaveBeenCalledTimes(1);
      expect(mockApi.playerCommandNext).toHaveBeenCalledWith(playerId);
    });

    it("should handle errors from API command", async () => {
      const playerId = "test-player-123";
      const error = new Error("API Error");

      mockExecuteApiCommand.mockRejectedValue(error);

      await expect(client.next(playerId)).rejects.toThrow("API Error");
    });
  });

  describe("togglePlayPause", () => {
    it("should call playerCommandPlayPause with correct playerId", async () => {
      const playerId = "test-player-456";
      const mockApi = {
        playerCommandPlayPause: jest.fn().mockResolvedValue(undefined),
      };

      mockExecuteApiCommand.mockImplementation(async (command) => {
        return command(mockApi as any);
      });

      await client.togglePlayPause(playerId);

      expect(mockExecuteApiCommand).toHaveBeenCalledTimes(1);
      expect(mockApi.playerCommandPlayPause).toHaveBeenCalledWith(playerId);
    });

    it("should handle errors from API command", async () => {
      const playerId = "test-player-456";
      const error = new Error("Connection failed");

      mockExecuteApiCommand.mockRejectedValue(error);

      await expect(client.togglePlayPause(playerId)).rejects.toThrow("Connection failed");
    });
  });

  describe("getActiveQueues", () => {
    it("should return filtered active queues with current items", async () => {
      const mockQueues = [
        { id: "queue1", active: true, current_item: { id: "item1" } },
        { id: "queue2", active: false, current_item: { id: "item2" } },
        { id: "queue3", active: true, current_item: null },
        { id: "queue4", active: true, current_item: { id: "item4" } },
      ];

      const mockApi = {
        getPlayerQueues: jest.fn().mockResolvedValue(mockQueues),
      };

      mockExecuteApiCommand.mockImplementation(async (command) => {
        return command(mockApi as any);
      });

      const result = await client.getActiveQueues();

      expect(mockExecuteApiCommand).toHaveBeenCalledTimes(1);
      expect(mockApi.getPlayerQueues).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { id: "queue1", active: true, current_item: { id: "item1" } },
        { id: "queue4", active: true, current_item: { id: "item4" } },
      ]);
    });

    it("should return empty array when no active queues with current items", async () => {
      const mockQueues = [
        { id: "queue1", active: false, current_item: { id: "item1" } },
        { id: "queue2", active: true, current_item: null },
      ];

      const mockApi = {
        getPlayerQueues: jest.fn().mockResolvedValue(mockQueues),
      };

      mockExecuteApiCommand.mockImplementation(async (command) => {
        return command(mockApi as any);
      });

      const result = await client.getActiveQueues();

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it("should handle API errors", async () => {
      const error = new Error("Failed to fetch queues");

      mockExecuteApiCommand.mockRejectedValue(error);

      await expect(client.getActiveQueues()).rejects.toThrow("Failed to fetch queues");
    });
  });
});
