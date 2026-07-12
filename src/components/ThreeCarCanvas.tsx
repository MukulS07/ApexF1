import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { getTeam } from "@/lib/f1-data";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface Props {
  teamId: string;
  driverNumber?: number;
  mode: "reveal" | "interactive" | "scroll" | "rotate";
  onLoadProgress?: (progress: number) => void;
  onLoaded?: () => void;
  liveryMode?: "dark" | "black" | "teal" | "white";
  cameraPreset?: "orbit" | "top" | "side" | "detail-sidepod" | "detail-nose" | "detail-wing";
}

// Helper to map OBJ material names to texture files in the directories
function getTextureFileForMaterial(materialName: string, teamId: string): string | null {
  if (!materialName) return null;
  const nameLower = materialName.toLowerCase();
  
  const mclFiles = [
    "cam_tbone_misc_BaseColor_sRGB_1002.png",
    "drs_puller_BaseColor_sRGB_1002.png",
    "exthaust_BaseColor_sRGB_1001.png",
    "front_tire_BaseColor_sRGB_1001.png",
    "front_wheel_cover_BaseColor_sRGB_1001.png",
    "front_wheel_windlet_BaseColor_sRGB_1001.png",
    "front_wing_BaseColor_sRGB_1001.png",
    "front_wing_c_BaseColor_sRGB_1001.png",
    "halo_BaseColor_sRGB_1001.png",
    "headrest_BaseColor_sRGB_1001.png",
    "main_body_BaseColor_sRGB_1001.png",
    "mirror_BaseColor_sRGB_1002.png",
    "rear_tire_BaseColor_sRGB_1001.png",
    "rear_wheel_cover_BaseColor_sRGB_1001.png",
    "rear_wing_BaseColor_sRGB_1001.png",
    "suspensions_BaseColor_sRGB_1001.png",
    "wheel_nut_BaseColor_sRGB_1001.png",
    "wheel_rim_BaseColor_sRGB_1001.png",
    "wheel_screw_001_BaseColor_sRGB_1001.png",
    "wheel_screw_BaseColor_sRGB_1001.png"
  ];

  const merFiles = [
    "w14_m.png",
    "w14_2.png",
    "rim.png",
    "stwheel.png",
    "tyre.png",
    "tyrewall.png"
  ];

  const ferFiles = [
    "sf26_c.PNG.png",
    "sf26_1.png",
    "sf26_dc.PNG.png",
    "sf26_glow.png",
    "sf26_m.png",
    "stwheel.PNG.png",
    "tread.PNG.png",
    "tyrewall.png",
    "wheel.png"
  ];

  const rbrFiles = [
    "rb19_2.png",
    "rim.png",
    "stwheel.png",
    "tyre.png",
    "tyrewall.png"
  ];

  const wilFiles = [
    "fw47_2.png",
    "fw47_c.png",
    "fw47_dc.png",
    "fw47_m.png",
    "rear_light.png",
    "rim.png",
    "stwheel.png",
    "tyre.png",
    "tyrewall.png"
  ];

  const alpFiles = [
    "aiStandardSurface100SG_Base_color_1001.png",
    "aiStandardSurface101SG_Base_color_1001.png",
    "aiStandardSurface102SG_Base_color_1001.png",
    "aiStandardSurface94SG_Base_color_1001.png",
    "aiStandardSurface96SG_Base_color_1001.png",
    "aiStandardSurface97SG_Base_color_1001.png",
    "aiStandardSurface98SG_Base_color_1001.png",
    "aiStandardSurface99SG_Base_color_1001.png"
  ];

  const astFiles = [
    "FBX1_aiStandardSurface50SG_Base_color_1001.png",
    "RedBull_RB20__2_1_aiStandardSurface44SG_Ba.png",
    "RedBull_RB20__2_1_aiStandardSurface45SG_Ba.png",
    "RedBull_RB20__2_1_aiStandardSurface46SG_Ba.png",
    "_aiStandardSurface93SG_Base_color_1001.png",
    "_aiStandardSurface94SG_Base_color_1001.png",
    "_aiStandardSurface95SG_Base_color_1001.png",
    "Steer_new.png"
  ];

  const haasFiles = [
    "aiStandardSurface93_Base_color_1001.png",
    "aiStandardSurface94_Base_color_1001.png",
    "aiStandardSurface95_Base_color_1001.png",
    "aiStandardSurface96_Base_color_1001.png",
    "aiStandardSurface97_Base_color_1001.png",
    "aiStandardSurface98_Base_color_1001.png",
    "Steer_new.png"
  ];

  const rbFiles = [
    "aiStandardSurface109SG_Base_color_1001.png",
    "aiStandardSurface110SG_Base_color_1001.png",
    "aiStandardSurface111SG_Base_color_10011.png",
    "aiStandardSurface112SG_Base_color_1001.png",
    "aiStandardSurface113SG_Base_color_1001.png",
    "aiStandardSurface115SG_Base_color_1001.png",
    "aiStandardSurface116SG_Base_color_1001.png",
    "Steer_new.png"
  ];

  let filesList: string[] = [];
  if (teamId === "mclaren") filesList = mclFiles;
  else if (teamId === "mercedes") filesList = merFiles;
  else if (teamId === "ferrari") filesList = ferFiles;
  else if (teamId === "redbull") filesList = rbrFiles;
  else if (teamId === "williams") filesList = wilFiles;
  else if (teamId === "alpine") filesList = alpFiles;
  else if (teamId === "aston") filesList = astFiles;
  else if (teamId === "haas") filesList = haasFiles;
  else if (teamId === "rb") filesList = rbFiles;
  else return null;

  if (teamId === "mclaren" && nameLower.includes("main_body")) {
    return "mclaren_new_body.png";
  }

  // 1. Exact Match (ignoring extension)
  for (const file of filesList) {
    const fileBase = file.split(".")[0].toLowerCase();
    if (fileBase === nameLower) {
      return file;
    }
  }

  // 2. Cleaned Material & Filename matching (stripping common suffixes and prefixes)
  const cleanName = nameLower
    .replace(/^fbx1_/, "")
    .replace(/^_/, "")
    .replace(/sg$/, "");

  for (const file of filesList) {
    const fileBase = file.split(".")[0].toLowerCase();
    const cleanFile = fileBase
      .replace(/_base_color_1001$/, "")
      .replace(/_basecolor_srgb_1001$/, "")
      .replace(/_basecolor_srgb_1002$/, "")
      .replace(/_ba$/, "")
      .replace(/_c$/, "")
      .replace(/_dc$/, "")
      .replace(/_m$/, "")
      .replace(/^fbx1_/, "")
      .replace(/^_/, "")
      .replace(/sg$/, "");

    if (cleanFile === cleanName || cleanFile.includes(cleanName) || cleanName.includes(cleanFile)) {
      // Avoid matching tyres to tyrewalls
      const isFileTyreWall = cleanFile.includes("tyrewall");
      const isNameTyreWall = cleanName.includes("tyrewall");
      if (isFileTyreWall !== isNameTyreWall) continue;

      // Avoid matching steering wheels to rims/wheels
      const isFileSteer = cleanFile.includes("steer") || cleanFile.includes("stwheel");
      const isNameSteer = cleanName.includes("steer") || cleanName.includes("stwheel");
      if (isFileSteer !== isNameSteer) continue;

      return file;
    }
  }

  // 3. Strict Fallback Keyword Match (context aware)
  if (cleanName.includes("tyrewall")) {
    const match = filesList.find(f => f.toLowerCase().includes("tyrewall"));
    if (match) return match;
  }
  if (cleanName.includes("tread") || cleanName.includes("tire") || cleanName.includes("tyre")) {
    // Match treads / tyres but exclude tyre-walls
    const match = filesList.find(f => {
      const fLower = f.toLowerCase();
      return (fLower.includes("tread") || fLower.includes("tyre") || fLower.includes("tire")) && !fLower.includes("wall");
    });
    if (match) return match;
  }
  if (cleanName.includes("rim") || (cleanName.includes("wheel") && !cleanName.includes("steer") && !cleanName.includes("stwheel"))) {
    // Match rims / wheels but exclude steering wheels
    const match = filesList.find(f => {
      const fLower = f.toLowerCase();
      return (fLower.includes("rim") || fLower.includes("wheel")) && !fLower.includes("steer") && !fLower.includes("stwheel");
    });
    if (match) return match;
  }
  if (cleanName.includes("steer") || cleanName.includes("stwheel")) {
    const match = filesList.find(f => f.toLowerCase().includes("steer") || f.toLowerCase().includes("stwheel"));
    if (match) return match;
  }

  return null;
}

