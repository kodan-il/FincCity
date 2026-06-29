from typing import Dict, List, Optional

INITIAL_PLAYER_COINS = 100

human_player = {
    "coins": INITIAL_PLAYER_COINS,
    "active_bet": None,
    "history": []
}


def get_player_state():
    return human_player


def reset_player_state():
    human_player["coins"] = INITIAL_PLAYER_COINS
    human_player["active_bet"] = None
    human_player["history"] = []
    return human_player


def place_bet(agent_name: str, amount: int, current_tick: int, valid_agent_names: List[str]):
    if agent_name not in valid_agent_names:
        raise ValueError("Unknown citizen selected.")

    if amount <= 0:
        raise ValueError("Bet amount must be greater than 0.")

    if human_player["active_bet"] is not None:
        raise ValueError("You already have an active bet waiting for the next tick.")

    if amount > human_player["coins"]:
        raise ValueError("Not enough Mayor Coins.")

    human_player["coins"] -= amount
    human_player["active_bet"] = {
        "agent_name": agent_name,
        "amount": amount,
        "placed_at_tick": current_tick,
        "target_tick": current_tick + 1,
        "status": "waiting"
    }

    return human_player


def resolve_bet_after_tick(tick: int, before_points: Dict[str, int], after_points: Dict[str, int]):
    active_bet: Optional[dict] = human_player.get("active_bet")
    if not active_bet:
        return human_player

    # Only resolve bets that were placed before this tick started.
    if tick <= active_bet.get("placed_at_tick", 0):
        return human_player

    deltas = {
        agent_name: after_points.get(agent_name, before)
        - before
        for agent_name, before in before_points.items()
    }

    if not deltas:
        return human_player

    best_gain = max(deltas.values())
    winners = [agent_name for agent_name, gain in deltas.items() if gain == best_gain]

    selected_agent = active_bet["agent_name"]
    amount = active_bet["amount"]
    selected_gain = deltas.get(selected_agent, 0)
    won = selected_agent in winners

    payout = amount * 2 if won else 0
    if won:
        human_player["coins"] += payout

    result = {
        "agent_name": selected_agent,
        "amount": amount,
        "placed_at_tick": active_bet["placed_at_tick"],
        "resolved_at_tick": tick,
        "status": "won" if won else "lost",
        "net": amount if won else -amount,
        "payout": payout,
        "agent_gain": selected_gain,
        "winning_gain": best_gain,
        "winning_agents": winners
    }

    human_player["history"].insert(0, result)
    human_player["history"] = human_player["history"][:12]
    human_player["active_bet"] = None

    return human_player
