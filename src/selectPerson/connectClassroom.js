// Массивы с аудиториями для каждого преподавателя
const shatsionokFixedClassrooms = [
    3210, 3213, 3215, 
    3310,
    3401, 3402, 3403, 3406, 3407, 3412,
    3508, 3509, 3512, 3515
];

const vrublevskiyFixedClassrooms = [
    3205, 3206, 
    3301, 3302, 3303, 
    3501, 3504, 3506, 3507,
];

const homutovFixedClassroms = [
    3304, 3307, 3308, 3314, 3315,
    3408, 3409, 3415, 3416, 
    3604, 3605
];

const titovFixedClassroms = [
    3212, 3217,
    3510, 
];

const instructorClassroomsMap = {
    shatsionokSchedule: shatsionokFixedClassrooms,
    vrublevskiySchedule: vrublevskiyFixedClassrooms,
    homutovSchelule: homutovFixedClassroms,
    titovSchelule: titovFixedClassroms
};

export { instructorClassroomsMap }