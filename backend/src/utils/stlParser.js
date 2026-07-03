export const parseSTL = (buffer) => {
  const isBinary = checkIsBinary(buffer);
  
  if (isBinary) {
    return parseBinarySTL(buffer);
  } else {
    return parseAsciiSTL(buffer);
  }
};

const checkIsBinary = (buffer) => {
  if (buffer.length < 84) return false;
  
  const faceCount = buffer.readUInt32LE(80);
  const expectedSize = 84 + (faceCount * 50);
  
  if (buffer.length === expectedSize) return true;
  
  const header = buffer.toString('utf8', 0, 5);
  return header !== 'solid';
};

const parseBinarySTL = (buffer) => {
  const faceCount = buffer.readUInt32LE(80);
  let totalVolume = 0;
  
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  let offset = 84;
  for (let i = 0; i < faceCount; i++) {
    if (offset + 50 > buffer.length) break;

    const v1x = buffer.readFloatLE(offset + 12);
    const v1y = buffer.readFloatLE(offset + 16);
    const v1z = buffer.readFloatLE(offset + 20);

    const v2x = buffer.readFloatLE(offset + 24);
    const v2y = buffer.readFloatLE(offset + 28);
    const v2z = buffer.readFloatLE(offset + 32);

    const v3x = buffer.readFloatLE(offset + 36);
    const v3y = buffer.readFloatLE(offset + 40);
    const v3z = buffer.readFloatLE(offset + 44);

    offset += 50;

    minX = Math.min(minX, v1x, v2x, v3x);
    maxX = Math.max(maxX, v1x, v2x, v3x);
    minY = Math.min(minY, v1y, v2y, v3y);
    maxY = Math.max(maxY, v1y, v2y, v3y);
    minZ = Math.min(minZ, v1z, v2z, v3z);
    maxZ = Math.max(maxZ, v1z, v2z, v3z);

    const v = (-v3x * v2y * v1z + v2x * v3y * v1z + v3x * v1y * v2z - v1x * v3y * v2z - v2x * v1y * v3z + v1x * v2y * v3z) / 6.0;
    totalVolume += v;
  }

  const volumeCm3 = Math.abs(totalVolume) / 1000.0;

  const length = isFinite(maxX - minX) ? Math.round((maxX - minX) * 10) / 10 : 0;
  const width = isFinite(maxY - minY) ? Math.round((maxY - minY) * 10) / 10 : 0;
  const height = isFinite(maxZ - minZ) ? Math.round((maxZ - minZ) * 10) / 10 : 0;

  return {
    volume: Math.round(volumeCm3 * 100) / 100,
    dimensions: { length, width, height }
  };
};

const parseAsciiSTL = (buffer) => {
  const text = buffer.toString('utf8');
  const lines = text.split('\n');
  
  let totalVolume = 0;
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  let vertices = [];

  for (let line of lines) {
    line = line.trim();
    if (line.startsWith('vertex')) {
      const parts = line.split(/\s+/);
      const x = parseFloat(parts[1]);
      const y = parseFloat(parts[2]);
      const z = parseFloat(parts[3]);

      if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
        vertices.push({ x, y, z });
        
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        minZ = Math.min(minZ, z);
        maxZ = Math.max(maxZ, z);
      }
    }

    if (vertices.length === 3) {
      const v1 = vertices[0];
      const v2 = vertices[1];
      const v3 = vertices[2];

      const v = (-v3.x * v2.y * v1.z + v2.x * v3.y * v1.z + v3.x * v1.y * v2.z - v1.x * v3.y * v2.z - v2.x * v1.y * v3.z + v1.x * v2.y * v3.z) / 6.0;
      totalVolume += v;

      vertices = [];
    }
  }

  const volumeCm3 = Math.abs(totalVolume) / 1000.0;
  
  const length = isFinite(maxX - minX) ? Math.round((maxX - minX) * 10) / 10 : 0;
  const width = isFinite(maxY - minY) ? Math.round((maxY - minY) * 10) / 10 : 0;
  const height = isFinite(maxZ - minZ) ? Math.round((maxZ - minZ) * 10) / 10 : 0;

  return {
    volume: Math.round(volumeCm3 * 100) / 100,
    dimensions: { length, width, height }
  };
};
export default parseSTL;
