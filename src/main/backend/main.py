from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import AgentProfile
from agents import agents_pool

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/agents", response_model=list[AgentProfile])
def get_agents():
    return agents_pool

@app.post("/api/agents/sync", response_model=AgentProfile)
def sync_agent(updated_agent: AgentProfile):
    for i, agent in enumerate(agents_pool):
        if agent.Agent_name == updated_agent.Agent_name:
            agents_pool[i] = updated_agent
            return updated_agent
    raise HTTPException(status_code=404, detail="Agent not found")

# if __name__ == "__main__":
#     run_simulation()