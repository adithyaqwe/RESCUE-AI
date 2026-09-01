import Responder from '../models/Responder.js';
import Incident from '../models/Incident.js';

// Vadodara Municipal Emergency Operations Centre (VMC EOC / Sayajigunj)
export const VADODARA_HQ_LAT = 22.307159;
export const VADODARA_HQ_LNG = 73.181219;

// Real Emergency Response Fleet deployed across authentic Vadodara sectors
const FULL_FLEET = [
  // ── Ambulances / 108 Emergency Response (6 units) ─────────────────────
  { unitId: 'AMB-108-01', type: 'Ambulance', contactInfo: '+91 98250 11101', currentLocation: { lat: 22.3115, lng: 73.1705 } }, // Alkapuri ALS
  { unitId: 'AMB-108-05', type: 'Ambulance', contactInfo: '+91 98250 11105', currentLocation: { lat: 22.3148, lng: 73.1420 } }, // Gotri GMERS Rapid
  { unitId: 'AMB-108-12', type: 'Ambulance', contactInfo: '+91 98250 11112', currentLocation: { lat: 22.2685, lng: 73.1950 } }, // Manjalpur 108
  { unitId: 'AMB-108-17', type: 'Ambulance', contactInfo: '+91 98250 11117', currentLocation: { lat: 22.3218, lng: 73.1873 } }, // Fatehgunj MSU
  { unitId: 'AMB-108-22', type: 'Ambulance', contactInfo: '+91 98250 11122', currentLocation: { lat: 22.2475, lng: 73.1955 } }, // Makarpura Trauma
  { unitId: 'AMB-108-31', type: 'Ambulance', contactInfo: '+91 98250 11131', currentLocation: { lat: 22.2980, lng: 73.2280 } }, // Waghodia Crossroad

  // ── Fire & Emergency Services / VMC Fire Brigade (5 units) ───────────
  { unitId: 'FIR-VMC-03', type: 'Fire', contactInfo: '+91 98250 22203', currentLocation: { lat: 22.3020, lng: 73.1920 } }, // Dandia Bazar Station
  { unitId: 'FIR-VMC-07', type: 'Fire', contactInfo: '+91 98250 22207', currentLocation: { lat: 22.2482, lng: 73.1948 } }, // Makarpura GIDC Industrial Tender
  { unitId: 'FIR-VMC-12', type: 'Fire', contactInfo: '+91 98250 22212', currentLocation: { lat: 22.3220, lng: 73.1870 } }, // Fatehgunj Station
  { unitId: 'FIR-VMC-19', type: 'Fire', contactInfo: '+91 98250 22219', currentLocation: { lat: 22.3245, lng: 73.2082 } }, // Karelibaug Water Bowser
  { unitId: 'FIR-VMC-24', type: 'Fire', contactInfo: '+91 98250 22224', currentLocation: { lat: 22.2850, lng: 73.2200 } }, // Soma Talav Hazmat

  // ── Vadodara City Police 112 / PCR Patrol (6 units) ──────────────────
  { unitId: 'POL-PCR-02', type: 'Police', contactInfo: '+91 98250 33302', currentLocation: { lat: 22.3103, lng: 73.1812 } }, // Sayajigunj Station Beat
  { unitId: 'POL-PCR-09', type: 'Police', contactInfo: '+91 98250 33309', currentLocation: { lat: 22.2965, lng: 73.1678 } }, // Akota Circle Patrol
  { unitId: 'POL-PCR-14', type: 'Police', contactInfo: '+91 98250 33314', currentLocation: { lat: 22.2920, lng: 73.1550 } }, // Old Padra Road PCR
  { unitId: 'POL-PCR-28', type: 'Police', contactInfo: '+91 98250 33328', currentLocation: { lat: 22.2985, lng: 73.2290 } }, // NH 48 Bypass Highway Patrol
  { unitId: 'POL-PCR-44', type: 'Police', contactInfo: '+91 98250 33344', currentLocation: { lat: 22.2690, lng: 73.1940 } }, // Manjalpur Station Beat
  { unitId: 'POL-PCR-57', type: 'Police', contactInfo: '+91 98250 33357', currentLocation: { lat: 22.2780, lng: 73.1520 } }, // Atladara Circle

  // ── Rapid Medical Response / Mobile ICU (3 units) ───────────────────
  { unitId: 'MED-DOC-04', type: 'Medical', contactInfo: '+91 98250 44404', currentLocation: { lat: 22.3080, lng: 73.1850 } }, // SSG Hospital Trauma Unit
  { unitId: 'MED-DOC-11', type: 'Medical', contactInfo: '+91 98250 44411', currentLocation: { lat: 22.3145, lng: 73.1425 } }, // Gotri Civil Mobile Doctor
  { unitId: 'MED-DOC-23', type: 'Medical', contactInfo: '+91 98250 44423', currentLocation: { lat: 22.3250, lng: 73.1900 } }, // Sayaji Medical Response
];

