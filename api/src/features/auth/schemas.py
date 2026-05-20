from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str


class StudentResponse(BaseModel):
    id: int
    name: str
    email: str
