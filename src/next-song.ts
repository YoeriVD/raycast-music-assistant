import executeApiCommand from "./api-command";
import { showFailureToast, useLocalStorage } from "@raycast/utils";

export default async function main() {
  const { value: selectedPlayerID } = useLocalStorage("selectedPlayerID", "");
  if (!selectedPlayerID) {
    await showFailureToast("Please select a player from the menubar first");
    return;
  }
  await executeApiCommand(async (api) => await api.playerCommandNext(selectedPlayerID));
}
