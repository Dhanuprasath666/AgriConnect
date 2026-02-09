from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, User
from schemas import RegisterUser, LoginUser
from auth import hash_password, verify_password
from auth_token import create_access_token, verify_token


from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer

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

# ---------------- AUTH SETUP ----------------

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload

# ---------------- PUBLIC ROUTES ----------------

@app.post("/register")
def register(user: RegisterUser, db: Session = Depends(get_db)):
    role = (user.role or "").strip().lower()

    if role not in {"farmer", "consumer"}:
        raise HTTPException(status_code=422, detail="Invalid role.")

    if role == "farmer":
        required_fields = [
            ("age", user.age),
            ("alternate_phone", user.alternate_phone),
            ("aadhar_number", user.aadhar_number),
            ("state", user.state),
            ("district", user.district),
            ("village", user.village),
            ("pincode", user.pincode),
            ("soil_type", user.soil_type),
            ("land_area", user.land_area),
            ("primary_crops", user.primary_crops),
        ]
    else:
        required_fields = [
            ("alternate_phone", user.alternate_phone),
            ("state", user.state),
            ("district", user.district),
            ("village", user.village),
        ]

    missing = [name for name, value in required_fields if value is None or str(value).strip() == ""]
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Missing required fields: {', '.join(missing)}.",
        )

    existing_user = db.query(User).filter(User.mobile == user.mobile).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Mobile number already registered")

    new_user = User(
        name=user.name,
        age=user.age,
        mobile=user.mobile,
        alternate_phone=user.alternate_phone,
        aadhar_number=user.aadhar_number,
        email=user.email,
        password=hash_password(user.password),
        state=user.state,
        district=user.district,
        village=user.village,
        pincode=user.pincode,
        soil_type=user.soil_type,
        land_area=user.land_area,
        primary_crops=user.primary_crops,
        role=role
    )

    db.add(new_user)
    db.commit()

    return {"message": "Registered successfully"}



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


# ---------------- COMMON PROTECTED ROUTES ----------------

@app.get("/profile")
def get_profile(user=Depends(get_current_user),
                db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.id == user["user_id"]).first()

    return {
        "name": db_user.name,
        "mobile": db_user.mobile,
        "email": db_user.email,
        "role": db_user.role,
        "state": db_user.state,
        "district": db_user.district,
        "village": db_user.village
    }


@app.put("/profile")
def update_profile(data: RegisterUser,
                   user=Depends(get_current_user),
                   db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.id == user["user_id"]).first()

    db_user.name = data.name
    db_user.email = data.email
    db_user.state = data.state
    db_user.district = data.district
    db_user.village = data.village

    db.commit()
    return {"message": "Profile updated"}

# ---------------- FARMER ROUTES ----------------

@app.get("/farmer/dashboard")
def farmer_dashboard(user=Depends(get_current_user)):

    if user["role"] != "farmer":
        raise HTTPException(status_code=403, detail="Farmer only access")

    return {"message": "Welcome Farmer"}

# ---------------- CONSUMER ROUTES ----------------

@app.get("/consumer/dashboard")
def consumer_dashboard(user=Depends(get_current_user)):

    if user["role"] != "consumer":
        raise HTTPException(status_code=403, detail="Consumer only access")

    return {"message": "Welcome Consumer"}

