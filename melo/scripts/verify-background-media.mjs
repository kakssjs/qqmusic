import assert from 'node:assert/strict';
import { allowBackgroundVideo } from '../lib/background-media.ts';
assert.equal(allowBackgroundVideo({reduced:false,limitedData:false,touchPoints:0,coarsePointer:false}),true);
assert.equal(allowBackgroundVideo({reduced:false,limitedData:false,touchPoints:5,coarsePointer:false}),false);
assert.equal(allowBackgroundVideo({reduced:false,limitedData:false,touchPoints:0,coarsePointer:true}),false);
assert.equal(allowBackgroundVideo({reduced:true,limitedData:false,touchPoints:0,coarsePointer:false}),false);
assert.equal(allowBackgroundVideo({reduced:false,limitedData:true,touchPoints:0,coarsePointer:false}),false);
assert.equal(allowBackgroundVideo({reduced:false,limitedData:false,touchPoints:0,coarsePointer:false,compactViewport:true}),false);
console.log('Tablet, touch-with-trackpad, desktop, reduced motion and data saver media policy passed.');
