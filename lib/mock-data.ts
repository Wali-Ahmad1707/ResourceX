export interface Owner {
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  memberSince: string;
  responseRate: string;
  location: string;
}

export type ResourceCategory =
  | "Tools & Equipment"
  | "Outdoor & Camping"
  | "Electronics"
  | "Sports & Fitness"
  | "Photography"
  | "Books & Education"
  | "Industrial Machinery"
  | "General Laboratory Equipment"
  | "Medical Laboratory Equipment"
  | "Construction & Workshop Equipment"
  | "Educational & Research Equipment";

export type ResourceAvailability = "Available" | "In Use" | "Waitlist";

export type ResourceCondition = "Like New" | "Excellent" | "Good" | "Fair";

export interface Resource {
  id: string;
  title: string;
  tagline: string;
  description: string;
  longDescription: string;
  category: ResourceCategory;
  images: string[];
  availability: ResourceAvailability;
  condition: ResourceCondition;
  location: string;
  owner: Owner;
  specs: Record<string, string>;
  borrowingTerms: string;
  eligibility: string[];
  deposit: string;
  maxDuration: string;
  tags: string[];
  featured?: boolean;
  popularityScore: number;
  createdAt: string;
}

export interface CategoryInfo {
  id: string;
  name: ResourceCategory;
  description: string;
  count: number;
  image: string;
  iconName: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    "id": "tools-equipment",
    "name": "Tools & Equipment",
    "description": "Drills, saws, pressure washers, and workshop gear.",
    "count": 24,
    "image": "/images/resources/cat_tools.jpg",
    "iconName": "Wrench"
  },
  {
    "id": "outdoor-camping",
    "name": "Outdoor & Camping",
    "description": "Expedition tents, technical packs, stoves, and mountain gear.",
    "count": 38,
    "image": "/images/resources/cat_outdoor.jpg",
    "iconName": "Tent"
  },
  {
    "id": "electronics",
    "name": "Electronics",
    "description": "Inverters, portable power stations, monitors, and testing gear.",
    "count": 19,
    "image": "/images/resources/cat_electronics.jpg",
    "iconName": "Cpu"
  },
  {
    "id": "sports-fitness",
    "name": "Sports & Fitness",
    "description": "Bike trainers, paddleboards, climbing sets, and gym kits.",
    "count": 15,
    "image": "/images/resources/cat_sports.jpg",
    "iconName": "Activity"
  },
  {
    "id": "photography",
    "name": "Photography",
    "description": "Mirrorless bodies, prime lenses, 4K drones, and studio lighting.",
    "count": 22,
    "image": "/images/resources/cat_photo.jpg",
    "iconName": "Camera"
  },
  {
    "id": "books-education",
    "name": "Books & Education",
    "description": "Technical library, STEM kits, language guides, and research sets.",
    "count": 17,
    "image": "/images/resources/cat_books.jpg",
    "iconName": "BookOpen"
  },
  {
    "id": "industrial-machinery",
    "name": "Industrial Machinery",
    "description": "CNC centers, metal lathes, knee mills, welding stations, and industrial compressors.",
    "count": 18,
    "image": "/images/resources/cat_industrial.jpg",
    "iconName": "Factory"
  },
  {
    "id": "general-laboratory",
    "name": "General Laboratory Equipment",
    "description": "Analytical balances, optical microscopes, centrifuges, spectrophotometers, and autoclaves.",
    "count": 25,
    "image": "/images/resources/cat_lab.jpg",
    "iconName": "FlaskConical"
  },
  {
    "id": "medical-laboratory",
    "name": "Medical Laboratory Equipment",
    "description": "Clinical hematology analyzers, biochemistry instruments, PCR cyclers, and cold storage.",
    "count": 16,
    "image": "/images/resources/cat_medical.jpg",
    "iconName": "Stethoscope"
  },
  {
    "id": "construction-workshop",
    "name": "Construction & Workshop Equipment",
    "description": "Concrete mixers, mag-drills, fabrication toolkits, horizontal band saws, and porta-power rams.",
    "count": 20,
    "image": "/images/resources/cat_construction.jpg",
    "iconName": "HardHat"
  },
  {
    "id": "educational-research",
    "name": "Educational & Research Equipment",
    "description": "Autonomous ROS 2 robotics kits, programmable DC supplies, oscilloscopes, and IoT labs.",
    "count": 21,
    "image": "/images/resources/cat_educational.jpg",
    "iconName": "GraduationCap"
  }
];