function getTextureByFileIndex(fileIndex: number, teamId: string): string | null {
  if (fileIndex < 0) return null;

  const mclFiles = [
    "cam_tbone_misc_BaseColor_sRGB_1002.png",
    "drs_puller_BaseColor_sRGB_1002.png",
    "exthaust_BaseColor_sRGB_1001.png",
    "front_tire_BaseColor_sRGB_1001.png",
    "front_wheel_cover_BaseColor_sRGB_1001.png",
    "front_wheel_windlet_BaseColor_sRGB_1001.png",
    "front_wing_BaseColor_sRGB_1001.png",
    "front_wing_c_BaseColor_sRGB_1001.png",
    "halo_BaseColor_sRGB_1001.png",
    "headrest_BaseColor_sRGB_1001.png",
    "mclaren_new_body.png",
    "mirror_BaseColor_sRGB_1002.png",
    "rear_tire_BaseColor_sRGB_1001.png",
    "rear_wheel_cover_BaseColor_sRGB_1001.png",
    "rear_wing_BaseColor_sRGB_1001.png",
    "suspensions_BaseColor_sRGB_1001.png",
    "wheel_nut_BaseColor_sRGB_1001.png",
    "wheel_rim_BaseColor_sRGB_1001.png",
    "wheel_screw_001_BaseColor_sRGB_1001.png",
    "wheel_screw_BaseColor_sRGB_1001.png"
  ];

  const merFiles = [
    "w14_2.png",      // model_0
    "stwheel.png",    // model_1
    "w14_2.png",      // model_2
    "w14_2.png",      // model_3
    "w14_m.png",      // model_4
    "w14_m.png"       // model_5
  ];

  const ferFiles = [
    "sf26_1.png", // model_0 (chassis)
    "wheel.png", // model_1 (wheel)
    "", // model_2
    "", // model_3
    "", // model_4
    "stwheel.PNG.png", // model_5 (stwheel)
    "", // model_6
    "tread.PNG.png", // model_7 (tread)
    "tyrewall.png" // model_8 (tyrewall)
  ];

  const rbrFiles = [
    "rb19_2.png",
    "rim.png",
    "stwheel.png",
    "tyre.png",
    "tyrewall.png"
  ];

  const wilFiles = [
    "fw47_2.png",
    "fw47_c.png",
    "fw47_dc.png",
    "fw47_m.png",
    "rear_light.png",
    "rim.png",
    "stwheel.png",
    "tyre.png",
    "tyrewall.png"
  ];

  const alpFiles = [
    "aiStandardSurface100SG_Base_color_1001.png",
    "aiStandardSurface101SG_Base_color_1001.png",
    "aiStandardSurface102SG_Base_color_1001.png",
    "aiStandardSurface94SG_Base_color_1001.png",
    "aiStandardSurface96SG_Base_color_1001.png",
    "aiStandardSurface97SG_Base_color_1001.png",
    "aiStandardSurface98SG_Base_color_1001.png",
    "aiStandardSurface99SG_Base_color_1001.png"
  ];

  const astFiles = [
    "FBX1_aiStandardSurface50SG_Base_color_1001.png",
    "RedBull_RB20__2_1_aiStandardSurface44SG_Ba.png",
    "RedBull_RB20__2_1_aiStandardSurface45SG_Ba.png",
    "RedBull_RB20__2_1_aiStandardSurface46SG_Ba.png",
    "_aiStandardSurface93SG_Base_color_1001.png",
    "_aiStandardSurface94SG_Base_color_1001.png",
    "_aiStandardSurface95SG_Base_color_1001.png",
    "Steer_new.png"
  ];

  const haasFiles = [
    "aiStandardSurface93_Base_color_1001.png",
    "aiStandardSurface94_Base_color_1001.png",
    "aiStandardSurface95_Base_color_1001.png",
    "aiStandardSurface96_Base_color_1001.png",
    "aiStandardSurface97_Base_color_1001.png",
    "aiStandardSurface98_Base_color_1001.png",
    "Steer_new.png"
  ];

  const rbFiles = [
    "aiStandardSurface109SG_Base_color_1001.png",
    "aiStandardSurface110SG_Base_color_1001.png",
    "aiStandardSurface111SG_Base_color_10011.png",
    "aiStandardSurface112SG_Base_color_1001.png",
    "aiStandardSurface113SG_Base_color_1001.png",
    "aiStandardSurface115SG_Base_color_1001.png",
    "aiStandardSurface116SG_Base_color_1001.png",
    "Steer_new.png"
  ];

  let filesList: string[] = [];
  if (teamId === "mclaren") filesList = mclFiles;
  else if (teamId === "mercedes") filesList = merFiles;
  else if (teamId === "ferrari") filesList = ferFiles;
  else if (teamId === "redbull") filesList = rbrFiles;
  else if (teamId === "williams") filesList = wilFiles;
  else if (teamId === "alpine") filesList = alpFiles;
  else if (teamId === "aston") filesList = astFiles;
  else if (teamId === "haas") filesList = haasFiles;
  else if (teamId === "rb") filesList = rbFiles;
  else return null;

  if (fileIndex < filesList.length) {
    const file = filesList[fileIndex];
    return file || null;
  }
  return null;
}


// Configuration for team 3D models
const TEAM_MODELS: Record<
  string,
  {
    folder: string;
    filesCount: number;
    rotationX: number;
    rotationY: number;
    rotationZ?: number;
    rotateChassisOnly?: boolean;
    scaleOffset: number;
    bodyTexture: string;
    wheelsMeshIndices?: number[];
    chassisMeshIndices?: number[];
  }
