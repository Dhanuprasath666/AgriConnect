from pydantic import BaseModel

class RegisterUser(BaseModel):
    name: str
    mobile: str
    email: str
    password: str
    role: str
    state: str
    district: str
    village: str

class LoginUser(BaseModel):
    mobile: str
    password: str
