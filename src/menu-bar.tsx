import { Icon, MenuBarExtra, openExtensionPreferences } from "@raycast/api";
import { useCachedPromise, useLocalStorage } from "@raycast/utils";
import { PlayerQueue, PlayerState } from "./interfaces";
import MusicAssistantClient from "./music-assistant-client";
import { useEffect, useState } from "react";
import { selectedPlayerKey, StoredQueue } from "./use-selected-player-id";

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

  const { value: storedQueueId, setValue: storeQueueId } = useLocalStorage<StoredQueue>(selectedPlayerKey);

  const [title, setTitle] = useState<string>();

  useEffect(() => {
    if (queues.length === 0) return;
    const queue = storedQueueId?.queue_id ? queues.find((q) => q.queue_id === storedQueueId.queue_id) : queues[0];
    const current_item = queue?.current_item;
    if (current_item?.name && current_item.name !== title) setTitle(current_item.name);
  }, [storedQueueId]);

  const selectPlayerForMenuBar = ({ queue_id, current_item }: PlayerQueue) => {
    if (current_item?.name) setTitle(current_item.name);
    if (storedQueueId?.queue_id !== queue_id) storeQueueId({ queue_id });
  };

  return (
    <MenuBarExtra icon="transparent-logo.png" isLoading={isLoading} title={title}>
      {queues &&
        queues.map((queue) => (
          <MenuBarExtra.Section title={queue.display_name} key={queue.queue_id}>
            <MenuBarExtra.Item
              icon={Icon.Eye}
              title={queue.current_item?.name || ""}
              onAction={() => selectPlayerForMenuBar(queue)}
            ></MenuBarExtra.Item>
            <MenuBarExtra.Item
              title="Next"
              icon={Icon.ArrowRight}
              onAction={() => client.next(queue.queue_id)}
            ></MenuBarExtra.Item>
            <MenuBarExtra.Item
              title={queue.state == PlayerState.PLAYING ? "Pause" : "Play"}
              icon={queue.state == PlayerState.PLAYING ? Icon.Pause : Icon.Play}
              onAction={() => client.togglePlayPause(queue.queue_id)}
            ></MenuBarExtra.Item>
          </MenuBarExtra.Section>
        ))}
      {queues ? (
        <MenuBarExtra.Section>
          <MenuBarExtra.Item
            title="Refresh"
            icon={Icon.RotateAntiClockwise}
            onAction={revalidatePlayers}
          ></MenuBarExtra.Item>
        </MenuBarExtra.Section>
      ) : (
        <MenuBarExtra.Item
          title="Fix configuration"
          icon={Icon.WrenchScrewdriver}
          onAction={openExtensionPreferences}
        ></MenuBarExtra.Item>
      )}
    </MenuBarExtra>
  );
}
