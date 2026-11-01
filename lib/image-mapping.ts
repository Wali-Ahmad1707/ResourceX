/**
 * ResourceX — Centralized Product Image Mapping & Resolution Engine
 * Maps resources by exact ID, title keywords, and category fallback hierarchy.
 * Ensures zero broken image states and replaces repetitive or legacy placeholder images.
 */

// Known legacy template images that should be replaced with authentic product photos
const LEGACY_REPETITIVE_PATHS = new Set([
  "/images/led-flashlight-bottle.png",
  "/images/accessory-strap.png",
  "/images/accessory-charger.png",
  "/images/accessory-speaker-base.png",
  "/images/accessory-carabiner.png",
  "/images/accessory-bike-mount.png",
  "/images/bottle-lake.png",
  "/images/bottle-bike.png",
  "/images/bottle-canyon.png",
  "/images/bottle-fire.png",
  "/images/bottle-mountain.png",
  "/images/bottle-snow.png",
  "/images/bottle-stream.png",
  "/images/bottle-water.png",
  "/images/heating-campfire.png",
  "/images/hero-main.png",
  "/images/car.jpg",
  "/placeholder.jpg",
  "/placeholder.svg",
]);

// 1. Direct Slug / ID Image Mapping
export const PRODUCT_IMAGE_MAP: Record<string, { primary: string; secondary?: string }> = {
  // --- Industrial Machinery ---
  "cnc-vertical-machining-center": {
    primary: "/images/resources/cnc-vertical-machining-center.jpg",
    secondary: "/images/resources/cat_industrial.jpg",
  },
  "precision-metal-engine-lathe": {
    primary: "/images/resources/precision-metal-engine-lathe.jpg",
    secondary: "/images/resources/cat_industrial.jpg",
  },
  "vertical-knee-milling-machine": {
    primary: "/images/resources/vertical-knee-milling-machine.jpg",
    secondary: "/images/resources/cat_industrial.jpg",
  },
  "industrial-multiprocess-welder": {
    primary: "/images/resources/industrial-multiprocess-welder.jpg",
    secondary: "/images/resources/cat_tools.jpg",
  },
  "rotary-screw-air-compressor": {
    primary: "/images/resources/rotary-screw-air-compressor.jpg",
    secondary: "/images/resources/cat_industrial.jpg",
  },
  "heavy-duty-hydraulic-press": {
    primary: "/images/resources/heavy-duty-hydraulic-press.jpg",
    secondary: "/images/resources/cat_industrial.jpg",
  },
  "diesel-industrial-generator": {
    primary: "/images/resources/diesel-industrial-generator.jpg",
    secondary: "/images/resources/jobsite-power-generator.jpg",
  },
  "industrial-fdm-3d-printer": {
    primary: "/images/resources/industrial-fdm-3d-printer.jpg",
    secondary: "/images/resources/educational-corexy-3d-printer.jpg",
  },

  // --- General Laboratory Equipment ---
  "analytical-precision-balance": {
    primary: "/images/resources/analytical-precision-balance.jpg",
    secondary: "/images/resources/cat_lab.jpg",
  },
  "compound-optical-microscope": {
    primary: "/images/resources/compound-optical-microscope.jpg",
    secondary: "/images/resources/cat_lab.jpg",
  },
  "benchtop-refrigerated-centrifuge": {
    primary: "/images/resources/benchtop-refrigerated-centrifuge.jpg",
    secondary: "/images/resources/microhematocrit-blood-centrifuge.jpg",
  },
  "uv-vis-spectrophotometer": {
    primary: "/images/resources/uv-vis-spectrophotometer.jpg",
    secondary: "/images/resources/cat_lab.jpg",
  },
  "forced-air-laboratory-oven": {
    primary: "/images/resources/forced-air-laboratory-oven.jpg",
    secondary: "/images/resources/co2-microbiological-incubator.jpg",
  },
  "benchtop-autoclave-sterilizer": {
    primary: "/images/resources/benchtop-autoclave-sterilizer.jpg",
    secondary: "/images/resources/cat_lab.jpg",
  },
  "benchtop-ph-ion-meter": {
    primary: "/images/resources/benchtop-ph-ion-meter.jpg",
    secondary: "/images/resources/cat_lab.jpg",
  },
  "digital-magnetic-stirrer-hotplate": {
    primary: "/images/resources/digital-magnetic-stirrer-hotplate.jpg",
    secondary: "/images/resources/cat_lab.jpg",
  },

  // --- Medical Laboratory Equipment ---
  "automated-hematology-analyzer": {
    primary: "/images/resources/automated-hematology-analyzer.jpg",
    secondary: "/images/resources/cat_medical.jpg",
  },
  "clinical-biochemistry-analyzer": {
    primary: "/images/resources/clinical-biochemistry-analyzer.jpg",
    secondary: "/images/resources/cat_medical.jpg",
  },
  "microhematocrit-blood-centrifuge": {
    primary: "/images/resources/microhematocrit-blood-centrifuge.jpg",
    secondary: "/images/resources/benchtop-refrigerated-centrifuge.jpg",
  },
  "medical-cold-storage-refrigerator": {
    primary: "/images/resources/medical-cold-storage-refrigerator.jpg",
    secondary: "/images/resources/cat_medical.jpg",
  },
  "clinical-fluorescence-microscope": {
    primary: "/images/resources/clinical-fluorescence-microscope.jpg",
    secondary: "/images/resources/compound-optical-microscope.jpg",
  },
  "realtime-pcr-thermal-cycler": {
    primary: "/images/resources/realtime-pcr-thermal-cycler.jpg",
    secondary: "/images/resources/cat_medical.jpg",
  },
  "co2-microbiological-incubator": {
    primary: "/images/resources/co2-microbiological-incubator.jpg",
    secondary: "/images/resources/forced-air-laboratory-oven.jpg",
  },
  "automated-liquid-handling-robot": {
    primary: "/images/resources/automated-liquid-handling-robot.jpg",
    secondary: "/images/resources/cat_medical.jpg",
  },

  // --- Construction & Workshop Equipment ---
  "portable-concrete-drum-mixer": {
    primary: "/images/resources/portable-concrete-drum-mixer.jpg",
    secondary: "/images/resources/cat_construction.jpg",
  },
  "magnetic-base-drill-press": {
    primary: "/images/resources/magnetic-base-drill-press.jpg",
    secondary: "/images/resources/dewalt-miter-saw.jpg",
  },
  "fabrication-welding-toolkit": {
    primary: "/images/resources/fabrication-welding-toolkit.jpg",
    secondary: "/images/resources/industrial-multiprocess-welder.jpg",
  },
  "horizontal-metal-band-saw": {
    primary: "/images/resources/horizontal-metal-band-saw.jpg",
    secondary: "/images/resources/dewalt-miter-saw.jpg",
  },
  "jobsite-power-generator": {
    primary: "/images/resources/jobsite-power-generator.jpg",
    secondary: "/images/resources/diesel-industrial-generator.jpg",
  },
  "porta-power-hydraulic-ram-kit": {
    primary: "/images/resources/porta-power-hydraulic-ram-kit.jpg",
    secondary: "/images/resources/heavy-duty-hydraulic-press.jpg",
  },

  // --- Educational & Research Equipment ---
  "ros2-mobile-research-robot": {
    primary: "/images/resources/ros2-mobile-research-robot.jpg",
    secondary: "/images/resources/mit-robotics-sensor-lab.jpg",
  },
  "programmable-dc-bench-supply": {
    primary: "/images/resources/programmable-dc-bench-supply.jpg",
    secondary: "/images/resources/digital-storage-oscilloscope.jpg",
  },
  "digital-storage-oscilloscope": {
    primary: "/images/resources/digital-storage-oscilloscope.jpg",
    secondary: "/images/resources/programmable-dc-bench-supply.jpg",
  },
  "embedded-iot-microcontroller-lab": {
    primary: "/images/resources/embedded-iot-microcontroller-lab.jpg",
    secondary: "/images/resources/mit-robotics-sensor-lab.jpg",
  },
  "educational-corexy-3d-printer": {
    primary: "/images/resources/educational-corexy-3d-printer.jpg",
    secondary: "/images/resources/industrial-fdm-3d-printer.jpg",
  },
  "optics-laser-physics-kit": {
    primary: "/images/resources/optics-laser-physics-kit.jpg",
    secondary: "/images/resources/bosch-laser-level.jpg",
  },

  // --- Core 14 Existing Resources ---
  "bosch-laser-level": {
    primary: "/images/resources/bosch-laser-level.jpg",
    secondary: "/images/resources/optics-laser-physics-kit.jpg",
  },
  "osprey-expedition-pack": {
    primary: "/images/resources/osprey-expedition-pack.jpg",
    secondary: "/images/resources/cat_outdoor.jpg",
  },
  "sony-a7iii-camera-kit": {
    primary: "/images/resources/sony-a7iii-camera-kit.jpg",
    secondary: "/images/resources/dji-mini-3-pro.jpg",
  },
  "anker-powerhouse-256wh": {
    primary: "/images/resources/anker-powerhouse-256wh.jpg",
    secondary: "/images/resources/cat_electronics.jpg",
  },
  "wahoo-kickr-trainer": {
    primary: "/images/resources/wahoo-kickr-trainer.jpg",
    secondary: "/images/resources/cat_sports.jpg",
  },
  "big-agnes-expedition-tent": {
    primary: "/images/resources/big-agnes-expedition-tent.jpg",
    secondary: "/images/resources/osprey-expedition-pack.jpg",
  },
  "dewalt-miter-saw": {
    primary: "/images/resources/dewalt-miter-saw.jpg",
    secondary: "/images/resources/horizontal-metal-band-saw.jpg",
  },
  "dji-mini-3-pro": {
    primary: "/images/resources/dji-mini-3-pro.jpg",
    secondary: "/images/resources/sony-a7iii-camera-kit.jpg",
  },
  "inflatable-paddleboard": {
    primary: "/images/resources/inflatable-paddleboard.jpg",
    secondary: "/images/resources/cat_sports.jpg",
  },
  "oreilly-cs-collection": {
    primary: "/images/resources/oreilly-cs-collection.jpg",
    secondary: "/images/resources/cat_books.jpg",
  },
  "mit-robotics-sensor-lab": {
    primary: "/images/resources/mit-robotics-sensor-lab.jpg",
    secondary: "/images/resources/ros2-mobile-research-robot.jpg",
  },
  "fluke-87v-multimeter": {
    primary: "/images/resources/fluke-87v-multimeter.jpg",
    secondary: "/images/resources/programmable-dc-bench-supply.jpg",
  },
  "makita-brushless-combo": {
    primary: "/images/resources/makita-brushless-combo.jpg",
    secondary: "/images/resources/dewalt-miter-saw.jpg",
  },
  "climbing-gear-rack": {
    primary: "/images/resources/climbing-gear-rack.jpg",
    secondary: "/images/resources/osprey-expedition-pack.jpg",
  },
};

