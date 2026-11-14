import { ProfileData, CompanyData, FlyingCarSpecData, GalleryImageData } from '../types';

export const INITIAL_PROFILE: ProfileData = {
  name: "Elon Musk",
  role: "Chief Engineer & Technologist",
  headline: "Founder, CEO & Chief Engineer at SpaceX · CEO & Product Architect at Tesla · Founder of xAI",
  quote: "When something is important enough, you do it even if the odds are not in your favor.",
  portrait: "/assets/aistudio/OIP__19__b4ca5349.webp",
  bio: "Elon Musk is an engineer, inventor, and technology entrepreneur leading revolutions in aerospace, sustainable transport, neural interfaces, robotics, and artificial intelligence. Guided by first-principles physics, he has driven the commercialization of reusable orbital rocketry, scaled electric vehicles into global ubiquity, and laid the groundwork for making humanity a multi-planetary civilization.",
  netWorth: "$325 Billion",
  companiesCount: 6,
  location: "Austin, Texas · Starbase, Boca Chica",
  bornYear: 1971,
  citizenship: "South Africa · Canada · United States"
};

export const FAMOUS_QUOTES = [
  "When something is important enough, you do it even if the odds are not in your favor.",
  "Physics is the law, everything else is a recommendation.",
  "Life cannot just be about solving one miserable problem after another. There need to be reasons to live.",
  "I'd rather be optimistic and wrong than pessimistic and right.",
  "The fundamental question is: do we want to be a spacefaring civilization and out there among the stars?",
  "Work like hell. Put in 80 to 100 hour weeks every week. This improves the odds of success."
];

export const INITIAL_COMPANIES: CompanyData[] = [
  {
    id: "co-tesla",
    name: "Tesla",
    role: "Technoking & Chief Executive Officer",
    description: "Accelerating the world's transition to sustainable energy with electric vehicles, megapack battery grids, solar roofs, and Optimus humanoid robotics.",
    founded: "2003",
    valuationOrMarketCap: "$800B+ Cap",
    mission: "Accelerate global transition to sustainable energy",
    iconName: "car",
    status: "Active · Market Leader",
    url: "https://tesla.com",
    order: 1
  },
  {
    id: "co-spacex",
    name: "SpaceX",
    role: "Founder, CEO & Chief Engineer",
    description: "Designing, manufacturing, and launching advanced rockets and spacecraft, including Falcon 9, Falcon Heavy, and Starship.",
    founded: "2002",
    valuationOrMarketCap: "$250B+ Valuation",
    mission: "Make humanity a multi-planetary species",
    iconName: "rocket",
    status: "Active · Orbital Standard",
    url: "https://spacex.com",
    order: 2
  },
  {
    id: "co-xai",
    name: "xAI",
    role: "Founder & Chief Executive Officer",
    description: "Building artificial intelligence to understand the true nature of the universe, powering Grok and the Colossus supercomputer cluster.",
    founded: "2023",
    valuationOrMarketCap: "$50B+ Valuation",
    mission: "Understand the true nature of the universe",
    iconName: "brain",
    status: "Active · Frontier AI",
    url: "https://x.ai",
    order: 3
  },
  {
    id: "co-starlink",
    name: "Starlink",
    role: "Architect & Space Constellation Lead",
    description: "The world's largest satellite constellation delivering high-speed, low-latency internet to over 100 nations and maritime routes.",
    founded: "2015",
    valuationOrMarketCap: "6,000+ Satellites",
    mission: "Connect remote communities and bridge the global digital divide",
    iconName: "satellite",
    status: "Active · Global Coverage",
    order: 4
  },
  {
    id: "co-neuralink",
    name: "Neuralink",
    role: "Co-Founder",
    description: "Developing ultra-high bandwidth brain-computer interfaces to restore autonomy to individuals with neurological conditions and unlock cognitive synergy.",
    founded: "2016",
    valuationOrMarketCap: "Human Trials Underway",
    mission: "Create a generalized brain interface to restore autonomy",
    iconName: "atom",
    status: "Active · Clinical Pioneer",
    order: 5
  },
  {
    id: "co-boring",
    name: "The Boring Company",
    role: "Founder",
    description: "Transforming urban transit through rapid-tunneling systems and all-electric underground Loop systems to solve soul-crushing traffic.",
    founded: "2016",
    valuationOrMarketCap: "Las Vegas Loop Operational",
    mission: "Solve traffic through high-throughput 3D subterranean transport",
    iconName: "shovel",
    status: "Active · Expanding",
    order: 6
  }
];

export const INITIAL_FLYING_CAR_SPECS: FlyingCarSpecData[] = [
  {
    id: "spec-0-60",
    label: "0-60 MPH Acceleration",
    value: "< 1.0",
    unit: "Seconds",
    highlight: "SpaceX Rocket Package",
    description: "Ultra-high pressure cold gas thrusters arranged seamlessly behind the license plate achieve sub-second acceleration beyond physical tire traction limits.",
    category: "performance",
    order: 1
  },
  {
    id: "spec-top-speed",
    label: "Maximum Velocity",
    value: "250+",
    unit: "MPH",
    highlight: "Aerodynamic Downforce",
    description: "Engineered with composite ground effects and variable thruster vectoring to maintain road adhesion and high-speed stability.",
    category: "performance",
    order: 2
  },
  {
    id: "spec-thrusters",
    label: "SpaceX Cold Gas Thrusters",
    value: "10",
    unit: "Composite Thrusters",
    highlight: "Fly & Hover Mode",
    description: "Derived directly from Falcon 9 RCS thrusters, utilizing cold compressed gas in a composite overwrapped pressure vessel for short hops, lateral maneuvers, and instantaneous braking.",
    category: "aerospace",
    order: 3
  },
  {
    id: "spec-range",
    label: "Highway Electric Range",
    value: "620",
    unit: "Miles",
    highlight: "200 kWh Energy Cell",
    description: "Next-generation structural battery chemistry provides unprecedented 1,000 km single-charge interstate range without refueling.",
    category: "range",
    order: 4
  },
  {
    id: "spec-torque",
    label: "Wheel Torque",
    value: "10,000",
    unit: "Nm",
    highlight: "Tri-Motor Vectoring",
    description: "One front motor paired with dual rear independent motors deliver zero-lag instantaneous all-wheel drive distribution.",
    category: "performance",
    order: 5
  },
  {
    id: "spec-chassis",
    label: "Body & Canopy Architecture",
    value: "Full Carbon",
    unit: "Composite Glass",
    highlight: "Removable Targa Roof",
    description: "Monocoque aerospace-grade carbon fiber chassis engineered with structural rigidity exceeding Formula 1 standards.",
    category: "aerospace",
    order: 6
  }
];

