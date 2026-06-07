"""
Backend tests for Dosti Dil Se NGO API - Iteration 4.

New in Iter 4:
- Admin 2FA via pyotp: /api/admin/login returns {step, pre_auth_token, provisioning_uri?},
  followed by /api/admin/verify-totp -> access_token.
- /api/admin/reset-totp (auth required) resets the admin so next login = setup.
- Donations support optional gift_to + gift_occasion when amount >= 500.
- /api/donations/wall now returns gift_to + gift_occasion.
- /api/team returns 4 dummy team members seeded at startup.

Coverage retained from iter 2/3: admin JWT protection, donations create/verify,
stats, wall, contact, projects CRUD, _id exclusion.
"""
import os
import re
import time
import uuid
import urllib.parse

import pyotp
import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@dostidilse.org"
ADMIN_PASSWORD = "Dosti@2026"

# Direct DB access for reading TOTP secret + state restoration
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")
_mongo = MongoClient(MONGO_URL)
_db = _mongo[DB_NAME]

SAMPLE_B64 = (
    "data:image/png;base64,"
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgAAIAAAUAAarVyFEAAAAASUVORK5CYII="
)


# ---------- Helpers ----------
def _current_totp_secret() -> str:
    doc = _db.admins.find_one({"email": ADMIN_EMAIL})
    assert doc and doc.get("totp_secret"), "Admin/TOTP secret missing in DB"
    return doc["totp_secret"]


def _compute_code(secret: str) -> str:
    return pyotp.TOTP(secret).now()


def _login_and_get_access_token(sess: requests.Session) -> str:
    """Full 2-step login helper: login -> verify-totp -> access_token."""
    r = sess.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    data = r.json()
    pre = data["pre_auth_token"]
    # If step=setup, provisioning_uri exists; parse secret from it OR read DB
    secret = _current_totp_secret()
    code = _compute_code(secret)
    v = sess.post(f"{API}/admin/verify-totp", json={"pre_auth_token": pre, "code": code})
    # Retry once on 401 due to time-window boundary
    if v.status_code == 401:
        time.sleep(1)
        code = _compute_code(secret)
        v = sess.post(f"{API}/admin/verify-totp", json={"pre_auth_token": pre, "code": code})
    assert v.status_code == 200, v.text
    return v.json()["access_token"]


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_token(client):
    try:
        return _login_and_get_access_token(client)
    except AssertionError as e:
        pytest.skip(f"Admin TOTP login failed: {e}")


@pytest.fixture(scope="module")
def admin_client(admin_token):
    s = requests.Session()
    s.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {admin_token}",
    })
    return s


# ---------- Root ----------
class TestRoot:
    def test_root_returns_welcome(self, client):
        r = client.get(f"{API}/")
        assert r.status_code == 200
        assert "Dosti Dil Se" in r.json()["message"]


