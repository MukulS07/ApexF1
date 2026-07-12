import fs from 'fs';

const content = fs.readFileSync('m:/WEBSITES/pitwall-refresh/src/components/ThreeCarCanvas.tsx', 'utf8');
const lines = content.split('\n');

lines.forEach((line, index) => {
  if (line.includes('new THREE.Group') || line.includes('scene.add')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
