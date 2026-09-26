import AlgoPlayer from './player/AlgoPlayer';
import { getTimelinesForTopic } from './runners';
import { useMemo } from 'react';

/**
 * Topic viz entrypoint — resolves first-class runners or legacy kits,
 * then renders the unified AlgoPlayer (code | canvas | structures).
 */
export default function AlgoViz({ topicId }: { topicId: string }) {
  const timelines = useMemo(() => getTimelinesForTopic(topicId), [topicId]);
  if (!timelines.length) return null;
  return <AlgoPlayer timelines={timelines} />;
}
