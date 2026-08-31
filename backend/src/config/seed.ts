import Responder from '../models/Responder';

const CAMPUS_LAT = 40.730610;
const CAMPUS_LNG = -73.935242;

// Spread units around campus within a ~0.06 deg radius
const FULL_FLEET = [
  // ── Ambulances (6 units) ─────────────────────────────────────────────
  { unitId: 'A-01', type: 'Ambulance', contactInfo: '+1 (555) 019-2801', currentLocation: { lat: CAMPUS_LAT + 0.028, lng: CAMPUS_LNG - 0.031 } },
  { unitId: 'A-05', type: 'Ambulance', contactInfo: '+1 (555) 019-2805', currentLocation: { lat: CAMPUS_LAT + 0.005, lng: CAMPUS_LNG + 0.005 } },
  { unitId: 'A-12', type: 'Ambulance', contactInfo: '+1 (555) 019-2812', currentLocation: { lat: CAMPUS_LAT - 0.014, lng: CAMPUS_LNG - 0.022 } },
  { unitId: 'A-17', type: 'Ambulance', contactInfo: '+1 (555) 019-2817', currentLocation: { lat: CAMPUS_LAT + 0.012, lng: CAMPUS_LNG - 0.015 } },
  { unitId: 'A-22', type: 'Ambulance', contactInfo: '+1 (555) 019-2822', currentLocation: { lat: CAMPUS_LAT - 0.022, lng: CAMPUS_LNG + 0.018 } },
  { unitId: 'A-31', type: 'Ambulance', contactInfo: '+1 (555) 019-2831', currentLocation: { lat: CAMPUS_LAT + 0.033, lng: CAMPUS_LNG + 0.027 } },

  // ── Fire Department (5 units) ─────────────────────────────────────────
  { unitId: 'F-03', type: 'Fire', contactInfo: '+1 (555) 019-2903', currentLocation: { lat: CAMPUS_LAT + 0.025, lng: CAMPUS_LNG + 0.022 } },
  { unitId: 'F-07', type: 'Fire', contactInfo: '+1 (555) 019-2907', currentLocation: { lat: CAMPUS_LAT - 0.029, lng: CAMPUS_LNG - 0.018 } },
  { unitId: 'F-12', type: 'Fire', contactInfo: '+1 (555) 019-2912', currentLocation: { lat: CAMPUS_LAT - 0.008, lng: CAMPUS_LNG - 0.012 } },
  { unitId: 'F-19', type: 'Fire', contactInfo: '+1 (555) 019-2919', currentLocation: { lat: CAMPUS_LAT + 0.019, lng: CAMPUS_LNG - 0.028 } },
  { unitId: 'F-24', type: 'Fire', contactInfo: '+1 (555) 019-2924', currentLocation: { lat: CAMPUS_LAT - 0.031, lng: CAMPUS_LNG + 0.024 } },

  // ── Police (6 units) ─────────────────────────────────────────────────
  { unitId: 'P-02', type: 'Police', contactInfo: '+1 (555) 019-3002', currentLocation: { lat: CAMPUS_LAT + 0.007, lng: CAMPUS_LNG + 0.031 } },
  { unitId: 'P-09', type: 'Police', contactInfo: '+1 (555) 019-3009', currentLocation: { lat: CAMPUS_LAT + 0.018, lng: CAMPUS_LNG - 0.002 } },
  { unitId: 'P-14', type: 'Police', contactInfo: '+1 (555) 019-3014', currentLocation: { lat: CAMPUS_LAT - 0.011, lng: CAMPUS_LNG + 0.016 } },
  { unitId: 'P-28', type: 'Police', contactInfo: '+1 (555) 019-3028', currentLocation: { lat: CAMPUS_LAT + 0.030, lng: CAMPUS_LNG - 0.011 } },
  { unitId: 'P-44', type: 'Police', contactInfo: '+1 (555) 019-3044', currentLocation: { lat: CAMPUS_LAT - 0.015, lng: CAMPUS_LNG + 0.012 } },
  { unitId: 'P-57', type: 'Police', contactInfo: '+1 (555) 019-3057', currentLocation: { lat: CAMPUS_LAT - 0.025, lng: CAMPUS_LNG - 0.029 } },

  // ── Medical / Rapid Response (3 units) ───────────────────────────────
  { unitId: 'M-04', type: 'Medical', contactInfo: '+1 (555) 019-4004', currentLocation: { lat: CAMPUS_LAT + 0.002, lng: CAMPUS_LNG - 0.008 } },
  { unitId: 'M-11', type: 'Medical', contactInfo: '+1 (555) 019-4011', currentLocation: { lat: CAMPUS_LAT - 0.018, lng: CAMPUS_LNG + 0.025 } },
  { unitId: 'M-23', type: 'Medical', contactInfo: '+1 (555) 019-4023', currentLocation: { lat: CAMPUS_LAT + 0.026, lng: CAMPUS_LNG + 0.014 } },
];

export const seedDatabase = async () => {
  try {
    console.log(`Syncing fleet — ${FULL_FLEET.length} units defined...`);

    for (const unit of FULL_FLEET) {
      await Responder.findOneAndUpdate(
        { unitId: unit.unitId },
        {
          $setOnInsert: {        // Only set location/contact on first insert
            currentLocation: unit.currentLocation,
            contactInfo: unit.contactInfo,
            status: 'AVAILABLE',
          },
          $set: {
            type: unit.type,    // Always keep type correct
          },
        },
        { upsert: true, returnDocument: 'after' }
      );
    }

    const total = await Responder.countDocuments();
    console.log(`Fleet sync complete. ${total} responder units in database.`);

  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
