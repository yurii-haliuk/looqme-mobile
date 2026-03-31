import type { SentimentSummary, Sentiment } from '../../types/mentions';

interface SentimentBarProps {
  summary: SentimentSummary;
  onSegmentClick?: (sentiment: Sentiment) => void;
}

export function SentimentBar({ summary, onSegmentClick }: SentimentBarProps) {
  const { positive, neutral, negative, total } = summary;
  if (total === 0) return <div className="h-2 w-full rounded-[14px] bg-[#e3e8f3]" />;

  const posPercent = (positive / total) * 100;
  const neuPercent = (neutral / total) * 100;
  const negPercent = (negative / total) * 100;

  return (
    <div className="flex h-2 w-full overflow-hidden rounded-[14px]">
      {posPercent > 0 && (
        <button
          type="button"
          className="h-full bg-[#00cc87] transition-[width] duration-200 ease-in-out"
          style={{ width: `${posPercent}%` }}
          onClick={() => onSegmentClick?.('positive')}
          aria-label={`Позитивні: ${positive}`}
        />
      )}
      {neuPercent > 0 && (
        <button
          type="button"
          className="h-full bg-[#e3e8f3] transition-[width] duration-200 ease-in-out"
          style={{ width: `${neuPercent}%` }}
          onClick={() => onSegmentClick?.('neutral')}
          aria-label={`Нейтральні: ${neutral}`}
        />
      )}
      {negPercent > 0 && (
        <button
          type="button"
          className="h-full bg-[#fa248c] transition-[width] duration-200 ease-in-out"
          style={{ width: `${negPercent}%` }}
          onClick={() => onSegmentClick?.('negative')}
          aria-label={`Негативні: ${negative}`}
        />
      )}
    </div>
  );
}