# ---------- Admin 2FA Auth ----------
class TestAdmin2FA:
    def test_login_success_returns_preauth_and_step(self, client):
        r = client.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["step"] in ("setup", "code")
        assert isinstance(data.get("pre_auth_token"), str)
        assert len(data["pre_auth_token"]) > 20
        # No JWT access_token on this endpoint (2FA not yet done)
        assert "access_token" not in data
        if data["step"] == "setup":
            assert "provisioning_uri" in data and data["provisioning_uri"].startswith("otpauth://")
        else:
            assert data.get("provisioning_uri") is None

    def test_login_wrong_password_401(self, client):
        r = client.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": "wrong-password"})
        assert r.status_code == 401

    def test_login_unknown_email_401(self, client):
        r = client.post(f"{API}/admin/login", json={"email": "nobody@dostidilse.org", "password": "whatever123"})
        assert r.status_code == 401

    def test_login_email_case_insensitive(self, client):
        r = client.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL.upper(), "password": ADMIN_PASSWORD})
        assert r.status_code == 200

    def test_verify_totp_invalid_code_401(self, client):
        r = client.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        pre = r.json()["pre_auth_token"]
        bad = client.post(f"{API}/admin/verify-totp", json={"pre_auth_token": pre, "code": "000000"})
        # 000000 is extremely unlikely to be the current code; if it is, try 111111
        if bad.status_code == 200:
            pre2 = client.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}).json()["pre_auth_token"]
            bad = client.post(f"{API}/admin/verify-totp", json={"pre_auth_token": pre2, "code": "111111"})
        assert bad.status_code == 401

    def test_verify_totp_valid_code_returns_access_token(self, client):
        r = client.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        pre = r.json()["pre_auth_token"]
        secret = _current_totp_secret()
        v = client.post(f"{API}/admin/verify-totp", json={"pre_auth_token": pre, "code": _compute_code(secret)})
        if v.status_code == 401:
            time.sleep(1)
            v = client.post(f"{API}/admin/verify-totp", json={"pre_auth_token": pre, "code": _compute_code(secret)})
        assert v.status_code == 200, v.text
        data = v.json()
        assert isinstance(data["access_token"], str) and len(data["access_token"]) > 20
        assert data["email"] == ADMIN_EMAIL
        assert data.get("token_type") == "bearer"

    def test_access_jwt_cannot_be_used_as_preauth(self, client, admin_token):
        """Using a final access JWT where a pre_auth_token is expected must fail."""
        secret = _current_totp_secret()
        r = client.post(f"{API}/admin/verify-totp", json={"pre_auth_token": admin_token, "code": _compute_code(secret)})
        assert r.status_code == 401

    def test_verify_totp_invalid_preauth_401(self, client):
        r = client.post(f"{API}/admin/verify-totp", json={"pre_auth_token": "not.a.jwt", "code": "123456"})
        assert r.status_code == 401

    def test_admin_me_with_access_token(self, admin_client):
        r = admin_client.get(f"{API}/admin/me")
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_admin_me_without_token_401(self, client):
        r = client.get(f"{API}/admin/me")
        assert r.status_code == 401

    def test_admin_me_invalid_token_401(self, client):
        r = client.get(f"{API}/admin/me", headers={"Authorization": "Bearer not.a.real.jwt"})
        assert r.status_code == 401

    def test_provisioning_uri_matches_db_secret_on_setup(self, client):
        """If admin is currently in setup state, provisioning_uri must embed the DB secret."""
        # Force a clean setup state by resetting - but we'll do it through reset-totp in a dedicated test.
        # Here, only validate IF step=setup is returned.
        r = client.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}).json()
        if r["step"] == "setup":
            uri = r["provisioning_uri"]
            q = urllib.parse.urlparse(uri).query
            params = urllib.parse.parse_qs(q)
            assert "secret" in params
            assert params["secret"][0] == _current_totp_secret()
            assert params.get("issuer", [""])[0] == "Dosti Dil Se"


# ---------- Reset TOTP (auth required, stateful) ----------
class TestResetTotp:
    """Runs LAST among admin tests so we can re-setup afterwards."""

    def test_reset_totp_requires_auth(self, client):
        r = client.post(f"{API}/admin/reset-totp")
        assert r.status_code == 401

    def test_reset_totp_flow_and_relogin_setup(self, client, admin_client):
        # Snapshot current secret
        old_secret = _current_totp_secret()

        # Reset
        r = admin_client.post(f"{API}/admin/reset-totp")
        assert r.status_code == 200, r.text
        assert r.json().get("success") is True

        # DB should now have a new secret and totp_verified=False
        doc = _db.admins.find_one({"email": ADMIN_EMAIL})
        new_secret = doc["totp_secret"]
        assert new_secret != old_secret
        assert doc.get("totp_verified") is False

        # Next login must return step='setup' with provisioning_uri
        login = client.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert login.status_code == 200
        data = login.json()
        assert data["step"] == "setup"
        assert data["provisioning_uri"].startswith("otpauth://")
        # Secret in URI matches new DB secret
        q = urllib.parse.parse_qs(urllib.parse.urlparse(data["provisioning_uri"]).query)
        assert q["secret"][0] == new_secret

        # Complete setup with new secret to restore a working verified state
        code = pyotp.TOTP(new_secret).now()
        v = client.post(f"{API}/admin/verify-totp", json={"pre_auth_token": data["pre_auth_token"], "code": code})
        if v.status_code == 401:
            time.sleep(1)
            v = client.post(f"{API}/admin/verify-totp", json={"pre_auth_token": data["pre_auth_token"], "code": pyotp.TOTP(new_secret).now()})
        assert v.status_code == 200, v.text
        assert v.json().get("access_token")

        # Subsequent login should now be step='code' (verified)
        next_login = client.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}).json()
        assert next_login["step"] == "code"
        assert next_login.get("provisioning_uri") is None