// 2. Category Fallback Mapping
export const CATEGORY_IMAGE_MAP: Record<string, string> = {
  "Industrial Machinery": "/images/resources/cat_industrial.jpg",
  "General Laboratory Equipment": "/images/resources/cat_lab.jpg",
  "Medical Laboratory Equipment": "/images/resources/cat_medical.jpg",
  "Construction & Workshop Equipment": "/images/resources/cat_construction.jpg",
  "Educational & Research Equipment": "/images/resources/cat_educational.jpg",
  "Tools & Equipment": "/images/resources/cat_tools.jpg",
  "Outdoor & Camping": "/images/resources/cat_outdoor.jpg",
  "Electronics": "/images/resources/cat_electronics.jpg",
  "Sports & Fitness": "/images/resources/cat_sports.jpg",
  "Photography": "/images/resources/cat_photo.jpg",
  "Books & Education": "/images/resources/cat_books.jpg",
};

// 3. Keyword Pattern Matching for Custom / User-Uploaded / Test Resources
const TITLE_KEYWORD_MAP: Array<{ pattern: RegExp; image: string }> = [
  { pattern: /cnc/i, image: "/images/resources/cnc-vertical-machining-center.jpg" },
  { pattern: /lathe/i, image: "/images/resources/precision-metal-engine-lathe.jpg" },
  { pattern: /milling/i, image: "/images/resources/vertical-knee-milling-machine.jpg" },
  { pattern: /weld(ing|er)?/i, image: "/images/resources/industrial-multiprocess-welder.jpg" },
  { pattern: /compressor/i, image: "/images/resources/rotary-screw-air-compressor.jpg" },
  { pattern: /hydraulic\s*press/i, image: "/images/resources/heavy-duty-hydraulic-press.jpg" },
  { pattern: /hydraulic/i, image: "/images/resources/porta-power-hydraulic-ram-kit.jpg" },
  { pattern: /generator/i, image: "/images/resources/jobsite-power-generator.jpg" },
  { pattern: /3d\s*print(er)?/i, image: "/images/resources/educational-corexy-3d-printer.jpg" },
  { pattern: /balance|scale|weight/i, image: "/images/resources/analytical-precision-balance.jpg" },
  { pattern: /microscope/i, image: "/images/resources/compound-optical-microscope.jpg" },
  { pattern: /centrifuge/i, image: "/images/resources/benchtop-refrigerated-centrifuge.jpg" },
  { pattern: /spectro/i, image: "/images/resources/uv-vis-spectrophotometer.jpg" },
  { pattern: /oven/i, image: "/images/resources/forced-air-laboratory-oven.jpg" },
  { pattern: /autoclave|steril/i, image: "/images/resources/benchtop-autoclave-sterilizer.jpg" },
  { pattern: /ph\s*meter/i, image: "/images/resources/benchtop-ph-ion-meter.jpg" },
  { pattern: /stirrer|hotplate/i, image: "/images/resources/digital-magnetic-stirrer-hotplate.jpg" },
  { pattern: /hematology/i, image: "/images/resources/automated-hematology-analyzer.jpg" },
  { pattern: /biochem/i, image: "/images/resources/clinical-biochemistry-analyzer.jpg" },
  { pattern: /refrigerator|freezer/i, image: "/images/resources/medical-cold-storage-refrigerator.jpg" },
  { pattern: /pcr|thermal\s*cycler/i, image: "/images/resources/realtime-pcr-thermal-cycler.jpg" },
  { pattern: /incubator/i, image: "/images/resources/co2-microbiological-incubator.jpg" },
  { pattern: /liquid\s*handl|pipet/i, image: "/images/resources/automated-liquid-handling-robot.jpg" },
  { pattern: /concrete|mixer/i, image: "/images/resources/portable-concrete-drum-mixer.jpg" },
  { pattern: /drill/i, image: "/images/resources/magnetic-base-drill-press.jpg" },
  { pattern: /grinder/i, image: "/images/resources/makita-brushless-combo.jpg" },
  { pattern: /saw/i, image: "/images/resources/dewalt-miter-saw.jpg" },
  { pattern: /robot/i, image: "/images/resources/ros2-mobile-research-robot.jpg" },
  { pattern: /power\s*supply/i, image: "/images/resources/programmable-dc-bench-supply.jpg" },
  { pattern: /oscilloscope/i, image: "/images/resources/digital-storage-oscilloscope.jpg" },
  { pattern: /arduino|microcontroller|iot/i, image: "/images/resources/embedded-iot-microcontroller-lab.jpg" },
  { pattern: /optics|laser/i, image: "/images/resources/bosch-laser-level.jpg" },
  { pattern: /multimeter/i, image: "/images/resources/fluke-87v-multimeter.jpg" },
  { pattern: /tent/i, image: "/images/resources/big-agnes-expedition-tent.jpg" },
  { pattern: /backpack|pack/i, image: "/images/resources/osprey-expedition-pack.jpg" },
  { pattern: /camera/i, image: "/images/resources/sony-a7iii-camera-kit.jpg" },
  { pattern: /drone/i, image: "/images/resources/dji-mini-3-pro.jpg" },
  { pattern: /paddle|sup/i, image: "/images/resources/inflatable-paddleboard.jpg" },
  { pattern: /climb/i, image: "/images/resources/climbing-gear-rack.jpg" },
  { pattern: /book|library/i, image: "/images/resources/oreilly-cs-collection.jpg" },
];

