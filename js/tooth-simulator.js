/**
 * Apurva's Dental — Next-Gen Interactive 3D Dental Anatomy & Clinical Simulator Engine
 * Apple-Grade WebGL PBR Architecture with Biological Enamel Translucency & Histological Precision.
 */
(function(window) {
  function initDentalSimulator(config) {
    config = config || {};
    const prefix = config.prefix || '';
    const containerId = config.containerId || (prefix + 'canvas-container');
    const wrapperId = config.wrapperId || (prefix + 'canvas-wrapper');
    const defaultHeight = config.height || 720;
    const enablePins = config.hasPins !== false;

    const container = document.getElementById(containerId);
    const canvasWrapper = document.getElementById(wrapperId);
    if (!container || typeof THREE === 'undefined') return null;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || defaultHeight;

    // 1. Scene & Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060e20);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 7.8);

    // 3. WebGL Renderer with High Precision & Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.localClippingEnabled = true;
    if (renderer.shadowMap) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    if ('toneMapping' in renderer) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
    }
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 16;
    controls.minDistance = 2.2;
    controls.target.set(0, -0.3, 0);

    // 5. Studio 3-Point Clinical Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.65);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff6ec, 1.4);
    keyLight.position.set(6, 9, 7);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.85);
    fillLight.position.set(-7, 3, -5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x2dd4bf, 1.35);
    rimLight.position.set(0, -5, -7);
    scene.add(rimLight);

    const topAccentLight = new THREE.PointLight(0xffffff, 0.6, 12);
    topAccentLight.position.set(0, 6, 2);
    scene.add(topAccentLight);

    // 6. Medical Stage Pedestal & Holographic Rings
    const stageGroup = new THREE.Group();
    stageGroup.position.set(0, -4.15, 0);
    scene.add(stageGroup);

    // Disc floor
    const stageGeo = new THREE.CylinderGeometry(3.6, 3.8, 0.15, 64);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x0a1630,
      metalness: 0.85,
      roughness: 0.35
    });
    const stageMesh = new THREE.Mesh(stageGeo, stageMat);
    stageGroup.add(stageMesh);

    // Outer glow ring
    const ringGeo = new THREE.RingGeometry(3.2, 3.32, 64);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 0.085;
    stageGroup.add(ringMesh);

    // Inner concentric accent ring
    const innerRingGeo = new THREE.RingGeometry(2.1, 2.18, 48);
    innerRingGeo.rotateX(-Math.PI / 2);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3
    });
    const innerRingMesh = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRingMesh.position.y = 0.086;
    stageGroup.add(innerRingMesh);

    // Floating sterile ambient particles
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 10;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 10;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x5eead4,
      size: 0.07,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 7. Assembly Hierarchy
    const toothAssembly = new THREE.Group();
    scene.add(toothAssembly);

    const enamelGroup = new THREE.Group();
    const dentinGroup = new THREE.Group();
    const pulpGroup = new THREE.Group();
    const gumGroup = new THREE.Group();
    const procedureGroup = new THREE.Group();

    toothAssembly.add(enamelGroup);
    toothAssembly.add(dentinGroup);
    toothAssembly.add(pulpGroup);
    toothAssembly.add(gumGroup);
    toothAssembly.add(procedureGroup);

    // Dynamic Slicing Clip Plane
    const clipPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);

    // VITA Classical Enamel Shades
    const enamelShades = {
      'BL1': { color: 0xffffff, clearcoat: 0.98, roughness: 0.10, emissive: 0x161616 },
      'A1':  { color: 0xfdfcf6, clearcoat: 0.90, roughness: 0.14, emissive: 0x101010 },
      'A2':  { color: 0xf7f1de, clearcoat: 0.85, roughness: 0.18, emissive: 0x0c0c0c },
      'A35': { color: 0xeddcb6, clearcoat: 0.75, roughness: 0.22, emissive: 0x080808 }
    };
    let currentShade = 'BL1';

    // 8. Physically Based Materials with Subsurface Translucency
    const enamelMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      emissive: 0x161616,
      roughness: 0.12,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      transmission: 0.26,
      thickness: 1.15,
      ior: 1.63,
      attenuationColor: new THREE.Color(0xfffaed),
      attenuationDistance: 2.8,
      side: THREE.DoubleSide
    });

    const dentinMat = new THREE.MeshPhysicalMaterial({
      color: 0xf3dfb2,
      roughness: 0.42,
      metalness: 0.02,
      clearcoat: 0.15,
      side: THREE.DoubleSide
    });

    const pulpMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.75,
      roughness: 0.26,
      metalness: 0.08,
      side: THREE.DoubleSide
    });

    const gumMat = new THREE.MeshPhysicalMaterial({
      color: 0xe58392,
      roughness: 0.58,
      metalness: 0.02,
      transmission: 0.12,
      thickness: 0.6,
      side: THREE.DoubleSide
    });

    // 9. Parametric Biological Geometry Sculptor
    function buildToothGeometry(type, scale, yOffset) {
      if (!type) type = 'molar';
      if (!scale) scale = 1.0;
      if (!yOffset) yOffset = 0;

      const radial = (type === 'molar') ? 40 : 36;
      const crownLevels = 22;
      const positions = [];
      const indices = [];

      function addV(x, y, z) {
        positions.push(x * scale, (y + yOffset) * scale, z * scale);
        return (positions.length / 3) - 1;
      }

      const crownGrid = [];
      for (let r = 0; r <= crownLevels; r++) {
        const ring = [];
        const t = r / crownLevels;
        const baseY = t * 2.35;

        for (let s = 0; s < radial; s++) {
          let y = baseY;
          const theta = (s / radial) * Math.PI * 2;
          const cosT = Math.cos(theta);
          const sinT = Math.sin(theta);
          let rx = 1.0;
          let rz = 1.0;

          if (type === 'molar') {
            rx = 1.34 + Math.sin(t * Math.PI * 0.85) * 0.36;
            rz = 1.15 + Math.sin(t * Math.PI * 0.85) * 0.36;
            if (t < 0.25) {
              const neck = 1.0 - (0.25 - t) * 0.55;
              rx *= neck;
              rz *= neck;
            }
            if (t > 0.65) {
              const topT = (t - 0.65) / 0.35;
              const c1 = Math.max(0, cosT) * Math.max(0, sinT);
              const c2 = Math.max(0, -cosT) * Math.max(0, sinT) * 0.95;
              const c3 = Math.max(0, cosT) * Math.max(0, -sinT) * 0.98;
              const c4 = Math.max(0, -cosT) * Math.max(0, -sinT) * 0.90;
              y += (c1 + c2 + c3 + c4) * 0.58 * Math.pow(topT, 1.8);
            }
          } else if (type === 'premolar') {
            rx = 0.96 + Math.sin(t * Math.PI * 0.85) * 0.28;
            rz = 1.20 + Math.sin(t * Math.PI * 0.85) * 0.28;
            if (t < 0.25) {
              const neck = 1.0 - (0.25 - t) * 0.52;
              rx *= neck;
              rz *= neck;
            }
            if (t > 0.60) {
              const topT = (t - 0.60) / 0.40;
              const buccalCusp = Math.max(0, sinT) * 0.68;
              const lingualCusp = Math.max(0, -sinT) * 0.52;
              y += (buccalCusp + lingualCusp) * Math.pow(topT, 1.8);
            }
          } else if (type === 'canine') {
            rx = 0.95 * (1.0 - t * 0.42) + Math.sin(t * Math.PI * 0.75) * 0.24;
            rz = 1.10 * (1.0 - t * 0.32) + Math.sin(t * Math.PI * 0.75) * 0.24;
            if (t > 0.46) {
              const topT = (t - 0.46) / 0.54;
              const cusp = Math.pow(1.0 - Math.abs(cosT) * 0.6, 2.0) * 0.82;
              y += cusp * Math.pow(topT, 1.6);
            }
          } else if (type === 'incisor') {
            rx = (0.86 + t * 0.52) * Math.sin(t * Math.PI * 0.85 + 0.32);
            rz = 1.02 * (1.0 - t * 0.70);
            if (t > 0.85) {
              const mamelon = Math.sin(theta * 3.0) * 0.05;
              y += mamelon;
            }
          }

          ring.push(addV(rx * cosT, y, rz * sinT));
        }
        crownGrid.push(ring);
      }

      const tipCenter = addV(0, (type === 'canine' ? 3.15 : (type === 'molar' ? 2.52 : 2.38)), 0);
      for (let r = 0; r < crownLevels; r++) {
        for (let s = 0; s < radial; s++) {
          const nextS = (s + 1) % radial;
          indices.push(crownGrid[r][s], crownGrid[r][nextS], crownGrid[r + 1][nextS]);
          indices.push(crownGrid[r][s], crownGrid[r + 1][nextS], crownGrid[r + 1][s]);
        }
      }
      const topRing = crownGrid[crownLevels];
      for (let s = 0; s < radial; s++) {
        const nextS = (s + 1) % radial;
        indices.push(topRing[s], topRing[nextS], tipCenter);
      }

      // Root Architecture
      if (type === 'molar') {
        function addRootBranch(offsetX, curveDir) {
          const steps = 22;
          const rGrid = [];
          for (let r = 0; r <= steps; r++) {
            const ring = [];
            const t = r / steps;
            const y = -0.4 - t * 2.95;
            const curveX = Math.pow(t, 1.6) * curveDir * 0.48;
            const radius = (1.0 - t * 0.78) * 0.58;
            for (let s = 0; s < 20; s++) {
              const th = (s / 20) * Math.PI * 2;
              ring.push(addV(offsetX + curveX + Math.cos(th) * radius * 0.95, y, Math.sin(th) * radius * 1.25));
            }
            rGrid.push(ring);
          }
          const apex = addV(offsetX + curveDir * 0.48, -3.45, 0);
          for (let r = 0; r < steps; r++) {
            for (let s = 0; s < 20; s++) {
              const nextS = (s + 1) % 20;
              indices.push(rGrid[r][s], rGrid[r][nextS], rGrid[r + 1][nextS]);
              indices.push(rGrid[r][s], rGrid[r + 1][nextS], rGrid[r + 1][s]);
            }
          }
          for (let s = 0; s < 20; s++) {
            const nextS = (s + 1) % 20;
            indices.push(rGrid[steps][s], rGrid[steps][nextS], apex);
          }
        }
        addRootBranch(0.55, -0.22);
        addRootBranch(-0.55, -0.42);
      } else {
        const steps = 24;
        const rGrid = [];
        const rootLength = (type === 'canine') ? 3.75 : ((type === 'premolar') ? 3.1 : 2.85);
        for (let r = 0; r <= steps; r++) {
          const ring = [];
          const t = r / steps;
          const y = -0.35 - t * rootLength;
          const curveX = Math.pow(t, 2.0) * -0.26;
          const radiusX = (1.0 - t * 0.78) * 0.65;
          const radiusZ = (1.0 - t * 0.78) * ((type === 'incisor') ? 0.60 : 0.86);
          for (let s = 0; s < 26; s++) {
            const th = (s / 26) * Math.PI * 2;
            ring.push(addV(curveX + Math.cos(th) * radiusX, y, Math.sin(th) * radiusZ));
          }
          rGrid.push(ring);
        }
        const apex = addV(-0.26, -0.35 - rootLength - 0.05, 0);
        for (let r = 0; r < steps; r++) {
          for (let s = 0; s < 26; s++) {
            const nextS = (s + 1) % 26;
            indices.push(rGrid[r][s], rGrid[r][nextS], rGrid[r + 1][nextS]);
            indices.push(rGrid[r][s], rGrid[r + 1][nextS], rGrid[r + 1][s]);
          }
        }
        for (let s = 0; s < 26; s++) {
          const nextS = (s + 1) % 26;
          indices.push(rGrid[steps][s], rGrid[steps][nextS], apex);
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      return geo;
    }

    // State Variables
    let currentToothType = 'molar';
    let currentMode = 'healthy';
    let autoRotate = true;
    let isWireframe = false;
    let targetCamPos = null;
    let targetLookAt = null;
    let audioEnabled = true;

    let enamelMesh = null;
    let dentinMesh = null;
    let pulpMesh = null;
    let gumMesh = null;
    let cavityMesh = null;
    let rootCanalGroup = null;
    let veneerMesh = null;
    let implantGroup = null;

    // Subtle Web Audio Synthesizer for Tactile Feedback
    let audioCtx = null;
    function playTactileFeedback(freq, duration) {
      if (!audioEnabled || typeof window === 'undefined') return;
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq || 680, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + (duration || 0.06));
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + (duration || 0.06));
      } catch (e) {}
    }

    // Scoped Element Finders
    function getEl(id) {
      return document.getElementById(prefix + id) || document.getElementById(id);
    }

    const modeLabel = getEl('active-mode-label');
    const toothLabel = getEl('active-tooth-label');
    const infoTitle = getEl('info-title');
    const infoDesc = getEl('info-desc');
    const infoLink = getEl('info-link');
    const explodedSlider = getEl('exploded-slider');
    const explodedVal = getEl('exploded-val');
    const autoRotateBtn = getEl('btn-autorotate');
    const wireframeBtn = getEl('btn-wireframe');

    const clinicalModeData = {
      healthy: {
        label: 'Mode: Healthy Anatomy',
        title: 'Healthy Mandibular Tooth Anatomy',
        desc: 'Intact crystalline enamel with optimal biological mineral density, vibrant vascular pulp chamber, and healthy periodontal bone attachment.',
        link: 'services-details.html#preventive',
        linkText: 'Explore Preventive Hygiene Protocol &rarr;'
      },
      cross: {
        label: 'Mode: Cross-Section Cut',
        title: 'Internal Coronal Architecture',
        desc: 'Coronal laser slice exposing outer enamel (white), porous shock-absorbing dentin tubules (amber), and vital pulp nerve chamber (crimson).',
        link: 'tooth-model.html',
        linkText: 'Inspect Tooth Architecture Guide &rarr;'
      },
      cavity: {
        label: 'Mode: Occlusal Caries / Decay',
        title: 'Active Carious Enamel Demineralization',
        desc: 'Acidic biofilm byproducts demineralize occlusal grooves, creating a porous decay cavity progressing toward the vulnerable dentinal tubules.',
        link: 'services-details.html#restorative',
        linkText: 'View Tooth-Colored Composite Fillings &rarr;'
      },
      rootcanal: {
        label: 'Mode: Root Canal Therapy',
        title: 'Endodontic Canal Obturation',
        desc: 'Infected necrotic pulp tissue is cleared with ultrasonic instrumentation and permanently sealed with bio-compatible thermoplastic gutta-percha points.',
        link: 'doctor-details.html#emman',
        linkText: 'Schedule Endodontic Consultation with Dr. Emman &rarr;'
      },
      veneer: {
        label: 'Mode: Porcelain Veneer Bonding',
        title: 'Sub-Millimeter Cosmetic Veneer',
        desc: 'Handcrafted monolithic German ceramic veneer shell (Shade BL1) bonded to the labial face, permanently closing gaps and perfecting smile aesthetics.',
        link: 'services-details.html#cosmetic',
        linkText: "Discover Apurva's Dental Porcelain Veneer Artistry &rarr;"
      },
      implant: {
        label: 'Mode: Titanium Implant & Crown',
        title: 'Bio-Inert Titanium Implant System',
        desc: 'A grade-5 medical titanium fixture osteointegrated into alveolar bone, topped with a custom gold abutment and monolithic diamond-milled crown.',
        link: 'services-details.html#restorative',
        linkText: 'Explore Guided Implantology Suite &rarr;'
      },
      xray: {
        label: 'Mode: Diagnostic Radiograph',
        title: 'Volumetric X-Ray Radiography',
        desc: 'High-contrast luminescent radiograph visualizing pulp horns, root canal curvature, periapical bone health, and hidden interproximal decay.',
        link: 'services.html',
        linkText: 'Learn About 3D CBCT Volumetric Scans &rarr;'
      }
    };

    const landmarkPositions = {
      occlusal: new THREE.Vector3(0, 2.35, 0),
      edj:      new THREE.Vector3(0.95, 1.25, 0.45),
      pulp:     new THREE.Vector3(0, 0.45, 0),
      cej:      new THREE.Vector3(1.25, -0.15, 0),
      apex:     new THREE.Vector3(0, -3.2, 0)
    };

    function initProcedureModels() {
      // Cavity lesion
      const cavityGeo = new THREE.SphereGeometry(0.44, 24, 24);
      cavityGeo.scale(1.2, 0.45, 1.3);
      cavityMesh = new THREE.Mesh(cavityGeo, new THREE.MeshStandardMaterial({
        color: 0x1a0f08,
        roughness: 0.95,
        metalness: 0.05
      }));
      cavityMesh.position.set(0.18, 2.32, 0.15);
      cavityMesh.visible = false;
      procedureGroup.add(cavityMesh);

      // Root Canal gutta-percha cones
      rootCanalGroup = new THREE.Group();
      const canalMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        emissive: 0xe11d48,
        emissiveIntensity: 0.75,
        roughness: 0.28
      });
      const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.04, 3.2, 18), canalMat);
      c1.position.set(0.45, -1.8, 0);
      c1.rotation.z = 0.08;
      const c2 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.04, 3.2, 18), canalMat);
      c2.position.set(-0.45, -1.8, 0);
      c2.rotation.z = -0.12;
      rootCanalGroup.add(c1);
      rootCanalGroup.add(c2);
      rootCanalGroup.visible = false;
      procedureGroup.add(rootCanalGroup);

      // Porcelain Veneer Facet
      const veneerGeo = new THREE.SphereGeometry(1.42, 32, 32, 0, Math.PI);
      veneerGeo.scale(0.96, 1.25, 0.38);
      veneerMesh = new THREE.Mesh(veneerGeo, new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        emissive: 0x222222,
        roughness: 0.06,
        metalness: 0.02,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        side: THREE.DoubleSide
      }));
      veneerMesh.position.set(0, 0.95, 1.15);
      veneerMesh.rotation.y = Math.PI / 2;
      veneerMesh.visible = false;
      procedureGroup.add(veneerMesh);

      // Titanium Implant fixture
      implantGroup = new THREE.Group();
      const implantPost = new THREE.Mesh(
        new THREE.CylinderGeometry(0.54, 0.38, 3.4, 32),
        new THREE.MeshStandardMaterial({ color: 0x71717a, metalness: 0.95, roughness: 0.22 })
      );
      implantPost.position.set(0, -1.8, 0);
      implantGroup.add(implantPost);

      const goldAbutment = new THREE.Mesh(
        new THREE.CylinderGeometry(0.70, 0.54, 0.68, 32),
        new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.92, roughness: 0.18 })
      );
      goldAbutment.position.set(0, -0.05, 0);
      implantGroup.add(goldAbutment);
      implantGroup.visible = false;
      procedureGroup.add(implantGroup);
    }

    function setEnamelShade(shadeKey) {
      const s = enamelShades[shadeKey];
      if (!s) return;
      currentShade = shadeKey;
      enamelMat.color.setHex(s.color);
      enamelMat.clearcoat = s.clearcoat;
      enamelMat.roughness = s.roughness;
      enamelMat.emissive.setHex(s.emissive);

      const scope = config.scope ? document.querySelector(config.scope) : document;
      if (scope && typeof scope.querySelectorAll === 'function') {
        scope.querySelectorAll('.btn-shade').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-shade') === shadeKey);
        });
      }
    }

    function applyExplodedDisassembly(percent) {
      const t = percent / 100;
      enamelGroup.position.y = t * 2.2;
      dentinGroup.position.y = t * 0.95;
      pulpGroup.position.y = -t * 0.45;
      gumGroup.position.y = -t * 1.5;

      if (explodedVal) {
        explodedVal.textContent = (percent === 0) ? '0% (Assembled)' : `${percent}% Separated`;
      }
      if (enablePins) updatePins();
    }

    function setDiagnosticMode(mode) {
      currentMode = mode;
      enamelMat.clippingPlanes = [];
      enamelMat.wireframe = isWireframe;
      enamelMat.opacity = 1.0;
      enamelMat.transparent = false;
      setEnamelShade(currentShade);

      const enamelToggle = getEl('toggle-enamel');
      if (enamelMesh) enamelMesh.visible = enamelToggle ? enamelToggle.checked : true;

      dentinMat.clippingPlanes = [];
      if (dentinMesh) dentinMesh.visible = false;

      pulpMat.clippingPlanes = [];
      if (pulpMesh) pulpMesh.visible = false;

      if (cavityMesh) cavityMesh.visible = false;
      if (rootCanalGroup) rootCanalGroup.visible = false;
      if (veneerMesh) veneerMesh.visible = false;
      if (implantGroup) implantGroup.visible = false;

      if (mode === 'cross') {
        enamelMat.clippingPlanes = [clipPlane];
        dentinMat.clippingPlanes = [clipPlane];
        pulpMat.clippingPlanes = [clipPlane];
        const dCheck = getEl('toggle-dentin');
        const pCheck = getEl('toggle-pulp');
        if (dentinMesh) dentinMesh.visible = dCheck ? dCheck.checked : true;
        if (pulpMesh) pulpMesh.visible = pCheck ? pCheck.checked : true;
      } else if (mode === 'cavity') {
        if (cavityMesh) cavityMesh.visible = true;
      } else if (mode === 'rootcanal') {
        enamelMat.clippingPlanes = [clipPlane];
        dentinMat.clippingPlanes = [clipPlane];
        if (dentinMesh) dentinMesh.visible = true;
        if (rootCanalGroup) rootCanalGroup.visible = true;
      } else if (mode === 'veneer') {
        if (veneerMesh) veneerMesh.visible = true;
      } else if (mode === 'implant') {
        if (implantGroup) implantGroup.visible = true;
        const rootClip = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.1);
        enamelMat.clippingPlanes = [rootClip];
      } else if (mode === 'xray') {
        enamelMat.transparent = true;
        enamelMat.opacity = 0.32;
        enamelMat.color.setHex(0x38bdf8);
        enamelMat.emissive.setHex(0x0284c7);
        if (pulpMesh) pulpMesh.visible = true;
        pulpMat.emissive.setHex(0xf43f5e);
      }

      const data = clinicalModeData[mode] || clinicalModeData['healthy'];
      if (modeLabel) modeLabel.textContent = data.label;
      if (infoTitle) infoTitle.textContent = data.title;
      if (infoDesc) infoDesc.textContent = data.desc;
      if (infoLink) {
        infoLink.href = data.link;
        infoLink.innerHTML = data.linkText;
      }
    }

    function loadTooth(type) {
      currentToothType = type;

      while (enamelGroup.children.length) enamelGroup.remove(enamelGroup.children[0]);
      while (dentinGroup.children.length) dentinGroup.remove(dentinGroup.children[0]);
      while (pulpGroup.children.length) pulpGroup.remove(pulpGroup.children[0]);
      while (gumGroup.children.length) gumGroup.remove(gumGroup.children[0]);

      // Enamel
      const eGeo = buildToothGeometry(type, 1.0);
      enamelMesh = new THREE.Mesh(eGeo, enamelMat);
      enamelGroup.add(enamelMesh);

      // Dentin
      const dGeo = buildToothGeometry(type, 0.88);
      dentinMesh = new THREE.Mesh(dGeo, dentinMat);
      dentinMesh.visible = false;
      dentinGroup.add(dentinMesh);

      // Pulp
      const pGeo = buildToothGeometry(type, 0.48);
      pulpMesh = new THREE.Mesh(pGeo, pulpMat);
      pulpMesh.visible = false;
      pulpGroup.add(pulpMesh);

      // Gingiva (Gum)
      const gumRadius = (type === 'molar') ? 1.55 : 1.25;
      const gGeo = new THREE.TorusGeometry(gumRadius, 0.42, 16, 48);
      gGeo.rotateX(Math.PI / 2);
      gGeo.scale(1.08, 1.0, 0.95);
      gumMesh = new THREE.Mesh(gGeo, gumMat);
      gumMesh.position.set(0, -0.15, 0);
      gumGroup.add(gumMesh);

      if (cavityMesh) {
        cavityMesh.position.set(0, (type === 'canine' ? 2.6 : 2.2), 0.12);
      }
      if (veneerMesh) {
        veneerMesh.position.set(0, 0.9, (type === 'canine' ? 0.95 : 1.15));
      }

      const toothLabels = {
        'molar': 'Tooth: Mandibular Molar (#19)',
        'premolar': 'Tooth: Maxillary Premolar (#12)',
        'canine': 'Tooth: Maxillary Canine (#11)',
        'incisor': 'Tooth: Central Incisor (#8)'
      };
      if (toothLabel) {
        toothLabel.textContent = toothLabels[type] || 'Tooth Anatomy';
      }

      setDiagnosticMode(currentMode);
      const expVal = explodedSlider ? (parseFloat(explodedSlider.value) || 0) : 0;
      applyExplodedDisassembly(expVal);
    }

    function updatePins() {
      const pinsContainer = getEl('pins-container');
      if (!pinsContainer || pinsContainer.style.display === 'none') return;

      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (!w || !h) return;

      toothAssembly.updateMatrixWorld(true);

      Object.keys(landmarkPositions).forEach(key => {
        const pinEl = document.getElementById(prefix + `pin-${key}`) || document.getElementById(`pin-${key}`);
        if (!pinEl) return;

        const pos = landmarkPositions[key].clone();
        const exp = explodedSlider ? (parseFloat(explodedSlider.value) || 0) : 0;
        if (key === 'occlusal') pos.y += (exp / 100) * 2.2;
        else if (key === 'edj') pos.y += (exp / 100) * 1.2;
        else if (key === 'cej') pos.y -= (exp / 100) * 1.4;

        pos.applyMatrix4(toothAssembly.matrixWorld);
        pos.project(camera);

        if (pos.z > 1) {
          pinEl.style.opacity = '0';
          return;
        }

        const screenX = (pos.x * 0.5 + 0.5) * w;
        const screenY = (-(pos.y * 0.5) + 0.5) * h;

        pinEl.style.left = `${screenX}px`;
        pinEl.style.top = `${screenY}px`;
        pinEl.style.opacity = '1';
      });
    }

    function flyCameraTo(pos, lookTarget) {
      targetCamPos = pos.clone();
      targetLookAt = lookTarget.clone();
      playTactileFeedback(720, 0.08);
    }

    // Attach Event Listeners
    const scope = config.scope ? document.querySelector(config.scope) : document;

    if (explodedSlider) {
      explodedSlider.addEventListener('input', (e) => {
        applyExplodedDisassembly(parseFloat(e.target.value) || 0);
      });
    }

    if (scope && typeof scope.querySelectorAll === 'function') {
      scope.querySelectorAll('.btn-preset-mini').forEach((btn) => {
        btn.addEventListener('click', () => {
          const val = parseFloat(btn.getAttribute('data-exp')) || 0;
          if (explodedSlider) explodedSlider.value = val;
          applyExplodedDisassembly(val);
          playTactileFeedback(640, 0.05);
        });
      });

      scope.querySelectorAll('.btn-shade').forEach((btn) => {
        btn.addEventListener('click', () => {
          setEnamelShade(btn.getAttribute('data-shade'));
          playTactileFeedback(820, 0.05);
        });
      });

      scope.querySelectorAll('.mode-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          scope.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          setDiagnosticMode(btn.getAttribute('data-mode'));
          playTactileFeedback(900, 0.06);
        });
      });

      scope.querySelectorAll('.btn-tooth-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
          scope.querySelectorAll('.btn-tooth-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          loadTooth(tab.getAttribute('data-tooth'));
          playTactileFeedback(560, 0.08);
        });
      });

      scope.querySelectorAll('.landmark-pin').forEach((pin) => {
        pin.addEventListener('click', () => {
          const key = pin.getAttribute('data-pin');
          if (!landmarkPositions[key]) return;

          scope.querySelectorAll('.landmark-pin').forEach(p => p.classList.remove('active'));
          pin.classList.add('active');

          const landmarkDetails = {
            occlusal: {
              title: 'Occlusal Cusps & Masticatory Table',
              desc: 'High-pressure grinding surface engineered with four anatomical cusps and central developmental groove fissures.',
              link: 'services-details.html#preventive'
            },
            edj: {
              title: 'Enamel-Dentin Junction (EDJ)',
              desc: 'The biological scalloped boundary between 96% mineralized crystalline enamel and elastic shock-absorbing dentin.',
              link: 'services-details.html#cosmetic'
            },
            pulp: {
              title: 'Pulp Chamber & Neurovascular Bundle',
              desc: 'The vital core of the tooth housing vascular micro-capillaries and sensory nerve fibers communicating with the trigeminal cranial branch.',
              link: 'doctor-details.html#emman'
            },
            cej: {
              title: 'Cementoenamel Junction (CEJ)',
              desc: 'The anatomical neck where enamel crown crystals terminate and root cementum anchors into periodontal ligaments.',
              link: 'services-details.html#preventive'
            },
            apex: {
              title: 'Apical Foramen & Root Tip Canal',
              desc: 'The microscopic aperture at the root apex where nutrient dental arteries, veins, and alveolar nerves enter systemic blood circulation.',
              link: 'services-details.html#restorative'
            }
          };

          const d = landmarkDetails[key];
          if (d) {
            if (infoTitle) infoTitle.textContent = d.title;
            if (infoDesc) infoDesc.textContent = d.desc;
            if (infoLink) {
              infoLink.href = d.link;
              infoLink.innerHTML = 'Consult Specialist Regarding This Landmark &rarr;';
            }
          }

          const targetPos = landmarkPositions[key].clone();
          const camOffset = new THREE.Vector3(0, 0.5, 4.2);
          flyCameraTo(targetPos.clone().add(camOffset), targetPos);
        });
      });
    }

    const toggleEnamel = getEl('toggle-enamel');
    if (toggleEnamel) {
      toggleEnamel.addEventListener('change', (e) => {
        if (enamelMesh) enamelMesh.visible = e.target.checked;
        playTactileFeedback(600, 0.04);
      });
    }

    const toggleDentin = getEl('toggle-dentin');
    if (toggleDentin) {
      toggleDentin.addEventListener('change', (e) => {
        if (dentinMesh) dentinMesh.visible = e.target.checked;
        playTactileFeedback(600, 0.04);
      });
    }

    const togglePulp = getEl('toggle-pulp');
    if (togglePulp) {
      togglePulp.addEventListener('change', (e) => {
        if (pulpMesh) pulpMesh.visible = e.target.checked;
        playTactileFeedback(600, 0.04);
      });
    }

    const toggleGum = getEl('toggle-gum');
    if (toggleGum) {
      toggleGum.addEventListener('change', (e) => {
        if (gumMesh) gumMesh.visible = e.target.checked;
        playTactileFeedback(600, 0.04);
      });
    }

    const togglePins = getEl('toggle-pins');
    if (togglePins) {
      togglePins.addEventListener('change', (e) => {
        const pinsContainer = getEl('pins-container');
        if (pinsContainer) pinsContainer.style.display = e.target.checked ? 'block' : 'none';
        playTactileFeedback(600, 0.04);
      });
    }

    if (autoRotateBtn) {
      autoRotateBtn.addEventListener('click', () => {
        autoRotate = !autoRotate;
        autoRotateBtn.classList.toggle('active', autoRotate);
        playTactileFeedback(700, 0.05);
      });
    }

    const resetBtn = getEl('btn-reset-view');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        flyCameraTo(new THREE.Vector3(0, 1.4, 7.8), new THREE.Vector3(0, -0.3, 0));
      });
    }

    const crownBtn = getEl('btn-focus-crown');
    if (crownBtn) {
      crownBtn.addEventListener('click', () => {
        flyCameraTo(new THREE.Vector3(0, 3.2, 4.8), new THREE.Vector3(0, 1.8, 0));
      });
    }

    const rootsBtn = getEl('btn-focus-roots');
    if (rootsBtn) {
      rootsBtn.addEventListener('click', () => {
        flyCameraTo(new THREE.Vector3(0, -2.4, 5.2), new THREE.Vector3(0, -2.0, 0));
      });
    }

    const occlusalBtn = getEl('btn-focus-occlusal');
    if (occlusalBtn) {
      occlusalBtn.addEventListener('click', () => {
        flyCameraTo(new THREE.Vector3(0, 6.5, 0.5), new THREE.Vector3(0, 1.8, 0));
      });
    }

    const soundBtn = getEl('btn-sound');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        audioEnabled = !audioEnabled;
        soundBtn.classList.toggle('active', audioEnabled);
        soundBtn.title = audioEnabled ? 'Mute Tactile Audio' : 'Enable Tactile Audio';
        if (audioEnabled) playTactileFeedback(880, 0.08);
      });
    }

    if (wireframeBtn) {
      wireframeBtn.addEventListener('click', () => {
        isWireframe = !isWireframe;
        wireframeBtn.classList.toggle('active', isWireframe);
        enamelMat.wireframe = isWireframe;
        dentinMat.wireframe = isWireframe;
        playTactileFeedback(750, 0.05);
      });
    }

    const screenshotBtn = getEl('btn-screenshot');
    if (screenshotBtn) {
      screenshotBtn.addEventListener('click', () => {
        renderer.render(scene, camera);
        const dataUrl = renderer.domElement.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `Apurvas_Dental_3D_Tooth_${currentToothType}_${currentMode}.png`;
        a.click();
        playTactileFeedback(1000, 0.1);
      });
    }

    const fullscreenBtn = getEl('btn-fullscreen');
    if (fullscreenBtn && canvasWrapper) {
      fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          if (canvasWrapper.requestFullscreen) canvasWrapper.requestFullscreen();
        } else {
          if (document.exitFullscreen) document.exitFullscreen();
        }
        playTactileFeedback(800, 0.05);
      });
    }

    // Dynamic Resizing
    function handleResize() {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || defaultHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (enablePins) updatePins();
    }
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('resize', handleResize);
    }
    if (typeof ResizeObserver !== 'undefined' && container) {
      const ro = new ResizeObserver(handleResize);
      ro.observe(container);
    }

    // Initial load
    initProcedureModels();
    loadTooth('molar');
    setDiagnosticMode('healthy');
    setEnamelShade('BL1');

    // Render loop with biological vascular pulse & particle drift
    let isRunning = true;
    const clock = new THREE.Clock();
    function animate() {
      if (!isRunning) return;
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(animate);
      }

      const elapsedTime = clock.getElapsedTime();

      // Smooth Camera Animation
      if (targetCamPos && targetLookAt) {
        camera.position.lerp(targetCamPos, 0.08);
        controls.target.lerp(targetLookAt, 0.08);
        if (camera.position.distanceTo(targetCamPos) < 0.04) {
          targetCamPos = null;
          targetLookAt = null;
        }
      }

      // Auto rotation
      if (autoRotate && !targetCamPos) {
        toothAssembly.rotation.y += 0.007;
      }

      // Subtle biological heartbeat pulse in vascular pulp
      if (pulpMesh && pulpMesh.visible) {
        const pulse = Math.sin(elapsedTime * 3.2) * 0.18 + 0.82;
        pulpMat.emissiveIntensity = 0.75 * pulse;
      }

      // Subtle particle drift
      if (particleSystem) {
        particleSystem.rotation.y = elapsedTime * 0.02;
      }

      // Subtle pedestal ring rotation
      if (ringMesh) {
        ringMesh.rotation.z = -elapsedTime * 0.08;
      }

      controls.update();
      renderer.render(scene, camera);
      if (enablePins) updatePins();
    }
    animate();

    return {
      scene,
      camera,
      renderer,
      loadTooth,
      setDiagnosticMode,
      destroy: () => { isRunning = false; }
    };
  }

  window.initDentalSimulator = initDentalSimulator;
})(typeof window !== 'undefined' ? window : global);
