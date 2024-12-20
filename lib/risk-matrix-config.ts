import type { RiskQuestion, RiskScore, RiskSection } from 'types/risk-matrix';

export const RISK_MATRIX_QUESTIONS: RiskQuestion[] = [
  // Mission Factors
  {
    id: 'mission_type',
    section: 'MISSION_FACTORS',
    question: 'Type of Mission',
    options: [
      { label: 'Distribution, Photogrammetry, Image Collection', score: 1 },
      { label: 'Transmission', score: 3 },
      { label: 'LiDAR, Solar, Wind', score: 5 },
      { label: 'Plant Overflight, Substation Overflight, Night', score: 30 }
    ]
  },
  {
    id: 'flight_type',
    section: 'MISSION_FACTORS',
    question: 'Type of Flight',
    options: [
      { label: 'VLOS', score: 1 },
      { label: 'Training', score: 3 },
      { label: 'BVLOS, Indoor Structure Flight, Storm', score: 5 },
      { label: 'Flight from moving vehicle, Flight from vehicle alongside road, Flight from a boat, Flight over people, Highly automated flights', score: 30 }
    ]
  },
  {
    id: 'aircraft_type',
    section: 'MISSION_FACTORS',
    question: 'Type of Aircraft',
    options: [
      { label: 'DJI Mavic, Phantom 4, Skydio, Parrot', score: 1 },
      { label: 'DJI Matrice 210, 300, 30', score: 3 },
      { label: 'Percepto Sparrow', score: 5 },
      { label: 'eBee, Artimus, Watts Prism, Harris, Unlisted Aircraft', score: 30 }
    ]
  },
  {
    id: 'mission_location',
    section: 'MISSION_FACTORS',
    question: 'Mission Location',
    options: [
      { label: 'No houses or structures within 100 yards of flight path', score: 1 },
      { label: 'Rural', score: 3 },
      { label: 'Suburban', score: 5 },
      { label: 'Urban', score: 30 }
    ]
  },

  // Flight Crew Factors
  {
    id: 'crew_composition',
    section: 'FLIGHT_CREW_FACTORS',
    question: 'Crew Composition',
    options: [
      { label: 'All flight crew associated with mission are FAA Part 107 licensed', score: 1 },
      { label: 'N/A', score: 3 },
      { label: 'Single pilot mode (team does not include Part 107 qualified VO)', score: 30 }
    ]
  },
  {
    id: 'rpic_flight_hours',
    section: 'FLIGHT_CREW_FACTORS',
    question: 'RPIC Documented Flight Hours',
    options: [
      { label: '>30 hours', score: 1 },
      { label: '<=20 hours', score: 3 },
      { label: '<=10 hours', score: 5 },
      { label: '<5 hours', score: 30 }
    ]
  },
  {
    id: 'aircraft_hours',
    section: 'FLIGHT_CREW_FACTORS',
    question: 'Hours in Aircraft Type',
    options: [
      { label: '>30 hours', score: 1 },
      { label: '<=20 hours', score: 3 },
      { label: '<=10 hours', score: 5 },
      { label: '<5 hours', score: 30 }
    ]
  },
  {
    id: 'flight_recency',
    section: 'FLIGHT_CREW_FACTORS',
    question: 'Flight Recency',
    options: [
      { label: 'Completed a flight within past week', score: 1 },
      { label: 'Has been 1 month since last flown', score: 3 },
      { label: 'Has been 3 months or greater', score: 5 },
      { label: 'Has been 6 months or greater', score: 30 }
    ]
  },
  {
    id: 'mission_hours',
    section: 'FLIGHT_CREW_FACTORS',
    question: 'Hours In Mission Type',
    options: [
      { label: '>30 hours', score: 1 },
      { label: '<30 hours', score: 3 },
      { label: '<=20 hours', score: 5 },
      { label: '<5 hours', score: 30 }
    ]
  },
  {
    id: 'flight_training',
    section: 'FLIGHT_CREW_FACTORS',
    question: 'Flight Training',
    options: [
      { label: 'RPIC and VO have completed FPLAir Ground and Flight School or team is Part 107 licensed and all have attended FPLAir Vendor Safety Certification', score: 1 },
      { label: 'RPIC or VO has not attended FPLAir Vendor Safety Certification', score: 30 }
    ]
  },

  // Airspace Factors
  {
    id: 'airspace_class',
    section: 'AIRSPACE_FACTORS',
    question: 'Class of Airspace for Mission',
    options: [
      { label: 'Class G', score: 1 },
      { label: 'Class E or D', score: 3 },
      { label: 'Class C', score: 5 },
      { label: 'Class B', score: 30 }
    ]
  },
  {
    id: 'airspace_coordination',
    section: 'AIRSPACE_FACTORS',
    question: 'Airspace Coordination',
    options: [
      { label: 'Not Required', score: 1 },
      { label: 'LAANC, Blanket COA or Airspace Authorization', score: 3 },
      { label: 'Airspace Waiver, 0 AGL request separate from a blanket COA', score: 5 },
      { label: 'Part 107 waiver or Emergency COA', score: 30 }
    ]
  },
  {
    id: 'detect_avoid',
    section: 'AIRSPACE_FACTORS',
    question: 'Detect and Avoid',
    options: [
      { label: 'VLOS', score: 1 },
      { label: 'BVLOS with VO', score: 3 },
      { label: 'Highly automated BVLOS with accipiter radar', score: 5 },
      { label: 'Highly automated BVLOS with ADSB', score: 30 }
    ]
  },
  {
    id: 'airports_helipads',
    section: 'AIRSPACE_FACTORS',
    question: 'Any Public or Private Airports or Helipads',
    options: [
      { label: 'Greater than 10 miles away', score: 1 },
      { label: 'Within 10 miles', score: 3 },
      { label: 'Within 5 miles', score: 5 },
      { label: 'Within 1 mile', score: 30 }
    ]
  },
  {
    id: 'vhf_radio',
    section: 'AIRSPACE_FACTORS',
    question: 'VHF Radio',
    options: [
      { label: 'Available or Not Required', score: 1 },
      { label: 'Mission within LAANC or Blanket COA and VHF radio not available', score: 3 },
      { label: 'Mission within Class C or D airspace, VHF radio not available', score: 5 },
      { label: 'BVLOS flight, VHF radio required but not available', score: 30 }
    ]
  },
  {
    id: 'special_considerations',
    section: 'AIRSPACE_FACTORS',
    question: 'Special Considerations',
    options: [
      { label: 'None', score: 1 },
      { label: 'Mission within 5 miles of any of the following: Active Crop Dusting, Active Power Parachutes, Active Parachuting Drop Zones, Active Glider Zones or Active Ballooning Area', score: 30 }
    ]
  },

  // Weather Factors
  {
    id: 'heat',
    section: 'WEATHER_FACTORS',
    question: 'Heat',
    options: [
      { label: 'Heat Index <80 degrees', score: 1 },
      { label: 'Heat Index between 80 and 90 degrees', score: 3 },
      { label: 'Heat Index between 90 and 100 degrees', score: 5 },
      { label: 'Heat Index greater than 100 degrees', score: 30 }
    ]
  },

  // Flight Operations Area
  {
    id: 'mission_planning',
    section: 'FLIGHT_OPERATIONS_AREA',
    question: 'Has the FPLAir mission planning document been completed?',
    options: [
      { label: 'YES', score: 1 },
      { label: 'NO', score: 30 }
    ]
  },
  {
    id: 'kml_file',
    section: 'FLIGHT_OPERATIONS_AREA',
    question: 'Has the Google Earth KML file been created and includes the flight operations area, the land zone and 1000 ft., 5 mile and 10 mile range circles?',
    options: [
      { label: 'YES', score: 1 },
      { label: 'NO', score: 30 }
    ]
  },
  {
    id: 'area_features',
    section: 'FLIGHT_OPERATIONS_AREA',
    question: 'Are any of the following present within the flight operations area: Eagle nests, Osprey nests, Prisons, TFRs, Native American Reservations, Schools, Hospitals, NOTAMS or National Parks?',
    options: [
      { label: 'NO', score: 1 },
      { label: 'YES: National Parks-request permission to fly, Native American Reservations-request permission to fly, Prisons-request permission to fly', score: 3 }
    ]
  },
  {
    id: 'vehicular_traffic',
    section: 'FLIGHT_OPERATIONS_AREA',
    question: 'Vehicular traffic within the flight path?',
    options: [
      { label: 'Greater than 100 yards', score: 1 },
      { label: 'Within 100 yards', score: 3 },
      { label: 'Within 50 yards', score: 5 },
      { label: '< 10 yards', score: 30 }
    ]
  },
  {
    id: 'pedestrian_traffic',
    section: 'FLIGHT_OPERATIONS_AREA',
    question: 'Pedestrian foot traffic near the flight path?',
    options: [
      { label: 'Greater than 100 yards', score: 1 },
      { label: 'Within 100 yards', score: 3 },
      { label: 'Within 50 yards', score: 5 },
      { label: '< 10 yards', score: 30 }
    ]
  },
  {
    id: 'vertical_obstacles',
    section: 'FLIGHT_OPERATIONS_AREA',
    question: 'Vertical obstacles within 10 miles',
    options: [
      { label: 'Greater than 3 miles', score: 1 },
      { label: 'Within 3 miles', score: 3 },
      { label: 'Within 1 mile', score: 5 },
      { label: 'Within 1000 feet', score: 30 }
    ]
  },
  {
    id: 'flight_crew_location',
    section: 'FLIGHT_OPERATIONS_AREA',
    question: 'Flight Crew located alongside roadway',
    options: [
      { label: 'NO', score: 1 },
      { label: 'Rural area with warning signs front and back', score: 3 },
      { label: 'Suburban area with warning signs front and back', score: 5 },
      { label: 'Urban area with warning signs front and back', score: 30 }
    ]
  },
  {
    id: 'wired_environment',
    section: 'FLIGHT_OPERATIONS_AREA',
    question: 'Wired environment',
    options: [
      { label: 'NO', score: 1 },
      { label: 'YES, environment contains 2 intersecting lines', score: 3 },
      { label: 'YES, environment contains 3 or more intersecting lines', score: 5 },
      { label: 'YES, distribution with transmission lines overhead', score: 30 }
    ]
  },

  // Human Factors
  {
    id: 'medical',
    section: 'HUMAN_FACTORS',
    question: 'Medical',
    options: [
      { label: 'First Aid, CPR, AED certs, trauma kit, AED kit', score: 1 },
      { label: 'First Aid, CPR certs, trauma kit', score: 3 },
      { label: 'First Aid, CPR certs', score: 5 },
      { label: 'NO First Aid, CPR certs OR Hospital/EMS more than 30 mins. Away', score: 30 }
    ]
  },
  {
    id: 'fire_suppression',
    section: 'HUMAN_FACTORS',
    question: 'Fire Suppression',
    options: [
      { label: 'Fire ext on hand', score: 1 },
      { label: 'NONE', score: 30 }
    ]
  },
  {
    id: 'illness',
    section: 'HUMAN_FACTORS',
    question: 'Is anyone on the mission not feeling well?',
    options: [
      { label: 'NO', score: 1 },
      { label: 'YES', score: 30 }
    ]
  },
  {
    id: 'medication',
    section: 'HUMAN_FACTORS',
    question: 'Is anyone on the mission using any medication that could make them dizzy or drowsy?',
    options: [
      { label: 'NO', score: 1 },
      { label: 'YES', score: 30 }
    ]
  },
  {
    id: 'stress',
    section: 'HUMAN_FACTORS',
    question: 'Any stressful issues that could cause distraction?',
    options: [
      { label: 'NO', score: 1 },
      { label: 'YES', score: 30 }
    ]
  },
  {
    id: 'alcohol',
    section: 'HUMAN_FACTORS',
    question: 'Has anyone on the crew consumed alcohol within the past 8 hours?',
    options: [
      { label: 'NO', score: 1 },
      { label: 'YES', score: 30 }
    ]
  },
  {
    id: 'fatigue',
    section: 'HUMAN_FACTORS',
    question: 'Has the crew received the appropriate crew rest?',
    options: [
      { label: 'YES', score: 1 },
      { label: 'NO', score: 30 }
    ]
  },
  {
    id: 'emotion',
    section: 'HUMAN_FACTORS',
    question: 'Do any of the crew exhibit strong emotions that could affect their performance?',
    options: [
      { label: 'NO', score: 1 },
      { label: 'YES', score: 30 }
    ]
  }
];

export const RISK_SECTIONS: Record<RiskSection, string> = {
  MISSION_FACTORS: "Mission Factors",
  FLIGHT_CREW_FACTORS: "Flight Crew Factors",
  AIRSPACE_FACTORS: "Airspace Factors",
  WEATHER_FACTORS: "Weather Factors",
  FLIGHT_OPERATIONS_AREA: "Flight Operations Area",
  HUMAN_FACTORS: "Human Factors"
};
