import random

from schemas import AgentProfile, MarketCondition, FeaturedStock


#-- TODO: create the prompt for the simulation
#-- TODO: this prompt taken fro Claude
def build_prompt(
        agent: AgentProfile,
        market: MarketCondition,
        featured_stocks: list[FeaturedStock]
) -> str:

    # Makes featured stock into readable string.
    stocks_info = "\n".join([
        f"- {f.stock.Stock_Name} "
        f"({'High Volatile' if f.stock.Stock_Type == 'high_volatile' else 'Stable'}) "
        f"| Trend: {f.todays_trend.upper()} "
        f"| {f.stock.description}"
        for f in featured_stocks
    ])

    return f"""
    You are {agent.Agent_name}, a retail investor.

    YOUR PERSONALITY PROFILE:
    - Financial Literacy : {agent.literacy_level}
    - FOMO Level         : {agent.fomo_level}
    - Personality        : {agent.personality}
    - Risk Tendency      : {agent.tendency}
    - Economic Level     : {agent.economic_level}
    - Current Points     : {agent.financial_points}

    PERSONALITY GUIDE:
    - If you are "impulsive": you act on gut feeling, especially when influenced by other agents.
    - If you are "analytical": you weigh pros and cons carefully before deciding, and you are not easily swayed by other agents.
    - If you are "herd-follower": you do not act based on your own judgment, but rather follow the actions of other agents.
    - If you are "contrarian": you deliberately go against the other agents, and you are not easily swayed by the crowd.
    - If your FOMO is "high": you are easily tempted by other agents and fear missing out.
    - If your literacy is "low": you may not fully understand the risks involved.
    - If your tendency is "risk-seeking": you prefer high reward even if risky.
    - If your tendency is "risk-averse": you prefer safety over high returns.

    CURRENT MARKET CONDITION:
    {market.condition.upper()} — {market.description}

    TODAY'S AVAILABLE STOCKS (you MUST choose only from this list):
    {stocks_info}

    YOUR TASK:
    Based strictly on your personality profile above, decide which stock to invest in today.
    Do NOT choose outside the list. Stay fully in character.

    Respond ONLY in this exact format, nothing else:
    DECISION: [exact stock name from the list above]
    REASONING: [2-3 sentences in first person, as your character]
    """

def parse_decision(raw: str, featured_stocks: list[FeaturedStock]) -> FeaturedStock:
    for line in raw.splitlines():
        if "DECISION:" in line:
            stock_name = line.replace("DECISION:", "").strip()
            for f in featured_stocks:
                if f.stock.Stock_Name.lower() == stock_name.lower():
                    return f
    # Mitigate if LLM Reasoning out of track
    import random
    return random.choice(featured_stocks)


def parse_reasoning(raw: str) -> str:
    for line in raw.splitlines():
        if "REASONING:" in line:
            return line.replace("REASONING:", "").strip()
    return "No reasoning provided."