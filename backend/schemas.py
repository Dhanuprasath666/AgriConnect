from pydantic import BaseModel
from typing import Optional

class RegisterUser(BaseModel):
    name: str
    age: int
    mobile: str
    alternate_phone: str
    aadhar_number: str
    email: Optional[str] = None
    password: str
    state: str
    district: str
    village: str
    pincode: str
    soil_type: str
    land_area: str
    primary_crops: str
    role: str

class LoginUser(BaseModel):
    mobile: str
    password: str