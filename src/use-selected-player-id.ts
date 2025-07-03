import { showToast, launchCommand, LaunchType } from "@raycast/api";
import { useLocalStorage } from "@raycast/utils";

export const selectedPlayerKey = "queue_id";
export function useSelectedPlayerID() {
  const { value: selectedPlayerID } = useLocalStorage(selectedPlayerKey, "");
  if (!selectedPlayerID) {
    showToast({
      title: "No player selected!",
      message: "Please select an active player through the menu bar first.",
      primaryAction: {
        title: "Activate Menu Bar",
        onAction: () =>
          launchCommand({
            name: "menu-bar",
            type: LaunchType.UserInitiated,
          }),
      },
    });
  }
  return selectedPlayerID;
}
