from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth
from app.routers import pg 
from app.routers import room
from app.routers import bed
from app.routers import tenant

app = FastAPI(title="MyPG Backend")

# Add CORS middleware to allow frontend requests with cookies
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,  # Allow cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(pg.router)
app.include_router(room.router)
app.include_router(bed.router)
app.include_router(tenant.router)

@app.get("/")
def root():
    return {"message": "MyPG backend running"}
