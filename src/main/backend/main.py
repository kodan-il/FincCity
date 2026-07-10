from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from schemas import AgentProfile, MarketCondition, MarketIntervention
from agents import agents_pool
from simulation import run_simulation, live_state, reset_simulation_state
from player import get_player_state, place_bet, reset_player_state


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable to track simulation status

class BetRequest(BaseModel):
    agent_name: str
    amount: int

simulation_status = {
    "running": False, 
    "finished": False,
    "current_tick" :0}


def run_simulation_background():
    try:
        run_simulation()
    except Exception as e:
        print(f"Error occurred while running simulation: {e}")
    finally:
        simulation_status["running"] = False
        simulation_status["finished"] = True
        simulation_status["current_tick"] = live_state.get("current_tick", 0)

@app.get("/api/agents", response_model=list[AgentProfile])
def get_agents():
    return agents_pool

# Sync agent endpoint to update agent parameters
@app.post("/api/agents/sync", response_model=AgentProfile)
def sync_agent(updated_agent: AgentProfile):
    for i, agent in enumerate(agents_pool):
        if agent.Agent_name == updated_agent.Agent_name:
            agents_pool[i] = updated_agent
            return updated_agent
    raise HTTPException(status_code=404, detail="Agent not found")

# Simulation endpoints
@app.post("/api/simulation/start-simulation")
def start_simulation(background_tasks: BackgroundTasks):
    if simulation_status["running"]:
        return {"status": "already_running"}

    # Reset agents, histories, graphs and live simulation state
    reset_simulation_state()

    # Reset Mayor Coins, active bet and betting history
    reset_player_state()

    # Reset status values before starting
    simulation_status["running"] = True
    simulation_status["finished"] = False
    simulation_status["current_tick"] = 0

    background_tasks.add_task(run_simulation_background)

    return {
        "status": "Simulation started",
        "message": "A fresh simulation has started."
    }

@app.get("/api/simulation/status")
def get_simulation_status():
    return simulation_status

@app.get("/api/simulation/live-state")
def get_live_state():
    return live_state

@app.get("/api/player")
def get_player():
    return get_player_state()

@app.post("/api/player/bet")
def create_bet(bet: BetRequest):
    try:
        valid_agent_names = [agent.Agent_name for agent in agents_pool]
        return place_bet(
            agent_name=bet.agent_name,
            amount=bet.amount,
            current_tick=live_state.get("current_tick", 0),
            valid_agent_names=valid_agent_names,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

@app.post("/api/player/reset")
def reset_player():
    return reset_player_state()

@app.post("/api/market/intervene")
def market_intervene(intervention: MarketIntervention):
    if not simulation_status["running"]:
        raise HTTPException(
            status_code=400,
            detail="Simulation is not running. Start simulation first."
        )
    live_state["active_intervention"] = {
        "intervention_type": intervention.intervention_type,
        "ticks_remaining":   intervention.ticks_remaining,
    }
    return {
        "status": "intervention_set",
        "intervention_type": intervention.intervention_type,
        "ticks_remaining": intervention.ticks_remaining,
    }

# if __name__ == "__main__":
#     run_simulation()