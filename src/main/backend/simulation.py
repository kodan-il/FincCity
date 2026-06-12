import random
import logging
from typing import get_args

from schemas import AgentProfile, Stocks, MarketCondition, MARKET_CONDITIONS, IterationReport, FeaturedStock, StockHistory
from agents import agents_pool, stocks_pool
from prompts import build_prompt, parse_decision, parse_reasoning
from openai import OpenAI, responses
from prompts import build_prompt
from settings import OPENAI_API_KEY, LLM_VERS

client = OpenAI(
    api_key=OPENAI_API_KEY,
    base_url="https://openrouter.ai/api/v1"
)

#-- TODO: create description about high volatile outcomes and weights for random generator
HIGH_VOLATILE_OUTCOMES = [-4,-3,-2,-1, 0, 1, 2, 3, 4]
HVO_WEIGHTS_NORMAL =     [20,20,15,15,10,10,10, 5, 5]
HVO_WEIGHTS_BULL =       [ 5, 5, 5,10,10,15,20,20,20]
HVO_WEIGHTS_BEAR =       [35,25,20,20,10,10, 5, 5, 5]

STABLE_OUTCOME_NORMAL = 1
STABLE_OUTCOME_BEAR = 1
STABLE_OUTCOME_BULL = 2

#-- Setting up the market condition on this iteration
def get_market_condition() -> MarketCondition:
    market_condition = random.choice(get_args(MARKET_CONDITIONS))
    descriptions = {
        "bull_market" : "Market is going up, investor are optimistic.",
        "bear_market" : "Market is going down, investors are pessimistic.",
        "normal" : "No significant movement around the market."
    }
    logging.info("Market condition set: " + market_condition)
    return MarketCondition(
        condition=market_condition,
        description=descriptions[market_condition]
    )

#-- setup which stocks for both high volatile and stable stocks that is on the market trends
def get_featured_stock() -> list[FeaturedStock]:
    volatile_pool = [stocks for stocks in stocks_pool if stocks.Stock_Type == "high_volatile"]
    stable_pool = [stocks for stocks in stocks_pool if stocks.Stock_Type == "stable"]

    featured_volatile = random.sample(volatile_pool, 2)
    featured_stable = random.sample(stable_pool, 2)

    result_featured_stock = []
    for volatile in featured_volatile:
        result_featured_stock.append(FeaturedStock(
            stock=volatile,
            todays_trend=random.choice(["bull", "bear"])
        ))

    for stable in featured_stable:
        result_featured_stock.append(FeaturedStock(
            stock=stable,
            todays_trend=random.choice(["bull","bear"])
        ))

    return result_featured_stock

#-- Logic on whether agents are going pick the stocks
#def agent_pick_stocks(agent: AgentProfile, featured_stocks: list[FeaturedStock]) -> FeaturedStock:
    #-- TODO might need to remove this methods
    # hvo_chance = 50
    #
    # volatile_option = [volatile_stock for volatile_stock in featured_stocks if volatile_stock.stock.Stock_Type == "high_volatile"]
    # stable_option = [stable_stock for stable_stock in featured_stocks if stable_stock.stock.Stock_Type == "stable"]
    #
    # # Literacy level — the higher the literacy, the more probability avoiding the high volatile
    # if agent.literacy_level == "high":
    #     hvo_chance -= 20
    # elif agent.literacy_level == "low":
    #     hvo_chance += 20
    # logging.info("chance to buy after literacy calc : " + str(hvo_chance))
    #
    # # FOMO level — The higher the fomo, the more intrigued the chance of getting the stock
    # if agent.fomo_level == "high":
    #     hvo_chance += 15
    # elif agent.fomo_level == "low":
    #     hvo_chance -= 15
    # logging.info("chance to buy after fomo calc : " + str(hvo_chance))
    #
    # # Tendency
    # if agent.tendency == "risk-seeking":
    #     hvo_chance += 15
    # elif agent.tendency == "risk-averse":
    #     hvo_chance -= 15
    # logging.info("chance to buy after tendency calc : " + str(hvo_chance))
    #
    # # Personality
    # if agent.personality == "impulsive":
    #     hvo_chance += 10
    # elif agent.personality == "analytical":
    #     hvo_chance -= 10
    # elif agent.personality == "herd-follower":
    #     hvo_chance += 5
    # elif agent.personality == "contrarian":
    #     hvo_chance -= 5
    # logging.info("chance to buy after personality calc : " + str(hvo_chance))
    #
    # # Make sure the chance between 5% to 95%
    # hvo_chance = max(5, min(95, hvo_chance))
    # logging.info("Total urge to buy : " + str(hvo_chance))
    #
    # # choose whether the high volatile stock is chosen or not
    # go_hvo = random.random() * 100 < hvo_chance

    # if go_hvo and volatile_option:
    #     return random.choice(volatile_option)
    # elif stable_option:
    #     return random.choice(stable_option)
    # else:
    #     return random.choice(featured_stocks)

#-- calculate the outcome of the stocks
def calculate_outcome(featured: FeaturedStock, market: MarketCondition) -> int:
    if featured.stock.Stock_Type == "stable":
        return STABLE_OUTCOME_BULL if market.condition == "bull_market" else STABLE_OUTCOME_NORMAL

    # Which high volatile assets trend affect weights
    if featured.todays_trend == "bull":
        weights = HVO_WEIGHTS_BULL
    elif featured.todays_trend == "bear":
        weights = HVO_WEIGHTS_BEAR
    else:
        weights = HVO_WEIGHTS_NORMAL

    return random.choices(HIGH_VOLATILE_OUTCOMES, weights=weights)[0]

