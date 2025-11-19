// src/utils/constants.js
export const COMPONENT_TYPES = {
    INSULATOR: 'insulator',
    DAMPER: 'damper',
    TRAVERSE: 'traverse'
};

export const STATUS_TYPES = {
    GREEN: 'green',
    YELLOW: 'yellow',
    RED: 'red'
};

export const STATUS_LABELS = {
    [STATUS_TYPES.GREEN]: 'Норма',
    [STATUS_TYPES.YELLOW]: 'Внимание',
    [STATUS_TYPES.RED]: 'Критично'
};
