import { showFailureToast } from "@raycast/utils";
import useSelectedPlayerID from "./use-selected-player-id";
import MusicAssistantClient from "./music-assistant-client";

export default async function main() {
  const selectedPlayerID = useSelectedPlayerID();
  if (!selectedPlayerID) return;
  try {
    await new MusicAssistantClient().next(selectedPlayerID);
  } catch (error) {
    showFailureToast(error, {
      title: "Couldn't reach Music Assistant",
    });
  }
}