export const MOCK_RESOURCES: Resource[] = [
  {
    "id": "bosch-laser-level",
    "title": "Bosch Professional Cross-Line Laser Level",
    "tagline": "High-accuracy green beam leveling with 360° magnetic mount",
    "description": "Industrial-grade self-leveling cross-line laser system with sharp green diode technology for maximum daytime visibility. Ideal for tiling, framing, and interior installations.",
    "longDescription": "The Bosch GLL 3-80 Professional delivers 3 x 360° intense green lines for simultaneous horizontal and vertical leveling tasks across entire rooms. Comes in a hard protective case with high-precision magnetic micro-adjusting mount, wall bracket, and rechargeable Li-ion battery pack with 8 hours of continuous run time.",
    "category": "Tools & Equipment",
    "images": [
      "/images/resources/bosch-laser-level.jpg",
      "/images/resources/optics-laser-physics-kit.jpg"
    ],
    "availability": "Available",
    "condition": "Like New",
    "location": "Downtown Central Hub",
    "owner": {
      "name": "Marcus Vance",
      "avatar": "/placeholder-user.jpg",
      "rating": 4.95,
      "reviewCount": 34,
      "verified": true,
      "memberSince": "April 2024",
      "responseRate": "< 30 mins",
      "location": "Downtown Central"
    },
    "specs": {
      "Working Range": "30m (up to 120m with receiver)",
      "Accuracy": "± 0.2 mm/m",
      "Laser Diode": "500 – 540 nm, < 10 mW",
      "Power Source": "12V Li-ion Battery & AA adapter",
      "Dust/Splash Rating": "IP 54 certified"
    },
    "borrowingTerms": "Free community borrow for up to 3 days. Return cleaned in hard carry case. Owner requests a brief demonstration upon pickup.",
    "eligibility": [
      "Verified ResourceX member",
      "Government ID on file",
      "Basic experience with precision optical instruments"
    ],
    "deposit": "$50 refundable hold",
    "maxDuration": "4 days",
    "tags": [
      "leveling",
      "laser",
      "construction",
      "renovation",
      "tools"
    ],
    "featured": true,
    "popularityScore": 96,
    "createdAt": "2026-10-15"
  },
  {
    "id": "osprey-expedition-pack",
    "title": "Osprey Aether Pro 70L Ultralight Trekking Pack",
    "tagline": "Alpine-ready expedition backpack with custom-moldable hipbelt",
    "description": "Rugged, stripped-down technical expedition pack built for multi-week alpine traverses, long backpacking expeditions, and remote backcountry expeditions.",
    "longDescription": "Engineered from NanoFly UHMWPE ultralight fabric, this 70-liter technical pack provides exceptional abrasion resistance with minimal weight penalty. Features a removable top lid, tool loops, reinforced crampon pocket, and an AirScape suspension harness that dynamically adapts to heavy loads.",
    "category": "Outdoor & Camping",
    "images": [
      "/images/resources/osprey-expedition-pack.jpg",
      "/images/resources/cat_outdoor.jpg"
    ],
    "availability": "Available",
    "condition": "Excellent",
    "location": "North Brooklyn Hub",
    "owner": {
      "name": "Elena Rostova",
      "avatar": "/placeholder-user.jpg",
      "rating": 4.88,
      "reviewCount": 22,
      "verified": true,
      "memberSince": "June 2024",
      "responseRate": "< 1 hour",
      "location": "North Brooklyn"
    },
    "specs": {
      "Volume": "70 Liters",
      "Weight": "1.79 kg (stripped 1.49 kg)",
      "Torso Fit": "Medium (18-21 in / 46-53 cm)",
      "Fabric": "NanoFly 210D Nylon x 200D UHMWPE",
      "Recommended Load": "18 - 27 kg"
    },
    "borrowingTerms": "Please air out and clean interior before returning. Do not store damp or wet.",
    "eligibility": [
      "ResourceX profile with photo",
      "Phone number verified"
    ],
    "deposit": "$40 refundable hold",
    "maxDuration": "7 days",
    "tags": [
      "backpack",
      "hiking",
      "trekking",
      "camping",
      "expedition"
    ],
    "featured": true,
    "popularityScore": 92,
    "createdAt": "2026-10-18"
  },
  {
    "id": "sony-a7iii-camera-kit",
    "title": "Sony Alpha A7 III 4K Mirrorless Camera Kit",
    "tagline": "Full-frame 24.2MP sensor with 24-70mm f/2.8 G-Master zoom lens",
    "description": "Complete full-frame mirrorless photography and 4K cinema kit. Includes fast prime/zoom glass, 3 rechargeable batteries, rapid charger, and dual UHS-II SD cards.",
    "longDescription": "The industry workhorse for both creative portraits and commercial 4K video. Equipped with 693 phase-detection AF points, 5-axis in-body image stabilization, S-Log3 gamma curve, and dual card slots. Complete with Pelican hard storm case, lens hoods, and variable ND filter.",
    "category": "Photography",
    "images": [
      "/images/resources/sony-a7iii-camera-kit.jpg",
      "/images/resources/dji-mini-3-pro.jpg"
    ],
    "availability": "In Use",
    "condition": "Like New",
    "location": "West End Creative District",
    "owner": {
      "name": "Julian Rivera",
      "avatar": "/placeholder-user.jpg",
      "rating": 5,
      "reviewCount": 41,
      "verified": true,
      "memberSince": "January 2024",
      "responseRate": "< 15 mins",
      "location": "West End"
    },
    "specs": {
      "Sensor": "24.2 MP Back-Illuminated Exmor R CMOS",
      "Lens": "FE 24-70mm f/2.8 GM (E-mount)",
      "Video Recording": "4K HDR 30p / Full HD 120p",
      "Stabilization": "5-Axis SteadyShot Optical",
      "Media": "2x 128GB SanDisk Extreme Pro V90"
    },
    "borrowingTerms": "Camera body cap and lens rear cap must be kept on when swapping lenses. Strict no-beach or severe dust environment policy.",
    "eligibility": [
      "Verified ID with 2+ positive reviews on ResourceX",
      "Proof of address",
      "Brief handling orientation"
    ],
    "deposit": "$150 refundable hold",
    "maxDuration": "3 days",
    "tags": [
      "camera",
      "sony",
      "photography",
      "4k",
      "video",
      "cinema"
    ],
    "featured": true,
    "popularityScore": 98,
    "createdAt": "2026-09-28"
  },
  {
    "id": "anker-powerhouse-256wh",
    "title": "Anker 521 Portable Power Station 256Wh",
    "tagline": "Clean LiFePO4 battery generator with AC outlet & 60W USB-C PD",
    "description": "Compact, whisper-quiet portable battery station. Powers laptops, CPAP machines, drone chargers, LED camp lights, and camera gear anywhere off-grid.",
    "longDescription": "Equipped with ultra-durable LiFePO4 battery cells rated for 3,000+ full cycles. Features a pure sine wave 200W AC outlet, two USB-A ports, a high-speed 60W USB-C Power Delivery port, and an integrated warm ambient light bar. Recharges from 0 to 80% in 1.5 hours.",
    "category": "Electronics",
    "images": [
      "/images/resources/anker-powerhouse-256wh.jpg",
      "/images/resources/cat_electronics.jpg"
    ],
    "availability": "Available",
    "condition": "Like New",
    "location": "Downtown Central Hub",
    "owner": {
      "name": "Marcus Vance",
      "avatar": "/placeholder-user.jpg",
      "rating": 4.95,
      "reviewCount": 34,
      "verified": true,
      "memberSince": "April 2024",
      "responseRate": "< 30 mins",
      "location": "Downtown Central"
    },
    "specs": {
      "Capacity": "256Wh (12.8V / 20,000mAh)",
      "AC Output": "200W (Surge 450W, Pure Sine Wave)",
      "USB-C Port": "5V/3A, 9V/3A, 15V/3A, 20V/3A (60W Max)",
      "Weight": "3.7 kg / 8.2 lbs",
      "Cell Chemistry": "LiFePO4 (3,000+ cycles to 80%)"
    },
    "borrowingTerms": "Please return charged to at least 70%. Included AC charging brick must be returned together.",
    "eligibility": [
      "Verified ResourceX member"
    ],
    "deposit": "$30 refundable hold",
    "maxDuration": "5 days",
    "tags": [
      "battery",
      "power",
      "portable",
      "camping",
      "electronics",
      "solar"
    ],
    "featured": true,
    "popularityScore": 89,
    "createdAt": "2026-10-10"
  },
  {
    "id": "wahoo-kickr-trainer",
    "title": "Wahoo KICKR Core Direct-Drive Smart Trainer",
    "tagline": "Realistic indoor bicycle trainer with automatic Bluetooth resistance",
    "description": "Direct-drive indoor smart trainer that mounts directly to road or gravel bikes. Compatible with Zwift, TrainerRoad, and Wahoo SYSTM for winter training.",
    "longDescription": "Delivers an ultra-quiet, accurate indoor training experience with ±2% power accuracy and simulated gradients up to 16%. Pre-installed with an 11-speed Shimano 11-28t cassette, quick-release and thru-axle adapters (130/135mm QR, 12x142, 12x148).",
    "category": "Sports & Fitness",
    "images": [
      "/images/resources/wahoo-kickr-trainer.jpg",
      "/images/resources/cat_sports.jpg"
    ],
    "availability": "Available",
    "condition": "Excellent",
    "location": "East River Waterfront",
    "owner": {
      "name": "Claire Moreau",
      "avatar": "/placeholder-user.jpg",
      "rating": 4.92,
      "reviewCount": 19,
      "verified": true,
      "memberSince": "August 2024",
      "responseRate": "< 45 mins",
      "location": "East River"
    },
    "specs": {
      "Accuracy": "± 2%",
      "Max Power Output": "1,800 Watts",
      "Max Simulated Grade": "16%",
      "Connectivity": "ANT+ FE-C and Bluetooth FTMS",
      "Cassette Included": "Shimano 11-Speed 11-28t"
    },
    "borrowingTerms": "Ensure proper axle spacer match for your bike. Trainer sweat mat included and required during sessions.",
    "eligibility": [
      "Verified ResourceX account",
      "Must have a compatible road/gravel bike"
    ],
    "deposit": "$60 refundable hold",
    "maxDuration": "14 days",
    "tags": [
      "cycling",
      "trainer",
      "bike",
      "indoor",
      "zwift",
      "fitness"
    ],
    "featured": false,
    "popularityScore": 84,
    "createdAt": "2026-10-05"
  },
  {
    "id": "big-agnes-expedition-tent",
    "title": "Big Agnes Copper Spur HV UL3 4-Season Expedition Tent",
    "tagline": "Ultralight 3-person double-wall backpacking tent with vestibules",
    "description": "Top-tier 3-person freestanding mountain tent. Featherweight trail weight without sacrificing stormproof durability or dual vestibule living space.",
    "longDescription": "Features proprietary double-ripstop mixed denier nylon that provides higher tear strength while cutting ounces. Dual awning-style vestibules expand sheltered space, while pre-bent DAC Featherlite NFL poles maximize interior headroom. Footprint ground tarp and 8 ultralight stakes included.",
    "category": "Outdoor & Camping",
    "images": [
      "/images/resources/big-agnes-expedition-tent.jpg",
      "/images/resources/osprey-expedition-pack.jpg"
    ],
    "availability": "Waitlist",
    "condition": "Excellent",
    "location": "North Brooklyn Hub",
    "owner": {
      "name": "Elena Rostova",
      "avatar": "/placeholder-user.jpg",
      "rating": 4.88,
      "reviewCount": 22,
      "verified": true,
      "memberSince": "June 2024",
      "responseRate": "< 1 hour",
      "location": "North Brooklyn"
    },
    "specs": {
      "Capacity": "3 Person",
      "Trail Weight": "1.59 kg (3 lbs 8 oz)",
      "Floor Area": "41 sq ft / 3.8 sq m",
      "Vestibule Area": "9 + 9 sq ft",
      "Poles": "DAC Featherlite NFL & NSL"
    },
    "borrowingTerms": "Tent must be completely dry before repacking into stuff sack to prevent mildew. Never store damp.",
    "eligibility": [
      "Experienced camper / backpacker",
      "Verified ResourceX account"
    ],
    "deposit": "$75 refundable hold",
    "maxDuration": "6 days",
    "tags": [
      "tent",
      "camping",
      "shelter",
      "ultralight",
      "outdoor"
    ],
    "featured": true,
    "popularityScore": 95,
    "createdAt": "2026-09-15"
  },
  {
    "id": "dewalt-miter-saw",
    "title": "DeWalt 12-Inch Double-Bevel Sliding Compound Miter Saw",
    "tagline": "Precision woodworking cutting system with LED shadow cut line",
    "description": "Heavy-duty 15-Amp compound sliding miter saw with 12-inch 60-tooth carbide blade. Ideal for baseboards, crown molding, deck building, and framing.",
    "longDescription": "Features the innovative XPS cross-cut positioning system with an ultra-bright LED that casts a laser-accurate blade shadow on the cut line. Miter detent plate includes 14 positive stops, while tall sliding fences support up to 7-1/2-inch nested crown molding.",
    "category": "Tools & Equipment",
    "images": [
      "/images/resources/dewalt-miter-saw.jpg",
      "/images/resources/horizontal-metal-band-saw.jpg"
    ],
    "availability": "Available",
    "condition": "Good",
    "location": "South Industrial District",
    "owner": {
      "name": "Hank Kowalski",
      "avatar": "/placeholder-user.jpg",
      "rating": 4.81,
      "reviewCount": 16,
      "verified": true,
      "memberSince": "May 2024",
      "responseRate": "< 2 hours",
      "location": "South Industrial"
    },
    "specs": {
      "Blade Diameter": "12 Inches (305 mm)",
      "Amps": "15 Amp Motor, 3,800 RPM",
      "Horizontal Cut Capacity": "2x14 at 90°, 2x10 at 45°",
      "Bevel Range": "0° to 48° Left and Right",
      "Weight": "25.4 kg / 56 lbs"
    },
    "borrowingTerms": "Requires vehicle transport due to weight. Eye and ear protection included and mandatory. Wood only; no masonry or metal cutting.",
    "eligibility": [
      "Safety waiver signed",
      "Prior power tool experience required",
      "Physical pickup at workshop required"
    ],
    "deposit": "$70 refundable hold",
    "maxDuration": "3 days",
    "tags": [
      "saw",
      "woodworking",
      "carpentry",
      "miter",
      "dewalt",
      "tools"
    ],
    "featured": false,
    "popularityScore": 88,
    "createdAt": "2026-10-12"
  },
  {
    "id": "dji-mini-3-pro",
    "title": "DJI Mini 3 Pro 4K Drone Fly More Combo",
    "tagline": "Sub-249g ultralight drone with 4K/60fps HDR & True Vertical Shooting",
    "description": "Tri-directional obstacle sensing folding drone with DJI RC smart remote controller, three 34-minute flight batteries, and charging hub in leather case.",
    "longDescription": "Weighing under 249g, the Mini 3 Pro requires no FAA registration for recreational flights in most regions. Equipped with a 1/1.3-inch sensor featuring dual native ISO, f/1.7 aperture, and 48MP RAW photo capability. Includes 3 intelligent flight batteries and ND filter set (ND16/64/256).",
    "category": "Photography",
    "images": [
      "/images/resources/dji-mini-3-pro.jpg",
      "/images/resources/sony-a7iii-camera-kit.jpg"
    ],
    "availability": "Available",
    "condition": "Like New",
    "location": "West End Creative District",
    "owner": {
      "name": "Julian Rivera",
      "avatar": "/placeholder-user.jpg",
      "rating": 5,
      "reviewCount": 41,
      "verified": true,
      "memberSince": "January 2024",
      "responseRate": "< 15 mins",
      "location": "West End"
    },
    "specs": {
      "Takeoff Weight": "< 249 Grams",
      "Max Flight Time": "34 Mins per battery (x3 included)",
      "Video Resolution": "4K at up to 60fps / HDR 30fps",
      "Transmission Range": "12 km (DJI O3 Video Transmission)",
      "Obstacle Sensing": "Forward, Backward, Downward Vision"
    },
    "borrowingTerms": "Must comply with local recreational airspace laws. Never fly in rain or high winds (> 20 mph).",
    "eligibility": [
      "Verified ResourceX ID",
      "TRUST test certificate completion"
    ],
    "deposit": "$100 refundable hold",
    "maxDuration": "4 days",
    "tags": [
      "drone",
      "dji",
      "4k",
      "aerial",
      "photography",
      "video"
    ],
    "featured": true,
    "popularityScore": 97,
    "createdAt": "2026-10-20"
  },
  {
    "id": "inflatable-paddleboard",
    "title": "Red Paddle Co 10'6\" Ride Inflatable SUP Package",
    "tagline": "All-round touring stand-up paddleboard with high-pressure Titan pump",
    "description": "The world's benchmark inflatable SUP board. Stiff MSL composite construction, carbon-nylon 3-piece paddle, coiled leash, and all-terrain wheeled roller backpack.",
    "longDescription": "Inflates to an ultra-rigid 20 PSI using the dual-chamber Titan II hand pump. The 10'6\" Ride provides outstanding glide and stability for ocean bays, flat lakes, and calm rivers. Includes waterproof phone drybag and US-box removable touring fin.",
    "category": "Sports & Fitness",
    "images": [
      "/images/resources/inflatable-paddleboard.jpg",
      "/images/resources/cat_sports.jpg"
    ],
    "availability": "Available",
    "condition": "Excellent",
    "location": "East River Waterfront",
    "owner": {
      "name": "Claire Moreau",
      "avatar": "/placeholder-user.jpg",
      "rating": 4.92,
      "reviewCount": 19,
      "verified": true,
      "memberSince": "August 2024",
      "responseRate": "< 45 mins",
      "location": "East River"
    },
    "specs": {
      "Length": "10'6\" (320 cm)",
      "Width": "32\" (81 cm)",
      "Thickness": "4.7\" (12 cm)",
      "Volume": "245 Liters",
      "Max Rider Weight": "110 kg / 240 lbs"
    },
    "borrowingTerms": "Rinse with fresh water after saltwater use. Pack dry into roller bag.",
    "eligibility": [
      "Must know how to swim",
      "Verified ResourceX member"
    ],
    "deposit": "$50 refundable hold",
    "maxDuration": "5 days",
    "tags": [
      "paddleboard",
      "sup",
      "water",
      "lake",
      "fitness",
      "sports"
    ],
    "featured": false,
    "popularityScore": 86,
    "createdAt": "2026-10-02"
  },
  {
    "id": "oreilly-cs-collection",
    "title": "O'Reilly Distributed Systems & Rust Masterclass Set",
    "tagline": "Comprehensive 6-volume hardcover reference library for engineers",
    "description": "Definitive technical collection covering Designing Data-Intensive Applications (Kleppmann), Programming Rust 2nd Ed, Database Internals, and Cloud Native Patterns.",
    "longDescription": "Curated library of core computer science reference texts kept in immaculate condition. Includes: Designing Data-Intensive Applications, Programming Rust, Database Internals, Site Reliability Engineering, Kafka: The Definitive Guide, and Linux Observability with BPF.",
    "category": "Books & Education",
    "images": [
      "/images/resources/oreilly-cs-collection.jpg",
      "/images/resources/cat_books.jpg"
    ],
    "availability": "Available",
    "condition": "Like New",
    "location": "University Campus Hub",
    "owner": {
      "name": "Dr. Aris Thorne",
      "avatar": "/placeholder-user.jpg",
      "rating": 5,
      "reviewCount": 12,
      "verified": true,
      "memberSince": "March 2024",
      "responseRate": "< 1 hour",
      "location": "University Campus"
    },
    "specs": {
      "Volumes": "6 Hardcover Textbooks",
      "Topics": "Distributed Systems, Rust, Databases, SRE",
      "Language": "English",
      "Edition Year": "2022 - 2024 Revisions"
    },
    "borrowingTerms": "No highlighting or writing in margins. Bookmarks provided with set.",
    "eligibility": [
      "ResourceX member in good standing"
    ],
    "deposit": "$25 refundable hold",
    "maxDuration": "21 days",
    "tags": [
      "books",
      "programming",
      "rust",
      "distributed-systems",
      "education"
    ],
    "featured": false,
    "popularityScore": 81,
    "createdAt": "2026-10-08"
  },
  {
    "id": "mit-robotics-sensor-lab",
    "title": "MIT ROS 2 & Autonomous Robotics Sensor Kit",
    "tagline": "LiDAR, depth camera, IMU and compute module for robotics research",
    "description": "Educational robotics research lab kit. Includes an RPLiDAR A2 360° laser scanner, Intel RealSense D435i stereo depth camera, and Raspberry Pi 5 8GB controller.",
    "longDescription": "An advanced hardware lab in a box for developing autonomous mapping, SLAM navigation, and computer vision with ROS 2 Humble/Iron. Pre-flashed with Ubuntu 24.04 LTS and robotics demo stacks, with custom 3D-printed mounting plates and high-speed USB cables.",
    "category": "Educational & Research Equipment",
    "images": [
      "/images/resources/mit-robotics-sensor-lab.jpg",
      "/images/resources/ros2-mobile-research-robot.jpg"
    ],
    "availability": "In Use",
    "condition": "Excellent",
    "location": "University Campus Hub",
    "owner": {
      "name": "Dr. Aris Thorne",
      "avatar": "/placeholder-user.jpg",
      "rating": 5,
      "reviewCount": 12,
      "verified": true,
      "memberSince": "March 2024",
      "responseRate": "< 1 hour",
      "location": "University Campus"
    },
    "specs": {
      "LiDAR": "RPLiDAR A2M12 (12m range, 10Hz, 360°)",
      "Depth Camera": "Intel RealSense D435i (RGB + Stereo IR + IMU)",
      "Compute Module": "Raspberry Pi 5 8GB Quad-Core 2.4GHz",
      "Interface": "USB 3.0 Type-C / Ethernet"
    },
    "borrowingTerms": "Static wrist strap included and recommended during bench experiments. Return all cables in labeled zip pouches.",
    "eligibility": [
      "Demonstrated basic Linux / ROS experience",
      "Verified ResourceX student or researcher"
    ],
    "deposit": "$80 refundable hold",
    "maxDuration": "14 days",
    "tags": [
      "robotics",
      "lidar",
      "realsense",
      "ros2",
      "stem",
      "education"
    ],
    "featured": true,
    "popularityScore": 91,
    "createdAt": "2026-09-30"
  },
  {
    "id": "fluke-87v-multimeter",
    "title": "Fluke 87V True-RMS Industrial Digital Multimeter",
    "tagline": "The gold standard industrial multimeter with temperature probe",
    "description": "Heavy-duty CAT IV 600V / CAT III 1000V industrial multimeter. Measures AC/DC voltage, current, resistance, capacitance, frequency, and motor drive signals.",
    "longDescription": "Built for harsh industrial environments, the Fluke 87V includes a unique function for accurate measurements on noisy pulse-width modulated (PWM) motor drive equipment. Includes premium silicone test leads, alligator clips, K-type thermocouple probe, and magnetic hanging strap.",
    "category": "Electronics",
    "images": [
      "/images/resources/fluke-87v-multimeter.jpg",
      "/images/resources/programmable-dc-bench-supply.jpg"
    ],
    "availability": "Available",
    "condition": "Like New",
    "location": "Downtown Central Hub",
    "owner": {
      "name": "Marcus Vance",
      "avatar": "/placeholder-user.jpg",
      "rating": 4.95,
      "reviewCount": 34,
      "verified": true,
      "memberSince": "April 2024",
      "responseRate": "< 30 mins",
      "location": "Downtown Central"
    },
    "specs": {
      "DC Voltage": "1000V max (±0.05% basic accuracy)",
      "AC Voltage": "1000V max True-RMS (up to 20kHz bandwidth)",
      "Current": "10A continuous (20A for 30 seconds)",
      "Safety Ratings": "CAT IV 600V / CAT III 1000V certified",
      "Display": "4-1/2 digit mode with dual-level backlight"
    },
    "borrowingTerms": "Do not exceed CAT voltage limits. Magnetic hanger and leads must be stored in holster.",
    "eligibility": [
      "Basic electrical safety competence",
      "Verified ResourceX member"
    ],
    "deposit": "$40 refundable hold",
    "maxDuration": "5 days",
    "tags": [
      "multimeter",
      "fluke",
      "electronics",
      "electrical",
      "testing"
    ],
    "featured": false,
    "popularityScore": 87,
    "createdAt": "2026-10-14"
  },
  {
    "id": "makita-brushless-combo",
    "title": "Makita 18V LXT Brushless Cordless Drill & Impact Driver",
    "tagline": "Sub-compact cordless fastening & drilling kit with 2x 4.0Ah batteries",
    "description": "Professional contractor combo kit. Includes 1/2-inch hammer drill, 1/4-inch hex impact driver, dual rapid charger, and 2 high-capacity 18V 4.0Ah batteries.",
    "longDescription": "Features efficient brushless motors that deliver up to 530 in.lbs of torque on the drill and 1,500 in.lbs on the impact driver. Dual LED work lights illuminate dark work spaces. Comes in a durable contractor tote with magnetic screw guide and bit set.",
    "category": "Tools & Equipment",
    "images": [
      "/images/resources/makita-brushless-combo.jpg",
      "/images/resources/dewalt-miter-saw.jpg"
    ],
    "availability": "Available",
    "condition": "Excellent",
    "location": "South Industrial District",
    "owner": {
      "name": "Hank Kowalski",
      "avatar": "/placeholder-user.jpg",
      "rating": 4.81,
      "reviewCount": 16,
      "verified": true,
      "memberSince": "May 2024",
      "responseRate": "< 2 hours",
      "location": "South Industrial"
    },
    "specs": {
      "Voltage": "18V LXT Lithium-Ion",
      "Hammer Drill Torque": "530 in.lbs Max",
      "Impact Driver Torque": "1,500 in.lbs Max",
      "Batteries": "2x 4.0Ah Batteries with fuel gauges",
      "Charger": "Rapid Optimum Charger (36 min charge time)"
    },
    "borrowingTerms": "Return batteries charged. Blow out dust with compressed air before returning.",
    "eligibility": [
      "Verified ResourceX account"
    ],
    "deposit": "$35 refundable hold",
    "maxDuration": "4 days",
    "tags": [
      "drill",
      "impact",
      "tools",
      "makita",
      "cordless",
      "construction"
    ],
    "featured": true,
    "popularityScore": 93,
    "createdAt": "2026-10-16"
  },
  {
    "id": "climbing-gear-rack",
    "title": "Black Diamond Complete Trad Climbing Protection Rack",
    "tagline": "Full set of Camalot C4s, stopper nuts, alpine quickdraws and carabiners",
    "description": "Certified rock climbing protection rack. Includes Camalot C4 cams (#0.4 to #3), 13-piece nut set with nut tool, and 6 Dynex alpine trad quickdraws.",
    "longDescription": "Inspected and maintained protection equipment for trad multi-pitch routes. Every cam lobe and sling is meticulously tracked with inspection logs. Includes color-coded wiregate carabiners, 120cm Dynex runner slings, and a designated gear sling.",
    "category": "Outdoor & Camping",
    "images": [
      "/images/resources/climbing-gear-rack.jpg",
      "/images/resources/osprey-expedition-pack.jpg"
    ],
    "availability": "Available",
    "condition": "Like New",
    "location": "North Brooklyn Hub",
    "owner": {
      "name": "Elena Rostova",
      "avatar": "/placeholder-user.jpg",
      "rating": 4.88,
      "reviewCount": 22,
      "verified": true,
      "memberSince": "June 2024",
      "responseRate": "< 1 hour",
      "location": "North Brooklyn"
    },
    "specs": {
      "Cams": "BD Camalot C4 (#0.4, #0.5, #0.75, #1, #2, #3)",
      "Nuts": "BD Stopper Set #4 - #13",
      "Slings": "6x 10mm Dynex Alpine Draws 60cm",
      "Inspection": "Certified inspection log signed October 2026"
    },
    "borrowingTerms": "Must inspect each piece with owner upon pickup and return. Any leader falls must be reported honestly for gear retirement.",
    "eligibility": [
      "Experienced trad climber",
      "Safety waiver signed",
      "ResourceX verified profile"
    ],
    "deposit": "$100 refundable hold",
    "maxDuration": "5 days",
    "tags": [
      "climbing",
      "trad",
      "mountain",
      "outdoor",
      "safety"
    ],
    "featured": false,
    "popularityScore": 90,
    "createdAt": "2026-10-11"
  },
  {
    "id": "cnc-vertical-machining-center",
    "title": "Haas VF-2 Vertical CNC Machining Center",
    "tagline": "High-precision 3-axis CNC vertical milling machine with 20-pocket tool changer",
    "description": "Industry-standard vertical CNC machining center for prototyping, precision tooling, and aerospace aluminum/steel fabrication.",
    "longDescription": "The Haas VF-2 features 30\" x 16\" x 20\" axis travels, an 8,100-RPM inline direct-drive 40-taper spindle, and a 20-station carousel tool changer. Equipped with Haas Next-Gen Control, rigid tapping, and wireless intuitive probing system.",
    "category": "Industrial Machinery",
    "images": [
      "/images/resources/cnc-vertical-machining-center.jpg",
      "/images/resources/cat_industrial.jpg"
    ],
    "availability": "Available",
    "condition": "Like New",
    "location": "South Industrial District",
    "owner": {
      "name": "Hank Kowalski",
      "avatar": "/placeholder-user.jpg",
      "rating": 4.81,
      "reviewCount": 16,
      "verified": true,
      "memberSince": "May 2024",
      "responseRate": "< 2 hours",
      "location": "South Industrial"
    },
    "specs": {
      "Travels (X, Y, Z)": "30\" x 16\" x 20\" (762 x 406 x 508 mm)",
      "Spindle Speed": "8,100 RPM",
      "Spindle Power": "30 HP Vector Drive",
      "Tool Changer": "20-Station Carousel (CAT 40)",
      "Table Size": "36\" x 14\" (914 x 356 mm)"
    },
    "borrowingTerms": "Institutional/licensed machine shop access only. Operator certification required. Return with clean coolant reservoir and chip tray.",
    "eligibility": [
      "Verified Industrial Partner",
      "CNC Programming & Setup Certification",
      "Proof of Commercial Liability Insurance"
    ],
    "deposit": "$500 refundable hold",
    "maxDuration": "14 days",
    "tags": [
      "cnc",
      "machining",
      "milling",
      "metalworking",
      "industrial",
      "haas"
    ],
    "featured": true,
    "popularityScore": 99,
    "createdAt": "2026-10-25"
  },
  {
    "id": "precision-metal-engine-lathe",
    "title": "Grizzly Industrial 14\"x40\" Precision Metal Engine Lathe",
    "tagline": "Heavy-duty gear-head metal lathe with D1-5 camlock spindle and coolant system",
    "description": "Versatile precision metal turning center for threading, turning, boring, and shaft fabrication with digital readout.",
    "longDescription": "Features hardened and ground V-way bed ways, 2\" spindle bore, 12 gear-head speeds from 40 to 1,800 RPM, and foot brake. Includes 3-jaw self-centering chuck, 4-jaw independent chuck, faceplate, follow rest, and steady rest.",
    "category": "Industrial Machinery",
    "images": [
      "/images/resources/precision-metal-engine-lathe.jpg",
      "/images/resources/cat_industrial.jpg"
    ],
    "availability": "Available",
    "condition": "Excellent",
    "location": "South Industrial District",
    "owner": {
      "name": "Hank Kowalski",
      "avatar": "/placeholder-user.jpg",
      "rating": 4.81,
      "reviewCount": 16,
      "verified": true,
      "memberSince": "May 2024",
      "responseRate": "< 2 hours",
      "location": "South Industrial"
    },
    "specs": {
      "Swing Over Bed": "14 Inches (355 mm)",
      "Distance Between Centers": "40 Inches (1,016 mm)",
      "Spindle Bore": "2 Inches (51 mm)",
      "Spindle Speeds": "12 Speeds: 40 - 1,800 RPM",
      "Motor": "3 HP, 220V, 3-Phase"
    },
    "borrowingTerms": "Tooling inserts and toolholder kit must be returned cleaned and accounted for. Never run without proper way lubrication.",
    "eligibility": [
      "Machinist trade certificate or verified portfolio",
      "Safety waiver signed"
    ],
    "deposit": "$250 refundable hold",
    "maxDuration": "7 days",
    "tags": [
      "lathe",
      "metalworking",
      "turning",
      "machining",
      "industrial"
    ],
    "featured": false,
    "popularityScore": 91,
    "createdAt": "2026-10-24"
  },
  {
    "id": "vertical-knee-milling-machine",
    "title": "Bridgeport Series I Precision Vertical Knee Milling Machine",
    "tagline": "Classic vertical milling machine with 2-axis Acu-Rite digital readout & power feed",
    "description": "The gold standard manual milling machine for prototype metalworking, slotting, face milling, and fixture creation.",
    "longDescription": "Equipped with variable-speed head (60 to 4,200 RPM), chrome ways, 9\" x 48\" heavy ribbed cast-iron table, R8 spindle taper, and precision 0.0001\" 2-axis digital readout. Includes Kurt 6\" angle-lock milling vise and R8 collet set.",
    "category": "Industrial Machinery",
    "images": [
      "/images/resources/vertical-knee-milling-machine.jpg",
      "/images/resources/cat_industrial.jpg"
    ],
    "availability": "Available",
    "condition": "Excellent",
    "location": "South Industrial District",
    "owner": {
      "name": "Hank Kowalski",
      "avatar": "/placeholder-user.jpg",
      "rating": 4.81,
      "reviewCount": 16,
      "verified": true,
      "memberSince": "May 2024",
      "responseRate": "< 2 hours",
      "location": "South Industrial"
    },
    "specs": {
      "Table Size": "9\" x 48\" (229 x 1,219 mm)",
      "Table Travel (X/Y/Z)": "36\" / 12\" / 16\"",
      "Spindle Taper": "R8",
      "Speed Range": "60 to 4,200 RPM Variable",
      "Motor": "2 HP Variable Speed Drive"
    },
    "borrowingTerms": "Wipe down table and oil with ISO 68 way lube before return. Use included brass vise jaw guards.",
    "eligibility": [
      "Verified ResourceX member",
      "Demonstrated manual milling competency"
    ],
    "deposit": "$200 refundable hold",
    "maxDuration": "7 days",
    "tags": [
      "milling",
      "bridgeport",
      "knee-mill",
      "machining",
      "tools"
    ],
    "featured": false,
    "popularityScore": 89,
    "createdAt": "2026-10-23"
  },
  {
    "id": "industrial-multiprocess-welder",
    "title": "Miller Multimatic 255 Pulse MIG/TIG Industrial Welder",
    "tagline": "Multi-process inverter welding power source with pulsed MIG and color LCD",
    "description": "Industrial multi-process welding system capable of pulsed MIG, flux-cored, DC TIG, and stick welding up to 1/2-inch aluminum and steel.",
    "longDescription": "Features Auto-Set Elite technology for fast parameter configuration, built-in pulsed MIG programs for low distortion, dual gas solenoid valves, and heavy-duty 4-roll wire drive. Supplied with 15-foot Bernard MIG gun, ground clamp, argon regulator, and cart.",
    "category": "Industrial Machinery",
    "images": [
      "/images/resources/industrial-multiprocess-welder.jpg",
      "/images/resources/cat_tools.jpg"
    ],
    "availability": "Available",
    "condition": "Like New",
    "location": "South Industrial District",
    "owner": {
      "name": "Hank Kowalski",
      "avatar": "/placeholder-user.jpg",
      "rating": 4.81,
      "reviewCount": 16,
      "verified": true,
      "memberSince": "May 2024",
      "responseRate": "< 2 hours",
      "location": "South Industrial"
    },
    "specs": {
      "Processes": "MIG, Pulsed MIG, Stick, DC TIG",
      "Welding Output": "250A at 26.5V, 60% Duty Cycle",
      "Input Power": "208 - 575 V, 1-Phase or 3-Phase",
      "Wire Feed Speed": "50 – 800 IPM",
      "Weight": "38 kg / 84 lbs (power source)"
    },
    "borrowingTerms": "Argon gas bottle not included (bring own certified cylinder or swap via hub). Auto-darkening helmet included.",
    "eligibility": [
      "Certified welder or AWS cardholder",
      "Hot-work safety agreement signed"
    ],
    "deposit": "$150 refundable hold",
    "maxDuration": "5 days",
    "tags": [
      "welder",
      "miller",
      "mig",
      "tig",
      "welding",
      "fabrication"
    ],
    "featured": true,
    "popularityScore": 94,
    "createdAt": "2026-10-22"
  },
  {
    "id": "rotary-screw-air-compressor",
    "title": "Ingersoll Rand 15HP Rotary Screw Air Compressor",
    "tagline": "Continuous-duty 60 CFM quiet industrial air compressor with refrigerated dryer",
    "description": "Quiet, continuous 100% duty cycle rotary screw compressor package for industrial manufacturing, spray finishing, and pneumatic machinery.",
    "longDescription": "Delivers 57.5 CFM at 125 PSI with whisper-quiet 69 dBA operating levels. Features integrated refrigerated air dryer, high-efficiency moisture separator, poly-V belt drive, and microprocessor control with automatic stop/restart mode.",
    "category": "Industrial Machinery",
    "images": [
      "/images/resources/rotary-screw-air-compressor.jpg",
      "/images/resources/cat_industrial.jpg"
    ],
    "availability": "Available",
    "condition": "Excellent",
    "location": "South Industrial District",
    "owner": {
      "name": "Hank Kowalski",
      "avatar": "/placeholder-user.jpg",
      "rating": 4.81,
      "reviewCount": 16,
      "verified": true,
      "memberSince": "May 2024",
      "responseRate": "< 2 hours",
      "location": "South Industrial"
    },
    "specs": {
      "Horsepower": "15 HP (11 kW)",
      "Max Operating Pressure": "125 PSI (8.6 bar)",
      "Flow Rate": "57.5 CFM at 125 PSI",
      "Sound Level": "69 dBA",
      "Tank Capacity": "80 Gallon ASME Receiver"
    },
    "borrowingTerms": "Requires 460V 3-phase power drop at customer site or hub deployment. Pre-filter blowdown daily.",
    "eligibility": [
      "Commercial/institutional facility member",
      "Electrical disconnect verification"
    ],
    "deposit": "$300 refundable hold",
    "maxDuration": "14 days",
    "tags": [
      "compressor",
      "air",
      "pneumatic",
      "rotary-screw",
      "industrial"
    ],
    "featured": false,
    "popularityScore": 86,
    "createdAt": "2026-10-21"
  },
  {
    "id": "heavy-duty-hydraulic-press",
    "title": "Dake 50-Ton H-Frame Workshop Hydraulic Press",
    "tagline": "Industrial 50-ton hydraulic press with movable workhead and rapid advance",
    "description": "Heavy steel H-frame shop press for pressing bearings, bushings, stamping, bending, and structural metal forming.",
    "longDescription": "Built from heavy welded steel channel with 50-ton pressing capacity. Features an adjustable work table with self-locking cable hoist, dial tonnage pressure gauge, moveable workhead, and rapid-advance screw mechanism.",
    "category": "Industrial Machinery",
    "images": [
      "/images/resources/heavy-duty-hydraulic-press.jpg",
      "/images/resources/cat_industrial.jpg"
    ],
    "availability": "Available",
    "condition": "Good",
    "location": "South Industrial District",
    "owner": {
      "name": "Hank Kowalski",
      "avatar": "/placeholder-user.jpg",
      "rating": 4.81,
      "reviewCount": 16,
      "verified": true,
      "memberSince": "May 2024",
      "responseRate": "< 2 hours",
      "location": "South Industrial"
    },
    "specs": {
      "Capacity": "50 Tons (445 kN)",
      "Ram Stroke": "6 Inches (152 mm)",
      "Width Between Uprights": "32.75 Inches (832 mm)",
      "Table Travel": "40 Inches (1,016 mm)",
      "Overall Weight": "430 kg / 950 lbs"
    },
    "borrowingTerms": "Supplied with matched V-blocks and pressing arbor plates. Never exceed 50-ton dial limit. Pickup requires liftgate or trailer.",
    "eligibility": [
      "Experienced shop mechanic / fabricator",
      "Safety release waiver"
    ],
    "deposit": "$150 refundable hold",
    "maxDuration": "7 days",
    "tags": [
      "press",
      "hydraulic",
      "50-ton",
      "metalworking",
      "workshop"
    ],
    "featured": false,
    "popularityScore": 88,
    "createdAt": "2026-10-20"
  },
  {
    "id": "diesel-industrial-generator",
    "title": "Cummins 25kVA Sound-Attenuated Diesel Industrial Generator",
    "tagline": "3-Phase prime power diesel generator in weatherproof soundproof acoustic canopy",
    "description": "Rugged 25 kVA industrial diesel backup and prime generator for remote work sites, temporary labs, and heavy field power.",
    "longDescription": "Powered by a 4-cylinder turbocharged Cummins diesel engine with digital PowerCommand governor and control unit. Delivers 25 kVA / 20 kW prime 3-phase 415V/240V power with 65 dBA noise profile at 7 meters. Features large 120L bunded fuel tank for 18+ hours runtime.",
    "category": "Industrial Machinery",
    "images": [
      "/images/resources/diesel-industrial-generator.jpg",
      "/images/resources/jobsite-power-generator.jpg"
    ],
    "availability": "In Use",
    "condition": "Like New",
    "location": "South Industrial District",
    "owner": {
      "name": "Hank Kowalski",
      "avatar": "/placeholder-user.jpg",
      "rating": 4.81,
      "reviewCount": 16,
      "verified": true,
      "memberSince": "May 2024",
      "responseRate": "< 2 hours",
      "location": "South Industrial"
    },
    "specs": {
      "Prime Output": "25 kVA / 20 kW (3-Phase 415/240V)",
      "Engine": "Cummins 4BTA 3.9L Turbocharged Diesel",
      "Fuel Tank Capacity": "120 Liters (18 hrs at 75% load)",
      "Acoustic Rating": "65 dBA at 7 meters",
      "Enclosure": "IP 56 Powder-Coated Weatherproof Canopy"
    },
    "borrowingTerms": "Return fueled with clean ultra-low sulfur diesel. Hour meter logged at checkout. Trailer mount requires Class III hitch.",
    "eligibility": [
      "Valid driving license with towing endorsement",
      "Verified commercial/event organizer"
    ],
    "deposit": "$350 refundable hold",
    "maxDuration": "10 days",
    "tags": [
      "generator",
      "diesel",
      "3-phase",
      "cummins",
      "power",
      "industrial"
    ],
    "featured": true,
    "popularityScore": 93,
    "createdAt": "2026-10-19"
  },
  {
    "id": "industrial-fdm-3d-printer",
    "title": "Ultimaker S7 Pro Industrial Dual-Extrusion 3D Production System",
    "tagline": "Large-format dual-extrusion 3D printer with integrated Material Station & Air Manager",
    "description": "Production-grade 3D printing system with active heated chamber, automatic filament switching for 6 spools, and soluble support capability.",
    "longDescription": "Features inductive sensor-assisted auto bed leveling, PEI coated flexible build plate, integrated HEPA Air Manager, and dual quick-swap Print Cores. Supports carbon fiber composites, nylon, ABS, TPU, and water-soluble PVA support materials with exceptional dimensional repeatability.",
    "category": "Industrial Machinery",
    "images": [
      "/images/resources/industrial-fdm-3d-printer.jpg",
      "/images/resources/educational-corexy-3d-printer.jpg"
    ],
    "availability": "Available",
    "condition": "Like New",
    "location": "University Campus Hub",
    "owner": {
      "name": "Dr. Aris Thorne",
      "avatar": "/placeholder-user.jpg",
      "rating": 5,
      "reviewCount": 12,
      "verified": true,
      "memberSince": "March 2024",
      "responseRate": "< 1 hour",
      "location": "University Campus"
    },
    "specs": {
      "Build Volume": "330 x 240 x 300 mm (13 x 9.4 x 11.8 in)",
      "Layer Resolution": "Up to 20 Microns",
      "Nozzle Temperatures": "Up to 280°C",
      "Material Capacity": "6-Spool Automated Material Station",
      "Filament Diameter": "2.85 mm"
    },
    "borrowingTerms": "Supplied with CC 0.6mm core and AA 0.4mm cores. Clean PEI build plate with 99% IPA only; never scrape with metal tools.",
    "eligibility": [
      "Verified CAD/3D printing portfolio",
      "University/institutional researcher"
    ],
    "deposit": "$180 refundable hold",
    "maxDuration": "7 days",
    "tags": [
      "3d-printer",
      "additive-manufacturing",
      "fdm",
      "rapid-prototyping",
      "ultimaker"
    ],
    "featured": true,
    "popularityScore": 97,
    "createdAt": "2026-10-18"
  },
  {
    "id": "analytical-precision-balance",
    "title": "Mettler Toledo ME-T 0.0001g Analytical Precision Balance",
    "tagline": "High-accuracy 0.1mg analytical balance with draft shield and internal calibration",
    "description": "Laboratory research grade analytical balance with electromagnetic force compensation for chemical weighing and analytical prep.",
    "longDescription": "Features 220g capacity with 0.1mg (0.0001g) readability, automatic internal FACT calibration adjusting for ambient temperature drift, and draft shield with three slide-open doors. Color touchscreen interface with GLP/GMP compliant data output.",
    "category": "General Laboratory Equipment",
    "images": [
      "/images/resources/analytical-precision-balance.jpg",
      "/images/resources/cat_lab.jpg"
    ],
    "availability": "Available",
    "condition": "Like New",
    "location": "University Campus Hub",
    "owner": {
      "name": "Dr. Aris Thorne",
      "avatar": "/placeholder-user.jpg",
      "rating": 5,
      "reviewCount": 12,
      "verified": true,
      "memberSince": "March 2024",
      "responseRate": "< 1 hour",
      "location": "University Campus"
    },
    "specs": {
      "Max Capacity": "220 Grams",
      "Readability": "0.1 mg (0.0001 g)",
      "Repeatability": "0.08 mg",
      "Pan Diameter": "90 mm (3.54 in)",
      "Calibration": "Internal FACT automatic adjustment"
    },
    "borrowingTerms": "Calibrated balance must be transported in padded flight case with shipping locks engaged. Avoid thermal shock.",
    "eligibility": [
      "Verified laboratory researcher or chemistry graduate",
      "Handling orientation"
    ],
    "deposit": "$120 refundable hold",
    "maxDuration": "10 days",
    "tags": [
      "balance",
      "scale",
      "laboratory",
      "chemistry",
      "analytical",
      "mettler"
    ],
    "featured": true,
    "popularityScore": 92,
    "createdAt": "2026-10-17"
  },
  {
    "id": "compound-optical-microscope",
    "title": "Olympus CX23 Binocular Compound Optical Laboratory Microscope",
    "tagline": "Educational and clinical microscope with plan achromat optics and LED illumination",
    "description": "Ergonomic research and biological microscope with brilliant uniform LED illumination and anti-fungus treated Plan Achromat objectives.",
    "longDescription": "Features 40x, 100x, 400x, and 1000x magnification with oil-immersion objective lens. Built with rackless stage for smooth sample positioning, interpupillary distance adjustment (48 to 75mm), and Abbe condenser with aperture iris diaphragm.",
    "category": "General Laboratory Equipment",
    "images": [
      "/images/resources/compound-optical-microscope.jpg",
      "/images/resources/cat_lab.jpg"
    ],
    "availability": "Available",
    "condition": "Like New",
    "location": "University Campus Hub",
    "owner": {
      "name": "Dr. Aris Thorne",
      "avatar": "/placeholder-user.jpg",
      "rating": 5,
      "reviewCount": 12,
      "verified": true,
      "memberSince": "March 2024",
      "responseRate": "< 1 hour",
      "location": "University Campus"
    },
    "specs": {
      "Optical System": "Infinity Optical System",
      "Objectives": "Plan Achromat 4x, 10x, 40x, 100x (Oil)",
      "Eyepieces": "10x Wide-Field (FN 20)",
      "Illumination": "0.5W High-Luminosity LED (20,000 hrs)",
      "Focusing": "Coaxial Coarse and Fine Mechanism (0.3mm/rotation)"
    },
    "borrowingTerms": "Supplied with immersion oil, lens tissues, and dust cover. Clean 100x oil objective with lens paper immediately after every session.",
    "eligibility": [
      "Verified biology/medical researcher or student",
      "Safety orientation"
    ],
    "deposit": "$80 refundable hold",
    "maxDuration": "7 days",
    "tags": [
      "microscope",
      "laboratory",
      "biology",
      "optics",
      "olympus"
    ],
    "featured": false,
    "popularityScore": 90,
    "createdAt": "2026-10-16"
  },
  {
    "id": "benchtop-refrigerated-centrifuge",
    "title": "Eppendorf 5424R High-Speed Refrigerated Benchtop Centrifuge",
    "tagline": "Refrigerated microcentrifuge with 24-place aerosol-tight rotor and FastTemp cooling",
    "description": "Compact refrigerated centrifuge delivering up to 21,130 x g for temperature-sensitive DNA, RNA, and protein isolation.",
    "longDescription": "Features FastTemp pre-cooling function from room temperature down to 4°C in 8 minutes, maintaining continuous 4°C cooling at maximum speed. Includes 24 x 1.5/2.0 mL aerosol-tight Eppendorf QuickLock rotor with aluminum lid.",
    "category": "General Laboratory Equipment",
    "images": [
      "/images/resources/benchtop-refrigerated-centrifuge.jpg",
      "/images/resources/microhematocrit-blood-centrifuge.jpg"
    ],
    "availability": "Available",
    "condition": "Excellent",
    "location": "University Campus Hub",
    "owner": {
      "name": "Dr. Aris Thorne",
      "avatar": "/placeholder-user.jpg",
      "rating": 5,
      "reviewCount": 12,
      "verified": true,
      "memberSince": "March 2024",
      "responseRate": "< 1 hour",
      "location": "University Campus"
    },
    "specs": {
      "Max Speed": "15,000 RPM (21,130 x g)",
      "Capacity": "24 x 1.5 / 2.0 mL Microcentrifuge Tubes",
      "Temperature Range": "-10°C to +40°C",
      "Acceleration Time": "15 Seconds to Max Speed",
      "Noise Level": "< 54 dBA"
    },
    "borrowingTerms": "Strict balance rule: always load tubes in symmetrical pairs with matched weights. Rotor must be wiped dry after refrigeration runs.",
    "eligibility": [
      "Biosafety training verification",
      "Verified ResourceX scientific researcher"
    ],
    "deposit": "$150 refundable hold",
    "maxDuration": "7 days",
    "tags": [
      "centrifuge",
      "eppendorf",
      "refrigerated",
      "biochemistry",
      "molecular-biology"
    ],
    "featured": true,
    "popularityScore": 95,
    "createdAt": "2026-10-15"
  },
  {
    "id": "uv-vis-spectrophotometer",
    "title": "Thermo Scientific GENESYS 180 UV-Vis Double-Beam Spectrophotometer",
    "tagline": "High-precision UV-Visible spectrophotometer with 8-cell automated carousel",
    "description": "Double-beam spectrophotometer with 190 to 1100 nm wavelength range for quantitative biochemical assays and optical density measurements.",
    "longDescription": "Equipped with dual silicon photodiode detectors, xenon flash lamp with 3-year guarantee, and high-resolution 7-inch color touchscreen with Wi-Fi network export. Includes automated 8-position multi-cell carousel and matched quartz cuvettes.",
    "category": "General Laboratory Equipment",
    "images": [
      "/images/resources/uv-vis-spectrophotometer.jpg",
      "/images/resources/cat_lab.jpg"
    ],
    "availability": "Available",
    "condition": "Like New",
    "location": "University Campus Hub",
    "owner": {
      "name": "Dr. Aris Thorne",
      "avatar": "/placeholder-user.jpg",
      "rating": 5,
      "reviewCount": 12,
      "verified": true,
      "memberSince": "March 2024",
      "responseRate": "< 1 hour",
      "location": "University Campus"
    },
    "specs": {
      "Wavelength Range": "190 nm to 1,100 nm",
      "Spectral Bandwidth": "2.0 nm",
      "Photometric Accuracy": "± 0.002 A at 0.5 A",
      "Light Source": "Xenon Flash Lamp (> 5 Years Typical Life)",
      "Cell Holder": "Automated 8-Position Carousel"
    },
    "borrowingTerms": "Quartz cuvettes must be rinsed with Milli-Q water and ethanol. Handle optical surfaces by frosted edges only.",
    "eligibility": [
      "Spectrophotometry protocol competence",
      "Academic/laboratory credential"
    ],
    "deposit": "$140 refundable hold",
    "maxDuration": "10 days",
    "tags": [
      "spectrophotometer",
      "uv-vis",
      "optics",
      "biochemistry",
      "lab"
    ],
    "featured": false,
    "popularityScore": 91,
    "createdAt": "2026-10-14"
  },
  {
    "id": "forced-air-laboratory-oven",
    "title": "Memmert Universal Forced-Air Laboratory Drying & Sterilization Oven",
    "tagline": "32-liter stainless steel convection oven with digital PID temperature controller up to 300°C",
    "description": "High-precision forced convection drying oven for glassware drying, thermal aging, sample dehydration, and dry heat sterilization.",
    "longDescription": "Features stainless steel interior chamber, forced air circulation fan adjustable in 10% steps, and dual Pt100 temperature sensors with digital fuzzy-PID controller. Heating range from ambient +10°C to +300°C with 0.1°C resolution.",
    "category": "General Laboratory Equipment",
    "images": [
      "/images/resources/forced-air-laboratory-oven.jpg",
      "/images/resources/co2-microbiological-incubator.jpg"
    ],
    "availability": "Available",
    "condition": "Excellent",
    "location": "University Campus Hub",
    "owner": {
      "name": "Dr. Aris Thorne",
      "avatar": "/placeholder-user.jpg",
      "rating": 5,
      "reviewCount": 12,
      "verified": true,
      "memberSince": "March 2024",
      "responseRate": "< 1 hour",
      "location": "University Campus"
    },
    "specs": {
      "Chamber Volume": "32 Liters (1.13 cu ft)",
      "Temperature Range": "+20°C to +300°C",
      "Temperature Uniformity": "± 0.5°C at 150°C",
      "Interior Material": "Electropolished 304 Stainless Steel",
      "Safety Class": "DIN 12880 Temperature Limiter Class 3.1"
    },
    "borrowingTerms": "No volatile organic solvents or explosive chemicals. Return with interior wiped down with distilled water.",
    "eligibility": [
      "Laboratory safety certification",
      "Verified ResourceX member"
    ],
    "deposit": "$75 refundable hold",
    "maxDuration": "14 days",
    "tags": [
      "oven",
      "drying-oven",
      "laboratory",
      "thermal",
      "sterilization",
      "memmert"
    ],
    "featured": false,
    "popularityScore": 85,
    "createdAt": "2026-10-13"
  },
  {
    "id": "benchtop-autoclave-sterilizer",
    "title": "Tuttnauer 2540M Manual Benchtop High-Pressure Autoclave Sterilizer",
    "tagline": "Medical-grade 23-liter steam pressure sterilizer with stainless steel chamber",
    "description": "Reliable steam autoclave for sterilizing laboratory glassware, surgical tools, agar media, and biohazardous waste decontamination.",
    "longDescription": "Features a 10\" x 19\" electro-polished 316L stainless steel chamber, dual safety thermostats, and analog pressure/temperature gauge. Sterilizes wrapped and unwrapped instruments at 134°C (273°F) and 2.1 bar steam pressure.",
    "category": "General Laboratory Equipment",
    "images": [
      "/images/resources/benchtop-autoclave-sterilizer.jpg",
      "/images/resources/cat_lab.jpg"
    ],
    "availability": "Available",
    "condition": "Good",
    "location": "University Campus Hub",
    "owner": {
      "name": "Dr. Aris Thorne",
      "avatar": "/placeholder-user.jpg",
      "rating": 5,
      "reviewCount": 12,
      "verified": true,
      "memberSince": "March 2024",
      "responseRate": "< 1 hour",
      "location": "University Campus"
    },
    "specs": {
      "Chamber Dimensions": "10\" Diameter x 19\" Depth (254 x 475 mm)",
      "Chamber Volume": "23 Liters (6 Gallons)",
      "Operating Pressure": "Up to 30 PSI (2.1 Bar)",
      "Sterilization Temperature": "121°C to 134°C (250°F to 273°F)",
      "Power Requirements": "120V / 230V, 1400 Watts"
    },
    "borrowingTerms": "Distilled water only in reservoir; never use tap water. Chemical indicator test strips included and must accompany cycles.",
    "eligibility": [
      "Autoclave operation orientation signed",
      "Biosafety handling compliance"
    ],
    "deposit": "$100 refundable hold",
    "maxDuration": "7 days",
    "tags": [
      "autoclave",
      "sterilizer",
      "steam",
      "laboratory",
      "medical",
      "tuttnauer"
    ],
    "featured": false,
    "popularityScore": 89,
    "createdAt": "2026-10-12"
  },
  {
    "id": "benchtop-ph-ion-meter",
    "title": "Mettler Toledo SevenDirect SD20 Digital Precision pH/Ion Meter",
    "tagline": "High-precision benchtop pH/mV meter with InLab Expert Pro-ISM electrode",
    "description": "Intuitive touchscreen pH meter with automated buffer recognition, temperature compensation, and GLP compliance.",
    "longDescription": "Delivers 0.001 pH resolution with 7-inch color display and uPlace sensor holder for effortless single-handed electrode positioning. Includes Mettler Toledo InLab Expert Pro-ISM rugged PEEK-body pH electrode, temperature sensor, and NIST calibration buffer sachets.",
    "category": "General Laboratory Equipment",
    "images": [
      "/images/resources/benchtop-ph-ion-meter.jpg",
      "/images/resources/cat_lab.jpg"
    ],
    "availability": "Available",
    "condition": "Like New",
    "location": "University Campus Hub",
    "owner": {
      "name": "Dr. Aris Thorne",
      "avatar": "/placeholder-user.jpg",
      "rating": 5,
      "reviewCount": 12,
      "verified": true,
      "memberSince": "March 2024",
      "responseRate": "< 1 hour",
      "location": "University Campus"
    },
    "specs": {
      "pH Range": "-2.000 to 20.000 pH",
      "Resolution": "0.001 / 0.01 / 0.1 pH",
      "Relative Accuracy": "± 0.002 pH",
      "mV Range": "-2000.0 to 2000.0 mV",
      "Electrode": "InLab Expert Pro-ISM (0 to 14 pH, 0 to 100°C)"
    },
    "borrowingTerms": "Glass electrode bulb must always remain submerged in 3M KCl storage electrolyte solution. Never let dry out.",
    "eligibility": [
      "Basic chemistry laboratory protocol",
      "Verified ResourceX member"
    ],
    "deposit": "$50 refundable hold",
    "maxDuration": "10 days",
    "tags": [
      "ph-meter",
      "electrochemistry",
      "laboratory",
      "buffers",
      "mettler"
    ],
    "featured": false,
    "popularityScore": 88,
    "createdAt": "2026-10-11"
  },
  {
    "id": "digital-magnetic-stirrer-hotplate",
    "title": "IKA C-MAG HS 7 Digital Ceramic Hotplate Magnetic Stirrer",
    "tagline": "Corrosion-resistant ceramic top hotplate stirrer with digital temperature display up to 500°C",
    "description": "Heavy-duty laboratory hotplate with powerful magnetic drive capable of stirring up to 10 liters of aqueous solution.",
    "longDescription": "Features a seamless 7\" x 7\" glass-ceramic top plate offering outstanding chemical resistance against aggressive acids and bases. Equipped with digital LCD speed/temperature readout, PT 1000 temperature probe connection, and 550°C fixed safety circuit.",
    "category": "General Laboratory Equipment",
    "images": [
      "/images/resources/digital-magnetic-stirrer-hotplate.jpg",
      "/images/resources/cat_lab.jpg"
    ],
    "availability": "Available",
    "condition": "Like New",
    "location": "University Campus Hub",
    "owner": {
      "name": "Dr. Aris Thorne",
      "avatar": "/placeholder-user.jpg",
      "rating": 5,
      "reviewCount": 12,
      "verified": true,
      "memberSince": "March 2024",
      "responseRate": "< 1 hour",
      "location": "University Campus"
    },
    "specs": {
      "Max Stirring Quantity": "10 Liters (H2O)",
      "Speed Range": "100 to 1,500 RPM",
      "Heating Temperature Range": "50°C to 500°C",
      "Top Plate Material": "Chemical-Resistant Glass Ceramic",
      "Hot Surface Warning": "Active when plate exceeds 50°C"
    },
    "borrowingTerms": "Includes 5-piece PTFE magnetic stir bar assortment and PT 1000 probe. Clean ceramic surface with damp cloth.",
    "eligibility": [
      "Verified laboratory student/researcher"
    ],
    "deposit": "$35 refundable hold",
    "maxDuration": "7 days",
    "tags": [
      "hotplate",
      "magnetic-stirrer",
      "ika",
      "chemistry",
      "lab-gear"
    ],
    "featured": false,
    "popularityScore": 84,
    "createdAt": "2026-10-10"
  },
  {
    "id": "automated-hematology-analyzer",
    "title": "Sysmex XP-300 Automated 3-Part Differential Hematology Analyzer",
    "tagline": "Compact clinical CBC blood analyzer processing 60 samples per hour with touch screen",
    "description": "Clinical laboratory hematology system delivering accurate Complete Blood Count (CBC) with 3-part WBC differential across 20 diagnostic parameters.",
    "longDescription": "Equipped with proven absolute cell counting technology using impedance and cyanide-free hemoglobin reagent. Features intuitive color touch display, bar-code sample scanner, and automated probe wash to eliminate biohazard carryover.",
    "category": "Medical Laboratory Equipment",
    "images": [
      "/images/resources/automated-hematology-analyzer.jpg",
      "/images/resources/cat_medical.jpg"
    ],
    "availability": "Available",
    "condition": "Like New",
    "location": "West End Creative District",
    "owner": {
      "name": "Julian Rivera",
      "avatar": "/placeholder-user.jpg",
      "rating": 5,
      "reviewCount": 41,
      "verified": true,
      "memberSince": "January 2024",
      "responseRate": "< 15 mins",
      "location": "West End"
    },
    "specs": {
      "Throughput": "Up to 60 Samples per Hour",
      "Parameters": "20 CBC Parameters including WBC, RBC, HGB, PLT",
      "Sample Volume": "50 µL Whole Blood (20 µL Pre-Dilute)",
      "Display": "Color Touchscreen LCD",
      "Data Storage": "40,000 Sample Records with Histograms"
    },
    "borrowingTerms": "Clinical biohazard handling agreement required. Daily shutdown cleaning cycle must be logged.",
    "eligibility": [
      "Clinical laboratory scientist (CLS) or certified medical technologist",
      "Institutional credential verification"
    ],
    "deposit": "$400 refundable hold",
    "maxDuration": "14 days",
    "tags": [
      "hematology",
      "cbc",
      "blood-analyzer",
      "sysmex",
      "medical",
      "clinical"
    ],
    "featured": true,
    "popularityScore": 98,
    "createdAt": "2026-10-24"
  },
  {
    "id": "clinical-biochemistry-analyzer",
    "title": "Mindray BS-240 Clinical Benchtop Chemistry & Biochemistry Analyzer",
    "tagline": "Automated random-access clinical chemistry analyzer with 200 tests/hour throughput",
    "description": "Automated clinical chemistry analyzer for serum, plasma, and urine tests including liver panels, metabolic profiles, and lipid tests.",
    "longDescription": "Features 200 photometric tests per hour throughput, refrigerated reagent compartment holding 50 to 100 positions, barcode reagent management, and 8-step automated cuvette wash station. Low reaction volume design (100 µL minimum).",
    "category": "Medical Laboratory Equipment",
    "images": [
      "/images/resources/clinical-biochemistry-analyzer.jpg",
      "/images/resources/cat_medical.jpg"
    ],
    "availability": "Available",
    "condition": "Like New",
    "location": "West End Creative District",
    "owner": {
      "name": "Julian Rivera",
      "avatar": "/placeholder-user.jpg",
      "rating": 5,
      "reviewCount": 41,
      "verified": true,
      "memberSince": "January 2024",
      "responseRate": "< 15 mins",
      "location": "West End"
    },
    "specs": {
      "Throughput": "200 Photometric Tests per Hour",
      "Reaction Volume": "100 to 360 µL",
      "Reagent/Sample Carousel": "Up to 80 Sample & 80 Reagent Positions",
      "Light Source": "Halogen-Tungsten Lamp with Holographic Grating",
      "Wash Station": "8-Step Auto Wash System with Heated Water"
    },
    "borrowingTerms": "Requires deionized water connection (< 1.0 µS/cm). Reagent packs must be sourced from certified clinical suppliers.",
    "eligibility": [
      "Certified clinical chemistry specialist",
      "Verified institutional membership"
    ],
    "deposit": "$350 refundable hold",
    "maxDuration": "14 days",
    "tags": [
      "biochemistry",
      "clinical-chemistry",
      "analyzer",
      "diagnostics",
      "medical"
    ],
    "featured": false,
    "popularityScore": 94,
    "createdAt": "2026-10-23"
  },
  {
    "id": "microhematocrit-blood-centrifuge",
    "title": "Drucker Diagnostics Horizon 642E Clinical Blood Centrifuge",
    "tagline": "Single-speed clinical horizontal rotor centrifuge for blood separation and serum tubes",
    "description": "Compact fixed-angle clinical blood centrifuge for serum gel tubes, EDTA tubes, and rapid STAT diagnostic sample processing.",
    "longDescription": "Engineered specifically for clinical laboratories, medical clinics, and phlebotomy stations. Spin speed of 3,800 RPM (2,000 x g) produces high-quality platelet-poor plasma and clear serum separations in under 10 minutes. Safety lid interlock prevents opening during rotor spin.",
    "category": "Medical Laboratory Equipment",
    "images": [
      "/images/resources/microhematocrit-blood-centrifuge.jpg",
      "/images/resources/benchtop-refrigerated-centrifuge.jpg"
    ],
    "availability": "Available",
    "condition": "Excellent",
    "location": "Downtown Central Hub",
    "owner": {
      "name": "Marcus Vance",
      "avatar": "/placeholder-user.jpg",
      "rating": 4.95,
      "reviewCount": 34,
      "verified": true,
      "memberSince": "April 2024",
      "responseRate": "< 30 mins",
      "location": "Downtown Central"
    },
    "specs": {
      "Speed": "3,800 RPM (± 100 RPM)",
      "Force": "2,000 x g RCF",
      "Capacity": "6 x 75mm to 100mm Tubes (up to 10 mL)",
      "Timer": "Mechanical 1 to 30 Minutes",
      "Dimensions": "8.5\" x 11\" x 12.5\" (22 x 28 x 32 cm)"
    },
    "borrowingTerms": "Clean rotor cavity with 10% bleach followed by 70% isopropanol before return. Tube adapters included.",
    "eligibility": [
      "Clinical personnel or phlebotomist",
      "Verified ResourceX member"
    ],
    "deposit": "$60 refundable hold",
    "maxDuration": "7 days",
    "tags": [
      "blood-centrifuge",
      "phlebotomy",
      "serum",
      "clinical",
      "medical"
    ],
    "featured": false,
    "popularityScore": 87,
    "createdAt": "2026-10-22"
  },
  {
    "id": "medical-cold-storage-refrigerator",
    "title": "Thermo Scientific TSX Series -86°C Ultra-Low Medical Deep Freezer",
    "tagline": "Energy-efficient -86°C clinical freezer with V-drive technology for vaccine and tissue storage",
    "description": "Ultra-low temperature (ULT) medical storage freezer protecting sensitive biological samples, RNA vaccines, enzyme stocks, and clinical biopsy specimens.",
    "longDescription": "Features adaptive V-drive variable-speed compressor technology for tight temperature uniformity (± 5.0°C) with low energy consumption. Equipped with dual gasketed insulated inner doors, vacuum relief port, battery backup alarm system, and dry contact monitoring output.",
    "category": "Medical Laboratory Equipment",
    "images": [
      "/images/resources/medical-cold-storage-refrigerator.jpg",
      "/images/resources/cat_medical.jpg"
    ],
    "availability": "In Use",
    "condition": "Like New",
    "location": "University Campus Hub",
    "owner": {
      "name": "Dr. Aris Thorne",
      "avatar": "/placeholder-user.jpg",
      "rating": 5,
      "reviewCount": 12,
      "verified": true,
      "memberSince": "March 2024",
      "responseRate": "< 1 hour",
      "location": "University Campus"
    },
    "specs": {
      "Capacity": "400 Liters (14.9 cu ft / 300 x 2-inch boxes)",
      "Temperature Range": "-50°C to -86°C",
      "Uniformity": "± 5.2°C at -80°C Setpoint",
      "Door": "Solid Outer Door with 4 Insulated Inner Doors",
      "Backup Alarm": "Audible & Visual Battery-Powered Alarms"
    },
    "borrowingTerms": "Host facility must provide dedicated 115V/20A circuit and ambient air conditioning. LN2 backup injection port available.",
    "eligibility": [
      "Accredited research lab or medical institution",
      "Commercial transport coordination"
    ],
    "deposit": "$500 refundable hold",
    "maxDuration": "30 days",
    "tags": [
      "freezer",
      "ult-freezer",
      "cold-storage",
      "medical",
      "vaccine",
      "biotech"
    ],
    "featured": true,
    "popularityScore": 96,
    "createdAt": "2026-10-21"
  },
  {
    "id": "clinical-fluorescence-microscope",
    "title": "Leica DM2000 LED Clinical Pathology & Fluorescence Microscope",
    "tagline": "Ergonomic clinical pathology microscope with 5-position fluorescence filter turret",
    "description": "Advanced clinical and histopathology microscope configured for brightfield, phase contrast, and epi-fluorescence diagnostic microscopy.",
    "longDescription": "Engineered with color-neutral LED illumination for both brightfield and fluorescence excitation. Features 5-position fluorescence filter cube turret with DAPI, FITC, and TRITC filter sets, Plan Fluorotar 10x, 20x, 40x, and 100x oil objectives, and trinocular C-mount camera head.",
    "category": "Medical Laboratory Equipment",
    "images": [
      "/images/resources/clinical-fluorescence-microscope.jpg",
      "/images/resources/compound-optical-microscope.jpg"
    ],
    "availability": "Available",
    "condition": "Like New",
    "location": "University Campus Hub",
    "owner": {
      "name": "Dr. Aris Thorne",
      "avatar": "/placeholder-user.jpg",
      "rating": 5,
      "reviewCount": 12,
      "verified": true,
      "memberSince": "March 2024",
      "responseRate": "< 1 hour",
      "location": "University Campus"
    },
    "specs": {
      "Optical System": "Leica Infinity HC Optical System",
      "Filter Turret": "5-Position Manual Turret with DAPI / FITC / TRITC Cubes",
      "Objectives": "Plan Fluorotar 10x/0.30, 20x/0.50, 40x/0.75, 100x/1.30 Oil",
      "Camera Port": "Trinocular Head with 0.7x C-Mount Adapter",
      "Light Source": "High-Power LED Fluorescence & Transmitted Light"
    },
    "borrowingTerms": "Supplied in custom flight case with optical cleaning supplies. Never touch fluorescence filter surfaces.",
    "eligibility": [
      "Pathology resident, cytotechnologist, or medical researcher",
      "Handling test required"
    ],
    "deposit": "$250 refundable hold",
    "maxDuration": "7 days",
    "tags": [
      "microscope",
      "fluorescence",
      "pathology",
      "leica",
      "clinical",
      "histology"
    ],
    "featured": true,
    "popularityScore": 97,
    "createdAt": "2026-10-20"
  },
  {
    "id": "realtime-pcr-thermal-cycler",
    "title": "Bio-Rad CFX96 Touch Real-Time Quantitative PCR Diagnostic System",
    "tagline": "96-well 6-channel quantitative real-time PCR detection system with touchscreen",
    "description": "Gold standard qPCR diagnostic thermal cycler for pathogen detection, gene expression analysis, viral load quantification, and genotyping.",
    "longDescription": "Features a 96-well fast thermal reaction block with honeycomb Peltier elements for rapid heating and cooling (up to 5°C/sec). Optical detection system uses 6 filtered LEDs and 6 filtered photodiodes for multiplex detection of up to 5 target fluorophores plus FRET.",
    "category": "Medical Laboratory Equipment",
    "images": [
      "/images/resources/realtime-pcr-thermal-cycler.jpg",
      "/images/resources/cat_medical.jpg"
    ],
    "availability": "Available",
    "condition": "Like New",
    "location": "University Campus Hub",
    "owner": {
      "name": "Dr. Aris Thorne",
      "avatar": "/placeholder-user.jpg",
      "rating": 5,
      "reviewCount": 12,
      "verified": true,
      "memberSince": "March 2024",
      "responseRate": "< 1 hour",
      "location": "University Campus"
    },
    "specs": {
      "Sample Capacity": "96 x 0.2 mL Tubes or 1 x 96-Well Microplate",
      "Ramp Rate": "Up to 5°C / Second",
      "Excitation": "6 Filtered LEDs (450 – 684 nm)",
      "Detection": "6 Filtered Photodiodes (515 – 730 nm)",
      "Multiplex Capability": "Up to 5 Targets per Well"
    },
    "borrowingTerms": "Optical calibration plate verified prior to handover. Return with CFX Manager software backup on flash drive.",
    "eligibility": [
      "Molecular biology / clinical PCR certified",
      "Verified research affiliate"
    ],
    "deposit": "$300 refundable hold",
    "maxDuration": "10 days",
    "tags": [
      "qpcr",
      "real-time-pcr",
      "bio-rad",
      "molecular-diagnostics",
      "genetics"
    ],
    "featured": true,
    "popularityScore": 99,
    "createdAt": "2026-10-19"
  },
  {
    "id": "co2-microbiological-incubator",
    "title": "Thermo Scientific Forma Steri-Cycle CO2 Laboratory Incubator",
    "tagline": "Direct-heat 184L CO2 incubator with 140°C on-demand sterilization cycle",
    "description": "Precision medical cell culture incubator maintaining 37°C, 5% CO2, and humidified atmosphere for mammalian cells and bacterial cultures.",
    "longDescription": "Equipped with TC (thermal conductivity) sensor, active airflow circulation, and in-chamber HEPA air filtration producing Class 100 cleanroom air quality within 5 minutes. High-temperature 140°C overnight dry heat decontamination cycle eliminates all spore-forming contaminants.",
    "category": "Medical Laboratory Equipment",
    "images": [
      "/images/resources/co2-microbiological-incubator.jpg",
      "/images/resources/forced-air-laboratory-oven.jpg"
    ],
    "availability": "Available",
    "condition": "Excellent",
    "location": "University Campus Hub",
    "owner": {
      "name": "Dr. Aris Thorne",
      "avatar": "/placeholder-user.jpg",
      "rating": 5,
      "reviewCount": 12,
      "verified": true,
      "memberSince": "March 2024",
      "responseRate": "< 1 hour",
      "location": "University Campus"
    },
    "specs": {
      "Chamber Capacity": "184 Liters (6.5 cu ft)",
      "Temperature Range": "Ambient +5°C to 50°C (± 0.1°C)",
      "CO2 Range": "0 to 20% (± 0.1%)",
      "Humidity": "Greater than 90% at 37°C with Water Pan",
      "Decontamination": "140°C High-Heat Sterilization Cycle (14 hrs)"
    },
    "borrowingTerms": "CO2 gas cylinder with two-stage regulator required at host site. Sterile autoclaved water pan included.",
    "eligibility": [
      "Cell culture lab personnel",
      "Biosafety Level 2 compliance"
    ],
    "deposit": "$250 refundable hold",
    "maxDuration": "21 days",
    "tags": [
      "incubator",
      "co2-incubator",
      "cell-culture",
      "thermo",
      "medical",
      "biology"
    ],
    "featured": false,
    "popularityScore": 92,
    "createdAt": "2026-10-18"
  },
  {
    "id": "automated-liquid-handling-robot",
    "title": "Opentrons OT-2 Precision Automated Liquid Handling Pipetting Robot",
    "tagline": "Open-source programmable pipetting robot with multi-channel GEN2 electronic pipettes",
    "description": "Benchtop liquid handler automating PCR setup, NGS library prep, ELISA protocols, and serial dilutions with high accuracy.",
    "longDescription": "Features an 11-deck workspace supporting standard ANSI/SBS microplates, tube racks, and reservoir troughs. Configured with 8-Channel P20 and Single-Channel P300 GEN2 electronic pipettes, magnetic module for bead cleanups, and Python API / visual protocol designer.",
    "category": "Medical Laboratory Equipment",
    "images": [
      "/images/resources/automated-liquid-handling-robot.jpg",
      "/images/resources/cat_medical.jpg"
    ],
    "availability": "Available",
    "condition": "Like New",
    "location": "University Campus Hub",
    "owner": {
      "name": "Dr. Aris Thorne",
      "avatar": "/placeholder-user.jpg",
      "rating": 5,
      "reviewCount": 12,
      "verified": true,
      "memberSince": "March 2024",
      "responseRate": "< 1 hour",
      "location": "University Campus"
    },
    "specs": {
      "Deck Slots": "11 Standard ANSI/SBS Deck Slots + Removable Trash",
      "Pipetting Channels": "Single Channel (1–1000 µL) & 8-Channel (1–300 µL)",
      "Positional Accuracy": "± 0.1 mm X/Y/Z Precision",
      "Interface": "Ethernet / Wi-Fi with Python API & Touchscreen App",
      "Modules Included": "Opentrons Magnetic Module GEN2"
    },
    "borrowingTerms": "Return with deck wiped clean of bio-reagents. Opentrons tip racks and calibration block included.",
    "eligibility": [
      "Demonstrated Python or protocol lab automation experience",
      "Verified ResourceX member"
    ],
    "deposit": "$200 refundable hold",
    "maxDuration": "14 days",
    "tags": [
      "liquid-handling",
      "pipetting-robot",
      "opentrons",
      "automation",
      "lab",
      "ngs"
    ],
    "featured": true,
    "popularityScore": 95,
    "createdAt": "2026-10-17"
  },
  {
    "id": "portable-concrete-drum-mixer",
    "title": "Kushlan Products 6 cu. ft. Portable Electric Drum Concrete Mixer",
    "tagline": "Wheelbarrow-style direct-drive electric cement mixer for onsite foundation & masonry",
    "description": "Heavy-duty electric concrete drum mixer with poly drum and flat-free tires for mixing concrete, mortar, stucco, and grout.",
    "longDescription": "Features an unbreakable polyethylene drum that cleans in seconds with a mallet tap, direct-drive 3/4-HP capacitor start motor, and 28-RPM rotation speed. Can mix up to two 80-lb bags of concrete per batch with 360-degree dumping swivel.",
    "category": "Construction & Workshop Equipment",
    "images": [
      "/images/resources/portable-concrete-drum-mixer.jpg",
      "/images/resources/cat_construction.jpg"
    ],
    "availability": "Available",
    "condition": "Good",
    "location": "South Industrial District",
    "owner": {
      "name": "Hank Kowalski",
      "avatar": "/placeholder-user.jpg",
      "rating": 4.81,
      "reviewCount": 16,
      "verified": true,
      "memberSince": "May 2024",
      "responseRate": "< 2 hours",
      "location": "South Industrial"
    },
    "specs": {
      "Drum Capacity": "6.0 Cubic Feet (170 Liters)",
      "Batch Output": "300 lbs Concrete (2 x 80-lb bags)",
      "Motor": "3/4 HP, 120V Heavy Duty Electric Motor",
      "Drum Material": "High-Density Polyethylene (Dent-proof)",
      "Tires": "Solid Flat-Free Heavy-Duty Rubber Tires"
    },
    "borrowingTerms": "Drum must be washed completely clean with water hose immediately after each use. No hardened concrete left in drum.",
    "eligibility": [
      "ResourceX member with vehicle suitable for transport",
      "Safety waiver signed"
    ],
    "deposit": "$60 refundable hold",
    "maxDuration": "4 days",
    "tags": [
      "concrete",
      "mixer",
      "masonry",
      "construction",
      "cement",
      "workshop"
    ],
    "featured": false,
    "popularityScore": 88,
    "createdAt": "2026-10-16"
  },
  {
    "id": "magnetic-base-drill-press",
    "title": "Hougen HMD904 Heavy-Duty Magnetic Base Drill / Core Press",
    "tagline": "Portable industrial electromagnetic drill press for annular hole cutting in steel beams",
    "description": "High-power magnetic drill press with 1-1/2-inch hole capacity through 2-inch structural steel plate.",
    "longDescription": "Equipped with an ultra-strong two-stage dual coil electromagnetic base holding up to 2,165 lbs of holding force. Features a 450 RPM heavy-torque motor, gravity feed coolant bottle system, pilot light, and slot for Hougen '12,000-Series' annular cutters.",
    "category": "Construction & Workshop Equipment",
    "images": [
      "/images/resources/magnetic-base-drill-press.jpg",
      "/images/resources/dewalt-miter-saw.jpg"
    ],
    "availability": "Available",
    "condition": "Like New",
    "location": "South Industrial District",
    "owner": {
      "name": "Hank Kowalski",
      "avatar": "/placeholder-user.jpg",
      "rating": 4.81,
      "reviewCount": 16,
      "verified": true,
      "memberSince": "May 2024",
      "responseRate": "< 2 hours",
      "location": "South Industrial"
    },
    "specs": {
      "Hole Capacity": "7/16\" to 1-1/2\" Diameter (12 to 38 mm)",
      "Depth of Cut": "Up to 2 Inches (50 mm)",
      "Motor": "115V, 9 Amp, 450 RPM",
      "Magnetic Dead Lift": "2,165 lbs on 1\" steel plate",
      "Weight": "12.5 kg / 27.5 lbs"
    },
    "borrowingTerms": "Safety strap must always be secured around steel beam before powering on magnet. Annular cutter set and coolant bottle included.",
    "eligibility": [
      "Steel fabricator or structural trade experience",
      "Verified ResourceX member"
    ],
    "deposit": "$80 refundable hold",
    "maxDuration": "4 days",
    "tags": [
      "mag-drill",
      "hougen",
      "magnetic-drill",
      "steel",
      "drilling",
      "construction"
    ],
    "featured": false,
    "popularityScore": 91,
    "createdAt": "2026-10-15"
  },
  {
    "id": "fabrication-welding-toolkit",
    "title": "Lincoln Electric Electrician & Fabricator Pro TIG/MIG Toolkit",
    "tagline": "Complete mobile welding and metal fabrication kit with auto-darkening helmet and clamps",
    "description": "Comprehensive professional welding fabrication toolkit with high-end safety PPE, magnetic squares, chipping hammers, and measuring tools.",
    "longDescription": "Includes Lincoln Viking 3350 4C auto-darkening welding helmet, heavy split cowhide welding jacket, premium goatskin TIG gloves, StrongHand Tools 4-piece magnetic squaring clamp set, chipping hammer, stainless wire brushes, and angle measurement gauge in a rugged Pelican lockable case.",
    "category": "Construction & Workshop Equipment",
    "images": [
      "/images/resources/fabrication-welding-toolkit.jpg",
      "/images/resources/industrial-multiprocess-welder.jpg"
    ],
    "availability": "Available",
    "condition": "Like New",
    "location": "South Industrial District",
    "owner": {
      "name": "Hank Kowalski",
      "avatar": "/placeholder-user.jpg",
      "rating": 4.81,
      "reviewCount": 16,
      "verified": true,
      "memberSince": "May 2024",
      "responseRate": "< 2 hours",
      "location": "South Industrial"
    },
    "specs": {
      "Helmet": "Lincoln Viking 3350 (4C Lens, 1/1/1/1 Optical Clarity)",
      "Shade Range": "DIN 5 to 13 Variable",
      "Magnetic Clamps": "4x StrongHand 90-degree 40 lb clamps",
      "Jacket Size": "Large Split Cowhide Fire-Resistant",
      "Storage": "Weatherproof Pelican Storm 1550 Case"
    },
    "borrowingTerms": "Replace outer helmet lens cover if spattered. Clean and fold jacket before return.",
    "eligibility": [
      "Verified ResourceX member"
    ],
    "deposit": "$40 refundable hold",
    "maxDuration": "5 days",
    "tags": [
      "welding-kit",
      "lincoln",
      "helmet",
      "fabrication",
      "safety",
      "tools"
    ],
    "featured": false,
    "popularityScore": 89,
    "createdAt": "2026-10-14"
  },
  {
    "id": "horizontal-metal-band-saw",
    "title": "Baileigh BS-210M Heavy-Duty Metal Cutting Horizontal Band Saw",
    "tagline": "Manual horizontal metal cutting bandsaw with hydraulic descent and flood coolant",
    "description": "Precision metal cutoff saw for structural tubing, round bar, channel, and solid steel stock with miter cuts up to 60 degrees.",
    "longDescription": "Features swivel head design allowing angle cuts up to 60° without moving stock, hydraulic controlled descent feed rate, automatic shut-off switch after cut completion, and recirculating flood coolant pump. Cuts up to 7-inch round tube at 90 degrees.",
    "category": "Construction & Workshop Equipment",
    "images": [
      "/images/resources/horizontal-metal-band-saw.jpg",
      "/images/resources/dewalt-miter-saw.jpg"
    ],
    "availability": "Available",
    "condition": "Excellent",
    "location": "South Industrial District",
    "owner": {
      "name": "Hank Kowalski",
      "avatar": "/placeholder-user.jpg",
      "rating": 4.81,
      "reviewCount": 16,
      "verified": true,
      "memberSince": "May 2024",
      "responseRate": "< 2 hours",
      "location": "South Industrial"
    },
    "specs": {
      "Round Cut Capacity (90°)": "7.0 Inches (178 mm)",
      "Rectangular Capacity (90°)": "8.25\" x 6.75\" (210 x 170 mm)",
      "Miter Angle": "0° to 60° Swivel Head",
      "Blade Size": "0.75\" x 0.035\" x 82.5\"",
      "Motor": "1.5 HP, 110V Single Phase"
    },
    "borrowingTerms": "Supplied with bi-metal 10/14 TPI blade. Clean chips from vise bed and return coolant pump filter free of sludge.",
    "eligibility": [
      "Metal fabrication experience",
      "Pickup with pickup truck or trailer required"
    ],
    "deposit": "$100 refundable hold",
    "maxDuration": "5 days",
    "tags": [
      "bandsaw",
      "metal-cutting",
      "baileigh",
      "saw",
      "fabrication",
      "workshop"
    ],
    "featured": false,
    "popularityScore": 92,
    "createdAt": "2026-10-13"
  },
  {
    "id": "jobsite-power-generator",
    "title": "Honda EU7000iS Heavy-Duty Inverter Quiet Jobsite Power Generator",
    "tagline": "7000W super-quiet EFI inverter generator with electric start and 120/240V selector",
    "description": "Ultra-quiet clean power generator for mobile construction trailers, outdoor sound stages, optical labs, and jobsite tool charging.",
    "longDescription": "Powered by a fuel-injected Honda GX390 EFI engine delivering 7,000 peak watts and 5,500 continuous watts of clean, computer-safe pure sine wave power. Incredibly quiet at 52 to 58 dBA, with push-button electric start, wheel kit, and folding transport handles.",
    "category": "Construction & Workshop Equipment",
    "images": [
      "/images/resources/jobsite-power-generator.jpg",
      "/images/resources/diesel-industrial-generator.jpg"
    ],
    "availability": "Available",
    "condition": "Like New",
    "location": "Downtown Central Hub",
    "owner": {
      "name": "Marcus Vance",
      "avatar": "/placeholder-user.jpg",
      "rating": 4.95,
      "reviewCount": 34,
      "verified": true,
      "memberSince": "April 2024",
      "responseRate": "< 30 mins",
      "location": "Downtown Central"
    },
    "specs": {
      "Max AC Output": "7,000 Watts (120/240V)",
      "Rated AC Output": "5,500 Watts Continuous",
      "Engine": "Honda GX390 EFI 389cc Electronic Fuel Injection",
      "Noise Level": "52 to 58 dBA at 7 meters",
      "Run Time": "6.5 to 18 Hours (5.1 Gal Tank)"
    },
    "borrowingTerms": "Never operate indoors or near windows. Return with full tank of fresh 87+ octane unleaded gasoline.",
    "eligibility": [
      "Verified ResourceX member",
      "Valid ID on file"
    ],
    "deposit": "$120 refundable hold",
    "maxDuration": "5 days",
    "tags": [
      "generator",
      "honda",
      "inverter",
      "clean-power",
      "quiet",
      "jobsite"
    ],
    "featured": true,
    "popularityScore": 96,
    "createdAt": "2026-10-12"
  },
  {
    "id": "porta-power-hydraulic-ram-kit",
    "title": "Enerpac 10-Ton Portable Hydraulic Cylinder & Hand Pump Kit",
    "tagline": "Industrial 10-ton hydraulic ram with two-speed hand pump and spreaders in steel case",
    "description": "Portable 10-ton hydraulic maintenance kit for lifting heavy machinery, spreading castings, pressing pins, and structural leveling.",
    "longDescription": "Features Enerpac RC-106 10-ton general purpose single-acting hydraulic cylinder with 6-inch stroke, P-392 lightweight two-speed hand pump, 6-foot high-pressure safety hose with quick coupler, and 14 assorted extension tubes, rubber heads, and spreader attachments in heavy steel chest.",
    "category": "Construction & Workshop Equipment",
    "images": [
      "/images/resources/porta-power-hydraulic-ram-kit.jpg",
      "/images/resources/heavy-duty-hydraulic-press.jpg"
    ],
    "availability": "Available",
    "condition": "Excellent",
    "location": "South Industrial District",
    "owner": {
      "name": "Hank Kowalski",
      "avatar": "/placeholder-user.jpg",
      "rating": 4.81,
      "reviewCount": 16,
      "verified": true,
      "memberSince": "May 2024",
      "responseRate": "< 2 hours",
      "location": "South Industrial"
    },
    "specs": {
      "Cylinder Capacity": "10 Tons (101 kN)",
      "Cylinder Stroke": "6.0 Inches (152 mm)",
      "Operating Pressure": "10,000 PSI (700 Bar)",
      "Pump Type": "Two-Speed Hydraulic Hand Pump (P-392)",
      "Attachments": "14-Piece heavy-duty extension and spreader set"
    },
    "borrowingTerms": "Inspect quick-couplers for dirt before mating. Release pressure completely before disconnecting hoses.",
    "eligibility": [
      "Industrial/mechanical trade experience",
      "Safety waiver signed"
    ],
    "deposit": "$70 refundable hold",
    "maxDuration": "5 days",
    "tags": [
      "hydraulic",
      "enerpac",
      "porta-power",
      "ram",
      "jack",
      "industrial"
    ],
    "featured": false,
    "popularityScore": 90,
    "createdAt": "2026-10-11"
  },
  {
    "id": "ros2-mobile-research-robot",
    "title": "TurtleBot 4 ROS 2 Mobile Research & Autonomous Navigation Robot",
    "tagline": "Standard research robot platform built on iRobot Create 3 with OAK-D camera and 2D LiDAR",
    "description": "Educational robotics research robot powered by Raspberry Pi 4 running ROS 2 Galactic/Humble for SLAM navigation and AI perception.",
    "longDescription": "The official ROS 2 education and research reference platform. Features an iRobot Create 3 mobile base with cliff/bump/wheel-drop sensors, RPLIDAR A1 2D laser scanner, Luxonis OAK-D-PRO spatial AI stereo depth camera, and OLED status display. Ready for autonomous exploration, navigation, and computer vision research.",
    "category": "Educational & Research Equipment",
    "images": [
      "/images/resources/ros2-mobile-research-robot.jpg",
      "/images/resources/mit-robotics-sensor-lab.jpg"
    ],
    "availability": "Available",
    "condition": "Like New",
    "location": "University Campus Hub",
    "owner": {
      "name": "Dr. Aris Thorne",
      "avatar": "/placeholder-user.jpg",
      "rating": 5,
      "reviewCount": 12,
      "verified": true,
      "memberSince": "March 2024",
      "responseRate": "< 1 hour",
      "location": "University Campus"
    },
    "specs": {
      "Base": "iRobot Create 3 Educational Mobile Platform",
      "Compute": "Raspberry Pi 4B (4GB RAM) with Ubuntu 22.04 LTS & ROS 2",
      "Vision": "Luxonis OAK-D-PRO 4K Spatial AI Stereo Camera",
      "LiDAR": "RPLIDAR A1M8 (12m range, 360° omnidirectional)",
      "Battery": "26Wh Li-Ion (up to 2.5 hours active research runtime)"
    },
    "borrowingTerms": "Return dock and charging station included. Do not operate outdoors or in wet environments.",
    "eligibility": [
      "Computer Science / Engineering student or researcher",
      "Basic Linux and ROS 2 knowledge"
    ],
    "deposit": "$150 refundable hold",
    "maxDuration": "14 days",
    "tags": [
      "robotics",
      "ros2",
      "turtlebot",
      "slam",
      "ai",
      "navigation",
      "stem"
    ],
    "featured": true,
    "popularityScore": 98,
    "createdAt": "2026-10-25"
  },
  {
    "id": "programmable-dc-bench-supply",
    "title": "Rigol DP832 Triple-Output Programmable Precision DC Power Supply",
    "tagline": "3-channel 195W lab bench power supply with low ripple and high-resolution digital controls",
    "description": "Versatile triple-channel programmable bench power supply for hardware engineering, circuit prototyping, and electronics testing.",
    "longDescription": "Features three isolated channels: two 30V/3A channels and one 5V/3A channel delivering up to 195W total output. Low ripple (< 350 µVrms), real-time V/A/W waveform display, OVP/OCP/OTP protection, and USB/LAN interfaces with SCPI command automation.",
    "category": "Educational & Research Equipment",
    "images": [
      "/images/resources/programmable-dc-bench-supply.jpg",
      "/images/resources/digital-storage-oscilloscope.jpg"
    ],
    "availability": "Available",
    "condition": "Like New",
    "location": "Downtown Central Hub",
    "owner": {
      "name": "Marcus Vance",
      "avatar": "/placeholder-user.jpg",
      "rating": 4.95,
      "reviewCount": 34,
      "verified": true,
      "memberSince": "April 2024",
      "responseRate": "< 30 mins",
      "location": "Downtown Central"
    },
    "specs": {
      "Total Power": "195 Watts",
      "Channels": "Ch1: 30V/3A, Ch2: 30V/3A, Ch3: 5V/3A",
      "Ripple & Noise": "< 350 µVrms / 2 mVpp",
      "Programming Resolution": "1 mV / 1 mA",
      "Display": "3.5-Inch Color TFT with Graphical V/A/W Curves"
    },
    "borrowingTerms": "Includes silicone banana-to-alligator test leads. Do not short-circuit channels under high current setpoints.",
    "eligibility": [
      "Electronics workbench competency",
      "Verified ResourceX member"
    ],
    "deposit": "$50 refundable hold",
    "maxDuration": "7 days",
    "tags": [
      "power-supply",
      "rigol",
      "electronics",
      "bench-supply",
      "test-gear"
    ],
    "featured": false,
    "popularityScore": 89,
    "createdAt": "2026-10-24"
  },
  {
    "id": "digital-storage-oscilloscope",
    "title": "Siglent SDS1202X-E 2-Channel 200MHz Digital Storage Oscilloscope",
    "tagline": "200MHz digital scope with 1 GSa/s sampling, 14 Mpts memory, and hardware decoding",
    "description": "High-performance benchtop digital oscilloscope with Super Phosphor technology and hardware decoding for I2C, SPI, UART, and CAN buses.",
    "longDescription": "Provides 200 MHz bandwidth, 1 GSa/s real-time sampling rate, and 14 Mpts deep record memory. Features an ultra-responsive 100,000 wfm/s waveform capture rate, 256-level color temperature gradient display, Bode plot analysis, and 1 Mpt hardware FFT for frequency domain analysis.",
    "category": "Educational & Research Equipment",
    "images": [
      "/images/resources/digital-storage-oscilloscope.jpg",
      "/images/resources/programmable-dc-bench-supply.jpg"
    ],
    "availability": "Available",
    "condition": "Like New",
    "location": "Downtown Central Hub",
    "owner": {
      "name": "Marcus Vance",
      "avatar": "/placeholder-user.jpg",
      "rating": 4.95,
      "reviewCount": 34,
      "verified": true,
      "memberSince": "April 2024",
      "responseRate": "< 30 mins",
      "location": "Downtown Central"
    },
    "specs": {
      "Bandwidth": "200 MHz (2 Channels)",
      "Real-Time Sampling": "1 GSa/s",
      "Memory Depth": "14 Mpts per Channel",
      "Waveform Capture Rate": "100,000 wfm/s (Sequence Mode 400,000 wfm/s)",
      "Serial Bus Decoding": "I2C, SPI, UART, RS232, CAN, LIN standard"
    },
    "borrowingTerms": "Includes two 200MHz 10X/1X switchable passive probes with ground springs. Calibration output verified.",
    "eligibility": [
      "Electrical engineering student or circuit designer",
      "Verified ResourceX member"
    ],
    "deposit": "$65 refundable hold",
    "maxDuration": "7 days",
    "tags": [
      "oscilloscope",
      "siglent",
      "200mhz",
      "electronics",
      "debugging",
      "test-instruments"
    ],
    "featured": true,
    "popularityScore": 94,
    "createdAt": "2026-10-23"
  },
  {
    "id": "embedded-iot-microcontroller-lab",
    "title": "SparkFun Advanced ESP32 & ARM Embedded IoT Research Development Kit",
    "tagline": "Comprehensive IoT sensor and microcontroller bench kit with wireless telemetry",
    "description": "Extensive microcontroller development laboratory kit containing ESP32-S3, STM32 Nucleo, Raspberry Pi Pico W, and 30+ Qwiic precision I2C sensors.",
    "longDescription": "A turnkey embedded development lab in a protective organizer briefcase. Includes dual-core ESP32-S3 Wi-Fi/Bluetooth boards, ARM Cortex-M4 STM32 Nucleo board, BME688 environmental VOC sensor, ICM-20948 9-DOF IMU, GPS/GNSS receiver, OLED display modules, relay shields, logic analyzer, and breadboards.",
    "category": "Educational & Research Equipment",
    "images": [
      "/images/resources/embedded-iot-microcontroller-lab.jpg",
      "/images/resources/mit-robotics-sensor-lab.jpg"
    ],
    "availability": "Available",
    "condition": "Like New",
    "location": "University Campus Hub",
    "owner": {
      "name": "Dr. Aris Thorne",
      "avatar": "/placeholder-user.jpg",
      "rating": 5,
      "reviewCount": 12,
      "verified": true,
      "memberSince": "March 2024",
      "responseRate": "< 1 hour",
      "location": "University Campus"
    },
    "specs": {
      "Controllers Included": "ESP32-S3 Dual-Core, STM32F401 Nucleo, Pi Pico W",
      "Sensors": "BME688 VOC/Temp/Humidity, ICM-20948 9-DOF IMU, GPS Receiver",
      "Interconnect": "Qwiic / Stemma QT Plug-and-Play I2C Cables",
      "Debugging": "8-Channel 24MHz USB Logic Analyzer included",
      "Organization": "Anti-static foam padded hard flight case"
    },
    "borrowingTerms": "Return all sensors, jumpers, and microcontrollers to their labeled organizer bins. Anti-static mat included.",
    "eligibility": [
      "Embedded programming student or maker",
      "Verified ResourceX member"
    ],
    "deposit": "$45 refundable hold",
    "maxDuration": "14 days",
    "tags": [
      "iot",
      "esp32",
      "arm",
      "arduino",
      "microcontroller",
      "stem",
      "sensors"
    ],
    "featured": false,
    "popularityScore": 90,
    "createdAt": "2026-10-22"
  },
  {
    "id": "educational-corexy-3d-printer",
    "title": "Bambu Lab P1S Enclosed CoreXY Precision 3D Printer",
    "tagline": "Enclosed 500 mm/s high-speed CoreXY 3D printer with automatic vibration compensation",
    "description": "State-of-the-art enclosed 3D printer for classroom engineering projects, fast functional prototypes, and high-temp ABS/PETG parts.",
    "longDescription": "Features an enclosed all-metal hotend capable of 300°C, direct drive extruder, active vibration compensation for ringing-free prints at up to 500 mm/s, and automatic bed leveling. Enclosed build chamber allows reliable printing of ABS, ASA, and carbon-fiber reinforced filaments.",
    "category": "Educational & Research Equipment",
    "images": [
      "/images/resources/educational-corexy-3d-printer.jpg",
      "/images/resources/industrial-fdm-3d-printer.jpg"
    ],
    "availability": "Available",
    "condition": "Like New",
    "location": "University Campus Hub",
    "owner": {
      "name": "Dr. Aris Thorne",
      "avatar": "/placeholder-user.jpg",
      "rating": 5,
      "reviewCount": 12,
      "verified": true,
      "memberSince": "March 2024",
      "responseRate": "< 1 hour",
      "location": "University Campus"
    },
    "specs": {
      "Build Volume": "256 x 256 x 256 mm (10 x 10 x 10 in)",
      "Max Speed": "500 mm/s (Acceleration up to 20,000 mm/s²)",
      "Max Hotend Temp": "300°C (All-Metal Hotend)",
      "Bed Surface": "Textured Dual-Sided PEI Sheet",
      "Sensors": "Filament runout, door sensor, power recovery"
    },
    "borrowingTerms": "0.4mm hardened steel nozzle installed. Clean PEI plate with dish soap and warm water; do not use acetone.",
    "eligibility": [
      "Demonstrated 3D slicer competence (Bambu Studio / OrcaSlicer)",
      "Verified ResourceX member"
    ],
    "deposit": "$100 refundable hold",
    "maxDuration": "7 days",
    "tags": [
      "3d-printer",
      "bambu-lab",
      "corexy",
      "prototyping",
      "stem",
      "education"
    ],
    "featured": true,
    "popularityScore": 97,
    "createdAt": "2026-10-21"
  },
  {
    "id": "optics-laser-physics-kit",
    "title": "Thorlabs Educational Optics & HeNe Laser Physics Experimental Bench Kit",
    "tagline": "Optical rail system with Helium-Neon laser, mirrors, beam splitters, and spatial filter",
    "description": "Research and university level physical optics lab kit for wave interference, diffraction, polarization, and Michelson interferometry.",
    "longDescription": "Includes a 632.8 nm stabilized Helium-Neon red laser tube with power supply, precision anodized aluminum optical rail, kinematically mounted front-surface mirrors, 50/50 non-polarizing beam splitter cubes, polarizers, diffraction gratings, and optical photodetector.",
    "category": "Educational & Research Equipment",
    "images": [
      "/images/resources/optics-laser-physics-kit.jpg",
      "/images/resources/bosch-laser-level.jpg"
    ],
    "availability": "Available",
    "condition": "Like New",
    "location": "University Campus Hub",
    "owner": {
      "name": "Dr. Aris Thorne",
      "avatar": "/placeholder-user.jpg",
      "rating": 5,
      "reviewCount": 12,
      "verified": true,
      "memberSince": "March 2024",
      "responseRate": "< 1 hour",
      "location": "University Campus"
    },
    "specs": {
      "Laser Source": "632.8 nm Red Helium-Neon (1.5 mW Class 3R)",
      "Optical Rail": "1.0 Meter Precision Dovetail Aluminum Rail",
      "Optics": "Fused Silica Beam Splitters, Dielectric Mirrors, Polarizers",
      "Safety": "Two pairs of OD 5+ 633nm laser safety goggles included",
      "Interferometry": "Configurable for Michelson & Mach-Zehnder experiments"
    },
    "borrowingTerms": "Laser safety goggles mandatory whenever laser is energized. Never touch coated optical faces with fingers.",
    "eligibility": [
      "Physics or optical engineering student/faculty",
      "Laser safety compliance agreement"
    ],
    "deposit": "$120 refundable hold",
    "maxDuration": "14 days",
    "tags": [
      "optics",
      "laser",
      "physics",
      "interferometry",
      "thorlabs",
      "education"
    ],
    "featured": false,
    "popularityScore": 91,
    "createdAt": "2026-10-20"
  }
];

// Helper functions for querying resources
export function getAllResources(): Resource[] {
  return MOCK_RESOURCES;
}

export function getFeaturedResources(): Resource[] {
  return MOCK_RESOURCES.filter((r) => r.featured);
}

export function getResourceById(id: string): Resource | undefined {
  return MOCK_RESOURCES.find((r) => r.id === id);
}

export function getRelatedResources(resource: Resource, limit = 3): Resource[] {
  return MOCK_RESOURCES.filter(
    (r) => r.id !== resource.id && r.category === resource.category
  ).slice(0, limit);
}

export function getCategories(): CategoryInfo[] {
  return CATEGORIES;
}

export function getLocations(): string[] {
  const locations = new Set(MOCK_RESOURCES.map((r) => r.location));
  return Array.from(locations);
}
