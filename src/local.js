
import {handler} from './index.js';

let event = {rawPath: '/alerts'};

handler(event).then(() => {
    console.log('done');
}).catch((err) => {
    console.error(err);
});