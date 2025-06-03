
import {handler} from './index.js';

let event = {rawPath: '/vehiclepositions'};

handler(event).then(() => {
    console.log('done');
}).catch((err) => {
    console.error(err);
});