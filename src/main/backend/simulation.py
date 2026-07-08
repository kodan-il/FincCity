import random
import logging
from typing import get_args

from schemas import AgentProfile, Stocks, MarketCondition, MARKET_CONDITIONS, IterationReport, FeaturedStock, StockHistory
from agents import agents_pool, stocks_pool
from prompts import build_prompt, parse_decision, parse_reasoning
from openai import OpenAI, responses
from prompts import build_prompt
from settings import OPENAI_API_KEY, LLM_VERS
from player import resolve_bet_after_tick

client = OpenAI(
    api_key=OPENAI_API_KEY,
    base_url="https://openrouter.ai/api/v1"
)

# description about high volatile outcomes and weights for random generator
HIGH_VOLATILE_OUTCOMES = [-4,-3,-2,-1, 0, 1, 2, 3, 4]
HVO_WEIGHTS_NORMAL =     [20,20,15,15,10,10,10, 5, 5]
HVO_WEIGHTS_BULL =       [ 5, 5, 5,10,10,15,20,20,20]
HVO_WEIGHTS_BEAR =       [35,25,20,20,10,10, 5, 5, 5]

STABLE_OUTCOME_NORMAL = 1
STABLE_OUTCOME_BEAR = 1
STABLE_OUTCOME_BULL = 2

# Global variable to track the live state of the simulation
live_state = {
    "current_tick": 0,
    "current_month": 0,
    "market_condition": "",
    "market_event": None,
    "market_events": [],
    "agent_snapshots": [],
    "diary_entries": [],
    "stock_history": [],
    "agent_points_history": [],
    "active_intervention": None
}

# Vocal threshold for determining if an agent's outcome is significant enough to be logged in the diary entries
VOCAL_THRESHOLD = 3

# Details of the market interventions and their effects on the market condition
INTERVENTION_MARKET_MAP = {
    "hype":               "bull_market",
    "bull_signal":        "bull_market",
    "panic":              "bear_market",
    "regulatory_warning": "normal",
}

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
def make_asset_impact(feature: FeaturedStock, market: MarketCondition) -> dict:
    base_impact = 2 if feature.todays_trend == "bull" else -2

    if market.condition == "bull_market" and feature.stock.Stock_Type == "high_volatile":
        base_impact += 1
    elif market.condition == "bear_market" and feature.stock.Stock_Type == "high_volatile":
        base_impact -= 1
    elif market.condition == "normal" and feature.stock.Stock_Type == "stable":
        base_impact = 1 if feature.todays_trend == "bull" else 0

    level = "High" if abs(base_impact) >= 3 else ("Medium" if abs(base_impact) == 2 else "Low")
    direction = "up" if base_impact > 0 else ("down" if base_impact < 0 else "neutral")

    return {
        "asset": feature.stock.Stock_Name,
        "impact": base_impact,
        "level": level,
        "direction": direction
    }



