/**
 * PROOF RENDER — AI Resume Analyzer project visual.
 *
 * NOT WIRED IN. Nothing references this file. It renders stills for review; if
 * the look is rejected, deleting this one file removes it entirely. The hero is
 * DOM and stays DOM.
 *
 * WHY MATTE PAPER, AGAIN, AND NOT A BETTER IDEA
 * ---------------------------------------------
 * Five earlier directions were rejected, and the last two were the useful
 * failures. Frames here are rendered by three.js under SwiftShader — a CPU
 * rasteriser with no refraction, no caustics and no global illumination. Glass
 * and polished metal are almost entirely those three effects, so they came out
 * as acrylic and as a heatsink respectively. Matte, textured, diffusely lit
 * surfaces are the one thing this renderer does honestly, which is why the
 * paper scenes were the ones that nearly worked.
 *
 * So the material is chosen by what the toolchain can actually deliver, not by
 * preference. Saying that plainly is better than shipping a sixth rejection.
 *
 * WHAT IT SHOWS
 * -------------
 * Two printed pages on a dark desk: a resume on the left, a job posting on the
 * right. This project compares two documents and reports what one asks for and
 * the other never mentions — so two documents, side by side, with the overlap
 * marked, IS the project rather than a metaphor for it.
 *
 *   t = 0    two pages, side by side, unmarked
 *   t = 0.5  matched requirements light on both pages, aligned across the gap
 *   t = 1    the unmatched requirements on the posting stay dark — the gap
 *
 * Nothing floats, nothing separates, nothing is annotated in a HUD. The marks
 * are printed into the page textures, so they take the paper's own lighting.
 */
import {
  ACESFilmicToneMapping, AmbientLight, BackSide, CanvasTexture, Color,
  DirectionalLight, DoubleSide, Fog, Group, Mesh, MeshPhysicalMaterial,
  MeshStandardMaterial, PCFSoftShadowMap, PerspectiveCamera, PlaneGeometry,
  Scene, SphereGeometry, SpotLight, SRGBColorSpace, Vector3, WebGLRenderer,
} from 'three';

const SS = 2;

const PAGE_W = 1.52;
const PAGE_H = 2.00;
const TEX_W = 820;
const TEX_H = 1080;

/** Requirement rows on the posting, and which of them the resume covers. */
const ROWS = 9;
const COVERED = [0, 1, 3, 4, 6, 7];

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (x) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
const phase = (t, from, to) => smooth((t - from) / (to - from));

/**
 * A printed page.
 *
 * Abstracted rules rather than legible words: at this scale real text would be
 * unreadable noise, and inventing resume content would put claims on screen
 * that are not his. `rows` draws the page as discrete addressable blocks so the
 * match can light specific ones.
 *
 * Mipmaps are left on and no `minFilter` override is set — forcing LinearFilter
 * disables the mip chain, and a page of fine rules then aliases into blotches
 * on minification.
 */
function pageTexture(doc, { heading, match, seedBase }) {
  const c = doc.createElement('canvas');
  c.width = TEX_W;
  c.height = TEX_H;
  const g = c.getContext('2d');

  g.fillStyle = '#d8d4ca';
  g.fillRect(0, 0, TEX_W, TEX_H);

  // Sparse fibre tooth. Dense noise on a near-flat cream ground is what a lossy
  // codec turns into visible mottling.
  for (let i = 0; i < 1500; i++) {
    g.fillStyle = 'rgba(0,0,0,' + (0.006 + Math.random() * 0.008) + ')';
    g.fillRect(Math.random() * TEX_W, Math.random() * TEX_H, 1.3, 1.3);
  }

  let seed = seedBase;
  const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);

  const left = 104;
  const right = TEX_W - 104;
  const colW = right - left;

  g.fillStyle = 'rgba(26,28,32,0.82)';
  g.fillRect(left, 118, colW * heading, 13);

  const top = 196;
  const rowH = (TEX_H - top - 150) / ROWS;

  for (let r = 0; r < ROWS; r++) {
    const y0 = top + r * rowH;
    const on = match > 0 && COVERED.includes(r);

    // The match wash sits IN the paper: multiply keeps the printed rules
    // visible through it, so it reads as a highlighter and not as a panel.
    if (on) {
      g.save();
      g.globalCompositeOperation = 'multiply';
      g.fillStyle = 'rgba(228,180,126,' + (0.46 * match) + ')';
      g.fillRect(left - 10, y0 + 4, colW * 0.9, rowH - 20);
      g.restore();
    }

    let y = y0 + 12;
    while (y < y0 + rowH - 22) {
      const w = colW * (0.44 + rand() * 0.52);
      g.fillStyle = 'rgba(32,34,39,' + (0.4 + rand() * 0.16) + ')';
      g.fillRect(left, y, w, 6);
      y += 21;
    }
  }

  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function curled() {
  const geo = new PlaneGeometry(PAGE_W, PAGE_H, 28, 34);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const u = clamp01((pos.getX(i) / (PAGE_W / 2) + 1) / 2);
    const v = clamp01((-pos.getY(i) / (PAGE_H / 2) + 1) / 2);
    const corner = clamp01((u - 0.70) / 0.30) * clamp01((v - 0.72) / 0.28);
    pos.setZ(i, corner * corner * 0.07);
  }
  geo.computeVertexNormals();
  return geo;
}