// Realistic Vadodara Emergency Scenarios for Hackathon Demo
const SEED_INCIDENTS = [
  {
    incidentId: 'INC-8007',
    type: 'Accident',
    priority: 'CRITICAL',
    priorityScore: 92,
    location: {
      address: 'NH 48 Vadodara Bypass & Waghodia Junction, Vadodara',
      coordinates: { lat: 22.2985, lng: 73.2290 },
    },
    victimsCount: 2,
    description: 'Multi-vehicle collision involving truck and two passenger cars on NH 48 highway overpass. Two passengers pinned with structural intrusion.',
    requiredServices: ['Ambulance', 'Police', 'Fire'],
    status: 'REPORTED',
    aiConfidence: 0.94,
    aiAnalysis: {
      type: 'Accident',
      severity: 'Critical priority',
      confidence: 0.94,
      immediateAction: 'Secure highway lanes, extricate trapped passengers, dispatch trauma ALS.',
      recommendedResponseTime: '6 minutes',
    },
  },
  {
    incidentId: 'INC-5848',
    type: 'Chemical Fire',
    priority: 'HIGH',
    priorityScore: 84,
    location: {
      address: 'Makarpura GIDC Industrial Estate Phase II, Vadodara',
      coordinates: { lat: 22.2482, lng: 73.1948 },
    },
    victimsCount: 1,
    description: 'Solvent drum rupture and flash fire inside chemical processing facility. Toxic vapour plume drifting toward GIDC arterial road.',
    requiredServices: ['Fire', 'Ambulance'],
    status: 'REPORTED',
    aiConfidence: 0.91,
    aiAnalysis: {
      type: 'Chemical Fire',
      severity: 'High priority',
      confidence: 0.91,
      immediateAction: 'Isolate 200m cordon, deploy foam tender, administer oxygen to affected worker.',
      recommendedResponseTime: '8 minutes',
    },
  },
  {
    incidentId: 'INC-6514',
    type: 'Medical',
    priority: 'HIGH',
    priorityScore: 81,
    location: {
      address: 'Gotri Road near GMERS Medical College, Vadodara',
      coordinates: { lat: 22.3148, lng: 73.1420 },
    },
    victimsCount: 1,
    description: 'Elderly male collapsed on sidewalk with acute retrosternal chest pain and shortness of breath. Suspected cardiac arrest in progress.',
    requiredServices: ['Ambulance', 'Medical'],
    status: 'ANALYZED',
    aiConfidence: 0.95,
    aiAnalysis: {
      type: 'Medical',
      severity: 'High priority',
      confidence: 0.95,
      immediateAction: 'Initiate bystander CPR, dispatch nearest 108 ALS unit with defibrillator.',
      recommendedResponseTime: '7 minutes',
    },
  },
  {
    incidentId: 'INC-9412',
    type: 'Accident',
    priority: 'MEDIUM',
    priorityScore: 58,
    location: {
      address: 'RC Dutt Road, Alkapuri, opposite Vadodara Central',
      coordinates: { lat: 22.3118, lng: 73.1708 },
    },
    victimsCount: 1,
    description: 'Side-impact collision between auto-rickshaw and sedan near Alkapuri Circle. Rickshaw passenger has knee contusion.',
    requiredServices: ['Ambulance', 'Police'],
    status: 'ANALYZED',
    aiConfidence: 0.88,
    aiAnalysis: {
      type: 'Accident',
      severity: 'Standard priority',
      confidence: 0.88,
      immediateAction: 'Direct vehicles to road shoulder, assess patient vital signs.',
      recommendedResponseTime: '10 minutes',
    },
  },
  {
    incidentId: 'INC-8323',
    type: 'Accident',
    priority: 'LOW',
    priorityScore: 40,
    location: {
      address: 'Akota Dandia Bazar Road, near Akota Bridge, Vadodara',
      coordinates: { lat: 22.2965, lng: 73.1678 },
    },
    victimsCount: 0,
    description: 'Minor bumper contact between two vehicles on Akota bridge approach. No injuries, causing moderate traffic congestion.',
    requiredServices: ['Police'],
    status: 'ANALYZED',
    aiConfidence: 0.85,
    aiAnalysis: {
      type: 'Accident',
      severity: 'Low priority',
      confidence: 0.85,
      immediateAction: 'Dispatch PCR unit to clear bridge lanes and manage traffic flow.',
      recommendedResponseTime: '12 minutes',
    },
  },
  {
    incidentId: 'INC-9315',
    type: 'Water Rescue',
    priority: 'HIGH',
    priorityScore: 78,
    location: {
      address: 'Vishwamitri Riverbank near Kala Ghoda Bridge, Vadodara',
      coordinates: { lat: 22.3130, lng: 73.1890 },
    },
    victimsCount: 1,
    description: 'Maintenance worker slipped down masonry bank into swollen Vishwamitri river channel. Clinging to bridge pillar footing.',
    requiredServices: ['Fire', 'Police'],
    status: 'ANALYZED',
    aiConfidence: 0.92,
    aiAnalysis: {
      type: 'Water Rescue',
      severity: 'High priority',
      confidence: 0.92,
      immediateAction: 'Deploy throw bag and safety line from Kala Ghoda bridge deck.',
      recommendedResponseTime: '7 minutes',
    },
  },
  {
    incidentId: 'INC-8875',
    type: 'Fire',
    priority: 'HIGH',
    priorityScore: 79,
    location: {
      address: 'Mandvi Heritage Market, Old City, Vadodara',
      coordinates: { lat: 22.3005, lng: 73.2085 },
    },
    victimsCount: 0,
    description: 'Electrical short circuit sparking in commercial cloth godown near Mandvi gate. Heavy smoke in narrow bazaar alley.',
    requiredServices: ['Fire'],
    status: 'ANALYZED',
    aiConfidence: 0.90,
    aiAnalysis: {
      type: 'Fire',
      severity: 'High priority',
      confidence: 0.90,
      immediateAction: 'Isolate local transformer, deploy narrow alley hose lines.',
      recommendedResponseTime: '8 minutes',
    },
  },
  {
    incidentId: 'INC-5321',
    type: 'Accident',
    priority: 'LOW',
    priorityScore: 42,
    location: {
      address: 'Manjalpur Ring Road, near Shreyas School, Vadodara',
      coordinates: { lat: 22.2685, lng: 73.1950 },
    },
    victimsCount: 1,
    description: 'Two-wheeler lost control on gravel patch near school crossing. Minor scrapes, rider on roadside.',
    requiredServices: ['Ambulance'],
    status: 'REPORTED',
    aiConfidence: 0.86,
    aiAnalysis: {
      type: 'Accident',
      severity: 'Low priority',
      confidence: 0.86,
      immediateAction: 'Dispatch BLS unit for wound dressing and evaluation.',
      recommendedResponseTime: '12 minutes',
    },
  },
  {
    incidentId: 'INC-6462',
    type: 'Accident',
    priority: 'LOW',
    priorityScore: 45,
    location: {
      address: 'Old Padra Road, near Malhar Point, Vadodara',
      coordinates: { lat: 22.2920, lng: 73.1550 },
    },
    victimsCount: 0,
    description: 'Stationary vehicle breakdown blocking right turn lane at Malhar Point junction.',
    requiredServices: ['Police'],
    status: 'ANALYZED',
    aiConfidence: 0.84,
    aiAnalysis: {
      type: 'Accident',
      severity: 'Low priority',
      confidence: 0.84,
      immediateAction: 'Dispatch traffic PCR to coordinate towing.',
      recommendedResponseTime: '15 minutes',
    },
  },
  {
    incidentId: 'INC-7895',
    type: 'Medical',
    priority: 'MEDIUM',
    priorityScore: 62,
    location: {
      address: 'Fatehgunj Main Road, near MSU Pavilion, Vadodara',
      coordinates: { lat: 22.3218, lng: 73.1873 },
    },
    victimsCount: 1,
    description: 'Student experiencing severe asthma attack in hostel common room. Inhaler exhausted.',
    requiredServices: ['Ambulance'],
    status: 'RESOLVED',
    aiConfidence: 0.89,
    aiAnalysis: {
      type: 'Medical',
      severity: 'Standard priority',
      confidence: 0.89,
      immediateAction: 'Administer nebulization treatment and monitor SpO2.',
      recommendedResponseTime: '10 minutes',
    },
  },
];

