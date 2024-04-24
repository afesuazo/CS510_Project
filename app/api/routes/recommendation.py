import logging
from fastapi import APIRouter, status

router = APIRouter()

logger = logging.getLogger("pyvault.api.dashboard")
logging.basicConfig(level=logging.DEBUG)


# ----------------- Test Endpoints -----------------


@router.get("/ping")
async def ping() -> dict[str, str]:
    return {"ping": "pong!"}


# ----------------- Recommendations -----------------


@router.get(
    "/",
    summary="Get a recommendation based on input data",
    status_code=status.HTTP_200_OK
)
async def create_site() -> list[str]:
    # TODO: Call model method with the incoming request data as parameters
    recommended_key_words = []
    return recommended_key_words
