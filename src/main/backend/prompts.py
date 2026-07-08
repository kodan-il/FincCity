import random

from schemas import AgentProfile, MarketCondition, FeaturedStock


#-- TODO: create the prompt for the simulation
INTERVENTION_NARRATIVES = {
    "hype": {
        "headline": "BREAKING: Speculative stocks are going CRAZY on social media!",
        "social_pressure": "Everyone around you is talking about how much money they're making from volatile stocks. Your social feed is flooded with people showing off their gains.",
    },
    "bull_signal": {
        "headline": "ECONOMIC BOOM: Government announces strong GDP growth!",
        "social_pressure": "News outlets are optimistic. Colleagues and friends are feeling confident about the market. Investors are getting aggressive.",
    },
    "regulatory_warning": {
        "headline": "Financial Authorities WARNING: Authorities warn public about high-risk speculative assets!",
        "social_pressure": "Financial authorities have issued a formal warning. Some investors are pulling out of volatile assets. The cautious ones are moving to safer ground.",
    },
    "panic": {
        "headline": "MARKET PANIC: Crash rumors spreading fast on social media!",
        "social_pressure": "Unverified rumors of a market crash are spreading. Some investors are panic-selling. Fear is in the air — but is it real or just noise?",
    },
}

#-- TODO: this prompt taken fro Claude
def build_prompt(
        agent: AgentProfile,
        market: MarketCondition,
        featured_stocks: list[FeaturedStock],
        active_intervention: dict | None = None,
) -> str:

    # Makes featured stock into readable string.
    stocks_info = "\n".join([
        f"- {f.stock.Stock_Name} "
        f"({'High Volatile' if f.stock.Stock_Type == 'high_volatile' else 'Stable'}) "
        f"| Trend: {f.todays_trend.upper()} "
        f"| {f.stock.description}"
        for f in featured_stocks
    ])

    intervention_block = ""

    if active_intervention:
        intervention_type = active_intervention.get("intervention_type")
        narrative = INTERVENTION_NARRATIVES.get(intervention_type, {}) # type: ignore
        if narrative:
            intervention_block = f"""
    ⚠️  LIVE MARKET SIGNAL (This is happening RIGHT NOW):
    {narrative['headline']}

    What people around you are saying:
    {narrative['social_pressure']}

    This signal is active and real. How you react depends entirely on your personality.
    """

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
    {intervention_block}
    TODAY'S AVAILABLE STOCKS (you MUST choose only from this list):
    {stocks_info}

    YOUR TASK:
    Based strictly on your personality profile above, decide which stock to invest in today.
    Do NOT choose outside the list. Stay fully in character.
    {f"Consider the live market signal above and react according to your personality — an impulsive agent might chase hype, an analytical one might ignore it, a contrarian might do the opposite." if active_intervention else ""}

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