/* eslint-disable */
/* @formatter:off */

import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAARhJREFUeNpMUL2Kg0AQnmiIp4KKkkKUYGNAsLDQ/l5A9BXS3VV3b3KvkOtSBKJPcOQttLvCn0KFBRGiiGRWrriB3dnZ7+Obb2YDfxGG4etut/vgOE6Z55mM4/idpmlCsQ29oij62u/3n5ZlgSzL8Hg8oCgKKMvyfL1eTywqeJqmnX3fhyAIwHVdME0TeJ6HYRg8XdfvW5ZlY8Mw4Hg8guM4IEkSYCvAf2iaBtq2jbYYIAjCCtKMvoBhmLUWRZG+vS01ibJACKHyK2GaprXu+x6WZbmztm1nSHxDhRc6BDVdVRVkWQZ5npOu697X6eI49lRV/TkcDgptQ4l1XRP0dLpcLsnm354U3FGMx8IWv0hMbrcbodhTgAEAs0d1OLz50qoAAAAASUVORK5CYII=';
export default image;