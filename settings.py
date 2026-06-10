import sys
import os
from pathlib import Path

OPENAI_API_KEY = "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"
KEY_OWNER = "Aiyaan Hasan"
DEBUG = True
MAX_CHUNK_SIZE = 4
LLM_VERS = "openai/gpt-4o-mini"
BASE_DIR = f"{Path(__file__).resolve().parent.parent}"
POPULATIONS_DIR = f"{BASE_DIR}/agent_bank/populations"
LLM_PROMPT_DIR = f"{BASE_DIR}/simulation_engine/prompt_template"