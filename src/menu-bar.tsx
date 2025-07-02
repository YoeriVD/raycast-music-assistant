import { Icon, MenuBarExtra } from "@raycast/api";
import { useCachedPromise, useLocalStorage } from "@raycast/utils";
import { PlayerState } from "./interfaces";
import { MusicAssistantClient } from "./music-assistant-client";

export default function Command() {
  const client = new MusicAssistantClient();
  const {
    isLoading,
    data: queues,
    revalidate: revalidatePlayers,
  } = useCachedPromise(async () => await client.getActiveQueues(), [], {
    keepPreviousData: true,
    initialData: [],
  });
  const {
    value: selectedQueueID,
    setValue: setSelectedQueueID,
    isLoading: isLoadingQueueId,
  } = useLocalStorage("selectedPlayerID", queues && queues.length > 0 ? queues[0].queue_id : "");

  const selectedPlayer = queues && queues.find((q) => q.queue_id === selectedQueueID);

  return (
    <MenuBarExtra icon="logo.png" isLoading={isLoading && isLoadingQueueId} title={selectedPlayer?.current_item?.name}>
      {queues &&
        queues.map(({ state, queue_id, current_item, display_name }) => (
          <MenuBarExtra.Section title={current_item?.name || ""} key={queue_id}>
            <MenuBarExtra.Item title={display_name} onAction={() => setSelectedQueueID(queue_id)}></MenuBarExtra.Item>
            <MenuBarExtra.Item
              title="Next"
              icon={Icon.ArrowRight}
              onAction={() => client.next(queue_id)}
            ></MenuBarExtra.Item>
            <MenuBarExtra.Item
              title={state == PlayerState.PLAYING ? "Pause" : "Play"}
              icon={state == PlayerState.PLAYING ? Icon.Pause : Icon.Play}
              onAction={() => client.togglePlayPause(queue_id)}
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