export const INITIAL_GALLERY: GalleryImageData[] = [
  {
    id: "gal-doge",
    title: "Radical Efficiency & Frontier Leadership",
    subtitle: "Official Keynote Address · Washington D.C.",
    caption: "Elon Musk in iconic DOGE cap outlining principles of radical efficiency, reducing bureaucratic bloat, and applying tech engineering rigor to national scale.",
    image: "/assets/aistudio/OIP__19__b4ca5349.webp",
    category: "portraits",
    location: "Washington, D.C.",
    year: "2024",
    dateStr: "November 2024",
    context: "Official keynote capture reflecting fiscal transparency, technological modernization of government, and maximum organizational throughput.",
    order: 1,
    isFeatured: true
  },
  {
    id: "gal-contemplation",
    title: "First Principles & Deep Contemplation",
    subtitle: "Executive Forum Session · Strategic Focus",
    caption: "A powerful, focused capture of Elon Musk in deep strategic contemplation, reflecting the intense problem-solving focus behind multi-planetary engineering and artificial intelligence.",
    image: "/assets/aistudio/OIP__20__21234731.webp",
    category: "portraits",
    location: "Austin, Texas",
    year: "2024",
    dateStr: "October 2024",
    context: "Executive interview and symposium capture highlighting first-principles physics reasoning and relentless focus on critical human milestones.",
    order: 2,
    isFeatured: true
  },
  {
    id: "gal-1",
    title: "The Visionary Leader",
    subtitle: "Official Executive Portrait · Black Tie Gala",
    caption: "A timeless portrait embodying the blend of engineering precision and generational audacity that defines the modern space and electric revolution.",
    image: "/assets/aistudio/elo_e882ff2e.webp",
    category: "portraits",
    location: "San Francisco, California",
    year: "2024",
    dateStr: "April 2024",
    context: "Captured during international executive summits addressing planetary energy transition and foundation model development.",
    order: 2,
    isFeatured: true
  },
  {
    id: "gal-2",
    title: "Breakthrough Prize Celebration",
    subtitle: "10th Annual Breakthrough Ceremony · Red Carpet",
    caption: "Elon Musk welcoming global researchers and innovators with his trademark celebratory open-arms gesture at the 'Oscars of Science'.",
    image: "/assets/aistudio/elonxx_44d23abe.jpg",
    category: "honors",
    location: "Academy Museum of Motion Pictures, Los Angeles",
    year: "2024",
    dateStr: "April 13, 2024",
    context: "Honoring pioneering scientists across Fundamental Physics, Mathematics, and Life Sciences on the world stage.",
    order: 2,
    isFeatured: true
  },
  {
    id: "gal-3",
    title: "Electric Velocity & Automotive Lineage",
    subtitle: "Next-Gen Performance · Leaning with Tesla Supercar",
    caption: "Musk in signature quilted road jacket alongside the electric powertrain lineage that overturned a century of internal combustion heritage.",
    image: "/assets/aistudio/elonxx0_53270167.jpg",
    category: "tesla",
    location: "Fremont Factory & Design Studio, California",
    year: "2023",
    dateStr: "Fall 2023",
    context: "A candid moment reflecting the relentless manufacturing and aerodynamic engineering behind the world's quickest production road cars.",
    order: 3,
    isFeatured: true
  },
  {
    id: "gal-4",
    title: "Starship Architecture & Multi-Planetary Future",
    subtitle: "Holding Scale Prototype · Interplanetary Blueprint",
    caption: "Reviewing the stainless-steel Starship architecture — humanity's most ambitious rocket system designed to carry 100+ tons to Moon & Mars.",
    image: "/assets/aistudio/elonx_59952dc2.jpg",
    category: "spacex",
    location: "Starbase Engineering Facility, Boca Chica, Texas",
    year: "2023",
    dateStr: "December 2023",
    context: "First-principles rocket design: utilizing 300-series stainless steel and methane/LOX Raptor engines for 100% full reusability.",
    order: 4,
    isFeatured: true
  },
  {
    id: "gal-5",
    title: "Master Plan Part 3 Briefing",
    subtitle: "Formal Executive Session · Global Energy Blueprint",
    caption: "Reflective executive portrait during discussions on terrestrial solar, megawatt-scale battery storage, and autonomous humanoid robotics.",
    image: "/assets/aistudio/elon_befc0007.jpg",
    category: "portraits",
    location: "Gigafactory Texas, Austin",
    year: "2024",
    dateStr: "March 2024",
    context: "Formal leadership capture outlining the transition of global manufacturing to zero-emission and high-throughput automation.",
    order: 5,
    isFeatured: false
  }
];
