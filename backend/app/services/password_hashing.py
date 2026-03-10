from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def hash_password(password: str) -> str:
    # Password ကို byte အဖြစ်ပြောင်းပြီးမှ ၇၂ လုံးဖြတ်
    pwd_bytes = password.encode('utf-8')
    truncated_password = pwd_bytes[:72].decode('utf-8', errors='ignore')
    
    return pwd_context.hash(truncated_password)

async def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = plain_password.encode('utf-8')
        truncated_password = pwd_bytes[:72].decode('utf-8', errors='ignore')
        
        return pwd_context.verify(truncated_password, hashed_password)
    except Exception:
        return False