#-- Update everytime agent finished the iteration
def agent_update(agent: AgentProfile, stocks: Stocks, outcome: int, iteration:int):
    agent.current_asset_allocation = stocks.Stock_Name
    agent.financial_points += outcome

    agent.stock_history.append(StockHistory(
        iteration=iteration,
        stock_name=stocks.Stock_Name,
        stock_type=stocks.Stock_Type,
        outcome=outcome,
        points_after=agent.financial_points
    ))

    if agent.financial_points <= 0:
        agent.financial_points = 0
        agent.is_bankrupt = True

def generate_report(iteration: int, market: MarketCondition, previous_points: dict) -> IterationReport:

    profiting  = []
    losing     = []
    bankrupt   = []

    for agent in agents_pool:
        if agent.is_bankrupt:
            bankrupt.append(agent.Agent_name)
            continue

        prev = previous_points.get(agent.Agent_name, 10)
        if agent.financial_points > prev:
            profiting.append(agent.Agent_name)
        elif agent.financial_points < prev:
            losing.append(agent.Agent_name)

    active_agents = [agents for agents in agents_pool if not agents.is_bankrupt]
    avg_points = (
        sum(agents.financial_points for agents in active_agents) / len(active_agents)
        if active_agents else 0
    )

    return IterationReport(
        Iteration_Count=iteration,
        Iteration_Month=(iteration // 2),
        market_condition=market.condition,
        agents_profits=profiting,
        agents_loss=losing,
        agents_bankrupt=bankrupt,
        avg_financial_points=round(avg_points, 2)
    )

def bankruptcy_summary(agent: AgentProfile):
    volatile_count = sum(
        1 for history in agent.stock_history
        if history.stock_type == "high_volatile"
    )
    stable_count = sum(
        1 for history in agent.stock_history
        if history.stock_type == "stable"
    )
    total_loss = sum(
        history.outcome for history in agent.stock_history
        if history.outcome < 0
    )

    print(f"\n {agent.Agent_name} BANKRUT!")
    print(f"Volatile picks : {volatile_count}x")
    print(f"Stable picks   : {stable_count}x")
    print(f"Total loss     : {total_loss}")
    print(f"History        :")
    for h in agent.stock_history:
        print(f"iter {h.iteration} | "
              f"{h.stock_name} | {h.outcome:+d} | pts: {h.points_after}")

def run_simulation():
    reports = []
    snapshots_points = {agent.Agent_name: agent.financial_points for agent in agents_pool}

    for iteration in range (1,25):
        print(f"\n{'='*40}")
        print(f"Iteration {iteration} | Month{((iteration-1)//2)+1}")

        # -- Setting up market condition on the start
        market_condition = get_market_condition()
        print(f"Market: {market_condition.condition} - {market_condition.description}")

        #-- Setting up stock trend
        featured_stock = get_featured_stock()
        print(f"\n Today stock trends: ")
        for feature in featured_stock:
            print(f"   {feature.stock.Stock_Name} "
                  f"| {feature.stock.Stock_Type} "
                  f"| trend: {feature.todays_trend}")


        for agent in agents_pool:

            if agent.is_bankrupt:
                print(f"{agent.Agent_name} is bankrupt. Skipping current agent")
                continue

            # Step 1 — Build prompt
            prompt = build_prompt(agent, market_condition, featured_stock)

            # Step 2 — send to LLM
            response = client.chat.completions.create(
                model= LLM_VERS,
                messages=[{"role": "user", "content": prompt}]
            )
            raw_response = response.choices[0].message.content

            # Step 3 — Parse LLM response
            decision  = parse_decision(raw_response, featured_stock)
            reasoning = parse_reasoning(raw_response)

            # Step 4 — Outcome count and agent update
            outcome        = calculate_outcome(decision, market_condition)
            previous_points = agent.financial_points
            agent_update(agent, decision.stock, outcome, iteration)

            #-- TODO: This prints taken from Claude
            status = "Going UP" if outcome > 0 else ("Going DOWN" if outcome < 0 else "Stable")
            print(f"   {status} {agent.Agent_name} "
                  f"→ {decision.stock.Stock_Name} "
                  f"| outcome: {outcome:+d} "
                  f"| {previous_points} → {agent.financial_points} pts")
            print(f"   💬 \"{reasoning}\"")

            if agent.is_bankrupt:
                bankruptcy_summary(agent)

        if iteration % 2 == 0:
            report = generate_report(iteration, market_condition, snapshots_points)
            reports.append(report)

            print(f"\nMONTHLY REPORT {report.month}:")
            print(f"Profits  : {report.agents_profiting}")
            print(f"Loss     : {report.agents_losing}")
            print(f"Bankrupt : {report.agents_bankrupt}")
            print(f"Avg Pts  : {report.avg_financial_points}")

            snapshots_points = {
                agent.Agent_name: agent.financial_points
                for agent in agents_pool
            }
    # Final Summary after 24 iteration
    print(f"\n{'='*40}")
    print(f"Simulation done. Final standings:")
    active_agents = sorted(
        [agent for agent in agents_pool if not agent.is_bankrupt],
        key=lambda x: x.financial_points,
        reverse=True
    )
    bankrupt_agents = [agent for agent in agents_pool if agent.is_bankrupt]

    print(f"\nThriving agents: ({len(active_agents)} agents):")
    for i, agent in enumerate(active_agents, 1):
        print(f"   {i}. {agent.Agent_name} — {agent.financial_points} pts")

    print(f"\nBankrupt agents: ({len(bankrupt_agents)} agents):")
    for agent in bankrupt_agents:
        volatile_count = sum(
            1 for h in agent.stock_history
            if h.stock_type == "high_volatile"
        )
        print(f" - {agent.Agent_name} "
              f"| volatile picks: {volatile_count}x "
              f"| last pts: {agent.financial_points}")


    return reports