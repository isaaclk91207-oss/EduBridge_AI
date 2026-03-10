from pydantic import BaseModel, field_validator
from typing import List, Optional

class ChatRequest(BaseModel):
    user_id: str
    message: str
    history: Optional[List[dict]] = []      #Type Hinting လို့ခေါ်တဲ့ နည်းလမ်းနဲ့ AI ကို ရှေ့ကပြောခဲ့တဲ့ စကားတွေကို မှတ်မိခိုင်းဖို့ (Memory ပေးဖို့) ရေး

class VideoResponse(BaseModel):
    title: str
    link: str

class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    student_type: Optional[str] = "public"
    major: Optional[str] = ""

    @field_validator("password")
    def password_password_validator(cls, value):
        is_upper = any(x.isupper() for x in value)
        is_digit = any(x.isdigit() for x in value)

        if len(value) < 6 or not is_upper or not is_digit:
            raise ValueError(
                "Password must be at least 6 characters and include one uppercase letter and one number"
            )
        return value

class UserLogin(BaseModel):
    email: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email: str
    new_password: str
