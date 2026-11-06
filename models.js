function createCube() {
  const positions = new Float32Array([
    -1, -1,  1,   1, -1,  1,   1,  1,  1,  -1,  1,  1,   // front
     1, -1, -1,  -1, -1, -1,  -1,  1, -1,   1,  1, -1,   // back
    -1,  1,  1,   1,  1,  1,   1,  1, -1,  -1,  1, -1,   // top
    -1, -1, -1,   1, -1, -1,   1, -1,  1,  -1, -1,  1,   // bottom
     1, -1,  1,   1, -1, -1,   1,  1, -1,   1,  1,  1,   // right
    -1, -1, -1,  -1, -1,  1,  -1,  1,  1,  -1,  1, -1    // left
  ]);
  const faceNormals = [[0, 0, 1], [0, 0, -1], [0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0]];
  const normals = new Float32Array(faceNormals.flatMap(n => [...n, ...n, ...n, ...n]));

  // Tangent; bitangent = cross(N, T)
  const faceTangents = [[1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [0, 0, -1], [0, 0, 1]];
  const tangents = new Float32Array(faceTangents.flatMap(t => [...t, ...t, ...t, ...t]));

  const texCoords = new Float32Array(faceNormals.flatMap(() => [0, 0, 1, 0, 1, 1, 0, 1]));

  const indices = new Uint16Array([
     0,  1,  2,   0,  2,  3,   // front
     4,  5,  6,   4,  6,  7,   // back
     8,  9, 10,   8, 10, 11,   // top
    12, 13, 14,  12, 14, 15,   // bottom
    16, 17, 18,  16, 18, 19,   // right
    20, 21, 22,  20, 22, 23    // left
  ]);
  return { positions, normals, tangents, texCoords, indices };
}


function createCylinder(segments = 64, uRepeat = 3) {
  const positions = [], normals = [], tangents = [], texCoords = [], indices = [];

  // Side: theta grows with u, so T points along the circle and B = cross(N, T) points up
  for (let i = 0; i <= segments; i++) {
    const u = i / segments, theta = 2 * Math.PI * u;
    const s = Math.sin(theta), c = Math.cos(theta);
    for (const y of [-1, 1]) {
      positions.push(s, y, c);
      normals.push(s, 0, c);
      tangents.push(c, 0, -s);
      texCoords.push(u * uRepeat, (y + 1) / 2);
    }
  }
  for (let i = 0; i < segments; i++) {
    const k = 2 * i;
    indices.push(k, k + 2, k + 3, k, k + 3, k + 1);
  }

  // Caps: planar mapping of x, z into the texture, T = +x on both
  for (const y of [1, -1]) {
    const center = positions.length / 3;
    positions.push(0, y, 0);
    normals.push(0, y, 0);
    tangents.push(1, 0, 0);
    texCoords.push(0.5, 0.5);
    for (let i = 0; i <= segments; i++) {
      const theta = 2 * Math.PI * i / segments;
      const s = Math.sin(theta), c = Math.cos(theta);
      positions.push(s, y, c);
      normals.push(0, y, 0);
      tangents.push(1, 0, 0);
      texCoords.push(0.5 + 0.5 * s, 0.5 - 0.5 * y * c);  // keeps cross(N, T) along +v
    }
    for (let i = 0; i < segments; i++) {
      const a = center + 1 + i, b = a + 1;
      if (y > 0) indices.push(center, a, b);
      else indices.push(center, b, a);
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    tangents: new Float32Array(tangents),
    texCoords: new Float32Array(texCoords),
    indices: new Uint16Array(indices)
  };
}


function createSphere(segments = 64, rings = 32) {
  const positions = [], normals = [], tangents = [], texCoords = [], indices = [];

  for (let j = 0; j <= rings; j++) {
    const v = j / rings;
    const phi = Math.PI * v;

    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      const theta = 2 * Math.PI * u;

      const x = Math.sin(phi) * Math.sin(theta);
      const y = Math.cos(phi);
      const z = Math.sin(phi) * Math.cos(theta);

      positions.push(x, y, z);
      normals.push(x, y, z);
      tangents.push(Math.cos(theta), 0, -Math.sin(theta));
      texCoords.push(u, 1 - v);
    }
  }

  for (let j = 0; j < rings; j++) {
    for (let i = 0; i < segments; i++) {
      const a = j * (segments + 1) + i;
      const b = a + segments + 1;

      indices.push(a, a + 1, b);
      indices.push(a + 1, b + 1, b);
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    tangents: new Float32Array(tangents),
    texCoords: new Float32Array(texCoords),
    indices: new Uint16Array(indices)
  };
}


function createCone(segments = 64) {
  const positions = [], normals = [], tangents = [], texCoords = [], indices = [];

  // Cone side
  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const theta = 2 * Math.PI * u;
    const s = Math.sin(theta);
    const c = Math.cos(theta);

    const length = Math.sqrt(5);
    const nx = 2 * s / length;
    const ny = 1 / length;
    const nz = 2 * c / length;

    positions.push(s, -1, c);
    normals.push(nx, ny, nz);
    tangents.push(c, 0, -s);
    texCoords.push(u, 0);

    positions.push(0, 1, 0);
    normals.push(nx, ny, nz);
    tangents.push(c, 0, -s);
    texCoords.push(u, 1);
  }

  for (let i = 0; i < segments; i++) {
    const k = 2 * i;
    indices.push(k, k + 1, k + 2);
  }

  // Bottom cap
  const center = positions.length / 3;
  positions.push(0, -1, 0);
  normals.push(0, -1, 0);
  tangents.push(1, 0, 0);
  texCoords.push(0.5, 0.5);

  for (let i = 0; i <= segments; i++) {
    const theta = 2 * Math.PI * i / segments;
    const s = Math.sin(theta);
    const c = Math.cos(theta);

    positions.push(s, -1, c);
    normals.push(0, -1, 0);
    tangents.push(1, 0, 0);
    texCoords.push(0.5 + 0.5 * s, 0.5 + 0.5 * c);
  }

  for (let i = 0; i < segments; i++) {
    indices.push(center, center + i + 1, center + i + 2);
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    tangents: new Float32Array(tangents),
    texCoords: new Float32Array(texCoords),
    indices: new Uint16Array(indices)
  };
}


function createTorus(segments = 64, tubeSegments = 32) {
  const positions = [], normals = [], tangents = [], texCoords = [], indices = [];

  const majorRadius = 0.75;
  const minorRadius = 0.3;

  for (let j = 0; j <= tubeSegments; j++) {
    const v = j / tubeSegments;
    const phi = 2 * Math.PI * v;

    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      const theta = 2 * Math.PI * u;

      const s = Math.sin(theta);
      const c = Math.cos(theta);
      const sp = Math.sin(phi);
      const cp = Math.cos(phi);

      const radius = majorRadius + minorRadius * cp;

      positions.push(radius * s, minorRadius * sp, radius * c);
      normals.push(cp * s, sp, cp * c);
      tangents.push(c, 0, -s);
      texCoords.push(u, v);
    }
  }

  for (let j = 0; j < tubeSegments; j++) {
    for (let i = 0; i < segments; i++) {
      const a = j * (segments + 1) + i;
      const b = a + segments + 1;

      indices.push(a, a + 1, b);
      indices.push(a + 1, b + 1, b);
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    tangents: new Float32Array(tangents),
    texCoords: new Float32Array(texCoords),
    indices: new Uint16Array(indices)
  };
}
