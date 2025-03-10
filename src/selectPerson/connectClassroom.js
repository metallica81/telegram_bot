// Массивы с аудиториями для каждого преподавателя
const shatsionokFixedClassrooms = [
    3101, 3102, 3103, 3104, 
    3105, 3106, 3107, 3108, 
    3109, 3110, 3111, 3112, 
    3113, 3114, 3115, 3116
];

const vrublevskiyFixedClassrooms = [
    3201, 3202, 3203, 3204, 
    3205, 3206, 3207, 3208, 
    3209, 3210, 3211, 3212, 
    3213, 3214, 3215, 3216, 
    3301, 3302, 3303, 3304, 
    3305, 3306, 3307, 3308, 
    3309, 3310, 3311, 3312, 
    3313, 3314, 3315, 3316
];

const homutovFixedClassroms = [
    3401, 3402, 3403, 3404, 
    3405, 3406, 3407, 3408, 
    3409, 3410, 3411, 3412, 
    3413, 3414, 3415, 3416, 
    3501, 3502, 3503, 3504, 
    3505, 3506, 3507, 3508, 
    3509, 3510, 3511, 3512, 
    3513, 3514, 3515, 3516
];

const instructorClassroomsMap = {
    shatsionokSchedule: shatsionokFixedClassrooms,
    vrublevskiySchedule: vrublevskiyFixedClassrooms,
    homutovSchelule: homutovFixedClassroms
};

export { instructorClassroomsMap }