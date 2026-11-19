const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const {createHash} = require("node:crypto");

initializeApp();
const db = getFirestore();

function clean(value, field, maxLength, required = true) {
  if (typeof value !== "string") {
    if (!required && (value === undefined || value === null)) return "";
    throw new HttpsError("invalid-argument", `${field} is required.`);
  }
  const result = value.trim().replace(/\s+/g, " ");
  if (required && !result) throw new HttpsError("invalid-argument", `${field} is required.`);
  if (result.length > maxLength) throw new HttpsError("invalid-argument", `${field} is too long.`);
  return result;
}
function normalizeBladerName(value) {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
}
function hashKey(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

exports.submitGiftClaim = onCall(
  {region: "us-central1", enforceAppCheck: true},
  async (request) => {
    const data = request.data || {};

    const fullName = clean(data.fullName, "Full name", 100);
    const bladerName = clean(data.bladerName, "Blader name", 60);
    const email = clean(data.email, "Email address", 254).toLowerCase();
    const addressLine1 = clean(data.addressLine1, "Street address", 150);
    const addressLine2 = clean(data.addressLine2, "Apartment / unit", 100, false);
    const city = clean(data.city, "City", 80);
    const state = clean(data.state, "State / province", 80);
    const postalCode = clean(data.postalCode, "ZIP / postal code", 20);
    const country = clean(data.country, "Country", 80);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new HttpsError("invalid-argument", "Please enter a valid email address.");
    }

    const normalizedName = normalizeBladerName(bladerName);
    if (normalizedName.length < 2) {
      throw new HttpsError("invalid-argument", "Please enter a valid blader name.");
    }

    // The normalized name is hashed so the unique-key document ID does not
    // expose a blader name. Firestore transaction makes check + reserve atomic.
    const claimKey = hashKey(normalizedName);
    const keyRef = db.collection("blader_claim_keys").doc(claimKey);
    const claimRef = db.collection("gift_claims").doc();

    await db.runTransaction(async (transaction) => {
      const existing = await transaction.get(keyRef);
      if (existing.exists) {
        throw new HttpsError("already-exists", "A gift claim has already been submitted using this blader name.");
      }

      transaction.create(claimRef, {
        fullName,
        bladerName,
        normalizedBladerName: normalizedName,
        email,
        shippingAddress: {
          addressLine1,
          addressLine2,
          city,
          state,
          postalCode,
          country
        },
        status: "approved",
        submittedAt: FieldValue.serverTimestamp()
      });
      transaction.create(keyRef, {
        claimId: claimRef.id,
        createdAt: FieldValue.serverTimestamp()
      });
    });

    return {success: true};
  }
);