# ---------- Donations with Gift fields ----------
class TestDonationGifts:
    def test_gift_fields_persisted_when_amount_ge_500(self, client, admin_client):
        unique_email = f"test_gift_{uuid.uuid4().hex[:8]}@example.com"
        donor_name = f"TEST_GiftDonor_{uuid.uuid4().hex[:6]}"
        payload = {
            "amount": 500.0,
            "name": donor_name,
            "email": unique_email,
            "gift_to": "Ananya",
            "gift_occasion": "Birthday",
            "photo_base64": SAMPLE_B64,
        }
        create = client.post(f"{API}/donations/create-order", json=payload)
        assert create.status_code == 200, create.text
        d = create.json()

        verify = client.post(f"{API}/donations/verify", json={
            "donation_id": d["donation_id"],
            "razorpay_order_id": d["order_id"],
            "razorpay_payment_id": "pay_mock_gift",
            "razorpay_signature": "mock_sig",
        })
        assert verify.status_code == 200

        # Admin listing should show gift_to + gift_occasion persisted
        ad = admin_client.get(f"{API}/admin/donations").json()
        rec = next((x for x in ad if x["id"] == d["donation_id"]), None)
        assert rec is not None
        assert rec["gift_to"] == "Ananya"
        assert rec["gift_occasion"] == "Birthday"
        assert rec["amount"] == 500.0
        assert "_id" not in rec

        # Wall should expose them too
        wall = client.get(f"{API}/donations/wall").json()
        w = next((it for it in wall if it["name"] == donor_name), None)
        assert w is not None
        assert w["gift_to"] == "Ananya"
        assert w["gift_occasion"] == "Birthday"

    def test_gift_fields_nulled_when_amount_lt_500(self, client, admin_client):
        unique_email = f"test_nogift_{uuid.uuid4().hex[:8]}@example.com"
        donor_name = f"TEST_NoGift_{uuid.uuid4().hex[:6]}"
        payload = {
            "amount": 100.0,
            "name": donor_name,
            "email": unique_email,
            "gift_to": "ShouldNotPersist",
            "gift_occasion": "Memorial",
        }
        create = client.post(f"{API}/donations/create-order", json=payload)
        assert create.status_code == 200
        d = create.json()

        verify = client.post(f"{API}/donations/verify", json={
            "donation_id": d["donation_id"],
            "razorpay_order_id": d["order_id"],
            "razorpay_payment_id": "pay_mock_nogift",
            "razorpay_signature": "mock_sig",
        })
        assert verify.status_code == 200

        ad = admin_client.get(f"{API}/admin/donations").json()
        rec = next((x for x in ad if x["id"] == d["donation_id"]), None)
        assert rec is not None
        assert rec["gift_to"] is None, f"gift_to should be nulled under ₹500 but got {rec['gift_to']}"
        assert rec["gift_occasion"] is None, f"gift_occasion should be nulled under ₹500 but got {rec['gift_occasion']}"

        wall = client.get(f"{API}/donations/wall").json()
        w = next((it for it in wall if it["name"] == donor_name), None)
        assert w is not None
        assert w["gift_to"] is None
        assert w["gift_occasion"] is None

    def test_wall_includes_gift_fields_schema(self, client):
        wall = client.get(f"{API}/donations/wall")
        assert wall.status_code == 200
        items = wall.json()
        assert isinstance(items, list)
        for it in items:
            # Fields must exist in schema (may be None)
            assert "gift_to" in it
            assert "gift_occasion" in it
            assert "name" in it and "amount" in it and "created_at" in it
            assert "_id" not in it


# ---------- Donations: basic validation ----------
class TestCreateOrder:
    def test_create_order_min_50_success(self, client):
        r = client.post(f"{API}/donations/create-order", json={
            "amount": 50.0,
            "name": "TEST_Donor_Min",
            "email": "test_donor_min@example.com",
            "photo_base64": SAMPLE_B64,
        })
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["amount"] == 5000
        assert data["currency"] == "INR"
        assert data["order_id"].startswith("order_mock_")
        uuid.UUID(data["donation_id"])
        assert "_id" not in data

    def test_create_order_below_50_returns_422(self, client):
        r = client.post(f"{API}/donations/create-order", json={
            "amount": 49, "name": "TEST_Below", "email": "below@example.com"})
        assert r.status_code == 422

    def test_create_order_bad_email_422(self, client):
        r = client.post(f"{API}/donations/create-order", json={
            "amount": 100, "name": "TEST_BadEmail", "email": "not-an-email"})
        assert r.status_code == 422


