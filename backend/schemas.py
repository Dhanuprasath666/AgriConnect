from pydantic import BaseModel
from typing import Optional

class RegisterUser(BaseModel):
    name: str
    age: Optional[int] = None
    mobile: str
    alternate_phone: Optional[str] = None
    aadhar_number: Optional[str] = None
    email: Optional[str] = None
    password: str
    state: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    pincode: Optional[str] = None
    soil_type: Optional[str] = None
    land_area: Optional[str] = None
    primary_crops: Optional[str] = None
    role: str

class LoginUser(BaseModel):
    mobile: str
    password: str