/**
 * Resolves a high-quality, category-specific product image for any resource.
 * Replaces repetitive placeholders with authentic equipment photography.
 */
export function resolveResourceImage(resource: {
  id?: string;
  title?: string;
  category?: string;
  images?: string[] | string;
}): string {
  // 1. Direct ID lookup
  if (resource.id && PRODUCT_IMAGE_MAP[resource.id]?.primary) {
    return PRODUCT_IMAGE_MAP[resource.id].primary;
  }

  // 2. Check if resource already has a custom uploaded image (e.g. user upload via /api/upload)
  if (resource.images) {
    let firstImg = "";
    if (Array.isArray(resource.images) && resource.images.length > 0) {
      firstImg = resource.images[0];
    } else if (typeof resource.images === "string") {
      try {
        const parsed = JSON.parse(resource.images);
        if (Array.isArray(parsed) && parsed.length > 0) firstImg = parsed[0];
        else firstImg = resource.images;
      } catch {
        firstImg = resource.images;
      }
    }

    if (
      firstImg &&
      firstImg.trim() &&
      !LEGACY_REPETITIVE_PATHS.has(firstImg.trim()) &&
      (firstImg.startsWith("/uploads/") || firstImg.startsWith("/images/resources/"))
    ) {
      return firstImg.trim();
    }
  }

  // 3. Keyword matching against product title
  if (resource.title) {
    for (const entry of TITLE_KEYWORD_MAP) {
      if (entry.pattern.test(resource.title)) {
        return entry.image;
      }
    }
  }

  // 4. Category fallback
  if (resource.category && CATEGORY_IMAGE_MAP[resource.category]) {
    return CATEGORY_IMAGE_MAP[resource.category];
  }

  // 5. Ultimate clean fallback
  return "/images/resources/cat_tools.jpg";
}

