from openai import AsyncOpenAI
import json
import re
from backend.core.config import LM_STUDIO_BASE_URL

client = AsyncOpenAI(
    base_url=LM_STUDIO_BASE_URL,
    api_key="lm-studio"  # Required but ignored by LM Studio
)

def parse_slash_commands(text: str) -> list:
    commands = []
    for line in text.split('\n'):
        line = line.strip()
        if line.startswith('/exec '):
            commands.append({"action": "RUN", "command": line[6:].strip()})
        elif line.startswith('/create '):
            commands.append({"action": "CREATE", "file": line[8:].strip()})
        elif line.startswith('/modify '):
            commands.append({"action": "MODIFY", "file": line[8:].strip()})
    return commands

def extract_code_block(text: str) -> str:
    match = re.search(r'```(?:[\w\-\.]+)?\n(.*?)\n```', text, re.DOTALL)
    if match:
        return match.group(1)
    return text.strip()

async def generate_completion(
    model: str,
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.7
) -> str:
    response = await client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=temperature
    )
    return response.choices[0].message.content
