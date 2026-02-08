from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, User
from schemas import RegisterUser, LoginUser
from auth import hash_password, verify_password

from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
#Register
@app.post("/register")
def register(user: RegisterUser, db: Session = Depends(get_db)):

    # check mobile exists
    existing = db.query(User).filter(User.mobile == user.mobile).first()
    if existing:
        raise HTTPException(status_code=400, detail="Mobile already registered")

    new_user = User(
        name=user.name,
        mobile=user.mobile,
        email=user.email,
        password=hash_password(user.password),
        role=user.role,
        state=user.state,
        district=user.district,
        village=user.village
    )

    db.add(new_user)
    db.commit()

    return {"message": "Registered successfully"}

# Login
@app.post("/login")
def login(user: LoginUser, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.mobile == user.mobile).first()

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    return {
        "message": "Login success",
        "role": db_user.role,
        "user_id": db_user.id
    }