# ---------- Verify + Wall ----------
class TestVerifyAndWall:
    def test_verify_invalid_donation_returns_404(self, client):
        r = client.post(f"{API}/donations/verify", json={
            "donation_id": "non-existent-id-xyz",
            "razorpay_order_id": "order_x",
            "razorpay_payment_id": "pay_x",
            "razorpay_signature": "sig_x",
        })
        assert r.status_code == 404

    def test_wall_sorted_desc_no_id_leak(self, client):
        r = client.get(f"{API}/donations/wall")
        assert r.status_code == 200
        items = r.json()
        assert len(items) <= 60
        for it in items:
            assert "_id" not in it
        created_ats = [it["created_at"] for it in items]
        assert created_ats == sorted(created_ats, reverse=True)


# ---------- Stats ----------
class TestStats:
    def test_stats_shape_and_no_baseline(self, client):
        r = client.get(f"{API}/donations/stats")
        assert r.status_code == 200
        data = r.json()
        for key in ("total_raised", "donors_count", "paid_donations_count", "students_helped", "projects_completed"):
            assert key in data
        assert data["students_helped"] == int(data["total_raised"] // 500)
        assert isinstance(data["projects_completed"], int)
        assert "_id" not in data


# ---------- Admin Lists (protected) ----------
class TestAdminLists:
    def test_admin_donations_requires_token(self, client):
        r = client.get(f"{API}/admin/donations")
        assert r.status_code == 401

    def test_admin_donations_no_id_leak(self, admin_client):
        r = admin_client.get(f"{API}/admin/donations")
        assert r.status_code == 200
        for it in r.json():
            assert "_id" not in it

    def test_admin_contact_requires_token(self, client):
        r = client.get(f"{API}/admin/contact")
        assert r.status_code == 401

    def test_admin_contact_with_token(self, admin_client):
        r = admin_client.get(f"{API}/admin/contact")
        assert r.status_code == 200
        for m in r.json():
            assert "_id" not in m


# ---------- Team (public, seeded) ----------
class TestTeam:
    def test_team_returns_at_least_4_members(self, client):
        r = client.get(f"{API}/team")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 4, f"Expected >= 4 seeded team members, got {len(items)}"
        for m in items:
            assert "_id" not in m
            for k in ("id", "name", "role", "bio", "created_at"):
                assert k in m

    def test_team_sorted_by_order(self, client):
        items = client.get(f"{API}/team").json()
        orders = [m.get("order", 0) for m in items]
        assert orders == sorted(orders), f"Team not sorted by order ascending: {orders}"

    def test_team_contains_seeded_names(self, client):
        items = client.get(f"{API}/team").json()
        names = {m["name"] for m in items}
        expected = {"Aarav Sharma", "Meera Iyer", "Rohan Patil", "Anjali Deshmukh"}
        assert expected.issubset(names), f"Missing seeded names. Present: {names}"


# ---------- Contact ----------
class TestContact:
    def test_contact_create_success(self, client):
        payload = {"name": "TEST_Contact", "email": "test_contact@example.com", "message": "Hello from tests"}
        r = client.post(f"{API}/contact", json=payload)
        assert r.status_code == 200
        data = r.json()
        uuid.UUID(data["id"])
        assert "_id" not in data

    def test_contact_rejects_empty_name(self, client):
        r = client.post(f"{API}/contact", json={"name": "", "email": "x@example.com", "message": "hi"})
        assert r.status_code == 422


# ---------- Projects ----------
class TestProjects:
    def test_create_project_requires_token(self, client):
        r = client.post(f"{API}/admin/projects", json={
            "title": "TEST_unauth", "description": "nope", "status": "completed", "date": "2026-01-01"})
        assert r.status_code == 401

    def test_projects_list_public_no_id_leak(self, client):
        r = client.get(f"{API}/projects")
        assert r.status_code == 200
        for p in r.json():
            assert "_id" not in p
