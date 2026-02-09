from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, engine, USING_FALLBACK_DB
from sqlalchemy.exc import SQLAlchemyError, OperationalError
from models import Base, User
from schemas import RegisterUser, LoginUser
from auth import hash_password, verify_password
from auth_token import create_access_token, verify_token
import json
import urllib.parse
import urllib.request
from typing import Optional
from datetime import datetime


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

@app.on_event("startup")
def _startup_create_tables():
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        # Allow the server to start even if the DB is unreachable (dev/offline mode).
        # DB-backed endpoints will fail until connectivity is restored.
        print(f"[WARN] Database init failed: {e}")

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

def _fetch_json(url: str, timeout_s: int = 8):
    try:
        req = urllib.request.Request(
            url,
            headers={
                "Accept": "application/json",
                "User-Agent": "AgriConnect/1.0",
            },
        )
        with urllib.request.urlopen(req, timeout=timeout_s) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
            return json.loads(raw)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream API error: {e}")


def _open_meteo_geocode(name: str) -> Optional[dict]:
    return _open_meteo_geocode_best(name=name, state_hint=None)


def _normalize_text(value: str) -> str:
    return " ".join((value or "").strip().casefold().split())


def _split_location_text(location: str):
    raw = (location or "").strip()
    if not raw:
        return ("", None, None)

    parts = [p.strip() for p in raw.split(",") if p.strip()]
    if not parts:
        return (raw, None, None)

    name = parts[0]
    state_hint = parts[1] if len(parts) >= 2 else None
    country_hint = parts[-1] if len(parts) >= 3 else None
    return (name, state_hint, country_hint)


def _open_meteo_geocode_best(name: str, state_hint: Optional[str]) -> Optional[dict]:
    query_raw = (name or "").strip()
    if not query_raw:
        return None

    query, parsed_state_hint, _ = _split_location_text(query_raw)
    q_norm = " ".join(query.split())
    q_cf = q_norm.casefold()
    for suffix in [" district", " dist", " dt"]:
        if q_cf.endswith(suffix):
            q_norm = q_norm[: -len(suffix)].strip()
            break
    query = q_norm
    effective_state_hint = state_hint or parsed_state_hint

    base = "https://geocoding-api.open-meteo.com/v1/search"
    params = urllib.parse.urlencode(
        {
            "name": query,
            "count": 10,
            "language": "en",
            "format": "json",
        }
    )
    data = _fetch_json(f"{base}?{params}")
    results = data.get("results") if isinstance(data, dict) else None
    if not isinstance(results, list) or not results:
        return None

    norm_state = _normalize_text(effective_state_hint) if effective_state_hint else ""

    def score(item: dict) -> int:
        if not isinstance(item, dict):
            return -10_000

        s = 0
        if item.get("country_code") == "IN":
            s += 50
        if norm_state and _normalize_text(str(item.get("admin1") or "")) == norm_state:
            s += 40
        # Prefer bigger places if multiple hits.
        try:
            pop = int(item.get("population") or 0)
        except Exception:
            pop = 0
        s += min(pop // 100_000, 20)
        return s

    best = None
    best_score = -10_000
    for r in results:
        if not isinstance(r, dict):
            continue
        sc = score(r)
        if sc > best_score:
            best = r
            best_score = sc

    return best if isinstance(best, dict) else None


def _open_meteo_weather(lat: float, lng: float) -> dict:
    base = "https://api.open-meteo.com/v1/forecast"
    params = urllib.parse.urlencode(
        {
            "latitude": str(lat),
            "longitude": str(lng),
            "current": "temperature_2m,wind_speed_10m,relative_humidity_2m,weather_code",
            "hourly": "precipitation_probability",
            "timezone": "auto",
        }
    )
    data = _fetch_json(f"{base}?{params}")
    if not isinstance(data, dict):
        raise HTTPException(status_code=502, detail="Weather API returned invalid response")

    current = data.get("current") if isinstance(data.get("current"), dict) else {}
    hourly = data.get("hourly") if isinstance(data.get("hourly"), dict) else {}

    now_time = current.get("time")
    hourly_times = hourly.get("time") if isinstance(hourly.get("time"), list) else []
    hourly_rain = (
        hourly.get("precipitation_probability")
        if isinstance(hourly.get("precipitation_probability"), list)
        else []
    )

    rain_prob = None
    try:
        if now_time and hourly_times and hourly_rain:
            idx = hourly_times.index(now_time)
            if idx >= 0:
                rain_prob = hourly_rain[idx]
    except Exception:
        rain_prob = None

    def to_num(v):
        try:
            n = float(v)
            return n
        except Exception:
            return None

    return {
        "fetchedAt": datetime.utcnow().isoformat() + "Z",
        "time": now_time,
        "temperatureC": to_num(current.get("temperature_2m")),
        "windSpeedKmh": to_num(current.get("wind_speed_10m")),
        "humidityPercent": to_num(current.get("relative_humidity_2m")),
        "rainProbabilityPercent": to_num(rain_prob),
        "weatherCode": to_num(current.get("weather_code")),
    }


def _build_geo_label(geo: dict) -> str:
    if not isinstance(geo, dict):
        return ""

    def norm(v: str) -> str:
        return " ".join((v or "").strip().casefold().split())

    def add_unique(parts: list, value: str):
        v = (value or "").strip()
        if not v:
            return
        nv = norm(v)
        if not nv:
            return
        if any(norm(p) == nv for p in parts):
            return
        parts.append(v)

    admin2 = (geo.get("admin2") or "").strip()
    name = (geo.get("name") or "").strip()
    district = admin2 or name
    district_norm = norm(district)
    if district and "district" not in district_norm:
        district = f"{district} district"

    parts: list = []
    add_unique(parts, district)
    add_unique(parts, str(geo.get("admin1") or ""))
    add_unique(parts, str(geo.get("country") or ""))

    return ", ".join(parts)


def _build_location_query(db_user: User) -> str:
    # Open-Meteo geocoding works best with just the place name.
    # Prefer district first (user input), then village.
    for v in [db_user.district, db_user.village, db_user.state, db_user.pincode]:
        if isinstance(v, str) and v.strip():
            return v.strip()
    return ""


# ---------------- PUBLIC ROUTES ----------------

@app.post("/register")
def register(user: RegisterUser, db: Session = Depends(get_db)):

    try:
        existing_user = db.query(User).filter(User.mobile == user.mobile).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Mobile number already registered")
    except OperationalError as e:
        raise HTTPException(
            status_code=503,
            detail=(
                "Database unreachable. If you're using Supabase and your network is IPv4-only, "
                "use the Supabase Session pooler DATABASE_URL (aws-0-<region>.pooler.supabase.com:5432). "
                f"Error: {e.__class__.__name__}"
            ),
        )
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e.__class__.__name__}")

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
        role=user.role
    )

    try:
        db.add(new_user)
        db.commit()
    except OperationalError as e:
        raise HTTPException(
            status_code=503,
            detail=(
                "Database unreachable while saving user. If you're using Supabase and your network is IPv4-only, "
                "use the Supabase Session pooler DATABASE_URL (aws-0-<region>.pooler.supabase.com:5432). "
                f"Error: {e.__class__.__name__}"
            ),
        )
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e.__class__.__name__}")

    return {"message": "Registered successfully"}