> = {
  ferrari: {
    folder: "F1 2026 Ferrari SF-26",
    filesCount: 9,
    rotationX: 0, // Natively horizontal, no rotation needed
    rotationY: Math.PI, // 180 deg
    scaleOffset: 1.0,
    bodyTexture: "sf26_1.png",
  },
  mclaren: {
    folder: "F1 2025 McLaren MCL39",
    isGlb: true,
    glbFile: "mclaren_mcl60_f1_2023.glb",
    filesCount: 0,
    rotationX: 0, // Natively horizontal and right-side up, no X rotation needed
    rotationY: Math.PI, // Rotate 180 degrees around Y to face left
    rotationZ: 0,
    scaleOffset: 1.0,
    bodyTexture: "mclaren_new_body.png",
  },
  mercedes: {
    folder: "F1 2023 Mercedes W14",
    isGlb: true,
    glbFile: "Mercedes_W14.glb",
    filesCount: 0,
    rotationX: -Math.PI / 2,
    rotationY: 0,
    rotationZ: Math.PI, // Roll 180 degrees to flip right-side up
    scaleOffset: 1.0,
    bodyTexture: "",
  },
  redbull: {
    folder: "F1 2023 Red Bull Racing RB19",
    filesCount: 6,
    rotationX: Math.PI / 2, // Rotate +90 deg to keep right-side up
    rotationY: Math.PI,
    scaleOffset: 1.0,
    bodyTexture: "rb19_2.png",
  },
  williams: {
    folder: "F1 2025 Williams Racing FW47",
    isGlb: true,
    glbFile: "Williams_FW47.glb",
    filesCount: 0,
    rotationX: 0,
    rotationY: Math.PI,
    scaleOffset: 1.0,
    bodyTexture: "",
  },
  alpine: {
    folder: "F1 Alpine A-542 2024",
    filesCount: 12,
    rotationX: 0,
    rotationY: Math.PI,
    scaleOffset: 1.0,
    bodyTexture: "aiStandardSurface100SG_Base_color_1001.png",
  },
  aston: {
    folder: "F1 Aston Martin AMR-24 2024",
    filesCount: 14,
    rotationX: 0, // Natively horizontal, no rotation needed to lay flat
    rotationY: Math.PI,
    scaleOffset: 1.0,
    bodyTexture: "_aiStandardSurface93SG_Base_color_1001.png",
  },
  haas: {
    folder: "F1 HAAS VF-24 2024 (1)",
    filesCount: 13,
    rotationX: Math.PI / 2,
    rotationY: Math.PI,
    scaleOffset: 1.0,
    bodyTexture: "aiStandardSurface93_Base_color_1001.png",
  },
  rb: {
    folder: "F1 VCARB_01 2024",
    filesCount: 14,
    rotationX: Math.PI / 2,
    rotationY: Math.PI,
    scaleOffset: 1.0,
    bodyTexture: "aiStandardSurface115SG_Base_color_1001.png",
  },
};

