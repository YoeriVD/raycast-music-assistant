import { showToast, launchCommand, LaunchType, LocalStorage } from "@raycast/api";

export const selectedPlayerKey = "queue_id";
export async function getSelectedQueueID() {
  const storedObj = await LocalStorage.getItem<string>(selectedPlayerKey);
  const selectedPlayerID: { queue_id: string } = storedObj ? JSON.parse(storedObj) : null;
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
  return selectedPlayerID?.queue_id;
}
