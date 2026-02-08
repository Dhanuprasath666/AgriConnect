from sqlalchemy import Column, Integer, String, ForeignKey

from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String)
    age = Column(Integer)

    mobile = Column(String, unique=True, index=True)
    alternate_phone = Column(String)

    aadhar_number = Column(String)

    email = Column(String, nullable=True)

    state = Column(String)
    district = Column(String)
    village = Column(String)
    pincode = Column(String)

    soil_type = Column(String)
    land_area = Column(String)
    primary_crops = Column(String)

    password = Column(String)
    role = Column(String)



