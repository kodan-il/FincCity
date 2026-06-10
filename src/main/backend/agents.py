from schemas import AgentProfile

agents_pool =[
# name: str
# economic_level: Literal["low", "middle", "upper-middle"]
# literacy_level: Literal["low", "medium", "high"]
# fomo_level: Literal["low", "medium", "high"]
# tendency: Literal["risk-averse", "neutral", "risk-seeking"]
# personality: Literal["impulsive", "analytical", "herd-follower", "contrarian"]
    AgentProfile(
        name="Bryan",
        economic_level="low",
        literacy_level="low",
        fomo_level="low",
        tendency="risk-averse",
        personality="analytical"
    ),
    AgentProfile(
        name="Bernard",
        economic_level="middle",
        literacy_level="high",
        fomo_level="medium",
        tendency="neutral",
        personality="contrarian"
    ),
    AgentProfile(
        name="Barbara",
        economic_level="upper-middle",
        literacy_level="high",
        fomo_level="high",
        tendency="risk-averse",
        personality="analytical"
    ),
    AgentProfile(
        name="Richard",
        economic_level="upper-middle",
        literacy_level="medium",
        fomo_level="high",
        tendency="risk-seeking",
        personality="analytical"
    ),
    AgentProfile(
        name="Trisha",
        economic_level="low",
        literacy_level="high",
        fomo_level="low",
        tendency="neutral",
        personality="herd-follower"
    ),
    AgentProfile(
        name="Lauren",
        economic_level="middle",
        literacy_level="low",
        fomo_level="high",
        tendency="risk-seeking",
        personality="impulsive"
    ),
    AgentProfile(
        name="Micah",
        economic_level="low",
        literacy_level="low",
        fomo_level="medium",
        tendency="risk-seeking",
        personality="herd-follower"
    ),
    AgentProfile(
        name="Lucius",
        economic_level="middle",
        literacy_level="medium",
        fomo_level="high",
        tendency="risk-seeking",
        personality="impulsive"
    ),
    AgentProfile(
        name="Anne",
        economic_level="upper-middle",
        literacy_level="high",
        fomo_level="high",
        tendency="risk-seeking",
        personality="analytical"
    ),
    AgentProfile(
        name="Michelle",
        economic_level="middle",
        literacy_level="medium",
        fomo_level="low",
        tendency="risk-averse",
        personality="analytical"
    )
]