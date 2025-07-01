import { getPreferenceValues } from "@raycast/api";
import { Prefs } from "./preferences";
import executeApiCommand from "./api-command";
import { showFailureToast, useLocalStorage } from "@raycast/utils";

export default async function main() {
  const { host } = getPreferenceValues<Prefs>();
  const { value: selectedPlayerID } = useLocalStorage("selectedPlayerID", "");
  if (!selectedPlayerID) {
    await showFailureToast("Please select a player from the menubar first");
    return;
  }
  await executeApiCommand(host, async (api) => await api.playerCommandNext(selectedPlayerID));
}
