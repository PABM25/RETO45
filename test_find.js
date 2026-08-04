const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/exercises.json', 'utf8'));
const names = ['push-up', 'diamond push-up', 'squat', 'lunge', 'sumo squat', 'glute bridge', 'crunch', 'plank', 'burpee'];
for (const name of names) {
  const found = data.find(e => e.name.toLowerCase() === name.toLowerCase());
  console.log(name, '->', found ? found.name : 'NOT FOUND');
}
