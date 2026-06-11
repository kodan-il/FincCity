import random

from schemas import AgentProfile, MarketCondition, FeaturedStock


#-- TODO: create the prompt for the simulation
def build_prompt(
        agent: AgentProfile,
        market: MarketCondition,
        featured_stocks: list[FeaturedStock]
) -> str:

    # Format featured stocks jadi readable string
    stocks_info = "\n".join([
        f"- {f.stock.Stock_Name} "
        f"({'High Volatile' if f.stock.Stock_Type == 'high_volatile' else 'Stable'}) "
        f"| Today's Trend: {f.todays_trend.upper()} "
        f"| {f.stock.description}"
        for f in featured_stocks
    ])

    return f"""
    You are {agent.Agent_name}, a retail investor who is still learning how the investment world works.

    YOUR PROFILE:
    - Financial Literacy : {agent.literacy_level}
    - FOMO Level         : {agent.fomo_level}
    - Personality        : {agent.personality}
    - Risk Tendency      : {agent.tendency}
    - Economic Level     : {agent.economic_level}
    - Current Points     : {agent.financial_points}

    CURRENT MARKET CONDITION:
    {market.condition.upper()} — {market.description}

    TODAY'S AVAILABLE STOCKS (choose only from these):
    {stocks_info}

    YOUR TASK:
    Based on your personality and profile above, decide which stock you want to invest in today.
    Stay in character — if you are impulsive, act impulsively. If you are analytical, think carefully.
    If you have high FOMO, you might be tempted by volatile stocks even if risky.

    Respond ONLY in this format:
    DECISION: [exact stock name from the list above]
    REASONING: [2-3 sentences explaining your decision in first person, as your character]
    """

def parse_decision(raw: str, featured_stocks: list[FeaturedStock]) -> FeaturedStock:
    for line in raw.splitlines():
        if "DECISION:" in line:
            stock_name = line.replace("DECISION:", "").strip()
            # Cari di featured stocks
            for f in featured_stocks:
                if f.stock.Stock_Name.lower() == stock_name.lower():
                    return f
    # Fallback — kalau LLM jawab diluar featured stocks
    return random.choice(featured_stocks)


def parse_reasoning(raw: str) -> str:
    for line in raw.splitlines():
        if "REASONING:" in line:
            return line.replace("REASONING:", "").strip()
    return "No reasoning provided."