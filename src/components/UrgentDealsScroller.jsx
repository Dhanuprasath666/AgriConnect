import React from "react";

const UrgentDealsScroller = ({
  deals = [],
  onDealClick,
  emptyText = "No urgent deals right now.",
  cardClassName = "",
  showButton = false,
  buttonLabel = "Buy Now",
}) => {
  if (!Array.isArray(deals) || deals.length === 0) {
    return <p className="muted">{emptyText}</p>;
  }

  const loopedDeals = [...deals, ...deals];

  return (
    <div className="ac-deals-scroll">
      <div className="ac-deals-track">
        {loopedDeals.map((deal, index) => (
          <article
            key={`${deal.id || deal.title}-${index}`}
            className={`ac-deal-card ${cardClassName}`.trim()}
            role="button"
            tabIndex={0}
            onClick={() => onDealClick?.(deal)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onDealClick?.(deal);
            }}
          >
            <h3>{deal.title || "Urgent deal"}</h3>
            {deal.badge && <p className="ac-deal-badge">{deal.badge}</p>}
            {deal.meta && <p className="ac-deal-meta">{deal.meta}</p>}
            {showButton && (
              <button
                className="ac-deal-btn"
                onClick={(event) => {
                  event.stopPropagation();
                  onDealClick?.(deal);
                }}
              >
                {buttonLabel}
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};

export default UrgentDealsScroller;