function page(doc, opts) {
  const mesh = new Mesh(
    curled(),
    new MeshPhysicalMaterial({
      map: pageTexture(doc, opts),
      color: 0xffffff,
      roughness: 0.94,
      metalness: 0,
      side: DoubleSide,
    }),
  );
  mesh.castShadow = true;
  // Not receiving: a sheet lying flat has nothing above it to be shadowed by,
  // and self-shadowing at this spacing produced patches across the page.
  mesh.receiveShadow = false;
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.004;
  return mesh;
}

export function render(canvas, tRaw, opts = {}) {
  const WIDTH = opts.width ?? 1600;
  const HEIGHT = opts.height ?? 1000;
  const t = clamp01(tRaw);
  const doc = canvas.ownerDocument;

  const renderer = new WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(WIDTH * SS, HEIGHT * SS, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.72;
  renderer.outputColorSpace = SRGBColorSpace;

  const scene = new Scene();
  scene.background = new Color(0x0c0c0d);
  scene.fog = new Fog(0x0c0c0d, 6.5, 16);

  scene.add(
    new Mesh(
      new SphereGeometry(30, 32, 24),
      new MeshStandardMaterial({ color: 0x0a0a0b, roughness: 1, side: BackSide }),
    ),
  );

  const desk = new Mesh(
    new PlaneGeometry(60, 60),
    new MeshStandardMaterial({ color: 0x1a181a, roughness: 0.9, metalness: 0.03 }),
  );
  desk.rotation.x = -Math.PI / 2;
  desk.receiveShadow = true;
  scene.add(desk);

  const match = phase(t, 0.18, 0.72);

  const rig = new Group();

  const resume = page(doc, { heading: 0.42, match, seedBase: 13 });
  resume.position.x = -(PAGE_W / 2 + 0.11);
  resume.rotation.z = 0.02;
  rig.add(resume);

  const posting = page(doc, { heading: 0.56, match, seedBase: 41 });
  posting.position.x = PAGE_W / 2 + 0.11;
  posting.rotation.z = -0.015;
  rig.add(posting);

  rig.rotation.y = -0.30 + 0.06 * smooth(t);
  rig.position.set(0.52, 0, 0);
  scene.add(rig);

  // --- Lighting -----------------------------------------------------------
  // A spot, not a directional: a directional light has no falloff and renders a
  // flat page as a scan. The gradient across the pages is what reads as studio
  // lighting.
  const key = new SpotLight(0xffe9cc, 92);
  key.position.set(-1.9, 4.6, 2.4);
  key.target = rig;
  key.angle = 0.68;
  key.penumbra = 1;
  key.decay = 1.7;
  key.distance = 20;
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 0.6;
  key.shadow.camera.far = 16;
  key.shadow.bias = -0.0006;
  key.shadow.radius = 3;
  scene.add(key);

  const fill = new DirectionalLight(0xffdcb8, 0.2);
  fill.position.set(3.2, 1.4, 2.2);
  scene.add(fill);

  scene.add(new AmbientLight(0x241d16, 0.34));

  // --- Camera -------------------------------------------------------------
  // Straight-on enough that the two pages read as a pair being compared, angled
  // enough that they are objects on a desk rather than a flat scan.
  const push = smooth(t);
  const camera = new PerspectiveCamera(33, WIDTH / HEIGHT, 0.5, 40);
  camera.position.set(-0.12 + 0.20 * push, 2.48 - 0.22 * push, 3.35 - 0.30 * push);
  camera.lookAt(new Vector3(0.50, 0, 0.04));

  renderer.render(scene, camera);
  return { calls: renderer.info.render.calls, tris: renderer.info.render.triangles };
}