/**
 * Resolves full gallery array for resource detail pages.
 */
export function resolveResourceGallery(resource: {
  id?: string;
  title?: string;
  category?: string;
  images?: string[] | string;
}): string[] {
  const primary = resolveResourceImage(resource);
  const secondary =
    (resource.id && PRODUCT_IMAGE_MAP[resource.id]?.secondary) ||
    (resource.category && CATEGORY_IMAGE_MAP[resource.category]) ||
    primary;

  const gallery = [primary];
  if (secondary && secondary !== primary) {
    gallery.push(secondary);
  }

  // If resource has additional uploaded images
  if (resource.images) {
    let existingList: string[] = [];
    if (Array.isArray(resource.images)) existingList = resource.images;
    else {
      try {
        const parsed = JSON.parse(resource.images);
        if (Array.isArray(parsed)) existingList = parsed;
      } catch {}
    }

    for (const img of existingList) {
      if (
        img &&
        !gallery.includes(img) &&
        !LEGACY_REPETITIVE_PATHS.has(img) &&
        (img.startsWith("/uploads/") || img.startsWith("/images/resources/"))
      ) {
        gallery.push(img);
      }
    }
  }

  return gallery;
}

/**
 * Returns category hero thumbnail
 */
export function getCategoryHeroImage(categoryName: string): string {
  return CATEGORY_IMAGE_MAP[categoryName] || "/images/resources/cat_tools.jpg";
}