def build_market_event(iteration: int, market: MarketCondition, featured_stocks: list[FeaturedStock]) -> dict:
    top_stock = featured_stocks[0].stock.Stock_Name if featured_stocks else "the market"

    if market.condition == "bull_market":
        title = "Optimism Lifts the Market"
        category = "Bullish News"
        market_effect = "Bullish"
        summary = f"Investor confidence rises and growth-focused assets such as {top_stock} attract attention."
        explanation = "A bullish event usually means investors are more willing to take risk. High-growth and high-volatility assets can benefit, but losses are still possible."
    elif market.condition == "bear_market":
        title = "Caution Spreads Across FinnCity"
        category = "Bearish News"
        market_effect = "Bearish"
        summary = f"Investors become defensive, and risky assets face pressure while stable companies look safer."
        explanation = "A bearish event means investors are more pessimistic. Risky assets may fall harder, while stable assets can become more attractive to cautious agents."
    else:
        title = "Markets Stay Balanced"
        category = "Market Update"
        market_effect = "Neutral"
        summary = "No major shock is moving the market, so agent decisions depend more on personality and asset-specific trends."
        explanation = "A normal market does not strongly favor risk or safety. Financial literacy matters because agents must compare risk, return, and asset quality."

    return {
        "id": f"event-{iteration}",
        "tick": iteration,
        "title": title,
        "category": category,
        "summary": summary,
        "market_effect": market_effect,
        "explanation": explanation,
        "asset_impacts": [make_asset_impact(feature, market) for feature in featured_stocks]
    }


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

        current_intervention = live_state.get("active_intervention")
        intervention_type = current_intervention.get("intervention_type") if current_intervention else None

        if intervention_type and intervention_type in INTERVENTION_MARKET_MAP:
            forced_condition = INTERVENTION_MARKET_MAP[intervention_type]
            descriptions = {
                "bull_market": "Market is going up, investor are optimistic.",
                "bear_market": "Market is going down, investors are pessimistic.",
                "normal":      "No significant movement around the market."
            }
            market_condition = MarketCondition(
                condition=forced_condition,
                description=descriptions[forced_condition]
            )
            print(f"⚡ Intervention active: {intervention_type} → market forced to {forced_condition}")
        else:
            market_condition = get_market_condition()

        print(f"Market: {market_condition.condition} - {market_condition.description}")

        # -- Setting up market condition on the start
        market_condition = get_market_condition()
        print(f"Market: {market_condition.condition} - {market_condition.description}")
        tick_start_points = {agent.Agent_name: agent.financial_points for agent in agents_pool}

        if current_intervention:
            current_intervention["ticks_remaining"] -= 1
            print(f"⚡ Intervention ticks remaining: {current_intervention['ticks_remaining']}")
            if current_intervention["ticks_remaining"] <= 0:
                live_state["active_intervention"] = None
                print("⚡ Intervention expired.")

        #-- Setting up stock trend
        featured_stock = get_featured_stock()
        market_event = build_market_event(iteration, market_condition, featured_stock)
        live_state["market_event"] = market_event
        live_state["market_events"].insert(0, market_event)
        live_state["market_events"] = live_state["market_events"][:10]

        print(f"\n Market event: {market_event['title']} | {market_event['market_effect']}")
        print(f"\n Today stock trends: ")
        for feature in featured_stock:
            print(f"   {feature.stock.Stock_Name} "
                  f"| {feature.stock.Stock_Type} "
                  f"| trend: {feature.todays_trend}")

        tick_stock_data = {
            "tick": iteration,
            "stocks": []
        }
        
        stock_outcomes_this_tick = {}

        for agent in agents_pool:

            if agent.is_bankrupt:
                print(f"{agent.Agent_name} is bankrupt. Skipping current agent")
                continue

            # Step 1 — Build prompt
            prompt = build_prompt(
                agent, 
                market_condition, 
                featured_stock, 
                active_intervention=live_state.get("active_intervention"))

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

            stock_name = decision.stock.Stock_Name
            if stock_name not in stock_outcomes_this_tick:
                stock_outcomes_this_tick[stock_name] = {
                    "name": stock_name,
                    "type": decision.stock.Stock_Type,
                    "trend": decision.todays_trend,
                    "outcome": outcome
                }

            # Update the live state with the current tick, month, market condition, and diary entries
            live_state["current_tick"] = iteration
            live_state["current_month"] = ((iteration -1) //2) + 1
            live_state["market_condition"] = market_condition.condition

            # Determine if the agent's outcome is significant enough to be logged in the diary entries
            is_vocal = agent.is_bankrupt or abs(outcome) >= VOCAL_THRESHOLD
            if is_vocal:
                live_state["diary_entries"].append({
                    "Agent_name": agent.Agent_name,
                    "reasoning": reasoning,
                    "tick": iteration,
                    "type": "bankrupt" if agent.is_bankrupt else "swing",
                    "outcome": outcome
                })
                live_state["diary_entries"] = live_state["diary_entries"][-30:]  # Keep only the last 30 entries

            #-- TODO: This prints taken from Claude
            status = "Going UP" if outcome > 0 else ("Going DOWN" if outcome < 0 else "Stable")
            print(f"   {status} {agent.Agent_name} "
                  f"| Stock to buy: {decision.stock.Stock_Name} "
                  f"| outcome: {outcome:+d} "
                  f"| {previous_points} → {agent.financial_points} pts")
            print(f"| Reason from agent {agent.Agent_name} : \"{reasoning}\"")

            if agent.is_bankrupt:
                bankruptcy_summary(agent)


        tick_stock_data["stocks"] = list(stock_outcomes_this_tick.values())
        live_state["stock_history"].append(tick_stock_data)

        live_state["agent_points_history"].append({
            "tick": iteration,
            "points": [{
                "agent_name": agent.Agent_name,
                "financial_points": agent.financial_points,
                "is_bankrupt": agent.is_bankrupt
            } for agent in agents_pool]
        })
        live_state["agent_point_history"] = live_state["agent_points_history"]

        print(f"[backend] tick={iteration} live-state update -> stocks={len(live_state['stock_history'])} agent-points={len(live_state['agent_points_history'])} sample-stock={tick_stock_data['stocks'][:2]}")

        # Update the live state with the current financial points of all agents
        live_state["agent_snapshots"] = [{
            "Agent_name": agent.Agent_name,
            "financial_points": agent.financial_points,
            "current_asset_allocation": agent.current_asset_allocation,
            "is_bankrupt": agent.is_bankrupt
        } for agent in agents_pool]

        tick_end_points = {agent.Agent_name: agent.financial_points for agent in agents_pool}
        resolve_bet_after_tick(iteration, tick_start_points, tick_end_points)

        if iteration % 2 == 0:
            report = generate_report(iteration, market_condition, snapshots_points)
            reports.append(report)

            print(f"\nMONTHLY REPORT {report.Iteration_Month}:")
            print(f"Profits  : {report.agents_profits}")
            print(f"Loss     : {report.agents_loss}")
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