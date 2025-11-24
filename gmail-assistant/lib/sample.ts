const existingIDs = [1,4,8,9,22]
const existingJob = existingIDs.map(app => app + 2 );
const newId= [ ...existingIDs, 3];
console.log(existingJob);
console.log(newId);