export function ThreeCarCanvas({ teamId, driverNumber, mode, onLoadProgress, onLoaded, liveryMode = "dark", cameraPreset = "orbit" }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const speedRef = useRef<HTMLSpanElement>(null);
  const gearRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const rpmBarRef = useRef<HTMLDivElement>(null);
  const drsRef = useRef<HTMLDivElement>(null);

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing renderer...");

  const carGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 500;

    // --- 1. Three.js Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.015);

    // --- 2. Camera Setup ---
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    cameraRef.current = camera;
    // Initial camera position for "reveal" mode (far/side view) or "interactive" mode
    if (mode === "reveal") {
      camera.position.set(12, 6, 25);
    } else {
      camera.position.set(8, 3.5, 9);
    }

    // --- 3. Renderer Setup ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // --- 4. Controls ---
    let controls: OrbitControls | null = null;
    if (mode === "interactive") {
      controls = new OrbitControls(camera, renderer.domElement);
      controlsRef.current = controls;
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below ground
      controls.minDistance = 3.5;
      controls.maxDistance = 18;
      controls.target.set(0, 0.5, 0);
    }

    let scrollProgress = 0;
    let triggerInstance: any = null;
    if (mode === "scroll" && scrollContainerRef.current) {
      triggerInstance = ScrollTrigger.create({
        trigger: scrollContainerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          scrollProgress = self.progress;

          // Direct DOM updates for high performance
          const tRun = Math.max(0, (scrollProgress - 0.5) / 0.5);
          const currentSpeed = Math.round(tRun * 332);
          const currentGear = currentSpeed === 0 ? "N" : Math.max(1, Math.round(tRun * 8)).toString();

          if (speedRef.current) {
            speedRef.current.innerText = currentSpeed.toString();
          }
          if (gearRef.current) {
            gearRef.current.innerText = currentGear;
          }
          if (progressRef.current) {
            progressRef.current.style.width = `${scrollProgress * 100}%`;
          }
          if (rpmBarRef.current) {
            const rpmPct = currentSpeed === 0 ? 0 : 30 + tRun * 70;
            rpmBarRef.current.style.width = `${rpmPct}%`;
          }
          if (drsRef.current) {
            drsRef.current.style.opacity = currentSpeed > 280 ? "1" : "0";
          }
        }
      });
    }

    // --- 5. Lights ---
    // Soft ambient light to prevent pitch black areas
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    // Dynamic Team Colors
    const team = getTeam(teamId) || { color: "#ffffff", name: "Generic" };
    const teamColor = new THREE.Color(team.color);

    // Key Light (Soft directional light)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(10, 15, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    // Top Spotlight (Direct vertical downward spotlight to show true colors)
    const topSpotlight = new THREE.SpotLight(0xffffff, 12, 25, Math.PI / 3, 0.4, 1);
    topSpotlight.position.set(0, 8, 0);
    topSpotlight.castShadow = true;
    topSpotlight.shadow.mapSize.width = 1024;
    topSpotlight.shadow.mapSize.height = 1024;
    scene.add(topSpotlight);

    // Colored Neon Spotlights (Soft color accents from sides)
    const neonLightLeft = new THREE.SpotLight(teamColor, 5.0, 30, Math.PI / 4, 0.5, 1);
    neonLightLeft.position.set(-6, 3, 2);
    scene.add(neonLightLeft);

    const neonLightRight = new THREE.SpotLight(teamColor, 5.0, 30, Math.PI / 4, 0.5, 1);
    neonLightRight.position.set(6, 3, -2);
    scene.add(neonLightRight);

    // Ground glow light (accent under the car)
    const underglowLight = new THREE.PointLight(teamColor, 4, 8);
    underglowLight.position.set(0, 0.2, 0);
    scene.add(underglowLight);

    // --- 6. Hangar / Showroom Environment ---
    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x070707,
      roughness: 0.15,
      metalness: 0.9,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Neon telemetry grid on the floor
    const gridHelper = new THREE.GridHelper(40, 40, teamColor, 0x1a1a1a);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Glowing track lines (cylinder loop)
    const trackGeo = new THREE.RingGeometry(8, 8.1, 64);
    const trackMat = new THREE.MeshBasicMaterial({
      color: teamColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const trackRing = new THREE.Mesh(trackGeo, trackMat);
    trackRing.rotation.x = Math.PI / 2;
    trackRing.position.y = 0.02;
    scene.add(trackRing);

    // Floating particles (dust in showroom)
    const particleCount = 150;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20; // x
      positions[i + 1] = Math.random() * 8;      // y
      positions[i + 2] = (Math.random() - 0.5) * 20; // z
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: teamColor,
      size: 0.06,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- 7. Model Loading or Procedural Fallback ---
    const carGroup = new THREE.Group();
    scene.add(carGroup);
    carGroupRef.current = carGroup;

    // References for wheel objects to animate spinning
    const wheels: THREE.Object3D[] = [];

    // Check if we have a model configuration for the team, else use fallback
    const modelConfig = TEAM_MODELS[teamId] || TEAM_MODELS["ferrari"]; // Fallback to ferrari geometry, painted with team color
    const isFallbackLivery = !TEAM_MODELS[teamId];

    const manager = new THREE.LoadingManager();
    const objLoader = new OBJLoader(manager);
    const textureLoader = new THREE.TextureLoader(manager);

    manager.onProgress = (_, itemsLoaded, itemsTotal) => {
      const pct = Math.round((itemsLoaded / itemsTotal) * 100);
      setLoadingProgress(pct);
      onLoadProgress?.(pct);
      setLoadingText(`Synchronizing telemetry... ${pct}%`);
    };

    manager.onLoad = () => {
      // Sizing, scaling and loading state are handled synchronously below inside loadTeamModel
    };

    manager.onError = (url) => {
      console.warn(`[ThreeCarCanvas] Asset warning: ${url}`);
    };

    // Load actual OBJ model
    const loadTeamModel = async () => {
      try {
        setLoadingText("Initializing 3D viewport...");
        
        // Build path base
        const folderPath = `/3d-models/${modelConfig.folder}`;
        
        // 1. Preload textures
        let mainTexture: THREE.Texture | null = null;
        let tyreWallTex: THREE.Texture | null = null;
        
        if (!isFallbackLivery && modelConfig.bodyTexture) {
          try {
            mainTexture = textureLoader.load(`${folderPath}/${modelConfig.bodyTexture}`);
            mainTexture.colorSpace = THREE.SRGBColorSpace;
          } catch (e) {
            console.warn("Failed to load body texture, using custom paint", e);
          }
        }

        try {
          tyreWallTex = textureLoader.load(`/3d-models/F1 2026 Ferrari SF-26/tyrewall.png`);
        } catch (e) {
          // ignore
        }

        // Define generic custom materials for high-tech showroom look
        const carbonMaterial = new THREE.MeshStandardMaterial({
          color: 0x1e1e1e,
          roughness: 0.65,
          metalness: 0.2,
        });

        const chromeMaterial = new THREE.MeshStandardMaterial({
          color: 0xcccccc,
          roughness: 0.2,
          metalness: 0.6,
        });

        const tyreMaterial = new THREE.MeshStandardMaterial({
          color: 0x1c1c1c,
          roughness: 0.85,
          metalness: 0.05,
        });

        const teamPaintMaterial = new THREE.MeshStandardMaterial({
          color: teamColor,
          roughness: 0.3,
          metalness: 0.35,
        });

        // McLaren-specific procedural materials (papaya orange + carbon black)
        const mclarenOrangeMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#FF8700"),
          roughness: 0.25,
          metalness: 0.45,
          envMapIntensity: 1.2,
        });
        const mclarenCarbonMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#0A0A0A"),
          roughness: 0.4,
          metalness: 0.5,
        });
        const mclarenTealMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#0085A1"),
          roughness: 0.3,
          metalness: 0.4,
        });

        const glowMaterial = new THREE.MeshStandardMaterial({
          color: teamColor,
          emissive: teamColor,
          emissiveIntensity: 3.5,
          roughness: 0.1,
        });

        // Check if loading GLB or OBJ
        let groups: THREE.Group[] = [];
        if ((modelConfig as any).isGlb) {
          setLoadingText("Loading telemetry model...");
          const glbPath = `${folderPath}/${(modelConfig as any).glbFile}`;
          const gltfLoader = new GLTFLoader(manager);
          
          const gltf = await new Promise<any>((resolve, reject) => {
            gltfLoader.load(
              glbPath,
              (data) => resolve(data),
              undefined,
              (err) => reject(err)
            );
          });
          
          // Traverse and classify meshes
          gltf.scene.traverse((node: any) => {
            if (node instanceof THREE.Mesh) {
              node.castShadow = true;
              node.receiveShadow = true;
              node.geometry.computeVertexNormals();
              
              if (node.material) {
                const mat = node.material as THREE.MeshStandardMaterial;
                node.userData.originalMap = mat.map;
                node.userData.originalColor = mat.color ? mat.color.clone() : new THREE.Color("#ffffff");
                node.userData.originalRoughness = mat.roughness;
                node.userData.originalMetalness = mat.metalness;
              }
            }
          });
          
          gltf.scene.rotation.x = modelConfig.rotationX;
          gltf.scene.rotation.y = modelConfig.rotationY;
          gltf.scene.rotation.z = modelConfig.rotationZ || 0;
          
          carGroup.add(gltf.scene);
        } else {
          // 2. Load all OBJ parts
          const loadPromises = [];
          for (let i = 0; i < modelConfig.filesCount; i++) {
            const objPath = `${folderPath}/model_${i}.obj`;
            loadPromises.push(
              new Promise<THREE.Group>((resolve, reject) => {
                objLoader.load(
                  objPath,
                  (obj) => {
                    obj.name = `model_${i}`;
                    resolve(obj);
                  },
                  undefined,
                  (err) => reject(err)
                );
              })
            );
          }

          groups = await Promise.all(loadPromises);

          // 1. Add groups and apply default rotations (selectively if rotateChassisOnly is set)
          groups.forEach((group) => {
            let shouldRotate = true;
            if (modelConfig.rotateChassisOnly) {
              let isWheelGroup = false;
              group.traverse((node) => {
                if (node instanceof THREE.Mesh) {
                  const matName = node.material.name || "";
                  const isWheelMaterial = matName.toLowerCase().includes("tyre") ||
                                          matName.toLowerCase().includes("wheel") ||
                                          matName.toLowerCase().includes("tread") ||
                                          matName.toLowerCase().includes("rim");
                  if (isWheelMaterial) {
                    isWheelGroup = true;
                  }
                }
              });
              if (isWheelGroup) {
                shouldRotate = false;
              }
            }

            if (shouldRotate) {
              group.rotation.x = modelConfig.rotationX;
              group.rotation.y = modelConfig.rotationY;
              group.rotation.z = modelConfig.rotationZ || 0;
            } else {
              // Keep wheels flat and facing correct direction
              group.rotation.x = 0;
              group.rotation.y = 0;
              group.rotation.z = 0;
            }
            carGroup.add(group);
          });
        }

        // Force matrix update so spatial bounding boxes evaluate in rotated space
        carGroup.updateMatrixWorld(true);

        console.log("[ThreeCarCanvas] Loaded parts count:", (modelConfig as any).isGlb ? 1 : groups.length);
        console.log("[ThreeCarCanvas] CarGroup children count:", carGroup.children.length);

        // 2. Traverse and classify meshes now that they are rotated
        carGroup.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.castShadow = true;
            node.receiveShadow = true;

            // Ensure normals are computed correctly
            node.geometry.computeVertexNormals();

            // Evaluate bounding box in rotated space
            const boundingBox = new THREE.Box3().setFromObject(node);
            const center = boundingBox.getCenter(new THREE.Vector3());
            const size = boundingBox.getSize(new THREE.Vector3());

            // A flat ground plane in rotated space has y size < 0.15 and large horizontal sizes
            const isGround = size.y < 0.15 && (size.x > 5.0 || size.z > 5.0);

            if ((modelConfig as any).isGlb && !isGround) {
              // For GLB models, preserve all native textures and materials
              node.userData.fileIndex = -1; // Flag as GLB
              return;
            }

            const absX = Math.abs(center.x);
            // Positional wheel/rim/suspension detection (generic across all F1 models)
            const isPositionalWheel = absX > 0.5 && (
              (size.x < 0.5 && size.z > 0.25) ||
              (size.y > 0.3 && size.z > 0.3)
            );
            const isPositionalRim = absX > 0.5 && size.x < 0.15 && size.z < 0.4;
            const isSuspension = size.x < 0.15 && size.y < 0.15 && absX > 0.2;

            // Extract the model file index from node name or parent name
            let fileIndex = -1;
            let currentNode: THREE.Object3D | null = node;
            while (currentNode) {
              const match = currentNode.name.match(/model_(\d+)/);
              if (match) {
                fileIndex = parseInt(match[1]);
                break;
              }
              currentNode = currentNode.parent;
            }

            // Get texture from folder if it matches material name
            const matName = node.material.name || "";
            let texFile = getTextureFileForMaterial(matName, isFallbackLivery ? "ferrari" : teamId);

            // Fallback to fileIndex lookup if matName was empty or didn't resolve
            if (!texFile && fileIndex >= 0) {
              texFile = getTextureByFileIndex(fileIndex, isFallbackLivery ? "ferrari" : teamId);
            }

            console.log(`[ThreeCarCanvas Traverse] Node: "${node.name}", Mat: "${matName}", FileIndex: ${fileIndex}, Resolved Tex: "${texFile}"`);
            
            const isWheelMaterial = matName.toLowerCase().includes("tyre") ||
                                    matName.toLowerCase().includes("wheel") ||
                                    matName.toLowerCase().includes("tread") ||
                                    matName.toLowerCase().includes("rim") ||
                                    (texFile && (texFile.toLowerCase().includes("tyre") || texFile.toLowerCase().includes("tread") || texFile.toLowerCase().includes("tire") || texFile.toLowerCase().includes("rim")));

            if (isGround) {
              // Soft transparent ground shadow overlay
              node.material = new THREE.MeshStandardMaterial({
                color: 0x050505,
                roughness: 0.8,
                metalness: 0.0,
                transparent: true,
                opacity: 0.6,
              });
            } else {
              // Determine texture path
              let texPath = "";
              let isTireTexture = false;

            // McLaren: use native OBJ UVs + combined livery sheet with RepeatWrapping
            if (teamId === "mclaren" && !isGround) {
              // Store the fileIndex in userData for later traversal/updates
              node.userData.fileIndex = fileIndex;

              if (isWheelMaterial || isPositionalWheel || fileIndex === 3 || fileIndex === 12) {
                node.material = tyreMaterial;
                node.userData.isWheel = true;
              } else if (isPositionalRim || fileIndex === 16 || fileIndex === 17 || fileIndex === 22) {
                node.material = chromeMaterial;
                node.userData.isRim = true;
              } else if (fileIndex === 20 || fileIndex === 21 || fileIndex === 15) {
                node.material = carbonMaterial;
              } else if (mainTexture) {
                // Use native OBJ UVs — the McLaren asset was UV-unwrapped to match this sheet
                mainTexture.wrapS = THREE.RepeatWrapping;
                mainTexture.wrapT = THREE.RepeatWrapping;
                mainTexture.needsUpdate = true;
                
                const mat = new THREE.MeshStandardMaterial({
                  map: mainTexture,
                  roughness: 0.28,
                  metalness: 0.42,
                });
                node.material = mat;
                // Store the original texture map so we can restore it in Dark/Black modes
                node.userData.originalMap = mainTexture;
              } else {
                node.material = mclarenOrangeMaterial;
              }
              return;
            }


            if (isGround) {
              node.material = new THREE.MeshStandardMaterial({
                color: 0x050505,
                roughness: 0.8,
                metalness: 0.0,
                transparent: true,
                opacity: 0.6,
              });
            } else if (isWheelMaterial || isPositionalWheel) {
              node.material = tyreMaterial;
              node.userData.isWheel = true;
            } else if (isPositionalRim) {
              node.material = chromeMaterial;
              node.userData.isRim = true;
            } else if (isSuspension) {
              node.material = carbonMaterial;
            } else if (node.name.toLowerCase().includes("glow") || node.name.toLowerCase().includes("led")) {
              node.material = glowMaterial;
            } else {
              // Apply texture mapping
              if (texFile && (!isFallbackLivery || isWheelMaterial)) {
                texPath = `/3d-models/${modelConfig.folder}/${texFile}`;
              } else if (isWheelMaterial) {
                const nameLower = matName.toLowerCase();
                if (nameLower.includes("tyrewall")) {
                  texPath = "/3d-models/tyrewall.png";
                } else if (nameLower.includes("tread") || nameLower.includes("tyre") || nameLower.includes("tire")) {
                  texPath = "/3d-models/tyre.png";
                } else if (nameLower.includes("rim") || nameLower.includes("wheel")) {
                  texPath = "/3d-models/rim.png";
                }
              }

              if (texPath) {
                try {
                  const texture = textureLoader.load(texPath);
                  texture.colorSpace = THREE.SRGBColorSpace;
                  texture.wrapS = THREE.RepeatWrapping;
                  texture.wrapT = THREE.RepeatWrapping;
                  
                  node.material = new THREE.MeshStandardMaterial({
                    map: texture,
                    roughness: 0.45,
                    metalness: 0.25,
                  });
                } catch (e) {
                  node.material = teamPaintMaterial;
                }
              } else {
                if (mainTexture && !isFallbackLivery) {
                  node.material = new THREE.MeshStandardMaterial({
                    map: mainTexture,
                    roughness: 0.45,
                    metalness: 0.15,
                  });
                } else {
                  node.material = teamPaintMaterial;
                }
              }
            }
            }
          }
        });

        // 3. Compute overall bounding box (excluding flat ground planes)
        const box = new THREE.Box3();
        let hasValidMesh = false;

        carGroup.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            const meshBox = new THREE.Box3().setFromObject(node);
            const meshSize = meshBox.getSize(new THREE.Vector3());
            const isGroundPlane = meshSize.y < 0.15 && (meshSize.x > 5.0 || meshSize.z > 5.0);

            if (!isGroundPlane) {
              box.expandByObject(node);
              hasValidMesh = true;
            }
          }
        });

        if (!hasValidMesh) {
          console.warn("[ThreeCarCanvas] No valid car meshes found for bounding box, using carGroup");
          box.setFromObject(carGroup);
        }

        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        console.log(`[ThreeCarCanvas] Bounding box min: x=${box.min.x.toFixed(2)}, y=${box.min.y.toFixed(2)}, z=${box.min.z.toFixed(2)}`);
        console.log(`[ThreeCarCanvas] Bounding box max: x=${box.max.x.toFixed(2)}, y=${box.max.y.toFixed(2)}, z=${box.max.z.toFixed(2)}`);
        console.log(`[ThreeCarCanvas] Calculated car center: x=${center.x.toFixed(2)}, y=${center.y.toFixed(2)}, z=${center.z.toFixed(2)}`);
        console.log(`[ThreeCarCanvas] Calculated car size: x=${size.x.toFixed(2)}, y=${size.y.toFixed(2)}, z=${size.z.toFixed(2)}`);

        // Center the carGroup contents
        carGroup.children.forEach((child) => {
          child.position.sub(center);
        });

        // Scale to consistent size (length around 6.5 units)
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetLength = 6.5;
        const scale = targetLength / (maxDim || 1);
        console.log(`[ThreeCarCanvas] Computed scale factor: ${scale.toFixed(4)}`);
        
        // 1. Set full scale first so spatial bounding boxes evaluate correctly
        carGroup.scale.setScalar(scale);
        carGroup.updateMatrixWorld(true);

        // 2. Adjust height so wheels rest on the floor (evaluated at full scale)
        const adjustedBox = new THREE.Box3();
        carGroup.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            const meshBox = new THREE.Box3().setFromObject(node);
            const meshSize = meshBox.getSize(new THREE.Vector3());
            const isGroundPlane = meshSize.y < 0.15 && (meshSize.x > 5.0 || meshSize.z > 5.0);
            if (!isGroundPlane) {
              adjustedBox.expandByObject(node);
            }
          }
        });
        
        if (adjustedBox.min.y !== Infinity) {
          carGroup.position.y = -adjustedBox.min.y;
          console.log(`[ThreeCarCanvas] Adjusting Y position to: ${carGroup.position.y.toFixed(2)}`);
        } else {
          carGroup.position.y = 0;
        }

        // 3. NOW trigger dynamic scale reveal using GSAP
        carGroup.scale.set(0, 0, 0);
        gsap.to(carGroup.scale, {
          x: scale,
          y: scale,
          z: scale,
          duration: 1.2,
          ease: "power2.out",
        });

        // Force final update for the start of the animation
        carGroup.updateMatrixWorld(true);

        // Identify wheel meshes by position to animate rotation
        carGroup.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            const localCenter = new THREE.Box3().setFromObject(node).getCenter(new THREE.Vector3());
            // Wheels are placed at the outer corners
            if (Math.abs(localCenter.x) > 0.4 && Math.abs(localCenter.z) > 0.8) {
              wheels.push(node);
            }
          }
        });

        if (teamId === "mclaren") {
          applyMcLarenLivery(carGroup, liveryMode);
        }

        setLoadingProgress(100);
        onLoadProgress?.(100);
        onLoaded?.();

      } catch (error) {
        console.error("Failed loading OBJ files, using high-tech procedural car", error);
        buildProceduralCar();
      }
    };

    loadTeamModel();

    // --- 8. Fallback Procedural F1 Car Creation ---
    function buildProceduralCar() {
      // Clear carGroup
      while (carGroup.children.length > 0) {
        carGroup.remove(carGroup.children[0]);
      }

      const bodyMat = new THREE.MeshStandardMaterial({
        color: teamColor,
        roughness: 0.2,
        metalness: 0.8,
      });

      const wingMat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.5,
        metalness: 0.9,
      });

      const wheelMat = new THREE.MeshStandardMaterial({
        color: 0x191919,
        roughness: 0.7,
      });

      const cockpitMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        roughness: 0.1,
      });

      // Chassis Tub
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 3.8), bodyMat);
      chassis.position.y = 0.3;
      chassis.castShadow = true;
      chassis.receiveShadow = true;
      carGroup.add(chassis);

      // Nose cone
      const nose = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 1.2), bodyMat);
      nose.position.set(0, 0.25, 2.2);
      nose.castShadow = true;
      carGroup.add(nose);

      // Cockpit cutout
      const cockpit = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.3, 0.9), cockpitMat);
      cockpit.position.set(0, 0.45, -0.2);
      carGroup.add(cockpit);

      // Halo Safety Ring
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 8, 24, Math.PI), bodyMat);
      halo.rotation.x = -Math.PI / 6;
      halo.position.set(0, 0.55, 0.25);
      carGroup.add(halo);

      // Front Wing
      const frontWingMain = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.4), wingMat);
      frontWingMain.position.set(0, 0.12, 2.7);
      frontWingMain.castShadow = true;
      carGroup.add(frontWingMain);

      const fWingEndplateL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.25, 0.45), bodyMat);
      fWingEndplateL.position.set(-1.2, 0.2, 2.7);
      carGroup.add(fWingEndplateL);

      const fWingEndplateR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.25, 0.45), bodyMat);
      fWingEndplateR.position.set(1.2, 0.2, 2.7);
      carGroup.add(fWingEndplateR);

      // Rear Wing Endplates
      const rWingEndplateL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.8, 0.6), bodyMat);
      rWingEndplateL.position.set(-0.6, 0.7, -1.9);
      carGroup.add(rWingEndplateL);

      const rWingEndplateR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.8, 0.6), bodyMat);
      rWingEndplateR.position.set(0.6, 0.7, -1.9);
      carGroup.add(rWingEndplateR);

      // Rear Wing Flaps
      const rearWingMain = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.45), wingMat);
      rearWingMain.position.set(0, 0.9, -1.9);
      rearWingMain.castShadow = true;
      carGroup.add(rearWingMain);

      // 4 Wheels
      const tireGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.45, 24);
      tireGeo.rotateZ(Math.PI / 2); // align sideways
      
      const wheelsData = [
        { x: -0.85, z: 1.4, name: "wheel_fl" },
        { x: 0.85, z: 1.4, name: "wheel_fr" },
        { x: -0.88, z: -1.2, name: "wheel_rl" },
        { x: 0.88, z: -1.2, name: "wheel_rr" },
      ];

      wheelsData.forEach((w) => {
        const wheel = new THREE.Mesh(tireGeo, wheelMat);
        wheel.position.set(w.x, 0.48, w.z);
        wheel.castShadow = true;
        carGroup.add(wheel);
        wheels.push(wheel);

        // Suspension linkages
        const link = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8), wingMat);
        link.rotation.z = Math.PI / 2;
        link.position.set(w.x / 2, 0.48, w.z);
        carGroup.add(link);
      });

      // Sidepods
      const sidepodL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.42, 1.6), bodyMat);
      sidepodL.position.set(-0.55, 0.3, 0.2);
      sidepodL.castShadow = true;
      carGroup.add(sidepodL);

      const sidepodR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.42, 1.6), bodyMat);
      sidepodR.position.set(0.55, 0.3, 0.2);
      sidepodR.castShadow = true;
      carGroup.add(sidepodR);

      // Scale procedural car to the exact same target length of 6.5 units
      carGroup.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(carGroup);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const targetLength = 6.5;
      const scale = targetLength / (maxDim || 1);
      carGroup.scale.setScalar(scale);

      // Center and align Y
      carGroup.updateMatrixWorld(true);
      const adjustedBox = new THREE.Box3().setFromObject(carGroup);
      carGroup.position.y = -adjustedBox.min.y;

      setLoadingProgress(100);
      onLoadProgress?.(100);
      onLoaded?.();
    };



    // --- 9. Reveal Cinematic Animation Control ---
    let animTime = 0;
    const revealDuration = 4000; // ms
    const startTime = Date.now();

    // --- 10. Animation Loop ---
    let frameId = 0;
    
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const elapsed = Date.now() - startTime;

      // Spin wheels and particles based on mode
      if (mode === "reveal") {
        particles.rotation.y += 0.0005;
        particles.rotation.x += 0.0002;

        const progress = Math.min(elapsed / 3000, 1); // sweep for 3 seconds
        const ease = 1 - Math.pow(1 - progress, 3); // cubic ease out

        const startPos = new THREE.Vector3(12, 5, 18);
        const endPos = new THREE.Vector3(5.5, 1.4, 6.5);
        camera.position.lerpVectors(startPos, endPos, ease);
        camera.lookAt(0, 0.4, 0);

        carGroup.rotation.y = (1 - ease) * -Math.PI / 4;

        const speed = Math.max(0, 1 - elapsed / revealDuration);
        wheels.forEach((w) => {
          w.rotation.x += speed * 0.4;
        });
      } 
      else if (mode === "scroll") {
        // Particles move backwards relative to velocity in Phase 3
        particles.rotation.y += 0.0002;
        particles.rotation.x += 0.0001;

        if (scrollProgress < 0.2) {
          // Phase 1: Intro / Standby (Static slanted view)
          const startPos = new THREE.Vector3(5.5, 1.4, 6.5);
          camera.position.copy(startPos);
          camera.lookAt(0, 0.4, 0);
          carGroup.rotation.y = -Math.PI / 4;
          
          wheels.forEach((w) => {
            w.rotation.x += 0.002;
          });
        } 
        else if (scrollProgress >= 0.2 && scrollProgress < 0.5) {
          // Phase 2: Orbit transition
          const tOrbit = (scrollProgress - 0.2) / 0.3;
          const easeOrbit = 1 - Math.pow(1 - tOrbit, 3); // cubic ease out

          const startPos = new THREE.Vector3(5.5, 1.4, 6.5);
          const endPos = new THREE.Vector3(0.0, 1.2, 8.5); // side view
          camera.position.lerpVectors(startPos, endPos, easeOrbit);
          camera.lookAt(0, 0.4, 0);

          const startRot = -Math.PI / 4;
          const endRot = Math.PI / 2; // Sideways horizontal X-axis view
          carGroup.rotation.y = startRot + (endRot - startRot) * easeOrbit;

          wheels.forEach((w) => {
            w.rotation.x += easeOrbit * 0.05;
          });
        } 
        else {
          // Phase 3: Track run!
          const tRun = (scrollProgress - 0.5) / 0.5;
          
          camera.position.set(0.0, 1.2, 8.5);
          camera.lookAt(0, 0.4, 0);
          carGroup.rotation.y = Math.PI / 2;

          // Slide floor grid backwards
          const gridSpeed = tRun * 120;
          gridHelper.position.z = (gridSpeed) % 1; // Seamless 1-unit spacing wrap

          // Translate particles backwards
          const particleSpeed = tRun * 40;
          particles.position.z = -(particleSpeed) % 20;

          // Spin wheels proportional to velocity
          wheels.forEach((w) => {
            w.rotation.x += tRun * 0.35;
          });
        }
      } 
      else if (mode === "rotate") {
        particles.rotation.y += 0.0003;
        particles.rotation.x += 0.0001;

        const time = Date.now() * 0.0003;
        const radius = 7.5;
        camera.position.x = Math.sin(time) * radius;
        camera.position.z = Math.cos(time) * radius;
        camera.position.y = 1.8 + Math.sin(time * 0.5) * 0.6;
        camera.lookAt(0, 0.4, 0);

        wheels.forEach((w) => {
          w.rotation.x += 0.005;
        });
      }
      else {
        // Interactive mode
        particles.rotation.y += 0.0005;
        particles.rotation.x += 0.0002;

        if (controls) {
          controls.update();
        } else {
          camera.lookAt(0, 0.4, 0);
        }
        carGroup.rotation.y += 0.002;

        wheels.forEach((w) => {
          w.rotation.x += 0.01;
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // --- 11. Window Resize Handler ---
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (triggerInstance) {
        triggerInstance.kill();
      }
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [teamId, mode]);

  // Dynamic livery mode update for McLaren
  useEffect(() => {
    if (carGroupRef.current && teamId === "mclaren") {
      applyMcLarenLivery(carGroupRef.current, liveryMode);
    }
  }, [liveryMode, teamId]);

  // Dynamic camera angle / preset handler with GSAP transitions
  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera) return;

    if (controls) controls.enabled = false;

    let targetPos = new THREE.Vector3();
    let targetLookAt = new THREE.Vector3(0, 0.4, 0);

    if (cameraPreset === "top") {
      targetPos.set(0, 9.5, 0.01);
      targetLookAt.set(0, 0.3, 0);
    } else if (cameraPreset === "side") {
      targetPos.set(0.0, 1.2, 8.5);
      targetLookAt.set(0, 0.4, 0);
    } else if (cameraPreset === "detail-sidepod") {
      targetPos.set(3.2, 1.4, 1.8);
      targetLookAt.set(0, 0.5, 0.3);
    } else if (cameraPreset === "detail-nose") {
      targetPos.set(2.2, 0.8, 3.8);
      targetLookAt.set(0, 0.3, 2.3);
    } else if (cameraPreset === "detail-wing") {
      targetPos.set(-2.2, 1.6, -3.2);
      targetLookAt.set(0, 0.7, -2.1);
    } else {
      // Orbit/default
      targetPos.set(8, 3.5, 9);
      targetLookAt.set(0, 0.5, 0);
    }

    gsap.to(camera.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => {
        if (!controls) {
          camera.lookAt(targetLookAt);
        }
      }
    });

    if (controls) {
      gsap.to(controls.target, {
        x: targetLookAt.x,
        y: targetLookAt.y,
        z: targetLookAt.z,
        duration: 1.5,
        ease: "power2.inOut",
        onComplete: () => {
          controls.enabled = true;
        }
      });
    }
  }, [cameraPreset]);

  const renderCanvas = () => (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
      {/* Three.js canvas container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Loading Overlay */}
      {loadingProgress < 100 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md z-10 px-6">
          <div className="w-full max-w-md">
            {/* High-tech Timing Bar style loader */}
            <div className="flex justify-between items-center mb-2 font-display text-[10px] uppercase tracking-widest text-ink-muted">
              <span>{loadingText}</span>
              <span className="tabular">{loadingProgress}%</span>
            </div>
            <div className="h-1 bg-surface-card w-full overflow-hidden border border-hairline relative">
              <div
                className="h-full bg-white transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            {/* Retro UI hints */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="h-0.5 bg-hairline animate-pulse" />
              <div className="h-0.5 bg-hairline animate-pulse delay-75" />
              <div className="h-0.5 bg-hairline animate-pulse delay-150" />
            </div>
          </div>
        </div>
      )}

      {/* Futuristic Telemetry HUD overlays */}
      {loadingProgress === 100 && (
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 select-none z-10">
          {/* Top HUD */}
          <div className="flex justify-between items-start">
            <div className="border-l-2 border-white/50 pl-3">
              <div className="text-[10px] tracking-widest text-ink-muted uppercase">// TELEMETRY ACTIVE</div>
              <div className="text-sm font-bold text-white uppercase tracking-tight">
                {getTeam(teamId)?.name || teamId} SHOWROOM
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] tracking-widest text-ink-muted uppercase">SYS.STATUS</div>
              <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest">ONLINE</div>
            </div>
          </div>

          {/* Bottom HUD */}
          <div className="flex justify-between items-end">
            <div className="text-left font-mono text-[9px] text-ink-muted leading-tight">
              <div>CAM_MODE: {mode.toUpperCase()}</div>
              <div>FOV: 40deg // DEPTH: 100m</div>
              <div>GRID_REF: {teamId.substring(0, 3).toUpperCase()}_026</div>
            </div>
            {driverNumber && (
              <div className="border border-white/20 px-3 py-1 bg-black/40 backdrop-blur-sm flex items-center gap-2">
                <span className="text-[9px] text-ink-muted uppercase tracking-wider">NO.</span>
                <span className="text-sm font-bold text-white tabular font-mono">#{driverNumber}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (mode === "scroll") {
    return (
      <div ref={scrollContainerRef} className="relative w-full h-[220vh] bg-black">
        {/* Sticky viewport */}
        <div className="sticky top-0 w-full h-screen overflow-hidden">
          {renderCanvas()}

          {/* Scrolling HUD details overlay */}
          {loadingProgress === 100 && (
            <div className="pointer-events-none absolute inset-x-0 bottom-12 flex flex-col items-center justify-center select-none z-20 px-6">
              <div className="w-full max-w-4xl bg-black/60 border border-hairline-strong p-6 backdrop-blur-md flex justify-between items-center flex-wrap gap-6">
                
                {/* Speed Telemetry */}
                <div className="flex items-baseline gap-2">
                  <span ref={speedRef} className="tabular text-6xl sm:text-7xl font-bold text-white font-mono">0</span>
                  <span className="text-xs text-ink-muted font-mono">KM/H</span>
                </div>

                {/* RPM Bar */}
                <div className="flex-1 max-w-md hidden md:block">
                  <div className="flex justify-between items-center text-[9px] uppercase tracking-wider text-ink-muted mb-2 font-mono">
                    <span>Engine RPM</span>
                    <span ref={drsRef} className="text-emerald-400 font-bold opacity-0 transition-opacity font-mono">DRS ACTIVE</span>
                  </div>
                  <div className="h-2 bg-surface-card border border-hairline relative overflow-hidden">
                    <div ref={rpmBarRef} className="h-full bg-red-600 w-0 transition-[width] duration-75" />
                  </div>
                </div>

                {/* Gear indicator */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-ink-muted uppercase tracking-wider font-mono">GEAR</span>
                  <span ref={gearRef} className="text-5xl font-bold text-white font-mono">N</span>
                </div>

                {/* Active Lap progress bar */}
                <div className="w-full h-0.5 bg-hairline relative">
                  <div ref={progressRef} className="h-full bg-white w-0" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[300px] flex items-center justify-center bg-black overflow-hidden border border-hairline">
      {renderCanvas()}
    </div>
  );
}

function applyMcLarenLivery(carGroup: THREE.Group, liveryMode: "dark" | "black" | "teal" | "white") {
  carGroup.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      const mat = node.material as THREE.MeshStandardMaterial;
      if (!mat) return;

      const nameLower = node.name.toLowerCase();
      const fileIndex = node.userData.fileIndex;
      const originalMap = node.userData.originalMap;

      // Classify component
      let isBody = false;
      let isFrontWing = false;
      let isRearWing = false;
      let isHalo = false;
      let isMirror = false;
      let isWheelCover = false;
      let isRim = false;
      let isSuspension = false;
      let isFloor = false;

      // 1. Classify by fileIndex (for OBJ models)
      if (fileIndex !== undefined && fileIndex >= 0) {
        isBody = (fileIndex === 10);
        isFrontWing = (fileIndex === 6 || fileIndex === 7);
        isHalo = (fileIndex === 8);
        isRearWing = (fileIndex === 14);
        isMirror = (fileIndex === 11);
        isWheelCover = (fileIndex === 4 || fileIndex === 13);
        isRim = (fileIndex === 16 || fileIndex === 17 || fileIndex === 22);
        isSuspension = (fileIndex === 15 || fileIndex === 21);
        isFloor = (fileIndex === 20);
      } 
      // 2. Classify by node name (for GLB models)
      else {
        if (nameLower.includes("tire") || nameLower.includes("tyre") || nameLower.includes("tread")) {
          // Keep tire material
          return;
        }
        isRim = (nameLower.includes("rim") || nameLower.includes("wheel") || nameLower.includes("nut") || nameLower.includes("screw")) && !nameLower.includes("steer") && !nameLower.includes("stwheel") && !nameLower.includes("cover");
        isWheelCover = nameLower.includes("cover") || nameLower.includes("windlet");
        isHalo = nameLower.includes("halo");
        isMirror = nameLower.includes("mirror");
        isFrontWing = nameLower.includes("front_wing") || nameLower.includes("f_wing") || (nameLower.includes("wing") && nameLower.includes("front"));
        isRearWing = nameLower.includes("rear_wing") || nameLower.includes("r_wing") || (nameLower.includes("wing") && nameLower.includes("rear"));
        isSuspension = nameLower.includes("suspension") || nameLower.includes("arm") || nameLower.includes("link");
        isFloor = nameLower.includes("floor") || nameLower.includes("underbody") || nameLower.includes("diffuser");
        
        // If not matched, check if it's the main body/chassis
        if (!isRim && !isWheelCover && !isHalo && !isMirror && !isFrontWing && !isRearWing && !isSuspension && !isFloor) {
          isBody = nameLower.includes("body") || nameLower.includes("chassis") || nameLower.includes("car") || nameLower.includes("tub") || nameLower.includes("nose") || nameLower.includes("sidepod");
        }
      }

      const orange = new THREE.Color("#FF8700");
      const teal = new THREE.Color("#00B5A1");
      const black = new THREE.Color("#0A0A0A");
      const white = new THREE.Color("#FFFFFF");

      if (isBody) {
        if (liveryMode === "dark") {
          mat.map = originalMap || null;
          mat.color.set("#ffffff");
          mat.roughness = node.userData.originalRoughness !== undefined ? node.userData.originalRoughness : 0.28;
          mat.metalness = node.userData.originalMetalness !== undefined ? node.userData.originalMetalness : 0.42;
        } else if (liveryMode === "black") {
          mat.map = originalMap || null;
          mat.color.set("#151515");
          mat.roughness = 0.45;
          mat.metalness = 0.55;
        } else if (liveryMode === "teal") {
          mat.map = null;
          mat.color.copy(teal);
          mat.roughness = 0.2;
          mat.metalness = 0.6;
        } else if (liveryMode === "white") {
          mat.map = null;
          mat.color.copy(white);
          mat.roughness = 0.15;
          mat.metalness = 0.3;
        }
      } 
      else if (isFrontWing) {
        if (liveryMode === "dark") {
          mat.map = originalMap || null;
          mat.color.set("#ffffff");
          mat.roughness = 0.3;
          mat.metalness = 0.35;
        } else if (liveryMode === "black") {
          mat.map = null;
          mat.color.copy(black);
          mat.roughness = 0.5;
          mat.metalness = 0.4;
        } else if (liveryMode === "teal") {
          mat.map = null;
          mat.color.copy(teal);
          mat.roughness = 0.25;
          mat.metalness = 0.5;
        } else if (liveryMode === "white") {
          mat.map = null;
          mat.color.copy(white);
          mat.roughness = 0.2;
          mat.metalness = 0.3;
        }
      }
      else if (isHalo) {
        if (liveryMode === "dark") {
          mat.map = originalMap || null;
          mat.color.set("#ffffff");
          mat.roughness = 0.3;
        } else if (liveryMode === "black") {
          mat.map = null;
          mat.color.copy(black);
          mat.roughness = 0.5;
        } else if (liveryMode === "teal") {
          mat.map = null;
          mat.color.copy(teal);
          mat.roughness = 0.25;
        } else if (liveryMode === "white") {
          mat.map = null;
          mat.color.copy(white);
          mat.roughness = 0.2;
        }
      }
      else if (isRearWing) {
        if (liveryMode === "dark") {
          mat.map = originalMap || null;
          mat.color.set("#ffffff");
          mat.roughness = 0.3;
        } else if (liveryMode === "black") {
          mat.map = null;
          mat.color.copy(black);
          mat.roughness = 0.5;
        } else if (liveryMode === "teal") {
          mat.map = null;
          mat.color.copy(teal);
          mat.roughness = 0.25;
        } else if (liveryMode === "white") {
          mat.map = null;
          mat.color.copy(white);
          mat.roughness = 0.2;
        }
      }
      else if (isMirror) {
        if (liveryMode === "dark") {
          mat.map = originalMap || null;
          mat.color.copy(orange);
        } else if (liveryMode === "black") {
          mat.map = null;
          mat.color.copy(black);
        } else if (liveryMode === "teal") {
          mat.map = null;
          mat.color.copy(teal);
        } else if (liveryMode === "white") {
          mat.map = null;
          mat.color.copy(white);
        }
      }
      else if (isWheelCover) {
        if (liveryMode === "dark") {
          mat.map = originalMap || null;
          mat.color.set("#ffffff");
        } else if (liveryMode === "black") {
          mat.map = null;
          mat.color.copy(black);
        } else if (liveryMode === "teal") {
          mat.map = null;
          mat.color.copy(teal);
        } else if (liveryMode === "white") {
          mat.map = null;
          mat.color.copy(white);
        }
      }
      else if (isRim) {
        if (liveryMode === "dark") {
          mat.color.set("#cccccc");
          mat.roughness = 0.2;
          mat.metalness = 0.6;
        } else if (liveryMode === "black") {
          mat.color.set("#111111");
          mat.roughness = 0.4;
          mat.metalness = 0.8;
        } else if (liveryMode === "teal") {
          mat.color.set("#cccccc");
          mat.roughness = 0.2;
          mat.metalness = 0.6;
        } else if (liveryMode === "white") {
          mat.color.set("#111111");
          mat.roughness = 0.3;
          mat.metalness = 0.7;
        }
      }
      else if (isSuspension || isFloor) {
        mat.map = null;
        mat.color.copy(black);
        mat.roughness = 0.65;
        mat.metalness = 0.2;
      }
      
      mat.needsUpdate = true;
    }
  });
}
