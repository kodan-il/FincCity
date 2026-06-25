from fastapi import FastAPI, HTTPException, BackgroundTasks
from simulation import run_simulation
from fastapi.middleware.cors import CORSMiddleware
from schemas import AgentProfile
from agents import agents_pool
from simulation import live_state


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable to track simulation status
simulation_status = {
    "running": False, 
    "finished": False,
    "current_tick" :0}


def run_simulation_background():
    simulation_status["running"] = True
    simulation_status["finished"] = False
    try:
        run_simulation()
    except Exception as e:
        print(f"Error occurred while running simulation: {e}")
    finally:
        simulation_status["running"] = False
        simulation_status["finished"] = True

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
    background_tasks.add_task(run_simulation_background)
    return {"status": "Simulation started"}

@app.get("/api/simulation/status")
def get_simulation_status():
    return simulation_status

@app.get("/api/simulation/live-state")
def get_live_state():
    return live_state
# if __name__ == "__main__":
#     run_simulation()