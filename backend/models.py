from sqlalchemy import Column, Integer, String
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    mobile = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)   # farmer or consumer
