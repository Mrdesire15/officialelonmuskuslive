import { MerchProduct } from '../types';
import blackUnisexTshirtImg from '../assets/images/black_unisex_tshirt_1794753137548.jpg';
import truckerHat3dImg from '../assets/images/trucker_hat_3d_1794753137542.jpg';

export const MERCH_PRODUCTS: MerchProduct[] = [
  {
    id: 'merch-black-unisex-tshirt',
    skuPrefix: 'X-TEE-BLK',
    name: 'Official Black Unisex T-Shirt',
    categoryLabel: 'UNISEX APPAREL · $50 – $500',
    editionTag: 'Signature Series',
    description:
      'Tailored matte jet-black unisex crew-neck tee featuring tonal chest insignia. Engineered across four progressive textile grades from everyday ring-spun cotton ($50) to limited-run cashmere-silk-cotton collector weave ($500).',
    image: blackUnisexTshirtImg,
    minPrice: 50,
    maxPrice: 500,
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    defaultSize: 'L',
    qualityTiers: [
      {
        id: 'tee-tier-50',
        gradeCode: 'GRADE I',
        name: 'Essential Combed Cotton',
        price: 50,
        materialSpec: '200 GSM · 100% Ring-Spun Combed Cotton',
        craftsmanshipNote:
          'Breathable everyday matte black weave with soft-hand tonal X chest print and reinforced rib-knit collar.',
        deliveryEstimate: 'Ships in 3–5 Business Days',
      },
      {
        id: 'tee-tier-150',
        gradeCode: 'GRADE II',
        name: 'Heavyweight Organic Jersey',
        price: 150,
        materialSpec: '320 GSM · GOTS Organic Supima Cotton',
        craftsmanshipNote:
          'Structured drop-shoulder drape, double-stitched seams, enzyme-washed pitch-black dye, and raised tonal embroidery.',
        deliveryEstimate: 'Ships in 2–4 Business Days',
      },
      {
        id: 'tee-tier-300',
        gradeCode: 'GRADE III',
        name: 'Aerospace Carbon Knit',
        price: 300,
        materialSpec: '360 GSM · Japanese Carbon-Infused Cotton Modal',
        craftsmanshipNote:
          'Thermoregulating interlocking knit with anti-fade pigment lock and sculpted metallic matte-black X crest.',
        deliveryEstimate: 'Priority Express · 2–3 Business Days',
      },
      {
        id: 'tee-tier-500',
        gradeCode: 'GRADE IV',
        name: 'Founders Collector Edition',
        price: 500,
        materialSpec: '400 GSM · Cashmere-Silk-Cotton Limited Run',
        craftsmanshipNote:
          'Individually numbered garment with precision-milled obsidian X insignia, archival garment bag, and collector box.',
        deliveryEstimate: 'Priority Armored Courier · 1–2 Business Days',
      },
    ],
    highlights: [
      'True unisex relaxed-tailored fit (XS – 3XL)',
      'Zero-shrink pre-washed matte obsidian dye',
      'Direct order fulfillment & authenticity serial reference',
    ],
  },
  {
    id: 'merch-3d-trucker-hat',
    skuPrefix: 'X-CAP-3D',
    name: 'Official 3D Trucker Hat',
    categoryLabel: 'STRUCTURED HEADWEAR · $50 – $500',
    editionTag: '3D Sculpted Crown',
    description:
      'High-crown matte black structured trucker cap highlighted by a raised 3D front monogram and ventilated rear mesh. Built in four material grades from classic twill mesh ($50) to titanium-clasp collector edition ($500).',
    image: truckerHat3dImg,
    minPrice: 50,
    maxPrice: 500,
    sizes: ['Adjustable Snapback', 'Fitted S/M', 'Fitted L/XL'],
    defaultSize: 'Adjustable Snapback',
    qualityTiers: [
      {
        id: 'hat-tier-50',
        gradeCode: 'GRADE I',
        name: 'Classic Mesh Edition',
        price: 50,
        materialSpec: 'Brushed Cotton Twill · Polycarbonate Rear Mesh',
        craftsmanshipNote:
          'Pre-curved 6-row stitched visor, structured buckram front crown, and clean raised 3D tonal X embroidery.',
        deliveryEstimate: 'Ships in 3–5 Business Days',
      },
      {
        id: 'hat-tier-150',
        gradeCode: 'GRADE II',
        name: 'High-Density 3D Puff Pro',
        price: 150,
        materialSpec: 'Performance Stretch Twill · Laser-Cut Micro Mesh',
        craftsmanshipNote:
          'Dual-layer high-relief 3D puff stitch emblem, moisture-wicking antimicrobial sweatband, and custom interior taping.',
        deliveryEstimate: 'Ships in 2–4 Business Days',
      },
      {
        id: 'hat-tier-300',
        gradeCode: 'GRADE III',
        name: 'Carbon-Weave Weatherproof',
        price: 300,
        materialSpec: 'Ballistic Hydro-Shield Nylon · Carbon Textured Brim',
        craftsmanshipNote:
          'Water-repellent structured crown, sculpted metallic-thread 3D X crest, and matte anodized rear snap closure.',
        deliveryEstimate: 'Priority Express · 2–3 Business Days',
      },
      {
        id: 'hat-tier-500',
        gradeCode: 'GRADE IV',
        name: 'Executive Titanium-Clasp Edition',
        price: 500,
        materialSpec: 'Italian Technical Wool · Perforated Lambskin Trim',
        craftsmanshipNote:
          'Numbered limited release featuring precision-machined black titanium 3D emblem, magnetic clasp, and rigid display case.',
        deliveryEstimate: 'Priority Armored Courier · 1–2 Business Days',
      },
    ],
    highlights: [
      'High-relief sculpted 3D monogram crown',
      'Breathable structured mesh back & ergonomic curved brim',
      'Available in Adjustable Snapback and Fitted sizing',
    ],
  },
];
