import { SentimentBar } from './SentimentBar';
import { useMobileFeedContext } from '../../context/MobileFeedContext';
import type { SearchProfile, Sentiment } from '../../types/mentions';

interface TopicSummaryBarProps {
  profile: SearchProfile;
}

export function TopicSummaryBar({ profile }: TopicSummaryBarProps) {
  const { sentimentSummary, filters, setFilter } = useMobileFeedContext();

  const handleSegmentClick = (sentiment: Sentiment) => {
    if (filters.sentiment === sentiment) {
      setFilter('sentiment', null);
    } else {
      setFilter('sentiment', sentiment);
    }
  };

  return (
    <div className="bg-white sticky top-[88px] z-10 px-4 py-3 shadow-sm flex flex-col gap-2">
      <p className="font-bold text-base text-black tracking-[-0.4px]">
        {profile.icon} {profile.name}
      </p>
      <SentimentBar summary={sentimentSummary} onSegmentClick={handleSegmentClick} />
    </div>
  );
}
