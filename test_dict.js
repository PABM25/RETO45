const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/exercises.json', 'utf8'));

function findExercise(name) {
    return data.find(e => e.name.toLowerCase() === name.toLowerCase());
}

console.log('push-up:', !!findExercise('push-up'));
console.log('diamond push-up:', !!findExercise('diamond push-up'));
console.log('bodyweight squat:', !!findExercise('bodyweight squat'));
console.log('sumo squat:', !!findExercise('sumo squat'));
console.log('glute bridge:', !!findExercise('glute bridge'));
console.log('lunge:', !!findExercise('lunge'));
console.log('crunch:', !!findExercise('crunch'));
console.log('front plank:', !!findExercise('front plank'));
console.log('bicycle crunch:', !!findExercise('bicycle crunch'));
console.log('burpee:', !!findExercise('burpee'));
console.log('lying leg raise:', !!findExercise('lying leg raise'));
console.log('mountain climber:', !!findExercise('mountain climber'));
