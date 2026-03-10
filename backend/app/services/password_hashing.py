import bcrypt

async def hash_password(password: str) -> str:
    # 1. UTF-8 encoded bytes အဖြစ်ပြောင်း
    pwd_bytes = password.encode('utf-8')
    
    # 2. 72 bytes ကိုသာ ဖြတ်ယူပါ (Bcrypt limit)
    truncated_pwd = pwd_bytes[:72]
    
    # 3. Hash လုပ်ပါ (salt အလိုအလျောက်ပါဝင်ပြီးသားဖြစ်သည်)
    hashed = bcrypt.hashpw(truncated_pwd, bcrypt.gensalt())
    
    # 4. String အဖြစ် ပြန်ပြောင်းပါ
    return hashed.decode('utf-8')

async def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = plain_password.encode('utf-8')[:72]
        hashed_bytes = hashed_password.encode('utf-8')
        
        # Bcrypt က တိုက်ရိုက် verify လုပ်ပေးပါလိမ့်မယ်
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception:
        return False