from pydantic import BaseModel

class RegisterUser(BaseModel):
    mobile: str
    password: str
    role: str

class LoginUser(BaseModel):
    mobile: str
    password: str

