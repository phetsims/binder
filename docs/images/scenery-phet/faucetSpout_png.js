/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = 'data:image/png;base64,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';
export default image;