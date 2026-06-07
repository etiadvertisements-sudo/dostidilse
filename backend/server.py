from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import asyncio
import logging
import hmac
import hashlib
import bcrypt
import jwt
import pyotp
import razorpay
import resend
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List
import uuid
from datetime import datetime, timezone, timedelta


# ============ Config ============
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', '')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', '')

razorpay_client = None
if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET and RAZORPAY_KEY_ID != 'rzp_test_placeholder':
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 12
PRE_AUTH_EXPIRY_MINUTES = 5
TOTP_ISSUER = "Dosti Dil Se"

ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@dostidilse.org').lower()
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'Dosti@2026')

# Resend email configuration
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
SENDER_NAME = os.environ.get('SENDER_NAME', 'Dosti Dil Se')
REPLY_TO_EMAIL = os.environ.get('REPLY_TO_EMAIL', 'connect@dostidilse.org')
PUBLIC_SITE_URL = os.environ.get('PUBLIC_SITE_URL', 'https://dostidilse.org')
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Dosti Dil Se API")
api_router = APIRouter(prefix="/api")


# ============ Auth Helpers ============
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(email: str) -> str:
    payload = {
        "sub": email,
        "role": "admin",
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_pre_auth_token(email: str) -> str:
    payload = {
        "sub": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=PRE_AUTH_EXPIRY_MINUTES),
        "type": "pre_auth",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_pre_auth_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Login window expired. Please sign in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid session. Please sign in again.")
    if payload.get("type") != "pre_auth":
        raise HTTPException(status_code=401, detail="Invalid session. Please sign in again.")
    return payload["sub"]


# ============ Email (Resend) ============
def _build_thank_you_email_html(name: str, amount: float, gift_to: Optional[str], gift_occasion: Optional[str]) -> str:
    """Warm, emotional HTML thank-you email. Inline CSS, table layout for max email-client support."""
    first_name = (name or "friend").strip().split(" ")[0] or "friend"
    amount_str = f"&#8377;{int(amount):,}" if amount and amount == int(amount) else f"&#8377;{amount:,.0f}"
    dedication_block = ""
    if gift_to:
        occ = gift_occasion or "In celebration of"
        dedication_block = f"""
        <tr>
          <td align="center" style="padding:0 32px 24px 32px;">
            <div style="display:inline-block;background:#FDF3EC;color:#C7794F;border-radius:999px;padding:10px 20px;font-family:Georgia,serif;font-style:italic;font-size:15px;">
              &#127873; {occ} &middot; In {gift_to}&rsquo;s name
            </div>
          </td>
        </tr>"""

    return f"""<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#FDFBF7;font-family:'Helvetica Neue',Arial,sans-serif;color:#2C3E42;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDFBF7;padding:40px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #EBE7E0;border-radius:20px;overflow:hidden;">
        <tr>
          <td align="center" style="padding:36px 32px 12px 32px;">
            <div style="font-size:12px;letter-spacing:6px;color:#D99F80;font-weight:600;">&middot; DOSTI DIL SE &middot;</div>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:8px 32px 0 32px;">
            <h1 style="margin:0;font-family:Georgia,serif;font-size:34px;line-height:1.2;color:#2C3E42;font-weight:400;">
              Thank you, <span style="font-style:italic;color:#5A8896;">{first_name}</span>.
            </h1>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:16px 40px 8px 40px;">
            <p style="margin:0;font-size:16px;line-height:1.7;color:#5C757B;">
              We received your contribution of <strong style="color:#2C3E42;">{amount_str}</strong>. It doesn&rsquo;t sit in a bank statement for us &mdash; it becomes a slightly lighter walk for a child, a quieter night for a parent, a little more hope in a classroom.
            </p>
          </td>
        </tr>
        {dedication_block}
        <tr>
          <td align="center" style="padding:12px 40px 8px 40px;">
            <p style="margin:0;font-family:Georgia,serif;font-style:italic;font-size:20px;line-height:1.5;color:#2C3E42;">
              &ldquo;The smallest hands, when held at the right moment, become the bravest ones.&rdquo;
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:16px 40px 4px 40px;">
            <p style="margin:0;font-size:15px;line-height:1.7;color:#5C757B;">
              Your face now rests on our <strong style="color:#2C3E42;">Wall of Hearts</strong> &mdash; a quiet reminder that kindness, when it shows up, is never alone.
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:28px 32px 12px 32px;">
            <a href="{PUBLIC_SITE_URL}#wall" style="display:inline-block;background:#5A8896;color:#FFFFFF;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:14px;font-weight:600;letter-spacing:0.3px;">See your heart on the wall &rarr;</a>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:0 32px 36px 32px;">
            <p style="margin:0;font-size:13px;line-height:1.7;color:#8A9498;">
              With love,<br/>
              <span style="color:#2C3E42;font-weight:600;">The Dosti Dil Se team</span><br/>
              <a href="mailto:{REPLY_TO_EMAIL}" style="color:#5A8896;text-decoration:none;">{REPLY_TO_EMAIL}</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#F2EFE9;padding:18px 32px;" align="center">
            <div style="font-size:11px;color:#8A9498;line-height:1.6;">
              You are receiving this because you contributed at {PUBLIC_SITE_URL}. <br/>
              100% of your contribution goes directly to the cause.
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>"""


async def send_thank_you_email(donation: dict) -> None:
    """Fire-and-forget thank you email. Never raises — email failure must not fail the donation."""
    if not RESEND_API_KEY:
        logger.info("Resend not configured — skipping thank-you email")
        return
    try:
        to_email = donation.get("email")
        if not to_email:
            return
        html = _build_thank_you_email_html(
            name=donation.get("name", "friend"),
            amount=float(donation.get("amount", 0)),
            gift_to=donation.get("gift_to"),
            gift_occasion=donation.get("gift_occasion"),
        )
        params = {
            "from": f"{SENDER_NAME} <{SENDER_EMAIL}>",
            "to": [to_email],
            "subject": f"A quiet thank you, {donation.get('name', 'friend').split(' ')[0]} \u2014 from Dosti Dil Se",
            "html": html,
            "reply_to": REPLY_TO_EMAIL,
        }
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Thank-you email sent to {to_email}: {result.get('id') if isinstance(result, dict) else result}")
    except Exception as e:
        logger.error(f"Failed to send thank-you email: {e}")


async def get_current_admin(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Forbidden")
        admin = await db.admins.find_one({"email": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not admin:
            raise HTTPException(status_code=401, detail="Admin not found")
        return admin
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ============ Models ============
class DonationCreate(BaseModel):
    amount: float = Field(..., ge=10, description="Amount in INR, minimum ₹10")
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    message: Optional[str] = None
    photo_base64: Optional[str] = Field(None, description="Donor photo as base64 data URL")
    # Gift option (only when amount >= 500)
    gift_to: Optional[str] = Field(None, max_length=100, description="Dedication — name the gift is for")
    gift_occasion: Optional[str] = Field(None, max_length=40, description="Birthday, Anniversary, Memorial, Festival, Other")


class DonationOrderResponse(BaseModel):
    order_id: str
    amount: int
    currency: str
    key_id: str
    donation_id: str


class PaymentVerify(BaseModel):
    donation_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class WallDonor(BaseModel):
    name: str
    amount: float
    photo_base64: Optional[str] = None
    message: Optional[str] = None
    gift_to: Optional[str] = None
    gift_occasion: Optional[str] = None
    created_at: str


class ContactCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(..., min_length=1, max_length=2000)


class ContactMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str
    message: str
    created_at: str


class Stats(BaseModel):
    total_raised: float
    donors_count: int
    paid_donations_count: int
    students_helped: int
    projects_completed: int


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class AdminLoginResponse(BaseModel):
    step: str  # "setup" | "code"
    pre_auth_token: str
    provisioning_uri: Optional[str] = None  # only on "setup"


class TotpVerify(BaseModel):
    pre_auth_token: str
    code: str = Field(..., min_length=6, max_length=6)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: str


class ProjectCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=5000)
    status: str = Field(..., pattern="^(completed|upcoming)$")
    date: str  # ISO date (yyyy-mm-dd)
    location: Optional[str] = None
    children_helped: Optional[int] = Field(None, ge=0)
    image_base64: Optional[str] = None


class TeamMemberCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    role: str = Field(..., min_length=1, max_length=120)
    bio: str = Field(..., min_length=1, max_length=1000)
    photo_base64: Optional[str] = None
    order: int = 0


class TeamMember(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    role: str
    bio: str
    photo_base64: Optional[str] = None
    order: int = 0
    created_at: str


class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    description: str
    status: str
    date: str
    location: Optional[str] = None
    children_helped: Optional[int] = None
    image_base64: Optional[str] = None
    created_at: str


class AdminDonation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    message: Optional[str] = None
    amount: float
    currency: str
    status: str
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    photo_base64: Optional[str] = None
    gift_to: Optional[str] = None
    gift_occasion: Optional[str] = None
    created_at: str


# ============ Startup: seed admin ============
@app.on_event("startup")
async def on_startup():
    existing = await db.admins.find_one({"email": ADMIN_EMAIL})
    if existing is None:
        await db.admins.insert_one({
            "email": ADMIN_EMAIL,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded admin: {ADMIN_EMAIL}")
    else:
        # Keep hash in sync with env (idempotent)
        if not verify_password(ADMIN_PASSWORD, existing.get("password_hash", "")):
            await db.admins.update_one(
                {"email": ADMIN_EMAIL},
                {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}},
            )
            logger.info(f"Updated admin password hash for {ADMIN_EMAIL}")

    # Seed dummy team members only if collection is empty
    team_count = await db.team_members.count_documents({})
    if team_count == 0:
        # No dummies — keep the Core Team section hidden until the real team is added via /admin → Team
        logger.info("No team members found — team section will stay hidden until admin adds real members")


# ============ Routes ============
@api_router.get("/")
async def root():
    return {"message": "Dosti Dil Se API - Spreading Love & Hope"}


# ----- Admin Auth -----
@api_router.post("/admin/login", response_model=AdminLoginResponse)
async def admin_login(payload: AdminLogin):
    email = payload.email.lower()
    admin = await db.admins.find_one({"email": email})
    if not admin or not verify_password(payload.password, admin.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    totp_secret = admin.get("totp_secret")
    setup_shown = admin.get("totp_setup_shown", False)
    pre_auth = create_pre_auth_token(email)

    # First-ever login: generate secret, show QR exactly once, mark as shown
    if not totp_secret or not setup_shown:
        if not totp_secret:
            totp_secret = pyotp.random_base32()
        await db.admins.update_one(
            {"email": email},
            {"$set": {
                "totp_secret": totp_secret,
                "totp_setup_shown": True,
                "totp_verified": admin.get("totp_verified", False),
            }},
        )
        uri = pyotp.TOTP(totp_secret).provisioning_uri(name=email, issuer_name=TOTP_ISSUER)
        return AdminLoginResponse(step="setup", pre_auth_token=pre_auth, provisioning_uri=uri)

    # All subsequent logins — only the 6-digit code screen, never the QR
    return AdminLoginResponse(step="code", pre_auth_token=pre_auth)


@api_router.post("/admin/verify-totp", response_model=TokenResponse)
async def admin_verify_totp(payload: TotpVerify):
    email = decode_pre_auth_token(payload.pre_auth_token)
    admin = await db.admins.find_one({"email": email})
    if not admin or not admin.get("totp_secret"):
        raise HTTPException(status_code=401, detail="No authenticator configured")

    totp = pyotp.TOTP(admin["totp_secret"])
    if not totp.verify(payload.code, valid_window=1):
        raise HTTPException(status_code=401, detail="Invalid authenticator code")

    if not admin.get("totp_verified"):
        await db.admins.update_one({"email": email}, {"$set": {"totp_verified": True}})

    token = create_access_token(email)
    return TokenResponse(access_token=token, email=email)


@api_router.post("/admin/reset-totp")
async def admin_reset_totp(_: dict = Depends(get_current_admin)):
    """Allow an authenticated admin to reset their authenticator (e.g. lost phone).
    Clears totp_setup_shown so the QR will appear exactly once on the next login."""
    admin_email = _.get("email")
    new_secret = pyotp.random_base32()
    await db.admins.update_one(
        {"email": admin_email},
        {"$set": {
            "totp_secret": new_secret,
            "totp_verified": False,
            "totp_setup_shown": False,
        }},
    )
    return {"success": True, "message": "Authenticator reset. Log out and log in again to see a fresh QR once."}


@api_router.get("/admin/me")
async def admin_me(admin: dict = Depends(get_current_admin)):
    return {"email": admin["email"]}


# ----- Donations -----
@api_router.post("/donations/create-order", response_model=DonationOrderResponse)
async def create_donation_order(payload: DonationCreate):
    donation_id = str(uuid.uuid4())
    amount_paise = int(payload.amount * 100)
    order_id = f"order_mock_{donation_id[:12]}"

    if razorpay_client is not None:
        try:
            order = razorpay_client.order.create({
                "amount": amount_paise,
                "currency": "INR",
                "receipt": donation_id[:40],
                "payment_capture": 1,
            })
            order_id = order["id"]
        except Exception as e:
            logger.error(f"Razorpay order creation failed: {e}")
            raise HTTPException(status_code=500, detail="Could not create payment order")

    donation_doc = {
        "id": donation_id,
        "name": payload.name,
        "email": payload.email,
        "phone": payload.phone,
        "message": payload.message,
        "amount": payload.amount,
        "currency": "INR",
        "status": "created",
        "razorpay_order_id": order_id,
        "razorpay_payment_id": None,
        "photo_base64": payload.photo_base64,
        "gift_to": payload.gift_to if payload.amount >= 500 else None,
        "gift_occasion": payload.gift_occasion if payload.amount >= 500 else None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.donations.insert_one(donation_doc)

    return DonationOrderResponse(
        order_id=order_id,
        amount=amount_paise,
        currency="INR",
        key_id=RAZORPAY_KEY_ID or "",
        donation_id=donation_id,
    )


@api_router.post("/donations/verify")
async def verify_donation_payment(payload: PaymentVerify):
    donation = await db.donations.find_one({"id": payload.donation_id}, {"_id": 0})
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    if razorpay_client is not None and RAZORPAY_KEY_SECRET and RAZORPAY_KEY_SECRET != 'placeholder_secret':
        body = f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}"
        expected = hmac.new(RAZORPAY_KEY_SECRET.encode(), body.encode(), hashlib.sha256).hexdigest()
        if expected != payload.razorpay_signature:
            await db.donations.update_one(
                {"id": payload.donation_id},
                {"$set": {"status": "failed"}},
            )
            raise HTTPException(status_code=400, detail="Invalid payment signature")

    await db.donations.update_one(
        {"id": payload.donation_id},
        {"$set": {"status": "paid", "razorpay_payment_id": payload.razorpay_payment_id}},
    )

    # Fire-and-forget thank-you email (failure must not affect the donation response)
    updated = await db.donations.find_one({"id": payload.donation_id}, {"_id": 0})
    if updated:
        asyncio.create_task(send_thank_you_email(updated))

    return {"success": True, "message": "Donation confirmed. Thank you for your kindness."}


@api_router.get("/donations/stats", response_model=Stats)
async def get_stats():
    pipeline = [
        {"$match": {"status": "paid"}},
        {"$group": {
            "_id": None,
            "total": {"$sum": "$amount"},
            "count": {"$sum": 1},
            "donors": {"$addToSet": "$email"},
        }},
    ]
    result = await db.donations.aggregate(pipeline).to_list(1)

    total_raised = 0.0
    donors_count = 0
    paid_donations_count = 0
    if result:
        total_raised = float(result[0].get("total", 0) or 0)
        donors_count = len(result[0].get("donors", []) or [])
        paid_donations_count = int(result[0].get("count", 0) or 0)

    students_helped = int(total_raised // 500) if total_raised else 0
    completed_count = await db.projects.count_documents({"status": "completed"})

    return Stats(
        total_raised=total_raised,
        donors_count=donors_count,
        paid_donations_count=paid_donations_count,
        students_helped=students_helped,
        projects_completed=completed_count,
    )


@api_router.get("/donations/wall", response_model=List[WallDonor])
async def get_donor_wall():
    """Public list of paid donors for the Wall of Hearts."""
    cursor = db.donations.find(
        {"status": "paid"},
        {"_id": 0, "name": 1, "amount": 1, "photo_base64": 1, "message": 1, "gift_to": 1, "gift_occasion": 1, "created_at": 1},
    ).sort("created_at", -1).limit(60)
    donors = await cursor.to_list(60)
    return [WallDonor(**d) for d in donors]


# ----- Admin Donations View -----
@api_router.get("/admin/donations", response_model=List[AdminDonation])
async def list_donations(_: dict = Depends(get_current_admin)):
    cursor = db.donations.find({}, {"_id": 0}).sort("created_at", -1).limit(500)
    items = await cursor.to_list(500)
    return [AdminDonation(**i) for i in items]


# ----- Contact -----
@api_router.post("/contact", response_model=ContactMessage)
async def submit_contact(payload: ContactCreate):
    doc = {
        "id": str(uuid.uuid4()),
        "name": payload.name,
        "email": payload.email,
        "message": payload.message,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.contact_messages.insert_one(doc)
    return ContactMessage(**doc)


@api_router.get("/admin/contact", response_model=List[ContactMessage])
async def list_contacts(_: dict = Depends(get_current_admin)):
    messages = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [ContactMessage(**m) for m in messages]


# ----- Projects -----
@api_router.get("/projects", response_model=List[Project])
async def list_projects(status: Optional[str] = None):
    query = {}
    if status in ("completed", "upcoming"):
        query["status"] = status
    cursor = db.projects.find(query, {"_id": 0}).sort("date", -1).limit(200)
    items = await cursor.to_list(200)
    return [Project(**i) for i in items]


@api_router.post("/admin/projects", response_model=Project)
async def create_project(payload: ProjectCreate, _: dict = Depends(get_current_admin)):
    doc = {
        "id": str(uuid.uuid4()),
        "title": payload.title,
        "description": payload.description,
        "status": payload.status,
        "date": payload.date,
        "location": payload.location,
        "children_helped": payload.children_helped,
        "image_base64": payload.image_base64,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.projects.insert_one(doc)
    return Project(**doc)


@api_router.put("/admin/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, payload: ProjectCreate, _: dict = Depends(get_current_admin)):
    update = {
        "title": payload.title,
        "description": payload.description,
        "status": payload.status,
        "date": payload.date,
        "location": payload.location,
        "children_helped": payload.children_helped,
        "image_base64": payload.image_base64,
    }
    result = await db.projects.update_one({"id": project_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    updated = await db.projects.find_one({"id": project_id}, {"_id": 0})
    return Project(**updated)


@api_router.delete("/admin/projects/{project_id}")
async def delete_project(project_id: str, _: dict = Depends(get_current_admin)):
    result = await db.projects.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"success": True}


# ----- Team Members -----
@api_router.get("/team", response_model=List[TeamMember])
async def list_team():
    cursor = db.team_members.find({}, {"_id": 0}).sort([("order", 1), ("created_at", 1)]).limit(50)
    items = await cursor.to_list(50)
    return [TeamMember(**i) for i in items]


@api_router.post("/admin/team", response_model=TeamMember)
async def create_team_member(payload: TeamMemberCreate, _: dict = Depends(get_current_admin)):
    doc = {
        "id": str(uuid.uuid4()),
        "name": payload.name,
        "role": payload.role,
        "bio": payload.bio,
        "photo_base64": payload.photo_base64,
        "order": payload.order,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.team_members.insert_one(doc)
    return TeamMember(**doc)


@api_router.put("/admin/team/{member_id}", response_model=TeamMember)
async def update_team_member(member_id: str, payload: TeamMemberCreate, _: dict = Depends(get_current_admin)):
    update = {
        "name": payload.name,
        "role": payload.role,
        "bio": payload.bio,
        "photo_base64": payload.photo_base64,
        "order": payload.order,
    }
    result = await db.team_members.update_one({"id": member_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Team member not found")
    updated = await db.team_members.find_one({"id": member_id}, {"_id": 0})
    return TeamMember(**updated)


@api_router.delete("/admin/team/{member_id}")
async def delete_team_member(member_id: str, _: dict = Depends(get_current_admin)):
    result = await db.team_members.delete_one({"id": member_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Team member not found")
    return {"success": True}


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