@app.post("/login")
def login(user: LoginUser, db: Session = Depends(get_db)):

    try:
        db_user = db.query(User).filter(User.mobile == user.mobile).first()
    except OperationalError as e:
        raise HTTPException(
            status_code=503,
            detail=(
                "Database unreachable. If you're using Supabase and your network is IPv4-only, "
                "use the Supabase Session pooler DATABASE_URL (aws-0-<region>.pooler.supabase.com:5432). "
                f"Error: {e.__class__.__name__}"
            ),
        )
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e.__class__.__name__}")

    if not db_user:
        if USING_FALLBACK_DB:
            raise HTTPException(
                status_code=503,
                detail="Auth database is running in local fallback mode (Supabase unreachable). Please register again locally or restore DATABASE_URL connectivity.",
            )
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token(
        {"user_id": db_user.id, "role": db_user.role}
    )
    return {
        "message": "Login success",
        "role": db_user.role,
        "user_id": db_user.id,
        "name": db_user.name,
        "access_token": access_token,
        "token_type": "bearer",
        "location": {
            "state": db_user.state,
            "district": db_user.district,
            "village": db_user.village,
            "pincode": db_user.pincode,
        },
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
        "village": db_user.village,
        "pincode": db_user.pincode,
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


# ---------------- WEATHER ROUTES ----------------

@app.get("/weather")
def weather_by_location(location: str):
    name, state_hint, _ = _split_location_text(location)
    geo = _open_meteo_geocode_best(name=name, state_hint=state_hint)
    if not geo:
        raise HTTPException(status_code=404, detail="Location not found")

    lat = geo.get("latitude")
    lng = geo.get("longitude")
    if lat is None or lng is None:
        raise HTTPException(status_code=502, detail="Geocoding API returned invalid coordinates")

    weather = _open_meteo_weather(float(lat), float(lng))
    label = _build_geo_label(geo) or (location or "").strip()

    return {
        "location": {
            "query": (location or "").strip(),
            "label": label,
            "lat": float(lat),
            "lng": float(lng),
        },
        "weather": weather,
    }


@app.get("/weather/me")
def weather_for_current_user(
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_user = db.query(User).filter(User.id == user["user_id"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    district = (db_user.district or "").strip()
    state = (db_user.state or "").strip()
    location_query = district or _build_location_query(db_user)
    if not location_query:
        raise HTTPException(status_code=400, detail="User location not set")

    geo = _open_meteo_geocode_best(name=location_query, state_hint=state)
    if not geo:
        raise HTTPException(status_code=404, detail="Location not found")

    lat = geo.get("latitude")
    lng = geo.get("longitude")
    if lat is None or lng is None:
        raise HTTPException(status_code=502, detail="Geocoding API returned invalid coordinates")

    weather = _open_meteo_weather(float(lat), float(lng))
    label = _build_geo_label(geo) or location_query

    return {
        "location": {
            "query": location_query,
            "label": label,
            "lat": float(lat),
            "lng": float(lng),
        },
        "weather": weather,
    }

# ---------------- CONSUMER ROUTES ----------------

@app.get("/consumer/dashboard")
def consumer_dashboard(user=Depends(get_current_user)):

    if user["role"] != "consumer":
        raise HTTPException(status_code=403, detail="Consumer only access")

    return {"message": "Welcome Consumer"}


@app.get("/health/db")
def db_health():
    return {
        "using_fallback_db": USING_FALLBACK_DB,
    }

