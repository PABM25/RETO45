const fs = require('fs');
const file = 'src/app/(tabs)/profile.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "Dimensions,\n  useWindowDimensions",
  "useWindowDimensions"
);

fs.writeFileSync(file, content);