export const seedDatabase = async () => {
  try {
    console.log(`[Seed] Syncing Vadodara fleet — ${FULL_FLEET.length} units defined...`);

    // 1. Upsert all responders with authentic Vadodara locations
    for (const unit of FULL_FLEET) {
      await Responder.findOneAndUpdate(
        { unitId: unit.unitId },
        {
          $set: {
            type: unit.type,
            contactInfo: unit.contactInfo,
            currentLocation: unit.currentLocation,
            status: 'AVAILABLE',
          },
        },
        { upsert: true, returnDocument: 'after' }
      );
    }

    // 2. Remove obsolete units not in FULL_FLEET
    const validUnitIds = FULL_FLEET.map(u => u.unitId);
    await Responder.deleteMany({ unitId: { $nin: validUnitIds } });

    // 3. Clear outdated fictional/US incidents and seed Vadodara incidents
    const hasOldIncidents = await Incident.findOne({
      'location.address': { $regex: /West Gate|Midtown|Chemistry Hall/i }
    });

    if (hasOldIncidents || (await Incident.countDocuments()) === 0) {
      console.log('[Seed] Refreshing incidents with authentic Vadodara, Gujarat emergency dataset...');
      await Incident.deleteMany({});

      // Attach recommendations for analyzed incidents
      const seededResponders = await Responder.find();

      for (const incData of SEED_INCIDENTS) {
        const { lat, lng } = incData.location.coordinates;
        // Compute distance to all responders and take nearest matching
        const matching = seededResponders.filter(r => incData.requiredServices.includes(r.type));
        const recs = matching.map(r => {
          const dLat = (r.currentLocation.lat - lat) * 111;
          const dLng = (r.currentLocation.lng - lng) * 102;
          const dist = Math.round(Math.hypot(dLat, dLng) * 10) / 10;
          const eta = Math.max(2, Math.round(dist * 2.2));
          return {
            responder: r,
            distance: dist,
            eta,
            reason: `Closest available ${r.type} unit in sector`,
          };
        }).sort((a, b) => a.distance - b.distance).slice(0, 3);

        const fullAiAnalysis = {
          ...incData.aiAnalysis,
          recommendations: recs,
        };

        await Incident.create({
          ...incData,
          aiAnalysis: fullAiAnalysis,
        });
      }
      console.log(`[Seed] Seeded ${SEED_INCIDENTS.length} deterministic Vadodara incidents.`);
    }

    const totalResponders = await Responder.countDocuments();
    const totalIncidents = await Incident.countDocuments();
    console.log(`[Seed] Vadodara database ready: ${totalResponders} units, ${totalIncidents} active incidents.`);
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
  }
};
