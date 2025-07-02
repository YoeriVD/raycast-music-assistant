import { showFailureToast, useLocalStorage } from "@raycast/utils";
import { MusicAssistantClient } from "./music-assistant-client";

export default async function main() {
  const { value: selectedPlayerID } = useLocalStorage("selectedPlayerID", "");
  if (!selectedPlayerID) {
    await showFailureToast("Please select a player from the menubar first");
    return;
  }
  await new MusicAssistantClient().togglePlayPause(selectedPlayerID);
}
