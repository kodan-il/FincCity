from schemas import AgentProfile, Stocks

agents_pool =[
    AgentProfile(
        Agent_name="Bernard",
        economic_level="middle",
        literacy_level="high",
        fomo_level="medium",
        tendency="neutral",
        personality="contrarian"
    ),
    AgentProfile(
        Agent_name="Eriko",
        economic_level="upper-middle",
        literacy_level="high",
        fomo_level="low",
        tendency="neutral",
        personality="analytical"
    ),
    AgentProfile(
        Agent_name="Micah",
        economic_level="low",
        literacy_level="low",
        fomo_level="medium",
        tendency="risk-seeking",
        personality="herd-follower"
    ),
    AgentProfile(
        Agent_name="Lucius",
        economic_level="middle",
        literacy_level="medium",
        fomo_level="high",
        tendency="risk-seeking",
        personality="impulsive"
    ),
    AgentProfile(
        Agent_name="Anne",
        economic_level="upper-middle",
        literacy_level="high",
        fomo_level="high",
        tendency="risk-seeking",
        personality="analytical"
    ),
    AgentProfile(
        Agent_name="Michelle",
        economic_level="middle",
        literacy_level="medium",
        fomo_level="low",
        tendency="risk-averse",
        personality="analytical"
    )
]

stocks_pool = [
    Stocks(
        Stock_Name="Service Provider Company Stock",
        Stock_Type="high_volatile",
        description="This is company where they focus on online service only. Their assets only lies on the developers and the service providers."
    ),
    Stocks(
        Stock_Name="Online Game Company Stock",
        Stock_Type="high_volatile",
        description="This is Online game company. They do not have a lot of assets."
    ),
    Stocks(
        Stock_Name="Start-Up Stock",
        Stock_Type="high_volatile",
        description="This is a start up company where they do not providing any physical assets."
    ),
    Stocks(
        Stock_Name="Doge Coin",
        Stock_Type="high_volatile",
        description="This is a cryptocurrency."
    ),
    Stocks(
        Stock_Name="New Tech Company Stock",
        Stock_Type="high_volatile",
        description="This company still rising up. Their method of business have not proven yet, but their up and down price is very significant."
    ),
    Stocks(
        Stock_Name="Banking Company Stock",
        Stock_Type="stable",
        description="This is a traditional banking company, where they have been around for about 50 years. ."
    ),
    Stocks(
        Stock_Name="Petroleum Stock",
        Stock_Type="stable",
        description="This is a traditional petroleum company. This company operates in the petroleum sector, where their assets reaching trilions of dollar."
    ),
    Stocks(
        Stock_Name="Mineral Company Stock",
        Stock_Type="stable",
        description="This is a traditional mineral company. They operate in Mineral across the world with assets reaching billions of dollar."
    ),
    Stocks(
        Stock_Name="Automobil Stock",
        Stock_Type="stable",
        description="This company operate in car manufacturing. They are one of the early car company where they keep on inventing new technology around automotive, and reaches billions of dollar profit."
    ),
    Stocks(
        Stock_Name="Technology Stock",
        Stock_Type="stable",
        description="This company operates in technology, especially daily life electronics. They are an old company where their assets reaching billions of dollar."
    )
]

