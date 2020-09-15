import { Speck, NonObjectSpeck, TypeOf } from './types';
export declare function U<TA extends Speck<any>, TB extends Speck<any>>(specks: [TA, TB]): NonObjectSpeck<TypeOf<TA> | TypeOf<TB>>;
